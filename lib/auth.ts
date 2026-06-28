import { redirect } from 'next/navigation';
import { getAccessToken, supabaseAuth, supabaseRest } from './supabase';
import type { Profile } from './types';

type ProfileRow = Profile & { teams?: { name?: string } | { name?: string }[] };

type SupabaseUser = { id: string; email?: string };

export async function getSessionProfile() {
  const token = await getAccessToken();
  if (!token) return { user: null, profile: null };
  const userResponse = await supabaseAuth('/user', { token });
  if (!userResponse.ok) return { user: null, profile: null };
  const user = userResponse.data as SupabaseUser;
  const profileResponse = await supabaseRest<ProfileRow[]>('profiles', `?select=id,email,display_name,role,participant_status,team_id,created_at,updated_at,teams(name)&id=eq.${user.id}`, { token });
  const row = profileResponse.data?.[0];
  const profile = row ? {
    ...row,
    team_name: Array.isArray(row.teams) ? row.teams[0]?.name : row.teams?.name,
  } as Profile : null;
  return { user, profile };
}

export async function requireUser() {
  const session = await getSessionProfile();
  if (!session.user) redirect('/login');
  return session;
}

export async function requireAdmin() {
  const session = await requireUser();
  if (session.profile?.role !== 'admin') redirect('/');
  return session;
}
