<script setup lang="ts">
useHead({
  title: 'Armillary Sphere',
  meta: [
    {
      name: 'description',
      content:
        'Lodestar is the observability platform that gives your distributed systems a single fixed reference point.',
    },
  ],
})
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
    <!-- Farb-Editor: immer verfügbar (auch im Production-Build / auf der Live-Seite) -->
    <ClientOnly>
      <CelestialColorEditor />
    </ClientOnly>
  </div>
</template>
