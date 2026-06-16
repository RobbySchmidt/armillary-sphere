# rhowerk.de Website — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Die fiktive „Lodestar"-Landingpage vollständig durch die neue rhowerk-Firmenwebsite (Startseite, Leistungen, Projekte + Detail, Agentur, Kontakt) ersetzen, mit der recolorierten Armillarsphäre als Key-Element und Hell/Dunkel-Theme.

**Architecture:** Nuxt-4-Filebased-Routing mit einem `default`-Layout (Header/Footer). Seiten-Theme über semantische `--rho-*`-CSS-Tokens + `.dark`-Klasse, gesteuert von `useTheme`. Die 3D-Sphäre ist vom Seiten-Theme entkoppelt und rendert immer auf einer dunklen `SphereStage`. Inhalte (Projekte/Leistungen/Team) kommen aus typisierten `data/`-Dateien.

**Tech Stack:** Nuxt 4, Vue 3 `<script setup>`, Tailwind v4 (CSS-first `@theme`), shadcn-nuxt (Button/Card vorhanden), Three.js (`Armillary3D`).

**Hinweise zur Arbeitsweise:**
- **Kein autonomes git.** „Commit"-Schritte sind **Checkpoints** — der Nutzer committet selbst. Nicht `git commit` ausführen.
- **Verifikation** primär über `npx nuxi typecheck` und `yarn build` (kein Dev-Server ohne ausdrückliche Freigabe — Nutzerregel). Visuelle Prüfung erfolgt am Ende auf Wunsch über das `run`/`verify`-Skill.
- **Presentational Polish:** Bei rein visuellen Komponenten zeigt der Plan Struktur + Schlüssel-Markup; der finale Feinschliff (Spacing, Microcopy, exakte Klassen) entsteht in der Umsetzung mit dem `frontend-design`-Skill. Logik-/Datendateien sind vollständig ausspezifiziert.

---

## Datei-Übersicht

**Neu:**
- `app/composables/useTheme.ts` — Theme-State (light/dark), localStorage, `.dark`-Klasse.
- `app/data/projects.ts` — 3 Projekte (Quelle für Index + `[slug]`).
- `app/data/services.ts` — 4 Leistungen.
- `app/data/team.ts` — 3 Personen.
- `app/components/site/SphereStage.vue` — dunkle Bühne um die 3D-Sphäre.
- `app/components/site/SiteHeader.vue` — Nav, ρ-Logo, Theme-Toggle.
- `app/components/site/SiteFooter.vue` — Footer.
- `app/components/site/SectionLabel.vue` — „Instrument-Readout"-Eyebrow (Mono).
- `app/components/site/ProjectCard.vue`, `ServiceCard.vue`, `TeamCard.vue`, `CtaBand.vue`.
- `app/layouts/default.vue` — Header + Slot + Footer.
- `app/pages/leistungen.vue`, `app/pages/projekte/index.vue`, `app/pages/projekte/[slug].vue`, `app/pages/agentur.vue`, `app/pages/kontakt.vue`.

**Ändern:**
- `app/assets/css/tailwind.css` — Fonts swap, `--rho-*`-Tokens (light/dark), Utilities aufräumen.
- `app/composables/usePalette.ts` — `PALETTE_DEFAULTS` → Stahl+Crimson; CSS-Var-Map entkoppeln.
- `app/components/celestial/Armillary3D.vue` — verschieben → `app/components/site/Sphere.vue` (Funktion unverändert).
- `app/pages/index.vue` — komplett neue Startseite.
- `nuxt.config.ts` — Prerender-Routen, ggf. `app.head` FOUC-Script.

**Löschen:**
- `app/components/celestial/CatalogSection.vue`, `ReadoutSection.vue`, `VoicesSection.vue`, `TiersSection.vue`, `CourseSection.vue`, `HeroSection.vue`, `SiteHeader.vue`, `SiteFooter.vue`, `ColorEditor.vue`.
- `app/plugins/palette.client.ts` — falls nur ColorEditor-bezogen; sonst auf reines Laden reduzieren.

---

## Task 1: Theme-Tokens & Fonts in `tailwind.css`

**Files:**
- Modify: `app/assets/css/tailwind.css`

- [ ] **Step 1: Fonts austauschen (Kopf der Datei)**

Ersetze die beiden Google-Fonts-`@import`-Zeilen (Inter + Fraunces/Space Mono) durch:

```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Space+Grotesk:wght@500;600;700&family=Space+Mono:wght@400;700&display=swap');
```

- [ ] **Step 2: Lodestar-Custom-Tokens-Block ersetzen**

Ersetze den `@theme { --color-ink … --color-hairline }`-Block und den `@theme inline { --font-display … --font-tel }`-Block durch das rho-Token-System:

```css
@theme inline {
  --font-display: 'Space Grotesk', 'Inter', system-ui, sans-serif;
  --font-tel: 'Space Mono', ui-monospace, monospace;

  --color-bg: var(--rho-bg);
  --color-surface: var(--rho-surface);
  --color-text: var(--rho-text);
  --color-muted: var(--rho-muted);
  --color-line: var(--rho-line);
  --color-accent: var(--rho-accent);
  --color-accent-bright: var(--rho-accent-bright);
  /* dunkle Bühne — konstant, theme-unabhängig */
  --color-stage: var(--rho-stage);
  --color-stage-text: var(--rho-stage-text);
}

:root {
  /* Hell — Porzellan/Off-White */
  --rho-bg: #f4f1ec;
  --rho-surface: #ffffff;
  --rho-text: #14161a;
  --rho-muted: #5b6168;
  --rho-line: #d9d4ca;
  --rho-accent: #fc0f47;
  --rho-accent-bright: #ff4d76;
  /* konstante dunkle Bühne für die Sphäre */
  --rho-stage: #07090f;
  --rho-stage-text: #e9ecf2;
}

.dark {
  /* Dunkel — tiefes Ink */
  --rho-bg: #07090f;
  --rho-surface: #0e1118;
  --rho-text: #e9ecf2;
  --rho-muted: #8a909b;
  --rho-line: #1c212c;
  --rho-accent: #fc0f47;
  --rho-accent-bright: #ff4d76;
  --rho-stage: #07090f;
  --rho-stage-text: #e9ecf2;
}
```

- [ ] **Step 3: Utilities anpassen**

Im `@layer utilities`-Block: `.graticule` behalten, aber `var(--color-hairline)` → `var(--color-line)`. `.brass-rule` umbenennen zu `.accent-rule` mit `var(--color-accent)` (statt brass). `.engrave` und `.tracking-widest-2` behalten. Die `.lodestar`-scoped Keyframe-Regeln (`.rise`, `.draw-rule`) von `.lodestar ` auf eine neue Wrapper-Klasse `.rho ` umstellen (oder global lassen). `accent-rule`:

```css
.accent-rule {
  background: linear-gradient(to right, transparent, var(--color-accent) 18%, var(--color-accent) 82%, transparent);
}
```

- [ ] **Step 4: Verifizieren**

Run: `npx nuxi typecheck`
Expected: keine neuen Fehler aus der CSS-Änderung (CSS wird nicht typgecheckt; Ziel ist nur, dass nichts anderes bricht). Falls Komponenten noch alte Klassen (`text-brass`, `bg-ink`) nutzen, bleiben sie bis zu ihrer Ablösung/Löschung bestehen — das ist ok bis Task 11.

- [ ] **Step 5: Checkpoint** (Nutzer committet selbst: „feat(theme): rho color tokens + fonts").

---

## Task 2: `useTheme`-Composable

**Files:**
- Create: `app/composables/useTheme.ts`

- [ ] **Step 1: Composable schreiben**

```ts
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
```

- [ ] **Step 2: FOUC-Schutz in `nuxt.config.ts`**

Im `defineNuxtConfig` `app.head.script` ergänzen, damit die Klasse vor dem ersten Paint gesetzt wird:

```ts
app: {
  head: {
    script: [
      {
        innerHTML:
          "(function(){try{var t=localStorage.getItem('rho-theme');if(!t){t=matchMedia('(prefers-color-scheme: light)').matches?'light':'dark'}if(t==='dark'){document.documentElement.classList.add('dark')}}catch(e){}})();",
        tagPosition: 'head',
      },
    ],
  },
},
```

(Dazu in `nuxt.config.ts` ggf. `app: { head: { ... } }` neben die bestehenden Keys setzen.)

- [ ] **Step 3: Verifizieren (Logik-Check)**

Run: `npx nuxi typecheck`
Expected: PASS (keine Typfehler in `useTheme.ts`).
Manueller Logik-Check (Review, kein Runner): `init()` ohne gespeicherten Wert → folgt `prefers-color-scheme`; `toggle()` flippt und persistiert. Bestätigen durch Lesen des Codes.

- [ ] **Step 4: Checkpoint** („feat(theme): useTheme composable + FOUC guard").

---

## Task 3: Sphäre recolorieren (`usePalette`) + nach `site/Sphere.vue` verschieben

**Files:**
- Modify: `app/composables/usePalette.ts`
- Move: `app/components/celestial/Armillary3D.vue` → `app/components/site/Sphere.vue`

- [ ] **Step 1: `PALETTE_DEFAULTS` auf Stahl+Crimson setzen**

In `app/composables/usePalette.ts` `PALETTE_DEFAULTS` ersetzen:

```ts
export const PALETTE_DEFAULTS: Palette = {
  brass: '#8a9099',        // mittleres Stahlgrau (Ringe)
  brassBright: '#c9d0d8',  // helles Platin (Akzentringe, RA-Skala)
  ink: '#07090f',
  void: '#04060b',
  bone: '#e9ecf2',
  haze: '#8a909b',
  hairline: '#1c212c',
  starBody: '#fff0f2',     // warmweißer Kern
  starGlow: '#fc0f47',     // crimson Glühen = Brand
  fog: '#05070f',
  lightWarm: '#ffd9dd',    // leicht rosé statt warmgold
  lightRim: '#7f8da6',     // kühler Stahl-Rim
  lightAmbient: '#2a3142', // neutral-kühl
}
```

- [ ] **Step 2: CSS-Var-Map entkoppeln**

Die `CSS_VAR_MAP` schreibt aktuell `--color-ink`/`--color-brass` etc. Diese Tokens existieren nach Task 1 nicht mehr als Seiten-Tokens. Zwei Optionen — wähle **Reduktion**: Die Sphäre braucht keine CSS-Var-Spiegelung mehr (sie liest `palette` direkt im JS). `CSS_VAR_MAP` auf leeres Objekt setzen und `applyCssVars` zu No-Op machen, ODER die Map ganz entfernen und die Aufrufe (`applyCssVars`) aus dem Plugin entfernen (siehe Task 11). Konkret hier:

```ts
const CSS_VAR_MAP: Partial<Record<keyof Palette, string>> = {}
```

(`applyCssVars` bleibt dann eine harmlose No-Op-Schleife.)

- [ ] **Step 3: `Armillary3D.vue` → `site/Sphere.vue` verschieben**

Datei nach `app/components/site/Sphere.vue` verschieben. Inhalt unverändert lassen **außer** dem Import-Pfad (`~/composables/usePalette` bleibt gleich gültig). Der Auto-Import-Name ändert sich von `CelestialArmillary3D` zu `SiteSphere`.

- [ ] **Step 4: Verifizieren**

Run: `npx nuxi typecheck`
Expected: PASS. (Referenzen auf `CelestialArmillary3D` in alten Sektionen werden in Task 11 entfernt; bis dahin kann der alte `index.vue`-Pfad brechen — deshalb wird `index.vue` in Task 9 neu geschrieben, bevor gebaut wird. Reihenfolge beachten.)

- [ ] **Step 5: Checkpoint** („refactor(3d): recolor sphere to steel+crimson, move to site/Sphere").

---

## Task 4: Datendateien (projects, services, team)

**Files:**
- Create: `app/data/projects.ts`, `app/data/services.ts`, `app/data/team.ts`

- [ ] **Step 1: `projects.ts`**

```ts
export interface Project {
  slug: string
  name: string
  tagline: string
  category: string
  year: string
  role: string
  stack: string[]
  challenge: string
  approach: string
  result: string
  metrics: { label: string; value: string }[]
  accentCoord: string // Mono-Readout im Hero, z. B. "RA 17ʰ 42ᵐ"
}

export const projects: Project[] = [
  {
    slug: 'hygieia',
    name: 'Hygieia',
    tagline: 'Digitale Plattform fürs klinische Hygienemanagement.',
    category: 'Healthcare · SaaS',
    year: '2025',
    role: 'Produktentwicklung & Designsystem',
    stack: ['Nuxt', 'TypeScript', 'PostgreSQL', 'Design System'],
    challenge:
      'Hygienebeauftragte in Kliniken arbeiteten mit verstreuten Excel-Listen und Papierprotokollen. Audits waren kaum nachvollziehbar, Standards je Station unterschiedlich interpretiert.',
    approach:
      'Wir haben den gesamten Audit- und Maßnahmen-Workflow als ein klar strukturiertes Instrument neu gedacht: ein Designsystem als gemeinsame Sprache, dazu eine Plattform, die Protokolle, Prüfpläne und Maßnahmen an einer Achse ausrichtet.',
    result:
      'Hygiene-Audits laufen heute digital, revisionssicher und über alle Stationen vergleichbar. Aus einer Sammlung von Insellösungen wurde ein einziges Referenzsystem.',
    metrics: [
      { label: 'Audit-Dauer', value: '−60 %' },
      { label: 'Stationen', value: '24' },
      { label: 'Standards', value: '1 statt 24' },
    ],
    accentCoord: 'RA 17ʰ 42ᵐ · DEC +12° 33′',
  },
  {
    slug: 'mzla',
    name: 'MZLA',
    tagline: 'Disposition und Auftragssteuerung für mittelständische Logistik.',
    category: 'Logistik · Plattform',
    year: '2024',
    role: 'Plattform-Architektur & Engineering',
    stack: ['Nuxt', 'Nitro', 'WebSockets', 'PostgreSQL'],
    challenge:
      'Aufträge, Fahrzeuge und Fahrer wurden über Telefon, Mail und drei Programme koordiniert. Niemand hatte den Gesamtüberblick in Echtzeit.',
    approach:
      'Wir haben eine Echtzeit-Dispositionszentrale gebaut, in der jeder Auftrag, jede Tour und jede Ressource auf einem gemeinsamen Lagebild zusammenläuft — eine ruhige Oberfläche über einer belastbaren Architektur.',
    result:
      'Die Disposition steuert heute alle Touren aus einem Bild. Leerfahrten sinken, Reaktionszeiten auch — und neue Mitarbeitende sind in Tagen statt Wochen eingearbeitet.',
    metrics: [
      { label: 'Leerfahrten', value: '−22 %' },
      { label: 'Reaktionszeit', value: 'Echtzeit' },
      { label: 'Tools ersetzt', value: '3 → 1' },
    ],
    accentCoord: 'RA 09ʰ 14ᵐ · DEC −04° 51′',
  },
  {
    slug: 'ergovision',
    name: 'Ergovision',
    tagline: '3D-Konfigurator für ergonomische Arbeitsplätze.',
    category: 'Industrie · Konfigurator',
    year: '2024',
    role: 'Produkt, Interface & 3D',
    stack: ['Nuxt', 'Three.js', 'WebGL', 'Design System'],
    challenge:
      'Ergonomische Arbeitsplätze wurden über unübersichtliche PDF-Kataloge geplant. Kund:innen konnten sich das Ergebnis nicht vorstellen, Beratung war zäh.',
    approach:
      'Wir haben einen 3D-Konfigurator entwickelt, in dem sich ein Arbeitsplatz live zusammenstellen, drehen und ergonomisch bewerten lässt — Beratung wird vom Katalog zum Erlebnis.',
    result:
      'Kund:innen konfigurieren ihren Arbeitsplatz heute selbst im Browser. Die Beratung ist schneller, die Abschlussquote höher, Rückfragen seltener.',
    metrics: [
      { label: 'Abschlussquote', value: '+34 %' },
      { label: 'Beratungszeit', value: '−40 %' },
      { label: 'Plattform', value: 'Web · 3D' },
    ],
    accentCoord: 'RA 21ʰ 58ᵐ · DEC +47° 12′',
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
```

- [ ] **Step 2: `services.ts`**

```ts
export interface Service {
  no: string
  title: string
  summary: string
  points: string[]
}

export const services: Service[] = [
  {
    no: '01',
    title: 'Produkt- & Webentwicklung',
    summary:
      'Web-Apps und Plattformen, die sich anfühlen wie ein gut gebautes Instrument — präzise, schnell, langlebig.',
    points: ['Vue & Nuxt', 'Performante Frontends', 'Barrierefreiheit', 'Wartbare Architektur'],
  },
  {
    no: '02',
    title: 'Plattform-Architektur & Engineering',
    summary:
      'Skalierbare Systeme, klare Schnittstellen, belastbare Infrastruktur. Wir bauen das Fundament, das mitwächst.',
    points: ['APIs & Services', 'Datenmodelle', 'Echtzeit & Integration', 'Cloud & Deployment'],
  },
  {
    no: '03',
    title: 'Design-Systeme & Interface',
    summary:
      'Aus unserer Herkunft als Designagentur: Oberflächen mit Haltung und Designsysteme als gemeinsame Sprache.',
    points: ['UI/UX-Design', 'Designsysteme', 'Prototyping', 'Marke im Interface'],
  },
  {
    no: '04',
    title: 'Discovery & digitale Strategie',
    summary:
      'Bevor gebaut wird, wird ausgerichtet. Wir finden mit euch den wahren Norden eures Produkts.',
    points: ['Product Discovery', 'Konzeption', 'Roadmapping', 'Technische Beratung'],
  },
]
```

- [ ] **Step 3: `team.ts`**

```ts
export interface Member {
  name: string
  role: string
  focus: string
  initials: string
}

export const team: Member[] = [
  { name: 'Kevin Klein', role: 'Engineering & Architektur', focus: 'Plattformen, Backends, alles was tragen muss.', initials: 'KK' },
  { name: 'Frank Koppe', role: 'Design & Interface', focus: 'Gestaltung, Designsysteme, das Gefühl im Produkt.', initials: 'FK' },
  { name: 'Robby Schmidt', role: 'Produkt & Strategie', focus: 'Discovery, Richtung, die Brücke zum Kunden.', initials: 'RS' },
]
```

- [ ] **Step 4: Verifizieren**

Run: `npx nuxi typecheck`
Expected: PASS. `getProject('hygieia')` typsicher; `getProject('xxx')` → `undefined` (in `[slug]` als 404 behandelt, Task 8).

- [ ] **Step 5: Checkpoint** („feat(data): projects, services, team").

---

## Task 5: `SphereStage` + `SectionLabel`

**Files:**
- Create: `app/components/site/SphereStage.vue`, `app/components/site/SectionLabel.vue`

- [ ] **Step 1: `SphereStage.vue`** — dunkle Bühne, theme-unabhängig, mit Graticule + Kern-Glow + 3D + Fallback.

```vue
<script setup lang="ts">
withDefaults(defineProps<{ heightClass?: string }>(), {
  heightClass: 'h-[340px] sm:h-[440px] lg:h-[560px]',
})
</script>

<template>
  <div :class="['relative w-full overflow-hidden rounded-2xl bg-stage', heightClass]">
    <div class="pointer-events-none absolute inset-0 graticule opacity-40" aria-hidden="true" />
    <div
      class="pointer-events-none absolute left-1/2 top-1/2 size-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
      style="background: radial-gradient(circle, color-mix(in oklab, var(--color-accent) 22%, transparent), transparent 65%)"
      aria-hidden="true"
    />
    <ClientOnly>
      <SiteSphere class="absolute inset-0" />
      <template #fallback>
        <div class="absolute inset-0 grid place-items-center" aria-hidden="true">
          <div class="size-48 rounded-full border border-white/15" />
        </div>
      </template>
    </ClientOnly>
  </div>
</template>
```

- [ ] **Step 2: `SectionLabel.vue`** — Mono-„Readout"-Eyebrow.

```vue
<script setup lang="ts">
defineProps<{ no?: string; text: string }>()
</script>

<template>
  <p class="font-tel text-[11px] uppercase tracking-widest-2 text-accent">
    <span v-if="no" class="text-muted">{{ no }} ·</span> {{ text }}
  </p>
</template>
```

- [ ] **Step 3: Verifizieren**

Run: `npx nuxi typecheck`
Expected: PASS.

- [ ] **Step 4: Checkpoint** („feat(site): SphereStage + SectionLabel").

---

## Task 6: `SiteHeader`, `SiteFooter`, Theme-Toggle, `default`-Layout

**Files:**
- Create: `app/components/site/SiteHeader.vue`, `app/components/site/SiteFooter.vue`, `app/layouts/default.vue`

- [ ] **Step 1: `SiteHeader.vue`** — Nav (NuxtLink), ρ-Logo, Theme-Toggle.

```vue
<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from 'vue'
import { useTheme } from '~/composables/useTheme'

const { mode, init, toggle } = useTheme()
const scrolled = ref(false)
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
      scrolled ? 'border-b border-line/70 bg-bg/80 backdrop-blur-md' : 'border-b border-transparent',
    ]"
  >
    <div class="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
      <NuxtLink to="/" class="flex items-baseline gap-2">
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

      <button
        type="button"
        :aria-label="mode === 'dark' ? 'Hellen Modus aktivieren' : 'Dunklen Modus aktivieren'"
        class="grid size-9 place-items-center rounded-sm border border-line text-muted transition-colors hover:text-text hover:border-accent"
        @click="toggle"
      >
        <span class="font-tel text-xs">{{ mode === 'dark' ? '☀' : '☾' }}</span>
      </button>
    </div>
  </header>
</template>
```

- [ ] **Step 2: `SiteFooter.vue`**

```vue
<template>
  <footer class="border-t border-line bg-surface">
    <div class="mx-auto grid max-w-6xl gap-8 px-6 py-14 sm:grid-cols-3">
      <div>
        <p class="font-display text-lg font-semibold text-text">rho<span class="text-accent">werk</span></p>
        <p class="mt-2 max-w-xs text-sm text-muted">Tech-Studio für digitale Präzisionsinstrumente.</p>
      </div>
      <div class="font-tel text-xs uppercase tracking-widest-2 text-muted">
        <p class="mb-3 text-text">Navigation</p>
        <ul class="space-y-2">
          <li><NuxtLink to="/leistungen" class="hover:text-accent">Leistungen</NuxtLink></li>
          <li><NuxtLink to="/projekte" class="hover:text-accent">Projekte</NuxtLink></li>
          <li><NuxtLink to="/agentur" class="hover:text-accent">Agentur</NuxtLink></li>
          <li><NuxtLink to="/kontakt" class="hover:text-accent">Kontakt</NuxtLink></li>
        </ul>
      </div>
      <div class="font-tel text-xs uppercase tracking-widest-2 text-muted">
        <p class="mb-3 text-text">Kontakt</p>
        <ul class="space-y-2">
          <li><a href="mailto:schmidt@rhowerk.de" class="hover:text-accent">schmidt@rhowerk.de</a></li>
          <li>rhowerk.de</li>
        </ul>
      </div>
    </div>
    <div class="border-t border-line">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-6 py-5 font-tel text-[11px] text-muted">
        <span>© {{ new Date().getFullYear() }} rhowerk</span>
        <span>ρ · made with precision</span>
      </div>
    </div>
  </footer>
</template>
```

- [ ] **Step 3: `default.vue`-Layout**

```vue
<template>
  <div class="min-h-screen bg-bg font-sans text-text antialiased">
    <SiteSiteHeader />
    <main>
      <slot />
    </main>
    <SiteSiteFooter />
  </div>
</template>
```

> Hinweis Auto-Import-Namen: Komponenten in `app/components/site/SiteHeader.vue` → `<SiteSiteHeader>`. Falls das stört, Datei in `app/components/site/Header.vue` umbenennen (→ `<SiteHeader>`). **Empfehlung:** als `Header.vue`/`Footer.vue` anlegen, dann `<SiteHeader>`/`<SiteFooter>`. Pfade in diesem Plan entsprechend (`app/components/site/Header.vue`, `Footer.vue`).

- [ ] **Step 4: Verifizieren**

Run: `npx nuxi typecheck`
Expected: PASS.

- [ ] **Step 5: Checkpoint** („feat(site): header, footer, theme toggle, default layout").

---

## Task 7: Karten-Bausteine (`ProjectCard`, `ServiceCard`, `TeamCard`, `CtaBand`)

**Files:**
- Create: `app/components/site/ProjectCard.vue`, `ServiceCard.vue`, `TeamCard.vue`, `CtaBand.vue`

- [ ] **Step 1: `ProjectCard.vue`** (Prop: `project: Project`)

```vue
<script setup lang="ts">
import type { Project } from '~/data/projects'
defineProps<{ project: Project }>()
</script>

<template>
  <NuxtLink
    :to="`/projekte/${project.slug}`"
    class="group block rounded-2xl border border-line bg-surface p-7 transition-colors hover:border-accent"
  >
    <p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">{{ project.category }} · {{ project.year }}</p>
    <h3 class="mt-3 font-display text-2xl font-semibold text-text">{{ project.name }}</h3>
    <p class="mt-2 text-sm leading-relaxed text-muted">{{ project.tagline }}</p>
    <span class="mt-5 inline-flex items-center gap-2 font-tel text-xs uppercase tracking-widest-2 text-accent">
      Projekt ansehen <span class="transition-transform group-hover:translate-x-1">→</span>
    </span>
  </NuxtLink>
</template>
```

- [ ] **Step 2: `ServiceCard.vue`** (Prop: `service: Service`)

```vue
<script setup lang="ts">
import type { Service } from '~/data/services'
defineProps<{ service: Service }>()
</script>

<template>
  <div class="rounded-2xl border border-line bg-surface p-7">
    <p class="font-tel text-xs text-accent">{{ service.no }}</p>
    <h3 class="mt-3 font-display text-xl font-semibold text-text">{{ service.title }}</h3>
    <p class="mt-2 text-sm leading-relaxed text-muted">{{ service.summary }}</p>
    <ul class="mt-5 flex flex-wrap gap-2">
      <li v-for="p in service.points" :key="p" class="rounded-full border border-line px-3 py-1 font-tel text-[11px] text-muted">{{ p }}</li>
    </ul>
  </div>
</template>
```

- [ ] **Step 3: `TeamCard.vue`** (Prop: `member: Member`)

```vue
<script setup lang="ts">
import type { Member } from '~/data/team'
defineProps<{ member: Member }>()
</script>

<template>
  <div class="rounded-2xl border border-line bg-surface p-7">
    <div class="grid size-14 place-items-center rounded-full border border-accent/40 font-tel text-sm text-accent">{{ member.initials }}</div>
    <h3 class="mt-5 font-display text-xl font-semibold text-text">{{ member.name }}</h3>
    <p class="mt-1 font-tel text-[11px] uppercase tracking-widest-2 text-accent">{{ member.role }}</p>
    <p class="mt-3 text-sm leading-relaxed text-muted">{{ member.focus }}</p>
  </div>
</template>
```

- [ ] **Step 4: `CtaBand.vue`** (wiederverwendbarer Kontakt-CTA)

```vue
<template>
  <section class="border-y border-line bg-surface">
    <div class="mx-auto flex max-w-6xl flex-col items-start gap-6 px-6 py-16 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h2 class="font-display text-2xl font-semibold text-text sm:text-3xl">Lasst uns euren wahren Norden finden.</h2>
        <p class="mt-2 text-sm text-muted">Erzählt uns von eurem Vorhaben — wir melden uns.</p>
      </div>
      <NuxtLink to="/kontakt" class="shrink-0 rounded-sm bg-accent px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-white transition-colors hover:bg-accent-bright">
        Kontakt aufnehmen ↗
      </NuxtLink>
    </div>
  </section>
</template>
```

- [ ] **Step 5: Verifizieren**

Run: `npx nuxi typecheck`
Expected: PASS.

- [ ] **Step 6: Checkpoint** („feat(site): card building blocks + CTA band").

---

## Task 8: Startseite `index.vue` (ersetzt alte komplett)

**Files:**
- Modify: `app/pages/index.vue` (kompletter Neuinhalt)

- [ ] **Step 1: Seite schreiben** — Hero (Copy + SphereStage), Leistungen-Teaser, Projekte (3), Agentur-Teaser, CtaBand.

```vue
<script setup lang="ts">
import { projects } from '~/data/projects'
import { services } from '~/data/services'

useHead({
  title: 'rhowerk — Tech-Studio für digitale Präzisionsinstrumente',
  meta: [{ name: 'description', content: 'rhowerk ist ein Tech-Studio, das Software mit dem Anspruch eines Präzisionsinstruments baut. Produktentwicklung, Plattform-Architektur und Design aus einer Hand.' }],
})
</script>

<template>
  <div class="rho">
    <!-- Hero -->
    <section class="relative overflow-hidden">
      <div class="mx-auto grid min-h-screen max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-24 pb-16 lg:grid-cols-[1.05fr_0.95fr]">
        <div>
          <SiteSectionLabel text="ρ · Tech-Studio · ehem. Designagentur" />
          <h1 class="rise rise-2 engrave mt-5 font-display text-[clamp(2.6rem,6vw,4.6rem)] font-semibold leading-[1.04] text-text">
            Wir bauen Software wie <span class="text-accent">Präzisionsinstrumente</span>.
          </h1>
          <p class="rise rise-3 mt-6 max-w-md text-[15px] leading-relaxed text-muted">
            rhowerk gibt komplexen Systemen einen festen Bezugspunkt. Aus unserer Herkunft als Designagentur und unserem Anspruch als Ingenieure entsteht Software, die Orientierung schafft.
          </p>
          <div class="rise rise-4 mt-9 flex flex-wrap items-center gap-4">
            <NuxtLink to="/projekte" class="rounded-sm bg-accent px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-white transition-colors hover:bg-accent-bright">Projekte ansehen</NuxtLink>
            <NuxtLink to="/leistungen" class="rounded-sm border border-line px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-text transition-colors hover:border-accent">Leistungen →</NuxtLink>
          </div>
        </div>
        <div class="rise rise-3"><SiteSphereStage /></div>
      </div>
    </section>

    <!-- Leistungen-Teaser -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <SiteSectionLabel no="A" text="Was wir tun" />
      <div class="mt-8 grid gap-5 sm:grid-cols-2">
        <SiteServiceCard v-for="s in services" :key="s.no" :service="s" />
      </div>
    </section>

    <!-- Projekte -->
    <section class="mx-auto max-w-6xl px-6 py-20">
      <SiteSectionLabel no="B" text="Ausgewählte Projekte" />
      <div class="mt-8 grid gap-5 md:grid-cols-3">
        <SiteProjectCard v-for="p in projects" :key="p.slug" :project="p" />
      </div>
    </section>

    <SiteCtaBand />
  </div>
</template>
```

- [ ] **Step 2: Verifizieren**

Run: `npx nuxi typecheck`
Expected: PASS (alle Auto-Import-Namen aufgelöst: `SiteSphereStage`, `SiteServiceCard`, `SiteProjectCard`, `SiteSectionLabel`, `SiteCtaBand`).

- [ ] **Step 3: Checkpoint** („feat(pages): new homepage").

---

## Task 9: `leistungen.vue`

**Files:**
- Create: `app/pages/leistungen.vue`

- [ ] **Step 1: Seite schreiben** — Intro + alle 4 ServiceCards in voller Breite + CtaBand.

```vue
<script setup lang="ts">
import { services } from '~/data/services'
useHead({ title: 'Leistungen — rhowerk', meta: [{ name: 'description', content: 'Produkt- & Webentwicklung, Plattform-Architektur, Design-Systeme und digitale Strategie.' }] })
</script>

<template>
  <div class="rho">
    <section class="mx-auto max-w-6xl px-6 pt-32 pb-16">
      <SiteSectionLabel text="Leistungen" />
      <h1 class="mt-5 max-w-2xl font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text">
        Vier Achsen, ein ausgerichtetes System.
      </h1>
      <p class="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
        Wir verbinden Gestaltung und Engineering zu einem Werkzeug — von der ersten Idee bis zur tragfähigen Plattform.
      </p>
    </section>
    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="grid gap-5 sm:grid-cols-2">
        <SiteServiceCard v-for="s in services" :key="s.no" :service="s" />
      </div>
    </section>
    <SiteCtaBand />
  </div>
</template>
```

- [ ] **Step 2: Verifizieren** — `npx nuxi typecheck` → PASS.
- [ ] **Step 3: Checkpoint** („feat(pages): leistungen").

---

## Task 10: `projekte/index.vue` + `projekte/[slug].vue`

**Files:**
- Create: `app/pages/projekte/index.vue`, `app/pages/projekte/[slug].vue`

- [ ] **Step 1: `projekte/index.vue`**

```vue
<script setup lang="ts">
import { projects } from '~/data/projects'
useHead({ title: 'Projekte — rhowerk', meta: [{ name: 'description', content: 'Ausgewählte Arbeiten von rhowerk: Hygieia, MZLA und Ergovision.' }] })
</script>

<template>
  <div class="rho">
    <section class="mx-auto max-w-6xl px-6 pt-32 pb-16">
      <SiteSectionLabel text="Projekte" />
      <h1 class="mt-5 max-w-2xl font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text">Instrumente, die wir gebaut haben.</h1>
    </section>
    <section class="mx-auto max-w-6xl px-6 pb-20">
      <div class="grid gap-5 md:grid-cols-3">
        <SiteProjectCard v-for="p in projects" :key="p.slug" :project="p" />
      </div>
    </section>
    <SiteCtaBand />
  </div>
</template>
```

- [ ] **Step 2: `projekte/[slug].vue`** — Detail mit 404 bei unbekanntem Slug.

```vue
<script setup lang="ts">
import { getProject } from '~/data/projects'
const route = useRoute()
const project = getProject(String(route.params.slug))
if (!project) throw createError({ statusCode: 404, statusMessage: 'Projekt nicht gefunden', fatal: true })
useHead({ title: `${project.name} — rhowerk`, meta: [{ name: 'description', content: project.tagline }] })
</script>

<template>
  <div class="rho">
    <!-- Hero mit dunkler Bühne -->
    <section class="relative overflow-hidden">
      <div class="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-6 pt-32 pb-16 lg:grid-cols-[1fr_0.85fr]">
        <div>
          <SiteSectionLabel :text="`${project.category} · ${project.year}`" />
          <h1 class="mt-5 font-display text-[clamp(2.4rem,6vw,4.2rem)] font-semibold leading-[1.04] text-text">{{ project.name }}</h1>
          <p class="mt-5 max-w-md text-[15px] leading-relaxed text-muted">{{ project.tagline }}</p>
          <p class="mt-6 font-tel text-[11px] uppercase tracking-widest-2 text-muted">{{ project.accentCoord }}</p>
        </div>
        <SiteSphereStage height-class="h-[300px] sm:h-[380px]" />
      </div>
    </section>

    <!-- Meta -->
    <section class="mx-auto max-w-6xl px-6 py-10">
      <div class="grid gap-6 border-y border-line py-8 sm:grid-cols-3">
        <div><p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Rolle</p><p class="mt-2 text-text">{{ project.role }}</p></div>
        <div><p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Jahr</p><p class="mt-2 text-text">{{ project.year }}</p></div>
        <div><p class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Stack</p><p class="mt-2 text-text">{{ project.stack.join(' · ') }}</p></div>
      </div>
    </section>

    <!-- Story -->
    <section class="mx-auto max-w-3xl px-6 py-10">
      <div class="space-y-12">
        <div>
          <SiteSectionLabel no="01" text="Aufgabe" />
          <p class="mt-4 text-lg leading-relaxed text-text">{{ project.challenge }}</p>
        </div>
        <div>
          <SiteSectionLabel no="02" text="Ansatz" />
          <p class="mt-4 text-lg leading-relaxed text-text">{{ project.approach }}</p>
        </div>
        <div>
          <SiteSectionLabel no="03" text="Ergebnis" />
          <p class="mt-4 text-lg leading-relaxed text-text">{{ project.result }}</p>
        </div>
      </div>
    </section>

    <!-- Kennzahlen -->
    <section class="mx-auto max-w-6xl px-6 py-10">
      <div class="grid gap-5 sm:grid-cols-3">
        <div v-for="m in project.metrics" :key="m.label" class="rounded-2xl border border-line bg-surface p-7 text-center">
          <p class="font-display text-3xl font-semibold text-accent">{{ m.value }}</p>
          <p class="mt-2 font-tel text-[11px] uppercase tracking-widest-2 text-muted">{{ m.label }}</p>
        </div>
      </div>
    </section>

    <div class="mx-auto max-w-6xl px-6 py-10">
      <NuxtLink to="/projekte" class="font-tel text-xs uppercase tracking-widest-2 text-muted hover:text-accent">← Alle Projekte</NuxtLink>
    </div>
    <SiteCtaBand />
  </div>
</template>
```

- [ ] **Step 3: Verifizieren** — `npx nuxi typecheck` → PASS.
- [ ] **Step 4: Checkpoint** („feat(pages): projekte index + detail").

---

## Task 11: `agentur.vue` + `kontakt.vue`

**Files:**
- Create: `app/pages/agentur.vue`, `app/pages/kontakt.vue`

- [ ] **Step 1: `agentur.vue`** — Story, Haltung, Team.

```vue
<script setup lang="ts">
import { team } from '~/data/team'
useHead({ title: 'Agentur — rhowerk', meta: [{ name: 'description', content: 'Von der Designagentur zum Tech-Studio. Drei Köpfe, ein Anspruch: Präzision.' }] })

const values = [
  { no: '01', title: 'Präzision', text: 'Wir bauen Dinge so, dass sie stimmen — im Detail und im Ganzen.' },
  { no: '02', title: 'Orientierung', text: 'Gute Software gibt einen festen Bezugspunkt. Daran richten wir alles aus.' },
  { no: '03', title: 'Handwerk', text: 'Design und Engineering sind für uns dasselbe Handwerk, nur an verschiedenen Achsen.' },
]
</script>

<template>
  <div class="rho">
    <section class="mx-auto max-w-6xl px-6 pt-32 pb-16">
      <SiteSectionLabel text="Agentur" />
      <h1 class="mt-5 max-w-3xl font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text">
        Von der Designagentur zum Tech-Studio.
      </h1>
      <p class="mt-6 max-w-xl text-[15px] leading-relaxed text-muted">
        Wir kommen aus der Gestaltung — und haben gemerkt, dass die besten Produkte entstehen, wenn Design und Technik aus einer Hand kommen. Heute sind wir ein kleines, fokussiertes Tech-Studio: drei Köpfe, ein Anspruch.
      </p>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-10">
      <div class="grid gap-5 sm:grid-cols-3">
        <div v-for="v in values" :key="v.no" class="rounded-2xl border border-line bg-surface p-7">
          <p class="font-tel text-xs text-accent">{{ v.no }}</p>
          <h3 class="mt-3 font-display text-xl font-semibold text-text">{{ v.title }}</h3>
          <p class="mt-2 text-sm leading-relaxed text-muted">{{ v.text }}</p>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-6xl px-6 py-16">
      <SiteSectionLabel no="C" text="Das Team" />
      <div class="mt-8 grid gap-5 sm:grid-cols-3">
        <SiteTeamCard v-for="m in team" :key="m.name" :member="m" />
      </div>
    </section>
    <SiteCtaBand />
  </div>
</template>
```

- [ ] **Step 2: `kontakt.vue`** — Kontaktdaten + visuelles Formular (kein Versand: `@submit.prevent`).

```vue
<script setup lang="ts">
import { ref } from 'vue'
useHead({ title: 'Kontakt — rhowerk', meta: [{ name: 'description', content: 'Erzählt uns von eurem Vorhaben. schmidt@rhowerk.de' }] })
const sent = ref(false)
// Rein visuell — kein Versand. Zeigt nur eine Bestätigung an.
const onSubmit = () => { sent.value = true }
</script>

<template>
  <div class="rho">
    <section class="mx-auto grid max-w-6xl gap-12 px-6 pt-32 pb-24 lg:grid-cols-2">
      <div>
        <SiteSectionLabel text="Kontakt" />
        <h1 class="mt-5 font-display text-[clamp(2.2rem,5vw,3.6rem)] font-semibold leading-[1.06] text-text">Sagt uns, wohin die Reise geht.</h1>
        <p class="mt-6 max-w-md text-[15px] leading-relaxed text-muted">Ob konkretes Projekt oder erste Idee — schreibt uns. Wir melden uns zügig zurück.</p>
        <dl class="mt-10 space-y-5 font-tel text-sm">
          <div><dt class="text-[11px] uppercase tracking-widest-2 text-muted">E-Mail</dt><dd class="mt-1"><a href="mailto:schmidt@rhowerk.de" class="text-text hover:text-accent">schmidt@rhowerk.de</a></dd></div>
          <div><dt class="text-[11px] uppercase tracking-widest-2 text-muted">Web</dt><dd class="mt-1 text-text">rhowerk.de</dd></div>
          <div><dt class="text-[11px] uppercase tracking-widest-2 text-muted">Studio</dt><dd class="mt-1 text-text">Deutschland</dd></div>
        </dl>
      </div>

      <form class="rounded-2xl border border-line bg-surface p-7" @submit.prevent="onSubmit">
        <div v-if="sent" class="rounded-sm border border-accent/40 bg-accent/5 p-4 font-tel text-xs text-text">
          Danke! (Dies ist eine visuelle Demo — es wurde nichts gesendet.)
        </div>
        <div class="grid gap-5" :class="{ 'mt-5': sent }">
          <label class="block">
            <span class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Name</span>
            <input type="text" class="mt-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-text outline-none focus:border-accent" />
          </label>
          <label class="block">
            <span class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">E-Mail</span>
            <input type="email" class="mt-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-text outline-none focus:border-accent" />
          </label>
          <label class="block">
            <span class="font-tel text-[11px] uppercase tracking-widest-2 text-muted">Nachricht</span>
            <textarea rows="5" class="mt-2 w-full rounded-sm border border-line bg-bg px-3 py-2.5 text-text outline-none focus:border-accent"></textarea>
          </label>
          <button type="submit" class="rounded-sm bg-accent px-6 py-3 font-tel text-xs uppercase tracking-widest-2 text-white transition-colors hover:bg-accent-bright">Nachricht senden ↗</button>
        </div>
      </form>
    </section>
  </div>
</template>
```

- [ ] **Step 3: Verifizieren** — `npx nuxi typecheck` → PASS.
- [ ] **Step 4: Checkpoint** („feat(pages): agentur + kontakt").

---

## Task 12: Aufräumen — alte Lodestar-Komponenten & Plugin löschen

**Files:**
- Delete: `app/components/celestial/CatalogSection.vue`, `ReadoutSection.vue`, `VoicesSection.vue`, `TiersSection.vue`, `CourseSection.vue`, `HeroSection.vue`, `SiteHeader.vue`, `SiteFooter.vue`, `ColorEditor.vue`
- Inspect/Modify: `app/plugins/palette.client.ts`

- [ ] **Step 1: Alte Sektionen löschen**

Die o. g. Dateien in `app/components/celestial/` löschen. (Falls `app/components/celestial/` danach leer ist und nur noch `Sphere.vue` enthielt — `Sphere.vue` wurde in Task 3 nach `site/` verschoben, der Ordner darf weg.)

- [ ] **Step 2: `palette.client.ts` prüfen**

Lies `app/plugins/palette.client.ts`. Wenn es nur `load()` + `applyCssVars()` aus `usePalette` aufruft: Da `CSS_VAR_MAP` jetzt leer ist (Task 3), bleibt `applyCssVars` eine No-Op — das Plugin kann **bleiben** (harmlos) oder, wenn es ausschließlich den ColorEditor/Palette-Persistenz bediente, **gelöscht** werden. Entscheidung: löschen, wenn keine andere Datei `palette.save()`/Editor mehr nutzt (ColorEditor ist weg). Andernfalls auf reines `load()` reduzieren.

- [ ] **Step 3: Nach Referenzen suchen**

Run: `grep -rn "Celestial\|celestial\|ColorEditor\|lodestar" app/`
Expected: keine Treffer mehr in `app/pages` oder `app/layouts` (nur evtl. CSS-Reste, die in Task 1 bereits zu `.rho` migriert wurden — sonst hier nachziehen).

- [ ] **Step 4: Verifizieren** — `npx nuxi typecheck` → PASS, keine fehlenden Imports.
- [ ] **Step 5: Checkpoint** („chore: remove lodestar sections + color editor").

---

## Task 13: Prerender-Config & finaler Build

**Files:**
- Modify: `nuxt.config.ts`

- [ ] **Step 1: Prerender-Routen ergänzen**

```ts
nitro: {
  prerender: {
    crawlLinks: true,
    routes: ['/', '/leistungen', '/projekte', '/projekte/hygieia', '/projekte/mzla', '/projekte/ergovision', '/agentur', '/kontakt'],
  },
},
```

- [ ] **Step 2: Voller Build**

Run: `yarn build`
Expected: Build erfolgreich, alle 8 Routen prerendert, keine Fehler. (Sphäre ist `<ClientOnly>` → kein WebGL im Prerender.)

- [ ] **Step 3: Typecheck final**

Run: `npx nuxi typecheck`
Expected: PASS.

- [ ] **Step 4: Checkpoint** („chore: prerender routes + production build").

---

## Task 14: Visuelle Abnahme (auf Wunsch des Nutzers)

- [ ] **Step 1:** Mit Freigabe des Nutzers Dev-Server/Preview über das `run`- oder `verify`-Skill starten (Nutzerregel: Dev-Server nur auf ausdrücklichen Wunsch).
- [ ] **Step 2:** Beide Themes prüfen (Toggle), Sphäre auf dunkler Bühne in hell **und** dunkel, alle 6 Seiten + 3 Projekt-Slugs, 404 bei unbekanntem Slug, reduced-motion.
- [ ] **Step 3:** Sphären-Hex und Spacing visuell feinjustieren (frontend-design-Skill). Offene Punkte aus Spec §10 hier schließen.

---

## Self-Review (Plan vs. Spec)

- **Spec §3 dunkle Bühne** → Task 5 (`SphereStage`), in allen Hero-Seiten genutzt. ✓
- **Spec §4 Farbe/Typo** → Task 1 (Tokens/Fonts), Task 3 (Sphäre recolor). ✓
- **Spec §5 Routing (6 Seiten + slug)** → Tasks 8–11. ✓
- **Spec §5 Leistungen/Projekte/Team-Inhalte** → Task 4. ✓
- **Spec §6 Komponenten/Löschen** → Tasks 5–7 (neu), Task 12 (löschen). ✓
- **Spec §7 Theme-System + FOUC** → Task 2. ✓
- **Spec §6 Rendering/Prerender** → Task 13. ✓
- **Spec §8 a11y/reduced-motion/ClientOnly** → Sphäre unverändert (Task 3) + Task 14. ✓
- **Spec §9 YAGNI** → kein Backend/CMS; Kontakt rein visuell (Task 11). ✓
- **Auto-Import-Konsistenz:** Komponenten unter `app/components/site/` → Präfix `Site` (`SiteSphere`, `SiteSphereStage`, `SiteSectionLabel`, `SiteServiceCard`, `SiteProjectCard`, `SiteTeamCard`, `SiteCtaBand`, `SiteHeader`, `SiteFooter`). Header/Footer als `Header.vue`/`Footer.vue` anlegen (nicht `SiteHeader.vue`) — Begründung in Task 6 Step 3. Namen über alle Tasks konsistent verwendet. ✓
- **Platzhalter-Scan:** keine TBD/TODO; alle Code-Schritte vollständig. ✓
