import { createError } from "h3";

interface BatchBody {
  last_name?: string;
  first_name?: string;
  gender?: string | null;
  dob?: string;
  search_token?: string;
  photos_only?: boolean;
  items?: { bookId?: string; rowIndex?: number }[];
}

export default defineEventHandler(async (event) => {
  const body = (await readBody<BatchBody>(event)) ?? {};
  const items = (body.items ?? [])
    .map((item) => ({
      bookId: String(item.bookId ?? "").trim(),
      rowIndex: Number(item.rowIndex),
    }))
    .filter((item) => item.bookId && Number.isFinite(item.rowIndex) && item.rowIndex >= 0);

  if (!items.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing items",
      message: "POST body must include items: [{ bookId, rowIndex }].",
    });
  }

  try {
    const results = await fetchInmateDetailsBatch({
      lastName: String(body.last_name ?? ""),
      firstName: String(body.first_name ?? ""),
      gender: body.gender ?? null,
      dob: String(body.dob ?? ""),
      searchToken: body.search_token ? String(body.search_token) : undefined,
      photosOnly: body.photos_only !== false,
      items,
      timeoutMs: 120_000,
      concurrency: 8,
    });
    return { results };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Beltrami inmate detail batch failed";
    throw createError({
      statusCode: 502,
      statusMessage: "Upstream inmate locator request failed",
      message,
    });
  }
});
