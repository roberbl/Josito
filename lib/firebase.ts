import { cookies } from 'next/headers';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};


const idTokenCookie = 'firebase-id-token';
const refreshTokenCookie = 'firebase-refresh-token';

export function firebaseApiKey() { return process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? ''; }
export function firebaseProjectId() { return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? ''; }

export function firebaseConfigError() {
  const apiKey = firebaseApiKey();
  const projectId = firebaseProjectId();
  if (!apiKey || apiKey.includes('your-api-key')) return 'Falta configurar NEXT_PUBLIC_FIREBASE_API_KEY en .env.local con la clave web real de Firebase. Después reinicia npm run dev.';
  if (!projectId || projectId.includes('your-project')) return 'Falta configurar NEXT_PUBLIC_FIREBASE_PROJECT_ID en .env.local con el ID real del proyecto Firebase. Después reinicia npm run dev.';
  return null;
}

export function firebaseAuthErrorMessage(message?: string) {
  if (!message) return 'No se ha podido completar la operación con Firebase.';
  if (message.includes('API_KEY_INVALID') || message.includes('API key not valid')) return 'La API key de Firebase no es válida. Copia la configuración web real de Firebase en .env.local y reinicia el servidor de desarrollo.';
  if (message.includes('EMAIL_EXISTS')) return 'Ya existe una cuenta con ese email.';
  if (message.includes('EMAIL_NOT_FOUND') || message.includes('INVALID_PASSWORD') || message.includes('INVALID_LOGIN_CREDENTIALS')) return 'Email o contraseña incorrectos.';
  if (message.includes('WEAK_PASSWORD')) return 'La contraseña debe tener al menos 6 caracteres.';
  if (message.includes('OPERATION_NOT_ALLOWED')) return 'Activa Email/Password en Firebase Authentication > Sign-in method.';
  return message;
}

export async function firebaseAuthRest<T>(path: string, body: unknown) {
  const configError = firebaseConfigError();
  if (configError) return { ok: false, status: 0, data: { error: { message: configError } } as T & { error?: { message?: string } } };
  const res = await fetch(`https://identitytoolkit.googleapis.com/v1/${path}?key=${firebaseApiKey()}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
    cache: 'no-store',
  });
  const json = await res.json().catch(() => ({}));
  return { ok: res.ok, status: res.status, data: json as T & { error?: { message?: string } } };
}

export async function firestoreRest<T>(path: string, options: { method?: string; token?: string | null; body?: unknown } = {}) {
  const token = options.token ?? await getIdToken();
  const res = await fetch(`https://firestore.googleapis.com/v1/projects/${firebaseProjectId()}/databases/(default)/documents/${path}`, {
    method: options.method ?? 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: options.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  const json = await res.json().catch(() => null);
  return { ok: res.ok, status: res.status, data: json as T };
}

export function stringValue(value: string) { return { stringValue: value }; }
export function numberValue(value: number) { return { doubleValue: value }; }
export function boolValue(value: boolean) { return { booleanValue: value }; }
export function timestampValue(value: string) { return { timestampValue: value }; }

export async function setFirebaseSession(idToken: string, refreshToken?: string) {
  const jar = await cookies();
  jar.set(idTokenCookie, idToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
  if (refreshToken) jar.set(refreshTokenCookie, refreshToken, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/' });
}

export async function clearFirebaseSession() {
  const jar = await cookies();
  jar.delete(idTokenCookie);
  jar.delete(refreshTokenCookie);
}

export async function getIdToken() {
  const jar = await cookies();
  return jar.get(idTokenCookie)?.value ?? null;
}

export const firebaseIdTokenCookie = idTokenCookie;
