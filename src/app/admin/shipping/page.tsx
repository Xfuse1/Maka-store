"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Trash2, Edit, Plus } from "lucide-react"
import { getAllShippingZones, createShippingZone, updateShippingZone, deleteShippingZone, ShippingZone } from "@/lib/supabase/shipping"
import { useToast } from "@/hooks/use-toast"

export default function AdminShippingPage() {
  const { toast } = useToast()
  const [zones, setZones] = useState<ShippingZone[]>([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState<Partial<ShippingZone> | null>(null)
  const [newNameAr, setNewNameAr] = useState("")
  const [newNameEn, setNewNameEn] = useState("")
  const [newCode, setNewCode] = useState("")
  const [newPrice, setNewPrice] = useState<number>(50)

  async function load() {
    setLoading(true)
    try {
      const data = await getAllShippingZones()
      setZones(data)
    } catch (err) {
      console.error("Failed loading zones:", err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function handleCreate() {
    try {
      const created = await createShippingZone({
        governorate_code: newCode.toUpperCase(),
        governorate_name_ar: newNameAr,
        governorate_name_en: newNameEn,
        shipping_price: Number(newPrice),
        is_active: true,
      } as any)
      toast({ title: "تم الإنشاء" })
      setNewCode("")
      setNewNameAr("")
      setNewNameEn("")
      setNewPrice(50)
      load()
    } catch (err: any) {
      console.error(err)
      toast({ title: "خطأ", description: err?.message || "فشل الإنشاء", variant: "destructive" })
    }
  }

  async function handleUpdate(id: string, updates: Partial<ShippingZone>) {
    try {
      await updateShippingZone(id, updates)
      toast({ title: "تم الحفظ" })
      load()
    } catch (err: any) {
      console.error(err)
      toast({ title: "خطأ", description: err?.message || "فشل الحفظ", variant: "destructive" })
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("هل تريد حذف هذه المحافظة؟")) return
    try {
      await deleteShippingZone(id)
      toast({ title: "تم الحذف" })
      load()
    } catch (err: any) {
      console.error(err)
      toast({ title: "خطأ", description: err?.message || "فشل الحذف", variant: "destructive" })
    }
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-2xl font-bold">إدارة تكاليف الشحن</h1>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>إضافة محافظة جديدة</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div>
              <Label>كود المحافظة (مثال: CAIRO)</Label>
              <Input value={newCode} onChange={(e) => setNewCode(e.target.value)} />
            </div>
            <div>
              <Label>الاسم بالعربية</Label>
              <Input value={newNameAr} onChange={(e) => setNewNameAr(e.target.value)} />
            </div>
            <div>
              <Label>الاسم بالإنجليزية</Label>
              <Input value={newNameEn} onChange={(e) => setNewNameEn(e.target.value)} />
            </div>
            <div>
              <Label>سعر الشحن (جنيه)</Label>
              <Input type="number" value={newPrice} onChange={(e) => setNewPrice(Number(e.target.value))} />
            </div>
          </div>
          <div className="mt-4">
            <Button onClick={handleCreate}><Plus className="w-4 h-4 ml-2" /> إضافة</Button>
          </div>
        </CardContent>
      </Card>

      <div className="space-y-3">
        {loading ? (
          <div>جاري التحميل...</div>
        ) : (
          zones.map((z) => (
            <Card key={z.id} className="p-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="font-bold">{z.governorate_name_ar} — {z.governorate_name_en}</div>
                  <div className="text-sm text-muted-foreground">{z.governorate_code}</div>
                </div>
                <div className="w-48 flex items-center gap-2">
                  <Input type="number" defaultValue={z.shipping_price} onBlur={(e) => handleUpdate(z.id, { shipping_price: Number(e.currentTarget.value) } as any)} />
                  <Switch checked={z.is_active} onCheckedChange={(v) => handleUpdate(z.id, { is_active: v } as any)} />
                  <Button variant="ghost" onClick={() => handleDelete(z.id)} className="text-destructive"><Trash2 className="w-4 h-4" /></Button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
