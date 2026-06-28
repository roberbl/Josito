import { cookies } from 'next/headers';
import { initializeApp, getApps, type FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY!,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN!,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET!,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID!,
};

export function getFirebaseApp(): FirebaseApp {
  return getApps().length ? getApps()[0] : initializeApp(firebaseConfig);
}

export const firebaseAuth = () => getAuth(getFirebaseApp());
export const firebaseDb = () => getFirestore(getFirebaseApp());

const idTokenCookie = 'firebase-id-token';
const refreshTokenCookie = 'firebase-refresh-token';

export function firebaseApiKey() { return process.env.NEXT_PUBLIC_FIREBASE_API_KEY!; }
export function firebaseProjectId() { return process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID!; }

export async function firebaseAuthRest<T>(path: string, body: unknown) {
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
