"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {  TrendingUp, Sparkles } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { CustomerReviews } from "@/components/customer-reviews"

interface Product {
  id: string
  name_ar: string
  base_price: number
  is_featured?: boolean
  category: Array<{
    name_ar: string
  }> | null
  product_images: Array<{
    image_url: string
    display_order: number
  }>
}

interface Category {
  id: string
  name_ar: string
  slug: string
  description_ar?: string
  image_url?: string
}

interface HomepageSection {
  id: string
  name_ar: string
  section_type: string
  is_active: boolean
  max_items: number
  layout_type: string
  background_color: string
  show_title: boolean
}

interface DynamicHomepageSectionProps {
  section: HomepageSection
  products: Product[]
  categories: Category[]
}

export function DynamicHomepageSection({ section, products, categories }: DynamicHomepageSectionProps) {
  if (!section.is_active) return null

  const getFirstImage = (product: Product) => {
    const sortedImages = [...(product.product_images || [])].sort((a, b) => a.display_order - b.display_order)
    return sortedImages[0]?.image_url || "/placeholder.svg"
  }

  const getSectionProducts = () => {
    switch (section.section_type) {
      case "best_sellers":
        return products.slice(0, section.max_items)
      case "new_arrivals":
        return products.slice(0, section.max_items)
      case "featured":
        return products.filter((p) => p.is_featured).slice(0, section.max_items)
      default:
        return products.slice(0, section.max_items)
    }
  }

  const getSectionIcon = () => {
    switch (section.section_type) {
      case "best_sellers":
        return <TrendingUp className="w-8 h-8 text-primary" />
      case "new_arrivals":
        return <Sparkles className="w-8 h-8 text-primary" />
      default:
        return null
    }
  }

  const getBadgeText = () => {
    switch (section.section_type) {
      case "best_sellers":
        return "الأكثر مبيعاً"
      case "new_arrivals":
        return "جديد"
      case "featured":
        return "مميز"
      default:
        return null
    }
  }

  const getBadgeColor = () => {
    switch (section.section_type) {
      case "best_sellers":
        return "bg-red-500 text-white"
      case "new_arrivals":
        return "bg-green-500 text-white"
      case "featured":
        return "bg-primary text-primary-foreground"
      default:
        return "bg-primary text-primary-foreground"
    }
  }

  const backgroundClass =
    section.background_color === "secondary"
      ? "bg-secondary/30"
      : section.background_color === "muted"
        ? "bg-muted"
        : "bg-background"

  // Reviews Section
  if (section.section_type === "reviews") {
    return <CustomerReviews />
  }

  // Categories Section
  if (section.section_type === "categories") {
    return (
      <section id="categories" className={`py-20 ${backgroundClass}`}>
        <div className="container mx-auto px-4">
          {section.show_title && (
            <h3 className="text-4xl font-bold text-center mb-16 text-foreground">{section.name_ar}</h3>
          )}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {categories.slice(0, section.max_items).map((category) => (
              <Link key={category.id} href={`/category/${category.slug}`} className="group">
                <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all hover:shadow-xl">
                  <CardContent className="p-0">
                    <div className="relative aspect-[3/4] bg-muted">
                      <Image
                        src={category.image_url || "/placeholder.svg?height=400&width=300"}
                        alt={category.name_ar}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-300"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      />
                    </div>
                    <div className="p-6 bg-background text-center">
                      <h4 className="text-2xl font-bold text-foreground">{category.name_ar}</h4>
                      {category.description_ar && (
                        <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{category.description_ar}</p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    )
  }

  // Products Section
  const sectionProducts = getSectionProducts()
  const badgeText = getBadgeText()
  const badgeColor = getBadgeColor()
  const icon = getSectionIcon()

  return (
    <section className={`py-20 ${backgroundClass}`}>
      <div className="container mx-auto px-4">
        {section.show_title && (
          <>
            <div className="flex items-center justify-center gap-3 mb-4">
              {icon}
              <h3 className="text-4xl font-bold text-center text-foreground">{section.name_ar}</h3>
            </div>
            {section.section_type === "best_sellers" && (
              <p className="text-center text-muted-foreground text-lg mb-16">المنتجات الأكثر طلباً من عملائنا</p>
            )}
            {section.section_type === "new_arrivals" && (
              <p className="text-center text-muted-foreground text-lg mb-16">أحدث إضافاتنا من التصاميم العصرية</p>
            )}
            {section.section_type === "featured" && (
              <p className="text-center text-muted-foreground text-lg mb-16">تشكيلة مختارة بعناية من أفضل منتجاتنا</p>
            )}
          </>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {sectionProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`} className="group">
              <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all hover:shadow-xl">
                <CardContent className="p-0">
                  <div className="relative aspect-[3/4] bg-muted">
                    <Image
                      src={getFirstImage(product) || "/placeholder.svg"}
                      alt={product.name_ar}
                      fill
                      className="object-cover group-hover:scale-105 transition-transform duration-300"
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                    {badgeText && <Badge className={`absolute top-4 right-4 ${badgeColor}`}>{badgeText}</Badge>}
                    
                  </div>
                  <div className="p-6 bg-background">
                    <h4 className="text-xl font-bold mb-2 text-foreground">{product.name_ar}</h4>
                    <p className="text-2xl font-bold text-primary">{product.base_price} د.م</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
