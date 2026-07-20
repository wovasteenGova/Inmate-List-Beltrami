import { createError } from "h3";

export default defineEventHandler(async (event) => {
  const q = parseBeltramiQuery(event);

  if (!q.bookId) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing book_id",
      message: "Query parameter book_id is required.",
    });
  }

  try {
    const detail = await fetchInmateDetail({
      bookId: q.bookId,
      lastName: q.lastName,
      firstName: q.firstName,
      gender: q.gender,
      dob: q.dob,
      rowIndex: q.rowIndex,
      searchToken: q.searchToken || undefined,
      timeoutMs: 90_000,
    });

    if (!detail) {
      throw createError({
        statusCode: 404,
        statusMessage: "Inmate not found",
        message: "book_id is not in the result set for the given search filters.",
      });
    }

    return detail;
  } catch (error: unknown) {
    if (error && typeof error === "object" && "statusCode" in error) {
      throw error;
    }
    const message =
      error instanceof Error ? error.message : "Beltrami inmate detail failed";
    throw createError({
      statusCode: 502,
      statusMessage: "Upstream inmate locator request failed",
      message,
    });
  }
});
