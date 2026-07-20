import type { SearchFilters } from "./beltramiScraper";

const SEARCH_TTL_MS = 10 * 60 * 1000;

export interface CachedBeltramiSearch {
  expiresAt: number;
  formFields: Record<string, string>;
  cookies: ReadonlyArray<readonly [string, string]>;
  bookIds: ReadonlyArray<string>;
}

interface CachedRoster {
  expiresAt: number;
  rows: unknown[];
  searchToken: string;
}

const searchByToken = new Map<string, CachedBeltramiSearch>();
const rosterByFilters = new Map<string, CachedRoster>();

export function normalizeSearchFilters(filters: SearchFilters): SearchFilters {
  return {
    lastName: (filters.lastName ?? "").trim(),
    firstName: (filters.firstName ?? "").trim(),
    gender: filters.gender ?? null,
    dob: (filters.dob ?? "").trim().slice(0, 4),
  };
}

export function filtersToCacheKey(filters: SearchFilters): string {
  const normalized = normalizeSearchFilters(filters);
  return JSON.stringify([
    normalized.lastName,
    normalized.firstName,
    normalized.gender ?? "",
    normalized.dob,
  ]);
}

export function newBeltramiSearchToken(): string {
  return crypto.randomUUID();
}

export function putBeltramiSearch(
  token: string,
  entry: Omit<CachedBeltramiSearch, "expiresAt">,
) {
  searchByToken.set(token, {
    ...entry,
    expiresAt: Date.now() + SEARCH_TTL_MS,
  });
}

export function getBeltramiSearch(token: string): CachedBeltramiSearch | null {
  const entry = searchByToken.get(token);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    searchByToken.delete(token);
    return null;
  }
  return entry;
}

export function putRosterCache(
  key: string,
  entry: Omit<CachedRoster, "expiresAt">,
) {
  rosterByFilters.set(key, {
    ...entry,
    expiresAt: Date.now() + SEARCH_TTL_MS,
  });
}

export function getRosterCache<T>(key: string): { rows: T[]; searchToken: string } | null {
  const entry = rosterByFilters.get(key);
  if (!entry) return null;
  if (entry.expiresAt < Date.now()) {
    rosterByFilters.delete(key);
    return null;
  }
  return { rows: entry.rows as T[], searchToken: entry.searchToken };
}

export function pruneBeltramiCaches() {
  const now = Date.now();
  for (const [token, entry] of searchByToken) {
    if (entry.expiresAt < now) searchByToken.delete(token);
  }
  for (const [key, entry] of rosterByFilters) {
    if (entry.expiresAt < now) rosterByFilters.delete(key);
  }
}
