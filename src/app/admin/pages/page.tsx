"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Edit, ExternalLink, Eye, EyeOff } from "lucide-react"
import Link from "next/link"
import { createPage, updatePage, deletePage, type PageContent } from "@/lib/supabase/pages"

export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PageContent | null>(null)


  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    try {
      const response = await fetch("/api/admin/pages")
      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error("[v0] Error loading pages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleCreatePage() {
    if (!newPath || !newTitleAr) return

    try {
      await createPage({
        page_path: newPath.startsWith("/") ? newPath : `/${newPath}`,
        page_title_ar: newTitleAr,
        page_title_en: newTitleEn || newTitleAr,
        meta_title_ar: newTitleAr,
        meta_title_en: newTitleEn || newTitleAr,
        meta_description_ar: "",
        meta_description_en: "",
        sections: {},
        is_published: true,
      })

      setNewPath("")
      setNewTitleAr("")
      setNewTitleEn("")
      loadPages()
    } catch (error) {
      console.error("[v0] Error creating page:", error)
      alert("حدث خطأ أثناء إنشاء الصفحة")
    }
  }

  async function handleDeletePage(id: string, title: string) {
    if (!confirm(`هل أنت متأكد من حذف صفحة "${title}"؟`)) return

    try {
      await deletePage(id)
      loadPages()
    } catch (error) {
      console.error("[v0] Error deleting page:", error)
      alert("حدث خطأ أثناء حذف الصفحة")
    }
  }

  async function togglePublished(page: PageContent) {
    try {
      await updatePage(page.id, { is_published: !page.is_published })
      loadPages()
    } catch (error) {
      console.error("[v0] Error toggling published:", error)
    }
  }

  if (loading) {
    return <div className="p-8">جاري التحميل...</div>
  }

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">إدارة الصفحات</h1>
        <p className="text-muted-foreground">إجمالي الصفحات: {pages.length}</p>
      </div>

      

      <div className="grid gap-4">
        {pages.map((pg) => (
          <Card key={pg.id} className="border-2 border-border">
            <CardContent className="p-4 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <div className="text-lg font-bold">{pg.page_title_ar}</div>
                  {pg.is_published ? (
                    <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">منشور</span>
                  ) : (
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">مخفي</span>
                  )}
                </div>
                <div className="text-sm text-muted-foreground flex items-center gap-2 mt-1">
                  <span>{pg.page_path}</span>
                  {pg.is_published && (
                    <Link
                      href={pg.page_path}
                      target="_blank"
                      className="text-primary hover:underline inline-flex items-center gap-1"
                    >
                      <ExternalLink className="h-3 w-3" />
                      عرض الصفحة
                    </Link>
                  )}
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {Object.keys(pg.sections || {}).length} قسم محتوى
                </div>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex items-center gap-2 px-3">
                  {pg.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  <Switch checked={pg.is_published} onCheckedChange={() => togglePublished(pg)} />
                </div>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => {
                    setOpen(true)
                    setEditing(pg)
                  }}
                >
                  <Edit className="h-4 w-4" /> تعديل المحتوى
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                  onClick={() => handleDeletePage(pg.id, pg.page_title_ar)}
                >
                  <Trash2 className="h-4 w-4" /> حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {pages.length === 0 && (
          <Card className="border-2 border-dashed border-border">
            <CardContent className="p-8 text-center text-muted-foreground">
              لا توجد صفحات حالياً. قم بإضافة صفحة جديدة للبدء.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل: {editing?.page_title_ar}</DialogTitle>
          </DialogHeader>
          {editing && <PageEditor page={editing} onSave={loadPages} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function PageEditor({ page, onSave }: { page: PageContent; onSave: () => void }) {
  const [titleAr, setTitleAr] = useState(page.page_title_ar)
  const [titleEn, setTitleEn] = useState(page.page_title_en)
  const [path, setPath] = useState(page.page_path)
  const [metaTitleAr, setMetaTitleAr] = useState(page.meta_title_ar || "")
  const [metaTitleEn, setMetaTitleEn] = useState(page.meta_title_en || "")
  const [metaDescAr, setMetaDescAr] = useState(page.meta_description_ar || "")
  const [metaDescEn, setMetaDescEn] = useState(page.meta_description_en || "")
  const [sections, setSections] = useState<Record<string, string>>(page.sections || {})
  const [newKey, setNewKey] = useState("")
  const [newValue, setNewValue] = useState("")

  async function handleSave() {
    try {
      await updatePage(page.id, {
        page_title_ar: titleAr,
        page_title_en: titleEn,
        page_path: path,
        meta_title_ar: metaTitleAr,
        meta_title_en: metaTitleEn,
        meta_description_ar: metaDescAr,
        meta_description_en: metaDescEn,
        sections,
      })
      onSave()
    } catch (error) {
      console.error("[v0] Error saving page:", error)
      alert("حدث خطأ أثناء حفظ التغييرات")
    }
  }

  function addSection() {
    if (!newKey) return
    setSections({ ...sections, [newKey]: newValue })
    setNewKey("")
    setNewValue("")
  }

  function updateSection(key: string, value: string) {
    setSections({ ...sections, [key]: value })
  }

  function deleteSection(key: string) {
    const newSections = { ...sections }
    delete newSections[key]
    setSections(newSections)
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="font-bold text-lg">المعلومات الأساسية</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>العنوان بالعربية</Label>
            <Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} />
          </div>
          <div>
            <Label>العنوان بالإنجليزية</Label>
            <Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} />
          </div>
          <div className="md:col-span-2">
            <Label>المسار (Path)</Label>
            <Input value={path} onChange={(e) => setPath(e.target.value)} />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">تحسين محركات البحث (SEO)</h3>
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>عنوان SEO بالعربية</Label>
            <Input value={metaTitleAr} onChange={(e) => setMetaTitleAr(e.target.value)} placeholder={titleAr} />
          </div>
          <div>
            <Label>عنوان SEO بالإنجليزية</Label>
            <Input value={metaTitleEn} onChange={(e) => setMetaTitleEn(e.target.value)} placeholder={titleEn} />
          </div>
          <div>
            <Label>وصف SEO بالعربية</Label>
            <Textarea
              value={metaDescAr}
              onChange={(e) => setMetaDescAr(e.target.value)}
              rows={3}
              placeholder="وصف مختصر للصفحة يظهر في نتائج البحث"
            />
          </div>
          <div>
            <Label>وصف SEO بالإنجليزية</Label>
            <Textarea
              value={metaDescEn}
              onChange={(e) => setMetaDescEn(e.target.value)}
              rows={3}
              placeholder="Short description for search results"
            />
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <h3 className="font-bold text-lg">أقسام المحتوى</h3>
        <p className="text-sm text-muted-foreground">
          استخدم مفاتيح مثل: hero.title, hero.subtitle, content.paragraph1, values.quality.title
        </p>

        <div className="grid md:grid-cols-3 gap-2">
          <Input placeholder="مثال: hero.title" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <Textarea placeholder="النص..." value={newValue} onChange={(e) => setNewValue(e.target.value)} rows={2} />
          <Button onClick={addSection}>
            <Plus className="h-4 w-4 ml-2" />
            إضافة قسم
          </Button>
        </div>

        <div className="space-y-2 mt-4">
          {Object.entries(sections).map(([key, value]) => (
            <div key={key} className="grid md:grid-cols-3 gap-2 p-3 bg-secondary/20 rounded-lg">
              <Input value={key} disabled className="font-mono text-sm bg-background" />
              <Textarea value={value} onChange={(e) => updateSection(key, e.target.value)} rows={3} />
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10 bg-transparent"
                onClick={() => deleteSection(key)}
              >
                <Trash2 className="h-4 w-4 ml-2" />
                حذف
              </Button>
            </div>
          ))}

          {Object.keys(sections).length === 0 && (
            <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">
              لا توجد أقسام محتوى. قم بإضافة قسم جديد أعلاه.
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button variant="outline" onClick={() => window.location.reload()}>
          إلغاء
        </Button>
        <Button onClick={handleSave}>حفظ التغييرات</Button>
      </div>
    </div>
  )
}
