"use client"

import { CardContent } from "@/components/ui/card"
import { useState, useEffect } from "react"
import { useParams } from "next/navigation"
import { supabase } from "@/lib/supabase"
import { useCartStore } from "@/lib/cart-store"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import {
  Star,
  Heart,
  ShoppingBag,
  Check,
  Shield,
  ArrowRight,
  RefreshCw,
  CheckCircle2,
  User,
  Loader2,
} from "lucide-react"
import Link from "next/link"
import Image from "next/image"
import { ProductViewTracker } from "./product-view-tracker"
import { trackMetaEvent, buildUserMeta } from "@/lib/analytics/meta-pixel"
import { SiteLogo } from "@/components/site-logo"
import { SiteHeader } from "@/components/site-header"
import { SiteFooter } from "@/components/site-footer"
import { Input } from "@/components/ui/input"

interface ProductImage {
  id: string
  image_url: string
  alt_text_ar: string
  display_order: number
}
interface ProductVariant {
  id: string
  name_ar: string
  color: string
  color_hex: string
  size: string
  price: number
  inventory_quantity: number
}

interface Product {
  id: string
  name_ar: string
  name_en: string
  description_ar: string
  base_price: number
  category: {
    name_ar: string
  }
  product_images: ProductImage[]
  product_variants: ProductVariant[]
  category_id: string
}

export default function ProductDetailPage() {
  const params = useParams()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [aiRecommendations, setAiRecommendations] = useState<Product[]>([])
  const [loadingRecommendations, setLoadingRecommendations] = useState(false)
  const [loading, setLoading] = useState(true)
  const addItem = useCartStore((state) => state.addItem)

  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  const [quantity, setQuantity] = useState(1)
  const [isFavorite, setIsFavorite] = useState(false)
  const [isAdding, setIsAdding] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)

  const [userRating, setUserRating] = useState(0)
  const [userReview, setUserReview] = useState("")
  const [reviewerName, setReviewerName] = useState("")
  const [reviewerEmail, setReviewerEmail] = useState("")
  const [showReviewForm, setShowReviewForm] = useState(false)
  const [isSubmittingReview, setIsSubmittingReview] = useState(false)
  const [reviewsList, setReviewsList] = useState<Array<{ id: string; customer_name?: string; review_text?: string; rating: number; created_at?: string }>>([])

  useEffect(() => {
    async function fetchProduct() {
      try {
        console.log("[v0] 🔍 Fetching product with ID:", params.id)

        const { data, error } = await supabase
          .from("products")
          .select(
            `
            *,
            category:categories(name_ar, name_en),
            product_images(id, image_url, alt_text_ar, display_order),
            product_variants(id, name_ar, color, color_hex, size, price, inventory_quantity)
          `
          )
          .eq("id", params.id)
          .eq("is_active", true)
          .single()

        if (error) {
          console.error("[v0] ❌ Error fetching product:", error)
          setProduct(null)
          return
        }

        console.log("[v0] ✅ Product fetched:", data)
        setProduct(data)

        if (data.category_id) {
          const { data: related } = await supabase
            .from("products")
            .select(
              `
              *,
              category:categories(name_ar),
              product_images(image_url, display_order)
            `
            )
            .eq("category_id", data.category_id)
            .eq("is_active", true)
            .neq("id", params.id)
            .limit(3)

          if (related) {
            setRelatedProducts(related)
          }
        }
      } catch (err) {
        console.error("[v0] ❌ Error:", err)
      } finally {
        setLoading(false)
      }
    }

    fetchProduct()
  }, [params.id])

  useEffect(() => {
    async function fetchReviews() {
      if (!product) return

      try {
        const { data, error } = await supabase
          .from('product_reviews')
          .select('id, customer_name, review_text, rating, created_at, is_approved')
          .eq('product_id', product.id)
          .eq('is_approved', true)
          .order('created_at', { ascending: false })

        if (error) {
          console.error('Error fetching product reviews:', error)
          setReviewsList([])
          return
        }

        setReviewsList((data || []) as any)
      } catch (err) {
        console.error('Unexpected error fetching reviews:', err)
        setReviewsList([])
      }
    }

    fetchReviews()
  }, [product])

  useEffect(() => {
    async function fetchAIRecommendations() {
      if (!product) return

      try {
        setLoadingRecommendations(true)
        const response = await fetch(`/api/products/${product.id}/recommendations`)

        if (!response.ok) {
          console.error('Failed to fetch AI recommendations')
          return
        }

        const data = await response.json()
        setAiRecommendations(data.items || [])
      } catch (err) {
        console.error('Error fetching AI recommendations:', err)
      } finally {
        setLoadingRecommendations(false)
      }
    }

    fetchAIRecommendations()
  }, [product])

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

  if (!product) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center space-y-4">
          <h2 className="text-2xl font-bold text-foreground">المنتج غير موجود</h2>
          <Button asChild className="bg-primary hover:bg-primary/90">
            <Link href="/">العودة للرئيسية</Link>
          </Button>
        </div>
      </div>
    )
  }

  const selectedVariant = product.product_variants[selectedVariantIndex]
  const sortedImages = [...product.product_images].sort((a, b) => a.display_order - b.display_order)
  const uniqueColors = Array.from(new Map(product.product_variants.map((v) => [v.color_hex, v])).values())
  const uniqueSizes = Array.from(new Set(product.product_variants.map((v) => v.size)))

  const getFirstImage = (prod: Product) => {
    const sorted = [...(prod.product_images || [])].sort((a, b) => a.display_order - b.display_order)
    return sorted[0]?.image_url || "/placeholder.svg"
  }

  const handleAddToCart = async () => {
    if (!selectedVariant) {
      alert("الرجاء اختيار المقاس واللون")
      return
    }

    setIsAdding(true)
    try {
      addItem(
        {
          id: product!.id,
          name: product!.name_ar,
          price: selectedVariant.price,
          image: sortedImages[0]?.image_url || "/placeholder.svg",
        },
        {
          name: selectedVariant.color,
          hex: selectedVariant.color_hex,
        },
        selectedVariant.size,
        quantity,
        selectedVariant.id
      )

      setShowSuccess(true)
      setTimeout(() => setShowSuccess(false), 3000)
    } catch (error) {
      console.error("Error adding to cart:", error)
      alert("حدث خطأ أثناء إضافة المنتج إلى السلة")
    } finally {
      setIsAdding(false)
    }
  }

  const handleColorChange = (colorHex: string) => {
    const variantIndex = product.product_variants.findIndex((v) => v.color_hex === colorHex)
    if (variantIndex !== -1) {
      setSelectedVariantIndex(variantIndex)
      setSelectedImageIndex(0)
    }
  }

  const handleSizeChange = (size: string) => {
    const variantIndex = product.product_variants.findIndex(
      (v) => v.size === size && v.color_hex === selectedVariant.color_hex
    )
    if (variantIndex !== -1) {
      setSelectedVariantIndex(variantIndex)
    }
  }

  const handleSubmitReview = async () => {
    if (userRating === 0) {
      alert("الرجاء اختيار تقييم")
      return
    }
    if (!reviewerName.trim()) {
      alert("الرجاء كتابة اسمك")
      return
    }
    if (!userReview.trim()) {
      alert("الرجاء كتابة تعليق")
      return
    }

    setIsSubmittingReview(true)

    try {
      const { error } = await supabase.from("product_reviews").insert([
        {
          product_id: product!.id,
          rating: userRating,
            review_text: userReview,
            customer_name: reviewerName,
            customer_email: reviewerEmail,
            // reviews are moderated via `is_approved` in the DB; leave unset (null) or false
        },
      ])

      if (error) {
        throw error
      }

      setShowReviewForm(false)
      setUserRating(0)
      setUserReview("")
      setReviewerName("")
      setReviewerEmail("")
      alert("شكراً لتقييمك! سيتم نشره بعد المراجعة.")
    } catch (error) {
      console.error("Error submitting review:", error)
      alert("عفواً، حدث خطأ أثناء إرسال التقييم. الرجاء المحاولة مرة أخرى.")
    } finally {
      setIsSubmittingReview(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {showSuccess && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-[100] animate-in slide-in-from-top">
          <Card className="bg-green-50 border-2 border-green-500 shadow-lg">
            <div className="flex items-center gap-3 p-4">
              <CheckCircle2 className="h-6 w-6 text-green-600" />
              <div>
                <p className="font-bold text-green-900">تم إضافة المنتج إلى السلة بنجاح!</p>
                <Button asChild variant="link" size="sm" className="text-green-700 hover:text-green-900 p-0 h-auto">
                  <Link href="/cart">عرض السلة</Link>
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}

      <SiteHeader />

      <div className="container mx-auto px-4 py-4">
        <Button asChild variant="ghost" size="sm" className="hover:bg-primary/10 -mr-4">
          <Link href="/">
            <ArrowRight className="h-4 w-4 ml-2" />
            العودة للرئيسية
          </Link>
        </Button>
      </div>

      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4">
            <div className="relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border-2 border-border">
              <Image
                src={sortedImages[selectedImageIndex]?.image_url || "/placeholder.svg"}
                alt={sortedImages[selectedImageIndex]?.alt_text_ar || product.name_ar}
                fill
                className="object-cover"
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>

            {sortedImages.length > 1 && (
              <div className="grid grid-cols-3 gap-4">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => setSelectedImageIndex(index)}
                    className={`relative aspect-[3/4] rounded-lg overflow-hidden bg-muted border-2 transition-all ${
                      selectedImageIndex === index ? "border-primary" : "border-border hover:border-primary/50"
                    }`}
                  >
                    <Image
                      src={image.image_url || "/placeholder.svg"}
                      alt={image.alt_text_ar || `صورة ${index + 1}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 33vw, 16vw"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-3 text-foreground">{product.name_ar}</h1>
                  {product.category && <Badge variant="secondary" className="mb-4">{product.category.name_ar}</Badge>}
                </div>
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => setIsFavorite(!isFavorite)}
                  className={`border-2 ${isFavorite ? "text-red-500 border-red-500 bg-red-50" : "border-border hover:bg-primary/10"}`}
                >
                  <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
                </Button>
              </div>
              <p className="text-lg text-muted-foreground mb-4 leading-relaxed">{product.description_ar}</p>
              <div className="text-4xl font-bold text-primary mb-2">{selectedVariant.price} ج.م</div>
            </div>

            <Separator />

            {uniqueColors.length > 1 && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-foreground">
                  اللون: <span className="text-primary">{selectedVariant.color}</span>
                </h3>
                <div className="flex items-center gap-3 flex-wrap">
                  {uniqueColors.map((variant) => (
                    <button
                      key={variant.color_hex}
                      onClick={() => handleColorChange(variant.color_hex)}
                      className={`relative w-12 h-12 rounded-full border-2 transition-all ${
                        selectedVariant.color_hex === variant.color_hex
                          ? "border-primary scale-110 shadow-lg"
                          : "border-border hover:border-primary/50 hover:scale-105"
                      }`}
                      style={{ backgroundColor: variant.color_hex }}
                      title={variant.color}
                    >
                      {selectedVariant.color_hex === variant.color_hex && (
                        <div className="absolute inset-0 flex items-center justify-center">
                          <Check className="h-5 w-5 text-white drop-shadow-lg" strokeWidth={3} />
                        </div>
                      )}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {uniqueSizes.length > 0 && (
              <div>
                <h3 className="text-lg font-bold mb-4 text-foreground">المقاس</h3>
                <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 mb-3">
                  {uniqueSizes.map((size) => {
                    const variant = product.product_variants.find(
                      (v) => v.size === size && v.color_hex === selectedVariant.color_hex
                    )
                    const isAvailable = variant && variant.inventory_quantity > 0
                    const stock = variant ? variant.inventory_quantity : 0

                    return (
                      <button
                        key={size}
                        onClick={() => isAvailable && handleSizeChange(size)}
                        disabled={!isAvailable}
                        className={`py-3 px-4 rounded-lg border-2 font-medium transition-all ${
                          selectedVariant.size === size
                            ? "border-primary bg-primary text-primary-foreground shadow-md"
                            : isAvailable
                              ? "border-border hover:border-primary hover:bg-primary/5"
                              : "border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed opacity-60"
                        }`}
                      >
                        <div className="flex flex-col items-center">
                          <span>{size}</span>
                          {isAvailable ? (
                            <span className="text-[10px] opacity-80 mt-1">(المتاح: {stock})</span>
                          ) : (
                            <span className="text-[10px] text-red-400 mt-1">غير متاح</span>
                          )}
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-4">
              <Button
                onClick={handleAddToCart}
                size="lg"
                disabled={isAdding || selectedVariant.inventory_quantity === 0}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground text-lg py-6"
              >
                <ShoppingBag className="h-5 w-5 ml-2" />
                {selectedVariant.inventory_quantity === 0
                  ? "غير متوفر"
                  : isAdding
                    ? "جاري الإضافة..."
                    : "إضافة إلى السلة"}
              </Button>

              <div className="grid grid-cols-2 gap-4">
                <Card className="p-4 text-center border-2 border-border">
                  <Shield className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">ضمان الجودة</p>
                </Card>
                <Card className="p-4 text-center border-2 border-border">
                  <RefreshCw className="h-6 w-6 mx-auto mb-2 text-primary" />
                  <p className="text-xs text-muted-foreground">إرجاع سهل</p>
                </Card>
              </div>
            </div>
          </div>
        </div>

        {/* AI Recommendations Section */}
        {aiRecommendations.length > 0 && (
          <div className="mt-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-3xl font-bold text-foreground mb-2">منتجات مشابهة ✨</h2>
                <p className="text-muted-foreground">توصيات مدعومة بالذكاء الاصطناعي</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {aiRecommendations.map((recommendedProduct) => (
                <Link
                  key={recommendedProduct.id}
                  href={`/product/${recommendedProduct.id}`}
                  className="group"
                >
                  <Card className="overflow-hidden border-2 border-border hover:border-primary transition-all hover:shadow-xl">
                    <CardContent className="p-0">
                      <div className="relative aspect-[3/4] bg-muted">
                        <Image
                          src={getFirstImage(recommendedProduct)}
                          alt={recommendedProduct.name_ar}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                          sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        />
                      </div>
                      <div className="p-4 bg-background">
                        <h4 className="text-lg font-bold mb-2 text-foreground line-clamp-2">
                          {recommendedProduct.name_ar}
                        </h4>
                        {recommendedProduct.category && (
                          <Badge variant="secondary" className="mb-2 text-xs">
                            {recommendedProduct.category[0]?.name_ar || recommendedProduct.category.name_ar}
                          </Badge>
                        )}
                        <p className="text-xl font-bold text-primary">{recommendedProduct.base_price} ج.م</p>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {loadingRecommendations && (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
                <p className="text-sm text-muted-foreground mt-2">جاري تحميل التوصيات...</p>
              </div>
            )}
          </div>
        )}

        {/* Reviews Section */}
        <div className="mt-16">
          <Card className="border-2 border-border">
            <CardContent className="p-8">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-2xl font-bold text-foreground">تقييمات العملاء</h3>
                <Button
                  onClick={() => setShowReviewForm(!showReviewForm)}
                  variant="outline"
                  className="border-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground"
                >
                  {showReviewForm ? "إلغاء" : "أضيفي تقييمك"}
                </Button>
              </div>

              {showReviewForm && (
                <Card className="mb-6 bg-primary/5 border-2 border-primary/30">
                  <CardContent className="p-6">
                    <h4 className="font-bold text-lg mb-4 text-foreground">تقييمك للمنتج</h4>
                    <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">اسمك</label>
                          <Input
                              value={reviewerName}
                              onChange={(e) => setReviewerName(e.target.value)}
                              placeholder="مثال: فاطمة أحمد"
                              className="border-2 border-border focus:border-primary"
                          />
                        </div>
                         <div>
                          <label className="block text-sm font-medium mb-2 text-foreground">بريدك الإلكتروني (اختياري)</label>
                          <Input
                              value={reviewerEmail}
                              onChange={(e) => setReviewerEmail(e.target.value)}
                              placeholder="...بريدك الإلكتروني"
                              className="border-2 border-border focus:border-primary"
                          />
                        </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">التقييم</label>
                        <div className="flex items-center gap-2">
                          {[1, 2, 3, 4, 5].map((rating) => (
                            <button
                              key={rating}
                              onClick={() => setUserRating(rating)}
                              className="transition-transform hover:scale-110"
                            >
                              <Star
                                className={`h-8 w-8 ${
                                  rating <= userRating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "fill-muted text-muted"
                                }`}
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2 text-foreground">تعليقك</label>
                        <Textarea
                          value={userReview}
                          onChange={(e) => setUserReview(e.target.value)}
                          placeholder="شاركينا رأيك في المنتج..."
                          className="min-h-[120px] border-2 border-border focus:border-primary"
                        />
                      </div>
                      <Button
                        onClick={handleSubmitReview}
                        disabled={isSubmittingReview}
                        className="w-full bg-primary hover:bg-primary/90"
                      >
                        {isSubmittingReview ? "جاري الإرسال..." : "إرسال التقييم"}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              )}

              <div className="space-y-4">
                {reviewsList.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">لا توجد تقييمات لهذا المنتج.</div>
                ) : (
                  reviewsList.map((r) => (
                    <Card key={r.id} className="border border-border">
                      <CardContent className="p-6">
                        <div className="flex items-start gap-4">
                          <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                            <User className="h-6 w-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between mb-2">
                              <h5 className="font-bold text-foreground">{r.customer_name || 'مستخدم'}</h5>
                              <span className="text-sm text-muted-foreground">{r.created_at ? new Date(r.created_at).toLocaleDateString('ar-EG') : ''}</span>
                            </div>
                            <div className="flex items-center mb-3">
                              {Array.from({ length: 5 }).map((_, i) => (
                                <Star key={i} className={`h-4 w-4 ${i < (r.rating || 0) ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                              ))}
                            </div>
                            <p className="text-muted-foreground leading-relaxed">{r.review_text}</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}
