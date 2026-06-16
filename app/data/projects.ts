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
  image: string // Cover; leer = stilisierter Platzhalter
}

export const projects: Project[] = [
  {
    slug: 'hygieia',
    name: 'Hygieia.net',
    tagline: 'Eine klare Marke und ein digitales Zuhause für ein großes ambulantes Ärztenetz.',
    category: 'Healthcare · Marke & Web',
    year: '2024',
    role: 'Markenidentität, Designsystem & Web',
    stack: ['Markenidentität', 'Designsystem', 'Nuxt', 'Web'],
    challenge:
      'Ein ambulantes Ärztenetz mit über hundert Mitarbeitenden trat nach außen uneinheitlich auf. Es fehlte ein gemeinsames Bild, das Vertrauen, Modernität und Nähe zugleich vermittelt.',
    approach:
      'Wir haben eine präzise Markenidentität entwickelt — Schrift, Bildwelt und Sprache als ein System — und sie in einen klaren, schnellen Webauftritt übersetzt. Aus vielen Einzelteilen wurde ein erkennbares Ganzes.',
    result:
      'Das Netz tritt heute mit einer eindeutigen Identität auf, online wie offline. Eine Marke, die so ruhig und verlässlich wirkt wie die Medizin, für die sie steht.',
    metrics: [
      { label: 'Disziplinen', value: 'Marke · Web' },
      { label: 'Reichweite', value: 'Mitteldeutschland' },
      { label: 'Fokus', value: 'Vertrauen' },
    ],
    accentCoord: 'RA 17ʰ 42ᵐ · DEC +12° 33′',
    image: '/images/project-hygieia.webp',
  },
  {
    slug: 'mzla',
    name: 'MZLA',
    tagline: 'Employer-Branding-Kampagne und Jobportal, das die richtigen Fachkräfte fürs Labor erreicht.',
    category: 'Employer Branding · Jobportal',
    year: '2024',
    role: 'Kampagne, Designsystem & Jobportal',
    stack: ['Kampagne', 'Designsystem', 'Jobportal', 'Web'],
    challenge:
      'Fachkräfte fürs Labor zu gewinnen ist hart umkämpft. Klassische Stellenanzeigen gingen unter — die Arbeitgebermarke war kaum sichtbar und sprach die Richtigen nicht an.',
    approach:
      'Wir haben eine eigenständige Kampagnenidee entwickelt und sie mit einem fokussierten Jobportal verbunden, das Aufmerksamkeit direkt in echte Bewerbungen überführt — eine Achse von der Idee bis zum Klick.',
    result:
      'Eine unverwechselbare Arbeitgebermarke und ein Portal, das Interesse bündelt und Menschen zur Bewerbung führt — statt sie auf dem Weg zu verlieren.',
    metrics: [
      { label: 'Disziplinen', value: 'Kampagne · Web' },
      { label: 'Ziel', value: 'Recruiting' },
      { label: 'Ergebnis', value: 'Jobportal' },
    ],
    accentCoord: 'RA 09ʰ 14ᵐ · DEC −04° 51′',
    image: '/images/project-mzla.webp',
  },
  {
    slug: 'ergovision',
    name: 'Ergovision',
    tagline: 'Employer Branding und Recruiting-Video, das echte Menschen statt Floskeln zeigt.',
    category: 'Employer Branding · Video',
    year: '2024',
    role: 'Employer Branding, Konzept & Videoproduktion',
    stack: ['Employer Branding', 'Konzept', 'Videoproduktion', 'Web'],
    challenge:
      'Eine Praxis für Ergonomie und Therapie wollte als Arbeitgeber sichtbar werden — authentisch, nahbar und ohne die üblichen Recruiting-Klischees.',
    approach:
      'Wir haben das Team selbst in den Mittelpunkt gestellt: ein Konzept aus echten Stimmen und ein Recruiting-Video, gedreht vor Ort, das den Arbeitsalltag spürbar macht.',
    result:
      'Eine ehrliche Arbeitgebermarke mit Gesicht. Bewerber:innen sehen vorab, wo und mit wem sie arbeiten würden — und melden sich aus den richtigen Gründen.',
    metrics: [
      { label: 'Disziplinen', value: 'Marke · Film' },
      { label: 'Format', value: 'Recruiting-Video' },
      { label: 'Haltung', value: 'Authentisch' },
    ],
    accentCoord: 'RA 21ʰ 58ᵐ · DEC +47° 12′',
    image: '/images/project-ergovision.webp',
  },
]

export const getProject = (slug: string) => projects.find((p) => p.slug === slug)
