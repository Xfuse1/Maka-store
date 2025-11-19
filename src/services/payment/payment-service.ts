// Payment Service - Core payment processing logic
// Handles payment creation, validation, and status updates

import { createAdminClient } from "@/lib/supabase/admin"
import { cashierClient } from "./cashier-client"
import { encryptPaymentData, generateSignature, generateSecureToken } from "./encryption"

export interface CreatePaymentParams {
  orderId: string
  amount: number
  currency?: string
  paymentMethod: "cashier" | "cod" | "bank_transfer"
  customerEmail: string
  customerName: string
  customerPhone?: string
  ipAddress?: string
  userAgent?: string
  metadata?: Record<string, any>
}

export interface PaymentResult {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  checkoutUrl?: string
  url?: string
  message?: string
  error?: string
  data?: any
}

export class PaymentService {
  private supabase = createAdminClient()

  /**
   * Create a new payment transaction
   */
  async createPayment(params: CreatePaymentParams): Promise<PaymentResult> {
    try {
      console.log("[Payment Service] Creating payment:", {
        orderId: params.orderId,
        amount: params.amount,
        method: params.paymentMethod,
      })

      // Validate required parameters
      if (!params.orderId || !params.amount || !params.paymentMethod) {
        return {
          success: false,
          error: "Missing required payment parameters",
        }
      }

      // Get payment method details with error handling
      let paymentMethod: any = null
      try {
        const { data, error } = await this.supabase
          .from("payment_methods")
          .select("*")
          .eq("code", params.paymentMethod)
          .eq("is_active", true)
          .single()

        if (error) {
          console.warn("[Payment Service] Payment method query error:", error.message)
        } else {
          paymentMethod = data
        }
      } catch (dbError: any) {
        console.warn("[Payment Service] Database error fetching payment method:", dbError.message)
      }

      // If payment method not found in DB, use default configuration
      if (!paymentMethod) {
        console.log("[Payment Service] Using default payment method config")
        paymentMethod = {
          id: `default_${params.paymentMethod}`,
          code: params.paymentMethod,
          name: params.paymentMethod.toUpperCase(),
          is_active: true,
        }
      }

      // Handle different payment methods
      if (params.paymentMethod === "cashier") {
        return await this.processCashierPayment(params, paymentMethod)
      } else if (params.paymentMethod === "cod") {
        return await this.processCODPayment(params, paymentMethod)
      } else if (params.paymentMethod === "bank_transfer") {
        return await this.processBankTransferPayment(params, paymentMethod)
      }

      return {
        success: false,
        error: "Unsupported payment method",
      }
    } catch (error: any) {
      console.error("[Payment Service] Error creating payment:", error)
      // CRITICAL: Always return a PaymentResult object, never throw
      return {
        success: false,
        error: error?.message || "Payment creation failed",
      }
    }
  }

  /**
   * Process Cashier payment gateway
   */
  private async processCashierPayment(params: CreatePaymentParams, paymentMethod: any): Promise<PaymentResult> {
    try {
      console.log("[Payment Service] Processing Cashier payment")

      // Validate Cashier configuration
      if (!process.env.CASHIER_API_KEY) {
        console.error("[Payment Service] CASHIER_API_KEY not configured")
        return {
          success: false,
          error: "Cashier payment gateway not configured. Please contact support.",
        }
      }

      const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"

      // Create payment session with Cashier
      let cashierResponse: any
      try {
        cashierResponse = await cashierClient.createPayment({
          amount: params.amount,
          currency: params.currency || "EGP",
          orderId: params.orderId,
          customerEmail: params.customerEmail,
          customerName: params.customerName,
          customerPhone: params.customerPhone,
          returnUrl: `${baseUrl}/payment/return`,
          callbackUrl: `${baseUrl}/api/payment/webhook`,
          metadata: params.metadata,
        })

        console.log("[Payment Service] Cashier API response:", cashierResponse)

        if (!cashierResponse?.success) {
          throw new Error(cashierResponse?.error || "Cashier payment failed")
        }
      } catch (cashierError: any) {
        console.error("[Payment Service] Cashier API error:", cashierError)
        return {
          success: false,
          error: cashierError?.message || "Failed to create Cashier payment session",
        }
      }

      // Extract transaction ID and payment URL
      const transactionId = cashierResponse.transactionId || `cashier_${generateSecureToken(16)}`
      const paymentUrl = 
        cashierResponse.paymentUrl || 
        cashierResponse.checkoutUrl || 
        cashierResponse.url ||
        cashierResponse.data?.payment_url ||
        cashierResponse.data?.checkout_url

      if (!paymentUrl) {
        console.error("[Payment Service] No payment URL in Cashier response:", cashierResponse)
        return {
          success: false,
          error: "Payment URL not available. Please try again.",
        }
      }

      // Try to save to database (non-critical - don't fail if this errors)
      try {
        // Encrypt sensitive data
        const sensitiveData = JSON.stringify({
          customerEmail: params.customerEmail,
          customerPhone: params.customerPhone,
        })
        const encryptedData = encryptPaymentData(sensitiveData)

        // Generate signature
        const signatureData = `${params.orderId}:${params.amount}:${transactionId}`
        const signature = generateSignature(signatureData)

        // Create transaction record
        const { data: transaction, error } = await this.supabase
          .from("payment_transactions")
          .insert({
            order_id: params.orderId,
            payment_method_id: paymentMethod.id,
            transaction_id: transactionId,
            amount: params.amount,
            currency: params.currency || "EGP",
            status: "pending",
            gateway_response: cashierResponse,
            encrypted_data: encryptedData,
            signature,
            ip_address: params.ipAddress,
            user_agent: params.userAgent,
            initiated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.error("[Payment Service] Failed to create transaction record:", error)
        } else {
          // Log the payment initiation (non-critical)
          await this.logPaymentEvent(transaction.id, "initiated", "Payment session created", {
            paymentUrl,
          }).catch((e) => console.warn("[Payment Service] Failed to log event:", e))
        }
      } catch (dbError: any) {
        console.warn("[Payment Service] Database save error (continuing anyway):", dbError.message)
      }

      // Return success even if DB save failed - payment URL is what matters
      return {
        success: true,
        transactionId,
        paymentUrl,
        checkoutUrl: paymentUrl,
        url: paymentUrl,
        message: "Payment session created successfully",
      }
    } catch (error: any) {
      console.error("[Payment Service] Cashier payment error:", error)
      return {
        success: false,
        error: error?.message || "Cashier payment failed",
      }
    }
  }

  /**
   * Process Cash on Delivery payment
   */
  private async processCODPayment(params: CreatePaymentParams, paymentMethod: any): Promise<PaymentResult> {
    try {
      console.log("[Payment Service] Processing COD payment")
      
      const transactionId = `cod_${generateSecureToken(16)}`

      // Try to save to database (non-critical)
      try {
        const { data: transaction, error } = await this.supabase
          .from("payment_transactions")
          .insert({
            order_id: params.orderId,
            payment_method_id: paymentMethod.id,
            transaction_id: transactionId,
            amount: params.amount,
            currency: params.currency || "EGP",
            status: "pending",
            ip_address: params.ipAddress,
            user_agent: params.userAgent,
            initiated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.warn("[Payment Service] COD DB save error:", error)
        } else {
          await this.logPaymentEvent(transaction.id, "initiated", "COD payment created").catch((e) =>
            console.warn("[Payment Service] Log error:", e),
          )
        }
      } catch (dbError: any) {
        console.warn("[Payment Service] COD database error (continuing):", dbError.message)
      }

      return {
        success: true,
        transactionId,
        message: "Cash on delivery order created",
      }
    } catch (error: any) {
      console.error("[Payment Service] COD payment error:", error)
      return {
        success: false,
        error: error?.message || "COD payment failed",
      }
    }
  }

  /**
   * Process Bank Transfer payment
   */
  private async processBankTransferPayment(params: CreatePaymentParams, paymentMethod: any): Promise<PaymentResult> {
    try {
      console.log("[Payment Service] Processing bank transfer payment")
      
      const transactionId = `bank_${generateSecureToken(16)}`

      // Try to save to database (non-critical)
      try {
        const { data: transaction, error } = await this.supabase
          .from("payment_transactions")
          .insert({
            order_id: params.orderId,
            payment_method_id: paymentMethod.id,
            transaction_id: transactionId,
            amount: params.amount,
            currency: params.currency || "EGP",
            status: "pending",
            ip_address: params.ipAddress,
            user_agent: params.userAgent,
            initiated_at: new Date().toISOString(),
          })
          .select()
          .single()

        if (error) {
          console.warn("[Payment Service] Bank transfer DB error:", error)
        } else {
          await this.logPaymentEvent(transaction.id, "initiated", "Bank transfer payment created").catch((e) =>
            console.warn("[Payment Service] Log error:", e),
          )
        }
      } catch (dbError: any) {
        console.warn("[Payment Service] Bank transfer DB error (continuing):", dbError.message)
      }

      return {
        success: true,
        transactionId,
        message: "Bank transfer instructions sent",
      }
    } catch (error: any) {
      console.error("[Payment Service] Bank transfer error:", error)
      return {
        success: false,
        error: error?.message || "Bank transfer payment failed",
      }
    }
  }

  /**
   * Update payment status
   */
  async updatePaymentStatus(
    transactionId: string,
    status: "processing" | "completed" | "failed" | "cancelled",
    details?: any,
  ): Promise<boolean> {
    try {
      const updateData: any = {
        status,
        updated_at: new Date().toISOString(),
      }

      if (status === "completed") {
        updateData.completed_at = new Date().toISOString()
      } else if (status === "failed") {
        updateData.failed_at = new Date().toISOString()
      }

      if (details) {
        updateData.gateway_response = details
      }

      const { error } = await this.supabase.from("payment_transactions").update(updateData).eq("id", transactionId)

      if (error) throw error

      await this.logPaymentEvent(transactionId, status, `Payment ${status}`, details).catch((e) =>
        console.warn("[Payment Service] Log error:", e),
      )

      return true
    } catch (error) {
      console.error("[Payment Service] Failed to update payment status:", error)
      return false
    }
  }

  /**
   * Log payment event
   */
  private async logPaymentEvent(
    transactionId: string,
    eventType: string,
    message: string,
    details?: any,
  ): Promise<void> {
    try {
      await this.supabase.from("payment_logs").insert({
        transaction_id: transactionId,
        event_type: eventType,
        message,
        details: details || {},
      })
    } catch (error) {
      console.error("[Payment Service] Failed to log event:", error)
    }
  }

  /**
   * Get payment transaction
   */
  async getTransaction(transactionId: string) {
    try {
      const { data, error } = await this.supabase
        .from("payment_transactions")
        .select("*, payment_methods(*), orders(*)")
        .eq("id", transactionId)
        .single()

      if (error) {
        console.error("[Payment Service] Failed to get transaction:", error)
        return null
      }

      return data
    } catch (error) {
      console.error("[Payment Service] Get transaction error:", error)
      return null
    }
  }
}

// Export singleton instance
export const paymentService = new PaymentService()
