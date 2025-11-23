// Payment Service - Core payment processing logic
// Handles payment creation, validation, and status updates

import { createAdminClient } from "@/lib/supabase/admin"
import { 
  buildKashierPaymentUrl, 
  verifyKashierWebhookSignature, 
  KashierPaymentParams, 
  KashierPaymentResult,
  KashierWebhookPayload 
} from "./kashier-adapter"
import { encryptPaymentData, generateSignature, generateSecureToken } from "./encryption"

export interface KashierWebhookResult {
  ok: boolean
  statusCode: number
  message: string
}

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
   * Initiate a new Kashier payment (Clean method)
   */
  async initiateKashierPayment(params: KashierPaymentParams): Promise<KashierPaymentResult> {
    // Basic validation
    if (!params.orderId || !params.amount) {
      throw new Error("Missing required payment parameters")
    }

    // Build URL using pure adapter logic
    const result = buildKashierPaymentUrl(params)
    
    console.log("[PaymentService] Initiated Kashier payment:", {
      orderId: params.orderId,
      transactionId: result.transactionId
    })

    // Save transaction to database
    try {
      const { error } = await this.supabase.from("payment_transactions").insert({
        order_id: params.orderId,
        transaction_id: result.transactionId,
        amount: params.amount,
        currency: params.currency || "EGP",
        status: "pending",
        payment_method_id: "kashier",
        initiated_at: new Date().toISOString(),
      } as any)

      if (error) {
        console.error("[PaymentService] Failed to save transaction:", error)
        // Don't throw - allow payment to continue even if DB save fails
      } else {
        console.log("[PaymentService] Transaction saved to database")
      }
    } catch (dbError: any) {
      console.error("[PaymentService] Database error:", dbError)
      // Continue with payment even if DB fails
    }

    return result
  }

  /**
   * Handle Kashier Webhook
   * Verifies signature and processes the event
   */
  async handleKashierWebhook(
    payload: KashierWebhookPayload,
    rawBody: string,
    signature: string,
    timestamp: string
  ): Promise<KashierWebhookResult> {
    // 1. Verify signature
    const isValid = verifyKashierWebhookSignature(rawBody, signature, timestamp)
    
    if (!isValid) {
      console.error("[PaymentService] Invalid webhook signature")
      return { ok: false, statusCode: 401, message: "Invalid signature" }
    }

    try {
      // 2. Log webhook
      const supabase = this.supabase as any

      await supabase.from("payment_webhooks").insert({
        source: "cashier",
        event_type: payload.event_type,
        payload: payload as any,
        signature,
        signature_verified: true,
        status: "processing",
      } as any)

      // 3. Process event
      const { transaction_id, order_id, status: paymentStatus } = payload.data

      switch (payload.event_type) {
        case "payment.completed":
        case "payment.success":
          console.log("[PaymentService] Payment completed:")
          
          // Update payment transaction status using transaction_id
          const { error: txError } = await supabase
            .from("payment_transactions")
            .update({
              status: "completed",
              completed_at: new Date().toISOString(),
              gateway_response: payload.data,
              updated_at: new Date().toISOString(),
            })
            .eq("transaction_id", transaction_id)
          
          if (txError) {
            console.error("[PaymentService] Failed to update transaction:", txError)
          } else {
            console.log("[PaymentService] Transaction status updated to completed")
          }
          
          // Update order status
          if (order_id) {
            const { error: orderError } = await supabase
              .from("orders")
              .update({
                payment_status: "paid",
                status: "processing",
                updated_at: new Date().toISOString(),
              })
              .eq("id", order_id)
            
            if (orderError) {
              console.error("[PaymentService] Failed to update order:", orderError)
            } else {
              console.log("[PaymentService] Order status updated to paid")
            }
          }
          break

        case "payment.failed":
          console.log("[PaymentService] Payment failed")
          
          // Update transaction status
          await supabase
            .from("payment_transactions")
            .update({
              status: "failed",
              failed_at: new Date().toISOString(),
              gateway_response: payload.data,
              updated_at: new Date().toISOString(),
            })
            .eq("transaction_id", transaction_id)
          
          // Update order
          if (order_id) {
            await supabase
              .from("orders")
              .update({
                payment_status: "failed",
                updated_at: new Date().toISOString(),
              })
              .eq("id", order_id)
          }
          break

        case "payment.refunded":
          console.log("[PaymentService] Payment refunded")
          await supabase.from("payment_refunds").insert({
            transaction_id,
            refund_amount: payload.data.refund_amount,
            status: "completed",
            completed_at: new Date().toISOString(),
          } as any)
          
          // Update transaction
          await supabase
            .from("payment_transactions")
            .update({
              status: "refunded",
              updated_at: new Date().toISOString(),
            })
            .eq("transaction_id", transaction_id)
          break

        default:
          console.log("[PaymentService] Unhandled event type:", payload.event_type)
      }

      return { ok: true, statusCode: 200, message: "OK" }

    } catch (error: any) {
      console.error("[PaymentService] Error processing webhook:", error)
      return { ok: false, statusCode: 500, message: "Internal processing failed" }
    }
  }

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
        throw new Error("Use initiateKashierPayment for Kashier payments")
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
          } as any)
          .select()
          .single()

        if (error) {
          console.warn("[Payment Service] COD DB save error:", error)
        } else if (transaction) {
          await this.logPaymentEvent((transaction as any).id, "initiated", "COD payment created").catch((e) =>
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
          } as any)
          .select()
          .single()

        if (error) {
          console.warn("[Payment Service] Bank transfer DB error:", error)
        } else if (transaction) {
          await this.logPaymentEvent((transaction as any).id, "initiated", "Bank transfer payment created").catch((e) =>
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

      const supabase = this.supabase as any
      const { error } = await supabase
        .from("payment_transactions")
        .update(updateData)
        .eq("id", transactionId)

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
      } as any)
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
