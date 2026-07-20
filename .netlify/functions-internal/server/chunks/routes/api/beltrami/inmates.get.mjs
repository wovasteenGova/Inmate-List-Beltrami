import { d as defineEventHandler, p as parseBeltramiQuery, b as runBeltramiSearch, c as createError } from '../../../_/nitro.mjs';
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

const inmates_get = defineEventHandler(async (event) => {
  const q = parseBeltramiQuery(event);
  try {
    const { rows, searchToken } = await runBeltramiSearch({
      lastName: q.lastName,
      firstName: q.firstName,
      gender: q.gender,
      dob: q.dob,
      includeImages: q.includeImages,
      timeoutMs: 12e4
    });
    return { count: rows.length, results: rows, searchToken };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Beltrami inmate search failed";
    throw createError({
      statusCode: 502,
      statusMessage: "Upstream inmate locator request failed",
      message
    });
  }
});

export { inmates_get as default };
//# sourceMappingURL=inmates.get.mjs.map
