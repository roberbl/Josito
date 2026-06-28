import { requireAdmin, profileFromFirestore } from '@/lib/auth';
import { firestoreRest } from '@/lib/firebase';
import { updateUserAction } from './actions';
import type { Profile, Team } from '@/lib/types';

type FirestoreList<T> = { documents?: T[] };
type FirestoreDoc = { name?: string; fields?: Record<string, { stringValue?: string; doubleValue?: number; integerValue?: string; timestampValue?: string }> };

async function loadUsers() {
  const [{ data: users }, { data: teams }] = await Promise.all([
    firestoreRest<FirestoreList<FirestoreDoc>>('users?pageSize=200&orderBy=createdAt desc'),
    firestoreRest<FirestoreList<FirestoreDoc>>('teams?pageSize=50&orderBy=name'),
  ]);
  const normalized = users?.documents?.map((doc) => profileFromFirestore(doc)).filter(Boolean) as Profile[] | undefined;
  const normalizedTeams = teams?.documents?.map((doc) => ({ id: doc.name?.split('/').pop() ?? '', name: doc.fields?.name?.stringValue ?? 'Equipo', color: doc.fields?.color?.stringValue })) as Team[] | undefined;
  return { users: normalized ?? [], teams: normalizedTeams ?? [] };
}

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string; team?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const { users, teams } = await loadUsers();
  const filtered = users.filter((user) => {
    const q = params.q?.toLowerCase() ?? '';
    return (!q || user.displayName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)) && (!params.role || user.role === params.role) && (!params.status || user.participantStatus === params.status) && (!params.team || user.teamId === params.team);
  });
  return <div className="space-y-5"><section className="card"><p className="text-sm font-black uppercase text-red-600">Admin</p><h1 className="text-3xl font-black">Usuarios registrados</h1><p className="text-slate-600">Gestiona altas públicas, participantes oficiales, roles, equipos y dinero ganado.</p></section><form className="card grid gap-3 md:grid-cols-4"><input className="input" name="q" placeholder="Buscar nombre/email" defaultValue={params.q}/><select className="input" name="role" defaultValue={params.role ?? ''}><option value="">Todos los roles</option><option value="participant">Participante</option><option value="admin">Admin</option></select><select className="input" name="status" defaultValue={params.status ?? ''}><option value="">Todos los estados</option><option value="pending">Pendiente</option><option value="active">Activo</option><option value="blocked">Bloqueado</option></select><button className="btn">Filtrar</button></form><section className="grid gap-3">{filtered.map((user)=><article key={user.id} className="card"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">{user.displayName}</h2><span className="status-pill bg-slate-100 text-slate-700">{user.role}</span><span className="status-pill bg-brand-50 text-brand-700">{user.participantStatus}</span></div><p className="text-sm text-slate-600">{user.email}</p><p className="mt-1 text-xs text-slate-500">Alta: {user.createdAt ? new Date(user.createdAt).toLocaleDateString('es-ES') : '—'} · Equipo: {user.teamName ?? 'Sin equipo'}</p><div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><span className="rounded-2xl bg-slate-50 p-2"><b className="block">Sí</b>J1 enviada</span><span className="rounded-2xl bg-slate-50 p-2"><b className="block">80</b>Puntos</span><span className="rounded-2xl bg-slate-50 p-2"><b className="block">{user.moneyWon ?? 0}€</b>Dinero</span></div></div><form action={updateUserAction} className="grid gap-2 sm:grid-cols-2 lg:min-w-[520px]"><input type="hidden" name="id" value={user.id}/><select className="input" name="role" defaultValue={user.role}><option value="participant">participant</option><option value="admin">admin</option></select><select className="input" name="participantStatus" defaultValue={user.participantStatus}><option value="pending">pending</option><option value="active">active</option><option value="blocked">blocked</option></select><select className="input" name="teamId" defaultValue={user.teamId ?? ''}><option value="">Sin equipo</option>{teams.map((team)=><option key={team.id} value={team.id}>{team.name}</option>)}</select><input type="hidden" name="teamName" value={teams.find((team) => team.id === user.teamId)?.name ?? ''}/><input className="input" name="moneyWon" type="number" step="0.01" defaultValue={user.moneyWon ?? 0}/><button className="btn sm:col-span-2">Guardar cambios</button></form></div></article>)}</section></div>;
}
