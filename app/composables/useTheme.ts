import { ref } from 'vue'

export type ThemeMode = 'light' | 'dark'
const STORAGE_KEY = 'rho-theme'

const mode = ref<ThemeMode>('dark')
let initialized = false

function apply(next: ThemeMode) {
  if (typeof document === 'undefined') return
  document.documentElement.classList.toggle('dark', next === 'dark')
}

export function useTheme() {
  function init() {
    if (initialized || typeof window === 'undefined') return
    initialized = true
    const saved = window.localStorage.getItem(STORAGE_KEY) as ThemeMode | null
    if (saved === 'light' || saved === 'dark') {
      mode.value = saved
    } else {
      mode.value = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark'
    }
    apply(mode.value)
  }

  function set(next: ThemeMode) {
    mode.value = next
    apply(next)
    if (typeof window !== 'undefined') window.localStorage.setItem(STORAGE_KEY, next)
  }

  function toggle() {
    set(mode.value === 'dark' ? 'light' : 'dark')
  }

  return { mode, init, set, toggle }
}
