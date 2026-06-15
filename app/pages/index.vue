<script setup lang="ts">
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
  </div>
</template>
