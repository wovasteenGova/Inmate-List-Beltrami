<script setup lang="ts">
defineProps<{
  imageUrl?: string | null;
  loading?: boolean;
  alt?: string;
}>();
</script>

<template>
  <div
    class="inmate-avatar"
    :class="{ 'inmate-avatar--loading': loading && !imageUrl }"
  >
    <img
      v-if="imageUrl"
      class="inmate-avatar__photo"
      :src="imageUrl"
      :alt="alt || 'Booking photo'"
      loading="lazy"
      referrerpolicy="no-referrer"
    />
    <svg
      v-else
      class="inmate-avatar__placeholder"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle cx="12" cy="8" r="4" fill="none" stroke="currentColor" stroke-width="1.5" />
      <path
        d="M5 20c0-3.3 3.1-6 7-6s7 2.7 7 6"
        fill="none"
        stroke="currentColor"
        stroke-width="1.5"
        stroke-linecap="round"
      />
    </svg>
    <span
      v-if="loading && !imageUrl"
      class="inmate-avatar__spinner"
      aria-hidden="true"
    />
  </div>
</template>
