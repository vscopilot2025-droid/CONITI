const speakerProfiles = [
  {
    fullName: 'Dra. Valentina Rojas',
    slug: 'dra-valentina-rojas',
    initials: 'VR',
    institution: 'Universidad de los Andes',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Bogota',
    expertise: ['innovacion', 'diseno de servicios', 'emprendimiento'],
    featured: true
  },
  {
    fullName: 'Dr. Matteo Bianchi',
    slug: 'dr-matteo-bianchi',
    initials: 'MB',
    institution: 'Politecnico di Torino',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Turin',
    expertise: ['software inteligente', 'arquitectura digital', 'datos'],
    featured: true
  },
  {
    fullName: 'Ing. Laura Mendoza',
    slug: 'ing-laura-mendoza',
    initials: 'LM',
    institution: 'Universidad Javeriana',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Bogota',
    expertise: ['infraestructura', 'ambiente', 'movilidad'],
    featured: true
  },
  {
    fullName: 'Dr. Santiago Alvarez',
    slug: 'dr-santiago-alvarez',
    initials: 'SA',
    institution: 'Universidad Nacional de Colombia',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Bogota',
    expertise: ['energia', 'renovables', 'sostenibilidad'],
    featured: true
  },
  {
    fullName: 'Dra. Camila Torres',
    slug: 'dra-camila-torres',
    initials: 'CT',
    institution: 'EAFIT',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Medellin',
    expertise: ['educacion en ingenieria', 'aprendizaje activo', 'stem'],
    featured: false
  },
  {
    fullName: 'Ing. Nicolas Herrera',
    slug: 'ing-nicolas-herrera',
    initials: 'NH',
    institution: 'Universidad del Norte',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Barranquilla',
    expertise: ['telecomunicaciones', 'redes', 'edge computing'],
    featured: false
  },
  {
    fullName: 'Dra. Isabella Romano',
    slug: 'dra-isabella-romano',
    initials: 'IR',
    institution: 'Universita di Bologna',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Bologna',
    expertise: ['materiales', 'energia limpia', 'industria 4.0'],
    featured: false
  },
  {
    fullName: 'Dr. Andres Cardenas',
    slug: 'dr-andres-cardenas',
    initials: 'AC',
    institution: 'Universidad del Rosario',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Bogota',
    expertise: ['gestion organizacional', 'estrategia', 'riesgo'],
    featured: false
  },
  {
    fullName: 'Dra. Sofia Martinez',
    slug: 'dra-sofia-martinez',
    initials: 'SM',
    institution: 'Tecnologico de Monterrey',
    country: 'Mexico',
    countryCode: 'MX',
    city: 'Monterrey',
    expertise: ['analitica', 'producto digital', 'innovacion abierta'],
    featured: false
  },
  {
    fullName: 'Ing. Daniel Prieto',
    slug: 'ing-daniel-prieto',
    initials: 'DP',
    institution: 'Universidad Industrial de Santander',
    country: 'Colombia',
    countryCode: 'CO',
    city: 'Bucaramanga',
    expertise: ['automatizacion', 'iot', 'mantenimiento predictivo'],
    featured: false
  },
  {
    fullName: 'Giuseppe Moretti',
    slug: 'giuseppe-moretti',
    initials: 'GM',
    institution: 'Politecnico di Milano',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Milan',
    expertise: ['robotica', 'sistemas autonomos', 'industria 4.0'],
    featured: true
  },
  {
    fullName: 'Claudia Russo',
    slug: 'claudia-russo',
    initials: 'CR',
    institution: 'Universita La Sapienza',
    country: 'Italia',
    countryCode: 'IT',
    city: 'Rome',
    expertise: ['inteligencia artificial', 'salud digital', 'biomedica'],
    featured: true
  }
]

const defaultSpeakers = speakerProfiles.map((speaker, index) => ({
  ...speaker,
  bio: `${speaker.fullName} lidera iniciativas de ${speaker.expertise[0]} y ${speaker.expertise[1]} con enfoque aplicado a los retos de CONIITI 2026.`,
  talks: [
    {
      title: `Perspectivas aplicadas en ${speaker.expertise[0]}`,
      abstract: `Sesion especializada para conectar ${speaker.expertise[0]} con escenarios reales de investigacion, industria y transferencia de conocimiento.`,
      topic: speaker.expertise[0],
      durationMinutes: 60 + ((index % 3) * 15)
    }
  ],
  eventLinks: []
}))

module.exports = {
  defaultSpeakers
}
