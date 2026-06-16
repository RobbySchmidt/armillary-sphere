<script setup lang="ts">
import { team } from '~/data/team'

useHead({
  title: 'Agentur — rhowerk',
  meta: [
    {
      name: 'description',
      content: 'Von der Designagentur zum Tech-Studio. Drei Köpfe, ein Anspruch: Präzision.',
    },
  ],
})

const values = [
  { no: '01', title: 'Präzision', text: 'Wir bauen Dinge so, dass sie stimmen — im Detail und im Ganzen.' },
  { no: '02', title: 'Orientierung', text: 'Gute Software gibt einen festen Bezugspunkt. Daran richten wir alles aus.' },
  { no: '03', title: 'Handwerk', text: 'Design und Engineering sind für uns dasselbe Handwerk, nur an verschiedenen Achsen.' },
]
</script>

<template>
  <div class="rho">
    <section class="mx-auto max-w-6xl px-6 pt-32 pb-16">
      <SiteSectionLabel text="Agentur" />
      <h1
        class="mt-5 max-w-3xl font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text"
      >
        Von der Designagentur zum Tech-Studio.
      </h1>
      <p class="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
        Wir kommen aus der Gestaltung — und haben gemerkt, dass die besten Produkte entstehen, wenn
        Design und Technik aus einer Hand kommen. Heute sind wir ein kleines, fokussiertes
        Tech-Studio: drei Köpfe, ein Anspruch.
      </p>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-10">
      <div class="grid gap-5 sm:grid-cols-3">
        <div v-for="v in values" :key="v.no" class="rounded-2xl border border-line bg-surface p-7">
          <p class="font-tel text-xs text-accent">{{ v.no }}</p>
          <h3 class="mt-3 font-display text-xl font-semibold text-text">{{ v.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ v.text }}</p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-16">
      <SiteSectionLabel no="C" text="Das Team" />
      <div class="mt-8 grid gap-5 sm:grid-cols-3">
        <SiteTeamCard v-for="m in team" :key="m.name" :member="m" />
      </div>
    </section>

    <SiteCtaBand />
  </div>
</template>
