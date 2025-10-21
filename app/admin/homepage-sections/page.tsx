"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Eye, EyeOff, Edit, Trash2, Plus, GripVertical, Save, Loader2, ShoppingBag } from "lucide-react"
import {
  getAllSections,
  createSection,
  updateSection,
  deleteSection,
  toggleSectionVisibility,
  reorderSections,
  type HomepageSection,
} from "./actions"
import { createClient } from "@/lib/supabase/client"

// كومبوننت اختيار المنتجات
function ProductSelector({ 
  selectedProducts, 
  onProductsChange 
}: { 
  selectedProducts: string[]
  onProductsChange: (products: string[]) => void 
}) {
  const [products, setProducts] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProducts()
  }, [])

  async function loadProducts() {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("products")
      .select("id, name_ar, price, images")
      .order("created_at", { ascending: false })

    if (!error && data) {
      setProducts(data)
    }
    setLoading(false)
  }

  const toggleProduct = (productId: string) => {
    const isSelected = selectedProducts.includes(productId)
    if (isSelected) {
      onProductsChange(selectedProducts.filter(id => id !== productId))
    } else {
      onProductsChange([...selectedProducts, productId])
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <Label>اختر المنتجات المعروضة في هذا القسم</Label>
      <div className="border rounded-lg max-h-60 overflow-y-auto">
        {products.map((product) => (
          <div
            key={product.id}
            className={`flex items-center justify-between p-3 border-b cursor-pointer transition-colors ${
              selectedProducts.includes(product.id)
                ? "bg-primary/10 border-primary/20"
                : "hover:bg-muted/50"
            }`}
            onClick={() => toggleProduct(product.id)}
          >
            <div className="flex items-center gap-3">
              <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                selectedProducts.includes(product.id) 
                  ? "bg-primary border-primary" 
                  : "border-gray-300"
              }`}>
                {selectedProducts.includes(product.id) && (
                  <div className="w-2 h-2 bg-white rounded-sm" />
                )}
              </div>
              <div>
                <p className="font-medium text-sm">{product.name_ar}</p>
                <p className="text-xs text-muted-foreground">
                  {product.price ? `${product.price} ر.س` : "بدون سعر"}
                </p>
              </div>
            </div>
            <ShoppingBag className="h-4 w-4 text-muted-foreground" />
          </div>
        ))}
      </div>
      <p className="text-xs text-muted-foreground">
        {selectedProducts.length} منتج مختار - اضغط على المنتج لتحديده أو إلغاء تحديده
      </p>
    </div>
  )
}

export default function HomepageSectionsPage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [draggedItem, setDraggedItem] = useState<string | null>(null)
  const [productCounts, setProductCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    loadSections()
  }, [])

  async function loadSections() {
    setLoading(true)
    const result = await getAllSections()
    if (result.success && result.data) {
      setSections(result.data)
      await calculateProductCounts(result.data)
    }
    setLoading(false)
  }

  async function calculateProductCounts(sections: HomepageSection[]) {
    const counts: Record<string, number> = {}

    for (const section of sections) {
      if (section.section_type === "categories") {
        counts[section.id] = section.category_ids?.length || 9
      } else if (section.section_type === "reviews") {
        counts[section.id] = 3
      } else {
        // للأقسام التي تعتمد على المنتجات
        counts[section.id] = section.product_ids?.length || section.max_items || 8
      }
    }

    setProductCounts(counts)
  }

  function getSectionTypeLabel(type: string): string {
    const labels: Record<string, string> = {
      best_sellers: "الأكثر مبيعاً",
      new_arrivals: "المنتجات الجديدة",
      featured: "المنتجات المميزة",
      categories: "التصنيفات",
      reviews: "آراء العملاء",
      custom: "مخصص",
    }
    return labels[type] || type
  }

  function getSyncStatus(section: HomepageSection): { icon: string; label: string; color: string } {
    if (section.is_active) {
      return { icon: "🟢", label: "متزامن", color: "text-green-600" }
    }
    return { icon: "🔴", label: "غير نشط", color: "text-red-600" }
  }

  async function handleToggleVisibility(id: string, currentState: boolean) {
    setSaving(true)
    const result = await toggleSectionVisibility(id, !currentState)
    if (result.success) {
      await loadSections()
    }
    setSaving(false)
  }

  async function handleDelete(id: string) {
    if (!confirm("هل أنت متأكد من حذف هذا القسم؟")) return

    setSaving(true)
    const result = await deleteSection(id)
    if (result.success) {
      await loadSections()
    }
    setSaving(false)
  }

  async function handleSave(section: Partial<HomepageSection>) {
    setSaving(true)

    if (editingSection) {
      const result = await updateSection(editingSection.id, section)
      if (result.success) {
        await loadSections()
        setIsDialogOpen(false)
        setEditingSection(null)
      }
    } else {
      const result = await createSection(section)
      if (result.success) {
        await loadSections()
        setIsDialogOpen(false)
      }
    }

    setSaving(false)
  }

  function handleDragStart(id: string) {
    setDraggedItem(id)
  }

  function handleDragOver(e: React.DragEvent, id: string) {
    e.preventDefault()
    if (!draggedItem || draggedItem === id) return

    const draggedIndex = sections.findIndex((s) => s.id === draggedItem)
    const targetIndex = sections.findIndex((s) => s.id === id)

    if (draggedIndex === -1 || targetIndex === -1) return

    const newSections = [...sections]
    const [removed] = newSections.splice(draggedIndex, 1)
    newSections.splice(targetIndex, 0, removed)

    setSections(newSections)
  }

  async function handleDragEnd() {
    if (!draggedItem) return

    setSaving(true)
    const sectionIds = sections.map((s) => s.id)
    await reorderSections(sectionIds)
    setDraggedItem(null)
    setSaving(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-foreground">إدارة الصفحة الرئيسية</h1>
          <p className="text-muted-foreground mt-2">عرض وإدارة أقسام الصفحة الرئيسية</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingSection(null)} className="bg-primary hover:bg-primary/90">
              <Plus className="h-5 w-5 ml-2" />
              إضافة قسم جديد
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <SectionForm
              section={editingSection}
              onSave={handleSave}
              onCancel={() => {
                setIsDialogOpen(false)
                setEditingSection(null)
              }}
              saving={saving}
            />
          </DialogContent>
        </Dialog>
      </div>

      {saving && (
        <div className="mb-4 p-4 bg-blue-50 border border-blue-200 rounded-lg flex items-center gap-2">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
          <span className="text-blue-600">جاري الحفظ في قاعدة البيانات...</span>
        </div>
      )}

      <div className="grid gap-4">
        {sections.map((section) => {
          const syncStatus = getSyncStatus(section)
          const productCount = productCounts[section.id] || 0

          return (
            <Card
              key={section.id}
              draggable
              onDragStart={() => handleDragStart(section.id)}
              onDragOver={(e) => handleDragOver(e, section.id)}
              onDragEnd={handleDragEnd}
              className={`cursor-move transition-all ${draggedItem === section.id ? "opacity-50" : ""}`}
            >
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <GripVertical className="h-6 w-6 text-muted-foreground" />
                    <div>
                      <CardTitle className="text-2xl">
                        {section.name_ar || getSectionTypeLabel(section.section_type)}
                      </CardTitle>
                      <p className="text-sm text-muted-foreground mt-1">
                        {section.name_en || getSectionTypeLabel(section.section_type)} • {section.section_type}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className={syncStatus.color}>
                      {syncStatus.icon} {syncStatus.label}
                    </Badge>
                    <Badge variant={section.is_active ? "default" : "secondary"}>
                      {section.is_active ? "مرئي" : "مخفي"}
                    </Badge>
                    <Badge variant="outline">ترتيب {section.display_order + 1}</Badge>
                  </div>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="grid grid-cols-3 gap-4 flex-1">
                    <div>
                      <p className="text-sm text-muted-foreground">عدد العناصر المعروضة</p>
                      <p className="text-lg font-semibold">
                        {section.section_type === "categories"
                          ? `${productCount} تصنيفات`
                          : section.section_type === "reviews"
                            ? `${productCount} تقييمات`
                            : `${productCount} منتجات`}
                      </p>
                      {section.product_ids && section.product_ids.length > 0 && (
                        <p className="text-xs text-muted-foreground">
                          {section.product_ids.length} منتج محدد
                        </p>
                      )}
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">نوع العرض</p>
                      <p className="text-lg font-semibold">
                        {section.layout_type === "grid"
                          ? "شبكة"
                          : section.layout_type === "slider"
                            ? "سلايدر"
                            : "قائمة"}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">الحالة</p>
                      <p className="text-lg font-semibold">{section.is_active ? "👁️ مرئي على الموقع" : "🚫 مخفي"}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleToggleVisibility(section.id, section.is_active)}
                      disabled={saving}
                      title={section.is_active ? "إخفاء القسم" : "إظهار القسم"}
                    >
                      {section.is_active ? <Eye className="h-5 w-5" /> : <EyeOff className="h-5 w-5" />}
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => {
                        setEditingSection(section)
                        setIsDialogOpen(true)
                      }}
                      disabled={saving}
                      title="تعديل القسم"
                    >
                      <Edit className="h-5 w-5" />
                    </Button>

                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleDelete(section.id)}
                      disabled={saving}
                      title="حذف القسم"
                    >
                      <Trash2 className="h-5 w-5 text-red-500" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {sections.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-xl text-muted-foreground">لا توجد أقسام حالياً</p>
          <p className="text-sm text-muted-foreground mt-2">قم بإضافة قسم جديد للبدء في إدارة الصفحة الرئيسية</p>
        </Card>
      )}
    </div>
  )
}

function SectionForm({
  section,
  onSave,
  onCancel,
  saving,
}: {
  section: HomepageSection | null
  onSave: (section: Partial<HomepageSection>) => void
  onCancel: () => void
  saving: boolean
}) {
  const [formData, setFormData] = useState<Partial<HomepageSection>>(
    section || {
      name_ar: "",
      name_en: "",
      section_type: "custom",
      display_order: 0,
      is_active: true,
      max_items: 8,
      product_ids: [],
      layout_type: "grid",
      show_title: true,
      show_description: true,
      background_color: "background",
    },
  )

  const showProductSelector = ["best_sellers", "new_arrivals", "featured", "custom"].includes(
    formData.section_type || ""
  )

  return (
    <>
      <DialogHeader>
        <DialogTitle>{section ? "تعديل القسم" : "إضافة قسم جديد"}</DialogTitle>
        <DialogDescription>جميع التغييرات سيتم حفظها في قاعدة البيانات وتظهر فوراً على الموقع</DialogDescription>
      </DialogHeader>

      <div className="grid gap-4 py-4">
        <div className="grid gap-2">
          <Label htmlFor="name_ar">الاسم بالعربية</Label>
          <Input
            id="name_ar"
            value={formData.name_ar}
            onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
            placeholder="مثال: الأكثر مبيعاً"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="name_en">الاسم بالإنجليزية</Label>
          <Input
            id="name_en"
            value={formData.name_en || ""}
            onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
            placeholder="Example: Best Sellers"
          />
        </div>

        <div className="grid gap-2">
          <Label htmlFor="section_type">نوع القسم</Label>
          <Select
            value={formData.section_type}
            onValueChange={(value) => setFormData({ ...formData, section_type: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="best_sellers">الأكثر مبيعاً</SelectItem>
              <SelectItem value="new_arrivals">المنتجات الجديدة</SelectItem>
              <SelectItem value="featured">المنتجات المميزة</SelectItem>
              <SelectItem value="categories">التصنيفات</SelectItem>
              <SelectItem value="reviews">آراء العملاء</SelectItem>
              <SelectItem value="custom">مخصص</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {showProductSelector && (
          <ProductSelector
            selectedProducts={formData.product_ids || []}
            onProductsChange={(productIds) => setFormData({ ...formData, product_ids: productIds })}
          />
        )}

        <div className="grid grid-cols-2 gap-4">
          <div className="grid gap-2">
            <Label htmlFor="max_items">عدد العناصر</Label>
            <Input
              id="max_items"
              type="number"
              value={formData.max_items}
              onChange={(e) => setFormData({ ...formData, max_items: Number.parseInt(e.target.value) || 8 })}
              min="1"
              max="20"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="layout_type">نوع العرض</Label>
            <Select
              value={formData.layout_type}
              onValueChange={(value) => setFormData({ ...formData, layout_type: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="grid">شبكة</SelectItem>
                <SelectItem value="slider">سلايدر</SelectItem>
                <SelectItem value="list">قائمة</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid gap-2">
          <Label htmlFor="background_color">لون الخلفية</Label>
          <Select
            value={formData.background_color}
            onValueChange={(value) => setFormData({ ...formData, background_color: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="background">خلفية عادية</SelectItem>
              <SelectItem value="secondary">خلفية ثانوية</SelectItem>
              <SelectItem value="muted">خلفية خافتة</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center justify-between">
          <Label htmlFor="is_active">نشط</Label>
          <Switch
            id="is_active"
            checked={formData.is_active}
            onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
          />
        </div>
      </div>

      <DialogFooter>
        <Button variant="outline" onClick={onCancel} disabled={saving}>
          إلغاء
        </Button>
        <Button onClick={() => onSave(formData)} disabled={saving}>
          {saving ? (
            <>
              <Loader2 className="h-4 w-4 ml-2 animate-spin" />
              جاري الحفظ...
            </>
          ) : (
            <>
              <Save className="h-4 w-4 ml-2" />
              حفظ
            </>
          )}
        </Button>
      </DialogFooter>
    </>
  )
}
