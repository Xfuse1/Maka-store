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
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const [productsData, categoriesData] = await Promise.all([getAllProducts(), getAllCategories()])
      setProducts(productsData)
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

  const onImagesChange = (files: FileList | null) => {
    if (!files) return
    const arr = Array.from(files)
    setNewProduct((p) => ({ ...p, images: [...p.images, ...arr] }))
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
      await loadData()
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

      console.log("[v0] Product created:", product)

      // Upload images
      if (newProduct.images.length > 0) {
        const imageUrls = await uploadMultipleImages(newProduct.images, product.id)
        console.log("[v0] Images uploaded:", imageUrls)

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
          await createProductVariant({
            product_id: product.id,
            name_ar: `${size.name} - ${color.name}`,
            name_en: `${size.name} - ${color.name}`,
            size: size.name,
            color: color.name,
            color_hex: color.hex,
            price: variantPrice,
            inventory_quantity: size.stock,
            sku: `${product.sku}-${size.name}-${color.name}`,
          })
        }
      }

      toast({
        title: "تم الحفظ",
        description: "تم إضافة المنتج بنجاح",
      })

      setShowAddDialog(false)
      resetNewProduct()
      await loadData()
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
      await loadData()
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
      const imageUrls = await uploadMultipleImages(Array.from(files), editingProduct.id)

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

      toast({
        title: "تم الرفع",
        description: "تم رفع الصور بنجاح",
      })

      await loadData()
      // Refresh editing product
      const updatedProducts = await getAllProducts()
      const updated = updatedProducts.find((p) => p.id === editingProduct.id)
      if (updated) setEditingProduct(updated)
    } catch (error) {
      console.error("[v0] Error uploading images:", error)
      toast({
        title: "خطأ",
        description: "فشل رفع الصور",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteProductImage = async (imageId: string) => {
    if (!editingProduct || !confirm("هل أنت متأكد من حذف هذه الصورة؟")) return

    try {
      await deleteProductImage(imageId)
      toast({
        title: "تم الحذف",
        description: "تم حذف الصورة بنجاح",
      })

      await loadData()
      const updatedProducts = await getAllProducts()
      const updated = updatedProducts.find((p) => p.id === editingProduct.id)
      if (updated) setEditingProduct(updated)
    } catch (error) {
      console.error("[v0] Error deleting image:", error)
      toast({
        title: "خطأ",
        description: "فشل حذف الصورة",
        variant: "destructive",
      })
    }
  }

  const handleUpdateVariant = async (variantId: string, updates: any) => {
    if (!editingProduct) return

    try {
      await updateProductVariant(variantId, updates)

      const updatedProducts = await getAllProducts()
      const updated = updatedProducts.find((p) => p.id === editingProduct.id)
      if (updated) setEditingProduct(updated)
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

      const updatedProducts = await getAllProducts()
      const updated = updatedProducts.find((p) => p.id === editingProduct.id)
      if (updated) setEditingProduct(updated)
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
    <div className="p-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة المنتجات</h1>
          <p className="text-muted-foreground text-base">عرض وإدارة جميع المنتجات في المتجر</p>
        </div>
        <Button className="bg-primary hover:bg-primary/90 gap-2" onClick={() => setShowAddDialog(true)}>
          <Plus className="h-4 w-4" />
          إضافة منتج جديد
        </Button>
      </div>

      <Card className="border-2 border-border mb-6">
        <CardContent className="p-6">
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

      <div className="grid gap-6">
        {filteredProducts.map((product) => (
          <Card key={product.id} className="border-2 border-border hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {product.product_images[0]?.image_url ? (
                    <Image
                      src={product.product_images[0].image_url || "/placeholder.svg"}
                      alt={product.name_ar}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{product.name_ar}</h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">
                        {product.category?.name_ar || "غير محدد"}
                      </Badge>
                      {product.is_featured && (
                        <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 mr-2">مميز</Badge>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-primary">{product.base_price} ج.م</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                    {product.description_ar}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">الصور:</span> {product.product_images.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">المتغيرات:</span> {product.product_variants.length}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Link href={`/product/${product.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                        معاينة
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
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
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">إضافة منتج جديد</DialogTitle>
            <DialogDescription>أدخل تفاصيل المنتج الجديد</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSaveNewProduct} className="space-y-6">
            {/* أساسيات */}
            <div className="grid md:grid-cols-2 gap-4">
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
                  value={newProduct.base_price}
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
                      <Input
                        type="number"
                        value={newProduct.shipping_cost}
                        onChange={(e) => setNewProduct({ ...newProduct, shipping_cost: Number(e.target.value) })}
                        placeholder="أدخل سعر الشحن (ج.م)"
                        min="0"
                        step="0.01"
                        className="h-9"
                      />
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
              <Input type="file" accept="image/*" multiple onChange={(e) => onImagesChange(e.target.files)} />
              <p className="text-xs text-muted-foreground mt-1">
                يمكنك رفع عدد غير محدود من الصور. الصورة الأولى ستكون الصورة الرئيسية.
              </p>
              {newProduct.images.length > 0 && (
                <div className="grid grid-cols-3 md:grid-cols-4 gap-3 mt-3">
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
              <Label className="block mb-2">المقاسات وأسعارها والكميات</Label>
              <div className="space-y-2">
                {newProduct.sizes.map((s, idx) => (
                  <div key={idx} className="grid grid-cols-4 gap-2 items-center">
                    <Input
                      placeholder="المقاس"
                      value={s.name}
                      onChange={(e) => updateSize(idx, "name", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="السعر"
                      value={s.price}
                      onChange={(e) => updateSize(idx, "price", e.target.value)}
                    />
                    <Input
                      type="number"
                      placeholder="الكمية"
                      value={s.stock}
                      onChange={(e) => updateSize(idx, "stock", e.target.value)}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => removeSize(idx)}>
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

            <div className="flex gap-4 pt-2">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ المنتج"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowAddDialog(false)
                  resetNewProduct()
                }}
                disabled={saving}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: تعديل المنتج */}
      <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">تعديل المنتج</DialogTitle>
            <DialogDescription>تعديل تفاصيل المنتج "{editingProduct?.name_ar}"</DialogDescription>
          </DialogHeader>

          {editingProduct && (
            <Tabs defaultValue="basic" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="basic">المعلومات الأساسية</TabsTrigger>
                <TabsTrigger value="images">الصور ({editingProduct.product_images.length})</TabsTrigger>
                <TabsTrigger value="variants">المتغيرات ({editingProduct.product_variants.length})</TabsTrigger>
              </TabsList>

              <TabsContent value="basic" className="space-y-4 mt-4">
                <form onSubmit={handleSaveEditProduct} className="space-y-4">
                  <div className="grid md:grid-cols-2 gap-4">
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

                  <div className="grid md:grid-cols-2 gap-4">
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
                        value={editingProduct.base_price}
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
                            <Input
                              type="number"
                              value={editingProduct.shipping_cost || 0}
                              onChange={(e) => setEditingProduct({ ...editingProduct, shipping_cost: Number(e.target.value) })}
                              placeholder="أدخل سعر الشحن (ج.م)"
                              min="0"
                              step="0.01"
                              className="h-9"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
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

                  <div className="flex gap-4 pt-4 border-t">
                    <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
                      {saving ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin ml-2" />
                          جاري الحفظ...
                        </>
                      ) : (
                        "حفظ التعديلات"
                      )}
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowEditDialog(false)} disabled={saving}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </TabsContent>

              <TabsContent value="images" className="space-y-4 mt-4">
                <div>
                  <Label className="block mb-3">إضافة صور جديدة</Label>
                  <div className="flex items-center gap-3">
                    <Input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleAddProductImages(e.target.files)}
                      disabled={saving}
                      className="flex-1"
                    />
                    <Button type="button" disabled={saving} variant="outline">
                      <Upload className="h-4 w-4 ml-2" />
                      رفع
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    يمكنك رفع عدة صور دفعة واحدة. الصورة الأولى ستكون الصورة الرئيسية.
                  </p>
                </div>

                <div>
                  <Label className="block mb-3">الصور الحالية ({editingProduct.product_images.length})</Label>
                  {editingProduct.product_images.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
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
                        <Card key={variant.id} className="border-2">
                          <CardContent className="p-4">
                            <div className="grid md:grid-cols-5 gap-3 items-center">
                              <div className="flex items-center gap-2">
                                {variant.color_hex && (
                                  <div
                                    className="w-8 h-8 rounded border-2"
                                    style={{ backgroundColor: variant.color_hex }}
                                  />
                                )}
                                <div>
                                  <div className="font-medium text-sm">{variant.name_ar}</div>
                                  <div className="text-xs text-muted-foreground">{variant.sku || "N/A"}</div>
                                </div>
                              </div>
                              <div>
                                <Label className="text-xs">السعر (ج.م)</Label>
                                <Input
                                  type="number"
                                  value={variant.price}
                                  onChange={(e) => handleUpdateVariant(variant.id, { price: Number(e.target.value) })}
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">المخزون</Label>
                                <Input
                                  type="number"
                                  value={variant.inventory_quantity}
                                  onChange={(e) =>
                                    handleUpdateVariant(variant.id, { inventory_quantity: Number(e.target.value) })
                                  }
                                  className="h-9"
                                />
                              </div>
                              <div>
                                <Label className="text-xs">المقاس</Label>
                                <Input
                                  value={variant.size || ""}
                                  onChange={(e) => handleUpdateVariant(variant.id, { size: e.target.value })}
                                  className="h-9"
                                />
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                                  onClick={() => handleDeleteVariant(variant.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        </Card>
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
      <h2 className="text-2xl font-bold mb-4">العروض الرئيسية</h2>
      <div className="grid gap-6 mb-8">
        {featuredProducts.map((product) => (
          <Card key={product.id} className="border-2 border-border hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="relative w-32 h-40 flex-shrink-0 rounded-lg overflow-hidden bg-muted">
                  {product.product_images[0]?.image_url ? (
                    <Image
                      src={product.product_images[0].image_url || "/placeholder.svg"}
                      alt={product.name_ar}
                      fill
                      className="object-cover"
                      sizes="128px"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      لا توجد صورة
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h3 className="text-xl font-bold text-foreground mb-2">{product.name_ar}</h3>
                      <Badge className="bg-primary/10 text-primary border-primary/20 mb-2">
                        {product.category?.name_ar || "غير محدد"}
                      </Badge>
                      {product.is_featured && (
                        <Badge className="bg-yellow-500/10 text-yellow-700 border-yellow-500/20 mr-2">مميز</Badge>
                      )}
                    </div>
                    <div className="text-left">
                      <p className="text-2xl font-bold text-primary">{product.base_price} ج.م</p>
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed line-clamp-2">
                    {product.description_ar}
                  </p>
                  <div className="flex items-center gap-4 mb-4">
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">الصور:</span> {product.product_images.length}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      <span className="font-medium">المتغيرات:</span> {product.product_variants.length}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Button asChild variant="outline" size="sm" className="gap-2 bg-transparent">
                      <Link href={`/product/${product.id}`} target="_blank">
                        <Eye className="h-4 w-4" />
                        معاينة
                      </Link>
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => handleEditProduct(product)}
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
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
