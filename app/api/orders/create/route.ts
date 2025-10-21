// /app/api/orders/create/route.ts
// API Route: Create Order (DEBUG + HARDENED)
// POST /api/orders/create

import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

export const dynamic = "force-dynamic" // تأكد أنه سيرفر-سايد دائمًا
const isDev = process.env.NODE_ENV !== "production"

// ===== Helpers =====
const json = (data: any, status = 200, headers: Record<string, string> = {}) =>
  new NextResponse(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Cache-Control": "no-store",
      ...headers,
    },
  })

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
}

const toNum = (v: unknown, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}
const nonEmpty = (v: unknown, fallback = "") => {
  if (v === undefined || v === null) return fallback
  const s = String(v).trim()
  return s.length ? s : fallback
}
const errorJson = (msg: string, extra?: any, status = 500) =>
  json(
    { success: false, error: msg, ...(isDev && extra ? { details: extra } : {}) },
    status,
    corsHeaders,
  )

// ===== Types =====
type OrderItemInput = {
  productId?: string | number | null
  variantId?: string | number | null
  productName?: string
  variantName?: string | null
  sku?: string | null
  quantity?: number | string
  unitPrice?: number | string
  totalPrice?: number | string
  imageUrl?: string | null
}
type ShippingAddress = {
  line1?: string
  line2?: string | null
  city?: string
  state?: string | null
  postalCode?: string | null
  country?: string | null
}
type Body = {
  customerEmail?: string
  customerName?: string
  customerPhone?: string | null
  items?: OrderItemInput[]
  subtotal?: number | string
  shippingCost?: number | string
  tax?: number | string
  discount?: number | string
  total?: number | string
  paymentMethod?: string | null
  shippingAddress?: ShippingAddress
  notes?: string | null
}

// ===== Method guards (تمنع HTML 404/405) =====
export async function OPTIONS() {
  return json({ ok: true }, 200, corsHeaders)
}
export async function GET() {
  // لو حد ناداه بـ GET من المتصفح، نرجّع JSON واضح بدل صفحة HTML
  return errorJson("Method Not Allowed. Use POST /api/orders/create", undefined, 405)
}

// ===== Handler =====
export async function POST(req: NextRequest) {
  const supabase = createAdminClient()

  try {
    const contentType = req.headers.get("content-type") || ""
    if (!contentType.includes("application/json")) {
      return errorJson("Content-Type must be application/json", { contentType }, 415)
    }

    const body = (await req.json()) as Body
    console.log("[Orders API] incoming:", JSON.stringify(body, null, 2))

    const items = Array.isArray(body.items) ? body.items : []

    const subtotalFromItems = items.reduce((sum, it) => {
      const q = toNum(it.quantity, 0)
      const u = toNum(it.unitPrice, 0)
      const line = toNum(it.totalPrice, u * q)
      return sum + line
    }, 0)

    const subtotal = toNum(body.subtotal, subtotalFromItems)
    const shippingCost = toNum(body.shippingCost, 0)
    const tax = toNum(body.tax, 0)
    const discount = toNum(body.discount, 0)
    const calculatedTotal = toNum(body.total, subtotal + shippingCost + tax - discount)

    const customerEmail = nonEmpty(body.customerEmail)
    const customerName = nonEmpty(body.customerName)
    const paymentMethod = nonEmpty(body.paymentMethod, "cash_on_delivery")

    const addr = body.shippingAddress || {}
    const ship_line1 = nonEmpty(addr.line1)
    const ship_city = nonEmpty(addr.city)
    const ship_line2 = nonEmpty(addr.line2, "")
    const ship_state = nonEmpty(addr.state, "")
    const ship_postal = nonEmpty(addr.postalCode, "")
    const ship_country = nonEmpty(addr.country, "EG")

    const missing: string[] = []
    if (!customerEmail) missing.push("customerEmail")
    if (!customerName) missing.push("customerName")
    if (!items.length) missing.push("items")
    if (!ship_line1) missing.push("shippingAddress.line1")
    if (!ship_city) missing.push("shippingAddress.city")
    if (!(calculatedTotal > 0)) missing.push("total (> 0)")
    if (missing.length) {
      return errorJson(
        `Missing required fields: ${missing.join(", ")}`,
        { subtotal, shippingCost, tax, discount, calculatedTotal },
        400,
      )
    }

    // Upsert customer
    const { data: customerRow, error: upsertErr } = await supabase
      .from("customers")
      .upsert(
        { email: customerEmail, full_name: customerName, phone: body.customerPhone ?? null },
        { onConflict: "email" },
      )
      .select("id")
      .single()

    if (upsertErr) {
      console.error("[Orders API] customer upsert error:", upsertErr)
      return errorJson("Customer upsert failed", {
        message: (upsertErr as any)?.message,
        code: (upsertErr as any)?.code,
        hint: (upsertErr as any)?.hint,
        details: (upsertErr as any)?.details,
      })
    }

    const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 9).toUpperCase()}`

    // Insert order
    const { data: order, error: orderErr } = await supabase
      .from("orders")
      .insert({
        order_number: orderNumber,
        customer_id: customerRow?.id ?? null,
        customer_email: customerEmail,
        customer_name: customerName,
        customer_phone: body.customerPhone ?? null,

        status: "pending",
        payment_status: "pending",
        payment_method: paymentMethod,

        subtotal,
        shipping_cost: shippingCost,
        tax,
        discount,
        total: calculatedTotal,
        currency: "EGP",

        shipping_address_line1: ship_line1,
        shipping_address_line2: ship_line2,
        shipping_city: ship_city,
        shipping_state: ship_state,
        shipping_postal_code: ship_postal,
        shipping_country: ship_country,

        notes: body.notes ?? null,
      })
      .select()
      .single()

    if (orderErr || !order) {
      console.error("[Orders API] order insert error:", orderErr)
      return errorJson("Order insert failed", {
        message: (orderErr as any)?.message,
        code: (orderErr as any)?.code,
        hint: (orderErr as any)?.hint,
        details: (orderErr as any)?.details,
      })
    }

    // Insert order items (best-effort)
    const preparedItems = (items || [])
      .map((it) => {
        const qty = toNum(it.quantity, 1)
        const unit = toNum(it.unitPrice, 0)
        const line = toNum(it.totalPrice, unit * qty)
        return {
          order_id: order.id,
          product_id: it.productId ?? null,
          variant_id: it.variantId ?? null,
          product_name_ar: nonEmpty(it.productName),
          product_name_en: nonEmpty(it.productName),
          variant_name_ar: nonEmpty(it.variantName, ""),
          variant_name_en: nonEmpty(it.variantName, ""),
          sku: nonEmpty(it.sku, ""),
          quantity: qty,
          unit_price: unit,
          total_price: line,
          image_url: nonEmpty(it.imageUrl, ""),
        }
      })
      .filter((x) => x.quantity > 0)

    if (preparedItems.length) {
      const { error: itemsErr } = await supabase.from("order_items").insert(preparedItems)
      if (itemsErr) {
        console.error("[Orders API] order_items insert error:", itemsErr)
        // لا نفشل الطلب بسبب عناصره؛ فقط نسجّل الخطأ
      }
    }

    return json(
      {
        success: true,
        order: {
          id: order.id,
          orderNumber: order.order_number,
          total: order.total,
          status: order.status,
        },
      },
      200,
      corsHeaders,
    )
  } catch (err: any) {
    console.error("[Orders API] uncaught error:", err)
    return errorJson("Internal server error", { message: err?.message, stack: err?.stack })
  }
}
