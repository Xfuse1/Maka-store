"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
import { supabase } from '@/lib/supabase'

type DesignState = {
  colors: {
    primary: string
    background: string
    foreground: string
  }
  fonts: {
    heading: string
    body: string
  }
  layout: {
    containerWidth: string
    radius: string
  }
  logoUrl?: string

  // setters
  setColor: (key: keyof DesignState["colors"], value: string) => void
  setFont: (key: keyof DesignState["fonts"], value: string) => void
  setLayout: (key: keyof DesignState["layout"], value: string) => void
  setLogo: (url: string) => void
  reset: () => void
  loadFromDatabase: () => Promise<void>
  saveToDatabase: () => Promise<void>
}

const defaults: Omit<DesignState, "setColor" | "setFont" | "setLayout" | "setLogo" | "reset" | "loadFromDatabase" | "saveToDatabase"> = {
  colors: {
    primary: "#FFB6C1",       // وردي
    background: "#FFFFFF",
    foreground: "#1a1a1a",
  },
  fonts: {
    heading: "Cairo",
    body: "Cairo",
  },
  layout: {
    containerWidth: "1280px",
    radius: "0.5rem",
  },
  logoUrl: "/mecca-logo.jpg",
}

export const useDesignStore = create<DesignState>()(
  persist(
    (set, get) => ({
      ...defaults,

      setColor: async (key, value) => {
        const newColors = { ...get().colors, [key]: value }
        
        // تحديث في Supabase
        await supabase
          .from('design_settings')
          .upsert({ 
            id: 'default', 
            colors: newColors,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        set((s) => ({ colors: newColors }))
      },

      setFont: async (key, value) => {
        const newFonts = { ...get().fonts, [key]: value }
        
        // تحديث في Supabase
        await supabase
          .from('design_settings')
          .upsert({ 
            id: 'default', 
            fonts: newFonts,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        set((s) => ({ fonts: newFonts }))
      },

      setLayout: async (key, value) => {
        const newLayout = { ...get().layout, [key]: value }
        
        // تحديث في Supabase
        await supabase
          .from('design_settings')
          .upsert({ 
            id: 'default', 
            layout: newLayout,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        set((s) => ({ layout: newLayout }))
      },

      setLogo: async (url) => {
        // تحديث في Supabase
        await supabase
          .from('design_settings')
          .upsert({ 
            id: 'default', 
            logo_url: url,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        set(() => ({ logoUrl: url }))
      },

      reset: async () => {
        // إعادة التعيين في Supabase
        await supabase
          .from('design_settings')
          .upsert({ 
            id: 'default', 
            ...defaults,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
        
        set(() => ({ ...defaults }))
      },

      loadFromDatabase: async () => {
        try {
          const { data, error } = await supabase
            .from('design_settings')
            .select('*')
            .eq('id', 'default')
            .single()
          
          if (data && !error) {
            set({
              colors: data.colors || defaults.colors,
              fonts: data.fonts || defaults.fonts,
              layout: data.layout || defaults.layout,
              logoUrl: data.logo_url || defaults.logoUrl
            })
          }
        } catch (error) {
          console.log('Error loading design settings:', error)
          // إذا الجدول مش موجود، نستخدم الإعدادات الافتراضية
          set(() => ({ ...defaults }))
        }
      },

      saveToDatabase: async () => {
        const state = get()
        await supabase
          .from('design_settings')
          .upsert({ 
            id: 'default', 
            colors: state.colors,
            fonts: state.fonts,
            layout: state.layout,
            logo_url: state.logoUrl,
            updated_at: new Date().toISOString()
          }, {
            onConflict: 'id'
          })
      }
    }),
    { 
      name: "mecca-design-store",
      onRehydrateStorage: () => (state) => {
        // عند تحميل البيانات من localStorage، نحمّل من Supabase أيضاً
        if (state) {
          state.loadFromDatabase()
        }
      }
    }
  )
)
