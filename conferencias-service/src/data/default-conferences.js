const thematicLines = [
  {
    category: 'Creativity, Innovation and Entrepreneurship',
    tags: ['innovacion', 'emprendimiento', 'diseno'],
    topics: [
      'Design thinking para retos de ingenieria',
      'Modelos de innovacion abierta universidad empresa',
      'Emprendimientos tecnologicos de alto impacto',
      'Gestion de propiedad intelectual aplicada',
      'Prototipado rapido para nuevos productos',
      'Comunidades creativas y transferencia tecnologica',
      'Innovacion social con enfoque territorial',
      'Estrategias de producto minimo viable',
      'Laboratorios vivos para ciudades universitarias',
      'Financiacion temprana para proyectos deep tech',
      'Creatividad computacional en equipos de ingenieria',
      'Gestion del ciclo de vida de productos innovadores',
      'Escalamiento de soluciones academicas al mercado'
    ]
  },
  {
    category: 'Infrastructure and Environment',
    tags: ['infraestructura', 'ambiente', 'ciudades'],
    topics: [
      'Infraestructura resiliente ante cambio climatico',
      'Materiales sostenibles para construccion urbana',
      'Gestion integral del recurso hidrico',
      'Movilidad urbana basada en datos',
      'Geotecnia aplicada a ciudades densas',
      'Control de contaminacion atmosferica',
      'Saneamiento y agua potable en territorios',
      'Prevencion de desastres con analitica predictiva',
      'Construccion modular y eficiencia operativa',
      'Hidrologia urbana para escenarios extremos',
      'Planeacion ambiental de campus inteligentes',
      'Ciudades sostenibles y gemelos digitales',
      'Gestion de residuos en obras de infraestructura'
    ]
  },
  {
    category: 'Energy Efficiency and Renewable Energy',
    tags: ['energia', 'renovables', 'sostenibilidad'],
    topics: [
      'Microredes renovables para instituciones educativas',
      'Almacenamiento energetico con inteligencia artificial',
      'Eficiencia energetica en edificios universitarios',
      'Mercados energeticos y nuevos modelos de negocio',
      'Electrificacion de procesos industriales',
      'Hidrogeno verde en cadenas productivas',
      'Reduccion de emisiones CO2 con IoT',
      'Gestion de demanda energetica en tiempo real',
      'Energia solar distribuida para comunidades',
      'Analitica predictiva en mantenimiento energetico',
      'Politicas de transicion energetica en Latinoamerica',
      'Integracion de vehiculos electricos a la red',
      'Auditorias energeticas basadas en datos'
    ]
  },
  {
    category: 'Intelligent Software and Technological Convergence',
    tags: ['software', 'ia', 'datos'],
    topics: [
      'Arquitecturas de software inteligente',
      'Machine learning para toma de decisiones',
      'Internet de las cosas en entornos academicos',
      'Analitica de datos para investigacion aplicada',
      'Cloud computing seguro para laboratorios',
      'Mineria de datos en procesos industriales',
      'Sistemas autonomos y robotica colaborativa',
      'Tutores inteligentes para educacion STEM',
      'Gobierno de datos e interoperabilidad',
      'Ciberseguridad en plataformas convergentes',
      'Vision por computador en inspeccion tecnica',
      'MLOps para proyectos de investigacion',
      'Software definido por datos para organizaciones'
    ]
  },
  {
    category: 'Integral and Dynamic Management of Organizations',
    tags: ['gestion', 'organizaciones', 'estrategia'],
    topics: [
      'Gestion del conocimiento en equipos de ingenieria',
      'Lean manufacturing y mejora continua',
      'Gestion de riesgos en proyectos tecnologicos',
      'Logistica inteligente para cadenas de suministro',
      'Responsabilidad social corporativa medible',
      'Prospectiva estrategica para organizaciones',
      'Gestion del cambio en transformacion digital',
      'Investigacion de operaciones aplicada',
      'Modelos de productividad con analitica',
      'Branding tecnologico para instituciones',
      'Portafolios de proyectos de innovacion',
      'Cultura organizacional basada en datos',
      'Decision multicriterio para directivos'
    ]
  },
  {
    category: 'Telecommunication Systems and Technologies',
    tags: ['telecomunicaciones', 'redes', 'conectividad'],
    topics: [
      'Redes 5G y aplicaciones industriales',
      'Radio cognitiva para espectro eficiente',
      'Antenas inteligentes en ciudades conectadas',
      'Drones y comunicaciones de baja latencia',
      'Internet futuro y arquitecturas descentralizadas',
      'Software defined networking en campus',
      'Sensado inalambrico para infraestructura',
      'Comunicaciones seguras en IoT masivo',
      'Redes privadas para industria 4.0',
      'Edge computing en servicios de telecomunicacion',
      'Calidad de servicio en aplicaciones criticas',
      'Satelites de baja orbita y conectividad rural',
      'Aplicaciones moviles sobre redes de nueva generacion'
    ]
  },
  {
    category: 'Engineering Education',
    tags: ['educacion', 'stem', 'aprendizaje'],
    topics: [
      'Aprendizaje basado en proyectos de ingenieria',
      'Evaluacion autentica en programas STEM',
      'Gamificacion para laboratorios virtuales',
      'Curriculos flexibles orientados a competencias',
      'Educacion inclusiva en facultades de ingenieria',
      'Acreditacion y mejora continua academica',
      'Mentorias para investigacion formativa',
      'Simuladores digitales para aprendizaje activo',
      'Estrategias de aula invertida en ingenieria',
      'Analitica de aprendizaje para permanencia',
      'Formacion docente en tecnologias emergentes',
      'Retos interdisciplinarios para estudiantes'
    ]
  }
]

const speakers = [
  'Dra. Valentina Rojas',
  'Dr. Matteo Bianchi',
  'Ing. Laura Mendoza',
  'Dr. Santiago Alvarez',
  'Dra. Camila Torres',
  'Ing. Nicolas Herrera',
  'Dra. Isabella Romano',
  'Dr. Andres Cardenas',
  'Dra. Sofia Martinez',
  'Ing. Daniel Prieto'
]

const rooms = ['Auditorio Principal', 'Sala Italia', 'Auditorio A', 'Sala de Innovacion', 'Laboratorio 4.0']
const modalities = ['onsite', 'hybrid', 'virtual']
const eventDays = ['2026-09-30', '2026-10-01', '2026-10-02']

function buildDateTime(dayKey, hour, minute = 0) {
  return `${dayKey}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-05:00`
}

function buildConference(line, lineIndex, topic, topicIndex) {
  const sequence = lineIndex * 13 + topicIndex + 1
  const dayKey = eventDays[(sequence - 1) % eventDays.length]
  const startsAtHour = 8 + (topicIndex % 8)
  const startsAt = buildDateTime(dayKey, startsAtHour)
  const endsAt = buildDateTime(dayKey, startsAtHour + 1, 20)
  const speaker = speakers[sequence % speakers.length]

  return {
    title: topic,
    description: `Sesion academica de la linea ${line.category}, orientada a casos reales, tendencias aplicadas y transferencia de conocimiento para CONIITI 2026.`,
    category: line.category,
    status: 'published',
    modality: modalities[sequence % modalities.length],
    timezone: 'America/Bogota',
    capacity: 120 + ((sequence % 6) * 30),
    availableSeats: 35 + ((sequence * 7) % 95),
    tags: [...line.tags, `linea-${lineIndex + 1}`, `conferencia-${String(sequence).padStart(2, '0')}`],
    startDate: startsAt,
    endDate: endsAt,
    agenda: [
      {
        title: 'Contexto y apertura',
        speaker: 'Comite Organizador CONIITI',
        startsAt,
        endsAt: buildDateTime(dayKey, startsAtHour, 15),
        room: rooms[sequence % rooms.length]
      },
      {
        title: topic,
        speaker,
        startsAt: buildDateTime(dayKey, startsAtHour, 15),
        endsAt,
        room: rooms[sequence % rooms.length]
      }
    ]
  }
}

const defaultConferences = thematicLines
  .flatMap((line, lineIndex) =>
    line.topics.map((topic, topicIndex) => buildConference(line, lineIndex, topic, topicIndex))
  )
  .slice(0, 90)

module.exports = {
  defaultConferences
}
