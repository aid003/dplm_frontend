import { create } from "zustand"
import { persist, createJSONStorage } from "zustand/middleware"

export type Theme = "light" | "dark"

export type ThemeStore = {
  theme: Theme
  setTheme: (theme: Theme) => void
  toggleTheme: () => void
}

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set, get) => ({
      theme: "light",
      setTheme: (nextTheme) => {
        set({ theme: nextTheme })
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", nextTheme === "dark")
          document.cookie = `theme=${nextTheme}; path=/; max-age=31536000`
        }
      },
      toggleTheme: () => {
        const current = get().theme
        const next: Theme = current === "dark" ? "light" : "dark"
        get().setTheme(next)
      },
    }),
    {
      name: "theme",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      onRehydrateStorage: () => (state) => {
        if (!state) return
        // Apply persisted theme to document after rehydrate
        if (typeof document !== "undefined") {
          document.documentElement.classList.toggle("dark", state.theme === "dark")
          document.cookie = `theme=${state.theme}; path=/; max-age=31536000`
        }
      },
    }
  )
)


