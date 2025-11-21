export type MetaUserMeta = {
  userId?: string
  userName?: string
  userEmail?: string
}

export type MetaProductMeta = {
  id: string
  name?: string
  price?: number
  quantity?: number
  category?: string
  size?: string
  color?: string
  [key: string]: any
}

export type MetaOrderMeta = {
  orderId?: string
  value?: number
  currency?: string
  items?: MetaProductMeta[]
  couponCode?: string
  paymentMethod?: string
  shippingCity?: string
  [key: string]: any
}

export function trackMetaEvent(
  event: string,
  payload: Record<string, any> = {}
) {
  if (typeof window === "undefined") return

  // 1. Track to Meta Pixel
  const w = window as any
  if (w.fbq && typeof w.fbq === "function") {
    try {
      w.fbq("track", event, payload)
    } catch (error) {
      console.error("[MetaPixel] Error tracking event:", event, payload, error)
    }
  } else {
    console.warn("[MetaPixel] fbq is not available", { event, payload })
  }

  // 2. Track to Internal Database via API
  try {
    const apiPayload = {
      eventName: event,
      user: {
        id: payload.userId,
        name: payload.userName,
      },
      product: {
        id: payload.productId || payload.content_ids?.[0],
        name: payload.productName || payload.content_name,
        price: payload.productPrice || payload.value,
        currency: payload.productCurrency || payload.currency,
      },
      order: {
        id: payload.orderId || payload.order_id,
        total: payload.orderTotal || payload.value,
        currency: payload.orderCurrency || payload.currency,
      },
      pageUrl: window.location.href,
      referrer: document.referrer,
      sessionId: payload.sessionId, // If passed
      rawPayload: payload,
    }

    fetch("/api/analytics/track", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(apiPayload),
    }).catch((err) => console.error("[MetaPixel] DB track error:", err))
  } catch (e) {
    console.error("[MetaPixel] Error building DB payload:", e)
  }
}

/**
 * Build a consistent user payload.
 * Use any existing user/auth object in the calling component.
 */
export function buildUserMeta(user?: {
  id?: string
  name?: string | null
  email?: string | null
}): MetaUserMeta {
  if (!user) {
    return {
      userName: "guest",
    }
  }

  return {
    userId: user.id,
    userName: user.name ?? user.email ?? "guest",
    userEmail: user.email ?? undefined,
  }
}
