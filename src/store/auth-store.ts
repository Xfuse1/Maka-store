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
      },
    }),
    {
      name: "mecca-auth-storage",
    },
  ),
)
