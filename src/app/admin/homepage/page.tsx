"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Plus, Edit, Trash2, Loader2, Eye } from "lucide-react"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import type { HomepageSection } from "@/lib/supabase/homepage"
import {
  getHomepageSectionsAction,
  createHomepageSectionAction,
  updateHomepageSectionAction,
  deleteHomepageSectionAction,
} from "./actions"

type SectionForm = Omit<HomepageSection, "id" | "created_at" | "updated_at">

export default function AdminHomepagePage() {
  const [sections, setSections] = useState<HomepageSection[]>([])
  const [loading, setLoading] = useState(true)
  const [showDialog, setShowDialog] = useState(false)
  const [editingSection, setEditingSection] = useState<HomepageSection | null>(null)
  const [saving, setSaving] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<SectionForm>({
    section_type: "best_sellers",
    name_ar: "",
    name_en: "",
    layout_type: "grid",
    background_color: "",
    show_title: true,
    show_description: true,
    product_ids: null,
    category_ids: null,
    custom_content: null,
    max_items: 8,
    display_order: 0,
    is_active: true,
  })

  useEffect(() => {
    loadSections()
  }, [])

  const loadSections = async () => {
    try {
      setLoading(true)
      const result = await getHomepageSectionsAction()
      if (result.success && result.data) {
        setSections(result.data)
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("[v0] Error loading sections:", error)
      toast({
        title: "خطأ",
        description: "فشل تحميل أقسام الصفحة الرئيسية",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const resetForm = () => {
    setFormData({
      section_type: "best_sellers",
      name_ar: "",
      name_en: "",
      layout_type: "grid",
      background_color: "",
      show_title: true,
      show_description: true,
      product_ids: null,
      category_ids: null,
      custom_content: null,
      max_items: 8,
      display_order: sections.length + 1,
      is_active: true,
    })
    setEditingSection(null)
  }

  const handleEdit = (section: HomepageSection) => {
    setEditingSection(section)
    setFormData({
      section_type: section.section_type,
      name_ar: section.name_ar || "",
      name_en: section.name_en || "",
      layout_type: section.layout_type || "grid",
      background_color: section.background_color || "",
      show_title: section.show_title,
      show_description: section.show_description,
      product_ids: section.product_ids,
      category_ids: section.category_ids,
      custom_content: section.custom_content,
      max_items: section.max_items || 8,
      display_order: section.display_order,
      is_active: section.is_active,
    })
    setShowDialog(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      setSaving(true)

      const sectionData = {
        ...formData,
      }

      let result
      if (editingSection) {
        result = await updateHomepageSectionAction(editingSection.id, sectionData)
        if (result.success) {
          toast({
            title: "تم التحديث",
            description: "تم تحديث القسم بنجاح",
          })
        }
      } else {
        result = await createHomepageSectionAction(sectionData)
        if (result.success) {
          toast({
            title: "تم الإضافة",
            description: "تم إضافة القسم بنجاح",
          })
        }
      }

      if (!result.success) {
        throw new Error(result.error)
      }

      setShowDialog(false)
      resetForm()
      await loadSections()
    } catch (error) {
      console.error("[v0] Error saving section:", error)
      toast({
        title: "خطأ",
        description: "فشل حفظ القسم",
        variant: "destructive",
      })
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`هل أنت متأكد من حذف "${title}"؟`)) return

    try {
      const result = await deleteHomepageSectionAction(id)
      if (result.success) {
        toast({
          title: "تم الحذف",
          description: "تم حذف القسم بنجاح",
        })
        await loadSections()
      } else {
        throw new Error(result.error)
      }
    } catch (error) {
      console.error("[v0] Error deleting section:", error)
      toast({
        title: "خطأ",
        description: "فشل حذف القسم",
        variant: "destructive",
      })
    }
  }

  const getSectionTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      best_sellers: "الأكثر مبيعاً",
      new_arrivals: "المنتجات الجديدة",
      featured: "المنتجات المميزة",
      categories: "التصنيفات",
      reviews: "آراء العملاء",
      hero: "بانر رئيسي",
      promotional: "قسم ترويجي",
    }
    return labels[type] || type
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
          <h1 className="text-3xl font-bold text-foreground mb-2">إدارة الصفحة الرئيسية</h1>
          <p className="text-muted-foreground text-base">تحكم في محتوى وأقسام الصفحة الرئيسية</p>
        </div>
        <div className="flex gap-3">
          <Button asChild variant="outline" className="gap-2 bg-transparent">
            <a href="/" target="_blank" rel="noreferrer">
              <Eye className="h-4 w-4" />
              معاينة الموقع
            </a>
          </Button>
          <Button
            className="bg-primary hover:bg-primary/90 gap-2"
            onClick={() => {
              resetForm()
              setShowDialog(true)
            }}
          >
            <Plus className="h-4 w-4" />
            إضافة قسم جديد
          </Button>
        </div>
      </div>

      <div className="grid gap-6">
        {sections.map((section) => (
          <Card key={section.id} className="border-2 border-border hover:border-primary/50 transition-all">
            <CardContent className="p-6">
              <div className="flex gap-6">
                <div className="flex-1">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-xl font-bold text-foreground">{section.name_ar || "بدون عنوان"}</h3>
                        <Badge className="bg-primary/10 text-primary border-primary/20">
                          {getSectionTypeLabel(section.section_type)}
                        </Badge>
                        {!section.is_active && (
                          <Badge variant="outline" className="text-muted-foreground">
                            غير نشط
                          </Badge>
                        )}
                      </div>
                      {section.name_en && <p className="text-sm text-muted-foreground mb-2">{section.name_en}</p>}
                    </div>
                    <div className="text-sm text-muted-foreground">ترتيب: {section.display_order}</div>
                  </div>
                  <div className="flex items-center gap-4 mb-4 text-sm text-muted-foreground">
                    {section.layout_type && <span>التخطيط: {section.layout_type}</span>}
                    {section.max_items && <span>عدد العناصر: {section.max_items}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 bg-transparent"
                      onClick={() => handleEdit(section)}
                    >
                      <Edit className="h-4 w-4" />
                      تعديل
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                      onClick={() => handleDelete(section.id, section.name_ar || "")}
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

      {sections.length === 0 && (
        <div className="text-center py-20">
          <h3 className="text-2xl font-bold mb-4 text-foreground">لا توجد أقسام</h3>
          <p className="text-muted-foreground mb-6">ابدأ بإضافة أقسام للصفحة الرئيسية</p>
          <Button
            className="bg-primary hover:bg-primary/90"
            onClick={() => {
              resetForm()
              setShowDialog(true)
            }}
          >
            <Plus className="h-4 w-4 ml-2" />
            إضافة قسم جديد
          </Button>
        </div>
      )}

      <Dialog
        open={showDialog}
        onOpenChange={(open) => {
          setShowDialog(open)
          if (!open) resetForm()
        }}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold">
              {editingSection ? "تعديل القسم" : "إضافة قسم جديد"}
            </DialogTitle>
            <DialogDescription>
              {editingSection ? `تعديل "${editingSection.name_ar}"` : "أضف قسم جديد للصفحة الرئيسية"}
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSave} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="section_type">نوع القسم *</Label>
                <Select
                  value={formData.section_type}
                  onValueChange={(value: any) => setFormData({ ...formData, section_type: value })}
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
                    <SelectItem value="hero">بانر رئيسي</SelectItem>
                    <SelectItem value="promotional">قسم ترويجي</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="display_order">ترتيب العرض</Label>
                <Input
                  id="display_order"
                  type="number"
                  value={formData.display_order}
                  onChange={(e) => setFormData({ ...formData, display_order: Number(e.target.value) })}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2 space-x-reverse">
              <Switch
                id="is_active"
                checked={formData.is_active}
                onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
              />
              <Label htmlFor="is_active" className="cursor-pointer">
                نشط
              </Label>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name_ar">الاسم (عربي) *</Label>
                <Input
                  id="name_ar"
                  value={formData.name_ar}
                  onChange={(e) => setFormData({ ...formData, name_ar: e.target.value })}
                  required
                />
              </div>
              <div>
                <Label htmlFor="name_en">الاسم (إنجليزي)</Label>
                <Input
                  id="name_en"
                  value={formData.name_en}
                  onChange={(e) => setFormData({ ...formData, name_en: e.target.value })}
                />
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="layout_type">نوع التخطيط</Label>
                <Select
                  value={formData.layout_type || "grid"}
                  onValueChange={(value) => setFormData({ ...formData, layout_type: value })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="grid">شبكة</SelectItem>
                    <SelectItem value="carousel">عرض متحرك</SelectItem>
                    <SelectItem value="list">قائمة</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="max_items">عدد العناصر</Label>
                <Input
                  id="max_items"
                  type="number"
                  value={formData.max_items || 8}
                  onChange={(e) => setFormData({ ...formData, max_items: Number(e.target.value) })}
                />
              </div>
              <div>
                <Label htmlFor="background_color">لون الخلفية</Label>
                <Input
                  id="background_color"
                  value={formData.background_color || ""}
                  onChange={(e) => setFormData({ ...formData, background_color: e.target.value })}
                  placeholder="#ffffff"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="show_title"
                  checked={formData.show_title}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_title: checked })}
                />
                <Label htmlFor="show_title" className="cursor-pointer">
                  إظهار العنوان
                </Label>
              </div>
              <div className="flex items-center space-x-2 space-x-reverse">
                <Switch
                  id="show_description"
                  checked={formData.show_description}
                  onCheckedChange={(checked) => setFormData({ ...formData, show_description: checked })}
                />
                <Label htmlFor="show_description" className="cursor-pointer">
                  إظهار الوصف
                </Label>
              </div>
            </div>

            <div className="flex gap-4 pt-2">
              <Button type="submit" className="flex-1 bg-primary hover:bg-primary/90" disabled={saving}>
                {saving ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin ml-2" />
                    جاري الحفظ...
                  </>
                ) : (
                  "حفظ"
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  setShowDialog(false)
                  resetForm()
                }}
                disabled={saving}
              >
                إلغاء
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
