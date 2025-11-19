"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useAuthStore } from "@/lib/auth-store"
import { useSettingsStore } from "@/lib/settings-store"
import { AdminLayout } from "@/components/admin-layout"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Palette, Type, ImageIcon, Save } from "lucide-react"

export default function DesignCustomizationPage() {
  const router = useRouter()
  const { isAuthenticated } = useAuthStore()
  const { settings, loadSettings, updateSettings } = useSettingsStore()
  const [isSaving, setIsSaving] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/idara-alkhasa")
      return
    }
    loadSettings()
  }, [isAuthenticated, router, loadSettings])

  const handleSave = () => {
    setIsSaving(true)
    setTimeout(() => {
      setIsSaving(false)
      alert("تم حفظ التغييرات بنجاح! ستظهر التغييرات في الموقع الرئيسي.")
    }, 1000)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="تصميم الموقع" description="تخصيص ألوان وخطوط ولوجو الموقع">
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Palette className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>الألوان</CardTitle>
                <CardDescription>تخصيص ألوان الموقع الرئيسية</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="primaryColor">اللون الأساسي</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="primaryColor"
                    type="color"
                    value={settings.primaryColor}
                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                    className="w-20 h-12"
                  />
                  <Input
                    type="text"
                    value={settings.primaryColor}
                    onChange={(e) => updateSettings({ primaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="secondaryColor">اللون الثانوي</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="secondaryColor"
                    type="color"
                    value={settings.secondaryColor}
                    onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                    className="w-20 h-12"
                  />
                  <Input
                    type="text"
                    value={settings.secondaryColor}
                    onChange={(e) => updateSettings({ secondaryColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="accentColor">لون التمييز</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="accentColor"
                    type="color"
                    value={settings.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="w-20 h-12"
                  />
                  <Input
                    type="text"
                    value={settings.accentColor}
                    onChange={(e) => updateSettings({ accentColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="backgroundColor">لون الخلفية</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="backgroundColor"
                    type="color"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="w-20 h-12"
                  />
                  <Input
                    type="text"
                    value={settings.backgroundColor}
                    onChange={(e) => updateSettings({ backgroundColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="textColor">لون النص</Label>
                <div className="flex gap-2 mt-2">
                  <Input
                    id="textColor"
                    type="color"
                    value={settings.textColor}
                    onChange={(e) => updateSettings({ textColor: e.target.value })}
                    className="w-20 h-12"
                  />
                  <Input
                    type="text"
                    value={settings.textColor}
                    onChange={(e) => updateSettings({ textColor: e.target.value })}
                    className="flex-1"
                  />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Type className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>الخطوط</CardTitle>
                <CardDescription>تخصيص نوع وحجم الخطوط</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="fontFamily">نوع الخط</Label>
                <Input
                  id="fontFamily"
                  value={settings.fontFamily}
                  onChange={(e) => updateSettings({ fontFamily: e.target.value })}
                  placeholder="Cairo, Arial, sans-serif"
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="fontSize">حجم الخط الأساسي</Label>
                <Input
                  id="fontSize"
                  value={settings.fontSize}
                  onChange={(e) => updateSettings({ fontSize: e.target.value })}
                  placeholder="16px"
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <ImageIcon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>اللوجو</CardTitle>
                <CardDescription>تغيير لوجو الموقع</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="logo">رابط اللوجو</Label>
              <Input
                id="logo"
                value={settings.logo}
                onChange={(e) => updateSettings({ logo: e.target.value })}
                placeholder="/logo-option-4.jpg"
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">يمكنك استخدام رابط صورة محلية أو خارجية</p>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full md:w-auto">
          <Save className="w-4 h-4 ml-2" />
          {isSaving ? "جاري الحفظ..." : "حفظ التغييرات"}
        </Button>
      </div>
    </AdminLayout>
  )
}
