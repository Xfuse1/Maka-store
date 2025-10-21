"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
// غيّر المسار حسب مكان الملف الفعلي:
import { getOrderById } from "@/lib/supabase/orders"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
// غيّر المسار حسب مكان الملف الفعلي:
import { useCartStore } from "@/lib/cart-store"

const statusLabels: Record<string, string> = {
  pending: "تحت الإنشاء",
  processing: "جاري التجهيز",
  shipped: "خرج للشحن",
  delivered: "تم التوصيل",
  cancelled: "ملغي",
}

export default function OrderStatusPage() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getOrderById(params.id as string)
      .then(setOrder)
      .finally(() => setLoading(false))
  }, [params.id])

  const clearCart = useCartStore((state: any) => state.clearCart)
  const removeItem = useCartStore((state: any) => state.removeItem)
  const updateQuantity = useCartStore((state: any) => state.updateQuantity)
  const getTotalPrice = useCartStore((state: any) => state.getTotalPrice())
  const items = useCartStore((state: any) => state.items)

  const handleCheckout = () => {
    // Navigate to checkout page (to be implemented)
    router.push("/checkout")
  }

  if (loading) return <div>جاري التحميل...</div>
  if (!order) return <div>الطلب غير موجود</div>

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-3">
              <Image src="/logo-option-4.jpg" alt="مكة" width={80} height={80} priority />
              <h1 className="text-2xl font-bold text-primary">مكة</h1>
            </Link>
            <Button asChild variant="outline" size="sm" className="border-border hover:bg-primary/10 bg-transparent">
              <Link href="/">
                <ArrowRight className="h-4 w-4 ml-2" />
                متابعة التسوق
              </Link>
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Cart Items */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-3xl font-bold text-foreground">سلة التسوق</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={clearCart}
                className="text-red-600 border-red-600 hover:bg-red-50 bg-transparent"
              >
                <Trash2 className="h-4 w-4 ml-2" />
                إفراغ السلة
              </Button>
            </div>

            {items.map((item: any) => (
              <Card key={`${item.product.id}-${item.color.name}-${item.size}`} className="border-2 border-border">
                <CardContent className="p-6">
                  <div className="flex gap-6">
                    {/* Product Image */}
                    <div className="relative w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted border-2 border-border">
                      <Image
                        src={item.product.image || item.product.product_images?.[0]?.image_url || "/placeholder.svg"}
                        alt={item.product.name}
                        fill
                        className="object-cover"
                        sizes="128px"
                      />
                    </div>

                    {/* Product Details */}
                    <div className="flex-1 space-y-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-bold text-foreground mb-2">{item.product.name}</h3>
                          <div className="flex items-center gap-4 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                              <span>اللون:</span>
                              <div
                                className="w-5 h-5 rounded-full border-2 border-border"
                                style={{ backgroundColor: item.color.hex || "#000" }}
                                title={item.color.name}
                              />
                              <span>{item.color.name}</span>
                            </div>
                            <div>
                              <span>المقاس: </span>
                              <span className="font-medium text-foreground">{item.size}</span>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => removeItem(item.product.id, item.color.name, item.size)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-5 w-5" />
                        </Button>
                      </div>

                      <Separator />

                      <div className="flex items-center justify-between">
                        {/* Quantity Controls */}
                        <div className="flex items-center gap-3">
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                item.color.name,
                                item.size,
                                Math.max(1, item.quantity - 1),
                              )
                            }
                            disabled={item.quantity <= 1}
                            className="h-10 w-10 border-2 border-border"
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-lg font-bold text-foreground w-12 text-center">{item.quantity}</span>
                          <Button
                            variant="outline"
                            size="icon"
                            onClick={() =>
                              updateQuantity(item.product.id, item.color.name, item.size, item.quantity + 1)
                            }
                            className="h-10 w-10 border-2 border-border"
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>

                        {/* Price */}
                        <div className="text-left">
                          <p className="text-2xl font-bold text-primary">{item.product.price * item.quantity} د.م</p>
                          {item.quantity > 1 && (
                            <p className="text-sm text-muted-foreground">{item.product.price} د.م للقطعة</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="border-2 border-border sticky top-24">
              <CardContent className="p-6 space-y-6">
                <h3 className="text-2xl font-bold text-foreground">ملخص الطلب</h3>

                <Separator />

                <div className="space-y-3">
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-muted-foreground">المجموع الفرعي</span>
                    <span className="font-bold text-foreground">{getTotalPrice} د.م</span>
                  </div>
                  <div className="flex items-center justify-between text-lg">
                    <span className="text-muted-foreground">الشحن</span>
                    <span className="font-bold text-green-600">مجاني</span>
                  </div>
                </div>

                <Separator />

                <div className="flex items-center justify-between text-2xl">
                  <span className="font-bold text-foreground">الإجمالي</span>
                  <span className="font-bold text-primary">{getTotalPrice} د.م</span>
                </div>

                <Button
                  onClick={handleCheckout}
                  size="lg"
                  className="w-full bg-primary hover:bg-primary/90 text-lg py-6 relative"
                >
                  <ShoppingBag className="h-5 w-5 ml-2" />
                  إتمام الطلب
                  {items.length > 0 && <span className="absolute -top-2 -left-2 bg-white text-primary text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center">{items.length}</span>}
                </Button>

                <div className="bg-primary/5 rounded-lg p-4 border-2 border-primary/20">
                  <p className="text-sm text-center text-muted-foreground">
                    ✨ شحن مجاني لجميع الطلبات
                    <br />🔒 الدفع آمن ومضمون
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      <footer className="border-t border-border bg-white py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 مكة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}