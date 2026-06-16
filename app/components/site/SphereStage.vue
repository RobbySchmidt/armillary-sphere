<script setup lang="ts">
withDefaults(defineProps<{ heightClass?: string }>(), {
  heightClass: 'h-[340px] sm:h-[440px] lg:h-[560px]',
})
</script>

<template>
  <div :class="['relative w-full overflow-hidden rounded-2xl bg-stage', heightClass]">
    <div class="pointer-events-none absolute inset-0 graticule opacity-40" aria-hidden="true" />
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
      style="background: radial-gradient(circle, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 65%)"
      aria-hidden="true"
    />
    <ClientOnly>
      <SiteSphere class="absolute inset-0" />
      <template #fallback>
        <div class="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div class="size-48 rounded-full border border-white/15" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
