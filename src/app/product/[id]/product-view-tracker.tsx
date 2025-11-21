"use client"

import { useEffect } from "react"
import { trackMetaEvent, buildUserMeta } from "@/lib/analytics/meta-pixel"

interface ProductViewTrackerProps {
  productId: string
  productName: string
  productPrice: number
  productCategory?: string
  currency?: string
  userName?: string | null
}

export function ProductViewTracker(props: ProductViewTrackerProps) {
  useEffect(() => {
    const userMeta = buildUserMeta({ name: props.userName })
    
    trackMetaEvent("ViewContent", {
      ...userMeta,
      content_ids: [props.productId],
      content_name: props.productName,
      content_type: "product",
      content_category: props.productCategory ?? null,
      value: props.productPrice,
      currency: props.currency ?? "EGP",
    })
  }, [
    props.productId,
    props.productName,
    props.productPrice,
    props.productCategory,
    props.currency,
    props.userName,
  ])

  return null
}
