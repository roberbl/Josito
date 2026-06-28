import type { Match, Participant, Profile, Team } from './types';

export const teams: Team[] = [
  { id: 't1', name: 'Equipo 1', color: '#0ea5e9' },
  { id: 't2', name: 'Equipo 2', color: '#22c55e' },
  { id: 't3', name: 'Equipo 3', color: '#f97316' },
  { id: 't4', name: 'Equipo 4', color: '#a855f7' },
];

export const profiles: Profile[] = Array.from({ length: 12 }, (_, i) => ({
  id: `p${i + 1}`,
  email: `participante${i + 1}@example.com`,
  display_name: ['José', 'Ana', 'Luis', 'Marta', 'Pablo', 'Laura', 'Diego', 'Sofía', 'Javi', 'Carmen', 'Raúl', 'Elena'][i],
  role: i === 0 ? 'admin' : 'participant',
  participant_status: i < 9 ? 'active' : i === 9 ? 'pending' : 'blocked',
  team_id: teams[Math.floor(i / 3)]?.id,
  team_name: teams[Math.floor(i / 3)]?.name,
  money_won: i === 0 ? 25 : 0,
  created_at: '2026-07-01T10:00:00Z',
  updated_at: '2026-07-01T10:00:00Z',
}));

export const participants: Participant[] = profiles.map((profile, i) => ({
  id: profile.id,
  display_name: profile.display_name,
  role: profile.role,
  team_name: profile.team_name ?? undefined,
  status: profile.participant_status,
  money_won: profile.money_won,
  copitas: i === 0 ? 1 : 0,
}));

export const matches: Match[] = Array.from({ length: 14 }, (_, i) => ({
  id: `m${i + 1}`,
  order: i + 1,
  competition: i % 2 ? 'LaLiga Hypermotion' : 'LaLiga EA Sports',
  home_team: `Local ${i + 1}`,
  away_team: `Visitante ${i + 1}`,
  starts_at: '2026-08-22T18:00:00Z',
  division: i % 2 ? 'segunda' : 'primera',
  is_pleno: i === 13,
  result: (['1', 'X', '2'] as const)[i % 3],
  pleno_score: i === 13 ? '2-1' : undefined,
}));

export const round = {
  number: 1,
  name: 'Jornada inaugural',
  status: 'published',
  published_at: '2026-08-15T12:00:00Z',
  deadline_at: '2026-08-21T20:00:00Z',
};
