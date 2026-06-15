<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'

const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 16)
onMounted(() => {
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const nav = [
  { label: 'Catalog', href: '#catalog' },
  { label: 'Readout', href: '#readout' },
  { label: 'Voices', href: '#voices' },
  { label: 'Tiers', href: '#tiers' },
]
</script>

<template>
  <header
    :class="[
      'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
      scrolled ? 'border-b border-hairline/60 bg-ink/80 backdrop-blur-md' : 'border-b border-transparent',
    ]"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <a href="#top" class="flex items-baseline gap-2">
        <span class="font-display text-xl tracking-tight text-bone">Lodestar</span>
        <span class="font-tel text-[10px] text-brass">α&nbsp;UMi</span>
      </a>

      <nav class="hidden items-center gap-8 md:flex">
        <a
          v-for="n in nav"
          :key="n.href"
          :href="n.href"
          class="font-tel text-xs uppercase tracking-widest-2 text-haze transition-colors hover:text-bone"
        >
          {{ n.label }}
        </a>
      </nav>

      <a
        href="#course"
        class="font-tel text-xs uppercase tracking-widest-2 text-ink bg-brass hover:bg-brass-bright transition-colors rounded-sm px-4 py-2"
      >
        Set course ↗
      </a>
    </div>
  </header>
</template>
