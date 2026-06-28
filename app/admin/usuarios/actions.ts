'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { supabaseRest } from '@/lib/supabase';
import type { ParticipantStatus, Role } from '@/lib/types';

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const role = String(formData.get('role')) as Role;
  const participant_status = String(formData.get('participant_status')) as ParticipantStatus;
  const team_id = String(formData.get('team_id') || '') || null;
  const amount = Number(formData.get('money_won') || 0);
  await supabaseRest('profiles', `?id=eq.${id}`, { method: 'PATCH', body: { role, participant_status, team_id, updated_at: new Date().toISOString() }, prefer: 'return=minimal' });
  await supabaseRest('money_winnings', '?on_conflict=profile_id', { method: 'POST', body: { profile_id: id, amount, updated_at: new Date().toISOString() }, prefer: 'resolution=merge-duplicates,return=minimal' });
  await supabaseRest('audit_logs', '', { method: 'POST', body: { action: 'admin.update_user', entity: 'profiles', entity_id: id, payload: { role, participant_status, team_id, amount } }, prefer: 'return=minimal' });
  revalidatePath('/admin/usuarios');
}
