<script setup lang="ts">
import type { AccordionItem } from "@nuxt/ui";
import type { InmateCharge, InmateRecord } from "~/composables/useBeltramiApi";

const PHOTO_BATCH_SIZE = 20;
const PHOTO_PREFETCH = 24;

type ResultRow = InmateRecord & {
  rowIndex: number;
  imageUrl: string | null;
  bookingDate: string | null;
  photoLoading: boolean;
  photoQueued: boolean;
  charges: InmateCharge[] | null;
  detailLoading: boolean;
};

type InmateAccordionItem = AccordionItem & ResultRow;

const { fetchInmates, fetchInmateDetail, fetchInmatePhotosBatch } =
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

const accordionListRef = ref<HTMLElement | null>(null);
let photoObserver: IntersectionObserver | null = null;
let photoQueue: string[] = [];
let photoFlushTimer: ReturnType<typeof setTimeout> | null = null;
let photoLoaderGeneration = 0;
let photoDrainActive = false;

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

function updatePhotoProgress() {
  const total = rows.value.length;
  const done = rows.value.filter((row) => !row.photoLoading).length;
  resultsLine.value =
    total +
    " record" +
    (total === 1 ? "" : "s") +
    " · photos " +
    done +
    "/" +
    total;
}

function applyPhoto(
  row: ResultRow,
  imageUrl: string | null,
  bookingDate: string | null = null,
) {
  row.imageUrl = imageUrl;
  if (bookingDate) row.bookingDate = bookingDate;
  row.photoLoading = false;
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
}

async function loadRowDetail(row: ResultRow) {
  if (row.detailLoading || row.charges) return;

  row.detailLoading = true;

  try {
    const detail = await fetchInmateDetail(
      row.bookId,
      row.rowIndex,
      filterParams(),
      searchToken.value,
    );
    applyDetail(row, detail);
  } catch {
    row.detailLoading = false;
  } finally {
    updatePhotoProgress();
  }
}

async function flushPhotoQueue(generation: number) {
  if (!photoQueue.length || generation !== photoLoaderGeneration) return;
  if (!searchToken.value) return;

  const batchIds = photoQueue.splice(0, PHOTO_BATCH_SIZE);
  const batchRows = batchIds
    .map((bookId) => rows.value.find((row) => row.bookId === bookId))
    .filter((row): row is ResultRow => Boolean(row));

  if (!batchRows.length) return;

  try {
    const details = await fetchInmatePhotosBatch(
      batchRows.map((row) => ({ bookId: row.bookId, rowIndex: row.rowIndex })),
      filterParams(),
      searchToken.value,
    );
    if (generation !== photoLoaderGeneration) return;

    const byId = new Map(details.map((detail) => [detail.bookId, detail]));
    for (const row of batchRows) {
      const detail = byId.get(row.bookId);
      applyPhoto(row, detail?.imageUrl ?? null, detail?.bookingDate ?? null);
    }
  } catch {
    if (generation !== photoLoaderGeneration) return;
    for (const row of batchRows) row.photoLoading = false;
  } finally {
    updatePhotoProgress();
    if (photoQueue.length && generation === photoLoaderGeneration) {
      schedulePhotoFlush(generation);
    } else if (generation === photoLoaderGeneration) {
      photoDrainActive = false;
    }
  }
}

function schedulePhotoFlush(generation: number) {
  if (photoFlushTimer) return;
  photoFlushTimer = setTimeout(() => {
    photoFlushTimer = null;
    void flushPhotoQueue(generation);
  }, 16);
}

function queuePhotoLoad(bookId: string, priority = false) {
  const row = rows.value.find((item) => item.bookId === bookId);
  if (!row || row.photoQueued || !row.photoLoading) return;
  row.photoQueued = true;
  if (priority) photoQueue.unshift(bookId);
  else photoQueue.push(bookId);
  schedulePhotoFlush(photoLoaderGeneration);
}

async function drainPhotoQueueLoop(generation: number) {
  if (photoDrainActive || generation !== photoLoaderGeneration) return;
  photoDrainActive = true;
  while (photoQueue.length && generation === photoLoaderGeneration) {
    await flushPhotoQueue(generation);
  }
  photoDrainActive = false;
}

function queueAllBackgroundPhotos() {
  for (const row of rows.value) {
    queuePhotoLoad(row.bookId, false);
  }
}

function setupPhotoObserver() {
  photoObserver?.disconnect();
  if (!accordionListRef.value) return;

  photoObserver = new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        const bookId = (entry.target as HTMLElement).dataset.bookId;
        if (bookId) queuePhotoLoad(bookId, true);
      }
    },
    { root: null, rootMargin: "240px 0px", threshold: 0.01 },
  );

  for (const el of accordionListRef.value.querySelectorAll<HTMLElement>(
    "[data-book-id]",
  )) {
    photoObserver.observe(el);
  }
}

function prefetchInitialPhotos() {
  for (const row of rows.value.slice(0, PHOTO_PREFETCH)) {
    queuePhotoLoad(row.bookId, true);
  }
  queueAllBackgroundPhotos();
  void drainPhotoQueueLoop(photoLoaderGeneration);
}

async function onAccordionChange(bookId: string | undefined) {
  if (!bookId) return;
  const row = rows.value.find((item) => item.bookId === bookId);
  if (row) await loadRowDetail(row);
}

async function onSearch() {
  message.value = null;
  loading.value = true;
  selectedBookId.value = undefined;
  searchToken.value = null;
  photoLoaderGeneration += 1;
  const generation = photoLoaderGeneration;
  resultsLine.value = "Loading roster…";
  rows.value = [];
  photoQueue = [];
  photoDrainActive = false;
  photoObserver?.disconnect();
  if (photoFlushTimer) {
    clearTimeout(photoFlushTimer);
    photoFlushTimer = null;
  }

  try {
    const data = await fetchInmates(filterParams());
    if (generation !== photoLoaderGeneration) return;

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
      photoQueued: false,
      charges: null,
      detailLoading: false,
    }));
    updatePhotoProgress();
    await nextTick();
    setupPhotoObserver();
    prefetchInitialPhotos();
  } catch (e: unknown) {
    const text =
      e && typeof e === "object" && "data" in e
        ? JSON.stringify((e as { data: unknown }).data)
        : e instanceof Error
          ? e.message
          : "Request failed.";
    message.value = { kind: "error", text };
    resultsLine.value = "";
  } finally {
    loading.value = false;
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
  photoLoaderGeneration += 1;
  photoQueue = [];
  photoDrainActive = false;
  photoObserver?.disconnect();
  if (photoFlushTimer) {
    clearTimeout(photoFlushTimer);
    photoFlushTimer = null;
  }
}

function chargesSummary(row: ResultRow) {
  if (row.detailLoading) return "Loading…";
  if (!row.charges) return "Tap to view";
  if (!row.charges.length) return "None listed";
  const n = row.charges.length;
  return n + " charge" + (n === 1 ? "" : "s");
}

watch(selectedBookId, (bookId) => {
  void onAccordionChange(bookId);
});

onMounted(() => {
  void onSearch();
});

onBeforeUnmount(() => {
  photoObserver?.disconnect();
  if (photoFlushTimer) clearTimeout(photoFlushTimer);
});
</script>

<template>
  <div>
    <header class="header">
      <div class="header__inner">
        <div class="header__brand">
          <span class="header__mark" aria-hidden="true" />
          <div>
            <h1 class="header__title">Inmate List Beltrami</h1>
            <p class="header__subtitle">Beltrami County, Minnesota</p>
          </div>
        </div>
        <p class="header__note">
          Search the current roster. Expand a row to view charges inline.
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
          ref="accordionListRef"
          class="results-accordion"
        >
          <div class="inmate-row inmate-row--head" aria-hidden="true">
            <span class="inmate-row__photo" />
            <span class="inmate-row__name">Name</span>
            <span class="inmate-row__cell">Booking #</span>
            <span class="inmate-row__cell">Cell</span>
            <span class="inmate-row__cell">Booking Date</span>
            <span class="inmate-row__cell inmate-row__cell--narrow">Age</span>
            <span class="inmate-row__cell inmate-row__cell--narrow">Sex</span>
            <span class="inmate-row__cell inmate-row__cell--narrow">Race</span>
            <span class="inmate-row__cell">Charges</span>
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
                <div :data-book-id="item.bookId" class="inmate-row__photo">
                  <InmateAvatar
                    :image-url="item.imageUrl"
                    :loading="item.photoLoading"
                    :alt="`Booking photo for ${item.displayName}`"
                  />
                </div>
                <span class="inmate-row__name">{{ item.displayName }}</span>
                <span class="inmate-row__cell">{{ item.bookingNumber }}</span>
                <span class="inmate-row__cell">{{ item.cellLocation }}</span>
                <span class="inmate-row__cell">{{
                  item.bookingDate || "—"
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
                <span class="inmate-row__cell inmate-row__cell--muted">{{
                  chargesSummary(item)
                }}</span>
                <span class="inmate-row__cell">{{ item.spn }}</span>
              </div>
            </template>

            <template #trailing />

            <template #content="{ item }">
              <InmateChargesBlock
                :charges="item.charges"
                :loading="item.detailLoading"
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
