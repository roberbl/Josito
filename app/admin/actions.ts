'use server';

import { revalidatePath } from 'next/cache';
import { requireAdmin } from '@/lib/auth';
import { boolValue, firestoreRest, numberValue, stringValue, timestampValue } from '@/lib/firebase';

export async function createMatchAction(formData: FormData) {
  await requireAdmin();
  const order = Number(formData.get('order') || 1);
  const matchType = String(formData.get('matchType') || 'normal');
  const now = new Date().toISOString();
  await firestoreRest('matches', {
    method: 'POST',
    body: {
      fields: {
        order: numberValue(order),
        competition: stringValue(String(formData.get('competition') || '')),
        homeTeam: stringValue(String(formData.get('homeTeam') || '')),
        awayTeam: stringValue(String(formData.get('awayTeam') || '')),
        startsAt: timestampValue(String(formData.get('startsAt') || now)),
        division: stringValue(String(formData.get('division') || 'primera')),
        matchType: stringValue(matchType),
        isPleno: boolValue(matchType === 'pleno'),
        createdAt: timestampValue(now),
        updatedAt: timestampValue(now),
      },
    },
  });
  revalidatePath('/');
  revalidatePath('/admin');
}
