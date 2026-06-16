<script setup lang="ts">
import { projects } from '~/data/projects'
import { services } from '~/data/services'

useHead({
  title: 'rhowerk — Tech-Studio für digitale Präzisionsinstrumente',
  meta: [
    {
      name: 'description',
      content:
        'rhowerk ist ein Tech-Studio, das Software mit dem Anspruch eines Präzisionsinstruments baut. Produktentwicklung, Plattform-Architektur und Design aus einer Hand.',
    },
  ],
})
</script>

<template>
  <div class="rho">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div
        class="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-24 pb-16 lg:grid-cols-[minmax(0,1fr)_34rem]"
      >
        <div>
          <div class="rise rise-1">
            <SiteSectionLabel text="ρ · Tech-Studio · ehem. Designagentur" />
          </div>
          <h1
            class="rise rise-2 engrave mt-5 hyphens-auto wrap-break-word font-display text-[clamp(2.4rem,5vw,4rem)] font-semibold leading-[1.04] text-text"
          >
            Wir bauen Software wie <span class="text-accent">Präzisionsinstrumente</span>.
          </h1>
          <p class="rise rise-3 mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            rhowerk gibt komplexen Systemen einen festen Bezugspunkt. Aus unserer Herkunft als
            Designagentur und unserem Anspruch als Ingenieure entsteht Software, die Orientierung
            schafft.
          </p>
          <div class="rise rise-4 mt-9 flex flex-wrap items-center gap-4">
            <NuxtLink
              to="/projekte"
              class="rounded-sm bg-accent px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-white transition-colors hover:bg-accent-bright"
            >
              Projekte ansehen
            </NuxtLink>
            <NuxtLink
              to="/leistungen"
              class="rounded-sm border border-line px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-text transition-colors hover:border-accent"
            >
              Leistungen →
            </NuxtLink>
          </div>
          <div class="rise rise-4 mt-12 h-px w-40 origin-left accent-rule draw-rule" aria-hidden="true" />
          <p class="rise rise-4 mt-4 font-tel text-[11px] text-muted">
            Drei Köpfe · Design & Engineering aus einer Hand
          </p>
        </div>
        <div class="rise rise-3 relative h-[380px] w-full sm:h-[480px] lg:h-[600px]">
          <SiteSphereStage class="absolute inset-0" height-class="h-full" />
        </div>
      </div>
    </section>

    <!-- Leistungen-Teaser -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <SiteSectionLabel no="A" text="Was wir tun" />
      <div class="mt-8 grid gap-5 sm:grid-cols-2">
        <SiteServiceCard v-for="s in services" :key="s.no" :service="s" />
      </div>
    </section>

    <!-- Projekte -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <div class="flex items-end justify-between gap-6">
        <SiteSectionLabel no="B" text="Ausgewählte Projekte" />
        <NuxtLink
          to="/projekte"
          class="hidden font-tel text-xs uppercase tracking-widest-2 text-muted transition-colors hover:text-accent sm:block"
        >
          Alle Projekte →
        </NuxtLink>
      </div>
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <SiteProjectCard v-for="p in projects" :key="p.slug" :project="p" />
      </div>
    </section>

    <SiteCtaBand />
  </div>
</template>
