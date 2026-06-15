# Farb-Editor (Dev-Tool) — Design

**Datum:** 2026-06-15
**Status:** Genehmigt (Brainstorming abgeschlossen)

## Ziel

Ein Farb-Editor-Panel, mit dem der Entwickler live die Farbpalette der Lodestar-Landingpage
durchprobiert — sowohl die CSS-/Seiten-Farben als auch die Farben des 3D-Objekts im Header
(Armillary-Sphäre). Es ist ein **Design-Werkzeug nur für den Entwickler**, kein
Besucher-Feature: Auf der Live-Seite ist es nicht sichtbar. Wenn eine Palette gefunden ist,
übergibt der Entwickler die Werte (als JSON) an Claude, der sie fest in den Code schreibt.

## Entscheidungen aus dem Brainstorming

1. **Zweck:** Design-Tool nur für den Entwickler (auf Live-Seite unsichtbar).
2. **Umfang:** Voller Satz — alle Seiten-Farben + 3D-Extras. Gold zwischen Seite und 3D
   synchron. 3D-Objekt färbt sich live um.
3. **Export:** Kein Copy-Paste in Quellcode durch den Nutzer. Der Editor zeigt die komplette
   Palette als JSON-Readout; der Nutzer übergibt sie an Claude, der `tailwind.css` und
   `Armillary3D.vue` editiert. Zwischenstände überleben Reload via `localStorage`.

## Wichtige technische Erkenntnis

Tailwind v4 kompiliert die Farb-Token aktuell **inline** (`@theme inline`), d. h. die Werte
sind literal eingebacken:

```
.bg-ink{background-color:#0b1026}
.bg-brass{background-color:#c9a24a}
```

Es gibt **kein** `var(--color-ink)` in den Utilities. Damit die Seite zur Laufzeit umfärbbar
ist, müssen die **Farb-Token** von `@theme inline` auf `@theme` (non-inline) umgestellt werden,
sodass die Utilities `var(--color-ink)` referenzieren. Bei Default-Werten ist das Rendering
**identisch** (die Variable löst zum selben Hex auf). Fonts/Radius bleiben unverändert.

## Editierbare Farben

### Gold (synchron — wirkt auf Seite UND 3D)
| Token | Default | Wirkung |
|---|---|---|
| `brass` | `#c9a24a` | Goldene Hauptfarbe: CSS `--color-brass`, 3D `brass`-Material, Pins/Frame |
| `brass-bright` | `#e7c66b` | Gold-Highlight: CSS `--color-brass-bright`, 3D `brassBright`-Material, RA-Band, Corona-/Haze-Tint, Hero-Glow |

### Seite (CSS-Token)
| Token | Default | Wirkung |
|---|---|---|
| `ink` | `#0b1026` | Seiten-Hintergrund |
| `void` | `#05070f` | Tiefes Schwarz (Sektionen) |
| `bone` | `#ece6d6` | Haupt-Textfarbe |
| `haze` | `#7e91b4` | Gedämpfter Text |
| `hairline` | `#2a3354` | Rahmen / Graticule-Linien |

### 3D-Extras (nur 3D)
| Schlüssel | Default | Wirkung im 3D |
|---|---|---|
| `starBody` | `#fff4d6` | Körper des Zentralsterns (`starMat.color`) |
| `starGlow` | `#ffd98a` | Stern-Emissive, Corona-Innen, Kernlicht (`coreLight`) |
| `fog` | `#070b1c` | Szenen-Nebel (`scene.fog.color`) |
| `lightWarm` | `#ffd9a0` | Warmes Key-Light |
| `lightRim` | `#6f8fd0` | Blaues Rim-Light |
| `lightAmbient` | `#35406a` | Ambient-Light |

### Bewusst NICHT editierbar (YAGNI)
- Die 4-farbige Sternenfeld-Punktpalette (zu kleinteilig) — bleibt fest.
- Material-Parameter wie `metalness`/`roughness`/Bloom — nur Farben sind im Scope.

## Architektur

### 1. `app/composables/usePalette.ts`
Reaktives Palette-Singleton.
- Hält alle editierbaren Farben als `reactive`-Objekt; Defaults = heutige Werte.
- **Persistenz:** lädt aus `localStorage` (Key z. B. `lodestar-palette`), speichert bei
  Änderung (Client-only, SSR-sicher — kein Zugriff auf `window`/`document` auf dem Server).
- `applyCssVars()`: schreibt `--color-ink`, `--color-brass`, … als Inline-Style auf
  `document.documentElement` (Live-Umfärbung der Seite).
- `reset()`: zurück auf Defaults.
- Serialisierung: Default-Export / `toJSON()` für den Readout.
- Wird sowohl vom Editor als auch von `Armillary3D.vue` konsumiert (gleiche Instanz).

### 2. `app/assets/css/tailwind.css`
- Farb-Token-Gruppe des Lodestar-Blocks von `@theme inline` → `@theme`.
- Fonts (`--font-display`, `--font-tel`) bleiben in einem `@theme inline`-Block.
- Default-Hexwerte bleiben unverändert.

### 3. `app/components/celestial/ColorEditor.vue`
Schwebendes Panel (z. B. fixiert unten rechts), gruppiert in: **Gold (synchron)**, **Seite**,
**3D-Extras**.
- Jeder Eintrag: nativer `<input type="color">` + Hex-Textfeld (beidseitig gebunden).
- **Reset**-Button (ruft `palette.reset()`).
- **Readout:** `<textarea readonly>` mit der kompletten Palette als formatiertem JSON +
  „Kopieren"-Button. Dieses JSON übergibt der Nutzer an Claude.
- Änderungen schreiben in das Composable → `applyCssVars()` + 3D-`watch` reagieren sofort.

### 4. `app/components/celestial/Armillary3D.vue` (Refactor)
- Farben werden aus `usePalette()` gelesen statt hartcodiert.
- Materialien/Lichter/Fog werden in Referenzen gehalten; eine `applyPalette(p)`-Funktion
  aktualisiert gezielt:
  - `brass.color`, `brassBright.color`
  - `starMat.color`, `starMat.emissive`, `coreLight.color`
  - `scene.fog.color`, `key.color`, `rim.color`, `ambient.color`
  - regeneriert die 3 Canvas-Gradient-Texturen (Corona, Haze, RA-Band-`brass`).
- `watch(palette, applyPalette)` für Live-Update (flacker­frei, kein Re-Init).
- Beim Unmount weiterhin alle Disposables freigeben (inkl. neu generierter Texturen).

### 5. Einbindung & Guard — `app/pages/index.vue`
- `<ColorEditor>` wird **nur unter `import.meta.dev`** gerendert (im Production-Build nicht
  vorhanden). Optional zusätzlich via `?editor`-Query aktivierbar.
- Innerhalb `<ClientOnly>`, damit kein SSR-Mismatch entsteht.
- `HeroSection.vue`: der hartcodierte Gold-Glow `rgba(231,198,107,…)` wird an `brass-bright`
  gebunden (via `var(--color-brass-bright)` + `color-mix`/Alpha), damit er mitzieht.

## Datenfluss

```
ColorEditor (Eingaben)
      │  schreibt
      ▼
usePalette() ── reactive Palette ──┬─ applyCssVars() → :root Inline-Vars → Tailwind var() → Seite färbt um
                                   └─ watch → Armillary3D.applyPalette() → THREE-Objekte/Texturen → 3D färbt um
      │
      └─ localStorage (Persistenz)  +  JSON-Readout → an Claude → fest in tailwind.css / Armillary3D.vue
```

## Fehlerfälle / Edge Cases
- **SSR:** Composable greift nur client-seitig auf `localStorage`/`document` zu. Defaults
  gelten serverseitig; Hydration verwendet dieselben Default-Hexwerte → kein Mismatch.
- **Ungültiger Hex im Textfeld:** Eingabe wird validiert; ungültige Werte werden ignoriert
  (alter Wert bleibt), kein Crash im 3D-`applyPalette`.
- **Reduced Motion im 3D:** Das 3D rendert dann nur einmal; nach `applyPalette` muss ein
  erneutes `composer.render()` ausgelöst werden, damit die Farbänderung im Standbild sichtbar
  wird.
- **Production:** Editor durch `import.meta.dev` ausgeschlossen; das Composable bleibt harmlos
  (lädt nur Defaults), 3D funktioniert unverändert.

## Test / Verifikation
- Manuell: `nuxt dev` starten, Panel öffnen, jede Farbe ändern → Seite + 3D färben sich live.
- Reset stellt Defaults wieder her; Reload behält die zuletzt gewählten Werte (localStorage).
- Production-Build (`nuxt build`/`generate`): Panel ist nicht im Output, Seite rendert mit
  Defaults identisch wie heute.
- JSON-Readout enthält alle Schlüssel und ist gültiges, einfügbares JSON.

## Bewusst außerhalb des Umfangs
- Mehrfarbige Sternenfeld-Palette, Material-/Bloom-Parameter.
- Mehrere speicherbare Theme-Presets / Besucher-Theme-Switcher.
- Automatisches Zurückschreiben in Quelldateien durch den Editor selbst.
