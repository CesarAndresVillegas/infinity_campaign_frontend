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
