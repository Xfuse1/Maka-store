"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"
// Use API routes for persistence to keep DB schema centralized

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

        // Persist via API route (server knows DB schema)
        try {
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'colors', value: newColors }),
          })
        } catch (e) {
          console.error('[setColor] API save failed', e)
        }

        set((s) => ({ colors: newColors }))
      },

      setFont: async (key, value) => {
        const newFonts = { ...get().fonts, [key]: value }

        try {
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'fonts', value: newFonts }),
          })
        } catch (e) {
          console.error('[setFont] API save failed', e)
        }

        set((s) => ({ fonts: newFonts }))
      },

      setLayout: async (key, value) => {
        const newLayout = { ...get().layout, [key]: value }

        try {
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'layout', value: newLayout }),
          })
        } catch (e) {
          console.error('[setLayout] API save failed', e)
        }

        set((s) => ({ layout: newLayout }))
      },

      // Note: logo uploads should use the dedicated upload endpoint.
      // `setLogo` just updates local state; use `uploadLogo` helper for file uploads.
      setLogo: async (url) => {
        set(() => ({ logoUrl: url }))
      },

      reset: async () => {
        try {
          // push colors and fonts back to server defaults via API
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'colors', value: defaults.colors }),
          })
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'fonts', value: defaults.fonts }),
          })
        } catch (e) {
          console.error('[reset] API reset failed', e)
        }

        set(() => ({ ...defaults }))
      },

      loadFromDatabase: async () => {
        try {
          const res = await fetch('/api/admin/design/settings')
          const json = await res.json()
          const settings = json.settings || {}

          set({
            colors: settings.colors || defaults.colors,
            fonts: settings.fonts || defaults.fonts,
            layout: settings.layout || defaults.layout,
            // logo is handled via separate endpoint
            logoUrl: defaults.logoUrl,
          })
        } catch (error) {
          console.log('Error loading design settings:', error)
          set(() => ({ ...defaults }))
        }
      },

      saveToDatabase: async () => {
        const state = get()
        try {
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'colors', value: state.colors }),
          })
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'fonts', value: state.fonts }),
          })
          await fetch('/api/admin/design/settings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ key: 'layout', value: state.layout }),
          })
        } catch (e) {
          console.error('[saveToDatabase] API save failed', e)
        }
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
