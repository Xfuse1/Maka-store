"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { ShoppingBag, Search, Loader2 } from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { useCartStore } from "@/lib/cart-store"
import { HeroSlider } from "@/components/hero-slider"
import { MainNavigation } from "@/components/main-navigation"
import { MobileNavigation } from "@/components/mobile-navigation"
import { supabase } from "@/lib/supabase"
import { getActiveCategories, type Category } from "@/lib/supabase/categories"
import { DynamicHomepageSection } from "@/components/dynamic-homepage-section"
import { Card, CardContent } from "@/components/ui/card"

interface Product {
  id: string
  name_ar: string
  base_price: number
  is_featured?: boolean
  category: {
    name_ar: string
  }
  product_images: Array<{
    image_url: string
    display_order: number
  }>
}

interface HomepageSection {
  id: string
  name_ar: string
  section_type: string
  display_order: number
  is_active: boolean
  max_items: number
  layout_type: string
  background_color: string
  show_title: boolean
}

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState("")
  const totalItems = useCartStore((state) => state.getTotalItems())

  useEffect(() => {
    async function fetchData() {
      try {
        console.log("[v0] 🔍 Fetching products, categories, and sections from Supabase...")

        const [productsData, categoriesData, sectionsData] = await Promise.all([
          supabase
            .from("products")
            .select(`
              id,
              name_ar,
              base_price,
              is_featured,
              created_at,
              category:categories(name_ar),
              product_images(image_url, display_order)
            `)
            .eq("is_active", true)
            .order("created_at", { ascending: false }),
          getActiveCategories(),
          supabase
            .from("homepage_sections")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true }),
        ])

        if (productsData.error) {
          console.error("[v0] ❌ Error fetching products:", productsData.error)
        } else {
          console.log("[v0] ✅ Products fetched:", productsData.data?.length)
          setProducts(productsData.data || [])
        }

        console.log("[v0] ✅ Categories fetched:", categoriesData.length)
        setCategories(categoriesData)

        if (sectionsData.error) {
          console.error("[v0] ❌ Error fetching sections:", sectionsData.error)
        } else {
          console.log("[v0] ✅ Sections fetched:", sectionsData.data?.length)
          setSections(sectionsData.data || [])
        }
      } catch (err) {
        console.error("[v0] ❌ Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    console.log("[v0] 🔄 Setting up real-time subscription for homepage sections...")

    const channel = supabase
      .channel("homepage_sections_changes")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "homepage_sections",
        },
        async (payload) => {
          console.log("[v0] 🔔 Homepage sections changed:", payload)

          // Refetch sections when any change occurs
          const { data, error } = await supabase
            .from("homepage_sections")
            .select("*")
            .eq("is_active", true)
            .order("display_order", { ascending: true })

          if (!error && data) {
            console.log("[v0] ✅ Sections updated in real-time:", data.length)
            setSections(data)
          }
        },
      )
      .subscribe()

    // Cleanup subscription on unmount
    return () => {
      console.log("[v0] 🔌 Cleaning up real-time subscription...")
      supabase.removeChannel(channel)
    }
  }, [])

  const filteredProducts = products.filter((product) => {
    if (!searchQuery) return false
    const query = searchQuery.toLowerCase()
    return product.name_ar.toLowerCase().includes(query) || product.category?.name_ar.toLowerCase().includes(query)
  })

  const getFirstImage = (product: Product) => {
    const sortedImages = [...(product.product_images || [])].sort((a, b) => a.display_order - b.display_order)
    return sortedImages[0]?.image_url || "/placeholder.svg"
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">جاري التحميل...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-white sticky top-0 z-50 shadow-sm">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between gap-4">
            <Link href="/" className="flex items-center gap-4">
              <div className="relative w-20 h-20 flex-shrink-0">
                <Image src="/logo-option-4.jpg" alt="مكة" fill className="object-contain" priority />
              </div>
              <h1 className="text-3xl font-bold text-foreground">مكة</h1>
            </Link>

            <div className="hidden md:flex flex-1 max-w-3xl mx-8">
              <div className="relative w-full">
                <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-6 w-6 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="ابحثي عن المنتجات..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pr-12 h-14 text-lg border-2 border-border focus:border-primary"
                />
              </div>
            </div>

            <MainNavigation />

            <div className="flex items-center gap-3">
              <MobileNavigation />

              <Button
                asChild
                variant="default"
                className="bg-primary hover:bg-primary/90 active:bg-primary/80 text-primary-foreground relative shadow-md hover:shadow-lg transition-all"
              >
                <Link href="/cart">
                  <ShoppingBag className="h-5 w-5 ml-2" />
                  <span className="hidden sm:inline">السلة</span>
                  {totalItems > 0 && (
                    <Badge className="absolute -top-2 -left-2 bg-accent text-accent-foreground px-2 py-0.5 text-xs">
                      {totalItems}
                    </Badge>
                  )}
                </Link>
              </Button>
            </div>
          </div>

          <div className="md:hidden mt-4">
            <div className="relative w-full">
              <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="ابحثي عن المنتجات..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-10 border-2 border-border focus:border-primary"
              />
            </div>
          </div>
        </div>
      </header>

      <HeroSlider />

      {searchQuery && (
        <section className="py-12 bg-background">
          <div className="container mx-auto px-4">
            <h3 className="text-3xl font-bold mb-8 text-foreground">نتائج البحث عن "{searchQuery}"</h3>
            {filteredProducts.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-xl text-muted-foreground">لا توجد منتجات تطابق بحثك</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
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
                        </div>
                        <div className="p-6 bg-white">
                          <h4 className="text-xl font-bold mb-2 text-foreground">{product.name_ar}</h4>
                          <p className="text-2xl font-bold text-primary">{product.base_price} د.م</p>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>
        </section>
      )}

      {!searchQuery && (
        <>
          {sections.map((section) => (
            <DynamicHomepageSection key={section.id} section={section} products={products} categories={categories} />
          ))}
        </>
      )}

      <footer className="border-t border-border bg-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h5 className="font-bold text-lg mb-4 text-foreground">عن مكة</h5>
              <p className="text-muted-foreground leading-relaxed">
                متجر مكة للأزياء النسائية الراقية - نقدم لكِ أفضل التصاميم العصرية التي تجمع بين الأصالة والحداثة
              </p>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-4 text-foreground">روابط سريعة</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/category/abayas" className="text-muted-foreground hover:text-primary transition-colors">
                    عبايات
                  </Link>
                </li>
                <li>
                  <Link
                    href="/category/cardigans"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    كارديجان
                  </Link>
                </li>
                <li>
                  <Link href="/category/suits" className="text-muted-foreground hover:text-primary transition-colors">
                    بدل
                  </Link>
                </li>
                <li>
                  <Link href="/category/dresses" className="text-muted-foreground hover:text-primary transition-colors">
                    فساتين
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-4 text-foreground">معلومات</h5>
              <ul className="space-y-2">
                <li>
                  <Link href="/about" className="text-muted-foreground hover:text-primary transition-colors">
                    من نحن
                  </Link>
                </li>
                <li>
                  <Link href="/return-policy" className="text-muted-foreground hover:text-primary transition-colors">
                    سياسة الإرجاع
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h5 className="font-bold text-lg mb-4 text-foreground">تواصل معنا</h5>
              <p className="text-muted-foreground leading-relaxed mb-4">
                للاستفسارات والطلبات الخاصة
                <br />
                واتساب: 01234567890
                <br />
                البريد: info@mecca-fashion.com
              </p>
              <Link href="/contact">
                <Button variant="outline" className="w-full bg-transparent hover:bg-secondary active:bg-secondary/80">
                  تواصل معنا
                </Button>
              </Link>
            </div>
          </div>
          <div className="text-center pt-8 border-t border-border">
            <p className="text-sm text-muted-foreground">© 2025 مكة. جميع الحقوق محفوظة.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}
