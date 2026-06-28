'use client';

import Link from 'next/link';
import { useActionState } from 'react';
import { loginAction, registerAction } from '@/app/auth/actions';

const initialState = { error: '' };

export function LoginForm() {
  const [state, action, pending] = useActionState(loginAction, initialState);
  return <form action={action} className="card mx-auto max-w-md space-y-4"><div><p className="text-sm font-bold uppercase text-brand-700">Bienvenido</p><h1 className="text-3xl font-black">Iniciar sesión</h1><p className="text-sm text-slate-600">Entra con tu email y contraseña para acceder a la quiniela.</p></div>{state?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{state.error}</p> : null}<label className="block text-sm font-semibold">Email<input className="input mt-1 min-h-12" name="email" type="email" autoComplete="email" required /></label><label className="block text-sm font-semibold">Contraseña<input className="input mt-1 min-h-12" name="password" type="password" autoComplete="current-password" required /></label><button className="btn min-h-12 w-full text-base" disabled={pending}>{pending ? 'Entrando…' : 'Entrar'}</button><p className="text-center text-sm text-slate-600">¿No tienes cuenta? <Link className="font-bold text-brand-700" href="/registro">Regístrate</Link></p></form>;
}

export function RegisterForm() {
  const [state, action, pending] = useActionState(registerAction, initialState);
  return <form action={action} className="card mx-auto max-w-md space-y-4"><div><p className="text-sm font-bold uppercase text-brand-700">Registro público</p><h1 className="text-3xl font-black">Crear cuenta</h1><p className="text-sm text-slate-600">Cualquier persona con el enlace puede registrarse. El admin activará a los participantes oficiales.</p></div>{state?.error ? <p className="rounded-2xl bg-red-50 p-3 text-sm font-semibold text-red-700">{state.error}</p> : null}<label className="block text-sm font-semibold">Nombre visible<input className="input mt-1 min-h-12" name="displayName" required /></label><label className="block text-sm font-semibold">Email<input className="input mt-1 min-h-12" name="email" type="email" autoComplete="email" required /></label><label className="block text-sm font-semibold">Contraseña<input className="input mt-1 min-h-12" name="password" type="password" autoComplete="new-password" required /></label><label className="block text-sm font-semibold">Confirmar contraseña<input className="input mt-1 min-h-12" name="confirmPassword" type="password" autoComplete="new-password" required /></label><button className="btn min-h-12 w-full text-base" disabled={pending}>{pending ? 'Creando…' : 'Crear cuenta'}</button><p className="text-center text-sm text-slate-600">¿Ya tienes cuenta? <Link className="font-bold text-brand-700" href="/login">Inicia sesión</Link></p></form>;
}
