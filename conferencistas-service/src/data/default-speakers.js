const defaultSpeakers = [
  {
    fullName: 'Giuseppe Moretti',
    slug: 'giuseppe-moretti',
    initials: 'GM',
    institution: 'Politecnico di Milano',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Milan',
    bio: 'Experto en robotica avanzada y sistemas autonomos con 25 anos de investigacion en Europa.',
    expertise: ['robotica', 'sistemas autonomos', 'industria 4.0'],
    featured: true,
    talks: [
      {
        title: 'Ingenieria e innovacion: el puente entre Italia y America Latina',
        abstract: 'Keynote sobre transferencia tecnologica, colaboracion academica e innovacion aplicada.',
        topic: 'Innovacion',
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
    institution: 'Universita La Sapienza',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Rome',
    bio: 'Pionera en inteligencia artificial aplicada a la ingenieria biomedica y salud digital.',
    expertise: ['inteligencia artificial', 'salud digital', 'ingenieria biomedica'],
    featured: true,
    talks: [
      {
        title: 'Inteligencia artificial aplicada a sistemas de ingenieria',
        abstract: 'Taller para aterrizar IA en procesos de diseno, manufactura y analitica avanzada.',
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
    fullName: 'Dr. Jorge Arevalo',
    slug: 'dr-jorge-arevalo',
    initials: 'JA',
    institution: 'Universidad Nacional',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Bogota',
    bio: 'Investigador lider en energias renovables y sostenibilidad para Latinoamerica.',
    expertise: ['energias renovables', 'sostenibilidad', 'ingenieria energetica'],
    featured: true,
    talks: [
      {
        title: 'Energias renovables para una ingenieria sostenible',
        abstract: 'Sesion sobre transicion energetica y aplicacion de fuentes limpias en proyectos industriales.',
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
    institution: 'Universita di Bologna',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Bologna',
    bio: 'Especialista en nanomateriales y su aplicacion en la ingenieria de materiales del futuro.',
    expertise: ['nanomateriales', 'materiales avanzados', 'innovacion industrial'],
    featured: true,
    talks: [
      {
        title: 'Nanomateriales: la proxima revolucion industrial',
        abstract: 'Conferencia sobre materiales de nueva generacion y su impacto en manufactura avanzada.',
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
