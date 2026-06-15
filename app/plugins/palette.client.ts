import { watch } from 'vue'
import { usePalette } from '~/composables/usePalette'

// Lädt die gespeicherte Palette, spiegelt sie als CSS-Vars auf :root und hält
// beides bei jeder Änderung synchron + persistent. Nur Client (.client.ts).
export default defineNuxtPlugin(() => {
  const { palette, load, save, applyCssVars } = usePalette()
  load()
  applyCssVars()
  watch(
    palette,
    () => {
      applyCssVars()
      save()
    },
    { deep: true },
  )
})
