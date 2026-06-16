<script setup lang="ts">
import type { Service } from '~/data/services'
defineProps<{ service: Service }>()
</script>

<template>
  <div class="rounded-2xl border border-line bg-surface p-7">
    <p class="font-tel text-xs text-accent">{{ service.no }}</p>
    <h3 class="mt-3 font-display text-xl font-semibold text-text">{{ service.title }}</h3>
    <p class="mt-2 text-sm leading-relaxed text-muted">{{ service.summary }}</p>
    <ul class="mt-5 flex flex-wrap gap-2">
      <li
        v-for="p in service.points"
        :key="p"
        class="rounded-full border border-line px-3 py-1 font-tel text-[11px] text-muted"
      >
        {{ p }}
      </li>
    </ul>
  </div>
</template>
