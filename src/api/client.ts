const BASE_URL = import.meta.env.VITE_API_BASE_URL;

interface RequestOptions extends RequestInit {
  token?: string;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { token, headers, ...rest } = options;
  const res = await fetch(`${BASE_URL}${path}`, {
    ...rest,
    headers: {
      "content-type": "application/json",
      ...(token ? { authorization: `Bearer ${token}` } : {}),
      ...headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  if (res.status === 204) return undefined as T;
  return res.json() as Promise<T>;
}

export interface Faction {
  id: string;
  name: string;
  logo_url: string | null;
}

export function listFactions(): Promise<Faction[]> {
  return request<Faction[]>("/factions");
}

export interface UserFaction {
  user_id: string;
  faction_id: string;
  points: number;
  rank: number;
  created_at: string;
}

export interface Me {
  id: string;
  email: string;
  created_at: string;
  factions: UserFaction[];
}

export function getMe(token: string): Promise<Me> {
  return request<Me>("/me", { token });
}

export function registerFaction(token: string, factionId: string): Promise<UserFaction> {
  return request<UserFaction>("/me/factions", {
    method: "POST",
    token,
    body: JSON.stringify({ factionId }),
  });
}

export interface Country {
  code: string;
  name: string;
  dominant_faction_id: string | null;
  is_active: boolean;
}

export function listCountries(): Promise<Country[]> {
  return request<Country[]>("/countries");
}

export type MatchResult = "win" | "draw" | "loss";

export interface Match {
  id: string;
  user_id: string;
  faction_id: string;
  country_code: string;
  opponent_user_id: string | null;
  opponent_faction_id: string;
  result: MatchResult;
  base_score: number;
  text: string | null;
  views_count: number;
  created_at: string;
}

export interface MatchWithLikes extends Match {
  likes_count: number;
}

export interface MatchImage {
  id: string;
  url: string;
  sort_order: number;
}

export interface MatchDetail extends MatchWithLikes {
  images: MatchImage[];
}

export interface CreateMatchInput {
  factionId: string;
  countryCode: string;
  opponentFactionId: string;
  result: MatchResult;
  text?: string;
  imageUrls?: string[];
}

export function createMatch(token: string, input: CreateMatchInput): Promise<Match> {
  return request<Match>("/matches", {
    method: "POST",
    token,
    body: JSON.stringify(input),
  });
}

export function listMatches(limit = 20, offset = 0): Promise<MatchWithLikes[]> {
  return request<MatchWithLikes[]>(`/matches?limit=${limit}&offset=${offset}`);
}

export function getMatch(matchId: string): Promise<MatchDetail> {
  return request<MatchDetail>(`/matches/${matchId}`);
}

export function listUserMatches(userId: string, limit = 20, offset = 0): Promise<MatchWithLikes[]> {
  return request<MatchWithLikes[]>(`/users/${userId}/matches?limit=${limit}&offset=${offset}`);
}

export function likeMatch(token: string, matchId: string): Promise<void> {
  return request<void>(`/matches/${matchId}/like`, { method: "POST", token });
}

export function unlikeMatch(token: string, matchId: string): Promise<void> {
  return request<void>(`/matches/${matchId}/like`, { method: "DELETE", token });
}

export function addMatchView(matchId: string): Promise<void> {
  return request<void>(`/matches/${matchId}/views`, { method: "POST" });
}
