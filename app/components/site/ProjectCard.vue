<script setup lang="ts">
import type { Project } from '~/data/projects'
defineProps<{ project: Project }>()
</script>

<template>
  <NuxtLink
    :to="`/projekte/${project.slug}`"
    class="group block overflow-hidden rounded-2xl border border-line bg-surface transition-colors hover:border-accent"
  >
    <div class="relative aspect-video overflow-hidden bg-stage">
      <img
        v-if="project.image"
        :src="project.image"
        :alt="project.name"
        width="1400"
        height="788"
        loading="lazy"
        class="size-full object-cover transition duration-500 group-hover:scale-[1.03]"
      />
      <div v-else class="absolute inset-0 grid place-items-center">
        <div class="size-28 rounded-full border border-accent/30" />
        <span class="absolute font-tel text-[11px] uppercase tracking-widest-2 text-muted">{{ project.name }}</span>
      </div>
    </div>
    <div class="p-7">
      <p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">{{ project.category }} · {{ project.year }}</p>
      <h3 class="mt-3 font-display text-2xl font-semibold text-text">{{ project.name }}</h3>
      <p class="mt-2 text-sm leading-relaxed text-muted">{{ project.tagline }}</p>
      <span class="mt-5 inline-flex items-center gap-2 font-tel text-xs uppercase tracking-widest-2 text-accent">
        Projekt ansehen <span class="transition-transform group-hover:translate-x-1">→</span>
      </span>
    </div>
  </NuxtLink>
</template>
