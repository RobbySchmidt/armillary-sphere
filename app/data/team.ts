export interface Member {
  name: string
  role: string
  focus: string
  image: string
  initials: string
}

export const team: Member[] = [
  {
    name: 'Kevin Klein',
    role: 'Geschäftsführung & Entwicklung',
    focus: 'Hält Kurs und Architektur zusammen — von der Idee bis zur Plattform.',
    image: '/images/team-kevin.webp',
    initials: 'KK',
  },
  {
    name: 'Frank Koppe',
    role: 'Web-Entwicklung',
    focus: 'Baut die tragenden Teile: saubere Frontends, belastbare Systeme.',
    image: '/images/team-frank.webp',
    initials: 'FK',
  },
  {
    name: 'Robby Schmidt',
    role: 'Web-Entwicklung',
    focus: 'Verbindet Gestaltung und Code — das Gefühl im fertigen Produkt.',
    image: '/images/team-robby.webp',
    initials: 'RS',
  },
]
