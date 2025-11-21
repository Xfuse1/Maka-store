// API Route: Payment Webhook Handler
// POST /api/payment/webhook
// Receives and processes payment gateway webhooks

import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/services/payment/payment-service"
import type { KashierWebhookPayload } from "@/services/payment/kashier-adapter"

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    
    console.log("[Webhook] Received webhook request")
    console.log("[Webhook] Headers:", Object.fromEntries(request.headers.entries()))
    
    // Get webhook signature headers
    const signature = request.headers.get("x-cashier-signature") || ""
    const timestamp = request.headers.get("x-cashier-timestamp") || ""

    let payload: KashierWebhookPayload
    try {
      payload = JSON.parse(rawBody)
      console.log("[Webhook] Parsed payload:", payload)
    } catch (e) {
      console.error("[Webhook] Invalid JSON body")
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 })
    }

    // Delegate processing to service
    const result = await paymentService.handleKashierWebhook(
      payload,
      rawBody,
      signature,
      timestamp
    )

    console.log("[Webhook] Processing result:", result)

    return NextResponse.json({ message: result.message }, { status: result.statusCode })

  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

// GET method for testing webhook endpoint
export async function GET() {
  return NextResponse.json({ 
    status: "ok", 
    message: "Kashier webhook endpoint is active",
    timestamp: new Date().toISOString()
  })
}
