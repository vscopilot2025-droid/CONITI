const defaultSpeakers = [
  {
    fullName: 'Giuseppe Moretti',
    slug: 'giuseppe-moretti',
    initials: 'GM',
    institution: 'Politecnico di Milano',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Milán',
    bio: 'Experto en robótica avanzada y sistemas autónomos con 25 años de investigación en Europa.',
    expertise: ['robótica', 'sistemas autónomos', 'industria 4.0'],
    featured: true,
    talks: [
      {
        title: 'Ingeniería e innovación: el puente entre Italia y América Latina',
        abstract: 'Keynote sobre transferencia tecnológica, colaboración académica e innovación aplicada.',
        topic: 'Innovación',
        durationMinutes: 60
      }
    ],
    eventLinks: [
      {
        conferenceId: 1,
        conferenceTitle: 'Arquitectura de Microservicios con Node.js',
        participationType: 'keynote',
        scheduledAt: '2026-05-20T14:20:00.000Z'
      }
    ]
  },
  {
    fullName: 'Claudia Russo',
    slug: 'claudia-russo',
    initials: 'CR',
    institution: 'Università La Sapienza',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Rome',
    bio: 'Pionera en inteligencia artificial aplicada a la ingeniería biomédica y salud digital.',
    expertise: ['inteligencia artificial', 'salud digital', 'ingeniería biomédica'],
    featured: true,
    talks: [
      {
        title: 'Inteligencia artificial aplicada a sistemas de ingeniería',
        abstract: 'Taller para aterrizar IA en procesos de diseño, manufactura y analítica avanzada.',
        topic: 'Inteligencia Artificial',
        durationMinutes: 90
      }
    ],
    eventLinks: [
      {
        conferenceId: 2,
        conferenceTitle: 'Observabilidad para plataformas de eventos',
        participationType: 'taller',
        scheduledAt: '2026-06-15T14:00:00.000Z'
      }
    ]
  },
  {
    fullName: 'Dr. Jorge Arévalo',
    slug: 'dr-jorge-arevalo',
    initials: 'JA',
    institution: 'Universidad Nacional',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Bogotá',
    bio: 'Investigador líder en energías renovables y sostenibilidad para Latinoamérica.',
    expertise: ['energías renovables', 'sostenibilidad', 'ingeniería energética'],
    featured: true,
    talks: [
      {
        title: 'Energías renovables para una ingeniería sostenible',
        abstract: 'Sesión sobre transición energética y aplicación de fuentes limpias en proyectos industriales.',
        topic: 'Sostenibilidad',
        durationMinutes: 60
      }
    ],
    eventLinks: [
      {
        conferenceId: 2,
        conferenceTitle: 'Observabilidad para plataformas de eventos',
        participationType: 'panelista',
        scheduledAt: '2026-06-15T15:00:00.000Z'
      }
    ]
  },
  {
    fullName: 'Laura Fontana',
    slug: 'laura-fontana',
    initials: 'LF',
    institution: 'Università di Bologna',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Bologna',
    bio: 'Especialista en nanomateriales y su aplicación en la ingeniería de materiales del futuro.',
    expertise: ['nanomateriales', 'materiales avanzados', 'innovación industrial'],
    featured: true,
    talks: [
      {
        title: 'Nanomateriales: la próxima revolución industrial',
        abstract: 'Conferencia sobre materiales de nueva generación y su impacto en manufactura avanzada.',
        topic: 'Materiales',
        durationMinutes: 60
      }
    ],
    eventLinks: [
      {
        conferenceId: 1,
        conferenceTitle: 'Arquitectura de Microservicios con Node.js',
        participationType: 'keynote',
        scheduledAt: '2026-05-20T15:10:00.000Z'
      }
    ]
  }
]

module.exports = {
  defaultSpeakers
}
