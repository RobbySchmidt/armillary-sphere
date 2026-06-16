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
