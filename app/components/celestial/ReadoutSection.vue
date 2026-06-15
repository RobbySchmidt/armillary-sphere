<script setup lang="ts">
const readings = [
  { value: '12.4B', label: 'events charted / day', note: 'across all stations' },
  { value: '40', label: 'ground stations', note: 'six continents' },
  { value: '< 60 s', label: 'mean time to detect', note: 'p50, last quarter' },
  { value: '99.99%', label: 'catalog uptime', note: '12-month trailing' },
]
</script>

<template>
  <section id="readout" class="relative bg-ink py-20">
    <div class="mx-auto max-w-6xl px-6">
      <div class="mb-10 flex items-center gap-4">
        <span class="font-tel text-[11px] uppercase tracking-widest-2 text-brass">Observatory readout</span>
        <span class="h-px flex-1 brass-rule opacity-50" />
      </div>

      <dl class="grid grid-cols-2 gap-x-8 gap-y-12 lg:grid-cols-4">
        <div v-for="r in readings" :key="r.label" class="border-l border-hairline pl-5">
          <dt class="font-display text-5xl text-bone sm:text-6xl">{{ r.value }}</dt>
          <dd class="mt-3 text-sm text-haze">{{ r.label }}</dd>
          <dd class="mt-1 font-tel text-[11px] uppercase tracking-wider text-haze/60">{{ r.note }}</dd>
        </div>
      </dl>
    </div>
  </section>
</template>
