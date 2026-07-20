import { d as defineEventHandler, r as readBody, c as createError, a as fetchInmateDetailsBatch } from '../../../_/nitro.mjs';
import 'cheerio';
import 'node:http';
import 'node:https';
import 'node:events';
import 'node:buffer';
import '@iconify/utils';
import 'node:crypto';
import 'consola';
import 'node:fs';
import 'node:path';

const inmateDetails_post = defineEventHandler(async (event) => {
  var _a, _b, _c, _d, _e, _f;
  const body = (_a = await readBody(event)) != null ? _a : {};
  const items = ((_b = body.items) != null ? _b : []).map((item) => {
    var _a2;
    return {
      bookId: String((_a2 = item.bookId) != null ? _a2 : "").trim(),
      rowIndex: Number(item.rowIndex)
    };
  }).filter((item) => item.bookId && Number.isFinite(item.rowIndex) && item.rowIndex >= 0);
  if (!items.length) {
    throw createError({
      statusCode: 400,
      statusMessage: "Missing items",
      message: "POST body must include items: [{ bookId, rowIndex }]."
    });
  }
  try {
    const results = await fetchInmateDetailsBatch({
      lastName: String((_c = body.last_name) != null ? _c : ""),
      firstName: String((_d = body.first_name) != null ? _d : ""),
      gender: (_e = body.gender) != null ? _e : null,
      dob: String((_f = body.dob) != null ? _f : ""),
      searchToken: body.search_token ? String(body.search_token) : void 0,
      photosOnly: body.photos_only !== false,
      items,
      timeoutMs: 12e4,
      concurrency: 8
    });
    return { results };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beltrami inmate detail batch failed";
    throw createError({
      statusCode: 502,
      statusMessage: "Upstream inmate locator request failed",
      message
    });
  }
});

export { inmateDetails_post as default };
//# sourceMappingURL=inmate-details.post.mjs.map
