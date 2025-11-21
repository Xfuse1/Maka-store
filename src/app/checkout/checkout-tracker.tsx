"use client"

import { useEffect } from "react"
import { trackMetaEvent, buildUserMeta } from "@/lib/analytics/meta-pixel"

export function CheckoutTracker({
  items,
  total,
  currency = "EGP",
  user,
}: {
  items: Array<{
    id: string
    name?: string
    price?: number
    quantity?: number
    category?: string
    slug?: string
    product?: {
      id: string
      name?: string
      price?: number
      category?: { name_ar: string }
    }
    color?: { name: string }
    size?: string
  }>
  total: number
  currency?: string
  user?: { id?: string; name?: string | null; email?: string | null }
}) {
  useEffect(() => {
    if (!items || items.length === 0) return

    const userMeta = buildUserMeta(user)

    trackMetaEvent("InitiateCheckout", {
      ...userMeta,
      value: total,
      currency,
      num_items: items.length,
      contents: items.map((item) => ({
        id: item.product?.id || item.id,
        quantity: item.quantity ?? 1,
        item_price: item.product?.price || item.price,
        item_name: item.product?.name || item.name,
        category: item.product?.category?.name_ar || item.category,
      })),
    })
  }, [items, total, currency, user])

  return null
}
