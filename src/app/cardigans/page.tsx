"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { ShoppingBag, Star, ArrowRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { getProductsByCategory } from "@/lib/products-data"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"

export default function CardigansPage() {
  const products = getProductsByCategory("كارديجان")

  return (
    <div className="min-h-screen bg-background">
      <SiteHeader />

      {/* Page Content */}
      <div className="container mx-auto px-4 py-12">
        <h2 className="text-4xl font-bold mb-8 text-foreground">كارديجان</h2>
        <p className="text-lg text-muted-foreground mb-12 leading-relaxed max-w-3xl">
          تصاميم عصرية من الكارديجان تجمع بين الأناقة والراحة لإطلالة مميزة في كل الأوقات
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
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
                    <Button
                      variant="outline"
                      size="icon"
                      className="absolute top-4 left-4 bg-background/90 hover:bg-background/90 border-2 border-border"
                      onClick={(e) => e.preventDefault()}
                    >
                     
                    </Button>
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

      <SiteFooter />
    </div>
  )
}
