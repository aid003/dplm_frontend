import Cookies from 'js-cookie'

export const TOKEN_KEYS = { access: 'access_token', refresh: 'refresh_token' } as const

export function setTokens(accessToken: string, refreshToken: string): void {
  Cookies.set(TOKEN_KEYS.access, accessToken, { sameSite: 'lax', secure: true, path: '/' })
  Cookies.set(TOKEN_KEYS.refresh, refreshToken, { sameSite: 'lax', secure: true, path: '/' })
}

export function clearTokens(): void {
  Cookies.remove(TOKEN_KEYS.access, { path: '/' })
  Cookies.remove(TOKEN_KEYS.refresh, { path: '/' })
}

export function getAccessToken(): string {
  return Cookies.get(TOKEN_KEYS.access) ?? ''
}

export function getRefreshToken(): string {
  return Cookies.get(TOKEN_KEYS.refresh) ?? ''
}


let isRedirectingToLogin = false

export function redirectToLogin(fromPath?: string): void {
  if (isRedirectingToLogin) return
  isRedirectingToLogin = true
  clearTokens()
  if (typeof window !== 'undefined') {
    const currentPath = fromPath ?? window.location.pathname
    const fromParam = currentPath && currentPath !== '/auth/login' ? `?from=${encodeURIComponent(currentPath)}` : ''
    window.location.assign(`/auth/login${fromParam}`)
  }
}


