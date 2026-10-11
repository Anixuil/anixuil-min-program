export type MatchMode = "single" | "rotation" | "fixed";
export type MatchStatus = "draft" | "scheduled" | "active" | "finished" | "cancelled";
export interface Account { id: string; nickname: string; email: string | null; wechatBound: boolean; emailLoginEnabled?: boolean }
export interface MatchInput { name: string; location: string; description: string; startsAt: string; endsAt: string; mode: MatchMode; courtCount: number; gameCount: number; seed: number }
export interface Competition extends MatchInput { id: string; ownerId: string; status: MatchStatus; version: number; _count?: { players: number; games: number } }
export type CompetitionSummary = Pick<Competition, "id" | "name" | "location" | "startsAt" | "endsAt" | "status" | "mode" | "ownerId" | "version" | "courtCount" | "_count">;
export interface Player { id: string; name: string; userId: string | null; pairKey: string | null; position: number }
export interface Fixture { sequence: number; round: number; court: number; teamA: string[]; teamB: string[] }
export interface Game extends Fixture { id: string; status: "pending" | "completed" | "cancelled"; scoreA: number | null; scoreB: number | null; version: number; cheeringClosedAt: string | null }
export interface Standing { id: string; name: string; rank: number; played: number; wins: number; losses: number; pointsFor: number; pointsAgainst: number; difference: number; winRate: number }
export interface Detail { match: Competition; players: Player[]; games: Game[]; totalGames: number; stats: Standing[]; teamStats: Standing[]; permissions: { manage: boolean; claim: boolean; shareResults: boolean; recordGameIds: string[] } }
export interface ResultShareLink { matchId: string; token: string }
export interface PublicMatchResult {
  match: Pick<Competition, "id" | "name" | "location" | "startsAt" | "endsAt" | "mode" | "courtCount"> & { status: "finished" };
  players: Pick<Player, "id" | "name" | "position">[];
  games: Pick<Game, "id" | "sequence" | "round" | "court" | "teamA" | "teamB" | "status" | "scoreA" | "scoreB">[];
  totalGames: number;
  stats: Standing[];
  teamStats: Standing[];
}
export interface Preview { version: number; games: Fixture[]; appearances: { playerId: string; name: string; count: number }[]; rounds: { number: number; resting: string[] }[] }
export interface PersonalStats { matchCount: number; gameCount: number; wins: number; losses: number; pointsFor: number; pointsAgainst: number; winRate: number }
export interface Page<T> { list: T[]; total: number; page: number; pageSize: number }

