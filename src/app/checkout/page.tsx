"use client"

import type React from "react"
import { useState, useMemo } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, CreditCard, Wallet, Truck } from "lucide-react"

import { useCartStore } from "@/store/cart-store"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

// تحويل مضمون للأرقام
const toNum = (v: unknown, fallback = 0) => {
  const n = Number(v)
  return Number.isFinite(n) ? n : fallback
}

export default function CheckoutPage() {
  const router = useRouter()
  const { items, getTotalPrice, clearCart } = useCartStore()
  const [isProcessing, setIsProcessing] = useState(false)
  const [uiError, setUiError] = useState<string | null>(null)

  const paymentMethods = [
    { id: "cod", name: "الدفع عند الاستلام", description: "ادفع نقداً عند استلام طلبك", icon: Wallet },
    { id: "cashier", name: "الدفع الإلكتروني - كاشير", description: "الدفع الآمن عبر البطاقات الإلكترونية", icon: CreditCard },
  ]

  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    postalCode: "",
    paymentMethod: "cod",
    notes: "",
  })

  const subtotal = useMemo(() => {
    const fromStore = toNum(getTotalPrice(), NaN)
    if (!Number.isNaN(fromStore)) return fromStore
    return items.reduce((sum, it: any) => sum + toNum(it?.product?.price, 0) * toNum(it?.quantity, 0), 0)
  }, [getTotalPrice, items])

  // Calculate shipping cost from products
  const shippingCost = useMemo(() => {
    return items.reduce((sum, it: any) => {
      const productShipping = toNum(it?.product?.shipping_cost, 0)
      const quantity = toNum(it?.quantity, 0)
      return sum + (productShipping * quantity)
    }, 0)
  }, [items])

  const total = toNum(subtotal) + toNum(shippingCost)

  const validateBeforeSubmit = () => {
    if (!items.length) return "السلة فارغة."
    if (!formData.customerName.trim()) return "من فضلك أدخِل الاسم الكامل."
    if (!formData.customerEmail.trim()) return "من فضلك أدخِل البريد الإلكتروني."
    if (!formData.customerPhone.trim()) return "من فضلك أدخِل رقم الهاتف."
    if (!formData.addressLine1.trim()) return "من فضلك أدخِل العنوان (السطر الأول)."
    if (!formData.city.trim()) return "من فضلك أدخِل المدينة."
    if (!formData.state.trim()) return "من فضلك أدخِل المحافظة."
    if (!(total > 0)) return "الإجمالي غير صالح. تأكد من الأسعار والكمية."
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUiError(null)

    const validationMsg = validateBeforeSubmit()
    if (validationMsg) {
      setUiError(validationMsg)
      return
    }

    setIsProcessing(true)
    try {
      // جهّز عناصر الطلب
      const orderItems = items.map((item: any) => {
        const price = toNum(item?.product?.price, 0)
        const qty = toNum(item?.quantity, 0)
        const productName = String(item?.product?.name ?? "")
        const colorName = String(item?.color?.name ?? "")
        const sizeName = String(item?.size ?? "")
        return {
          productId: item?.product?.id ?? null,
          variantId: null,
          productName,
          variantName: `${colorName}${sizeName ? ` - ${sizeName}` : ""}`,
          sku: `${item?.product?.id ?? "SKU"}-${colorName}-${sizeName}`,
          quantity: qty,
          unitPrice: price,
          totalPrice: price * qty,
          imageUrl: item?.color?.images?.[0] || "/placeholder.svg?height=400&width=400",
        }
      })

      const orderPayload = {
        customerEmail: formData.customerEmail.trim(),
        customerName: formData.customerName.trim(),
        customerPhone: formData.customerPhone.trim(),
        items: orderItems,
        subtotal: toNum(subtotal, 0),
        shippingCost: toNum(shippingCost, 0),
        tax: 0,
        discount: 0,
        total: toNum(total, 0),
        paymentMethod: formData.paymentMethod,
        shippingAddress: {
          line1: formData.addressLine1.trim(),
          line2: formData.addressLine2.trim(),
          city: formData.city.trim(),
          state: formData.state.trim(),
          postalCode: formData.postalCode.trim(),
          country: "EG",
        },
        notes: formData.notes.trim(),
      }

      console.log("[Checkout] Creating order with payload:", orderPayload)

      // 1. إنشاء الطلب
      const orderResponse = await fetch("/api/orders/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      })

      console.log("[Checkout] Order response status:", orderResponse.status)
      
      const orderText = await orderResponse.text()
      console.log("[Checkout] Order response text:", orderText)

      let orderResult: any
      try {
        orderResult = JSON.parse(orderText)
      } catch (e) {
        console.error("[Checkout] Failed to parse order response:", e)
        throw new Error(`Server returned invalid response: ${orderText.slice(0, 200)}`)
      }

      if (!orderResponse.ok || !orderResult?.success) {
        throw new Error(orderResult?.error || `Order creation failed (${orderResponse.status})`)
      }

      console.log("[Checkout] Order created successfully:", orderResult)

      // 2. الدفع الإلكتروني (إذا تم اختياره)
      if (formData.paymentMethod === "cashier") {
        const paymentPayload = {
          orderId: orderResult.order.id,
          amount: toNum(total, 0),
          currency: "EGP",
          paymentMethod: "cashier",
          customerEmail: formData.customerEmail.trim(),
          customerName: formData.customerName.trim(),
          customerPhone: formData.customerPhone.trim(),
        }

        console.log("[Checkout] Creating payment with payload:", paymentPayload)

        // Payment API call
        const paymentResponse = await fetch("/api/payment/create", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(paymentPayload),
        })

        console.log("[Checkout] Payment response status:", paymentResponse.status)
        console.log("[Checkout] Payment response headers:", Object.fromEntries(paymentResponse.headers.entries()))

        const paymentText = await paymentResponse.text()
        console.log("[Checkout] Payment response text:", paymentText)

        let paymentResult: any
        try {
          paymentResult = JSON.parse(paymentText)
        } catch (e) {
          console.error("[Checkout] Failed to parse payment response:", e)
          throw new Error(`Payment API returned invalid response: ${paymentText.slice(0, 200)}`)
        }

        if (!paymentResponse.ok) {
          throw new Error(paymentResult?.error || `Payment creation failed (${paymentResponse.status})`)
        }

        if (!paymentResult?.success) {
          throw new Error(paymentResult?.error || "Payment creation failed")
        }

        console.log("[Checkout] Payment created successfully:", paymentResult)

        if (paymentResult?.paymentUrl) {
          console.log("[Checkout] Redirecting to:", paymentResult.paymentUrl)
          window.location.href = paymentResult.paymentUrl
          return
        } else {
          throw new Error("Payment URL not found in response")
        }
      }

      // 3. الدفع عند الاستلام - نجاح مباشر
      clearCart()
      router.push(`/order-success?orderNumber=${orderResult.order.orderNumber}`)
      
    } catch (err: any) {
      console.error("[Checkout] Error:", err)
      const errorMessage = err?.message || "حدث خطأ أثناء معالجة طلبك"
      setUiError(errorMessage)
      alert(errorMessage)
    } finally {
      setIsProcessing(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
          <div className="container mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <Link href="/" className="flex items-center gap-4">
                <Image src="/logo-option-4.jpg" alt="مكة" width={80} height={80} priority />
                <h1 className="text-3xl font-bold text-foreground">مكة</h1>
              </Link>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-20 text-center">
          <h2 className="text-3xl font-bold mb-4">السلة فارغة</h2>
          <p className="text-muted-foreground mb-8">لا توجد منتجات في سلة التسوق</p>
          <Button asChild>
            <Link href="/">العودة للتسوق</Link>
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <Image src="/logo-option-4.jpg" alt="مكة" width={80} height={80} priority />
              <h1 className="text-3xl font-bold text-foreground">مكة</h1>
            </Link>
            <Button asChild variant="outline">
              <Link href="/cart">العودة للسلة</Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <h1 className="text-4xl font-bold mb-8 text-center">إتمام الطلب</h1>

        {uiError ? (
          <div className="mb-6 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-destructive">
            {uiError}
          </div>
        ) : null}

        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Form */}
            <div className="lg:col-span-2 space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>معلومات العميل</CardTitle>
                  <CardDescription>أدخل بياناتك الشخصية</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="customerName">الاسم الكامل *</Label>
                    <Input
                      id="customerName"
                      value={formData.customerName}
                      onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                      placeholder="أدخل اسمك الكامل"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="customerEmail">البريد الإلكتروني *</Label>
                      <Input
                        id="customerEmail"
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({ ...formData, customerEmail: e.target.value })}
                        placeholder="example@email.com"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="customerPhone">رقم الهاتف *</Label>
                      <Input
                        id="customerPhone"
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({ ...formData, customerPhone: e.target.value })}
                        placeholder="01234567890"
                        required
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Truck className="w-5 h-5" />
                    عنوان الشحن
                  </CardTitle>
                  <CardDescription>أدخل عنوان التوصيل</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="addressLine1">العنوان (السطر الأول) *</Label>
                    <Input
                      id="addressLine1"
                      value={formData.addressLine1}
                      onChange={(e) => setFormData({ ...formData, addressLine1: e.target.value })}
                      placeholder="رقم المبنى، اسم الشارع"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="addressLine2">العنوان (السطر الثاني)</Label>
                    <Input
                      id="addressLine2"
                      value={formData.addressLine2}
                      onChange={(e) => setFormData({ ...formData, addressLine2: e.target.value })}
                      placeholder="الحي، المنطقة"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="city">المدينة *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        placeholder="القاهرة"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="state">المحافظة *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                        placeholder="القاهرة"
                        required
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="postalCode">الرمز البريدي</Label>
                      <Input
                        id="postalCode"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        placeholder="12345"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي ملاحظات خاصة بالطلب"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>طريقة الدفع</CardTitle>
                  <CardDescription>اختر طريقة الدفع المفضلة</CardDescription>
                </CardHeader>
                <CardContent>
                  <RadioGroup
                    value={formData.paymentMethod}
                    onValueChange={(value) => setFormData({ ...formData, paymentMethod: value })}
                  >
                    {paymentMethods.map((method) => {
                      const Icon = method.icon
                      return (
                        <div
                          key={method.id}
                          className="flex items-start space-x-3 space-x-reverse border rounded-lg p-4 hover:bg-accent/50 transition-colors cursor-pointer"
                          onClick={() => setFormData({ ...formData, paymentMethod: method.id })}
                        >
                          <RadioGroupItem value={method.id} id={method.id} />
                          <div className="flex-1 flex items-start gap-3">
                            <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center flex-shrink-0">
                              <Icon className="w-5 h-5 text-primary" />
                            </div>
                            <div className="flex-1">
                              <Label htmlFor={method.id} className="font-semibold cursor-pointer">
                                {method.name}
                              </Label>
                              <p className="text-sm text-muted-foreground mt-1">{method.description}</p>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </RadioGroup>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle>ملخص الطلب</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-3 max-h-64 overflow-y-auto">
                    {items.map((item: any, index) => (
                      <div key={index} className="flex gap-3">
                        <div className="relative w-16 h-16 rounded-md overflow-hidden flex-shrink-0">
                          <Image
                            src={item?.color?.images?.[0] || "/placeholder.svg?height=400&width=400"}
                            alt={item?.product?.name || "product"}
                            fill
                            className="object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{item?.product?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {item?.color?.name} - {item?.size}
                          </p>
                          <p className="text-sm">
                            {toNum(item?.quantity, 0)} × {toNum(item?.product?.price, 0)} جنيه
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">المجموع الفرعي</span>
                      <span>{toNum(subtotal, 0)} جنيه</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">الشحن</span>
                      <span>{toNum(shippingCost, 0)} جنيه</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>الإجمالي</span>
                      <span>{toNum(total, 0)} جنيه</span>
                    </div>
                  </div>

                  <Button type="submit" className="w-full" size="lg" disabled={isProcessing}>
                    {isProcessing ? "جاري المعالجة..." : <>إتمام الطلب <ArrowRight className="mr-2 h-4 w-4" /></>}
                  </Button>

                  <p className="text-xs text-muted-foreground text-center">
                    بالضغط على "إتمام الطلب"، أنت توافق على شروط الاستخدام وسياسة الخصوصية
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
