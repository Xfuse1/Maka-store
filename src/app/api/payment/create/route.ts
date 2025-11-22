import { type NextRequest, NextResponse } from "next/server"
import { paymentService } from "@/services/payment/payment-service"
import type { KashierPaymentParams } from "@/services/payment/kashier-adapter"

export const dynamic = "force-dynamic"

const isDev = process.env.NODE_ENV === "development"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    if (isDev) console.log("[Payment API] Request body:", body)

    const {
      orderId,
      amount,
      currency = "EGP",
      paymentMethod,
      customerEmail,
      customerName,
      customerPhone,
    } = body

    if (!orderId || !amount || !paymentMethod || !customerEmail || !customerName) {
      return NextResponse.json(
        {
          success: false,
          error: "Missing required fields",
        },
        { status: 400 }
      )
    }

    if (paymentMethod === "cod") {
      return NextResponse.json({
        success: true,
        transactionId: `cod_${Date.now()}`,
        message: "Cash on delivery order created",
      })
    }

    if (paymentMethod === "cashier") {
      try {
        // Map request body to service params
        const kashierParams: KashierPaymentParams = {
          orderId,
          amount: Number(amount),
          currency,
          customerEmail,
          customerName,
        }

        // Call the service to generate payment URL using the new adapter
        const result = await paymentService.initiateKashierPayment(kashierParams)

        return NextResponse.json({
          success: true,
          paymentUrl: result.paymentUrl,
          transactionId: result.transactionId,
          message: "Kashier payment URL generated successfully",
        })

      } catch (error: any) {
        console.error("[Payment API] Kashier error:", error)
        
        if (isDev) {
          // Only fallback in dev if Kashier completely fails (e.g. missing config)
          const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"
          return NextResponse.json({
            success: true,
            paymentUrl: `${appUrl}/order-success?orderNumber=${orderId}&amount=${amount}&test=true&payment=fallback&error=kashier-failed`,
            transactionId: `fallback_${Date.now()}`,
            message: "Kashier failed - using development fallback",
          })
        }
        
        return NextResponse.json(
          {
            success: false,
            error: error.message || "Failed to generate Kashier payment URL",
          },
          { status: 500 }
        )
      }
    }

    return NextResponse.json(
      { success: false, error: `Unsupported payment method: ${paymentMethod}` },
      { status: 400 }
    )

  } catch (error: any) {
    console.error("[Payment API] Internal error:", error)
    return NextResponse.json(
      {
        success: false,
        error: "Internal server error",
      },
      { status: 500 }
    )
  }
}

export async function GET() {
  return NextResponse.json({
    status: "ok",
    message: "Payment API is running",
  })
}
