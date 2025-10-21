"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

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
}

const defaults: Omit<DesignState, "setColor" | "setFont" | "setLayout" | "setLogo" | "reset"> = {
  colors: {
    primary: "#FFB6C1", // وردي
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
    (set) => ({
      ...defaults,
      setColor: (key, value) => set((s) => ({ colors: { ...s.colors, [key]: value } })),
      setFont: (key, value) => set((s) => ({ fonts: { ...s.fonts, [key]: value } })),
      setLayout: (key, value) => set((s) => ({ layout: { ...s.layout, [key]: value } })),
      setLogo: (url) => set(() => ({ logoUrl: url })),
      reset: () => set(() => ({ ...defaults })),
    }),
    { name: "mecca-design-store" },
  ),
)
