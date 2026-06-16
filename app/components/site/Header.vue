<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { mode, init, toggle } = useTheme()
const scrolled = ref(false)
const open = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 16)
onMounted(() => {
  init()
  onScroll()
  window.addEventListener('scroll', onScroll, { passive: true })
})
onBeforeUnmount(() => window.removeEventListener('scroll', onScroll))

const nav = [
  { label: 'Leistungen', to: '/leistungen' },
  { label: 'Projekte', to: '/projekte' },
  { label: 'Agentur', to: '/agentur' },
  { label: 'Kontakt', to: '/kontakt' },
]
</script>

<template>
  <header
    :class="[
      'fixed inset-x-0 top-0 z-50 transition-colors duration-500',
      scrolled || open ? 'border-b border-line/70 bg-bg/80 backdrop-blur-md' : 'border-b border-transparent',
    ]"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <NuxtLink to="/" class="flex items-baseline gap-2" @click="open = false">
        <span class="font-display text-xl font-semibold tracking-tight text-text">rho<span class="text-accent">werk</span></span>
        <span class="font-tel text-[10px] text-muted">ρ</span>
      </NuxtLink>

      <nav class="hidden items-center gap-8 md:flex">
        <NuxtLink
          v-for="n in nav"
          :key="n.to"
          :to="n.to"
          class="font-tel text-xs uppercase tracking-widest-2 text-muted transition-colors hover:text-text"
          active-class="text-text"
        >
          {{ n.label }}
        </NuxtLink>
      </nav>

      <div class="flex items-center gap-2">
        <button
          type="button"
          :aria-label="mode === 'dark' ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren'"
          class="grid size-9 place-items-center rounded-sm border border-line text-muted transition-colors hover:border-accent hover:text-text"
          @click="toggle"
        >
          <span class="font-tel text-xs">{{ mode === 'dark' ? '☀' : '☾' }}</span>
        </button>
        <button
          type="button"
          aria-label="Menü"
          class="grid size-9 place-items-center rounded-sm border border-line text-muted transition-colors hover:border-accent hover:text-text md:hidden"
          @click="open = !open"
        >
          <span class="font-tel text-xs">{{ open ? '✕' : '≡' }}</span>
        </button>
      </div>
    </div>

    <!-- mobile nav -->
    <nav v-if="open" class="border-t border-line/70 bg-bg/95 backdrop-blur-md md:hidden">
      <div class="mx-auto flex max-w-6xl flex-col px-6 py-3">
        <NuxtLink
          v-for="n in nav"
          :key="n.to"
          :to="n.to"
          class="py-3 font-tel text-xs uppercase tracking-widest-2 text-muted transition-colors hover:text-text"
          active-class="text-text"
          @click="open = false"
        >
          {{ n.label }}
        </NuxtLink>
      </div>
    </nav>
  </header>
</template>
