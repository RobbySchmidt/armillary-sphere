<script setup lang="ts">
const columns = [
  { title: 'Platform', links: ['Telemetry', 'Tracing', 'Alerting', 'Catalog', 'Status'] },
  { title: 'Observatory', links: ['About', 'Careers', 'Field notes', 'Press', 'Contact'] },
  { title: 'Almanac', links: ['Docs', 'API', 'Guides', 'OpenTelemetry', 'Support'] },
]
</script>

<template>
  <footer class="relative border-t border-hairline bg-ink">
    <div class="mx-auto max-w-6xl px-6 py-16">
      <div class="grid grid-cols-2 gap-10 md:grid-cols-5">
        <div class="col-span-2">
          <div class="flex items-baseline gap-2">
            <span class="font-display text-xl text-bone">Lodestar</span>
            <span class="font-tel text-[10px] text-brass">α&nbsp;UMi</span>
          </div>
          <p class="mt-4 max-w-xs text-sm leading-relaxed text-haze">
            One fixed reference point for systems at any scale. Built by people who’ve
            been woken at 3am one too many times.
          </p>
          <p class="mt-6 font-tel text-[11px] uppercase tracking-wider text-haze/60">
            51.4769° N · 0.0005° W — Greenwich
          </p>
        </div>

        <div v-for="col in columns" :key="col.title">
          <h3 class="font-tel text-[11px] uppercase tracking-widest-2 text-brass">{{ col.title }}</h3>
          <ul class="mt-5 space-y-3">
            <li v-for="link in col.links" :key="link">
              <a href="#" class="text-sm text-haze transition-colors hover:text-bone">{{ link }}</a>
            </li>
          </ul>
        </div>
      </div>

      <div class="mt-14 flex flex-col items-center justify-between gap-3 border-t border-hairline/60 pt-8 font-tel text-[11px] uppercase tracking-wider text-haze/60 sm:flex-row">
        <p>© 2026 Lodestar Observatory, Inc.</p>
        <p>Charted by hand, among the stars</p>
      </div>
    </div>
  </footer>
</template>
