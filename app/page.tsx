import { RoundBoard } from '@/components/round-board';
import { requireUser, profileFromFirestore } from '@/lib/auth';
import { firestoreRest } from '@/lib/firebase';
import type { Match, Participant } from '@/lib/types';

type FirestoreValue = { stringValue?: string; doubleValue?: number; integerValue?: string; timestampValue?: string; booleanValue?: boolean };
type FirestoreDoc = { name?: string; fields?: Record<string, FirestoreValue> };
type FirestoreList = { documents?: FirestoreDoc[] };

function numberFrom(value?: FirestoreValue, fallback = 0) {
  return value?.doubleValue ?? Number(value?.integerValue ?? fallback);
}

function matchFromFirestore(doc: FirestoreDoc): Match {
  const fields = doc.fields ?? {};
  return {
    id: doc.name?.split('/').pop() ?? crypto.randomUUID(),
    order: numberFrom(fields.order, 1),
    competition: fields.competition?.stringValue ?? '',
    home_team: fields.homeTeam?.stringValue ?? '',
    away_team: fields.awayTeam?.stringValue ?? '',
    starts_at: fields.startsAt?.timestampValue ?? new Date().toISOString(),
    division: fields.division?.stringValue === 'segunda' ? 'segunda' : 'primera',
    is_pleno: fields.isPleno?.booleanValue ?? fields.matchType?.stringValue === 'pleno',
  };
}

async function loadHomeData() {
  const [{ data: matchesData }, { data: usersData }] = await Promise.all([
    firestoreRest<FirestoreList>('matches?pageSize=50&orderBy=order'),
    firestoreRest<FirestoreList>('users?pageSize=200&orderBy=displayName'),
  ]);
  const matches = (matchesData.documents ?? []).map(matchFromFirestore).sort((a, b) => a.order - b.order);
  const participants = (usersData.documents ?? [])
    .map((doc) => profileFromFirestore(doc))
    .flatMap((user) => user && user.participantStatus === 'active' ? [{ id: user.id, displayName: user.displayName, role: user.role, teamName: user.teamName ?? undefined, status: user.participantStatus, moneyWon: user.moneyWon } satisfies Participant] : []);
  return { matches, participants };
}

export default async function Home(){const {profile}=await requireUser();const {matches,participants}=await loadHomeData();return <RoundBoard profile={profile} matches={matches} participants={participants}/>}
