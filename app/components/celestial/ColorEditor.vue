<script setup lang="ts">
import { ref } from 'vue'
import { isValidHex, usePalette } from '~/composables/usePalette'

const { palette, reset, toJSON } = usePalette()

const open = ref(true)
const copied = ref(false)

type Field = { key: keyof typeof palette; label: string }

const goldFields: Field[] = [
  { key: 'brass', label: 'Gold (brass)' },
  { key: 'brassBright', label: 'Gold hell (brass-bright)' },
]
const pageFields: Field[] = [
  { key: 'ink', label: 'Hintergrund (ink)' },
  { key: 'void', label: 'Tiefschwarz (void)' },
  { key: 'bone', label: 'Text (bone)' },
  { key: 'haze', label: 'Gedämpfter Text (haze)' },
  { key: 'hairline', label: 'Rahmen (hairline)' },
]
const objectFields: Field[] = [
  { key: 'starBody', label: 'Stern-Körper' },
  { key: 'starGlow', label: 'Stern-Glühen' },
  { key: 'fog', label: 'Nebel (Fog)' },
  { key: 'lightWarm', label: 'Warmlicht (key)' },
  { key: 'lightRim', label: 'Blaulicht (rim)' },
  { key: 'lightAmbient', label: 'Ambient' },
]

function setColor(key: keyof typeof palette, val: string) {
  if (isValidHex(val)) palette[key] = val
}

async function copyJson() {
  try {
    await navigator.clipboard.writeText(toJSON())
    copied.value = true
    setTimeout(() => (copied.value = false), 1200)
  } catch {
    /* clipboard blocked — Nutzer kann Textarea manuell markieren */
  }
}
</script>

<template>
  <div
    class="fixed bottom-4 right-4 z-[9999] w-72 rounded-lg border border-white/15 bg-[#0b1026]/95 text-[#ece6d6] shadow-2xl backdrop-blur"
    style="font-family: 'Space Mono', ui-monospace, monospace"
  >
    <div class="flex items-center justify-between border-b border-white/10 px-3 py-2">
      <span class="text-xs uppercase tracking-widest">Farb-Editor</span>
      <button class="text-xs opacity-70 hover:opacity-100" @click="open = !open">
        {{ open ? '–' : '+' }}
      </button>
    </div>

    <div v-if="open" class="max-h-[70vh] overflow-y-auto px-3 py-2">
      <template v-for="(group, gi) in [goldFields, pageFields, objectFields]" :key="gi">
        <p class="mt-2 mb-1 text-[10px] uppercase tracking-widest opacity-60">
          {{ ['Gold (synchron)', 'Seite', '3D-Extras'][gi] }}
        </p>
        <div v-for="f in group" :key="f.key" class="flex items-center gap-2 py-1">
          <input
            type="color"
            :value="palette[f.key]"
            class="h-7 w-9 cursor-pointer rounded border-0 bg-transparent p-0"
            @input="setColor(f.key, ($event.target as HTMLInputElement).value)"
          />
          <input
            type="text"
            :value="palette[f.key]"
            class="w-24 rounded bg-black/30 px-2 py-1 text-xs"
            @change="setColor(f.key, ($event.target as HTMLInputElement).value)"
          />
          <span class="truncate text-[11px] opacity-80">{{ f.label }}</span>
        </div>
      </template>

      <div class="mt-3 flex gap-2">
        <button
          class="flex-1 rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
          @click="reset()"
        >
          Reset
        </button>
        <button
          class="flex-1 rounded bg-[#c9a24a] px-2 py-1 text-xs text-[#0b1026] hover:bg-[#e7c66b]"
          @click="copyJson()"
        >
          {{ copied ? 'Kopiert!' : 'JSON kopieren' }}
        </button>
      </div>

      <textarea
        readonly
        class="mt-2 h-28 w-full rounded bg-black/40 p-2 text-[10px] leading-tight"
        :value="toJSON()"
      />
    </div>
  </div>
</template>
