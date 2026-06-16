<script setup lang="ts">
import { services } from '~/data/services'

useHead({
  title: 'Leistungen — rhowerk',
  meta: [
    {
      name: 'description',
      content:
        'Produkt- & Webentwicklung, Plattform-Architektur, Design-Systeme und digitale Strategie — Gestaltung und Engineering aus einer Hand.',
    },
  ],
})
</script>

<template>
  <div class="rho">
    <section class="mx-auto max-w-6xl px-6 pt-32 pb-16">
      <SiteSectionLabel text="Leistungen" />
      <h1
        class="mt-5 max-w-2xl font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text"
      >
        Vier Achsen, ein ausgerichtetes System.
      </h1>
      <p class="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
        Wir verbinden Gestaltung und Engineering zu einem Werkzeug — von der ersten Idee bis zur
        tragfähigen Plattform.
      </p>
    </section>

    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="grid gap-5 sm:grid-cols-2">
        <SiteServiceCard v-for="s in services" :key="s.no" :service="s" />
      </div>
    </section>

    <SiteCtaBand />
  </div>
</template>
