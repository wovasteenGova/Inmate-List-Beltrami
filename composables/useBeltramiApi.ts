export interface InmateRecord {
  bookId: string;
  bookingNumber: string;
  cellLocation: string;
  displayName: string;
  dob: string;
  age: number | null;
  sex: string;
  race: string;
  spn: string;
}

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
}

export interface InmateSearchResponse {
  count: number;
  results: InmateRecord[];
  searchToken: string;
}

export function filtersToQuery(f: {
  lastName: string;
  firstName: string;
  gender: string;
  dob: string;
}): Record<string, string> {
  const q: Record<string, string> = {};
  const last = f.lastName.trim();
  const first = f.firstName.trim();
  const dob = f.dob.trim();
  if (last) q.last_name = last;
  if (first) q.first_name = first;
  if (f.gender) q.gender = f.gender;
  if (dob) q.dob = dob;
  return q;
}

export function useBeltramiApi() {
  const config = useRuntimeConfig();
  const base = () => String(config.public.apiBase).replace(/\/$/, "");

  const rosterTimeoutMs = 120_000;
  const detailTimeoutMs = 90_000;

  async function fetchInmates(filters: Record<string, string>) {
    const params = new URLSearchParams({
      ...filters,
      include_images: "false",
    });
    return await $fetch<InmateSearchResponse>(
      `${base()}/inmates?${params}`,
      { timeout: rosterTimeoutMs },
    );
  }

  async function fetchInmateDetail(
    bookId: string,
    rowIndex: number,
    filters: Record<string, string>,
    searchToken?: string | null,
  ): Promise<InmateDetail> {
    const params = new URLSearchParams({
      ...filters,
      book_id: bookId,
      row_index: String(rowIndex),
    });
    if (searchToken) params.set("search_token", searchToken);
    return await $fetch<InmateDetail>(`${base()}/inmate-detail?${params}`, {
      timeout: detailTimeoutMs,
    });
  }

  async function fetchInmatePhotosBatch(
    items: { bookId: string; rowIndex: number }[],
    filters: Record<string, string>,
    searchToken: string,
  ): Promise<InmateDetail[]> {
    const res = await $fetch<{ results: InmateDetail[] }>(
      `${base()}/inmate-details`,
      {
        method: "POST",
        body: {
          ...filters,
          search_token: searchToken,
          photos_only: true,
          items,
        },
        timeout: detailTimeoutMs,
      },
    );
    return res.results;
  }

  return { fetchInmates, fetchInmateDetail, fetchInmatePhotosBatch };
}
