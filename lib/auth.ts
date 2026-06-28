import { redirect } from 'next/navigation';
import { firebaseAuthRest, firestoreRest, getIdToken } from './firebase';
import type { Profile } from './types';

type FirebaseLookup = { users?: Array<{ localId: string; email?: string; displayName?: string }> };
type FirestoreDoc = { name?: string; fields?: Record<string, { stringValue?: string; doubleValue?: number; integerValue?: string; timestampValue?: string }> };

export function profileFromFirestore(doc: FirestoreDoc | null | undefined, fallback?: { id: string; email?: string; displayName?: string }): Profile | null {
  if (!doc?.fields && !fallback) return null;
  const fields = doc?.fields ?? {};
  const id = doc?.name?.split('/').pop() ?? fallback!.id;
  return {
    id,
    email: fields.email?.stringValue ?? fallback?.email ?? '',
    displayName: fields.displayName?.stringValue ?? fallback?.displayName ?? fallback?.email?.split('@')[0] ?? 'Participante',
    role: (fields.role?.stringValue as Profile['role']) ?? 'participant',
    participantStatus: (fields.participantStatus?.stringValue as Profile['participantStatus']) ?? 'pending',
    teamId: fields.teamId?.stringValue ?? null,
    teamName: fields.teamName?.stringValue ?? null,
    createdAt: fields.createdAt?.timestampValue,
    updatedAt: fields.updatedAt?.timestampValue,
    moneyWon: fields.moneyWon?.doubleValue ?? Number(fields.moneyWon?.integerValue ?? 0),
  };
}

export async function getSessionProfile() {
  const token = await getIdToken();
  if (!token) return { user: null, profile: null };
  const lookup = await firebaseAuthRest<FirebaseLookup>('accounts:lookup', { idToken: token });
  const user = lookup.data.users?.[0];
  if (!lookup.ok || !user) return { user: null, profile: null };
  const profileResponse = await firestoreRest<FirestoreDoc>(`users/${user.localId}`, { token });
  const profile = profileFromFirestore(profileResponse.ok ? profileResponse.data : null, { id: user.localId, email: user.email, displayName: user.displayName });
  return { user: { id: user.localId, email: user.email }, profile };
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
