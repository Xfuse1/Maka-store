"use client"

import { useState } from "react"
import { usePagesStore, type PageItem } from "@/lib/pages-store"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Plus, Trash2, Edit } from "lucide-react"

export default function AdminPagesPage() {
  const { pages, addPage, updatePage, removePage } = usePagesStore()
  const [open, setOpen] = useState(false)
  const [editing, setEditing] = useState<PageItem | null>(null)
  const [newPath, setNewPath] = useState("")
  const [newTitle, setNewTitle] = useState("")

  return (
    <div className="p-8">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold text-foreground">إدارة الصفحات</h1>
      </div>

      {/* إضافة صفحة جديدة */}
      <Card className="border-2 border-border mb-6">
        <CardHeader>
          <CardTitle className="text-xl font-bold">إضافة صفحة جديدة</CardTitle>
        </CardHeader>
        <CardContent className="grid md:grid-cols-3 gap-4">
          <div>
            <Label>المسار (Path)</Label>
            <Input placeholder="/offers" value={newPath} onChange={(e) => setNewPath(e.target.value)} />
          </div>
          <div>
            <Label>الاسم داخل لوحة التحكم</Label>
            <Input placeholder="العروض" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
          </div>
          <div className="flex items-end">
            <Button
              className="w-full gap-2"
              onClick={() => {
                if (!newPath) return
                addPage({ path: newPath, title: newTitle || newPath, sections: [] })
                setNewPath("")
                setNewTitle("")
              }}
            >
              <Plus className="h-4 w-4" />
              إضافة صفحة
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* قائمة الصفحات */}
      <div className="grid gap-4">
        {pages.map((pg) => (
          <Card key={pg.id} className="border-2 border-border">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <div className="text-lg font-bold">{pg.title}</div>
                <div className="text-sm text-muted-foreground">{pg.path}</div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="gap-2" onClick={() => { setOpen(true); setEditing(pg) }}>
                  <Edit className="h-4 w-4" /> تعديل المحتوى
                </Button>
                <Button
                  variant="outline"
                  className="gap-2 text-destructive hover:text-destructive hover:bg-destructive/10"
                  onClick={() => removePage(pg.id)}
                >
                  <Trash2 className="h-4 w-4" /> حذف
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* نافذة تعديل الصفحة */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>تعديل: {editing?.title}</DialogTitle>
          </DialogHeader>
          {editing && <SectionEditor editing={editing} />}
        </DialogContent>
      </Dialog>
    </div>
  )
}

function SectionEditor({ editing }: { editing: PageItem }) {
  const store = usePagesStore()
  const [title, setTitle] = useState(editing.title)
  const [path, setPath] = useState(editing.path)
  const [newKey, setNewKey] = useState("")
  const [newVal, setNewVal] = useState("")

  return (
    <div className="space-y-6">
      {/* خصائص أساسية */}
      <div className="grid md:grid-cols-2 gap-4">
        <div>
          <Label>الاسم داخل لوحة التحكم</Label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} onBlur={() => store.updatePage(editing.id, { title })} />
        </div>
        <div>
          <Label>المسار (Path)</Label>
          <Input value={path} onChange={(e) => setPath(e.target.value)} onBlur={() => store.updatePage(editing.id, { path })} />
        </div>
      </div>

      {/* إضافة/تعديل أقسام المحتوى */}
      <div className="space-y-3">
        <div className="font-bold text-lg">أقسام المحتوى</div>

        <div className="grid md:grid-cols-3 gap-2">
          <Input placeholder="مثال: hero.title" value={newKey} onChange={(e) => setNewKey(e.target.value)} />
          <Textarea placeholder="النص..." value={newVal} onChange={(e) => setNewVal(e.target.value)} />
          <Button
            onClick={() => {
              if (!newKey) return
              store.upsertSection(editing.id, newKey, newVal)
              setNewKey("")
              setNewVal("")
            }}
          >
            حفظ/إضافة
          </Button>
        </div>

        <div className="space-y-2">
          {editing.sections.map((sec, i) => (
            <div key={i} className="grid md:grid-cols-3 gap-2">
              <Input
                value={sec.key}
                onChange={(e) => {
                  const copy = [...editing.sections]
                  copy[i] = { ...copy[i], key: e.target.value }
                  store.updatePage(editing.id, { sections: copy })
                }}
              />
              <Textarea
                value={sec.value}
                onChange={(e) => store.upsertSection(editing.id, sec.key, e.target.value)}
              />
              <Button
                variant="outline"
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
                onClick={() => {
                  const copy = editing.sections.filter((_, idx) => idx !== i)
                  store.updatePage(editing.id, { sections: copy })
                }}
              >
                حذف
              </Button>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
