<script setup lang="ts">
import { useRoute } from 'vue-router'

useHead({
  title: 'Lodestar — Find true north for everything you ship',
  meta: [
    {
      name: 'description',
      content:
        'Lodestar is the observability platform that gives your distributed systems a single fixed reference point.',
    },
  ],
})

// Editor nur in der Entwicklung (oder explizit via ?editor) — nie im Prod-Build sichtbar.
const route = useRoute()
const showEditor = import.meta.dev || route.query.editor !== undefined
</script>

<template>
  <div class="lodestar min-h-screen bg-ink font-sans text-bone antialiased">
    <CelestialSiteHeader />
    <main>
      <CelestialHeroSection />
      <CelestialCatalogSection />
      <CelestialReadoutSection />
      <CelestialVoicesSection />
      <CelestialTiersSection />
      <CelestialCourseSection />
    </main>
    <CelestialSiteFooter />
    <ClientOnly>
      <CelestialColorEditor v-if="showEditor" />
    </ClientOnly>
  </div>
</template>
