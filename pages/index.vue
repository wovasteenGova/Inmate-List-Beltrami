<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import type { InmateCharge, InmateRecord } from "~/composables/useBeltramiApi";

const DETAIL_BATCH_SIZE = 4;

type ResultRow = InmateRecord & {
  rowIndex: number;
  imageUrl: string | null;
  bookingDate: string | null;
  photoLoading: boolean;
  charges: InmateCharge[] | null;
  detailLoading: boolean;
  detailError: string | null;
};

type InmateAccordionItem = AccordionItem & ResultRow;

const { fetchInmates, fetchInmateDetail, fetchInmateDetailsBatch } =
  useBeltramiApi();

const lastName = ref("");
const firstName = ref("");
const gender = ref("");
const dob = ref("");

const loading = ref(false);
const rows = ref<ResultRow[]>([]);
const searchToken = ref<string | null>(null);
const selectedBookId = ref<string | undefined>(undefined);
const resultsLine = ref("");
const message = ref<{ text: string; kind: "error" | "info" } | null>(null);

let searchGeneration = 0;
let activeFilters: Record<string, string> = {};

const accordionItems = computed<InmateAccordionItem[]>(() =>
  rows.value.map((row) => ({
    ...row,
    label: row.displayName,
    value: row.bookId,
  })),
);

function filterParams() {
  return filtersToQuery({
    lastName: lastName.value,
    firstName: firstName.value,
    gender: gender.value,
    dob: dob.value,
  });
}

function updateDetailProgress() {
  const total = rows.value.length;
  const done = rows.value.filter((row) => !row.detailLoading).length;
  resultsLine.value =
    total +
    " record" +
    (total === 1 ? "" : "s") +
    " · charge counts " +
    done +
    "/" +
    total;
}

function applyDetail(
  row: ResultRow,
  detail: {
    imageUrl: string | null;
    bookingDate: string | null;
    charges: InmateCharge[];
  },
) {
  row.imageUrl = detail.imageUrl ?? row.imageUrl;
  if (detail.bookingDate) row.bookingDate = detail.bookingDate;
  row.charges = detail.charges;
  row.photoLoading = false;
  row.detailLoading = false;
  row.detailError = null;
}

async function loadRowDetail(row: ResultRow) {
  if (row.detailLoading || row.charges) return;

  row.detailLoading = true;
  row.detailError = null;

  try {
    const detail = await fetchInmateDetail(
      row.bookId,
      row.rowIndex,
      activeFilters,
      searchToken.value,
    );
    applyDetail(row, detail);
  } catch {
    row.detailLoading = false;
    row.detailError = "Charges could not be loaded.";
  } finally {
    updateDetailProgress();
  }
}

async function loadAllDetails(generation: number, token: string) {
  for (let start = 0; start < rows.value.length; start += DETAIL_BATCH_SIZE) {
    if (generation !== searchGeneration) return;
    const batchRows = rows.value.slice(start, start + DETAIL_BATCH_SIZE);

    try {
      const details = await fetchInmateDetailsBatch(
        batchRows.map((row) => ({ bookId: row.bookId, rowIndex: row.rowIndex })),
        activeFilters,
        token,
      );
      if (generation !== searchGeneration) return;

      const byId = new Map(details.map((detail) => [detail.bookId, detail]));
      for (const row of batchRows) {
        const detail = byId.get(row.bookId);
        if (detail && !detail.error) {
          applyDetail(row, detail);
        } else {
          row.detailLoading = false;
          row.photoLoading = false;
          row.detailError = "Charges could not be loaded.";
        }
      }
    } catch {
      if (generation !== searchGeneration) return;
      for (const row of rows.value.slice(start)) {
        row.detailLoading = false;
        row.photoLoading = false;
        row.detailError = "Charges could not be loaded.";
      }
      updateDetailProgress();
      return;
    }
    updateDetailProgress();
  }
}

async function onAccordionChange(bookId: string | undefined) {
  if (!bookId) return;
  const row = rows.value.find((item) => item.bookId === bookId);
  if (row) await loadRowDetail(row);
}

function retryRowDetail(bookId: string) {
  const row = rows.value.find((item) => item.bookId === bookId);
  if (row) void loadRowDetail(row);
}

async function onSearch() {
  message.value = null;
  loading.value = true;
  selectedBookId.value = undefined;
  searchToken.value = null;
  searchGeneration += 1;
  const generation = searchGeneration;
  activeFilters = filterParams();
  resultsLine.value = "Loading roster…";
  rows.value = [];

  try {
    const data = await fetchInmates(activeFilters);
    if (generation !== searchGeneration) return;

    searchToken.value = data.searchToken;
    const n = data.results.length;
    if (n === 0) {
      resultsLine.value = "No matching records.";
      message.value = {
        kind: "info",
        text: "Try different spelling, fewer filters, or leave everything blank for the full roster.",
      };
      return;
    }

    rows.value = data.results.map((record, rowIndex) => ({
      ...record,
      rowIndex,
      imageUrl: null,
      bookingDate: null,
      photoLoading: true,
      charges: null,
      detailLoading: true,
      detailError: null,
    }));
    updateDetailProgress();
    void loadAllDetails(generation, data.searchToken);
  } catch (e: unknown) {
    if (generation !== searchGeneration) return;
    const text =
      e && typeof e === "object" && "data" in e
        ? JSON.stringify((e as { data: unknown }).data)
        : e instanceof Error
          ? e.message
          : "Request failed.";
    message.value = { kind: "error", text };
    resultsLine.value = "";
  } finally {
    if (generation === searchGeneration) loading.value = false;
  }
}

function onClear() {
  lastName.value = "";
  firstName.value = "";
  gender.value = "";
  dob.value = "";
  rows.value = [];
  searchToken.value = null;
  selectedBookId.value = undefined;
  message.value = null;
  resultsLine.value = "";
  loading.value = false;
  searchGeneration += 1;
}

function chargesSummary(row: ResultRow) {
  if (row.detailLoading) return "Checking charges…";
  if (!row.charges) return "Charges unavailable";
  const n = row.charges.length;
  return n + " charge" + (n === 1 ? "" : "s");
}

function formatDob(dob: string) {
  const trimmed = dob.trim();
  return trimmed || "—";
}

function formatBookingDate(row: ResultRow) {
  if (row.bookingDate) return row.bookingDate;
  if (row.photoLoading) return "…";
  return "—";
}

watch(selectedBookId, (bookId) => {
  void onAccordionChange(bookId);
});

onMounted(() => {
  void onSearch();
});

onBeforeUnmount(() => {
  searchGeneration += 1;
});
</script>

<template>
  <div>
    <header class="header">
      <div class="header__inner">
        <div class="header__brand">
          <BeltramiHeaderMark />
          <div>
            <h1 class="header__title">Inmate List Beltrami</h1>
            <p class="header__subtitle">Beltrami County, Minnesota</p>
          </div>
        </div>
        <p class="header__note">
          Search the current roster. Charge counts appear beneath each name as they load.
        </p>
      </div>
    </header>

    <main class="main">
      <section class="panel search-panel" aria-labelledby="search-heading">
        <h2 id="search-heading" class="panel__title">Search</h2>
        <form class="search-form" @submit.prevent="onSearch">
          <div class="field-grid">
            <label class="field">
              <span class="field__label">Last name</span>
              <input
                v-model="lastName"
                type="text"
                name="last_name"
                autocomplete="family-name"
                placeholder="e.g. Smith"
              />
            </label>
            <label class="field">
              <span class="field__label">First name</span>
              <input
                v-model="firstName"
                type="text"
                name="first_name"
                autocomplete="given-name"
                placeholder="Optional"
              />
            </label>
            <label class="field">
              <span class="field__label">Gender</span>
              <select v-model="gender" name="gender">
                <option value="">Match form default</option>
                <option value="U">Unknown</option>
                <option value="M">Male</option>
                <option value="F">Female</option>
              </select>
            </label>
            <label class="field">
              <span class="field__label">Birth year</span>
              <input
                v-model="dob"
                type="text"
                name="dob"
                inputmode="numeric"
                maxlength="4"
                placeholder="yyyy"
              />
            </label>
          </div>
          <div class="search-form__actions">
            <button type="submit" class="btn btn--primary" :disabled="loading">
              <span class="btn__text">Search</span>
              <span v-if="loading" class="btn__spinner" aria-hidden="true" />
            </button>
            <button type="button" class="btn btn--ghost" @click="onClear">
              Clear
            </button>
          </div>
        </form>
      </section>

      <section class="panel results-panel" aria-live="polite">
        <div class="results-head">
          <h2 class="panel__title">Results</h2>
          <p class="results-count">{{ resultsLine }}</p>
        </div>

        <div
          v-if="message"
          class="results-message"
          :class="
            message.kind === 'error'
              ? 'results-message--error'
              : 'results-message--info'
          "
        >
          {{ message.text }}
        </div>

        <div
          v-if="rows.length"
          class="results-accordion"
        >
          <div class="inmate-row inmate-row--head" aria-hidden="true">
            <span class="inmate-row__photo" />
            <span class="inmate-row__name">Name / Charges</span>
            <span class="inmate-row__cell">Booking #</span>
            <span class="inmate-row__cell">Cell</span>
            <span class="inmate-row__cell">Booked</span>
            <span class="inmate-row__cell inmate-row__cell--narrow">DOB</span>
            <span class="inmate-row__cell inmate-row__cell--narrow">Age</span>
            <span class="inmate-row__cell inmate-row__cell--narrow">Sex</span>
            <span class="inmate-row__cell inmate-row__cell--narrow">Race</span>
            <span class="inmate-row__cell">SPN</span>
          </div>

          <UAccordion
            v-model="selectedBookId"
            :items="accordionItems"
            value-key="bookId"
            :unmount-on-hide="false"
            :ui="{
              root: 'space-y-2',
              item: 'border border-[var(--border)] rounded-[var(--radius-sm)] bg-[var(--surface-2)] overflow-hidden data-[state=open]:ring-1 data-[state=open]:ring-[var(--accent-soft)]',
              trigger:
                'inmate-accordion-trigger w-full hover:bg-[rgba(45,74,62,0.04)] focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-[var(--accent)]',
              label: 'inmate-accordion-label',
              content: 'border-t border-[var(--border)] bg-[var(--surface)]',
              body: 'p-0',
            }"
          >
            <template #default="{ item }">
              <div class="inmate-row inmate-row--trigger">
                <div class="inmate-row__photo">
                  <InmateAvatar
                    :image-url="item.imageUrl"
                    :loading="item.photoLoading"
                    :alt="`Booking photo for ${item.displayName}`"
                  />
                </div>
                <span class="inmate-row__name">
                  <span>{{ item.displayName }}</span>
                  <span class="inmate-row__charge-count">{{ chargesSummary(item) }}</span>
                </span>
                <span class="inmate-row__cell">{{ item.bookingNumber }}</span>
                <span class="inmate-row__cell">{{ item.cellLocation }}</span>
                <span class="inmate-row__cell">{{
                  formatBookingDate(item)
                }}</span>
                <span class="inmate-row__cell inmate-row__cell--narrow">{{
                  formatDob(item.dob)
                }}</span>
                <span class="inmate-row__cell inmate-row__cell--narrow">{{
                  item.age != null ? item.age : "—"
                }}</span>
                <span class="inmate-row__cell inmate-row__cell--narrow">{{
                  item.sex
                }}</span>
                <span class="inmate-row__cell inmate-row__cell--narrow">{{
                  item.race
                }}</span>
                <span class="inmate-row__cell">{{ item.spn }}</span>
                <div class="inmate-row__meta">
                  <p class="inmate-row__meta-line">
                    <span>DOB {{ formatDob(item.dob) }}</span>
                    <span> · Booked {{ formatBookingDate(item) }}</span>
                  </p>
                </div>
              </div>
            </template>

            <template #trailing />

            <template #content="{ item }">
              <InmateChargesBlock
                :charges="item.charges"
                :loading="item.detailLoading"
                :error="item.detailError"
                @retry="retryRowDetail(item.bookId)"
              />
            </template>
          </UAccordion>
        </div>
      </section>

      <footer class="footer">
        <p>
          This app reads the same public Beltrami County inmate locator. It is
          not an official government site. Information may be incomplete or out
          of date; confirm with the county if it matters.
        </p>
      </footer>
    </main>
  </div>
</template>
