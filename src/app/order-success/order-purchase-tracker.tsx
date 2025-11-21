"use client"

import { useEffect } from "react"
import { trackMetaEvent, buildUserMeta } from "@/lib/analytics/meta-pixel"

interface PurchaseTrackerProps {
  orderId: string
  totalValue: number
  currency?: string
  userName?: string | null
  items: Array<{
    id: string
    name: string
    price: number
    quantity: number
  }>
}

export function PurchaseTracker(props: PurchaseTrackerProps) {
  useEffect(() => {
    const userMeta = buildUserMeta({ name: props.userName })

    trackMetaEvent("Purchase", {
      ...userMeta,
      contents: props.items.map((item) => ({
        id: item.id,
        name: item.name,
        quantity: item.quantity,
        item_price: item.price,
      })),
      content_type: "product",
      value: props.totalValue,
      currency: props.currency ?? "EGP",
      order_id: props.orderId,
    })
  }, [
    props.orderId,
    props.totalValue,
    props.currency,
    props.userName,
    props.items,
  ])

  return null
}
