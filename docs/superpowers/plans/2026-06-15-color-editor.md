# Farb-Editor (Dev-Tool) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ein Dev-only Farb-Editor-Panel, mit dem die komplette Palette der Lodestar-Landingpage (CSS-Seitenfarben + Farben des 3D-Armillary-Objekts) live angepasst wird; gefundene Werte werden als JSON an Claude übergeben und fest in den Code geschrieben.

**Architecture:** Ein reaktives Palette-Singleton (`usePalette`) ist Single Source of Truth. Ein Client-Plugin spiegelt die Palette als CSS-Custom-Properties auf `:root` (Seite färbt live) und persistiert in `localStorage`. `Armillary3D.vue` liest dieselbe Palette und aktualisiert per `watch` gezielt THREE-Materialien/Lichter/Fog und regeneriert Gradient-Texturen (3D färbt live). Das Editor-Panel wird nur unter `import.meta.dev` (oder `?editor`) gerendert.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Tailwind CSS v4 (`@theme`), three.js (r184), TypeScript.

**Verification model:** Dieses Repo hat keinen Test-Runner; das Feature ist visuell und Dev-only. Verifikation erfolgt manuell im laufenden `yarn dev` plus einem finalen `yarn build` (Production-Output enthält das Panel nicht). Jede Task endet mit einem Commit.

**Referenz-Spec:** `docs/superpowers/specs/2026-06-15-color-editor-design.md`

---

## File Structure

- **Create** `app/composables/usePalette.ts` — reaktives Palette-Singleton, Defaults, localStorage, `applyCssVars`, `reset`, `toJSON`, `isValidHex`.
- **Create** `app/plugins/palette.client.ts` — lädt Palette, wendet CSS-Vars an, watcht für Save + Reapply.
- **Create** `app/components/celestial/ColorEditor.vue` — schwebendes Panel mit gruppierten Color-Inputs, Reset, JSON-Readout + Copy.
- **Modify** `app/assets/css/tailwind.css` — Lodestar-Farb-Token von `@theme inline` → `@theme` (Fonts bleiben inline).
- **Modify** `app/components/celestial/Armillary3D.vue` — Farben aus `usePalette()`, `applyPalette()` + `watch`, Cleanup erweitert.
- **Modify** `app/components/celestial/HeroSection.vue` — Gold-Glow an `var(--color-brass-bright)` binden.
- **Modify** `app/pages/index.vue` — `<CelestialColorEditor>` dev-only via `<ClientOnly>` einbinden.

---

## Task 1: Tailwind-Farb-Token auf `var()`-Basis umstellen

Damit die Seite zur Laufzeit umfärbbar wird, müssen die Utilities `var(--color-*)` referenzieren statt der eingebackenen Hexwerte.

**Files:**
- Modify: `app/assets/css/tailwind.css:152-162`

- [ ] **Step 1: Lodestar-Block aufteilen**

Ersetze den bestehenden Block (aktuell Zeilen 152-162):

```css
@theme inline {
  --color-ink: #0b1026;
  --color-void: #05070f;
  --color-bone: #ece6d6;
  --color-brass: #c9a24a;
  --color-brass-bright: #e7c66b;
  --color-haze: #7e91b4;
  --color-hairline: #2a3354;
  --font-display: 'Fraunces', Georgia, serif;
  --font-tel: 'Space Mono', ui-monospace, monospace;
}
```

durch:

```css
/* Colors as non-inline @theme so utilities emit var(--color-*) and can be
   recolored at runtime by the dev color editor (see usePalette.applyCssVars). */
@theme {
  --color-ink: #0b1026;
  --color-void: #05070f;
  --color-bone: #ece6d6;
  --color-brass: #c9a24a;
  --color-brass-bright: #e7c66b;
  --color-haze: #7e91b4;
  --color-hairline: #2a3354;
}

@theme inline {
  --font-display: 'Fraunces', Georgia, serif;
  --font-tel: 'Space Mono', ui-monospace, monospace;
}
```

- [ ] **Step 2: Dev-Server starten und kompiliertes CSS prüfen**

Run: `yarn dev` (laufen lassen), dann in einem zweiten Terminal:
Run: `grep -o '\.bg-ink{[^}]*}' .nuxt/dist/client/_nuxt/*.css || grep -ro 'bg-ink{[^}]*}' .nuxt`

Expected: `.bg-ink` enthält jetzt `var(--color-ink)` statt `#0b1026`. (Falls der Pfad abweicht, im Browser-DevTools die Regel `.bg-ink` inspizieren — sie muss `background-color: var(--color-ink)` zeigen.)

- [ ] **Step 3: Optische Gleichheit prüfen**

Im Browser `http://localhost:3000` öffnen. Die Seite muss **identisch** aussehen wie zuvor (dunkler Hintergrund, goldene Akzente). Zur Live-Gegenprobe in der DevTools-Konsole:

```js
document.documentElement.style.setProperty('--color-brass', '#ff0000')
```

Expected: Alle goldenen Elemente werden rot. Danach Wert wieder entfernen:

```js
document.documentElement.style.removeProperty('--color-brass')
```

- [ ] **Step 4: Commit**

```bash
git add app/assets/css/tailwind.css
git commit -m "refactor(css): lodestar color tokens to non-inline @theme for runtime theming"
```

---

## Task 2: `usePalette`-Composable + Client-Plugin

Single Source of Truth für die Palette inкл. Persistenz und Live-Anwendung der CSS-Vars.

**Files:**
- Create: `app/composables/usePalette.ts`
- Create: `app/plugins/palette.client.ts`

- [ ] **Step 1: Composable anlegen**

Create `app/composables/usePalette.ts`:

```ts
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
```

> Hinweis: Das Modul-Singleton ist akzeptabel, weil es nur client-seitig mutiert wird (Editor + 3D sind client-only); serverseitig bleibt es auf Defaults.

- [ ] **Step 2: Client-Plugin anlegen**

Create `app/plugins/palette.client.ts`:

```ts
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
```

- [ ] **Step 3: Dev-Server prüfen**

`yarn dev` läuft. Browser neu laden. Die Seite muss unverändert aussehen (Defaults). In der DevTools-Konsole prüfen, dass die Vars jetzt vom Plugin gesetzt sind:

```js
getComputedStyle(document.documentElement).getPropertyValue('--color-brass')
```

Expected: ` #c9a24a` (inline gesetzt durch `applyCssVars`).

- [ ] **Step 4: Persistenz prüfen**

In der Konsole:

```js
localStorage.setItem('lodestar-palette', JSON.stringify({ brass: '#ff0000' }))
location.reload()
```

Expected: Nach Reload sind goldene Elemente rot (geladen aus Storage). Danach aufräumen:

```js
localStorage.removeItem('lodestar-palette'); location.reload()
```

Expected: Wieder Default-Gold.

- [ ] **Step 5: Commit**

```bash
git add app/composables/usePalette.ts app/plugins/palette.client.ts
git commit -m "feat(palette): add usePalette composable + client plugin for live CSS theming"
```

---

## Task 3: ColorEditor-Panel (Seite live) + dev-only Einbindung

Das eigentliche UI. Steuert in dieser Task die Seitenfarben (3D folgt in Task 4).

**Files:**
- Create: `app/components/celestial/ColorEditor.vue`
- Modify: `app/pages/index.vue`

- [ ] **Step 1: Panel-Komponente anlegen**

Create `app/components/celestial/ColorEditor.vue`:

```vue
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
```

- [ ] **Step 2: Panel dev-only einbinden**

Modify `app/pages/index.vue` — Script-Block erweitern und Panel rendern.

Ersetze den `<script setup>`-Block durch:

```ts
import { useRoute } from 'vue-router'

useHead({
  title: 'Lodestar — Find true north for everything you ship',
  meta: [
    {
      name: 'description',
      content:
        'Lodestar is the observability platform that gives your distributed systems a single fixed reference point.',
    },
  ],
})

// Editor nur in der Entwicklung (oder explizit via ?editor) — nie im Prod-Build sichtbar.
const route = useRoute()
const showEditor = import.meta.dev || route.query.editor !== undefined
```

Und im Template direkt vor `</div>` (nach `<CelestialSiteFooter />`) einfügen:

```vue
    <ClientOnly>
      <CelestialColorEditor v-if="showEditor" />
    </ClientOnly>
```

- [ ] **Step 3: Seite live umfärben testen**

`yarn dev`, Browser laden. Unten rechts erscheint das Panel.
- `ink` ändern → Hintergrund ändert sich sofort.
- `brass` ändern → alle goldenen Akzente (Buttons, Überschrift-Italic, Linien) ändern sich.
- `bone`/`haze` ändern → Textfarben ändern sich.
- `Reset` → alles zurück auf Default.
- Reload → zuletzt gewählte Werte bleiben erhalten (localStorage).

Expected: Alle genannten Seitenfarben reagieren live. (3D-Objekt reagiert noch NICHT — kommt in Task 4.)

- [ ] **Step 4: Prod-Ausschluss prüfen**

Run: `yarn build`
Run: `grep -rl "Farb-Editor" .output/ || echo "NOT IN OUTPUT"`

Expected: `NOT IN OUTPUT` (das Panel-Markup ist nicht im Production-Bundle, da `import.meta.dev` zu `false` kompiliert).

- [ ] **Step 5: Commit**

```bash
git add app/components/celestial/ColorEditor.vue app/pages/index.vue
git commit -m "feat(editor): add dev-only ColorEditor panel wired for live page theming"
```

---

## Task 4: Armillary3D live umfärben

Das 3D-Objekt liest die Palette und aktualisiert Materialien/Lichter/Fog/Texturen bei jeder Änderung.

**Files:**
- Modify: `app/components/celestial/Armillary3D.vue`

- [ ] **Step 1: Komponente neu schreiben**

Ersetze den **gesamten Inhalt** von `app/components/celestial/Armillary3D.vue` durch:

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { usePalette } from '~/composables/usePalette'

const host = ref<HTMLDivElement | null>(null)
let cleanup: (() => void) | null = null

const { palette } = usePalette()

onMounted(async () => {
  const el = host.value
  if (!el) return

  // three core + postprocessing/environment addons
  const THREE = await import('three')
  const { EffectComposer } = await import('three/addons/postprocessing/EffectComposer.js')
  const { RenderPass } = await import('three/addons/postprocessing/RenderPass.js')
  const { UnrealBloomPass } = await import('three/addons/postprocessing/UnrealBloomPass.js')
  const { OutputPass } = await import('three/addons/postprocessing/OutputPass.js')
  const { RoomEnvironment } = await import('three/addons/environments/RoomEnvironment.js')

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
  const disposables: Array<{ dispose: () => void }> = []

  const hexToRgba = (hex: string, a: number) => {
    const h = hex.replace('#', '')
    const r = parseInt(h.slice(0, 2), 16)
    const g = parseInt(h.slice(2, 4), 16)
    const b = parseInt(h.slice(4, 6), 16)
    return `rgba(${r},${g},${b},${a})`
  }

  let width = el.clientWidth
  let height = el.clientHeight

  // ---------------------------------------------------------------- renderer
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'high-performance' })
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2))
  renderer.setSize(width, height)
  renderer.toneMapping = THREE.ACESFilmicToneMapping
  renderer.toneMappingExposure = 1.0
  renderer.setClearAlpha(0) // transparent — the hero background shows through, no visible box
  el.appendChild(renderer.domElement)

  const scene = new THREE.Scene()
  scene.fog = new THREE.Fog(new THREE.Color(palette.fog), 11, 26)

  const CAM_DIST = 10
  const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 100)
  camera.position.set(0, 0.3, CAM_DIST)
  camera.lookAt(0, 0, 0)

  // ----------------------------------------------- studio env for real metal
  const pmrem = new THREE.PMREMGenerator(renderer)
  const envRT = pmrem.fromScene(new RoomEnvironment(), 0.04)
  scene.environment = envRT.texture
  disposables.push(envRT, pmrem)

  // -------------------------------------------------------- canvas textures
  // track=false → wird vom applyPalette regeneriert und manuell disposed
  const radialTexture = (inner: string, mid: string, outer: string, track = true) => {
    const c = document.createElement('canvas')
    c.width = c.height = 256
    const g = c.getContext('2d')!
    const grad = g.createRadialGradient(128, 128, 0, 128, 128, 128)
    grad.addColorStop(0, inner)
    grad.addColorStop(0.45, mid)
    grad.addColorStop(1, outer)
    g.fillStyle = grad
    g.fillRect(0, 0, 256, 256)
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    if (track) disposables.push(tex)
    return tex
  }

  const raBandTexture = (track = true) => {
    const w = 2048
    const h = 160
    const c = document.createElement('canvas')
    c.width = w
    c.height = h
    const g = c.getContext('2d')!
    g.clearRect(0, 0, w, h)
    const brassCol = palette.brassBright
    g.strokeStyle = brassCol
    g.fillStyle = brassCol
    // graduation: minor every 1°, medium every 5°, major every 15° (= 1 RA hour)
    for (let deg = 0; deg < 360; deg++) {
      const x = (deg / 360) * w
      const hour = deg % 15 === 0
      const medium = deg % 5 === 0
      const len = hour ? 52 : medium ? 26 : 13
      g.globalAlpha = hour ? 0.95 : medium ? 0.65 : 0.35
      g.lineWidth = hour ? 2.6 : 1.1
      g.beginPath()
      g.moveTo(x, h)
      g.lineTo(x, h - len)
      g.stroke()
    }
    // right-ascension hour labels 0–23
    g.globalAlpha = 0.95
    g.textAlign = 'center'
    g.textBaseline = 'middle'
    g.font = '700 30px "Courier New", monospace'
    for (let hh = 0; hh < 24; hh++) {
      const x = ((hh * 15) / 360) * w
      g.fillText(`${hh}`, x, 40)
    }
    const tex = new THREE.CanvasTexture(c)
    tex.colorSpace = THREE.SRGBColorSpace
    tex.wrapS = THREE.RepeatWrapping
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy()
    if (track) disposables.push(tex)
    return tex
  }

  // ------------------------------------------------------------- materials
  const brass = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(palette.brass),
    metalness: 1,
    roughness: 0.26,
    clearcoat: 0.5,
    clearcoatRoughness: 0.25,
    envMapIntensity: 1.15,
  })
  const brassBright = new THREE.MeshPhysicalMaterial({
    color: new THREE.Color(palette.brassBright),
    metalness: 1,
    roughness: 0.18,
    clearcoat: 0.6,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.35,
  })
  disposables.push(brass, brassBright)

  const tiltGroup = new THREE.Group()
  scene.add(tiltGroup)
  const sphere = new THREE.Group() // the gimbal root
  tiltGroup.add(sphere)

  const makeRing = (radius: number, tube: number, mat: THREE.Material) => {
    const geo = new THREE.TorusGeometry(radius, tube, 28, 260)
    disposables.push(geo)
    return new THREE.Mesh(geo, mat)
  }

  // bearing cap + pivot-pin helpers for the gimbal
  const pinGeo = new THREE.SphereGeometry(0.08, 20, 20)
  disposables.push(pinGeo)
  const addBearing = (parent: THREE.Object3D, x: number, y: number, z: number) => {
    const s = new THREE.Mesh(pinGeo, brassBright)
    s.position.set(x, y, z)
    parent.add(s)
  }
  const addPins = (parent: THREE.Object3D, axis: 'x' | 'z', inner: number, outer: number) => {
    const geo = new THREE.CylinderGeometry(0.022, 0.022, outer - inner, 12)
    disposables.push(geo)
    const mid = (inner + outer) / 2
    for (const sign of [1, -1]) {
      const c = new THREE.Mesh(geo, brass)
      if (axis === 'x') {
        c.position.set(sign * mid, 0, 0)
        c.rotation.z = Math.PI / 2
      } else {
        c.position.set(0, 0, sign * mid)
        c.rotation.x = Math.PI / 2
      }
      parent.add(c)
    }
  }

  // --- A real gimbal: three nested rings (R1 > R2 > R3) ---
  const R1 = 2.25
  const R2 = 1.95
  const R3 = 1.65
  const tube = 0.03

  addBearing(sphere, 0, R1, 0)
  addBearing(sphere, 0, -R1, 0)

  const outerGimbal = new THREE.Group()
  sphere.add(outerGimbal)
  outerGimbal.add(makeRing(R1, tube, brass))

  const middleGimbal = new THREE.Group()
  outerGimbal.add(middleGimbal)
  addPins(middleGimbal, 'x', R2, R1)
  addBearing(middleGimbal, R1, 0, 0)
  addBearing(middleGimbal, -R1, 0, 0)

  // the right-ascension scale rides the middle ring as a flush band
  let bandTex = raBandTexture(false)
  const bandMat = new THREE.MeshStandardMaterial({
    map: bandTex,
    emissive: 0xffffff,
    emissiveMap: bandTex,
    emissiveIntensity: 0.5,
    metalness: 0.7,
    roughness: 0.4,
    transparent: true,
    side: THREE.DoubleSide,
    envMapIntensity: 0.6,
  })
  disposables.push(bandMat)
  const bandGeo = new THREE.CylinderGeometry(R2, R2, 0.34, 240, 1, true)
  disposables.push(bandGeo)
  middleGimbal.add(new THREE.Mesh(bandGeo, bandMat))
  const middleRing = makeRing(R2, tube * 0.8, brassBright)
  middleRing.rotation.x = Math.PI / 2
  middleGimbal.add(middleRing)

  const innerGimbal = new THREE.Group()
  middleGimbal.add(innerGimbal)
  addPins(innerGimbal, 'z', R3, R2)
  addBearing(innerGimbal, 0, 0, R2)
  addBearing(innerGimbal, 0, 0, -R2)
  const innerRing = makeRing(R3, tube, brass)
  innerRing.rotation.y = Math.PI / 2
  innerGimbal.add(innerRing)

  // OUTER fixed meridian frame
  const R0 = 2.6
  const frame = makeRing(R0, 0.042, brass)
  frame.rotation.y = Math.PI / 2
  sphere.add(frame)
  {
    const g = new THREE.CylinderGeometry(0.024, 0.024, R0 - R1, 12)
    disposables.push(g)
    const mid = (R0 + R1) / 2
    for (const s of [1, -1]) {
      const c = new THREE.Mesh(g, brass)
      c.position.set(0, s * mid, 0)
      sphere.add(c)
    }
  }

  // INNERMOST ring
  const R4 = 1.32
  const coreGimbal = new THREE.Group()
  innerGimbal.add(coreGimbal)
  {
    const g = new THREE.CylinderGeometry(0.02, 0.02, R3 - R4, 12)
    disposables.push(g)
    const mid = (R3 + R4) / 2
    for (const s of [1, -1]) {
      const c = new THREE.Mesh(g, brass)
      c.position.set(0, s * mid, 0)
      coreGimbal.add(c)
    }
  }
  addBearing(coreGimbal, 0, R3, 0)
  addBearing(coreGimbal, 0, -R3, 0)
  const coreRing = makeRing(R4, tube, brassBright)
  coreGimbal.add(coreRing)

  // ----------------------------------------------------------- central star
  const starGeo = new THREE.SphereGeometry(0.28, 48, 48)
  disposables.push(starGeo)
  const starMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(palette.starBody),
    emissive: new THREE.Color(palette.starGlow),
    emissiveIntensity: 1.6,
    metalness: 0,
    roughness: 0.5,
  })
  disposables.push(starMat)
  const star = new THREE.Mesh(starGeo, starMat)
  sphere.add(star)

  let coronaTex = radialTexture(
    hexToRgba(palette.starGlow, 0.95),
    hexToRgba(palette.brassBright, 0.35),
    hexToRgba(palette.brassBright, 0),
    false,
  )
  const coronaMat = new THREE.SpriteMaterial({
    map: coronaTex,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
  })
  disposables.push(coronaMat)
  const corona = new THREE.Sprite(coronaMat)
  corona.scale.set(1.9, 1.9, 1)
  sphere.add(corona)

  const coreLight = new THREE.PointLight(new THREE.Color(palette.starGlow), 3, 14, 2)
  sphere.add(coreLight)

  // ----------------------------------------------------------- starfields
  const starSprite = radialTexture('rgba(255,255,255,1)', 'rgba(255,255,255,0.5)', 'rgba(255,255,255,0)')
  const makeStars = (count: number, size: number, spread: [number, number], opacity: number) => {
    const pos = new Float32Array(count * 3)
    const col = new Float32Array(count * 3)
    const paletteCols = [
      [1.0, 0.97, 0.9],
      [0.72, 0.82, 1.0],
      [0.95, 0.8, 0.45],
      [1.0, 1.0, 1.0],
    ]
    for (let i = 0; i < count; i++) {
      const r = spread[0] + Math.random() * (spread[1] - spread[0])
      const theta = Math.random() * Math.PI * 2
      const phi = Math.acos(2 * Math.random() - 1)
      pos[i * 3] = r * Math.sin(phi) * Math.cos(theta)
      pos[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta)
      pos[i * 3 + 2] = r * Math.cos(phi) - 4
      const p = paletteCols[(Math.random() * paletteCols.length) | 0]
      col[i * 3] = p[0]
      col[i * 3 + 1] = p[1]
      col[i * 3 + 2] = p[2]
    }
    const geo = new THREE.BufferGeometry()
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3))
    geo.setAttribute('color', new THREE.BufferAttribute(col, 3))
    disposables.push(geo)
    const mat = new THREE.PointsMaterial({
      size,
      map: starSprite,
      vertexColors: true,
      transparent: true,
      opacity,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      sizeAttenuation: true,
    })
    disposables.push(mat)
    return new THREE.Points(geo, mat)
  }
  const dust = makeStars(1400, 0.07, [12, 28], 0.85)
  const starGroup = new THREE.Group()
  starGroup.add(dust)
  scene.add(starGroup)

  // faint gold haze behind everything for depth
  let hazeTex = radialTexture(
    hexToRgba(palette.brassBright, 0.22),
    'rgba(110,90,40,0.06)',
    'rgba(0,0,0,0)',
    false,
  )
  const hazeMat = new THREE.SpriteMaterial({
    map: hazeTex,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    depthTest: false,
    transparent: true,
  })
  disposables.push(hazeMat)
  const haze = new THREE.Sprite(hazeMat)
  haze.scale.set(20, 20, 1)
  haze.position.set(0, 0, -8)
  haze.renderOrder = -1
  scene.add(haze)

  // ------------------------------------------------------------- lighting
  const ambient = new THREE.AmbientLight(new THREE.Color(palette.lightAmbient), 0.8)
  scene.add(ambient)
  const key = new THREE.PointLight(new THREE.Color(palette.lightWarm), 50, 60, 2)
  key.position.set(5, 6, 6)
  scene.add(key)
  const rim = new THREE.PointLight(new THREE.Color(palette.lightRim), 40, 60, 2)
  rim.position.set(-6, -3, -3)
  scene.add(rim)

  // resting three-quarter lean
  tiltGroup.rotation.x = THREE.MathUtils.degToRad(-16)
  tiltGroup.rotation.z = THREE.MathUtils.degToRad(8)

  // ----------------------------------------------------- post-processing
  const rt = new THREE.WebGLRenderTarget(width, height, {
    type: THREE.HalfFloatType,
    samples: 4,
  })
  const composer = new EffectComposer(renderer, rt)
  composer.addPass(new RenderPass(scene, camera))
  const bloom = new UnrealBloomPass(new THREE.Vector2(width, height), 0.42, 0.5, 0.85)
  composer.addPass(bloom)
  composer.addPass(new OutputPass())
  composer.setSize(width, height)

  // ------------------------------------------- live recolour from the editor
  const applyPalette = () => {
    brass.color.set(palette.brass)
    brassBright.color.set(palette.brassBright)
    starMat.color.set(palette.starBody)
    starMat.emissive.set(palette.starGlow)
    coreLight.color.set(palette.starGlow)
    key.color.set(palette.lightWarm)
    rim.color.set(palette.lightRim)
    ambient.color.set(palette.lightAmbient)
    ;(scene.fog as THREE.Fog).color.set(palette.fog)

    const newCorona = radialTexture(
      hexToRgba(palette.starGlow, 0.95),
      hexToRgba(palette.brassBright, 0.35),
      hexToRgba(palette.brassBright, 0),
      false,
    )
    coronaMat.map = newCorona
    coronaMat.needsUpdate = true
    coronaTex.dispose()
    coronaTex = newCorona

    const newHaze = radialTexture(
      hexToRgba(palette.brassBright, 0.22),
      'rgba(110,90,40,0.06)',
      'rgba(0,0,0,0)',
      false,
    )
    hazeMat.map = newHaze
    hazeMat.needsUpdate = true
    hazeTex.dispose()
    hazeTex = newHaze

    const newBand = raBandTexture(false)
    bandMat.map = newBand
    bandMat.emissiveMap = newBand
    bandMat.needsUpdate = true
    bandTex.dispose()
    bandTex = newBand

    // bei reduced-motion läuft keine Render-Schleife → einmal nachzeichnen
    if (reduceMotion) composer.render()
  }
  const stopWatch = watch(palette, applyPalette, { deep: true })

  // Scale the instrument so it always fits the container in BOTH axes.
  const FIT_RADIUS = 3.4
  const fitInstrument = () => {
    const vFov = THREE.MathUtils.degToRad(camera.fov)
    const halfH = CAM_DIST * Math.tan(vFov / 2)
    const halfW = halfH * camera.aspect
    const s = Math.min(1, Math.min(halfW, halfH) / FIT_RADIUS)
    tiltGroup.scale.setScalar(s)
  }

  const resize = () => {
    width = el.clientWidth
    height = el.clientHeight
    camera.aspect = width / height
    camera.updateProjectionMatrix()
    renderer.setSize(width, height)
    composer.setSize(width, height)
    fitInstrument()
  }
  fitInstrument()
  const ro = new ResizeObserver(resize)
  ro.observe(el)

  // --------------------------------------------------------------- loop
  let raf = 0
  let last = 0
  const render = (t: number) => {
    const dt = last ? Math.min((t - last) / 1000, 0.05) : 0
    last = t

    if (!reduceMotion) {
      sphere.rotation.y += dt * 0.1
      outerGimbal.rotation.y += dt * 0.25
      middleGimbal.rotation.x += dt * 0.4
      innerGimbal.rotation.z += dt * 0.55
      coreGimbal.rotation.y += dt * 0.7
      starGroup.rotation.y += dt * 0.008
      const pulse = 1.6 + Math.sin(t * 0.0022) * 0.3
      starMat.emissiveIntensity = pulse
      corona.scale.setScalar(1.9 + Math.sin(t * 0.0022) * 0.12)
    }

    composer.render()
    if (!reduceMotion) raf = requestAnimationFrame(render)
  }
  if (reduceMotion) {
    render(0)
  } else {
    raf = requestAnimationFrame(render)
  }

  cleanup = () => {
    stopWatch()
    cancelAnimationFrame(raf)
    ro.disconnect()
    composer.dispose()
    coronaTex.dispose()
    hazeTex.dispose()
    bandTex.dispose()
    for (const d of disposables) d.dispose()
    renderer.dispose()
    if (renderer.domElement.parentNode === el) el.removeChild(renderer.domElement)
  }
})

onBeforeUnmount(() => cleanup?.())
</script>

<template>
  <div
    ref="host"
    aria-hidden="true"
    class="h-full w-full"
    style="-webkit-mask-image: radial-gradient(82% 82% at 52% 48%, #000 66%, transparent 100%);
           mask-image: radial-gradient(82% 82% at 52% 48%, #000 66%, transparent 100%);"
  />
</template>
```

- [ ] **Step 2: 3D live umfärben testen**

`yarn dev`, Browser laden. Im Panel:
- `brass` / `brass-bright` ändern → Metallringe UND Seitenakzente ändern sich gemeinsam.
- `Stern-Körper` / `Stern-Glühen` ändern → Zentralstern + Corona + Kernlicht ändern sich.
- `Nebel (Fog)` ändern → Tiefen-Nebel der Szene ändert sich.
- `Warmlicht` / `Blaulicht` / `Ambient` ändern → Beleuchtung der Ringe ändert sich sichtbar.

Expected: Alle 3D-Farben reagieren live, ohne Flackern/Re-Init. Keine Konsolenfehler.

- [ ] **Step 3: Memory-Leak-Sanity (Texturen)**

Mehrmals schnell an einem Slider ziehen (z. B. Stern-Glühen). Expected: keine wachsenden Fehler in der Konsole; das Bild bleibt stabil (alte Texturen werden disposed).

- [ ] **Step 4: Commit**

```bash
git add app/components/celestial/Armillary3D.vue
git commit -m "feat(3d): drive Armillary3D colors from palette with live recolor"
```

---

## Task 5: Hero-Glow an Palette binden + finale Verifikation

Der hartcodierte Gold-Glow im Hero soll mit `brass-bright` mitziehen.

**Files:**
- Modify: `app/components/celestial/HeroSection.vue:10-14`

- [ ] **Step 1: Glow-Hintergrund auf Variable umstellen**

In `app/components/celestial/HeroSection.vue` die Glow-Div (aktuell Zeilen 10-14) ersetzen:

```vue
    <div
      class="pointer-events-none absolute right-[8%] top-1/2 hidden size-[34rem] -translate-y-1/2 rounded-full opacity-60 blur-3xl lg:block"
      style="background: radial-gradient(circle, color-mix(in oklab, var(--color-brass-bright) 18%, transparent), transparent 65%)"
      aria-hidden="true"
    />
```

- [ ] **Step 2: Hero-Glow testen**

`yarn dev`, Browser laden (Desktop-Breite ≥ lg). `brass-bright` im Panel ändern → der weiche Glow hinter dem Instrument ändert die Farbe mit.

Expected: Glow zieht mit `brass-bright` mit; bei Default unverändertes Aussehen.

- [ ] **Step 3: Gesamtdurchlauf**

`yarn dev`: Eine vollständige Palette durchspielen (alle Felder), dann `Reset`, dann Reload (Persistenz prüfen), dann „JSON kopieren" → Inhalt in einen Editor einfügen und prüfen, dass alle 13 Schlüssel als gültiges JSON enthalten sind.

Expected: Alles live, Reset/Persistenz/Copy funktionieren.

- [ ] **Step 4: Production-Build prüfen**

Run: `yarn build`
Run: `grep -rl "Farb-Editor" .output/ || echo "NOT IN OUTPUT"`

Expected: `NOT IN OUTPUT`; Build ohne Fehler. Seite rendert mit Defaults identisch zum Ausgangszustand.

- [ ] **Step 5: Commit**

```bash
git add app/components/celestial/HeroSection.vue
git commit -m "feat(hero): bind hero core-glow to brass-bright palette var"
```

---

## Self-Review (vom Autor durchgeführt)

- **Spec-Abdeckung:** Gold synchron (Task 2 CSS-Vars + Task 4 Material) ✓; Seitenfarben (Task 1+2+3) ✓; 3D-Extras Stern/Fog/Lichter (Task 4) ✓; Dev-only Guard (Task 3) ✓; JSON-Readout/Übergabe (Task 3) ✓; localStorage (Task 2) ✓; Hero-Glow an brass-bright (Task 5) ✓; reduced-motion Nachzeichnen (Task 4 `applyPalette`) ✓; Sternenfeld-Palette bewusst fest (Task 4 unverändert) ✓.
- **Type-Konsistenz:** `Palette`-Keys identisch in Composable, Editor-Field-Listen und `applyPalette`/`CSS_VAR_MAP`. `isValidHex`, `toJSON`, `reset` in allen Konsumenten gleich benannt.
- **Platzhalter:** keine TBD/TODO; alle Code-Blöcke vollständig.
