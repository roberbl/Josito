'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearFirebaseSession, firebaseAuthErrorMessage, firebaseAuthRest, firestoreRest, setFirebaseSession, stringValue, timestampValue } from '@/lib/firebase';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const registerSchema = loginSchema.extend({ displayName: z.string().min(2), confirmPassword: z.string().min(6) }).refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' });
type AuthResponse = { idToken: string; refreshToken: string; localId: string; email: string; displayName?: string; error?: { message?: string } };

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Revisa el email y la contraseña.' };
  const response = await firebaseAuthRest<AuthResponse>('accounts:signInWithPassword', { ...parsed.data, returnSecureToken: true });
  if (!response.ok) return { error: firebaseAuthErrorMessage(response.data.error?.message) };
  await setFirebaseSession(response.data.idToken, response.data.refreshToken);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({ displayName: formData.get('displayName'), email: formData.get('email'), password: formData.get('password'), confirmPassword: formData.get('confirmPassword') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos de registro.' };
  const response = await firebaseAuthRest<AuthResponse>('accounts:signUp', { email: parsed.data.email, password: parsed.data.password, returnSecureToken: true });
  if (!response.ok) return { error: firebaseAuthErrorMessage(response.data.error?.message) };
  const now = new Date().toISOString();
  await setFirebaseSession(response.data.idToken, response.data.refreshToken);
  await firestoreRest(`users/${response.data.localId}`, { method: 'PATCH', token: response.data.idToken, body: { fields: { email: stringValue(parsed.data.email), displayName: stringValue(parsed.data.displayName), role: stringValue('participant'), participantStatus: stringValue('pending'), createdAt: timestampValue(now), updatedAt: timestampValue(now) } } });
  revalidatePath('/', 'layout');
  redirect('/perfil?registro=ok');
}

export async function signOutAction() {
  await clearFirebaseSession();
  redirect('/login');
}
