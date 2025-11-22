"use client"

import { useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useSettingsStore } from "@/lib/settings-store"
import { useDesignStore } from "@/store/design-store"

export function SiteFooter() {
  const { settings, loadSettings } = useSettingsStore()
  const { colors } = useDesignStore()

  useEffect(() => {
    loadSettings()
  }, [loadSettings])

  return (
    <footer 
      className="border-t py-12 transition-colors duration-300"
      style={{
        backgroundColor: colors.background,
        borderColor: colors.foreground + '20', // 20% opacity for subtle border
      }}
    >
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          <div>
            <h5 
              className="font-bold text-lg mb-4 transition-colors duration-300"
              style={{ color: colors.foreground }}
            >
              عن {settings.siteName}
            </h5>
            <p 
              className="leading-relaxed transition-colors duration-300"
              style={{ color: colors.foreground + 'CC' }} // 80% opacity
            >
              {settings.siteDescription}
            </p>
          </div>
          <div>
            <h5 
              className="font-bold text-lg mb-4 transition-colors duration-300"
              style={{ color: colors.foreground }}
            >
              روابط سريعة
            </h5>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/category/abayas" 
                  className="transition-colors duration-300 hover:opacity-90"
                  style={{ color: colors.foreground + 'CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.foreground + 'CC'}
                >
                  عبايات
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/cardigans" 
                  className="transition-colors duration-300 hover:opacity-90"
                  style={{ color: colors.foreground + 'CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.foreground + 'CC'}
                >
                  كارديجان
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/suits" 
                  className="transition-colors duration-300 hover:opacity-90"
                  style={{ color: colors.foreground + 'CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.foreground + 'CC'}
                >
                  بدل
                </Link>
              </li>
              <li>
                <Link 
                  href="/category/dresses" 
                  className="transition-colors duration-300 hover:opacity-90"
                  style={{ color: colors.foreground + 'CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.foreground + 'CC'}
                >
                  فساتين
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 
              className="font-bold text-lg mb-4 transition-colors duration-300"
              style={{ color: colors.foreground }}
            >
              معلومات
            </h5>
            <ul className="space-y-2">
              <li>
                <Link 
                  href="/about" 
                  className="transition-colors duration-300 hover:opacity-90"
                  style={{ color: colors.foreground + 'CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.foreground + 'CC'}
                >
                  من نحن
                </Link>
              </li>
              <li>
                <Link 
                  href="/return-policy" 
                  className="transition-colors duration-300 hover:opacity-90"
                  style={{ color: colors.foreground + 'CC' }}
                  onMouseEnter={(e) => e.currentTarget.style.color = colors.primary}
                  onMouseLeave={(e) => e.currentTarget.style.color = colors.foreground + 'CC'}
                >
                  سياسة الإرجاع
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h5 
              className="font-bold text-lg mb-4 transition-colors duration-300"
              style={{ color: colors.foreground }}
            >
              تواصل معنا
            </h5>
            <p 
              className="leading-relaxed mb-4 transition-colors duration-300"
              style={{ color: colors.foreground + 'CC' }}
            >
              للاستفسارات والطلبات الخاصة<br />
              واتساب: {settings.contactWhatsapp}<br />
              البريد: {settings.contactEmail}
            </p>
            <Link href="/contact">
              <Button 
                variant="outline" 
                className="w-full transition-all duration-300"
                style={{
                  backgroundColor: 'transparent',
                  borderColor: colors.primary,
                  color: colors.foreground,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = colors.primary + '15' // 15% opacity
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent'
                }}
              >
                تواصل معنا
              </Button>
            </Link>
          </div>
        </div>
        <div 
          className="text-center pt-8 border-t transition-colors duration-300"
          style={{ borderColor: colors.foreground + '20' }}
        >
          <p 
            className="text-sm transition-colors duration-300"
            style={{ color: colors.foreground + 'CC' }}
          >
            © {new Date().getFullYear()} {settings.siteName}. جميع الحقوق محفوظة.
          </p>
        </div>
      </div>
    </footer>
  )
}
