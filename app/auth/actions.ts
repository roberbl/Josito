'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { clearSessionCookies, setSessionCookies, supabaseAuth } from '@/lib/supabase';

const loginSchema = z.object({ email: z.string().email(), password: z.string().min(6) });
const registerSchema = loginSchema.extend({ displayName: z.string().min(2), confirmPassword: z.string().min(6) }).refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Las contraseñas no coinciden.' });

export async function loginAction(_: unknown, formData: FormData) {
  const parsed = loginSchema.safeParse({ email: formData.get('email'), password: formData.get('password') });
  if (!parsed.success) return { error: 'Revisa el email y la contraseña.' };
  const response = await supabaseAuth('/token?grant_type=password', { method: 'POST', body: parsed.data });
  if (!response.ok) return { error: 'No hemos podido iniciar sesión. Comprueba tus credenciales.' };
  await setSessionCookies(response.data.access_token, response.data.refresh_token);
  revalidatePath('/', 'layout');
  redirect('/');
}

export async function registerAction(_: unknown, formData: FormData) {
  const parsed = registerSchema.safeParse({ displayName: formData.get('displayName'), email: formData.get('email'), password: formData.get('password'), confirmPassword: formData.get('confirmPassword') });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'Revisa los datos de registro.' };
  const response = await supabaseAuth('/signup', { method: 'POST', body: { email: parsed.data.email, password: parsed.data.password, data: { display_name: parsed.data.displayName } } });
  if (!response.ok) return { error: response.data.msg ?? response.data.message ?? 'No se ha podido crear la cuenta.' };
  if (response.data.access_token) await setSessionCookies(response.data.access_token, response.data.refresh_token);
  revalidatePath('/', 'layout');
  redirect('/perfil?registro=ok');
}

export async function signOutAction() {
  await clearSessionCookies();
  redirect('/login');
}
