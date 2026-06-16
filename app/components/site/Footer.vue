<script setup lang="ts">
const year = new Date().getFullYear()
</script>

<template>
  <footer class="border-t border-line bg-surface">
    <div class="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-3">
      <div>
        <p class="font-display text-lg font-semibold text-text">rho<span class="text-accent">werk</span></p>
        <p class="mt-2 max-w-xs text-sm text-muted">Tech-Studio für digitale Präzisionsinstrumente.</p>
      </div>
      <div class="font-tel text-xs uppercase tracking-widest-2 text-muted">
        <p class="mb-3 text-text">Navigation</p>
        <ul class="space-y-2">
          <li><NuxtLink to="/leistungen" class="transition-colors hover:text-accent">Leistungen</NuxtLink></li>
          <li><NuxtLink to="/projekte" class="transition-colors hover:text-accent">Projekte</NuxtLink></li>
          <li><NuxtLink to="/agentur" class="transition-colors hover:text-accent">Agentur</NuxtLink></li>
          <li><NuxtLink to="/kontakt" class="transition-colors hover:text-accent">Kontakt</NuxtLink></li>
        </ul>
      </div>
      <div class="font-tel text-xs uppercase tracking-widest-2 text-muted">
        <p class="mb-3 text-text">Kontakt</p>
        <ul class="space-y-2">
          <li><a href="mailto:schmidt@rhowerk.de" class="transition-colors hover:text-accent">schmidt@rhowerk.de</a></li>
          <li>rhowerk.de</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-line">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 font-tel text-[11px] text-muted">
        <span>© {{ year }} rhowerk</span>
        <span>ρ · made with precision</span>
      </div>
    </div>
  </footer>
</template>
