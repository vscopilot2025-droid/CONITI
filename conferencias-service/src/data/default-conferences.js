const defaultConferences = [
  {
    title: 'Arquitectura de Microservicios con Node.js',
    description: 'Conferencia enfocada en diseño desacoplado, escalabilidad y evolución progresiva.',
    category: 'Arquitectura',
    status: 'published',
    modality: 'virtual',
    timezone: 'America/Bogota',
    capacity: 250,
    availableSeats: 118,
    tags: ['nodejs', 'microservicios', 'arquitectura'],
    startDate: '2026-05-20T14:00:00.000Z',
    endDate: '2026-05-20T16:00:00.000Z',
    agenda: [
      {
        title: 'Registro y bienvenida',
        speaker: 'Equipo CONIITI',
        startsAt: '2026-05-20T14:00:00.000Z',
        endsAt: '2026-05-20T14:20:00.000Z',
        room: 'Sala Principal'
      },
      {
        title: 'Patrones de descomposición',
        speaker: 'Laura Mendoza',
        startsAt: '2026-05-20T14:20:00.000Z',
        endsAt: '2026-05-20T15:10:00.000Z',
        room: 'Sala Principal'
      }
    ]
  },
  {
    title: 'Observabilidad para plataformas de eventos',
    description: 'Buenas prácticas para monitoreo, métricas y trazabilidad en sistemas orientados a eventos.',
    category: 'DevOps',
    status: 'draft',
    modality: 'hybrid',
    timezone: 'America/Bogota',
    capacity: 180,
    availableSeats: 180,
    tags: ['observabilidad', 'devops'],
    startDate: '2026-06-15T13:00:00.000Z',
    endDate: '2026-06-15T15:00:00.000Z',
    agenda: [
      {
        title: 'Introducción a métricas',
        speaker: 'Carlos Ruiz',
        startsAt: '2026-06-15T13:00:00.000Z',
        endsAt: '2026-06-15T13:45:00.000Z',
        room: 'Auditorio A'
      },
      {
        title: 'Trazabilidad de punta a punta',
        speaker: 'Valentina Pardo',
        startsAt: '2026-06-15T14:00:00.000Z',
        endsAt: '2026-06-15T15:00:00.000Z',
        room: 'Auditorio A'
      }
    ]
  }
]

module.exports = {
  defaultConferences
}
