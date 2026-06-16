<script setup lang="ts">
// Title/description are set per-page via useHead. The theme class on <html> is
// managed by useTheme + the FOUC guard script in nuxt.config — not hardcoded here.
useHead({
  titleTemplate: (title) => (title ? title : 'rhowerk — Tech-Studio'),
})
</script>

<template>
  <div>
    <NuxtRouteAnnouncer />
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
