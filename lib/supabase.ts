import { cookies } from 'next/headers';

type QueryOptions = { method?: string; body?: unknown; token?: string | null; prefer?: string };
const accessCookie = 'sb-access-token';
const refreshCookie = 'sb-refresh-token';

export function supabaseUrl() { return process.env.NEXT_PUBLIC_SUPABASE_URL!; }
export function supabaseAnonKey() { return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!; }

export async function supabaseAuth(path: string, options: QueryOptions = {}) {
  const res = await fetch(`${supabaseUrl()}/auth/v1${path}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: supabaseAnonKey(),
      'Content-Type': 'application/json',
      ...(options.token ? { Authorization: `Bearer ${options.token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json };
}

export async function supabaseRest<T>(table: string, query = '', options: QueryOptions = {}) {
  const token = options.token ?? (await getAccessToken());
  const res = await fetch(`${supabaseUrl()}/rest/v1/${table}${query}`, {
    method: options.method ?? 'GET',
    headers: {
      apikey: supabaseAnonKey(),
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token ?? supabaseAnonKey()}`,
      ...(options.prefer ? { Prefer: options.prefer } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: json as T };
}

export async function setSessionCookies(accessToken: string, refreshToken?: string) {
  const jar = await cookies();
  jar.set(accessCookie, accessToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  if (refreshToken) jar.set(refreshCookie, refreshToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
}

export async function clearSessionCookies() {
  const jar = await cookies();
  jar.delete(accessCookie);
  jar.delete(refreshCookie);
}

export async function getAccessToken() {
  const jar = await cookies();
  return jar.get(accessCookie)?.value ?? null;
}

export const authCookieName = accessCookie;
