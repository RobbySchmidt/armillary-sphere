<script setup lang="ts">
useHead({
  htmlAttrs: { class: 'dark', lang: 'en' },
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
  <div class="min-h-screen bg-background text-foreground">
    <NuxtRouteAnnouncer />
    <NuxtPage />
  </div>
</template>
