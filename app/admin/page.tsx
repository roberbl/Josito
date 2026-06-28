import Link from 'next/link';
import { createMatchAction } from './actions';
import { requireAdmin, profileFromFirestore } from '@/lib/auth';
import { firestoreRest } from '@/lib/firebase';

type FirestoreDoc = { name?: string; fields?: Record<string, { stringValue?: string; doubleValue?: number; integerValue?: string; timestampValue?: string; booleanValue?: boolean }> };
type FirestoreList = { documents?: FirestoreDoc[] };

async function loadAdminCounts() {
  const [{ data: users }, { data: matches }] = await Promise.all([
    firestoreRest<FirestoreList>('users?pageSize=200'),
    firestoreRest<FirestoreList>('matches?pageSize=50'),
  ]);
  const realUsers = (users.documents ?? []).map((doc) => profileFromFirestore(doc)).filter(Boolean);
  return {
    pending: realUsers.filter((user) => user?.participantStatus === 'pending').length,
    active: realUsers.filter((user) => user?.participantStatus === 'active').length,
    blocked: realUsers.filter((user) => user?.participantStatus === 'blocked').length,
    matches: matches.documents?.length ?? 0,
  };
}

export default async function Admin(){await requireAdmin();const counts=await loadAdminCounts();return <div className="space-y-5"><section className="card"><p className="text-sm font-semibold uppercase text-red-600">Panel administrador</p><h1 className="text-3xl font-black">Gestión completa</h1><p className="text-slate-600">Gestiona usuarios reales de Firestore y añade partidos para que aparezcan en el inicio.</p></section><section className="grid gap-3 sm:grid-cols-4"><div className="card"><p className="text-sm font-bold text-amber-700">Pendientes</p><p className="text-4xl font-black">{counts.pending}</p></div><div className="card"><p className="text-sm font-bold text-emerald-700">Activos</p><p className="text-4xl font-black">{counts.active}</p></div><div className="card"><p className="text-sm font-bold text-red-700">Bloqueados</p><p className="text-4xl font-black">{counts.blocked}</p></div><div className="card"><p className="text-sm font-bold text-brand-700">Partidos</p><p className="text-4xl font-black">{counts.matches}</p></div></section><section className="grid gap-3 lg:grid-cols-[.8fr_1.2fr]"><Link className="card block hover:border-brand-500" href="/admin/usuarios"><h2 className="text-xl font-black">Usuarios registrados</h2><p className="text-slate-600">Activar, bloquear, cambiar roles, asignar equipos y editar dinero.</p></Link><form action={createMatchAction} className="card grid gap-3 sm:grid-cols-2"><div className="sm:col-span-2"><h2 className="text-xl font-black">Añadir partido a la jornada</h2><p className="text-sm text-slate-600">Si no añades partidos aquí, el inicio se queda vacío.</p></div><label className="text-sm font-bold">Orden<input className="input mt-1" name="order" type="number" min="1" defaultValue="1" required/></label><label className="text-sm font-bold">Tipo<select className="input mt-1" name="matchType"><option value="normal">Partido normal 1X2</option><option value="pleno">Pleno al 15 resultado exacto</option></select></label><label className="text-sm font-bold">Competición<input className="input mt-1" name="competition" placeholder="LaLiga EA Sports" required/></label><label className="text-sm font-bold">División<select className="input mt-1" name="division"><option value="primera">Primera</option><option value="segunda">Segunda</option></select></label><label className="text-sm font-bold">Equipo local<input className="input mt-1" name="homeTeam" required/></label><label className="text-sm font-bold">Equipo visitante<input className="input mt-1" name="awayTeam" required/></label><label className="text-sm font-bold sm:col-span-2">Fecha/hora<input className="input mt-1" name="startsAt" type="datetime-local" required/></label><button className="btn sm:col-span-2">Añadir partido y actualizar inicio</button></form></section></div>}
