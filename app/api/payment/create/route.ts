import { type NextRequest, NextResponse } from "next/server"

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
      const kashierApiKey = process.env.KASHIER_API_KEY
      const kashierMerchantId = process.env.KASHIER_MERCHANT_ID  
      const kashierPaymentUrl = process.env.KASHIER_PAYMENT_URL || "https://payments.kashier.io"
      const appUrl = process.env.NEXT_PUBLIC_APP_URL

      if (!kashierApiKey || !kashierMerchantId || !appUrl) {
        return NextResponse.json(
          {
            success: false,
            error: "Kashier payment gateway is not configured",
          },
          { status: 500 }
        )
      }

      try {
        const crypto = await import("crypto")
        const amt = Number(amount).toFixed(2)
        
        const path = `/?payment=${kashierMerchantId}.${orderId}.${amt}.${currency}`
        const hash = crypto.createHmac("sha256", kashierApiKey).update(path).digest("hex")
        
        const successUrl = encodeURIComponent(`${appUrl}/payment/success?orderId=${orderId}`)
        const failureUrl = encodeURIComponent(`${appUrl}/payment/cancel?orderId=${orderId}`)
        const webhookUrl = encodeURIComponent(`${appUrl}/api/payment/webhook`)
        
        const paymentUrl = `${kashierPaymentUrl}/?merchantId=${kashierMerchantId}&orderId=${orderId}&mode=test&amount=${amt}&currency=${currency}&hash=${hash}&merchantRedirect=${successUrl}&failureRedirect=${failureUrl}&serverWebhook=${webhookUrl}&allowedMethods=card,wallet,bank_installments&display=en`

        return NextResponse.json({
          success: true,
          paymentUrl,
          transactionId: `kashier_${orderId}`,
          message: "Kashier payment URL generated successfully",
        })

      } catch (error: any) {
        console.error("[Payment API] Kashier error:", error)
        if (isDev) {
          // Only fallback in dev if Kashier completely fails
          return NextResponse.json({
            success: true,
            paymentUrl: `${appUrl}/order-success?orderId=${orderId}&amount=${amount}&test=true&payment=fallback&error=kashier-failed`,
            transactionId: `fallback_${Date.now()}`,
            message: "Kashier failed - using development fallback",
          })
        }
        
        return NextResponse.json(
          {
            success: false,
            error: "Failed to generate Kashier payment URL",
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