import { reactive, toRaw } from 'vue'

export interface Palette {
  // Gold — synchron zwischen Seite und 3D
  brass: string
  brassBright: string
  // Seite (CSS-Token)
  ink: string
  void: string
  bone: string
  haze: string
  hairline: string
  // 3D-Extras
  starBody: string
  starGlow: string
  fog: string
  lightWarm: string
  lightRim: string
  lightAmbient: string
}

export const PALETTE_DEFAULTS: Palette = {
  // Rings — polished steel / platinum (cool, neutral) so the crimson core pops
  brass: '#8a9099',
  brassBright: '#c9d0d8',
  ink: '#07090f',
  void: '#04060b',
  bone: '#e9ecf2',
  haze: '#8a909b',
  hairline: '#1c212c',
  // Core — warm-white body, crimson glow = brand #fc0f47
  starBody: '#fff0f2',
  starGlow: '#fc0f47',
  fog: '#05070f',
  // Lights tuned to the cool steel + crimson scheme
  lightWarm: '#ffd9dd',
  lightRim: '#7f8da6',
  lightAmbient: '#2a3142',
}

const STORAGE_KEY = 'lodestar-palette'

// The site theme now owns its own --rho-* tokens (see tailwind.css); the sphere
// reads `palette` directly in JS, so nothing needs mirroring to CSS vars anymore.
const CSS_VAR_MAP: Partial<Record<keyof Palette, string>> = {}

const HEX_RE = /^#[0-9a-fA-F]{6}$/

export function isValidHex(v: string): boolean {
  return HEX_RE.test(v)
}

function create() {
  const palette = reactive<Palette>({ ...PALETTE_DEFAULTS })

  function load() {
    if (typeof window === 'undefined') return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (!raw) return
      const saved = JSON.parse(raw) as Partial<Palette>
      for (const k of Object.keys(PALETTE_DEFAULTS) as (keyof Palette)[]) {
        const v = saved[k]
        if (typeof v === 'string' && isValidHex(v)) palette[k] = v
      }
    } catch {
      /* corrupt storage — ignore, keep defaults */
    }
  }

  function save() {
    if (typeof window === 'undefined') return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(toRaw(palette)))
    } catch {
      /* storage full/blocked — ignore */
    }
  }

  function applyCssVars() {
    if (typeof document === 'undefined') return
    const root = document.documentElement
    for (const key of Object.keys(CSS_VAR_MAP) as (keyof Palette)[]) {
      root.style.setProperty(CSS_VAR_MAP[key]!, palette[key])
    }
  }

  function reset() {
    Object.assign(palette, PALETTE_DEFAULTS)
  }

  function toJSON(): string {
    return JSON.stringify(toRaw(palette), null, 2)
  }

  return { palette, load, save, applyCssVars, reset, toJSON }
}

let singleton: ReturnType<typeof create> | null = null

export function usePalette() {
  if (!singleton) singleton = create()
  return singleton
}
