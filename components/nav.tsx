import Link from 'next/link';
import type { Profile } from '@/lib/types';

const mainLinks = [
  ['/', 'Inicio', '🏠'],
  ['/clasificacion', 'Clasif.', '🏆'],
  ['/tablas', 'Tablas', '📋'],
  ['/instrucciones', 'Reglas', 'ℹ️'],
  ['/perfil', 'Perfil', '👤'],
];

export function Nav({ profile }: { profile?: Profile | null }) {
  const isAdmin = profile?.role === 'admin';
  return <><header className="sticky top-0 z-20 border-b bg-white/95 backdrop-blur"><nav className="mx-auto flex max-w-6xl items-center gap-2 px-4 py-3"><Link href="/" className="mr-auto leading-tight"><span className="block text-base font-black text-brand-700 sm:text-lg">Quiniela Familiar</span><span className="block text-xs font-semibold text-slate-500">Temporada 2026/2027</span></Link><div className="hidden items-center gap-1 md:flex">{mainLinks.map(([href,label])=><Link key={href} href={href} className="rounded-full px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100">{label}</Link>)}{isAdmin ? <Link href="/admin" className="rounded-full bg-slate-900 px-3 py-2 text-sm font-semibold text-white">Admin</Link> : null}</div></nav></header><nav className="fixed inset-x-0 bottom-0 z-30 border-t bg-white/95 px-2 py-2 shadow-2xl backdrop-blur md:hidden"><div className="mx-auto grid max-w-md grid-cols-5 gap-1">{mainLinks.map(([href,label,icon])=><Link key={href} href={href} className="rounded-2xl px-2 py-2 text-center text-[11px] font-bold text-slate-700 hover:bg-brand-50"><span className="block text-lg">{icon}</span>{label}</Link>)}</div>{isAdmin ? <Link href="/admin" className="mx-auto mt-1 block max-w-md rounded-2xl bg-slate-900 py-2 text-center text-xs font-black text-white">Panel admin</Link> : null}</nav></>;
}
