import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

const STORAGE_KEY = 'tutor-front-auth'

export type AuthUser = {
  id: string
  name: string
  email?: string
  avatarUrl?: string
}

type AuthState = {
  token: string | null
  user: AuthUser | null
  isLoggedIn: boolean
}

type AuthActions = {
  login: (token: string, user: AuthUser) => void
  logout: () => void
  loadFromStorage: () => void
}

export type AuthStore = AuthState & AuthActions

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoggedIn: false,
      login: (token, user) => set({ token, user, isLoggedIn: true }),
      logout: () => set({ token: null, user: null, isLoggedIn: false }),
      loadFromStorage: () => {
        if (typeof window === 'undefined') return

        const storedValue = window.localStorage.getItem(STORAGE_KEY)
        if (!storedValue) return

        try {
          const parsed = JSON.parse(storedValue)
          const state = parsed?.state ?? parsed

          set({
            token: state?.token ?? null,
            user: state?.user ?? null,
            isLoggedIn: Boolean(state?.token),
          })
        } catch (error) {
          console.error('Failed to load auth state from storage', error)
          window.localStorage.removeItem(STORAGE_KEY)
        }
      },
    }),
    {
      name: STORAGE_KEY,
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isLoggedIn: state.isLoggedIn,
      }),
    },
  ),
)


