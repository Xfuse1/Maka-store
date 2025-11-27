"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Search, Plus, Edit, Trash2, Eye, Loader2, Upload, X } from "lucide-react"
import Image from "next/image"
import Link from "next/link"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { useToast } from "@/hooks/use-toast"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  getAllProducts,
  getAllCategories,
  createProduct,
  updateProduct,
  deleteProduct,
  createProductVariant,
  updateProductVariant,
  deleteProductVariant,
  createProductImage,
  deleteProductImage,
  type ProductWithDetails,
} from "@/lib/supabase/products"
import { uploadMultipleImages } from "@/lib/supabase/storage"

type ColorEntry = { name: string; hex: string }
type SizeEntry = { name: string; price: number; stock: number }
type NewProductForm = {
  name_ar: string
  name_en: string
  category_id: string
  base_price: number
  description_ar: string
  description_en: string
  colors: ColorEntry[]
  sizes: SizeEntry[]
  images: File[]
  is_featured: boolean
  shipping_type: "free" | "paid"
  shipping_cost: number
}

export default function AdminProductsPage() {
  const [products, setProducts] = useState<ProductWithDetails[]>([])
  const [categories, setCategories] = useState<Array<{ id: string; name_ar: string; name_en: string }>>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [perPage, setPerPage] = useState(50)
  const [totalProducts, setTotalProducts] = useState<number | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingProduct, setEditingProduct] = useState<ProductWithDetails | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [newProduct, setNewProduct] = useState<NewProductForm>({
    name_ar: "",
    name_en: "",
    category_id: "",
    base_price: 0,
    description_ar: "",
    description_en: "",
    colors: [{ name: "أسود", hex: "#000000" }],
    sizes: [
      { name: "S", price: 0, stock: 0 },
      { name: "M", price: 0, stock: 0 },
      { name: "L", price: 0, stock: 0 },
    ],
    images: [],
    is_featured: false,
    shipping_type: "free",
    shipping_cost: 0,
  })

  useEffect(() => {
    loadData()
  }, [page, perPage])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsResult, categoriesData] = await Promise.all([getAllProducts(page, perPage), getAllCategories()])
      setProducts(productsResult.data)
      setTotalProducts(productsResult.total ?? null)
      setCategories(categoriesData)
    } catch (error) {
      console.error("[v0] Error loading data:", error)
      toast({
        title: "خطأ",
        description: "فشل تحميل البيانات. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filteredProducts = products.filter(
    (product) =>
      product.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.name_en.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.category?.name_ar.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  const featuredProducts = products.filter((product) => product.is_featured)

  const resetNewProduct = () =>
    setNewProduct({
      name_ar: "",
      name_en: "",
      category_id: "",
      base_price: 0,
      description_ar: "",
      description_en: "",
      colors: [{ name: "أسود", hex: "#000000" }],
      sizes: [
        { name: "S", price: 0, stock: 0 },
        { name: "M", price: 0, stock: 0 },
        { name: "L", price: 0, stock: 0 },
      ],
      images: [],
      is_featured: false,
      shipping_type: "free",
      shipping_cost: 0,
    })

  // Helper to generate a safe, unique SKU for variants to avoid DB duplicate errors
  const makeVariantSKU = (productSku: string, sizeName: string, colorName: string) => {
    const clean = (s: any) => {
      if (!s) return "na"
      return String(s)
        .replace(/\s+/g, "-")
        .replace(/[^a-zA-Z0-9-_]/g, "")
        .toUpperCase()
        .slice(0, 40)
    }
    const uniq = `${Date.now().toString(36).slice(-6)}${Math.floor(Math.random() * 9000 + 1000).toString(36)}`
    return `${productSku || "PRD"}-${clean(sizeName)}-${clean(colorName)}-${uniq}`
  }

  const onImagesChange = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    const maxAllowed = 10
    setNewProduct((p) => {
      const remaining = Math.max(0, maxAllowed - p.images.length)
        if (remaining === 0) {
        // notify user via toast if available
        try {
          // toast is available in outer scope
          toast({ title: "مسموح 10 صور فقط", description: "لا يمكنك إضافة أكثر من 10 صور للمنتج.", variant: "destructive" })
        } catch (e) {
          /* ignore if toast unavailable */
        }
        return p
      }

      const toAdd = arr.slice(0, remaining)
      if (toAdd.length < arr.length) {
        try {
          toast({ title: "تم اقتصار الصور", description: `تم قبول ${toAdd.length} صورة إضافية فقط (الحد الأقصى 10).` })
        } catch (e) {
          /* ignore */
        }
      }

      return { ...p, images: [...p.images, ...toAdd] }
    })
  }

  const removeImage = (idx: number) => setNewProduct((p) => ({ ...p, images: p.images.filter((_, i) => i !== idx) }))

  const addColor = () => setNewProduct((p) => ({ ...p, colors: [...p.colors, { name: "", hex: "#000000" }] }))

  const updateColor = (idx: number, field: keyof ColorEntry, value: string) =>
    setNewProduct((p) => {
      const colors = [...p.colors]
      colors[idx] = { ...colors[idx], [field]: value }
      return { ...p, colors }
    })

  const removeColor = (idx: number) => setNewProduct((p) => ({ ...p, colors: p.colors.filter((_, i) => i !== idx) }))

  const addSize = () => setNewProduct((p) => ({ ...p, sizes: [...p.sizes, { name: "", price: 0, stock: 0 }] }))

  const updateSize = (idx: number, field: keyof SizeEntry, value: string | number) =>
    setNewProduct((p) => {
      const sizes = [...p.sizes]
      sizes[idx] = {
        ...sizes[idx],
        [field]: field === "price" || field === "stock" ? Number(value) : (value as string),
      }
      return { ...p, sizes }
    })

  const removeSize = (idx: number) => setNewProduct((p) => ({ ...p, sizes: p.sizes.filter((_, i) => i !== idx) }))

  const handleDeleteProduct = async (productId: string, productName: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${productName}"؟`)) return

    try {
      await deleteProduct(productId)
      toast({
        title: "تم الحذف",
        description: `تم حذف المنتج "${productName}" بنجاح`,
      })
      // Reload current page with cache-buster. If page becomes empty, go back one page.
      try {
        const productsResultReload = await getAllProducts(page, perPage, true)
        if ((productsResultReload.data?.length ?? 0) === 0 && page > 1) {
          const prevPage = page - 1
          const prevResult = await getAllProducts(prevPage, perPage, true)
          setPage(prevPage)
          setProducts(prevResult.data)
          setTotalProducts(prevResult.total ?? null)
        } else {
          setProducts(productsResultReload.data)
          setTotalProducts(productsResultReload.total ?? null)
        }
      } catch (e) {
        console.error("[v0] Error reloading products after delete:", e)
      }
    } catch (error) {
      console.error("[v0] Error deleting product:", error)
      toast({
        title: "خطأ",
        description: "فشل حذف المنتج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    }
  }

  const handleEditProduct = (product: ProductWithDetails) => {
    setEditingProduct(product)
    setShowEditDialog(true)
  }

  const handleSaveNewProduct = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!newProduct.name_ar || !newProduct.category_id) {
      toast({
        title: "خطأ",
        description: "يرجى ملء جميع الحقول المطلوبة",
        variant: "destructive",
      })
      return
    }

    // Validation: base_price must be >= 1
    if (Number(newProduct.base_price || 0) < 1) {
      toast({ title: "قيمة غير صالحة", description: "يجب أن يكون السعر الأساسي 1 ج.م أو أكثر.", variant: "destructive" })
      return
    }

    // Validation: sizes price/stock must be >= 0
    for (const sz of newProduct.sizes) {
      if (Number(sz.price || 0) < 0) {
        toast({ title: "قيمة غير صالحة", description: `سعر المقاس '${sz.name}' لا يمكن أن يكون سالباً.`, variant: "destructive" })
        return
      }
      if (Number(sz.stock || 0) < 0) {
        toast({ title: "قيمة غير صالحة", description: `الكمية للمقاس '${sz.name}' لا يمكن أن تكون سالبة.`, variant: "destructive" })
        return
      }
    }

    try {
      setSaving(true)

      // Generate slug from Arabic name
      const slug = newProduct.name_ar
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^\u0600-\u06FFa-z0-9-]/g, "")

      // Create product
      const product = await createProduct({
        name_ar: newProduct.name_ar,
        name_en: newProduct.name_en || newProduct.name_ar,
        slug: `${slug}-${Date.now()}`,
        description_ar: newProduct.description_ar,
        description_en: newProduct.description_en || newProduct.description_ar,
        category_id: newProduct.category_id,
        base_price: newProduct.base_price,
        is_featured: newProduct.is_featured,
        is_active: true,
        sku: `PRD-${Date.now()}`,
        inventory_quantity: newProduct.sizes.reduce((sum, s) => sum + s.stock, 0),
      })

      console.log("[v0] Product created")

      // Upload images
      if (newProduct.images.length > 0) {
        const imageUrls = await uploadMultipleImages(newProduct.images, product.id)
        console.log("[v0] Images uploaded")

        // Create image records
        for (let i = 0; i < imageUrls.length; i++) {
          await createProductImage({
            product_id: product.id,
            image_url: imageUrls[i],
            alt_text_ar: newProduct.name_ar,
            alt_text_en: newProduct.name_en || newProduct.name_ar,
            display_order: i,
            is_primary: i === 0,
          })
        }
      }

      // Create variants (combinations of colors and sizes)
      for (const color of newProduct.colors) {
        for (const size of newProduct.sizes) {
          const variantPrice = size.price > 0 ? size.price : newProduct.base_price
          const sku = makeVariantSKU(product.sku, size.name, color.name)
          try {
            await createProductVariant({
              product_id: product.id,
              name_ar: `${size.name} - ${color.name}`,
              name_en: `${size.name} - ${color.name}`,
              size: size.name,
              color: color.name,
              color_hex: color.hex,
              price: variantPrice,
              inventory_quantity: size.stock,
              sku,
            })
          } catch (err: any) {
            // Log and continue creating other variants; duplicate SKUs should not block product creation
            console.warn("[v0] Skipping variant due to error:", err?.message ?? err)
            try {
              toast({ title: "ملاحظة", description: `لم يتم إنشاء متغير (${size.name} - ${color.name}): ${err?.message ?? "خطأ"}` })
            } catch (e) {
              /* ignore toast errors */
            }
            continue
          }
        }
      }

      toast({
        title: "تم الحفظ",
        description: "تم إضافة المنتج بنجاح",
      })

      setShowAddDialog(false)
      resetNewProduct()
      // Ensure newly created product appears immediately: go to page 1 and force reload
      setPage(1)
      try {
        const productsResultReload = await getAllProducts(1, perPage, true)
        setProducts(productsResultReload.data)
        setTotalProducts(productsResultReload.total ?? null)
      } catch (e) {
        console.error("[v0] Error reloading products after create:", e)
      }
    } catch (error) {
      console.error("[v0] Error saving product:", error)
      toast({
        title: "خطأ",
        description: "فشل حفظ المنتج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleSaveEditProduct = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!editingProduct) return

    // Validation: base_price must be >= 1
    if (Number(editingProduct.base_price || 0) < 1) {
      toast({ title: "قيمة غير صالحة", description: "يجب أن يكون السعر الأساسي 1 ج.م أو أكثر.", variant: "destructive" })
      return
    }

    // Validation: product variants price/quantity must be >= 0
    for (const v of editingProduct.product_variants || []) {
      if (Number(v.price || 0) < 0) {
        toast({ title: "قيمة غير صالحة", description: `سعر المتغير '${v.name_ar || v.name_en || v.id}' لا يمكن أن يكون سالباً.`, variant: "destructive" })
        return
      }
      if (Number(v.inventory_quantity || 0) < 0) {
        toast({ title: "قيمة غير صالحة", description: `كمية المتغير '${v.name_ar || v.name_en || v.id}' لا يمكن أن تكون سالبة.`, variant: "destructive" })
        return
      }
    }

    try {
      setSaving(true)

      await updateProduct(editingProduct.id, {
        name_ar: editingProduct.name_ar,
        name_en: editingProduct.name_en,
        description_ar: editingProduct.description_ar || null,
        description_en: editingProduct.description_en || null,
        base_price: editingProduct.base_price,
        category_id: editingProduct.category_id || null,
        is_featured: editingProduct.is_featured,
        is_active: editingProduct.is_active,
        shipping_type: editingProduct.shipping_type || null,
        shipping_cost: editingProduct.shipping_cost || null,
      })

      toast({
        title: "تم التحديث",
        description: "تم تحديث المنتج بنجاح",
      })

      setShowEditDialog(false)
      // Refresh current page with cache-buster so edits appear immediately
      try {
        const productsResultReload = await getAllProducts(page, perPage, true)
        setProducts(productsResultReload.data)
        setTotalProducts(productsResultReload.total ?? null)
      } catch (e) {
        console.error("[v0] Error reloading products after edit:", e)
      }
    } catch (error) {
      console.error("[v0] Error updating product:", error)
      toast({
        title: "خطأ",
        description: "فشل تحديث المنتج. يرجى المحاولة مرة أخرى.",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleAddProductImages = async (files: FileList | null) => {
    if (!files || !editingProduct) return

    try {
      setSaving(true)

      const arr = Array.from(files)
      const maxAllowed = 10
      const existing = editingProduct.product_images?.length || 0
      const remaining = Math.max(0, maxAllowed - existing)

      if (remaining === 0) {
        try {
          toast({ title: "مسموح 10 صور فقط", description: "لا يمكنك إضافة المزيد من الصور.", variant: "destructive" })
        } catch (e) {
          /* ignore */
        }
        return
      }

      const toUpload = arr.slice(0, remaining)
      if (toUpload.length === 0) return

      const imageUrls = await uploadMultipleImages(toUpload, editingProduct.id)

      for (let i = 0; i < imageUrls.length; i++) {
        await createProductImage({
          product_id: editingProduct.id,
          image_url: imageUrls[i],
          alt_text_ar: editingProduct.name_ar,
          alt_text_en: editingProduct.name_en,
          display_order: editingProduct.product_images.length + i,
          is_primary: editingProduct.product_images.length === 0 && i === 0,
        })
      }

      if (toUpload.length < arr.length) {
        try {
          toast({ title: "تم الاقتصار على 10 صور", description: `تم قبول ${toUpload.length} صورة فقط (الحد الأقصى 10).` })
        } catch (e) {
          /* ignore */
        }
      } else {
        toast({ title: "تم الرفع", description: "تم رفع الصور بنجاح" })
      }

      // Refresh current page (cache-busted) and update editing product
      try {
        const productsResultReload = await getAllProducts(page, perPage, true)
        setProducts(productsResultReload.data)
        setTotalProducts(productsResultReload.total ?? null)
        const updated = productsResultReload.data.find((p) => p.id === editingProduct.id)
        if (updated) setEditingProduct(updated)
      } catch (e) {
        console.error("[v0] Error reloading products after image upload:", e)
      }
    } catch (error) {
      console.error("[v0] Error uploading images:", error)
      toast({ title: "خطأ", description: "فشل رفع الصور", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProductImage = async (imageId: string) => {
    if (!editingProduct || !confirm("هل أنت متأكد من حذف هذه الصورة؟")) return

    const image = editingProduct.product_images.find((img) => img.id === imageId)
    if (!image) return

    // Optimistic UI: remove image locally immediately
    const prevProductImages = editingProduct.product_images
    const newImages = prevProductImages.filter((img) => img.id !== imageId)
    setEditingProduct({ ...editingProduct, product_images: newImages })
    setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, product_images: newImages } : p)))

    try {
      setSaving(true)

      // First delete from storage via server API
      try {
        const res = await fetch("/api/admin/storage/delete", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ imageUrl: image.image_url }),
        })

        if (!res.ok) {
          const body = await res.text().catch(() => null)
          throw new Error(body || "Failed to delete image from storage")
        }
      } catch (storageErr) {
        // If storage deletion fails, revert optimistic update and throw
        setEditingProduct((p) => (p ? { ...p, product_images: prevProductImages } : p))
        setProducts((prev) => prev.map((p) => (p.id === editingProduct.id ? { ...p, product_images: prevProductImages } : p)))
        throw storageErr
      }

      // Then delete DB record
      await deleteProductImage(imageId)

      toast({ title: "تم الحذف", description: "تم حذف الصورة بنجاح" })

      // Refresh product list counts/totals (non-blocking)
      try {
        const productsResultReload = await getAllProducts(page, perPage, true)
        setProducts(productsResultReload.data)
        setTotalProducts(productsResultReload.total ?? null)
        const updated = productsResultReload.data.find((p) => p.id === editingProduct.id)
        if (updated) setEditingProduct(updated)
      } catch (e) {
        console.error("[v0] Error reloading products after deleting image:", e)
      }
    } catch (error) {
      console.error("[v0] Error deleting image:", error)
      toast({ title: "خطأ", description: "فشل حذف الصورة", variant: "destructive" })
    } finally {
      setSaving(false)
    }
  }

  const handleUpdateVariant = async (variantId: string, updates: any) => {
    if (!editingProduct) return

    // validate updates do not contain negative numbers for price or inventory
    if (updates && typeof updates === 'object') {
      if (typeof updates.price !== 'undefined' && Number(updates.price) < 0) {
        toast({ title: 'قيمة غير صالحة', description: 'السعر لا يمكن أن يكون سالباً.', variant: 'destructive' })
        return
      }
      if (typeof updates.inventory_quantity !== 'undefined' && Number(updates.inventory_quantity) < 0) {
        toast({ title: 'قيمة غير صالحة', description: 'الكمية لا يمكن أن تكون سالبة.', variant: 'destructive' })
        return
      }
    }

    try {
      await updateProductVariant(variantId, updates)

      // Refresh current page (cache-busted) and update editing product
      try {
        const productsResultReload = await getAllProducts(page, perPage, true)
        setProducts(productsResultReload.data)
        setTotalProducts(productsResultReload.total ?? null)
        const updated = productsResultReload.data.find((p) => p.id === editingProduct.id)
        if (updated) setEditingProduct(updated)
      } catch (e) {
        console.error("[v0] Error reloading products after variant update:", e)
      }
    } catch (error) {
      console.error("[v0] Error updating variant:", error)
      toast({
        title: "خطأ",
        description: "فشل تحديث المتغير",
        variant: "destructive",
      })
    }
  }

  const handleDeleteVariant = async (variantId: string) => {
    if (!editingProduct || !confirm("هل أنت متأكد من حذف هذا المتغير؟")) return

    try {
      await deleteProductVariant(variantId)
      toast({
        title: "تم الحذف",
        description: "تم حذف المتغير بنجاح",
      })

      // Refresh current page (cache-busted) and update editing product
      try {
        const productsResultReload = await getAllProducts(page, perPage, true)
        setProducts(productsResultReload.data)
        setTotalProducts(productsResultReload.total ?? null)
        const updated = productsResultReload.data.find((p) => p.id === editingProduct.id)
        if (updated) setEditingProduct(updated)
      } catch (e) {
        console.error("[v0] Error reloading products after variant delete:", e)
      }
    } catch (error) {
      console.error("[v0] Error deleting variant:", error)
      toast({
        title: "خطأ",
        description: "فشل حذف المتغير",
        variant: "destructive",
      })
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="p-4 md:p-8">
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground mb-2">إدارة المنتجات</h1>
          <p className="text-muted-foreground text-sm md:text-base">عرض وإدارة جميع المنتجات في المتجر</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2 w-full sm:w-auto" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          إضافة منتج جديد
        </Button>
      </div>

      <Card className="border-2 border-border mb-6">
        <CardContent className="p-4 md:p-6">
          <div className="relative">
            <Search className="absolute right-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن منتج..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-10 text-base"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pagination controls */}
      <div className="flex items-center justify-between mb-4">
        <div className="text-sm text-muted-foreground">
          {totalProducts !== null && (
            <span>
              {`عرض ${(page - 1) * perPage + 1} - ${Math.min((page - 1) * perPage + products.length, totalProducts)} من ${totalProducts}`}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page <= 1}>
            السابق
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={totalProducts !== null && page * perPage >= totalProducts}
          >
            التالي
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-2 border-border hover:border-primary/50 transition-all">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="relative w-full sm:w-32 h-48 sm:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {product.product_images[0]?.image_url ? (
                    <Image
                      src={product.product_images[0].image_url || "/placeholder.svg"}
                      alt={product.name_ar}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{product.name_ar}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {product.category?.name_ar || "غير محدد"}
                        </Badge>
                        {product.is_featured && (
                          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">مميز</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-2xl font-bold text-primary">{product.base_price > 0 ? `${product.base_price} ج.م` : '-'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                    {product.description_ar}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mb-2">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">الصور:</span> {product.product_images.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">المتغيرات:</span> {product.product_variants.length}
                    </div>
                  </div>
                  
                  {/* ملخص المقاسات */}
                  <div className="mb-4 bg-muted/30 p-2 rounded-md">
                    <div className="text-xs font-semibold mb-1 text-muted-foreground">المقاسات المتاحة:</div>
                    <div className="flex flex-wrap gap-2 text-xs">
                      {product.product_variants.length > 0 ? (
                        Object.entries(
                          product.product_variants.reduce((acc, v) => {
                            const s = v.size || "عام";
                            acc[s] = (acc[s] || 0) + v.inventory_quantity;
                            return acc;
                          }, {} as Record<string, number>)
                        ).map(([size, qty], idx) => (
                          <Badge key={idx} variant="default" className="font-normal">
                            {size} ({qty})
                          </Badge>
                        ))
                      ) : (
                        <span className="text-muted-foreground">لا توجد مقاسات</span>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent flex-1 sm:flex-none">
                      <Link href={`/product/${product.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                        معاينة
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent flex-1 sm:flex-none"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent flex-1 sm:flex-none"
                      onClick={() => handleDeleteProduct(product.id, product.name_ar)}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div className="text-center py-20">
          <Search className="h-24 w-24 mx-auto mb-6 text-muted-foreground" />
          <h3 className="text-2xl font-bold mb-4 text-foreground">لا توجد نتائج</h3>
          <p className="text-muted-foreground">لم يتم العثور على منتجات تطابق بحثك</p>
        </div>
      )}

      {/* Dialog: إضافة منتج */}
      <Dialog
        open={showAddDialog}
        onOpenChange={(o) => {
          setShowAddDialog(o)
          if (!o) resetNewProduct()
        }}
      >
        <DialogContent className="max-w-3xl w-[95%] md:w-full max-h-[90vh] overflow-y-auto p-4 md:p-6">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold">إضافة منتج جديد</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">أدخل تفاصيل المنتج الجديد</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNewProduct} className="space-y-6">
            {/* أساسيات */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_ar">اسم المنتج (عربي) *</Label>
                <Input
                  id="name_ar"
                  value={newProduct.name_ar}
                  onChange={(e) => setNewProduct({ ...newProduct, name_ar: e.target.value })}
                  placeholder="مثال: عباية كلاسيكية"
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_en">اسم المنتج (إنجليزي)</Label>
                <Input
                  id="name_en"
                  value={newProduct.name_en}
                  onChange={(e) => setNewProduct({ ...newProduct, name_en: e.target.value })}
                  placeholder="Example: Classic Abaya"
                />
              </div>
              <div>
                <Label htmlFor="category">الفئة *</Label>
                <Select
                  value={newProduct.category_id}
                  onValueChange={(v) => setNewProduct({ ...newProduct, category_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="اختر الفئة" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name_ar}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground mt-1">اختر الفئة الرئيسية للمنتج</p>
              </div>
              <div>
                <Label htmlFor="price">السعر الأساسي (ج.م) *</Label>
                <Input
                  id="price"
                  type="number"
                  value={newProduct.base_price === 0 ? "" : String(newProduct.base_price)}
                  min={1}
                  onChange={(e) => setNewProduct({ ...newProduct, base_price: Number(e.target.value) })}
                  placeholder="450"
                  required
                />
              </div>
            </div>

            {/* الشحن */}
            <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
              <Label className="text-base font-semibold text-blue-900">خيارات الشحن</Label>
              <div className="space-y-3">
                <div className="flex items-center space-x-3 space-x-reverse">
                  <input
                    type="radio"
                    id="shipping-free"
                    name="shipping"
                    value="free"
                    checked={newProduct.shipping_type === "free"}
                    onChange={() => setNewProduct({ ...newProduct, shipping_type: "free", shipping_cost: 0 })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Label htmlFor="shipping-free" className="cursor-pointer flex items-center">
                    <span className="text-green-600 font-semibold">✓ شحن مجاني</span>
                  </Label>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="radio"
                    id="shipping-paid"
                    name="shipping"
                    value="paid"
                    checked={newProduct.shipping_type === "paid"}
                    onChange={() => setNewProduct({ ...newProduct, shipping_type: "paid" })}
                    className="w-4 h-4 cursor-pointer"
                  />
                  <Label htmlFor="shipping-paid" className="cursor-pointer">
                    شحن برسوم
                  </Label>
                  {newProduct.shipping_type === "paid" && (
                    <div className="flex-1">
                      
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Checkbox
                id="featured"
                checked={newProduct.is_featured}
                onCheckedChange={(checked) => setNewProduct({ ...newProduct, is_featured: checked as boolean })}
              />
              <Label htmlFor="featured" className="cursor-pointer">
                منتج مميز
              </Label>
            </div>

            <div>
              <Label htmlFor="description_ar">الوصف (عربي) *</Label>
              <Textarea
                id="description_ar"
                value={newProduct.description_ar}
                onChange={(e) => setNewProduct({ ...newProduct, description_ar: e.target.value })}
                placeholder="وصف المنتج..."
                rows={3}
                required
              />
            </div>

            <div>
              <Label htmlFor="description_en">الوصف (إنجليزي)</Label>
              <Textarea
                id="description_en"
                value={newProduct.description_en}
                onChange={(e) => setNewProduct({ ...newProduct, description_en: e.target.value })}
                placeholder="Product description..."
                rows={2}
              />
            </div>

            {/* الصور */}
            <div>
              <Label className="block mb-2">صور المنتج</Label>
              <Input
                type="file"
                accept="image/*"
                multiple
                onChange={(e) => onImagesChange(e.target.files)}
                disabled={newProduct.images.length >= 10}
              />
              <p className="text-xs text-muted-foreground mt-1">
                يمكنك رفع حتى 10 صور فقط. الصورة الأولى ستكون الصورة الرئيسية.
              </p>
              {newProduct.images.length > 0 && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
                  {newProduct.images.map((file, i) => (
                    <div key={i} className="relative w-full aspect-square rounded overflow-hidden border">
                      <img
                        src={URL.createObjectURL(file) || "/placeholder.svg"}
                        alt={`preview-${i}`}
                        className="w-full h-full object-cover"
                      />
                      {i === 0 && (
                        <div className="absolute top-1 right-1 bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded">
                          رئيسية
                        </div>
                      )}
                      <button
                        type="button"
                        className="absolute top-1 left-1 bg-background/80 text-foreground text-xs px-2 py-0.5 rounded hover:bg-background/90"
                        onClick={() => removeImage(i)}
                      >
                        حذف
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* الألوان */}
            <div>
              <Label className="block mb-2">الألوان المتاحة</Label>
              <div className="space-y-2">
                {newProduct.colors.map((c, idx) => (
                  <div key={idx} className="flex items-center gap-2">
                    <Input
                      placeholder="اسم اللون (مثال: أسود)"
                      value={c.name}
                      onChange={(e) => updateColor(idx, "name", e.target.value)}
                      className="flex-1"
                    />
                    <Input
                      type="color"
                      value={c.hex}
                      onChange={(e) => updateColor(idx, "hex", e.target.value)}
                      className="w-14 h-10 p-1"
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeColor(idx)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" className="mt-2 bg-transparent" onClick={addColor}>
                + إضافة لون
              </Button>
            </div>

            {/* المقاسات وأسعارها */}
            <div>
              <Label className="block mb-2">المقاسات وأسعارها والكميات </Label>
              <div className="space-y-3">
                {newProduct.sizes.map((s, idx) => (
                  <div key={idx} className="flex flex-col sm:grid sm:grid-cols-4 gap-2 items-start sm:items-center border p-3 rounded-md sm:border-none sm:p-0">
                    <div className="w-full">
                      <Label className="sm:hidden text-xs mb-1 block">المقاس</Label>
                      <Input
                        placeholder="المقاس"
                        value={s.name}
                        onChange={(e) => updateSize(idx, "name", e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <Label className="sm:hidden text-xs mb-1 block">السعر</Label>
                      <Input
                        type="number"
                        placeholder="السعر"
                        min={0}
                        value={s.price === 0 ? "" : String(s.price)}
                        onChange={(e) => updateSize(idx, "price", e.target.value)}
                      />
                    </div>
                    <div className="w-full">
                      <Label className="sm:hidden text-xs mb-1 block">الكمية</Label>
                      <Input
                        type="number"
                        placeholder="0"
                        min={0}
                        value={s.stock === 0 ? "" : String(s.stock)}
                        onChange={(e) => updateSize(idx, "stock", e.target.value)}
                      />
                    </div>
                    
                    <Button type="button" variant="outline" size="icon" onClick={() => removeSize(idx)} className="self-end sm:self-auto mt-2 sm:mt-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button type="button" variant="outline" className="mt-2 bg-transparent" onClick={addSize}>
                + إضافة مقاس
              </Button>
              <p className="text-xs text-muted-foreground mt-1">
                اتركي السعر 0 لاستخدام السعر الأساسي. للمقاسات الخاصة ضعي السعر المختلف.
              </p>
            </div>

            <div className="flex flex-col-reverse sm:flex-row gap-4 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  resetNewProduct()
                }}
                disabled={saving}
                className="w-full sm:w-auto"
              >
                إلغاء
              </Button>
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ المنتج"
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: تعديل المنتج */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-3xl w-full max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl md:text-2xl font-bold">تعديل المنتج</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">تعديل تفاصيل المنتج "{editingProduct?.name_ar}"</DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic" className="text-xs sm:text-sm px-1">المعلومات</TabsTrigger>
                <TabsTrigger value="images" className="text-xs sm:text-sm px-1">الصور</TabsTrigger>
                <TabsTrigger value="variants" className="text-xs sm:text-sm px-1">المتغيرات</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <form onSubmit={handleSaveEditProduct} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-name_ar">اسم المنتج (عربي) *</Label>
                      <Input
                        id="edit-name_ar"
                        value={editingProduct.name_ar}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name_ar: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="edit-name_en">اسم المنتج (إنجليزي)</Label>
                      <Input
                        id="edit-name_en"
                        value={editingProduct.name_en}
                        onChange={(e) => setEditingProduct({ ...editingProduct, name_en: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="edit-category">الفئة *</Label>
                      <Select
                        value={editingProduct.category_id || undefined}
                        onValueChange={(v) => setEditingProduct({ ...editingProduct, category_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((cat) => (
                            <SelectItem key={cat.id} value={cat.id}>
                              {cat.name_ar}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="edit-price">السعر الأساسي (ج.م) *</Label>
                      <Input
                        id="edit-price"
                        type="number"
                        value={editingProduct.base_price === 0 ? "" : String(editingProduct.base_price)}
                        min={1}
                        onChange={(e) => setEditingProduct({ ...editingProduct, base_price: Number(e.target.value) })}
                        required
                      />
                    </div>
                  </div>

                  {/* خيارات الشحن */}
                  <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4 space-y-3">
                    <Label className="text-base font-semibold text-blue-900">خيارات الشحن</Label>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3 space-x-reverse">
                        <input
                          type="radio"
                          id="edit-shipping-free"
                          name="edit-shipping"
                          value="free"
                          checked={editingProduct.shipping_type === "free" || !editingProduct.shipping_type}
                          onChange={() => setEditingProduct({ ...editingProduct, shipping_type: "free", shipping_cost: 0 })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <Label htmlFor="edit-shipping-free" className="cursor-pointer flex items-center">
                          <span className="text-green-600 font-semibold">✓ شحن مجاني</span>
                        </Label>
                      </div>

                      <div className="flex items-center gap-3">
                        <input
                          type="radio"
                          id="edit-shipping-paid"
                          name="edit-shipping"
                          value="paid"
                          checked={editingProduct.shipping_type === "paid"}
                          onChange={() => setEditingProduct({ ...editingProduct, shipping_type: "paid" })}
                          className="w-4 h-4 cursor-pointer"
                        />
                        <Label htmlFor="edit-shipping-paid" className="cursor-pointer">
                          شحن برسوم
                        </Label>
                        {editingProduct.shipping_type === "paid" && (
                          <div className="flex-1">
                             
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4">
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="edit-featured"
                        checked={editingProduct.is_featured}
                        onCheckedChange={(checked) =>
                          setEditingProduct({ ...editingProduct, is_featured: checked as boolean })
                        }
                      />
                      <Label htmlFor="edit-featured" className="cursor-pointer">
                        منتج مميز
                      </Label>
                    </div>
                    <div className="flex items-center space-x-2 space-x-reverse">
                      <Checkbox
                        id="edit-active"
                        checked={editingProduct.is_active}
                        onCheckedChange={(checked) =>
                          setEditingProduct({ ...editingProduct, is_active: checked as boolean })
                        }
                      />
                      <Label htmlFor="edit-active" className="cursor-pointer">
                        نشط
                      </Label>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="edit-description_ar">الوصف (عربي)</Label>
                    <Textarea
                      id="edit-description_ar"
                      value={editingProduct.description_ar || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description_ar: e.target.value })}
                      rows={4}
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description_en">الوصف (إنجليزي)</Label>
                    <Textarea
                      id="edit-description_en"
                      value={editingProduct.description_en || ""}
                      onChange={(e) => setEditingProduct({ ...editingProduct, description_en: e.target.value })}
                      rows={3}
                    />
                  </div>

                  <div className="flex flex-col-reverse sm:flex-row gap-4 pt-4 border-t">
                    <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving} className="w-full sm:w-auto">
                      إلغاء
                    </Button>
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90 w-full sm:w-auto" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري الحفظ...
                        </>
                      ) : (
                        "حفظ التعديلات"
                      )}
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 mt-4">
                <div>
                  <Label className="block mb-3">إضافة صور جديدة</Label>
                  <div className="flex flex-col sm:flex-row items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleAddProductImages(e.target.files)}
                      disabled={saving || editingProduct.product_images.length >= 10}
                      className="flex-1 w-full"
                    />
                    <Button type="button" disabled={saving || editingProduct.product_images.length >= 10} variant="outline" className="w-full sm:w-auto">
                      <Upload className="h-4 w-4 ml-2" />
                      رفع
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    يمكنك رفع حتى 10 صور فقط. الصورة الأولى ستكون الصورة الرئيسية.
                  </p>
                </div>

                <div>
                  <Label className="block mb-3">الصور الحالية ({editingProduct.product_images.length})</Label>
                  {editingProduct.product_images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                      {editingProduct.product_images.map((img) => (
                        <div key={img.id} className="relative group">
                          <div className="relative w-full aspect-square rounded-lg overflow-hidden border-2 border-border">
                            <Image
                              src={img.image_url || "/placeholder.svg"}
                              alt={img.alt_text_ar || ""}
                              fill
                              className="object-cover"
                            />
                            {img.is_primary && (
                              <div className="absolute top-2 right-2 bg-primary text-primary-foreground text-xs px-2 py-1 rounded">
                                رئيسية
                              </div>
                            )}
                          </div>
                          <Button
                            type="button"
                            variant="destructive"
                            size="sm"
                            className="absolute top-2 left-2 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => handleDeleteProductImage(img.id)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">لا توجد صور. قم بإضافة صور أعلاه.</p>
                    </div>
                  )}
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-4 mt-4">
                <div>
                  <Label className="block mb-3">المتغيرات الحالية ({editingProduct.product_variants.length})</Label>
                  {editingProduct.product_variants.length > 0 ? (
                    <div className="space-y-3">
                      {editingProduct.product_variants.map((variant) => (
                        <div key={variant.id} className="border rounded-lg p-3 mb-3">
                          <div className="flex items-start gap-3 mb-2">
                            <div 
                              className="w-10 h-10 rounded border-2 flex-shrink-0"
                              style={{ backgroundColor: variant.color_hex || '#000' }}
                            ></div>

                            <div className="flex flex-col">
                              <span className="text-sm font-semibold">{variant.color || "لون"} - {variant.size}</span>
                              <span className="text-xs text-muted-foreground leading-snug">{variant.sku || "No SKU"}</span>
                            </div>
                          </div>

                          <div className="grid grid-cols-3 md:grid-cols-4 gap-3 items-center">
                            {/* Price */}
                            <Input 
                              type="number" 
                              min={0}
                              value={variant.price === 0 ? "" : String(variant.price)} 
                              onChange={(e) => handleUpdateVariant(variant.id, { price: Number(e.target.value) })} 
                              placeholder="السعر"
                            />

                            {/* Quantity */}
                            <Input 
                              type="number" 
                              min={0}
                              value={variant.inventory_quantity === 0 ? "" : String(variant.inventory_quantity)} 
                              onChange={(e) => handleUpdateVariant(variant.id, { inventory_quantity: Number(e.target.value) })}
                              placeholder="الكمية"
                            />

                            {/* Size */}
                            <Input 
                              type="text" 
                              value={variant.size || ""} 
                              onChange={(e) => handleUpdateVariant(variant.id, { size: e.target.value })}
                              placeholder="المقاس"
                            />

                            {/* Delete */}
                            <Button 
                              variant="ghost" 
                              className="text-red-500 justify-self-end" 
                              onClick={() => handleDeleteVariant(variant.id)}
                            >
                              <Trash2 className="w-5 h-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-12 border-2 border-dashed rounded-lg">
                      <p className="text-muted-foreground">لا توجد متغيرات لهذا المنتج.</p>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      {/* Featured Products Section */}
      <h2 className="text-xl md:text-2xl font-bold mb-4">العروض الرئيسية</h2>
      <div className="grid gap-6 mb-8">
        {featuredProducts.map((product) => (
          <Card key={product.id} className="border-2 border-border hover:border-primary/50 transition-all">
            <CardContent className="p-4 md:p-6">
              <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
                <div className="relative w-full sm:w-32 h-48 sm:h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {product.product_images[0]?.image_url ? (
                    <Image
                      src={product.product_images[0].image_url || "/placeholder.svg"}
                      alt={product.name_ar}
                      fill
                      className="object-cover"
                      sizes="(max-width: 768px) 100vw, 128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <div className="flex-1 w-full">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-3 gap-2">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{product.name_ar}</h3>
                      <div className="flex flex-wrap gap-2 mb-2">
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {product.category?.name_ar || "غير محدد"}
                        </Badge>
                        {product.is_featured && (
                          <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20">مميز</Badge>
                        )}
                      </div>
                    </div>
                    <div className="text-right sm:text-left">
                      <p className="text-2xl font-bold text-primary">{product.base_price > 0 ? `${product.base_price} ج.م` : '-'}</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                    {product.description_ar}
                  </p>
                  <div className="flex flex-wrap items-center gap-4 mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">الصور:</span> {product.product_images.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">المتغيرات:</span> {product.product_variants.length}
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent flex-1 sm:flex-none">
                      <Link href={`/product/${product.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                        معاينة
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent flex-1 sm:flex-none"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent flex-1 sm:flex-none"
                      onClick={() => handleDeleteProduct(product.id, product.name_ar)}
                    >
                      <Trash2 className="h-4 w-4" />
                      حذف
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {featuredProducts.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold mb-4 text-foreground">لا توجد عروض رئيسية</h3>
          <p className="text-muted-foreground">لا توجد منتجات مميزة لعرضها هنا</p>
        </div>
      )}
    </div>
  )
}
