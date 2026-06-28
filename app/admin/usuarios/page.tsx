import { requireAdmin } from '@/lib/auth';
import { supabaseRest } from '@/lib/supabase';
import { profiles as demoProfiles, teams as demoTeams } from '@/lib/demo-data';
import { updateUserAction } from './actions';
import type { Profile, Team } from '@/lib/types';

type AdminProfileRow = Profile & { teams?: { name?: string } | { name?: string }[]; money_winnings?: { amount?: number } | { amount?: number }[] };

async function loadUsers() {
  const [{ data: users }, { data: teams }] = await Promise.all([
    supabaseRest<AdminProfileRow[]>('profiles', '?select=id,email,display_name,role,participant_status,team_id,created_at,updated_at,teams(name),money_winnings(amount)&order=created_at.desc'),
    supabaseRest<Team[]>('teams', '?select=id,name,color&order=name'),
  ]);
  const normalized = users?.map((u) => ({
    id: u.id,
    email: u.email,
    display_name: u.display_name,
    role: u.role,
    participant_status: u.participant_status,
    team_id: u.team_id,
    team_name: Array.isArray(u.teams) ? u.teams[0]?.name : u.teams?.name,
    created_at: u.created_at,
    updated_at: u.updated_at,
    money_won: Array.isArray(u.money_winnings) ? Number(u.money_winnings[0]?.amount ?? 0) : Number(u.money_winnings?.amount ?? 0),
  })) as Profile[] | undefined;
  return { users: normalized?.length ? normalized : demoProfiles, teams: (teams?.length ? teams : demoTeams) as Team[] };
}

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<{ q?: string; role?: string; status?: string; team?: string }> }) {
  await requireAdmin();
  const params = await searchParams;
  const { users, teams } = await loadUsers();
  const filtered = users.filter((user) => {
    const q = params.q?.toLowerCase() ?? '';
    return (!q || user.display_name.toLowerCase().includes(q) || user.email.toLowerCase().includes(q)) && (!params.role || user.role === params.role) && (!params.status || user.participant_status === params.status) && (!params.team || user.team_id === params.team);
  });
  return <div className="space-y-5"><section className="card"><p className="text-sm font-black uppercase text-red-600">Admin</p><h1 className="text-3xl font-black">Usuarios registrados</h1><p className="text-slate-600">Gestiona altas públicas, participantes oficiales, roles, equipos y dinero ganado.</p></section><form className="card grid gap-3 md:grid-cols-4"><input className="input" name="q" placeholder="Buscar nombre/email" defaultValue={params.q}/><select className="input" name="role" defaultValue={params.role ?? ''}><option value="">Todos los roles</option><option value="participant">Participante</option><option value="admin">Admin</option></select><select className="input" name="status" defaultValue={params.status ?? ''}><option value="">Todos los estados</option><option value="pending">Pendiente</option><option value="active">Activo</option><option value="blocked">Bloqueado</option></select><button className="btn">Filtrar</button></form><section className="grid gap-3">{filtered.map((user)=><article key={user.id} className="card"><div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between"><div><div className="flex flex-wrap items-center gap-2"><h2 className="text-xl font-black">{user.display_name}</h2><span className="status-pill bg-slate-100 text-slate-700">{user.role}</span><span className="status-pill bg-brand-50 text-brand-700">{user.participant_status}</span></div><p className="text-sm text-slate-600">{user.email}</p><p className="mt-1 text-xs text-slate-500">Alta: {user.created_at ? new Date(user.created_at).toLocaleDateString('es-ES') : '—'} · Equipo: {user.team_name ?? 'Sin equipo'}</p><div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs"><span className="rounded-2xl bg-slate-50 p-2"><b className="block">Sí</b>J1 enviada</span><span className="rounded-2xl bg-slate-50 p-2"><b className="block">80</b>Puntos</span><span className="rounded-2xl bg-slate-50 p-2"><b className="block">{user.money_won ?? 0}€</b>Dinero</span></div></div><form action={updateUserAction} className="grid gap-2 sm:grid-cols-2 lg:min-w-[520px]"><input type="hidden" name="id" value={user.id}/><select className="input" name="role" defaultValue={user.role}><option value="participant">participant</option><option value="admin">admin</option></select><select className="input" name="participant_status" defaultValue={user.participant_status}><option value="pending">pending</option><option value="active">active</option><option value="blocked">blocked</option></select><select className="input" name="team_id" defaultValue={user.team_id ?? ''}><option value="">Sin equipo</option>{teams.map((team)=><option key={team.id} value={team.id}>{team.name}</option>)}</select><input className="input" name="money_won" type="number" step="0.01" defaultValue={user.money_won ?? 0}/><button className="btn sm:col-span-2">Guardar cambios</button></form></div></article>)}</section></div>;
}
