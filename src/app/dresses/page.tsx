"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag,  Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductsByCategory } from "@/lib/products-data"

export default function DressesPage() {
  const products = getProductsByCategory("فساتين")

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-background sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <Link href="/" className="flex items-center gap-4">
              <Image src="/mecca-logo.jpg" alt="مكة" width={60} height={60} />
              <h1 className="text-3xl font-bold text-foreground">مكة</h1>
            </Link>
            <div className="flex items-center gap-4">
              <Button asChild variant="outline" size="sm" className="border-border hover:bg-primary/10 bg-transparent">
                <Link href="/">
                  <ArrowRight className="h-4 w-4 ml-2" />
                  العودة
                </Link>
              </Button>
              <Button asChild variant="default" className="bg-primary hover:bg-primary/90 text-primary-foreground">
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5 ml-2" />
                  السلة
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8 text-foreground">فساتين</h2>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-3xl">
          فساتين أنيقة بتصاميم محتشمة وراقية تناسب جميع المناسبات الخاصة والاستخدام اليومي
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {products.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all hover:shadow-xl">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] bg-muted">
                    <Image
                      src={product.colors[0].images[0] || "/placeholder.svg"}
                      alt={product.name}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                  
                  </div>
                  <div className="p-6 bg-background">
                    <h4 className="text-xl font-bold mb-2 text-foreground">{product.name}</h4>
                    <div className="flex items-center gap-2 mb-3">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 ${
                              i < Math.floor(product.rating)
                                ? "fill-yellow-400 text-yellow-400"
                                : "fill-muted text-muted"
                            }`}
                          />
                        ))}
                      </div>
                      <span className="text-sm text-muted-foreground">({product.reviews})</span>
                    </div>
                    <p className="text-2xl font-bold text-primary">{product.price} ج.م</p>
                    {product.customSizesAvailable && <p className="text-sm text-primary mt-2">✨ متوفر مقاسات خاصة</p>}
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border bg-background py-8 mt-12">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">© 2025 مكة. جميع الحقوق محفوظة.</p>
        </div>
      </footer>
    </div>
  )
}
