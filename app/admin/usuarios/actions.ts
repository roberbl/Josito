'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { firestoreRest, numberValue, stringValue, timestampValue } from '@/lib/firebase';
import type { ParticipantStatus, Role } from '@/lib/types';

export async function updateUserAction(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get('id'));
  const role = String(formData.get('role')) as Role;
  const participantStatus = String(formData.get('participantStatus')) as ParticipantStatus;
  const teamId = String(formData.get('teamId') || '');
  const amount = Number(formData.get('moneyWon') || 0);
  const now = new Date().toISOString();
  const teamResponse = teamId ? await firestoreRest<{ fields?: { name?: { stringValue?: string } } }>(`teams/${teamId}`) : null;
  const teamName = teamResponse?.data?.fields?.name?.stringValue ?? '';
  await firestoreRest(`users/${id}?updateMask.fieldPaths=role&updateMask.fieldPaths=participantStatus&updateMask.fieldPaths=teamId&updateMask.fieldPaths=teamName&updateMask.fieldPaths=moneyWon&updateMask.fieldPaths=updatedAt`, {
    method: 'PATCH',
    body: { fields: { role: stringValue(role), participantStatus: stringValue(participantStatus), teamId: stringValue(teamId), teamName: stringValue(teamName), moneyWon: numberValue(amount), updatedAt: timestampValue(now) } },
  });
  await firestoreRest(`moneyWinnings/${id}`, { method: 'PATCH', body: { fields: { userId: stringValue(id), amount: numberValue(amount), updatedAt: timestampValue(now) } } });
  await firestoreRest('auditLogs', { method: 'POST', body: { fields: { action: stringValue('admin.updateUser'), entity: stringValue('users'), entityId: stringValue(id), createdAt: timestampValue(now) } } });
  revalidatePath('/admin/usuarios');
}
