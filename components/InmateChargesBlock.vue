<script setup lang="ts">
import type { InmateCharge } from "~/composables/useBeltramiApi";

defineProps<{
  charges: InmateCharge[] | null;
  loading: boolean;
  error: string | null;
}>();

defineEmits<{ retry: [] }>();
</script>

<template>
  <div class="charges-block">
    <div v-if="loading" class="charges-block__loading">Loading charges…</div>

    <div v-else-if="error" class="charges-block__empty">
      <p>{{ error }}</p>
      <button type="button" class="btn btn--ghost" @click="$emit('retry')">Retry</button>
    </div>

    <div v-else-if="charges && charges.length" class="charges-table-wrap">
      <table class="charges-table">
        <thead>
          <tr>
            <th scope="col">Case #</th>
            <th scope="col">Charge</th>
            <th scope="col">Description</th>
            <th scope="col">Severity</th>
            <th scope="col">Court</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(c, i) in charges" :key="`${c.caseNumber}-${c.charge}-${i}`">
            <td>{{ c.caseNumber }}</td>
            <td>{{ c.charge }}</td>
            <td>{{ c.description }}</td>
            <td>{{ c.severity || "—" }}</td>
            <td>{{ c.courtBranch || "—" }}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-else class="charges-block__empty">No charges listed for this booking.</p>
  </div>
</template>
