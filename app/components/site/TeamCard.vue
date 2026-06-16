<script setup lang="ts">
import type { Member } from '~/data/team'
defineProps<{ member: Member }>()
</script>

<template>
  <div class="overflow-hidden rounded-2xl border border-line bg-surface">
    <div class="relative aspect-[4/5] overflow-hidden bg-stage">
      <img
        :src="member.image"
        :alt="`${member.name} — ${member.role}`"
        width="480"
        height="600"
        loading="lazy"
        class="size-full object-cover grayscale transition duration-500 hover:grayscale-0"
      />
    </div>
    <div class="p-7">
      <h3 class="font-display text-xl font-semibold text-text">{{ member.name }}</h3>
      <p class="mt-1 font-tel text-[11px] uppercase tracking-widest-2 text-accent">{{ member.role }}</p>
      <p class="mt-3 text-sm leading-relaxed text-muted">{{ member.focus }}</p>
    </div>
  </div>
</template>
