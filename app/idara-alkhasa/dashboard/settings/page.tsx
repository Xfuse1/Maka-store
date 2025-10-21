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
import { Textarea } from "@/components/ui/textarea"
import { Settings, Save, Mail, Phone, MapPin, MessageCircle } from "lucide-react"

export default function SettingsPage() {
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
      alert("تم حفظ الإعدادات بنجاح! ستظهر التغييرات في الموقع الرئيسي.")
    }, 1000)
  }

  if (!isAuthenticated) {
    return null
  }

  return (
    <AdminLayout title="الإعدادات" description="إعدادات الموقع ومعلومات الاتصال">
      <div className="space-y-6">
        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>معلومات الموقع</CardTitle>
                <CardDescription>المعلومات الأساسية للمتجر</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="siteName">اسم الموقع</Label>
              <Input
                id="siteName"
                value={settings.siteName}
                onChange={(e) => updateSettings({ siteName: e.target.value })}
                className="mt-2"
              />
            </div>

            <div>
              <Label htmlFor="siteDescription">وصف الموقع</Label>
              <Textarea
                id="siteDescription"
                value={settings.siteDescription}
                onChange={(e) => updateSettings({ siteDescription: e.target.value })}
                rows={3}
                className="mt-2"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                <Phone className="w-5 h-5 text-primary" />
              </div>
              <div>
                <CardTitle>معلومات الاتصال</CardTitle>
                <CardDescription>طرق التواصل مع العملاء</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="contactEmail">
                  <Mail className="w-4 h-4 inline ml-1" />
                  البريد الإلكتروني
                </Label>
                <Input
                  id="contactEmail"
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) => updateSettings({ contactEmail: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contactPhone">
                  <Phone className="w-4 h-4 inline ml-1" />
                  رقم الهاتف
                </Label>
                <Input
                  id="contactPhone"
                  type="tel"
                  value={settings.contactPhone}
                  onChange={(e) => updateSettings({ contactPhone: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contactWhatsapp">
                  <MessageCircle className="w-4 h-4 inline ml-1" />
                  واتساب
                </Label>
                <Input
                  id="contactWhatsapp"
                  type="tel"
                  value={settings.contactWhatsapp}
                  onChange={(e) => updateSettings({ contactWhatsapp: e.target.value })}
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="contactAddress">
                  <MapPin className="w-4 h-4 inline ml-1" />
                  العنوان
                </Label>
                <Input
                  id="contactAddress"
                  value={settings.contactAddress}
                  onChange={(e) => updateSettings({ contactAddress: e.target.value })}
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-2">
          <CardHeader>
            <CardTitle>روابط السوشيال ميديا</CardTitle>
            <CardDescription>روابط حسابات التواصل الاجتماعي</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="facebook">فيسبوك</Label>
                <Input
                  id="facebook"
                  value={settings.socialMedia.facebook || ""}
                  onChange={(e) =>
                    updateSettings({
                      socialMedia: { ...settings.socialMedia, facebook: e.target.value },
                    })
                  }
                  placeholder="https://facebook.com/..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="instagram">إنستجرام</Label>
                <Input
                  id="instagram"
                  value={settings.socialMedia.instagram || ""}
                  onChange={(e) =>
                    updateSettings({
                      socialMedia: { ...settings.socialMedia, instagram: e.target.value },
                    })
                  }
                  placeholder="https://instagram.com/..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="twitter">تويتر</Label>
                <Input
                  id="twitter"
                  value={settings.socialMedia.twitter || ""}
                  onChange={(e) =>
                    updateSettings({
                      socialMedia: { ...settings.socialMedia, twitter: e.target.value },
                    })
                  }
                  placeholder="https://twitter.com/..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="tiktok">تيك توك</Label>
                <Input
                  id="tiktok"
                  value={settings.socialMedia.tiktok || ""}
                  onChange={(e) =>
                    updateSettings({
                      socialMedia: { ...settings.socialMedia, tiktok: e.target.value },
                    })
                  }
                  placeholder="https://tiktok.com/@..."
                  className="mt-2"
                />
              </div>

              <div>
                <Label htmlFor="snapchat">سناب شات</Label>
                <Input
                  id="snapchat"
                  value={settings.socialMedia.snapchat || ""}
                  onChange={(e) =>
                    updateSettings({
                      socialMedia: { ...settings.socialMedia, snapchat: e.target.value },
                    })
                  }
                  placeholder="https://snapchat.com/add/..."
                  className="mt-2"
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Button onClick={handleSave} disabled={isSaving} size="lg" className="w-full md:w-auto">
          <Save className="w-4 h-4 ml-2" />
          {isSaving ? "جاري الحفظ..." : "حفظ الإعدادات"}
        </Button>
      </div>
    </AdminLayout>
  )
}
