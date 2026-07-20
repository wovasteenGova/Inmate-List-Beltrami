import type { H3Event } from "h3";

export interface BeltramiSearchQuery {
  lastName: string;
  firstName: string;
  gender: string | null;
  dob: string;
  includeImages: boolean;
  bookId: string;
  rowIndex: number | null;
  searchToken: string;
}

function queryString(value: unknown): string {
  if (value == null) return "";
  if (Array.isArray(value)) return String(value[0] ?? "");
  return String(value);
}

function queryBool(value: unknown, defaultValue = false): boolean {
  const raw = queryString(value).trim().toLowerCase();
  if (!raw) return defaultValue;
  return raw === "1" || raw === "true" || raw === "yes";
}

function queryInt(value: unknown): number | null {
  const raw = queryString(value).trim();
  if (!raw) return null;
  const n = Number.parseInt(raw, 10);
  return Number.isFinite(n) && n >= 0 ? n : null;
}

export function parseBeltramiQuery(event: H3Event): BeltramiSearchQuery {
  const q = getQuery(event);
  const genderRaw = queryString(q.gender).trim();
  return {
    lastName: queryString(q.last_name),
    firstName: queryString(q.first_name),
    gender: genderRaw || null,
    dob: queryString(q.dob),
    includeImages: queryBool(q.include_images),
    bookId: queryString(q.book_id).trim(),
    rowIndex: queryInt(q.row_index),
    searchToken: queryString(q.search_token).trim(),
  };
}
