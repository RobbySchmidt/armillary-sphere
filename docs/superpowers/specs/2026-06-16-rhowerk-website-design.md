# rhowerk.de — Neue Website (Design-Spec)

**Datum:** 2026-06-16
**Status:** Abgenommen (Design), bereit für Umsetzungsplan
**Stack:** Nuxt 4 · Tailwind v4 · shadcn-nuxt · Three.js (vorhandene `Armillary3D`)

---

## 1. Ziel & Kontext

Die bestehende fiktive „Lodestar"-Observability-Landingpage wird vollständig durch
die neue Firmen-Website von **rhowerk** ersetzt. rhowerk ist ein 3-köpfiges
Tech-Studio, hervorgegangen aus einer Designagentur. Key-Element der Seite bleibt
die vorhandene 3D-**Armillarsphäre** (`Armillary3D.vue`).

**Leitidee / Narrativ:** *„Wir bauen Software wie Präzisionsinstrumente."*
Die Armillarsphäre (ein historisches Navigationsinstrument) ist die Metapher für
**Orientierung & Struktur in komplexen Systemen**. Die Design-Herkunft wird zur
Stärke: Gestaltungsqualität trifft Engineering.

**Gestalterische Grundrichtung:** Präzisionsinstrument — reduziert, edel,
ingenieurhaft, viel Raum.

---

## 2. Designentscheidungen (abgenommen)

| Thema | Entscheidung |
|---|---|
| Look & Feel | Präzisionsinstrument |
| Grundton | Hell **und** Dunkel, per Theme-Toggle umschaltbar |
| Kontakt | Rein visuell: Kontaktdaten + Formular **ohne** funktionierenden Versand |
| ColorEditor (Dev-Tool) | **Entfernen** |
| Brand-Farbe | `#fc0f47` (Signal-Akzent, sparsam) |
| Projekte | `hygieia`, `mzla`, `ergovision` (Inhalte erfunden, leicht austauschbar) |
| Team | Kevin Klein, Frank Koppe, Robby Schmidt |
| Sprache | Deutsch |
| Git | Spec wird **nicht** automatisch committet (Nutzerregel: kein autonomes git) |

---

## 3. Die dunkle Bühne für die Sphäre (zentrale Technik-Entscheidung)

Die Sphäre lebt von additivem Bloom, Corona und Sternenfeld — das leuchtet nur auf
dunklem Grund. Auf hellem Hintergrund würde sie verwaschen.

**Lösung:** Das Instrument bekommt **immer** eine eigene dunkle „Bühne"
(`SphereStage` — ein dunkles Panel/Section-Bereich), unabhängig vom Seiten-Theme.
Der Theme-Toggle steuert nur die Seiten-Chrome (Text, Flächen, Hintergrund,
Linien). Die Sphäre rendert konstant gegen ihren cinematic-dunklen Hintergrund.

Konsequenz: `Armillary3D` bleibt funktional unverändert (nur umgefärbt). Der
`SphereStage`-Wrapper liefert den dunklen Hintergrund + weiche Kantenmaske.

---

## 4. Farbe & Typografie

### Akzent
- `#fc0f47` als Signalfarbe — Links, CTAs, aktive Nav, **leuchtender Kern + Corona**
  der Sphäre. Sparsam einsetzen.

### Sphäre (Umfärbung in `usePalette` / `PALETTE_DEFAULTS`)
- Ringe: **polierter Stahl/Graphit** (kühl, neutral) statt Messing-Gold.
  - `brass` → mittleres Stahlgrau (z. B. `#8a9099`)
  - `brassBright` → helles Platin (z. B. `#c9d0d8`)
- Kern: **crimson** — `starGlow` ≈ `#fc0f47`, `starBody` warmweiß (`#fff0f2`).
- Corona/Haze: crimson-getönt.
- Lichter (`lightWarm`/`lightRim`/`lightAmbient`) auf das kühle Stahl+Crimson-Schema
  abgestimmt; `fog` tief/neutral-dunkel.
- Die RA-Skala-Bande (`raBandTexture`) nutzt weiterhin `brassBright` (jetzt Platin).

> Exakte Hex-Werte werden in der Umsetzung visuell feinjustiert; obige Werte sind
> Startpunkte. Die Sphäre wird nach dem Recolor im Browser geprüft.

### Seiten-Theme (Tailwind v4 CSS-Tokens)
Semantische Tokens, die pro Theme umschalten (nicht die 3D-Extras):
- `--rho-bg`, `--rho-surface`, `--rho-text`, `--rho-muted`, `--rho-line`,
  `--rho-accent` (`#fc0f47`), `--rho-accent-bright`.
- **Hell:** warmes Off-White/Porzellan (`--rho-bg`), Text near-black, feine helle Linien.
- **Dunkel:** tiefes Ink/Schwarz, Text Off-White.
- Umschaltung über `.dark`-Klasse auf `<html>` (bestehende `@custom-variant dark`).

### Typografie
- **Headlines:** präzise Grotesk (z. B. Space Grotesk / Inter Tight — finale Wahl in Umsetzung).
- **Mikro-Labels / „Instrument-Readouts":** **Space Mono** (Koordinaten, Section-Nummern, Meta).
- **Fließtext:** Inter.
- *Fraunces* wird entfernt (zu nostalgisch fürs Tech-Profil).

---

## 5. Informationsarchitektur & Routing

| Route | Inhalt |
|---|---|
| `/` | Hero (Sphäre + Claim) · Leistungen-Teaser · 3 Projekte · Agentur/Haltungs-Teaser · Kontakt-CTA |
| `/leistungen` | 4 Leistungen, instrument-gerahmt |
| `/projekte` | Übersicht der 3 Projekte |
| `/projekte/[slug]` | Detail für `hygieia`, `mzla`, `ergovision` |
| `/agentur` | Story (Design→Tech), Haltung/Werte, 3 Personen |
| `/kontakt` | Kontaktdaten + Formular (visuell, ohne Versand) |

Globale Navigation: Leistungen · Projekte · Agentur · Kontakt + Theme-Toggle + ρ-Logo.

### Leistungen (4, erfundene aber stimmige Inhalte)
1. **Produkt- & Webentwicklung** — Web-Apps, Plattformen, Frontends (Vue/Nuxt).
2. **Plattform-Architektur & Engineering** — skalierbare Systeme, APIs, Infrastruktur.
3. **Design-Systeme & Interface** — UI/UX, Designsysteme (Heritage als Designagentur).
4. **Discovery & digitale Strategie** — Product Discovery, Konzeption, Roadmapping.

### Projekte (erfundene, leicht austauschbare Inhalte)
Jedes Projekt liefert: `slug`, `name`, `tagline`, `branche/kategorie`, `jahr`,
`rolle`, `stack[]`, `aufgabe`, `ansatz`, `ergebnis`, ggf. Kennzahlen.
- **hygieia** — Gesundheits-/Hygiene-Domäne (Hygieia = Göttin der Gesundheit).
  Digitale Plattform fürs klinische Hygiene-/Gesundheitsmanagement.
- **mzla** — B2B-SaaS-Plattform (z. B. Disposition/Logistik/Medien — finale Wahl in Umsetzung).
- **ergovision** — Ergonomie/Optik: z. B. 3D-Konfigurator / Arbeitsplatz-Analyse.

> Hinweis: Bilder werden als CSS-/Canvas-Platzhalter oder dezente generierte Visuals
> umgesetzt (keine echten Projekt-Assets vorhanden). Stilistisch zur dunklen Bühne passend.

### Agentur
- Story: von der Designagentur zum Tech-Studio.
- Haltung/Werte (instrument-gerahmt: Präzision, Orientierung, Handwerk).
- 3 Personen-Karten: Kevin Klein, Frank Koppe, Robby Schmidt (Rollen erfunden, austauschbar).

### Kontakt
- Sichtbare Kontaktdaten (Mail/Adresse/Telefon — Platzhalter, von Nutzer ersetzbar;
  bekannte Mail: schmidt@rhowerk.de).
- Formular-Layout (Name, Mail, Nachricht, Senden-Button) — **kein** Versand, rein visuell.

---

## 6. Komponenten- & Datei-Architektur

### Behalten (anpassen)
- `app/components/celestial/Armillary3D.vue` → umgefärbt; ggf. nach `app/components/site/`
  verschoben/umbenannt (`Sphere.vue`). Funktion unverändert.
- `app/composables/usePalette.ts` → `PALETTE_DEFAULTS` auf Stahl+Crimson; CSS-Var-Map
  auf neue `--rho-*`-Tokens (bzw. an Theme-System angepasst).

### Neu
- `app/composables/useTheme.ts` — Toggle hell/dunkel, `localStorage`, `.dark` auf `<html>`,
  SSR-sicher (kein FOUC, Inline-Script im Head zum frühen Setzen).
- `app/data/projects.ts` — typisiertes Array der 3 Projekte (Quelle für Index + `[slug]`).
- `app/data/services.ts` — 4 Leistungen.
- `app/data/team.ts` — 3 Personen.
- `app/components/site/SiteHeader.vue` — Nav, ρ-Logo, Theme-Toggle.
- `app/components/site/SiteFooter.vue` — Kontakt/Impressum-Links, ρ.
- `app/components/site/SphereStage.vue` — dunkle Bühne (Wrapper um die 3D-Sphäre).
- Weitere Sektions-/Karten-Bausteine nach Bedarf (Hero, ServiceCard, ProjectCard,
  TeamCard, SectionLabel/„Readout"-Eyebrow, CTA-Band).
- Layout: `app/layouts/default.vue` (Header + Slot + Footer), Seiten nutzen es.

### Seiten (`app/pages/`)
- `index.vue` (Startseite — ersetzt die alte komplett)
- `leistungen.vue`
- `projekte/index.vue`
- `projekte/[slug].vue`
- `agentur.vue`
- `kontakt.vue`

### Löschen
- `app/components/celestial/`: `CatalogSection.vue`, `ReadoutSection.vue`,
  `VoicesSection.vue`, `TiersSection.vue`, `CourseSection.vue`, alte `HeroSection.vue`,
  alte `SiteHeader.vue`, alte `SiteFooter.vue`, `ColorEditor.vue`.
- Alte `app/pages/index.vue`-Inhalte (ersetzt).
- `app/plugins/palette.client.ts` nur, falls es ausschließlich den ColorEditor bediente
  — sonst auf reines Palette-Laden reduzieren.

### Rendering / Config
- Statisches Prerendering aller Routen (`nuxt.config` `nitro.prerender` bzw. route rules);
  `[slug]` für die 3 bekannten Slugs prerendern.
- Meta/SEO pro Seite via `useHead` (Titel, Description, OpenGraph-Basics).
- Schriften-Imports in `tailwind.css` anpassen (Fraunces raus, Grotesk rein).

---

## 7. Theme-System — Detail

- Tokens in `tailwind.css`: `:root` (hell) + `.dark` (dunkel) für `--rho-*`.
- `useTheme`: liest `localStorage('rho-theme')` → `'light' | 'dark'`; Default per
  `prefers-color-scheme`. Setzt/entfernt `.dark` auf `documentElement`. Toggle im Header.
- FOUC-Schutz: kleines Inline-Script im `<head>` (via `useHead`/`app.head`), das vor
  dem ersten Paint die Klasse setzt.
- Die 3D-Sphäre ist vom Theme entkoppelt (immer dunkle Bühne) — `usePalette` schreibt
  weiterhin ihre eigenen 3D-Farben; die `--rho-*`-Seiten-Tokens sind davon getrennt.

---

## 8. Barrierefreiheit & Performance

- `prefers-reduced-motion` wird von `Armillary3D` bereits respektiert (rendert ein
  Standbild) — beibehalten.
- Sphäre nur client-seitig (`<ClientOnly>`), mit Fallback-Ring (wie bisher).
- Semantisches HTML, fokussierbare Nav/Links, ausreichende Kontraste in beiden Themes
  (Brand-Rot v. a. als Akzent, nicht als Fließtextfarbe auf großen Flächen).
- Bilder/Visuals leichtgewichtig (CSS/Canvas-Platzhalter).

---

## 9. Out of Scope (YAGNI)

- Kein CMS, kein echtes Formular-Backend / E-Mail-Versand.
- Keine Mehrsprachigkeit (nur Deutsch).
- Kein Blog/News, kein Auth, kein Cookie-Banner-/Consent-System.
- Kein Deployment in diesem Schritt (separater Mittwald-Deploy-Skill später, auf Wunsch).

---

## 10. Offene Punkte (in Umsetzung zu entscheiden, kein Blocker)

- Finale Grotesk-Schriftwahl (Space Grotesk vs. Inter Tight).
- Finale Hex-Feinjustierung der Sphären-Umfärbung (visuell im Browser).
- Konkrete Projekt-Stories (Branche von `mzla`, Visual-Stil der Platzhalter).
- Datei-Reorganisation: `celestial/` → `site/` (Verschieben vs. nur Neuanlegen).
