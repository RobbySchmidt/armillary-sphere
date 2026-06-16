<script setup lang="ts">
defineProps<{ no?: string; text: string }>()
</script>

<template>
  <p class="font-tel text-[11px] uppercase tracking-widest-2 text-accent">
    <span v-if="no" class="text-muted">{{ no }} ·</span> {{ text }}
  </p>
</template>
