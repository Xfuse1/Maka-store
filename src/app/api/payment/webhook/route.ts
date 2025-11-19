// API Route: Payment Webhook Handler
// POST /api/payment/webhook
// Receives and processes payment gateway webhooks

import { type NextRequest, NextResponse } from "next/server"
import { cashierClient } from "@/services/payment/cashier-client"
import { paymentService } from "@/services/payment/payment-service"
import { createAdminClient } from "@/lib/supabase/admin"

export async function POST(request: NextRequest) {
  try {
    const body = await request.text()
    const payload = JSON.parse(body)

    // Get webhook signature headers
    const signature = request.headers.get("x-cashier-signature") || ""
    const timestamp = request.headers.get("x-cashier-timestamp") || ""

    // Verify webhook signature
    const isValid = cashierClient.verifyWebhookSignature(body, signature, timestamp)

    if (!isValid) {
      console.error("[Webhook] Invalid signature")
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
    }

    // Log webhook receipt
    const supabase = createAdminClient()
    await supabase.from("payment_webhooks").insert({
      source: "cashier",
      event_type: payload.event_type,
      payload,
      signature,
      signature_verified: true,
      ip_address: request.headers.get("x-forwarded-for") || "unknown",
      status: "processing",
    } as any)

    // Process webhook based on event type
    switch (payload.event_type) {
      case "payment.completed":
        await handlePaymentCompleted(payload)
        break

      case "payment.failed":
        await handlePaymentFailed(payload)
        break

      case "payment.refunded":
        await handlePaymentRefunded(payload)
        break

      default:
        console.log("[Webhook] Unhandled event type:", payload.event_type)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("[Webhook] Error processing webhook:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}

async function handlePaymentCompleted(payload: any) {
  const { transaction_id, amount, order_id } = payload.data

  console.log("[Webhook] Payment completed:", transaction_id)

  // Update payment status
  await paymentService.updatePaymentStatus(transaction_id, "completed", payload.data)

  // Update order status
  const supabase = createAdminClient()
  // @ts-ignore - Payment tables not in generated types yet
  await supabase
    .from("orders")
    // @ts-ignore
    .update({
      payment_status: "paid",
      status: "processing",
      updated_at: new Date().toISOString(),
    })
    .eq("id", order_id)
}

async function handlePaymentFailed(payload: any) {
  const { transaction_id, failure_reason } = payload.data

  console.log("[Webhook] Payment failed:", transaction_id, failure_reason)

  await paymentService.updatePaymentStatus(transaction_id, "failed", payload.data)
}

async function handlePaymentRefunded(payload: any) {
  const { transaction_id, refund_amount } = payload.data

  console.log("[Webhook] Payment refunded:", transaction_id, refund_amount)

  const supabase = createAdminClient()
  await supabase.from("payment_refunds").insert({
    transaction_id,
    refund_amount,
    status: "completed",
    completed_at: new Date().toISOString(),
  } as any)
}
