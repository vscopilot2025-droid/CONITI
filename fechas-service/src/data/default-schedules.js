const defaultAvailabilities = [
  {
    resourceType: 'speaker',
    resourceId: 1,
    resourceName: 'Giuseppe Moretti',
    timezone: 'Europe/Rome',
    startsAt: '2026-05-20T13:00:00.000Z',
    endsAt: '2026-05-20T18:00:00.000Z',
    status: 'available',
    notes: 'Disponible para keynote y entrevistas.'
  },
  {
    resourceType: 'speaker',
    resourceId: 2,
    resourceName: 'Claudia Russo',
    timezone: 'Europe/Rome',
    startsAt: '2026-06-15T12:00:00.000Z',
    endsAt: '2026-06-15T17:00:00.000Z',
    status: 'available',
    notes: 'Ventana reservable para taller y panel.'
  },
  {
    resourceType: 'venue',
    resourceId: 101,
    resourceName: 'Sala Principal',
    timezone: 'America/Bogota',
    startsAt: '2026-05-20T13:00:00.000Z',
    endsAt: '2026-05-20T22:00:00.000Z',
    status: 'available',
    notes: 'Sala habilitada para jornada completa.'
  },
  {
    resourceType: 'conference',
    resourceId: 2,
    resourceName: 'Observabilidad para plataformas de eventos',
    timezone: 'America/Bogota',
    startsAt: '2026-06-15T13:00:00.000Z',
    endsAt: '2026-06-15T15:00:00.000Z',
    status: 'reserved',
    notes: 'Bloque principal del evento.'
  }
]

const defaultConflicts = [
  {
    resourceType: 'speaker',
    resourceId: 1,
    resourceName: 'Giuseppe Moretti',
    startsAt: '2026-05-20T14:20:00.000Z',
    endsAt: '2026-05-20T15:10:00.000Z',
    severity: 'high',
    reason: 'Cruce entre keynote y entrevista programada'
  },
  {
    resourceType: 'venue',
    resourceId: 101,
    resourceName: 'Sala Principal',
    startsAt: '2026-05-20T15:00:00.000Z',
    endsAt: '2026-05-20T16:00:00.000Z',
    severity: 'medium',
    reason: 'Montaje tecnico y panel comparten la misma franja'
  }
]

const defaultMasterAgenda = [
  {
    eventType: 'conference',
    eventId: 1,
    title: 'Arquitectura de Microservicios con Node.js',
    timezone: 'America/Bogota',
    startsAt: '2026-05-20T14:00:00.000Z',
    endsAt: '2026-05-20T16:00:00.000Z',
    owner: 'conferencias-service',
    location: 'Sala Principal'
  },
  {
    eventType: 'conference',
    eventId: 2,
    title: 'Observabilidad para plataformas de eventos',
    timezone: 'America/Bogota',
    startsAt: '2026-06-15T13:00:00.000Z',
    endsAt: '2026-06-15T15:00:00.000Z',
    owner: 'conferencias-service',
    location: 'Auditorio A'
  }
]

module.exports = {
  defaultAvailabilities,
  defaultConflicts,
  defaultMasterAgenda
}
