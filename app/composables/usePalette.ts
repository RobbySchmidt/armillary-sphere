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
  brass: '#c9a24a',
  brassBright: '#e7c66b',
  ink: '#0b1026',
  void: '#05070f',
  bone: '#ece6d6',
  haze: '#7e91b4',
  hairline: '#2a3354',
  starBody: '#fff4d6',
  starGlow: '#ffd98a',
  fog: '#070b1c',
  lightWarm: '#ffd9a0',
  lightRim: '#6f8fd0',
  lightAmbient: '#35406a',
}

const STORAGE_KEY = 'lodestar-palette'

// Nur diese Keys spiegeln auf CSS-Custom-Properties (die 3D-Extras nicht).
const CSS_VAR_MAP: Partial<Record<keyof Palette, string>> = {
  brass: '--color-brass',
  brassBright: '--color-brass-bright',
  ink: '--color-ink',
  void: '--color-void',
  bone: '--color-bone',
  haze: '--color-haze',
  hairline: '--color-hairline',
}

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
