<script setup lang="ts">
const voices = [
  {
    quote:
      'We replaced three tools with Lodestar and cut mean-time-to-detect from twenty minutes to under one. The single chart is the whole point.',
    name: 'Mara Velasquez',
    role: 'VP Platform, Lumen Labs',
    desig: 'station 07',
  },
  {
    quote:
      'Black Friday traffic spiked twelve-fold. Lodestar caught the one service drifting before any customer noticed. We slept.',
    name: 'Tobias Reinhart',
    role: 'CTO, Northwind Commerce',
    desig: 'station 19',
  },
]
</script>

<template>
  <section id="voices" class="relative bg-void py-24 sm:py-32">
    <div class="mx-auto max-w-6xl px-6">
      <p class="font-tel text-[11px] uppercase tracking-widest-2 text-brass">Voices from the field</p>

      <div class="mt-10 grid grid-cols-1 gap-px overflow-hidden rounded-lg border border-hairline bg-hairline md:grid-cols-2">
        <figure v-for="v in voices" :key="v.name" class="flex flex-col gap-8 bg-ink p-8 sm:p-10">
          <blockquote class="font-display text-2xl leading-snug text-bone sm:text-[1.75rem]">
            “{{ v.quote }}”
          </blockquote>
          <figcaption class="mt-auto flex items-baseline justify-between border-t border-hairline/60 pt-5">
            <div>
              <div class="text-bone">{{ v.name }}</div>
              <div class="text-sm text-haze">{{ v.role }}</div>
            </div>
            <span class="font-tel text-[11px] uppercase tracking-wider text-brass">{{ v.desig }}</span>
          </figcaption>
        </figure>
      </div>
    </div>
  </section>
</template>
