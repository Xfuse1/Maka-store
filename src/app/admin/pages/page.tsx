
"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Switch } from "@/components/ui/switch"
import { Plus, Trash2, Edit, ExternalLink, Eye, EyeOff, RefreshCcw, Loader2 } from "lucide-react"
import Link from "next/link"
import { createPage, updatePage, deletePage, type PageContent } from "@/lib/supabase/pages"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// Main component for the admin pages management
export default function AdminPagesPage() {
  const [pages, setPages] = useState<PageContent[]>([])
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PageContent | null>(null)

  useEffect(() => {
    loadPages()
  }, [])

  async function loadPages() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/pages")
      if (!response.ok) throw new Error("Failed to fetch pages")
      const data = await response.json()
      setPages(data)
    } catch (error) {
      console.error("[v0] Error loading pages:", error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDeletePage(id: string, title: string) {
    if (!confirm(`هل أنت متأكد من حذف صفحة "${title}"؟ هذا الإجراء لا يمكن التراجع عنه.`)) return

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
    return <div className="p-8 text-center">جاري تحميل بيانات الصفحات...</div>
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
                    <span className="text-xs bg-muted text-muted-foreground px-2 py-1 rounded">مسودة</span>
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
                  <Switch checked={pg.is_published} onCheckedChange={() => togglePublished(pg)} />
                  <Label className="cursor-pointer">{pg.is_published ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}</Label>
                </div>
                <Button
                  variant="outline"
                  className="gap-2 bg-transparent"
                  onClick={() => {
                    setEditing(pg)
                    setOpen(true)
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
              لا توجد صفحات حالياً.
            </CardContent>
          </Card>
        )}
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل: {editing?.page_title_ar}</DialogTitle>
          </DialogHeader>
          {editing && <PageEditor page={editing} onSave={() => { setOpen(false); loadPages(); }} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

const ABOUT_PAGE_KEYS = [
  "hero.title", "hero.subtitle", "story.title", "story.paragraph1",
  "story.paragraph2", "story.image_url", "values.title", "values.passion.title",
  "values.passion.description", "values.quality.title", "values.quality.description",
  "values.customers.title", "values.customers.description", "values.innovation.title",
  "values.innovation.description", "team.title", "team.paragraph1", "team.paragraph2",
  "team.image_url", "team.image_title", "team.image_subtitle", "cta.title",
  "cta.subtitle", "cta.button"
];

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
  const [isSaving, setIsSaving] = useState(false)
  const [isSeeding, setIsSeeding] = useState(false);

  const availableKeys = page.page_path === '/about/' ? ABOUT_PAGE_KEYS.filter(k => !sections.hasOwnProperty(k)) : [];

  async function handleSave() {
    setIsSaving(true)
    try {
      await updatePage(page.id, {
        page_title_ar: titleAr, page_title_en: titleEn, page_path: path,
        meta_title_ar: metaTitleAr, meta_title_en: metaTitleEn,
        meta_description_ar: metaDescAr, meta_description_en: metaDescEn,
        sections,
      })
      onSave()
    } catch (error) {
      console.error("[v0] Error saving page:", error)
      alert("حدث خطأ أثناء حفظ التغييرات")
    } finally {
      setIsSaving(false)
    }
  }
  
  async function handleSeedAboutPage() {
    if (!confirm("هل أنت متأكد من أنك تريد استعادة المحتوى الافتراضي لصفحة من نحن؟ سيتم دمج المحتوى الافتراضي مع المحتوى الحالي.")) return;
    setIsSeeding(true);
    try {
      const response = await fetch('/api/seed-about', { method: 'POST' });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Failed to seed page');
      alert("تمت استعادة المحتوى الافتراضي بنجاح! سيتم تحديث الصفحة الآن.");
      onSave();
    } catch (error) {
      console.error("Error seeding page:", error);
      alert(`حدث خطأ: ${error.message}`);
    } finally {
      setIsSeeding(false);
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
    <div className="space-y-6 p-1">
      <Card>
        <CardHeader><CardTitle>المعلومات الأساسية</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>العنوان بالعربية</Label><Input value={titleAr} onChange={(e) => setTitleAr(e.target.value)} /></div>
            <div><Label>العنوان بالإنجليزية</Label><Input value={titleEn} onChange={(e) => setTitleEn(e.target.value)} /></div>
            <div className="md:col-span-2"><Label>المسار (Path)</Label><Input value={path} onChange={(e) => setPath(e.target.value)} /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader><CardTitle>تحسين محركات البحث (SEO)</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div><Label>عنوان SEO بالعربية</Label><Input value={metaTitleAr} onChange={(e) => setMetaTitleAr(e.target.value)} placeholder={titleAr} /></div>
            <div><Label>عنوان SEO بالإنجليزية</Label><Input value={metaTitleEn} onChange={(e) => setMetaTitleEn(e.target.value)} placeholder={titleEn} /></div>
            <div><Label>وصف SEO بالعربية</Label><Textarea value={metaDescAr} onChange={(e) => setMetaDescAr(e.target.value)} rows={3} placeholder="وصف مختصر للصفحة يظهر في نتائج البحث" /></div>
            <div><Label>وصف SEO بالإنجليزية</Label><Textarea value={metaDescEn} onChange={(e) => setMetaDescEn(e.target.value)} rows={3} placeholder="Short description for search results" /></div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
            <CardTitle>أقسام المحتوى</CardTitle>
            <p className="text-sm text-muted-foreground pt-1">استخدم مفاتيح معرفة مسبقاً (مثل hero.title) أو أنشئ مفاتيح جديدة خاصة بك.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-[1fr_2fr_auto] gap-2 p-4 border rounded-lg bg-muted/50">
            {page.page_path === '/about/' ? (
              <Select value={newKey} onValueChange={setNewKey}>
                <SelectTrigger><SelectValue placeholder="اختر مفتاح لإضافته..." /></SelectTrigger>
                <SelectContent>
                  {availableKeys.map(k => <SelectItem key={k} value={k}>{k}</SelectItem>)}
                </SelectContent>
              </Select>
            ) : (
              <Input placeholder="مثال: hero.title" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
            )}
            <Textarea placeholder="المحتوى..." value={newValue} onChange={(e) => setNewValue(e.target.value)} rows={2} />
            <Button onClick={addSection}><Plus className="h-4 w-4 ml-2" />إضافة</Button>
          </div>

          <div className="space-y-3 mt-4">
            {Object.entries(sections).sort(([a], [b]) => a.localeCompare(b)).map(([key, value]) => (
              <div key={key} className="grid md:grid-cols-[1fr_2fr_auto] gap-3 items-start p-3 bg-transparent rounded-lg border">
                <Input value={key} disabled className="font-mono text-sm bg-muted self-center" />
                
                {key.includes("_url") ? (
                  <div className="space-y-2">
                    <Textarea value={value} onChange={(e) => updateSection(key, e.target.value)} rows={2} placeholder="https://example.com/image.jpg" className="font-mono text-xs"/>
                    {value && (
                      <div className="mt-2 p-2 border rounded-md bg-muted/50">
                        <Image src={value} alt={`Preview for ${key}`} width={200} height={100} className="rounded-md object-contain aspect-[2/1]" onError={(e) => e.currentTarget.style.display='none'} />
                      </div>
                    )}
                  </div>
                ) : (
                  <Textarea value={value} onChange={(e) => updateSection(key, e.target.value)} rows={4} />
                )}

                <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive hover:bg-destructive/10 self-center" onClick={() => deleteSection(key)}><Trash2 className="h-4 w-4" /></Button>
              </div>
            ))}

            {Object.keys(sections).length === 0 && (
              <div className="text-center text-muted-foreground py-8 border-2 border-dashed rounded-lg">لا توجد أقسام محتوى. قم بإضافة قسم جديد أعلاه.</div>
            )}
          </div>
        </CardContent>
      </Card>
      
      <div className="flex justify-between items-center gap-2 pt-4 border-t">
        <div>
          {page.page_path === '/about/' && (
              <Button variant="secondary" onClick={handleSeedAboutPage} disabled={isSeeding}>
                  {isSeeding ? <Loader2 className="h-4 w-4 animate-spin ml-2" /> : <RefreshCcw className="h-4 w-4 ml-2" />} 
                  استعادة محتوى "من نحن"
              </Button>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => onSave()}>إلغاء</Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving && <Loader2 className="h-4 w-4 animate-spin ml-2" />} 
            حفظ التغييرات
          </Button>
        </div>
      </div>
    </div>
  )
}
