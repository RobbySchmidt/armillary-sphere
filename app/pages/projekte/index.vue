<script setup lang="ts">
import { projects } from '~/data/projects'

useHead({
  title: 'Projekte — rhowerk',
  meta: [
    {
      name: 'description',
      content: 'Ausgewählte Arbeiten von rhowerk: Hygieia, MZLA und Ergovision.',
    },
  ],
})
</script>

<template>
  <div class="rho">
    <section class="mx-auto max-w-6xl px-6 pt-32 pb-16">
      <SiteSectionLabel text="Projekte" />
      <h1
        class="mt-5 max-w-2xl font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text"
      >
        Instrumente, die wir gebaut haben.
      </h1>
      <p class="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
        Drei Projekte, drei Branchen, ein Prinzip: aus vielen Insellösungen ein klares
        Referenzsystem machen.
      </p>
    </section>

    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="grid gap-5 md:grid-cols-3">
        <SiteProjectCard v-for="p in projects" :key="p.slug" :project="p" />
      </div>
    </section>

    <SiteCtaBand />
  </div>
</template>
