<script setup lang="ts">
// Capabilities presented as a star catalog. Bayer letters are real catalog
// designations — order by brightness/importance, not decoration.
const entries = [
  {
    bayer: 'α',
    name: 'Fixed-point telemetry',
    desc: 'Every metric, log, and trace plotted on one chart with a shared clock. No more reconciling four dashboards at 3am.',
  },
  {
    bayer: 'β',
    name: 'Constellation tracing',
    desc: 'Follow a single request across every service in the system and watch the whole path light up, span by span.',
  },
  {
    bayer: 'γ',
    name: 'Wandering-star detection',
    desc: 'Anomaly models learn each signal’s normal orbit and flag the ones that drift — before your users feel it.',
  },
  {
    bayer: 'δ',
    name: 'Ground-station ingest',
    desc: 'Collect from 40 regions over open protocols. Data lands in under a second, wherever it originates.',
  },
  {
    bayer: 'ε',
    name: 'Quiet-sky alerting',
    desc: 'Routes, dedupes, and silences noise so the on-call is woken only when the sky is genuinely falling.',
  },
  {
    bayer: 'ζ',
    name: 'No orbit lock-in',
    desc: 'OpenTelemetry-native and export-friendly. Your data stays yours — chart it here or take it anywhere.',
  },
]
</script>

<template>
  <section id="catalog" class="relative bg-void py-24 sm:py-32">
    <div class="mx-auto max-w-6xl px-6">
      <header class="flex flex-col gap-4 border-b border-hairline/70 pb-8 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p class="font-tel text-[11px] uppercase tracking-widest-2 text-brass">Catalog · vol. I</p>
          <h2 class="mt-3 font-display text-4xl leading-tight text-bone sm:text-5xl">
            Six instruments, one sky
          </h2>
        </div>
        <p class="max-w-sm text-sm leading-relaxed text-haze">
          Everything in Lodestar is built to do one thing: keep your bearings as your
          systems grow. Listed by magnitude.
        </p>
      </header>

      <ul class="mt-4">
        <li
          v-for="e in entries"
          :key="e.bayer"
          class="group grid grid-cols-[2.5rem_1fr] items-start gap-x-5 gap-y-2 border-b border-hairline/40 py-8 transition-colors hover:bg-ink/40 sm:grid-cols-[3.5rem_14rem_1fr] sm:gap-x-8"
        >
          <span class="font-display text-3xl italic text-brass transition-colors group-hover:text-brass-bright sm:text-4xl">
            {{ e.bayer }}
          </span>
          <h3 class="self-center font-display text-xl text-bone sm:text-2xl">{{ e.name }}</h3>
          <p class="col-span-2 text-sm leading-relaxed text-haze sm:col-span-1 sm:max-w-md">
            {{ e.desc }}
          </p>
        </li>
      </ul>
    </div>
  </section>
</template>
