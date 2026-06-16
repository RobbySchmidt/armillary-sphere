<script setup lang="ts">
import { getProject } from '~/data/projects'

const route = useRoute()
const project = getProject(String(route.params.slug))
if (!project) {
  throw createError({ statusCode: 404, statusMessage: 'Projekt nicht gefunden', fatal: true })
}

useHead({
  title: `${project.name} — rhowerk`,
  meta: [{ name: 'description', content: project.tagline }],
})
</script>

<template>
  <div v-if="project" class="rho">
    <!-- Hero mit dunkler Bühne -->
    <section class="relative overflow-hidden">
      <div
        class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-32 pb-16 lg:grid-cols-[1fr_0.85fr]"
      >
        <div>
          <SiteSectionLabel :text="`${project.category} · ${project.year}`" />
          <h1
            class="mt-5 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.04] text-text"
          >
            {{ project.name }}
          </h1>
          <p class="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{{ project.tagline }}</p>
          <p class="mt-6 font-tel text-[11px] uppercase tracking-widest-2 text-muted">
            {{ project.accentCoord }}
          </p>
        </div>
        <div
          v-if="project.image"
          class="aspect-video overflow-hidden rounded-2xl border border-line bg-stage"
        >
          <img
            :src="project.image"
            :alt="project.name"
            width="1400"
            height="788"
            class="size-full object-cover"
          />
        </div>
        <SiteSphereStage v-else height-class="h-[300px] sm:h-[380px]" />
      </div>
    </section>

    <!-- Meta -->
    <section class="mx-auto max-w-6xl px-6 py-10">
      <div class="grid gap-6 border-y border-line py-8 sm:grid-cols-3">
        <div>
          <p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Rolle</p>
          <p class="mt-2 text-text">{{ project.role }}</p>
        </div>
        <div>
          <p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Jahr</p>
          <p class="mt-2 text-text">{{ project.year }}</p>
        </div>
        <div>
          <p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Stack</p>
          <p class="mt-2 text-text">{{ project.stack.join(' · ') }}</p>
        </div>
      </div>
    </section>

    <!-- Story -->
    <section class="mx-auto max-w-3xl px-6 py-10">
      <div class="space-y-12">
        <div>
          <SiteSectionLabel no="01" text="Aufgabe" />
          <p class="mt-4 text-lg leading-relaxed text-text">{{ project.challenge }}</p>
        </div>
        <div>
          <SiteSectionLabel no="02" text="Ansatz" />
          <p class="mt-4 text-lg leading-relaxed text-text">{{ project.approach }}</p>
        </div>
        <div>
          <SiteSectionLabel no="03" text="Ergebnis" />
          <p class="mt-4 text-lg leading-relaxed text-text">{{ project.result }}</p>
        </div>
      </div>
    </section>

    <!-- Kennzahlen -->
    <section class="mx-auto max-w-6xl px-6 py-10">
      <div class="grid gap-5 sm:grid-cols-3">
        <div
          v-for="m in project.metrics"
          :key="m.label"
          class="rounded-2xl border border-line bg-surface p-7 text-center"
        >
          <p class="font-display text-3xl font-semibold text-accent">{{ m.value }}</p>
          <p class="mt-2 font-tel text-[11px] uppercase tracking-widest-2 text-muted">{{ m.label }}</p>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-6 py-10">
      <NuxtLink
        to="/projekte"
        class="font-tel text-xs uppercase tracking-widest-2 text-muted transition-colors hover:text-accent"
      >
        ← Alle Projekte
      </NuxtLink>
    </div>

    <SiteCtaBand />
  </div>
</template>
