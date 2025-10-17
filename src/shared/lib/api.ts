import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  clearTokens,
  redirectToLogin,
} from "@/shared/lib/auth";

const BASE_URL = "http://localhost:8000/api";

type JsonLike = Record<string, unknown>;

type TokensResponse = {
  access_token: string;
  refresh_token: string;
};

function withAuth(init: RequestInit | undefined, token: string): RequestInit {
  const headers = new Headers(init?.headers ?? {});
  if (token) headers.set("Authorization", `Bearer ${token}`);
  return { ...init, headers };
}

let refreshTokensPromise: Promise<void> | null = null;

async function refreshTokens(): Promise<void> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error("No refresh token");

  if (!refreshTokensPromise) {
    refreshTokensPromise = (async () => {
      const refreshRes = await fetch(`${BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refreshToken }),
      });

      if (!refreshRes.ok) {
        clearTokens();
        throw new Error("Refresh failed");
      }

      const tokens = (await refreshRes.json()) as TokensResponse;
      setTokens(tokens.access_token, tokens.refresh_token);
    })().finally(() => {
      refreshTokensPromise = null;
    });
  }

  return refreshTokensPromise;
}

export async function apiFetch(
  input: string,
  init?: RequestInit
): Promise<Response> {
  const doFetch = () =>
    fetch(`${BASE_URL}${input}`, withAuth(init, getAccessToken()));

  let res = await doFetch();

  if (res.status === 401 && getRefreshToken()) {
    try {
      await refreshTokens();
      res = await doFetch();
    } catch {
      // tokens already cleared in refreshTokens
      redirectToLogin(
        typeof window !== "undefined" ? window.location.pathname : undefined
      );
    }
  } else if (res.status === 401) {
    clearTokens();
    redirectToLogin(
      typeof window !== "undefined" ? window.location.pathname : undefined
    );
  }

  return res;
}

export async function apiPost<TRequest extends JsonLike, TResponse>(
  path: string,
  body: TRequest
): Promise<TResponse> {
  const res = await apiFetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? "Request failed";
    throw new Error(message);
  }
  return data as TResponse;
}

export async function apiGet<TResponse>(path: string): Promise<TResponse> {
  const res = await apiFetch(path, { method: "GET" });
  // backend может вернуть 204/empty при прогрессе
  if (res.status === 204) {
    return {} as TResponse;
  }
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? "Request failed";
    throw new Error(message);
  }
  return data as TResponse;
}

export async function apiPostFormData<TResponse>(
  path: string,
  formData: FormData
): Promise<TResponse> {
  const res = await apiFetch(path, {
    method: "POST",
    body: formData,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    const message = (data as { message?: string })?.message ?? "Request failed";
    throw new Error(message);
  }
  return data as TResponse;
}

// Подписка на SSE с Bearer-авторизацией. Возвращает функцию отписки.
export function subscribeSse<T>(
  path: string,
  onEvent: (event: T) => void,
  onError?: (error: Error) => void,
  onDone?: () => void
): () => void {
  const controller = new AbortController();

  // eslint-disable-next-line @typescript-eslint/no-floating-promises
  (async () => {
    const url = `${BASE_URL}${path}`;
    const doFetch = () =>
      fetch(url, {
        method: "GET",
        headers: {
          Accept: "text/event-stream",
          Authorization: `Bearer ${getAccessToken()}`,
        },
        signal: controller.signal,
      });

    let res = await doFetch();
    if (res.status === 401 && getRefreshToken()) {
      try {
        await refreshTokens();
        res = await doFetch();
      } catch (e) {
        if (onError)
          onError(e instanceof Error ? e : new Error("Unauthorized"));
        return;
      }
    }
    if (!res.ok || !res.body) {
      if (onError) onError(new Error(`SSE failed with status ${res.status}`));
      return;
    }

    const reader = res.body.getReader();
    const decoder = new TextDecoder("utf-8");
    let buffer = "";

    try {
      while (true) {
        // eslint-disable-next-line no-await-in-loop
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        // Разделитель событий по спецификации — пустая строка \n\n
        let sepIndex = buffer.indexOf("\n\n");
        while (sepIndex !== -1) {
          const rawEvent = buffer.slice(0, sepIndex);
          buffer = buffer.slice(sepIndex + 2);

          // Собираем только строки, начинающиеся с "data:"; поддерживаем многострочные data
          const dataLines = rawEvent
            .split("\n")
            .map((l) => l.trimStart())
            .filter((l) => l.startsWith("data:"))
            .map((l) => l.slice(5).trim());

          if (dataLines.length > 0) {
            const dataText = dataLines.join("\n");
            try {
              const parsed = JSON.parse(dataText) as T;
              onEvent(parsed);
            } catch (e) {
              if (onError)
                onError(e instanceof Error ? e : new Error("Invalid SSE JSON"));
            }
          }

          sepIndex = buffer.indexOf("\n\n");
        }
      }
    } catch (e) {
      // Прерывания/сеть
      const err = e instanceof Error ? e : new Error("SSE stream error");
      if (controller.signal.aborted) {
        // тихо выходим при явном abort
      } else if (onError) {
        onError(err);
      }
    } finally {
      if (onDone) onDone();
      try {
        await reader.cancel();
      } catch {
        // ignore
      }
    }
  })();

  return () => {
    controller.abort();
  };
}
