"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Trash2, Edit, Plus, Loader2, Upload, X } from "lucide-react"
import { getAllCategories } from "@/lib/supabase/products"

type Category = {
  id: string
  name_ar: string
  name_en: string
  image_url?: string
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [newCategory, setNewCategory] = useState({ name_ar: "", name_en: "", image: null as File | null })
  const [saving, setSaving] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<{ name_ar: string; name_en: string; image: File | null }>({ name_ar: "", name_en: "", image: null })

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    try {
      const data = await getAllCategories()
      setCategories(data)
    } catch {
      setCategories([])
    } finally {
      setLoading(false)
    }
  }

  const handleAddCategory = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    let image_url = ""
    if (newCategory.image) {
      const formData = new FormData()
      formData.append("file", newCategory.image)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const { url } = await res.json()
      image_url = url
    }
    await fetch("/api/admin/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_ar: newCategory.name_ar, name_en: newCategory.name_en, image_url }),
    })
    setNewCategory({ name_ar: "", name_en: "", image: null })
    await loadCategories()
    setSaving(false)
  }

  const handleDeleteCategory = async (id: string) => {
    if (!confirm("هل أنت متأكد من حذف الفئة؟")) return
    setSaving(true)
    await fetch(`/api/admin/categories/${id}`, { method: "DELETE" })
    await loadCategories()
    setSaving(false)
  }

  const handleEditCategory = (cat: Category) => {
    setEditingId(cat.id)
    setEditData({ name_ar: cat.name_ar, name_en: cat.name_en, image: null })
  }

  const handleSaveEdit = async (id: string) => {
    setSaving(true)
    let image_url = categories.find(c => c.id === id)?.image_url || ""
    if (editData.image) {
      const formData = new FormData()
      formData.append("file", editData.image)
      const res = await fetch("/api/upload", { method: "POST", body: formData })
      const { url } = await res.json()
      image_url = url
    }
    await fetch(`/api/admin/categories/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name_ar: editData.name_ar, name_en: editData.name_en, image_url }),
    })
    setEditingId(null)
    setEditData({ name_ar: "", name_en: "", image: null })
    await loadCategories()
    setSaving(false)
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">إدارة الفئات</h1>
      <form onSubmit={handleAddCategory} className="flex gap-4 mb-8 items-end">
        <Input
          placeholder="اسم الفئة (عربي)"
          value={newCategory.name_ar}
          onChange={e => setNewCategory({ ...newCategory, name_ar: e.target.value })}
          required
        />
        <Input
          placeholder="اسم الفئة (إنجليزي)"
          value={newCategory.name_en}
          onChange={e => setNewCategory({ ...newCategory, name_en: e.target.value })}
        />
        <Input
          type="file"
          accept="image/*"
          onChange={e => setNewCategory({ ...newCategory, image: e.target.files?.[0] || null })}
        />
        <Button type="submit" disabled={saving}>
          <Plus className="h-4 w-4 mr-2" />
          إضافة فئة
        </Button>
      </form>
      {loading ? (
        <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
      ) : (
        <div className="grid gap-4">
          {categories.map(cat => (
            <Card key={cat.id} className="border-2 border-border">
              <CardContent className="flex items-center justify-between p-4 gap-4">
                <div className="flex items-center gap-4">
                  {cat.image_url && (
                    <img src={cat.image_url} alt={cat.name_ar} className="w-16 h-16 rounded object-cover border" />
                  )}
                  {editingId === cat.id ? (
                    <div className="flex flex-col gap-2">
                      <Input
                        value={editData.name_ar}
                        onChange={e => setEditData({ ...editData, name_ar: e.target.value })}
                        placeholder="اسم الفئة (عربي)"
                        required
                      />
                      <Input
                        value={editData.name_en}
                        onChange={e => setEditData({ ...editData, name_en: e.target.value })}
                        placeholder="اسم الفئة (إنجليزي)"
                      />
                      <Input
                        type="file"
                        accept="image/*"
                        onChange={e => setEditData({ ...editData, image: e.target.files?.[0] || null })}
                      />
                      <div className="flex gap-2">
                        <Button type="button" onClick={() => handleSaveEdit(cat.id)} disabled={saving}>
                          حفظ
                        </Button>
                        <Button type="button" variant="outline" onClick={() => setEditingId(null)} disabled={saving}>
                          إلغاء
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="font-bold text-lg">{cat.name_ar}</div>
                      <div className="text-muted-foreground text-sm">{cat.name_en}</div>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  {editingId !== cat.id && (
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => handleEditCategory(cat)}
                    >
                      <Edit className="h-5 w-5" />
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDeleteCategory(cat.id)}
                  >
                    <Trash2 className="h-5 w-5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
