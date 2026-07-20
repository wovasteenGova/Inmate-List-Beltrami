import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const q = parseBeltramiQuery(event);

  try {
    const { rows, searchToken } = await runBeltramiSearch({
      lastName: q.lastName,
      firstName: q.firstName,
      gender: q.gender,
      dob: q.dob,
      includeImages: q.includeImages,
      timeoutMs: 120_000,
    });
    return { count: rows.length, results: rows, searchToken };
  } catch (error: unknown) {
    const message =
      error instanceof Error ? error.message : "Beltrami inmate search failed";
    throw createError({
      statusCode: 502,
      statusMessage: "Upstream inmate locator request failed",
      message,
    });
  }
});
