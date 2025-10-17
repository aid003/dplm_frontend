import { getAccessToken, getRefreshToken, setTokens, clearTokens, redirectToLogin } from '@/shared/lib/auth'

const BASE_URL = 'http://localhost:8000/api'

type JsonLike = Record<string, unknown>

type TokensResponse = {
  access_token: string
  refresh_token: string
}

function withAuth(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers ?? {})
  if (token) headers.set('Authorization', `Bearer ${token}`)
  return { ...init, headers }
}

let refreshTokensPromise: Promise<void> | null = null

async function refreshTokens(): Promise<void> {
  const refreshToken = getRefreshToken()
  if (!refreshToken) throw new Error('No refresh token')

  if (!refreshTokensPromise) {
    refreshTokensPromise = (async () => {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      })

      if (!refreshRes.ok) {
        clearTokens()
        throw new Error('Refresh failed')
      }

      const tokens = (await refreshRes.json()) as TokensResponse
      setTokens(tokens.access_token, tokens.refresh_token)
    })().finally(() => {
      refreshTokensPromise = null
    })
  }

  return refreshTokensPromise
}

export async function apiFetch(input: string, init?: RequestInit): Promise<Response> {
  const doFetch = () => fetch(`${BASE_URL}${input}`, withAuth(init, getAccessToken()))

  let res = await doFetch()

  if (res.status === 401 && getRefreshToken()) {
    try {
      await refreshTokens()
      res = await doFetch()
    } catch {
      // tokens already cleared in refreshTokens
      redirectToLogin(typeof window !== 'undefined' ? window.location.pathname : undefined)
    }
  } else if (res.status === 401) {
    clearTokens()
    redirectToLogin(typeof window !== 'undefined' ? window.location.pathname : undefined)
  }

  return res
}

export async function apiPost<TRequest extends JsonLike, TResponse>(path: string, body: TRequest): Promise<TResponse> {
  const res = await apiFetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? 'Request failed'
    throw new Error(message)
  }
  return data as TResponse
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const res = await apiFetch(path, { method: 'GET' })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? 'Request failed'
    throw new Error(message)
  }
  return data as TResponse
}

export async function apiPostFormData<TResponse>(path: string, formData: FormData): Promise<TResponse> {
  const res = await apiFetch(path, {
    method: 'POST',
    body: formData,
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? 'Request failed'
    throw new Error(message)
  }
  return data as TResponse
}


