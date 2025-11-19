import { create } from "zustand"

interface SiteSettings {
  siteName: string
  siteDescription: string
  logo: string
  primaryColor: string
  secondaryColor: string
  accentColor: string
  backgroundColor: string
  textColor: string
  fontFamily: string
  fontSize: string
  contactEmail: string
  contactPhone: string
  contactWhatsapp: string
  contactAddress: string
  socialMedia: {
    facebook?: string
    instagram?: string
    twitter?: string
    tiktok?: string
    snapchat?: string
  }
}

interface SettingsStore {
  settings: SiteSettings
  loadSettings: () => void
  updateSettings: (updates: Partial<SiteSettings>) => void
}

const defaultSettings: SiteSettings = {
  siteName: "مكة",
  siteDescription: "متجر مكة للأزياء النسائية الراقية",
  logo: "/logo-option-4.jpg",
  primaryColor: "#d4af37",
  secondaryColor: "#f5f5f5",
  accentColor: "#c19a6b",
  backgroundColor: "#ffffff",
  textColor: "#1a1a1a",
  fontFamily: "Cairo, Arial, sans-serif",
  fontSize: "16px",
  contactEmail: "info@mecca-fashion.com",
  contactPhone: "01234567890",
  contactWhatsapp: "01234567890",
  contactAddress: "القاهرة، مصر",
  socialMedia: {
    facebook: "",
    instagram: "",
    twitter: "",
    tiktok: "",
    snapchat: "",
  },
}

export const useSettingsStore = create<SettingsStore>((set) => ({
  settings: defaultSettings,
  loadSettings: () => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem("site-settings")
      if (stored) {
        set({ settings: JSON.parse(stored) })
      }
    }
  },
  updateSettings: (updates) => {
    set((state) => {
      const newSettings = { ...state.settings, ...updates }
      if (typeof window !== "undefined") {
        localStorage.setItem("site-settings", JSON.stringify(newSettings))
      }
      return { settings: newSettings }
    })
  },
}))
