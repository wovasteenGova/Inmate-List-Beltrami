import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";

const BASE_URL = "https://inmates.co.beltrami.mn.us/";

const GRID_DIV_ID = "_ctl0_CpnlMain_ctrlUsrSrchRslt_grdSrchResults";
const INMATE_IMG_ID = "_ctl0_CpnlMain_ctrlUsrInmateDtl_imgInmate";
const CHARGE_GRID_ID = "_ctl0_CpnlMain_ctrlUsrInmateDtl_grdInmateCharge";

const DEFAULT_HEADERS = {
  "User-Agent":
    "Mozilla/5.0 (Windows NT 10.0; rv:128.0) Gecko/20100101 BeltramiInmateAPI/1.0",
};

const GRID_NCOL = 29;

const IDX = {
  name_type_id: 0,
  name_type: 1,
  name_title: 2,
  last_name: 3,
  first_name: 4,
  middle_name: 5,
  name_suffix: 6,
  rtc: 8,
  eye: 9,
  hair: 10,
  skin: 11,
  bok_nbr: 12,
  book_id: 17,
  cell_location: 18,
  booking_nbr_display: 19,
  spn_nbr: 20,
  display_name: 21,
  dob: 22,
  age: 23,
  sex: 24,
  race: 25,
  height: 26,
  weight: 27,
  elig_release: 28,
} as const;

export interface InmateCharge {
  caseNumber: string;
  charge: string;
  description: string;
  severity: string;
  bailAmount: string;
  type: string;
  courtDate: string;
  courtBranch: string;
}

export interface InmateDetail {
  bookId: string;
  imageUrl: string | null;
  bookingDate: string | null;
  charges: InmateCharge[];
  selectedCellIndex: number | null;
  error?: string;
}

export interface InmateDetailRequestItem {
  bookId: string;
  rowIndex: number;
}

export interface InmateRecord {
  nameTypeId: string;
  nameType: string;
  nameTitle: string;
  lastName: string;
  firstName: string;
  middleName: string;
  nameSuffix: string;
  rtc: string;
  eye: string;
  hair: string;
  skin: string;
  bookingNumber: string;
  bookId: string;
  spn: string;
  cellLocation: string;
  displayName: string;
  dob: string;
  age: number | null;
  sex: string;
  race: string;
  height: string;
  weight: string;
  eligReleaseDate: string;
  imageUrl?: string | null;
}

export interface SearchFilters {
  lastName?: string;
  firstName?: string;
  gender?: string | null;
  dob?: string;
}

export interface BatchDetailOptions extends SearchFilters {
  items: InmateDetailRequestItem[];
  searchToken?: string;
  photosOnly?: boolean;
  concurrency?: number;
  timeoutMs?: number;
}

export interface SearchResult {
  rows: InmateRecord[];
  searchToken: string;
}

export interface SearchOptions extends SearchFilters {
  includeImages?: boolean;
  timeoutMs?: number;
}

export interface MugshotOptions extends SearchFilters {
  bookId: string;
  rowIndex?: number | null;
  searchToken?: string;
  timeoutMs?: number;
}

class BeltramiSession {
  private cookies = new Map<string, string>();

  static fromCookies(cookies: ReadonlyArray<readonly [string, string]>) {
    const session = new BeltramiSession();
    for (const [name, value] of cookies) {
      session.cookies.set(name, value);
    }
    return session;
  }

  exportCookies(): [string, string][] {
    return Array.from(this.cookies.entries());
  }

  private storeCookies(response: Response) {
    const setCookies =
      typeof response.headers.getSetCookie === "function"
        ? response.headers.getSetCookie()
        : [];
    for (const cookie of setCookies) {
      const [pair] = cookie.split(";");
      const eq = pair.indexOf("=");
      if (eq > 0) {
        this.cookies.set(pair.slice(0, eq).trim(), pair.slice(eq + 1).trim());
      }
    }
  }

  private cookieHeader(): string {
    return Array.from(this.cookies.entries())
      .map(([name, value]) => `${name}=${value}`)
      .join("; ");
  }

  async get(url: string, timeoutMs: number): Promise<string> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        headers: {
          ...DEFAULT_HEADERS,
          ...(this.cookies.size ? { Cookie: this.cookieHeader() } : {}),
        },
        signal: controller.signal,
      });
      this.storeCookies(response);
      if (!response.ok) {
        throw new Error(`GET ${url} failed with ${response.status}`);
      }
      return await response.text();
    } finally {
      clearTimeout(timer);
    }
  }

  async post(url: string, data: Record<string, string>, timeoutMs: number) {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          ...DEFAULT_HEADERS,
          "Content-Type": "application/x-www-form-urlencoded",
          ...(this.cookies.size ? { Cookie: this.cookieHeader() } : {}),
        },
        body: new URLSearchParams(data),
        signal: controller.signal,
      });
      this.storeCookies(response);
      if (!response.ok) {
        throw new Error(`POST ${url} failed with ${response.status}`);
      }
      return await response.text();
    } finally {
      clearTimeout(timer);
    }
  }
}

function getHidden($: CheerioAPI, name: string): string {
  return $(`input[name="${cssEscapeName(name)}"]`).attr("value") ?? "";
}

function cssEscapeName(name: string): string {
  return name.replace(/\\/g, "\\\\").replace(/"/g, '\\"');
}

function getSelectValue($: CheerioAPI, name: string): string {
  const sel = $(`select[name="${cssEscapeName(name)}"]`);
  if (!sel.length) return "";
  const selected = sel.find("option[selected]");
  if (selected.length) return selected.attr("value") ?? "";
  const first = sel.find("option").first();
  return first.attr("value") ?? "";
}

function buildPayload(
  $: CheerioAPI,
  filters: SearchFilters,
): Record<string, string> {
  const gender =
    filters.gender ??
    (getSelectValue($, "_ctl0:CpnlMain:ctrlUsrSrchTools:lstGender") || "U");

  return {
    __EVENTTARGET: "",
    __EVENTARGUMENT: "",
    __LASTFOCUS: "",
    __VIEWSTATE: getHidden($, "__VIEWSTATE"),
    __EVENTVALIDATION: getHidden($, "__EVENTVALIDATION"),
    __VIEWSTATEGENERATOR: getHidden($, "__VIEWSTATEGENERATOR"),
    "_ctl0:hdnLang": getHidden($, "_ctl0:hdnLang") || "EN",
    "_ctl0:hdnClearTranslation":
      getHidden($, "_ctl0:hdnClearTranslation") || "0",
    "_ctl0:hdnCourtURL": getHidden($, "_ctl0:hdnCourtURL"),
    "_ctl0:hdnAnalyticCode": getHidden($, "_ctl0:hdnAnalyticCode"),
    "_ctl0:hdnSenderId": getHidden($, "_ctl0:hdnSenderId"),
    "_ctl0:hdnSrchResultCellClick": getHidden(
      $,
      "_ctl0:hdnSrchResultCellClick",
    ),
    "_ctl0:hdnSelectedCellIndex": getHidden($, "_ctl0:hdnSelectedCellIndex"),
    "_ctl0:hdnBookNbr": getHidden($, "_ctl0:hdnBookNbr"),
    "_ctl0_CpnlMain_ctrlUsrSrchRslt_grdSrchResults_clientState": getHidden(
      $,
      "_ctl0_CpnlMain_ctrlUsrSrchRslt_grdSrchResults_clientState",
    ),
    "_ctl0_CpnlMain_ctrlUsrInmateDtl_grdInmateCharge_clientState": getHidden(
      $,
      "_ctl0_CpnlMain_ctrlUsrInmateDtl_grdInmateCharge_clientState",
    ),
    "_ctl0_CpnlMain_ctrlUsrInmateDtl_grdHold_clientState": getHidden(
      $,
      "_ctl0_CpnlMain_ctrlUsrInmateDtl_grdHold_clientState",
    ),
    "_ctl0:CpnlMain:ctrlUsrSrchTools:txtLastName": filters.lastName ?? "",
    "_ctl0:CpnlMain:ctrlUsrSrchTools:txtFirstName": filters.firstName ?? "",
    "_ctl0:CpnlMain:ctrlUsrSrchTools:lstGender": gender,
    "_ctl0:CpnlMain:ctrlUsrSrchTools:txtDOB": filters.dob ?? "",
    "_ctl0:CpnlMain:ctrlUsrSrchTools:cmdSearch": "Search",
  };
}

function collectFormFields($: CheerioAPI): Record<string, string> {
  const form = $("#aspnetForm");
  if (!form.length) return {};

  const data: Record<string, string> = {};

  form.find("input").each((_, el) => {
    const input = $(el);
    const name = input.attr("name");
    if (!name) return;
    const type = (input.attr("type") ?? "").toLowerCase();
    if (type === "submit" || type === "image") return;
    if (type === "checkbox" && !input.attr("checked")) return;
    data[name] = input.attr("value") ?? "";
  });

  form.find("select").each((_, el) => {
    const select = $(el);
    const name = select.attr("name");
    if (!name) return;
    const selected = select.find("option[selected]");
    const option = selected.length ? selected : select.find("option").first();
    data[name] = option.attr("value") ?? "";
  });

  form.find("textarea").each((_, el) => {
    const textarea = $(el);
    const name = textarea.attr("name");
    if (name) data[name] = textarea.text() ?? "";
  });

  return data;
}

function normalizeSiteUrl(src: string, base = BASE_URL): string {
  if (!src) return "";
  const absUrl = new URL(src, base);
  absUrl.pathname = absUrl.pathname.replace(/\/{2,}/g, "/");
  return absUrl.toString();
}

function parseAge(raw: string): number | null {
  if (!raw || !/^\d+$/.test(raw)) return null;
  return Number.parseInt(raw, 10);
}

function mergedHeaderRow(texts: string[]): boolean {
  const blob = texts.join(" ");
  return blob.includes("NameTypeID") && blob.includes("Booking#") && blob.includes("SPN#");
}

function rowPassesSanity(cells: string[]): boolean {
  if (cells.length !== GRID_NCOL) return false;
  const nid = cells[0];
  if (!/^\d{6,}$/.test(nid)) return false;
  const booking = cells[IDX.booking_nbr_display] || cells[IDX.bok_nbr];
  if (!/^\d{8,12}$/.test(booking)) return false;
  const display = cells[IDX.display_name];
  const last = cells[IDX.last_name];
  const first = cells[IDX.first_name];
  if (last || first) return true;
  return Boolean(display);
}

function rowToRecord(cells: string[]): InmateRecord {
  const cell = (key: keyof typeof IDX) => {
    const index = IDX[key];
    return index < cells.length ? cells[index] : "";
  };

  const bookingDisplay = cell("booking_nbr_display");
  const bok = cell("bok_nbr");

  return {
    nameTypeId: cell("name_type_id"),
    nameType: cell("name_type"),
    nameTitle: cell("name_title"),
    lastName: cell("last_name"),
    firstName: cell("first_name"),
    middleName: cell("middle_name"),
    nameSuffix: cell("name_suffix"),
    rtc: cell("rtc"),
    eye: cell("eye"),
    hair: cell("hair"),
    skin: cell("skin"),
    bookingNumber: bookingDisplay || bok,
    bookId: cell("book_id"),
    spn: cell("spn_nbr"),
    cellLocation: cell("cell_location"),
    displayName: cell("display_name"),
    dob: cell("dob"),
    age: parseAge(cell("age")),
    sex: cell("sex"),
    race: cell("race"),
    height: cell("height"),
    weight: cell("weight"),
    eligReleaseDate: cell("elig_release"),
  };
}

function parseInmatesHtml(html: string): InmateRecord[] {
  const $ = cheerio.load(html);
  const div = $(`div#${GRID_DIV_ID}`);
  if (!div.length) return [];

  const out: InmateRecord[] = [];

  div.find("tr").each((_, tr) => {
    const row = $(tr);
    const cls = row.attr("class") ?? "";
    if (cls.includes("ig_Header") || cls.includes("igg_Header")) return;

    const texts = row
      .find("td")
      .map((__, td) => $(td).text().replace(/\s+/g, " ").trim())
      .get();

    if (mergedHeaderRow(texts)) return;
    if (!rowPassesSanity(texts)) return;
    out.push(rowToRecord(texts));
  });

  return out;
}

function parseDetailCharges(html: string): InmateCharge[] {
  const $ = cheerio.load(html);
  const grid = $(`div#${CHARGE_GRID_ID}`);
  if (!grid.length) return [];

  const charges: InmateCharge[] = [];

  grid.find("tr").each((_, tr) => {
    const row = $(tr);
    const cls = row.attr("class") ?? "";
    if (cls.includes("Header") || cls.includes("igg_Header")) return;

    const cells = row
      .find("td")
      .map((__, td) => $(td).text().replace(/\s+/g, " ").trim())
      .get();

    if (cells.length < 8) return;
    if (!/^\d{8,12}$/.test(cells[0])) return;
    if (!cells[2]) return;

    charges.push({
      caseNumber: cells[0] ?? "",
      charge: cells[1] ?? "",
      description: cells[2] ?? "",
      severity: cells[3] ?? "",
      bailAmount: cells[4] ?? "",
      type: cells[5] ?? "",
      courtDate: cells[6] ?? "",
      courtBranch: cells[7] ?? "",
    });
  });

  return charges;
}

function detailFromHtml(html: string, bookId: string, rowIndex: number): InmateDetail {
  return {
    bookId,
    imageUrl: parseDetailMugshotUrl(html),
    bookingDate: parseDetailBookingDate(html),
    charges: parseDetailCharges(html),
    selectedCellIndex: rowIndex,
  };
}

async function fetchInmateDetailFromSearch(
  session: BeltramiSession,
  formFields: Record<string, string>,
  bookId: string,
  rowIndex: number,
  timeoutMs: number,
): Promise<InmateDetail> {
  const detailHtml = await postSelectGridRow(
    session,
    formFields,
    bookId,
    rowIndex,
    timeoutMs,
  );
  return detailFromHtml(detailHtml, bookId, rowIndex);
}

function parseDetailMugshotUrl(html: string): string | null {
  const $ = cheerio.load(html);
  const img = $(`img#${INMATE_IMG_ID}`);
  if (!img.length) return null;
  const src = (img.attr("src") ?? "").trim();
  if (!src || !src.includes("frmHandle.aspx")) return null;
  return normalizeSiteUrl(src);
}

function parseDetailBookingDate(html: string): string | null {
  const $ = cheerio.load(html);
  const custody = $("#_ctl0_CpnlMain_ctrlUsrInmateDtl_txtCustody").text().trim();
  return custody || null;
}

async function postSelectGridRow(
  session: BeltramiSession,
  formFields: Record<string, string>,
  bookId: string,
  selectedCellIndex: number,
  timeoutMs: number,
): Promise<string> {
  const data = {
    ...formFields,
    "_ctl0:hdnSenderId": bookId,
    "_ctl0:hdnSrchResultCellClick": "1",
    "_ctl0:hdnSelectedCellIndex": String(selectedCellIndex),
  };
  return await session.post(BASE_URL, data, timeoutMs);
}

async function resolveMugshotUrl(
  session: BeltramiSession,
  searchResultHtml: string,
  bookId: string,
  options: { rowIndex?: number | null; maxScan?: number; timeoutMs: number },
): Promise<[string | null, number | null]> {
  const $ = cheerio.load(searchResultHtml);
  const formFields = collectFormFields($);
  if (!Object.keys(formFields).length) return [null, null];

  const maxScan = options.maxScan ?? 80;
  const indices =
    options.rowIndex != null ? [options.rowIndex] : Array.from({ length: maxScan }, (_, i) => i);

  for (const idx of indices) {
    const detailHtml = await postSelectGridRow(
      session,
      formFields,
      bookId,
      idx,
      options.timeoutMs,
    );
    const detail$ = cheerio.load(detailHtml);
    const senderVal =
      detail$(`input[name="${cssEscapeName("_ctl0:hdnSenderId")}"]`).attr("value")?.trim() ?? "";
    if (senderVal !== bookId.trim()) continue;
    const url = parseDetailMugshotUrl(detailHtml);
    if (url) return [url, idx];
  }

  return [null, null];
}

async function enrichRowsWithMugshots(
  session: BeltramiSession,
  rows: InmateRecord[],
  searchHtml: string,
  timeoutMs: number,
) {
  for (let i = 0; i < rows.length; i += 1) {
    const row = rows[i];
    const bookId = row.bookId.trim();
    if (!bookId) {
      row.imageUrl = null;
      continue;
    }
    try {
      const detail = await fetchInmateDetailFromSearch(
        session,
        collectFormFields(cheerio.load(searchHtml)),
        bookId,
        i,
        timeoutMs,
      );
      row.imageUrl = detail.imageUrl;
    } catch {
      row.imageUrl = null;
    }
  }
}

async function searchInmatesWithHtml(
  session: BeltramiSession,
  filters: SearchFilters,
  timeoutMs: number,
): Promise<[InmateRecord[], string]> {
  const initialHtml = await session.get(BASE_URL, timeoutMs);
  const initial$ = cheerio.load(initialHtml);
  const payload = buildPayload(initial$, filters);
  const resultHtml = await session.post(BASE_URL, payload, timeoutMs);
  const rows = parseInmatesHtml(resultHtml);
  return [rows, resultHtml];
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  worker: (item: T, index: number) => Promise<R>,
): Promise<R[]> {
  const results = new Array<R>(items.length);
  let nextIndex = 0;

  async function runWorker() {
    while (nextIndex < items.length) {
      const index = nextIndex;
      nextIndex += 1;
      results[index] = await worker(items[index], index);
    }
  }

  const workers = Math.max(1, Math.min(concurrency, items.length));
  await Promise.all(Array.from({ length: workers }, () => runWorker()));
  return results;
}

function emptyDetail(item: InmateDetailRequestItem): InmateDetail {
  return {
    bookId: item.bookId.trim(),
    imageUrl: null,
    bookingDate: null,
    charges: [],
    selectedCellIndex: item.rowIndex,
    error: "Detail unavailable",
  };
}

interface SearchContext {
  formFields: Record<string, string>;
  knownIds: Set<string>;
  bookIds: string[];
  cookies: ReadonlyArray<readonly [string, string]>;
}

async function resolveSearchContext(
  options: SearchFilters & { searchToken?: string; timeoutMs: number },
): Promise<SearchContext> {
  const cached = options.searchToken
    ? getBeltramiSearch(options.searchToken)
    : null;
  if (cached) {
    return {
      formFields: cached.formFields,
      knownIds: new Set(cached.bookIds),
      bookIds: [...cached.bookIds],
      cookies: cached.cookies,
    };
  }

  const session = new BeltramiSession();
  const filters = normalizeSearchFilters(options);
  const [rows, html] = await searchInmatesWithHtml(session, filters, options.timeoutMs);
  const formFields = collectFormFields(cheerio.load(html));
  const bookIds = rows.map((row) => row.bookId);
  return {
    formFields,
    knownIds: new Set(bookIds),
    bookIds,
    cookies: session.exportCookies(),
  };
}

function rememberBeltramiSearch(
  filters: SearchFilters,
  rows: InmateRecord[],
  session: BeltramiSession,
  searchHtml: string,
): string {
  const token = newBeltramiSearchToken();
  const cacheKey = filtersToCacheKey(filters);
  putBeltramiSearch(token, {
    formFields: collectFormFields(cheerio.load(searchHtml)),
    cookies: session.exportCookies(),
    bookIds: rows.map((row) => row.bookId),
  });
  putRosterCache(cacheKey, { rows, searchToken: token });
  return token;
}

export async function runBeltramiSearch(
  options: SearchOptions = {},
): Promise<SearchResult> {
  pruneBeltramiCaches();
  const timeoutMs = options.timeoutMs ?? 30_000;
  const filters = normalizeSearchFilters(options);
  const cacheKey = filtersToCacheKey(filters);
  const cachedRoster = getRosterCache<InmateRecord>(cacheKey);
  if (cachedRoster && getBeltramiSearch(cachedRoster.searchToken)) {
    return { rows: cachedRoster.rows, searchToken: cachedRoster.searchToken };
  }

  const session = new BeltramiSession();
  const [rows, html] = await searchInmatesWithHtml(session, filters, timeoutMs);
  const searchToken = rememberBeltramiSearch(filters, rows, session, html);

  if (options.includeImages && rows.length) {
    await enrichRowsWithMugshots(session, rows, html, timeoutMs);
  }

  return { rows, searchToken };
}

export async function searchInmates(options: SearchOptions = {}): Promise<InmateRecord[]> {
  const { rows } = await runBeltramiSearch(options);
  return rows;
}

export async function fetchInmateDetail(
  options: MugshotOptions,
): Promise<InmateDetail | null> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const bookId = options.bookId.trim();
  const ctx = await resolveSearchContext({
    ...options,
    timeoutMs,
  });

  if (!ctx.knownIds.has(bookId)) return null;

  const rowIndex =
    options.rowIndex ?? ctx.bookIds.indexOf(bookId);
  if (rowIndex < 0) return null;

  const session = BeltramiSession.fromCookies(ctx.cookies);
  return await fetchInmateDetailFromSearch(
    session,
    ctx.formFields,
    bookId,
    rowIndex,
    timeoutMs,
  );
}

export async function fetchInmateDetailsBatch(
  options: BatchDetailOptions,
): Promise<InmateDetail[]> {
  const timeoutMs = options.timeoutMs ?? 30_000;
  const concurrency = options.concurrency ?? (options.photosOnly ? 8 : 4);
  const photosOnly = options.photosOnly ?? false;
  const ctx = await resolveSearchContext({
    ...options,
    timeoutMs,
  });

  return await mapPool(options.items, concurrency, async (item) => {
    const bookId = item.bookId.trim();
    if (!ctx.knownIds.has(bookId)) return emptyDetail(item);

    const session = BeltramiSession.fromCookies(ctx.cookies);
    try {
      const detailHtml = await postSelectGridRow(
        session,
        ctx.formFields,
        bookId,
        item.rowIndex,
        timeoutMs,
      );
      if (photosOnly) {
        return {
          bookId,
          imageUrl: parseDetailMugshotUrl(detailHtml),
          bookingDate: parseDetailBookingDate(detailHtml),
          charges: [],
          selectedCellIndex: item.rowIndex,
        };
      }
      return detailFromHtml(detailHtml, bookId, item.rowIndex);
    } catch {
      return emptyDetail(item);
    }
  });
}

export async function fetchInmateMugshotUrl(
  options: MugshotOptions,
): Promise<[string | null, number | null]> {
  const detail = await fetchInmateDetail(options);
  if (!detail) return [null, null];
  return [detail.imageUrl, detail.selectedCellIndex];
}
