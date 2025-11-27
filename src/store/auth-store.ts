// Authentication store for admin panel
import { create } from "zustand"
import { persist } from "zustand/middleware"

interface AuthStore {
  isAuthenticated: boolean
  login: (username: string, password: string) => boolean
  logout: () => void
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      isAuthenticated: false,

      login: (username: string, password: string) => {
        // In production, this should verify against hashed passwords
        if (username === "admin" && password === "mecca2025") {
          set({ isAuthenticated: true })
          return true
        }
        return false
      },

      logout: () => {
        set({ isAuthenticated: false })
        // Remove persisted store entry and clear client caches (best-effort)
        try {
          if (typeof window !== 'undefined') {
            try { localStorage.removeItem('mecca-auth-storage') } catch (e) {}
            import('@/lib/client/clearClientData').then((m) => m.clearClientData()).catch(() => {})
          }
        } catch (e) {
          // ignore
        }
      },
    }),
    {
      name: "mecca-auth-storage",
    },
  ),
)
