// Cashier Payment Gateway Client
// Secure integration with Cashier API

interface CashierConfig {
  apiKey: string
  apiSecret: string
  apiEndpoint: string
  merchantId: string
}

interface PaymentRequest {
  amount: number
  currency: string
  orderId: string
  customerEmail: string
  customerName: string
  customerPhone?: string
  returnUrl: string
  callbackUrl: string
  metadata?: Record<string, any>
}

interface PaymentResponse {
  success: boolean
  transactionId?: string
  paymentUrl?: string
  status?: string
  message?: string
  error?: string
}

interface PaymentStatus {
  transactionId: string
  status: "pending" | "processing" | "completed" | "failed" | "cancelled"
  amount: number
  currency: string
  paidAt?: string
  failureReason?: string
}

export class CashierClient {
  private config: CashierConfig

  constructor() {
    this.config = {
      apiKey: process.env.CASHIER_API_KEY || "",
      apiSecret: process.env.CASHIER_API_SECRET || "",
      apiEndpoint: process.env.CASHIER_API_ENDPOINT || "https://api.cashier.com/v1",
      merchantId: process.env.CASHIER_MERCHANT_ID || "",
    }

    if (!this.config.apiKey || !this.config.apiSecret) {
      console.warn("[Cashier] API credentials not configured")
    }
  }

  /**
   * Generate authentication signature for API requests
   */
  private generateAuthSignature(payload: string, timestamp: string): string {
    const crypto = require("crypto")
    const message = `${timestamp}.${payload}`

    return crypto.createHmac("sha256", this.config.apiSecret).update(message).digest("hex")
  }

  /**
   * Make authenticated API request to Cashier
   */
  private async makeRequest(endpoint: string, method: "GET" | "POST" = "POST", data?: any): Promise<any> {
    const timestamp = Date.now().toString()
    const payload = data ? JSON.stringify(data) : ""
    const signature = this.generateAuthSignature(payload, timestamp)

    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "X-Cashier-Api-Key": this.config.apiKey,
      "X-Cashier-Timestamp": timestamp,
      "X-Cashier-Signature": signature,
      "X-Cashier-Merchant-Id": this.config.merchantId,
    }

    try {
      const response = await fetch(`${this.config.apiEndpoint}${endpoint}`, {
        method,
        headers,
        body: data ? JSON.stringify(data) : undefined,
      })

      const responseData = await response.json()

      if (!response.ok) {
        throw new Error(responseData.message || "Cashier API request failed")
      }

      return responseData
    } catch (error) {
      console.error("[Cashier] API request failed:", error)
      throw error
    }
  }

  /**
   * Create a payment session
   */
  async createPayment(request: PaymentRequest): Promise<PaymentResponse> {
    try {
      console.log("[Cashier] Creating payment session:", {
        orderId: request.orderId,
        amount: request.amount,
      })

      const response = await this.makeRequest("/payments", "POST", {
        amount: request.amount,
        currency: request.currency,
        order_id: request.orderId,
        customer: {
          email: request.customerEmail,
          name: request.customerName,
          phone: request.customerPhone,
        },
        return_url: request.returnUrl,
        callback_url: request.callbackUrl,
        metadata: request.metadata,
      })

      return {
        success: true,
        transactionId: response.transaction_id,
        paymentUrl: response.payment_url,
        status: response.status,
      }
    } catch (error: any) {
      console.error("[Cashier] Payment creation failed:", error)
      return {
        success: false,
        error: error.message || "Payment creation failed",
      }
    }
  }

  /**
   * Get payment status
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus | null> {
    try {
      const response = await this.makeRequest(`/payments/${transactionId}`, "GET")

      return {
        transactionId: response.transaction_id,
        status: response.status,
        amount: response.amount,
        currency: response.currency,
        paidAt: response.paid_at,
        failureReason: response.failure_reason,
      }
    } catch (error) {
      console.error("[Cashier] Failed to get payment status:", error)
      return null
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string, timestamp: string): boolean {
    const expectedSignature = this.generateAuthSignature(payload, timestamp)

    try {
      const crypto = require("crypto")
      return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))
    } catch {
      return false
    }
  }

  /**
   * Process refund
   */
  async refundPayment(transactionId: string, amount?: number): Promise<PaymentResponse> {
    try {
      const response = await this.makeRequest(`/payments/${transactionId}/refund`, "POST", {
        amount,
      })

      return {
        success: true,
        transactionId: response.refund_id,
        status: response.status,
      }
    } catch (error: any) {
      console.error("[Cashier] Refund failed:", error)
      return {
        success: false,
        error: error.message || "Refund failed",
      }
    }
  }
}

// Export singleton instance
export const cashierClient = new CashierClient()
