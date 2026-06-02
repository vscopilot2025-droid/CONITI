import { useEffect, useMemo, useState } from 'react'
import { GetMasterAgenda } from '../application/use-cases/GetMasterAgenda'
import { GetFeaturedSpeakers } from '../application/use-cases/GetFeaturedSpeakers'
import { GetPublishedConferences } from '../application/use-cases/GetPublishedConferences'
import { GetSpeakers } from '../application/use-cases/GetSpeakers'
import { HttpConferenceRepository } from '../infrastructure/repositories/HttpConferenceRepository'
import { apiConfig, buildApiUrl } from '../infrastructure/config/api'
import { HttpScheduleRepository } from '../infrastructure/repositories/HttpScheduleRepository'
import { HttpSpeakerRepository } from '../infrastructure/repositories/HttpSpeakerRepository'
import { AuthModal } from './components/AuthModal'

const authStorageKey = 'coniiti.auth'

function readStoredAuthSession() {
  const sessionValue = sessionStorage.getItem(authStorageKey)
  if (sessionValue) {
    return sessionValue
  }

  const legacyLocalValue = localStorage.getItem(authStorageKey)
  if (legacyLocalValue) {
    sessionStorage.setItem(authStorageKey, legacyLocalValue)
    localStorage.removeItem(authStorageKey)
    return legacyLocalValue
  }

  return null
}

function persistAuthSession(session) {
  sessionStorage.setItem(authStorageKey, JSON.stringify(session))
  localStorage.removeItem(authStorageKey)
}

function clearStoredAuthSession() {
  sessionStorage.removeItem(authStorageKey)
  localStorage.removeItem(authStorageKey)
}

const speakerRepository = new HttpSpeakerRepository()
const conferenceRepository = new HttpConferenceRepository()
const scheduleRepository = new HttpScheduleRepository()

const getFeaturedSpeakersUseCase = new GetFeaturedSpeakers(speakerRepository)
const getSpeakersUseCase = new GetSpeakers(speakerRepository)
const getPublishedConferencesUseCase = new GetPublishedConferences(conferenceRepository)
const getMasterAgendaUseCase = new GetMasterAgenda(scheduleRepository)

const defaultCommittee = [
  ['Ing. Jaime Díaz Ortiz', 'Oversight Committee', 'Decano Facultad de Ingeniería.'],
  ['Ing. Claudia Constanza Jiménez Carranza', 'Publication Chair', 'Directora CIFI.'],
  ['Esp. Jenny Paola Hernández Triana', 'General Chair', 'Coordinación general del congreso.'],
  ['Jefferson E. Paredes G.', 'Webmaster', 'Gestión y soporte de plataforma web.'],
  ['Cristian Bernal', 'Webmaster', 'Apoyo técnico y administración web.'],
  ['Universidad Católica de Colombia', 'Organized by', 'Facultad de Ingeniería y Centro de Investigación de la Facultad de Ingeniería.']
]

const defaultConferences = [
  {
    title: 'Conferencias magistrales',
    subtitle: 'Apertura internacional',
    description:
      'Sesiones centrales con expertos nacionales e internacionales sobre innovación, ingeniería, sostenibilidad y transformación digital.',
    action: 'Ver cronograma',
    actionClass: 'btn-reg-gold',
    target: 'cronograma'
  },
  {
    title: 'Talleres aplicados',
    subtitle: 'Experiencia práctica',
    description:
      'Espacios de trabajo orientados a prototipado, inteligencia artificial, datos, robótica, diseño e investigación aplicada.',
    action: 'Líneas temáticas',
    actionClass: 'btn-reg-outline',
    target: 'lineas'
  },
  {
    title: 'Paneles de discusión',
    subtitle: 'Academia e industria',
    description:
      'Conversatorios con investigadores, empresas y comunidad académica para conectar retos reales con soluciones de ingeniería.',
    action: 'Conferencistas',
    actionClass: 'btn-reg-teal',
    target: 'conferencistas'
  }
]

const defaultParticipationResources = [
  {
    title: 'Plantilla para presentaciones',
    subtitle: 'Material de apoyo',
    description: 'Acceso pendiente a la plantilla oficial para preparar la presentación de trabajos aceptados.'
  },
  {
    title: 'Plantilla Word formato IEEE',
    subtitle: 'Documento de envío',
    description: 'Formato base para preparar artículos siguiendo el estándar IEEE de conferencia.'
  }
]

const defaultTickets = [
  {
    key: 'speaker',
    audience: 'members',
    ticketType: 'Ponente UCatolica/IEEE',
    title: 'Miembros UCatolica e IEEE',
    subtitle: 'Inscripcion como ponente',
    price: '940.000',
    buttonClass: 'btn-reg-outline',
    features: [
      'Inscripcion como Ponente',
      'Constancia de participacion para todos los autores',
      'Publicacion de las memorias'
    ]
  },
  {
    key: 'speaker',
    audience: 'non-members',
    ticketType: 'Ponente externo',
    title: 'Si no eres miembro UCatolica o IEEE',
    subtitle: 'Inscripcion como ponente',
    price: '980.000',
    featured: true,
    buttonClass: 'btn-reg-gold',
    features: [
      'Inscripcion como Ponente',
      'Constancia de participacion para todos los autores',
      'Publicacion de las memorias'
    ]
  },
  {
    key: 'visitor',
    ticketType: 'Asistente conferencias',
    title: 'Si desea constancia por participacion en conferencias',
    subtitle: 'Certificado de asistencia',
    price: '120.000',
    buttonClass: 'btn-reg-outline',
    optional: true,
    features: [
      'Certificado de Asistencia'
    ]
  },
  {
    key: 'student',
    ticketType: 'Asistente workshops',
    title: 'Si desea constancia por participacion en workshops',
    subtitle: 'Certificado de asistencia',
    price: '90.000',
    buttonClass: 'btn-reg-teal',
    optional: true,
    features: [
      'Certificado de Asistencia'
    ]
  }
]

const ticketProfileLabels = {
  visitor: 'Visitante',
  speaker: 'Ponente',
  student: 'Estudiante'
}

const favoritesFilterKey = '__favorites__'

const initialContactFormState = {
  firstName: '',
  lastName: '',
  email: '',
  institution: '',
  inquiryType: '',
  message: ''
}

const topicGroups = [
  ['01', 'Creativity, Innovation and Entrepreneurship', ['Collaborative Design', 'Creativity and Design', 'Creative Communities', 'Creative Industries', 'Entrepreneurship', 'Innovation Management', 'Intellectual Property', 'New Product Development', 'Product Lifecycle Management', 'Social Innovation', 'Technology Transfer']],
  ['02', 'Infrastructure and Environment', ['Air Pollution Control', 'Building Materials', 'Climate Change', 'Construction Management', 'Disaster Prevention', 'Environmental Engineering', 'Geotechnics', 'Hydrology', 'Sustainable Cities', 'Urban Mobility', 'Water and Sanitation']],
  ['03', 'Energy Efficiency and Renewable Energy', ['Alternative Energies', 'Energy Storage and Artificial Intelligence', 'Energy Solutions', 'Energy Marketing', 'Innovative Energy Models', 'Process Electrification', 'Reduction of CO2 emissions']],
  ['04', 'Intelligent Software and Technological Convergence', ['Artificial Intelligence', 'Autonomous Systems', 'Big Data Analytics', 'Business Intelligence', 'Cloud Computing', 'Data Mining', 'Internet of Things', 'Machine Learning', 'Software Engineering', 'Smart Tutoring Systems']],
  ['05', 'Integral and Dynamic Management of Organizations', ['Branding', 'Change Management', 'Corporate Social Responsibility', 'Knowledge Management', 'Lean Manufacturing', 'Logistics Management', 'Operational Research', 'Project Management', 'Risk Management', 'Strategic Foresight']],
  ['06', 'Telecommunication Systems and Technologies', ['Apps and developments in Telecommunications', '4G, 5G and beyond', 'Antennas, smart antennas', 'Cognitive Radio', 'Drones, Applications and Regulation', 'Future Internet', 'Software Defined Networking', 'Software Defined Radio', 'Wireless Sensing Systems']],
  ['07', 'Engineering Education', ['Accreditation and certification of HEI and programs', 'Assessment in Education', 'Curriculum Development', 'Education in STEM', 'Educational Innovation', 'Gamification', 'Inclusive Education', 'Problem-Based Learning', 'Project-Based Learning', 'Teaching-learning strategies']]
]

const historyCards = [
  {
    year: '2015',
    title: 'Surge el I CONIITI',
    description:
      'Encuentro académico organizado por la Facultad de Ingeniería para compartir nuevas tendencias y herramientas que impulsaran la innovación en el país.',
    items: [
      'Software inteligente y convergencia tecnológica.',
      'Infraestructura y medio ambiente.',
      'Gestión integral y dinámica de organizaciones empresariales.'
    ]
  },
  {
    year: '2016',
    title: 'II CONIITI',
    description:
      'Realizado entre el 24 y el 26 de agosto de 2016 en Bogotá, con conferencias, ponencias, workshops y pósteres.',
    items: [
      'Creatividad, innovación y emprendimiento.',
      'Software inteligente y convergencia tecnológica.',
      'Infraestructura y medio ambiente.',
      'Gestión integral y dinámica de las organizaciones.'
    ]
  }
]

const contactItems = [
  ['bi-envelope', 'Correo electrónico', 'coniiti2026@ucatolica.edu.co'],
  ['bi-telephone', 'Teléfono', '+57 (601) 327 7300 Ext. 5000'],
  ['bi-geo-alt', 'Dirección', 'Av. Caracas #46-72, Bogotá D.C.'],
  ['bi-clock', 'Horario', 'Lun – Vie, 8:00 AM – 5:00 PM']
]

const contactOptions = [
  'Boleteria y acceso',
  'Ponencias y abstracts',
  'Patrocinio',
  'Prensa y medios',
  'Otra consulta'
]

function splitFullName(fullName) {
  const normalized = (fullName || '').trim()
  if (!normalized) {
    return { firstName: '', lastName: '' }
  }

  const parts = normalized.split(/\s+/)
  if (parts.length === 1) {
    return { firstName: parts[0], lastName: '' }
  }

  return {
    firstName: parts.slice(0, -1).join(' '),
    lastName: parts.slice(-1).join(' ')
  }
}

function getSpeakerCountryLabel(speaker) {
  return `${speaker.countryCode || ''} ${speaker.country || ''}`.trim()
}

function getSpeakerImageStyle(speaker, index) {
  if (index % 3 === 2) {
    return { background: 'linear-gradient(135deg,var(--cerulean),var(--ink))' }
  }

  if (speaker.featured) {
    return { background: 'linear-gradient(135deg,var(--ink),var(--ink-mid))' }
  }

  return undefined
}

function formatDateRange(startDate, endDate, timezone = 'UTC') {
  const start = new Date(startDate)
  const end = new Date(endDate)

  const formatter = new Intl.DateTimeFormat('es-CO', {
    day: '2-digit',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timezone
  })

  return `${formatter.format(start)} - ${formatter.format(end)}`
}

function formatAgendaTime(value, timezone = 'UTC') {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: timezone
  }).format(new Date(value))
}

function normalizeSpeakerKey(value) {
  return (value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildSpeakerDirectory(speakers) {
  const directory = new Map()
  speakers.forEach((speaker) => {
    directory.set(normalizeSpeakerKey(speaker.fullName), speaker)
  })
  return directory
}

function getConferenceLeadAgendaItem(conference) {
  if (!conference?.agenda?.length) {
    return null
  }

  return conference.agenda.find((item) => item.title === conference.title) || conference.agenda[conference.agenda.length - 1]
}

function enrichConference(conference, speakerDirectory) {
  const leadAgendaItem = getConferenceLeadAgendaItem(conference)
  const speaker = leadAgendaItem ? speakerDirectory.get(normalizeSpeakerKey(leadAgendaItem.speaker)) : null

  return {
    ...conference,
    leadAgendaItem,
    leadSpeaker: speaker || null,
    leadSpeakerName: speaker?.fullName || leadAgendaItem?.speaker || 'Conferencista por confirmar',
    leadSpeakerSlug: speaker?.slug || null,
    leadSpeakerInstitution: speaker?.institution || '',
    room: leadAgendaItem?.room || 'Sala por confirmar',
    metaLabel: `${formatDateRange(conference.startDate, conference.endDate, conference.timezone)} · ${conference.availableSeats} cupos`,
    subtitle: `${conference.category} · ${conference.modality}`,
    dateKey: conference.startDate.slice(0, 10)
  }
}

function hydrateScheduleDays(days, speakers) {
  if (!days.length) {
    return []
  }

  const speakerDirectory = buildSpeakerDirectory(speakers)

  return days.map((day) => ({
    ...day,
    entries: (day.entries || [])
      .map((entry) => {
        const speaker = entry.leadSpeakerName
          ? speakerDirectory.get(normalizeSpeakerKey(entry.leadSpeakerName))
          : null

        return {
          ...entry,
          leadSpeaker: speaker || null,
          leadSpeakerSlug: speaker?.slug || null,
          leadSpeakerInstitution: speaker?.institution || '',
          dateKey: day.id
        }
      })
      .sort((left, right) => new Date(left.startDate) - new Date(right.startDate))
  }))
}

function getConferenceLineLabel(category) {
  const labels = {
    'Creativity, Innovation and Entrepreneurship': 'Innovación y emprendimiento',
    'Infrastructure and Environment': 'Infraestructura y ambiente',
    'Energy Efficiency and Renewable Energy': 'Energía y renovables',
    'Intelligent Software and Technological Convergence': 'Software inteligente',
    'Integral and Dynamic Management of Organizations': 'Gestión organizacional',
    'Telecommunication Systems and Technologies': 'Telecomunicaciones',
    'Engineering Education': 'Educación en ingeniería'
  }

  return labels[category] || category
}

function getFallbackConferenceCategories() {
  return topicGroups.map(([, category]) => category)
}

function SimpleFooter({ dark = false, full = false }) {
  return (
    <footer className={`site-footer${full ? ' home-footer' : ''}`} style={dark ? { background: '#0a0a0a' } : undefined}>
      <div className={`container${full ? ' footer-shell' : ''}`} style={full ? undefined : { maxWidth: 1200 }}>
        {full ? (
          <>
            <div className="columns is-variable is-6">
              <div className="column is-3-desktop">
                <div className="footer-brand">CONIITI</div>
                <div style={{ display: 'flex', gap: 3, margin: '10px 0' }}>
                  <div style={{ width: 22, height: 10, background: '#009246' }} />
                  <div style={{ width: 22, height: 10, background: '#fff', opacity: 0.5 }} />
                  <div style={{ width: 22, height: 10, background: '#ce2b37' }} />
                </div>
                <p className="footer-brand-sub">Congreso Internacional de Innovación y Tendencias en Ingeniería. Universidad Católica de Colombia · 2026</p>
              </div>
              <div className="column is-2-desktop">
                <p className="footer-col-title">Inicio</p>
                <a className="footer-item">Fechas</a>
                <a className="footer-item">Cuenta regresiva</a>
                <a className="footer-item">Conferencistas</a>
                <a className="footer-item">País invitado</a>
                <a className="footer-item">Ubicación</a>
              </div>
              <div className="column is-2-desktop">
                <p className="footer-col-title">Congreso</p>
                <a className="footer-item">Conferencias</a>
                <a className="footer-item">Cronograma</a>
                <a className="footer-item">Conferencistas</a>
                <a className="footer-item">Nosotros</a>
                <a className="footer-item">Contacto</a>
              </div>
              <div className="column is-2-desktop">
                <p className="footer-col-title">Institucional</p>
                <a className="footer-item">Universidad Católica</a>
                <a className="footer-item">Política de privacidad</a>
                <a className="footer-item">Términos y condiciones</a>
                <a className="footer-item">Preguntas frecuentes</a>
              </div>
              <div className="column is-3-desktop footer-map-column">
                <div className="footer-map-wrap">
                  <div className="map-info-card footer-map-card">
                    <span className="map-pin-icon">📍</span>
                    <h3>Universidad Católica de Colombia</h3>
                    <p>Av. Caracas #46-72, Bogotá D.C.<br />Edificio El Claustro — Bloque L<br /><br />Acceso fácil en transporte público.</p>
                    <a href="https://maps.app.goo.gl/1cVbbtcHSBKMEGgx8" target="_blank" rel="noreferrer" className="map-link">
                      <i className="bi bi-map" /> Abrir en Google Maps
                    </a>
                  </div>
                </div>
              </div>
            </div>
            <hr className="footer-divider" />
          </>
        ) : null}
        <div className="is-flex is-justify-content-space-between is-flex-wrap-wrap" style={{ gap: 12 }}>
          <p className="footer-copy mb-0">{full ? '© 2026 CONIITI — Universidad Católica de Colombia. Todos los derechos reservados.' : '© 2026 CONIITI — Universidad Católica de Colombia.'}</p>
          <p className="footer-motto mb-0">Con il cuore in Italia 🇮🇹</p>
        </div>
      </div>
    </footer>
  )
}

function HomePage({ featuredSpeakers, currentHomeSlide, onHomeSlide, countdown, onOpenAuth, onNavigate }) {
  const nextSlide = () => onHomeSlide((currentHomeSlide + 1) % 2)
  const prevSlide = () => onHomeSlide(currentHomeSlide === 0 ? 1 : currentHomeSlide - 1)

  return (
    <div className="page active" id="page-inicio">
      <section className="home-showcase" id="sec-home-showcase">
        <div className="showcase-track" style={{ transform: `translateX(-${currentHomeSlide * 100}%)` }}>
          <article className="showcase-slide">
            <section className="hero hero-slide">
              <div className="hero-stripe">
                <div style={{ background: '#009246' }} />
                <div style={{ background: '#ffffff', opacity: 0.6 }} />
                <div style={{ background: '#ce2b37' }} />
              </div>
              <div className="hero-grid" />
              <div className="hero-noise" />
              <div className="glow glow-gold" />
              <div className="glow glow-teal" />
              <div className="hero-bg-text">CONIITI</div>

              <div className="container hero-shell" style={{ width: '100%', maxWidth: 1380, padding: '0 60px', position: 'relative', zIndex: 2 }}>
                <div className="columns is-vcentered hero-columns" style={{ minHeight: 'calc(100vh - 180px)', paddingTop: 60 }}>
                  <div className="column is-8-widescreen is-10-desktop">
                    <div className="hero-overline">
                      <span className="hero-overline-bar" />
                      <span className="hero-overline-text">Universidad Católica de Colombia · XI Edición</span>
                    </div>

                    <h1 className="hero-title">CONIITI</h1>
                    <span className="hero-title-ghost">2026</span>

                    <p className="hero-tagline">
                      Congreso Internacional de Innovación y Tendencias en Ingeniería — donde la ciencia, la tecnología y el futuro convergen.
                    </p>

                    <div className="hero-actions">
                      <span className="btn-primary" onClick={() => onOpenAuth()} style={{ cursor: 'pointer' }}>
                        <i className="bi bi-ticket-perforated" /> Adquirir Boleta
                      </span>
                      <span className="btn-secondary" onClick={() => onNavigate('cronograma')} style={{ cursor: 'pointer' }}>
                        <i className="bi bi-play-circle" /> Ver cronograma
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="hero-sidebar">
                <div className="hero-sidebar-item">
                  <div className="hero-sidebar-label">Fecha</div>
                  <div className="hero-sidebar-val">30 Sep - 02 Oct</div>
                </div>
                <div className="hero-sidebar-item">
                  <div className="hero-sidebar-label">Sede</div>
                  <div className="hero-sidebar-val">Bogotá D.C.</div>
                </div>
                <div className="hero-sidebar-item">
                  <div className="hero-sidebar-label">País invitado</div>
                  <div className="hero-sidebar-val">🇮🇹 Italia</div>
                </div>
                <div className="hero-sidebar-item">
                  <div className="hero-sidebar-label">Edición</div>
                  <div className="hero-sidebar-val">XI · Undécima</div>
                </div>
              </div>

              <div className="stats-band home-stats-band" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <div className="columns is-gapless mb-0">
                  <div className="column"><div className="stat-unit"><span className="stat-num">{featuredSpeakers.length || 48}</span><span className="stat-lbl">Conferencistas</span></div></div>
                  <div className="column"><div className="stat-unit"><span className="stat-num">12</span><span className="stat-lbl">Países</span></div></div>
                  <div className="column"><div className="stat-unit"><span className="stat-num">7</span><span className="stat-lbl">Lineas tematicas</span></div></div>
                  <div className="column"><div className="stat-unit"><span className="stat-num">3</span><span className="stat-lbl">Días</span></div></div>
                  <div className="column"><div className="stat-unit"><span className="stat-num">+800</span><span className="stat-lbl">Asistentes</span></div></div>
                </div>
              </div>
            </section>
          </article>

          <article className="showcase-slide">
            <section className="sec-pais home-country-showcase" id="sec-pais">
              <div className="pais-bg">
                <div style={{ background: '#009246' }} />
                <div style={{ background: '#ffffff' }} />
                <div style={{ background: '#ce2b37' }} />
              </div>
              <div className="pais-veil" />
              <div className="pais-orbit pais-orbit-one" />
              <div className="pais-orbit pais-orbit-two" />
              <div className="container pais-content" style={{ maxWidth: 1200, padding: '80px 40px' }}>
                <div className="columns">
                  <div className="column is-7-widescreen is-9-desktop" data-anim="fade-right">
                    <span className="section-eyebrow eyebrow-gold">País invitado · 2026</span>
                    <h2 className="pais-giant">
                      Italia
                      <span className="pais-em">La República Italiana</span>
                    </h2>
                    <p className="pais-desc">
                      Italia, cuna del Renacimiento y la innovación, llega a CONIITI 2026 trayendo su legado de excelencia en diseño, ingeniería y ciencia para inspirar a la próxima generación de ingenieros latinoamericanos.
                    </p>
                    <div className="pais-chips">
                      <span className="pais-chip">Politecnico di Milano</span>
                      <span className="pais-chip">Università di Bologna</span>
                      <span className="pais-chip">Sapienza Roma</span>
                      <span className="pais-chip">Robótica</span>
                      <span className="pais-chip">Diseño Industrial</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="country-scroll-cue">
                <span>Continúa explorando</span>
              </div>
            </section>
          </article>
        </div>

        <div className="showcase-controls" aria-label="Destacados de inicio">
          <button className="showcase-arrow" type="button" aria-label="Slide anterior" onClick={prevSlide}>
            <span aria-hidden="true">←</span>
          </button>
          <button className="showcase-arrow" type="button" aria-label="Siguiente slide" onClick={nextSlide}>
            <span aria-hidden="true">→</span>
          </button>
        </div>
      </section>

      <hr className="divider-line" />

      <section className="sec-fechas" id="sec-fechas">
        <div className="container" style={{ maxWidth: 1180 }}>
          <div className="columns is-variable is-8 is-desktop">
            <div className="column is-6-desktop" data-anim="fade-right">
              <span className="section-eyebrow eyebrow-cerulean">Calendario académico</span>
              <h2 className="section-title">Fechas<br /><em>importantes</em></h2>
              <div className="gold-rule" style={{ marginBottom: 48 }} />
              {[
                ['15', 'Ago', 'Cierre de envío de resúmenes', 'Fecha límite para el envío de abstracts y propuestas de ponencia al comité científico.'],
                ['05', 'Sep', 'Notificación de aceptación', 'El comité revisor comunicará los resultados de evaluación a los autores postulantes.'],
                ['20', 'Sep', 'Cierre de boletería con descuento', 'Precio reducido disponible hasta esta fecha. Luego aplica tarifa regular.'],
                ['30', 'Sep', 'Entrega de artículos completos', 'Fecha límite para cargar las versiones definitivas de los artículos aceptados.'],
                ['30', 'Sep', 'Inauguracion del Congreso', 'Apertura oficial de CONIITI 2026 en la Universidad Catolica de Colombia, Bogota.']
              ].map(([day, month, title, desc], index) => (
                <div className="fecha-item" key={title} data-anim="fade-up" data-anim-delay={60 + index * 50}>
                  <div className="fecha-date"><span className="fecha-day" style={index === 4 ? { color: 'var(--gold)' } : undefined}>{day}</span><span className="fecha-month">{month}</span></div>
                  <div>
                    <div className="fecha-title">{title}</div>
                    <p className="fecha-desc">{desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="column is-6-desktop home-timeline-column" data-anim="fade-left" data-anim-delay="100" style={{ paddingTop: 320 }}>
              <div className="timeline-card">
                <p className="tl-head">Línea de tiempo 2026</p>
                <div className="tl-list">
                  {[
                    ['Agosto 2026', 'Convocatoria abierta', true],
                    ['Septiembre 2026', 'Evaluación y selección de ponencias'],
                    ['1 - 29 Sep 2026', 'Registro de asistentes'],
                    ['30 Sep - 02 Oct 2026', 'Congreso CONIITI 2026'],
                    ['Noviembre 2026', 'Publicación de memorias oficiales']
                  ].map(([date, text, active]) => (
                    <div className="tl-entry" key={date}>
                      <div className={`tl-dot${active ? ' active' : ''}`} />
                      <div><div className="tl-date">{date}</div><div className="tl-text">{text}</div></div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <hr className="divider-line" />

      <section className="sec-countdown" id="sec-countdown">
        <div className="container" style={{ maxWidth: 1100, position: 'relative', zIndex: 1 }}>
          <div className="has-text-centered mb-6" data-anim="fade-up">
            <span className="section-eyebrow eyebrow-ash">Tiempo restante</span>
            <h2 className="section-title" style={{ color: '#fff' }}>El congreso<br /><em style={{ color: 'var(--gold-light)' }}>comienza en</em></h2>
          </div>
          <div className="cd-row" data-anim="fade-up" data-anim-delay="60">
            <div className="cd-card" data-anim="zoom-in"><span className="cd-number">{countdown.days}</span><span className="cd-label">Días</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-card" data-anim="zoom-in" data-anim-delay="80"><span className="cd-number">{countdown.hours}</span><span className="cd-label">Horas</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-card" data-anim="zoom-in" data-anim-delay="160"><span className="cd-number">{countdown.minutes}</span><span className="cd-label">Minutos</span></div>
            <span className="cd-sep">:</span>
            <div className="cd-card" data-anim="zoom-in" data-anim-delay="240"><span className="cd-number">{countdown.seconds}</span><span className="cd-label">Segundos</span></div>
          </div>
          <p className="has-text-centered mt-5" style={{ fontFamily: 'var(--font-title)', fontStyle: 'italic', color: 'rgba(255,255,255,0.28)', fontSize: '.95rem' }} data-anim="fade-up" data-anim-delay="300">
            Bogota D.C., Colombia · 30 de septiembre, 1 y 2 de octubre de 2026
          </p>
        </div>
      </section>

      <hr className="divider-line" />

      <section className="sec-speakers" id="sec-speakers">
        <div className="container" style={{ maxWidth: 1260 }}>
          <div className="columns is-vcentered mb-6">
            <div className="column" data-anim="fade-right">
              <span className="section-eyebrow eyebrow-gold">Ponentes internacionales</span>
              <h2 className="section-title" style={{ color: '#fff' }}>Conferencistas<br /><em>invitados</em></h2>
              <div className="gold-rule" />
            </div>
            <div className="column is-narrow" data-anim="fade-left">
              <span className="btn-secondary" onClick={() => onNavigate('conferencistas')} style={{ cursor: 'pointer' }}>
                Ver todos <i className="bi bi-arrow-right ms-2" />
              </span>
            </div>
          </div>
          <div className="columns is-variable is-3 home-speakers-desktop">
            {featuredSpeakers.slice(0, 4).map((speaker, index) => (
              <div className="column is-6-tablet is-3-desktop" data-anim="fade-up" data-anim-delay={index * 80} key={`desktop-${speaker.slug || speaker.fullName}`}>
                <div className="speaker-card">
                  <div className="speaker-img" style={getSpeakerImageStyle(speaker, index)}><span className="speaker-initials">{speaker.initials}</span></div>
                  <div className="speaker-info">
                    <span className="speaker-name">{speaker.fullName}</span>
                    <span className="speaker-role">{speaker.institution}</span>
                    <p className="speaker-bio">{speaker.bio}</p>
                    <span className="speaker-country">{getSpeakerCountryLabel(speaker)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="home-speakers-grid home-speakers-mobile">
            {featuredSpeakers.slice(0, 4).map((speaker, index) => (
              <article className="home-speaker-card" data-anim="fade-up" data-anim-delay={index * 80} key={`mobile-${speaker.slug || speaker.fullName}`}>
                <span className="home-speaker-kicker">Invitado</span>
                <h3 className="home-speaker-name">{speaker.fullName}</h3>
                <p className="home-speaker-institution">{speaker.institution}</p>
                <span className="home-speaker-country">{getSpeakerCountryLabel(speaker)}</span>
              </article>
            ))}
          </div>
        </div>
      </section>

      <SimpleFooter full />
    </div>
  )
}

function ConferencesPage({
  conferenceCards,
  conferenceCategories,
  selectedCategory,
  onCategoryChange,
  onOpenSchedule,
  speakers,
  onOpenSpeaker,
  favoriteConferenceIds,
  favoriteActionId,
  onToggleFavorite,
  isLoading = false
}) {
  const conferencesPerPage = 4
  const [conferenceSearch, setConferenceSearch] = useState('')
  const [conferencePage, setConferencePage] = useState(1)
  const speakerDirectory = useMemo(() => buildSpeakerDirectory(speakers), [speakers])
  const favoriteIdSet = useMemo(() => new Set(favoriteConferenceIds), [favoriteConferenceIds])
  const filteredConferences = useMemo(() => {
    const query = conferenceSearch.trim().toLowerCase()

    return conferenceCards
      .map((conference) => enrichConference(conference, speakerDirectory))
      .filter((conference) => {
        if (selectedCategory !== favoritesFilterKey) {
          return true
        }

        return favoriteIdSet.has(conference.id)
      })
      .filter((conference) => {
      const searchableText = [
        conference.title,
        conference.subtitle,
        conference.description,
        conference.metaLabel,
        conference.leadSpeakerName,
        conference.leadSpeakerInstitution
      ].join(' ').toLowerCase()

      return !query || searchableText.includes(query)
    })
  }, [conferenceCards, conferenceSearch, favoriteIdSet, selectedCategory, speakerDirectory])
  const selectedLineLabel = selectedCategory === favoritesFilterKey
    ? 'Favoritos'
    : getConferenceLineLabel(selectedCategory)
  const totalConferencePages = Math.max(1, Math.ceil(filteredConferences.length / conferencesPerPage))
  const visibleConferenceCount = Math.min(conferencesPerPage, filteredConferences.length)
  const conferencePageStart = filteredConferences.length ? (conferencePage - 1) * conferencesPerPage + 1 : 0
  const conferencePageEnd = filteredConferences.length
    ? Math.min(conferencePageStart + visibleConferenceCount - 1, filteredConferences.length)
    : 0
  const hasConferencePagination = filteredConferences.length > conferencesPerPage
  const conferencePageNumbers = Array.from({ length: totalConferencePages }, (_, pageIndex) => pageIndex + 1)
  const paginatedConferences = filteredConferences.slice(
    (conferencePage - 1) * conferencesPerPage,
    conferencePage * conferencesPerPage
  )

  useEffect(() => {
    setConferencePage(1)
  }, [selectedCategory, conferenceSearch])

  useEffect(() => {
    if (conferencePage > totalConferencePages) {
      setConferencePage(totalConferencePages)
    }
  }, [conferencePage, totalConferencePages])

  return (
    <div className="page active" id="page-conferencias">
      <div className="page-band" data-bg="CONFERENCIAS">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Programa académico</span>
          <h1>Conferencias</h1>
        </div>
      </div>

      <div className="conference-directory-shell">
        <div className="conference-directory-inner">
          <aside className="conference-sidebar">
            <span className="section-eyebrow eyebrow-gold">Líneas temáticas</span>
            <div className="conference-line-list" aria-label="Líneas temáticas">
              <button
                type="button"
                className={`conference-line-row${selectedCategory === favoritesFilterKey ? ' active' : ''}`}
                onClick={() => onCategoryChange(favoritesFilterKey)}
              >
                <span>★</span>
                Favoritos
              </button>
              {conferenceCategories.map((category, index) => (
                <button
                  type="button"
                  className={`conference-line-row${selectedCategory === category ? ' active' : ''}`}
                  onClick={() => onCategoryChange(category)}
                  key={category}
                >
                  <span>{String(index + 1).padStart(2, '0')}</span>
                  {getConferenceLineLabel(category)}
                </button>
              ))}
            </div>
          </aside>

          <div className="conference-directory-main">
            <div className="conference-directory-toolbar">
              <div className="conference-control-copy">
                <span className="section-eyebrow eyebrow-cerulean">Catálogo académico</span>
                <h2>{selectedLineLabel}</h2>
                <p>
                  {isLoading
                    ? 'Cargando conferencias'
                    : `Mostrando ${conferencePageStart}-${conferencePageEnd} de ${filteredConferences.length} conferencias`}
                </p>
              </div>

              <div className="conference-search-box">
                <i className="bi bi-search" />
                <input
                  aria-label="Buscar conferencia"
                  type="search"
                  value={conferenceSearch}
                  onChange={(event) => setConferenceSearch(event.target.value)}
                  placeholder="Buscar por título, modalidad o tema"
                />
              </div>
            </div>

            {filteredConferences.length ? (
              <div className="conference-pagination-summary">
                <span>Página {conferencePage} de {totalConferencePages}</span>
                <span>{visibleConferenceCount} conferencias por vista</span>
              </div>
            ) : null}

            {hasConferencePagination ? (
              <div className="conference-pagination compact" aria-label="Paginación superior de conferencias">
                <button
                  type="button"
                  className="conference-page-btn"
                  disabled={conferencePage === 1}
                  onClick={() => setConferencePage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </button>

                <div className="conference-page-list">
                  {conferencePageNumbers.map((pageNumber) => (
                    <button
                      type="button"
                      className={`conference-page-btn number${conferencePage === pageNumber ? ' active' : ''}`}
                      onClick={() => setConferencePage(pageNumber)}
                      key={`top-${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="conference-page-btn"
                  disabled={conferencePage === totalConferencePages}
                  onClick={() => setConferencePage((current) => Math.min(totalConferencePages, current + 1))}
                >
                  Siguiente
                </button>
              </div>
            ) : null}

            <div className="conference-table" aria-live="polite">
              {paginatedConferences.map((conference, index) => (
                <details className="conference-table-row expandable" key={`${conference.slug || conference.title}-${index}`}>
                  <summary className="conference-row-summary">
                    <div className="conference-row-index">{String(conferencePageStart + index).padStart(2, '0')}</div>
                    <div className="conference-row-body">
                      <div className="conference-row-kicker">{conference.subtitle}</div>
                      <div className="conference-row-title">
                        {conference.title}
                        {favoriteIdSet.has(conference.id) ? (
                          <span className="conference-favorite-mark" aria-label="Favorita">★</span>
                        ) : null}
                      </div>
                      <p>{conference.description}</p>
                      <div className="conference-row-meta">{conference.metaLabel}</div>
                    </div>
                    <div className="conference-row-action muted">Ver detalle</div>
                  </summary>

                  <div className="conference-row-panel">
                    <div className="conference-row-panel-grid">
                      <div>
                        <span className="conference-panel-label">Conferencista</span>
                        <div className="conference-panel-value">{conference.leadSpeakerName}</div>
                        {conference.leadSpeakerInstitution ? (
                          <div className="conference-panel-subtle">{conference.leadSpeakerInstitution}</div>
                        ) : null}
                      </div>
                      <div>
                        <span className="conference-panel-label">Horario</span>
                        <div className="conference-panel-value">{formatDateRange(conference.startDate, conference.endDate, conference.timezone)}</div>
                        <div className="conference-panel-subtle">{conference.room}</div>
                      </div>
                      <div>
                        <span className="conference-panel-label">Etiquetas</span>
                        <div className="conference-chip-row">
                          {(conference.tags || []).slice(0, 4).map((tag) => (
                            <span className="conference-chip" key={tag}>{tag}</span>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="conference-row-panel-actions">
                      <button
                        type="button"
                        className={`conference-inline-link${favoriteIdSet.has(conference.id) ? ' primary' : ''}`}
                        disabled={favoriteActionId === conference.id}
                        onClick={() => onToggleFavorite(conference.id)}
                      >
                        {favoriteIdSet.has(conference.id) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      </button>
                      <button type="button" className="conference-inline-link" onClick={() => onOpenSchedule(conference)}>
                        Ver en cronograma
                      </button>
                      {conference.leadSpeakerSlug ? (
                        <button type="button" className="conference-inline-link primary" onClick={() => onOpenSpeaker(conference.leadSpeakerSlug)}>
                          Ver conferencista
                        </button>
                      ) : null}
                    </div>
                  </div>
                </details>
              ))}
            </div>

            {!filteredConferences.length ? (
              <div className="conference-empty-state">
                <span className="section-eyebrow eyebrow-gold">Sin resultados</span>
                <h3>No encontramos resultados para esta búsqueda</h3>
              </div>
            ) : null}

            {hasConferencePagination ? (
              <div className="conference-pagination" aria-label="Paginación de conferencias">
                <button
                  type="button"
                  className="conference-page-btn"
                  disabled={conferencePage === 1}
                  onClick={() => setConferencePage((current) => Math.max(1, current - 1))}
                >
                  Anterior
                </button>

                <div className="conference-page-list">
                  {conferencePageNumbers.map((pageNumber) => (
                    <button
                      type="button"
                      className={`conference-page-btn number${conferencePage === pageNumber ? ' active' : ''}`}
                      onClick={() => setConferencePage(pageNumber)}
                      key={`bottom-${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="conference-page-btn"
                  disabled={conferencePage === totalConferencePages}
                  onClick={() => setConferencePage((current) => Math.min(totalConferencePages, current + 1))}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function SpeakersPage({ speakers, selectedSpeakerSlug, onOpenConference }) {
  const speakersPerPage = 6
  const [speakerSearch, setSpeakerSearch] = useState('')
  const [speakerPage, setSpeakerPage] = useState(1)
  const filteredSpeakers = useMemo(() => {
    const query = speakerSearch.trim().toLowerCase()
    const sorted = [...speakers].sort((left, right) => {
      if (left.slug === selectedSpeakerSlug) return -1
      if (right.slug === selectedSpeakerSlug) return 1
      if (left.featured !== right.featured) return left.featured ? -1 : 1
      return left.fullName.localeCompare(right.fullName)
    })

    return sorted.filter((speaker) => {
      const searchableText = [
        speaker.fullName,
        speaker.institution,
        speaker.bio,
        ...(speaker.expertise || [])
      ].join(' ').toLowerCase()

      return !query || searchableText.includes(query)
    })
  }, [selectedSpeakerSlug, speakerSearch, speakers])
  const totalSpeakerPages = Math.max(1, Math.ceil(filteredSpeakers.length / speakersPerPage))
  const paginatedSpeakers = filteredSpeakers.slice((speakerPage - 1) * speakersPerPage, speakerPage * speakersPerPage)

  useEffect(() => {
    setSpeakerPage(1)
  }, [speakerSearch])

  useEffect(() => {
    if (!selectedSpeakerSlug) {
      return
    }

    const targetIndex = filteredSpeakers.findIndex((speaker) => speaker.slug === selectedSpeakerSlug)
    if (targetIndex >= 0) {
      setSpeakerPage(Math.floor(targetIndex / speakersPerPage) + 1)
    }
  }, [filteredSpeakers, selectedSpeakerSlug])

  return (
    <div className="page active" id="page-conferencistas" style={{ background: 'var(--ink)' }}>
      <div className="page-band" data-bg="PONENTES">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Invitados principales</span>
          <h1>Conferencistas</h1>
        </div>
      </div>

      <div className="py-6" style={{ background: 'var(--ink)' }}>
        <div className="container" style={{ maxWidth: 1260 }}>
          <div className="speaker-directory-header">
            <div>
              <span className="section-eyebrow eyebrow-gold">Directorio académico</span>
              <h2 className="speaker-directory-title">{filteredSpeakers.length} perfiles disponibles</h2>
            </div>
            <div className="speaker-search-box">
              <i className="bi bi-search" />
              <input
                aria-label="Buscar conferencista"
                type="search"
                value={speakerSearch}
                onChange={(event) => setSpeakerSearch(event.target.value)}
                placeholder="Buscar por nombre, institución o expertise"
              />
            </div>
          </div>

          <div className="columns is-variable is-3 is-multiline">
            {paginatedSpeakers.map((speaker, index) => (
              <div className="column is-6-tablet is-4-desktop" key={speaker.slug || speaker.fullName}>
                <details className={`speaker-card detailed${speaker.slug === selectedSpeakerSlug ? ' highlighted' : ''}`} open={speaker.slug === selectedSpeakerSlug}>
                  <summary className="speaker-card-summary">
                    <div className="speaker-img" style={getSpeakerImageStyle(speaker, index)}><span className="speaker-initials">{speaker.initials}</span></div>
                    <div className="speaker-info">
                      <span className="speaker-name">{speaker.fullName}</span>
                      <span className="speaker-role">{speaker.institution}</span>
                      <p className="speaker-bio">{speaker.bio}</p>
                      <span className="speaker-country">{getSpeakerCountryLabel(speaker)}</span>
                    </div>
                  </summary>

                  <div className="speaker-card-panel">
                    <div className="speaker-expertise-row">
                      {(speaker.expertise || []).map((item) => (
                        <span className="speaker-chip" key={item}>{item}</span>
                      ))}
                    </div>

                    {(speaker.talks || []).length ? (
                      <div className="speaker-talk-list">
                        {speaker.talks.map((talk) => (
                          <article className="speaker-talk-item" key={talk.title}>
                            <h4>{talk.title}</h4>
                            <p>{talk.abstract}</p>
                          </article>
                        ))}
                      </div>
                    ) : null}

                    {(speaker.eventLinks || []).length ? (
                      <div className="speaker-event-links">
                        {speaker.eventLinks.slice(0, 3).map((eventLink) => (
                          <button
                            type="button"
                            className="conference-inline-link"
                            onClick={() => onOpenConference(eventLink.conferenceId, eventLink.scheduledAt)}
                            key={`${speaker.slug}-${eventLink.id}`}
                          >
                            {eventLink.conferenceTitle}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </details>
              </div>
            ))}
          </div>

          {filteredSpeakers.length > speakersPerPage ? (
            <div className="conference-pagination speaker-pagination" aria-label="Paginación de conferencistas">
              <button
                type="button"
                className="conference-page-btn"
                disabled={speakerPage === 1}
                onClick={() => setSpeakerPage((current) => Math.max(1, current - 1))}
              >
                Anterior
              </button>
              <div className="conference-page-list">
                {Array.from({ length: totalSpeakerPages }, (_, index) => index + 1).map((pageNumber) => (
                  <button
                    type="button"
                    className={`conference-page-btn number${speakerPage === pageNumber ? ' active' : ''}`}
                    onClick={() => setSpeakerPage(pageNumber)}
                    key={`speaker-page-${pageNumber}`}
                  >
                    {pageNumber}
                  </button>
                ))}
              </div>
              <button
                type="button"
                className="conference-page-btn"
                disabled={speakerPage === totalSpeakerPages}
                onClick={() => setSpeakerPage((current) => Math.min(totalSpeakerPages, current + 1))}
              >
                Siguiente
              </button>
            </div>
          ) : null}
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function CommitteePage() {
  return (
    <div className="page active" id="page-comite">
      <div className="page-band" data-bg="COMITÉ">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Equipo CONIITI</span>
          <h1>Comité</h1>
        </div>
      </div>

      <div className="container py-6" style={{ maxWidth: 1180 }}>
        <div className="columns is-variable is-4 is-multiline">
          {defaultCommittee.map(([name, role, description], index) => (
            <div className="column is-4-desktop" data-anim="fade-up" data-anim-delay={(index % 3) * 100} key={name}>
              <div className="boleta-card">
                <div className="boleta-name">{name}</div>
                <div className="boleta-for">{role}</div>
                <p className="acerca-lead" style={{ fontSize: '1rem' }}>{description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function ParticipationPage({ onNavigate }) {
  return (
    <div className="page active" id="page-participacion">
      <div className="page-band" data-bg="GUÍA">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Convocatoria académica</span>
          <h1>Guía de participación</h1>
        </div>
      </div>

      <div className="container py-6 content-page" style={{ maxWidth: 1180 }}>
        <div className="content-hero-grid">
          <div className="content-intro" data-anim="fade-right">
            <span className="section-eyebrow eyebrow-cerulean">CONIITI 2026</span>
            <h2 className="section-title">Participa con tu<br /><em>trabajo académico</em></h2>
            <div className="gold-rule" style={{ marginBottom: 28 }} />
            <p className="acerca-lead">La XII Conferencia Internacional sobre Innovación y Tendencias en Ingeniería se llevará a cabo en Bogotá, Colombia, del 30 de septiembre al 02 de octubre de 2026 en modalidad híbrida.</p>
            <p className="acerca-lead">CONIITI es un espacio abierto de interacción entre actores del ecosistema innovador para compartir nuevos enfoques de transformación creativa con visión de ingeniería.</p>
            <a className="btn-register btn-reg-gold" onClick={(event) => { event.preventDefault(); onNavigate('lineas') }} href="#">Ver líneas temáticas</a>
          </div>
          <div className="content-summary-panel" data-anim="fade-left">
            <div className="summary-kicker">Call for papers now open</div>
            <h3>XII CONIITI 2026</h3>
            <p>Del 30 de septiembre al 02 de octubre de 2026, Bogotá recibe un encuentro híbrido para investigadores, docentes, estudiantes y profesionales de ingeniería.</p>
            <div className="summary-meta">
              <span>Bogotá, Colombia</span>
              <span>Formato híbrido</span>
            </div>
          </div>
        </div>

        <div className="metric-grid mt-5">
          <div className="metric-card" data-anim="fade-up"><span className="metric-value">30</span><span className="metric-label">Septiembre 2026</span></div>
          <div className="metric-card" data-anim="fade-up" data-anim-delay="100"><span className="metric-value">02</span><span className="metric-label">Octubre 2026</span></div>
          <div className="metric-card" data-anim="fade-up" data-anim-delay="200"><span className="metric-value">6</span><span className="metric-label">Páginas máximo</span></div>
        </div>

        <div className="guidelines-panel mt-6" data-anim="fade-up">
          <div className="guidelines-heading">
            <span className="section-eyebrow eyebrow-gold">Requisitos de envío</span>
            <h3>Submission guidelines</h3>
          </div>
          <div className="guideline-grid">
            {[
              ['01', 'Originalidad', 'Se reciben artículos completos de alta calidad con investigación original en las líneas temáticas del congreso.'],
              ['02', 'Idioma', 'Las postulaciones deben estar escritas en inglés y no haber sido publicadas ni estar en evaluación en otro evento o revista.'],
              ['03', 'Formato', 'Los documentos deben seguir el formato IEEE doble columna y enviarse en archivo Word.'],
              ['04', 'Extensión', 'Cada envío tendrá máximo 6 páginas, incluyendo figuras, tablas y referencias.'],
              ['05', 'Presentación', 'Los trabajos aceptados serán presentados como ponencias orales durante el evento.']
            ].map(([number, title, text]) => (
              <article className="guideline-card" key={title}><span>{number}</span><h4>{title}</h4><p>{text}</p></article>
            ))}
          </div>
        </div>

        <div className="columns is-variable is-4 is-multiline mt-6 resource-grid">
          {defaultParticipationResources.map((resource, index) => (
            <div className="column is-6-desktop" data-anim="fade-up" data-anim-delay={index * 100} key={resource.title}>
              <div className="resource-card">
                <div className="boleta-name">{resource.title}</div>
                <div className="boleta-for">{resource.subtitle}</div>
                <p className="acerca-lead" style={{ fontSize: '1rem' }}>{resource.description}</p>
                <a className="btn-register btn-reg-outline" href="#" onClick={(event) => event.preventDefault()}>Disponible próximamente</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function SchedulePage({
  scheduleDays,
  dayIndex,
  onChangeDay,
  onOpenSpeaker,
  selectedEntrySlug,
  favoriteConferenceIds,
  favoriteActionId,
  onToggleFavorite
}) {
  const conferencesPerDay = 4
  const [schedulePageByDay, setSchedulePageByDay] = useState({})
  const activeDay = scheduleDays[dayIndex] || null
  const activePage = schedulePageByDay[activeDay?.id] || 1
  const totalPages = activeDay ? Math.max(1, Math.ceil(activeDay.entries.length / conferencesPerDay)) : 1
  const favoriteIdSet = useMemo(() => new Set(favoriteConferenceIds), [favoriteConferenceIds])
  const visibleEntries = activeDay
    ? activeDay.entries.slice((activePage - 1) * conferencesPerDay, activePage * conferencesPerDay)
    : []

  useEffect(() => {
    if (!activeDay?.id) {
      return
    }

    setSchedulePageByDay((current) => ({
      ...current,
      [activeDay.id]: current[activeDay.id] || 1
    }))
  }, [activeDay])

  useEffect(() => {
    if (!activeDay?.id || !selectedEntrySlug) {
      return
    }

    const targetIndex = activeDay.entries.findIndex((entry) => entry.slug === selectedEntrySlug)
    if (targetIndex < 0) {
      return
    }

    const targetPage = Math.floor(targetIndex / conferencesPerDay) + 1
    setSchedulePageByDay((current) => {
      if (current[activeDay.id] === targetPage) {
        return current
      }

      return {
        ...current,
        [activeDay.id]: targetPage
      }
    })
  }, [activeDay, conferencesPerDay, selectedEntrySlug])

  useEffect(() => {
    if (!activeDay?.id || activePage <= totalPages) {
      return
    }

    setSchedulePageByDay((current) => ({
      ...current,
      [activeDay.id]: totalPages
    }))
  }, [activeDay, activePage, totalPages])

  return (
    <div className="page active" id="page-cronograma">
      <div className="page-band" data-bg="CRONOGRAMA">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Programa oficial</span>
          <h1>Cronograma 2026</h1>
        </div>
      </div>

      <div className="container py-6" style={{ maxWidth: 1120 }}>
        <div className="sched-tabs-wrap" data-anim="fade-up">
          {scheduleDays.map((day, index) => (
            <button className={`sched-tab-btn${index === dayIndex ? ' active' : ''}`} key={day.label} onClick={() => onChangeDay(index)}>{day.label}</button>
          ))}
        </div>

        {activeDay ? (
          <div id={`sd${dayIndex + 1}`} className="sched-panel active">
            <div className="conference-pagination-summary">
              <span>{activeDay.entries.length} conferencias programadas</span>
              <span>Página {activePage} de {totalPages}</span>
            </div>

            {visibleEntries.map((entry) => (
              <details
                className={`schedule-detail-row${selectedEntrySlug === entry.slug ? ' focused' : ''}`}
                defaultOpen={selectedEntrySlug === entry.slug}
                key={entry.slug}
              >
                <summary className="schedule-detail-summary">
                  <div className="sched-time">{formatAgendaTime(entry.startDate, entry.timezone)}</div>
                    <div className="schedule-summary-copy">
                      <span className="sched-badge badge-k">{getConferenceLineLabel(entry.category)}</span>
                      <div className="sched-title">
                        {entry.title}
                        {favoriteIdSet.has(entry.conferenceId) ? (
                          <span className="conference-favorite-mark" aria-label="Favorita">★</span>
                        ) : null}
                      </div>
                      <div className="sched-speaker">{entry.leadSpeakerName}</div>
                    </div>
                </summary>

                <div className="schedule-detail-panel">
                  <p>{entry.description}</p>
                  <div className="conference-row-panel-grid">
                    <div>
                      <span className="conference-panel-label">Horario</span>
                      <div className="conference-panel-value">{formatDateRange(entry.startDate, entry.endDate, entry.timezone)}</div>
                    </div>
                    <div>
                      <span className="conference-panel-label">Sala</span>
                      <div className="conference-panel-value">{entry.room}</div>
                    </div>
                    <div>
                      <span className="conference-panel-label">Modalidad</span>
                      <div className="conference-panel-value">{entry.modality}</div>
                    </div>
                  </div>

                  {entry.leadSpeakerSlug || entry.conferenceId ? (
                    <div className="conference-row-panel-actions">
                      <button
                        type="button"
                        className={`conference-inline-link${favoriteIdSet.has(entry.conferenceId) ? ' primary' : ''}`}
                        disabled={favoriteActionId === entry.conferenceId}
                        onClick={() => onToggleFavorite(entry.conferenceId)}
                      >
                        {favoriteIdSet.has(entry.conferenceId) ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                      </button>
                      {entry.leadSpeakerSlug ? (
                      <button type="button" className="conference-inline-link primary" onClick={() => onOpenSpeaker(entry.leadSpeakerSlug)}>
                        Ver conferencista
                      </button>
                      ) : null}
                    </div>
                  ) : null}
                </div>
              </details>
            ))}

            {!activeDay.entries.length ? (
              <div className="conference-empty-state">
                <span className="section-eyebrow eyebrow-gold">Sin conferencias</span>
                <h3>
                  {activeDay.id === favoritesFilterKey
                    ? 'Aun no has marcado conferencias favoritas'
                    : 'No hay conferencias programadas para esta vista'}
                </h3>
              </div>
            ) : null}

            {activeDay.entries.length > conferencesPerDay ? (
              <div className="conference-pagination">
                <button
                  type="button"
                  className="conference-page-btn"
                  disabled={activePage === 1}
                  onClick={() => setSchedulePageByDay((current) => ({
                    ...current,
                    [activeDay.id]: Math.max(1, activePage - 1)
                  }))}
                >
                  Anterior
                </button>
                <div className="conference-page-list">
                  {Array.from({ length: totalPages }, (_, index) => index + 1).map((pageNumber) => (
                    <button
                      type="button"
                      className={`conference-page-btn number${activePage === pageNumber ? ' active' : ''}`}
                      onClick={() => setSchedulePageByDay((current) => ({
                        ...current,
                        [activeDay.id]: pageNumber
                      }))}
                      key={`${activeDay.id}-page-${pageNumber}`}
                    >
                      {pageNumber}
                    </button>
                  ))}
                </div>
                <button
                  type="button"
                  className="conference-page-btn"
                  disabled={activePage === totalPages}
                  onClick={() => setSchedulePageByDay((current) => ({
                    ...current,
                    [activeDay.id]: Math.min(totalPages, activePage + 1)
                  }))}
                >
                  Siguiente
                </button>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>

      <SimpleFooter />
    </div>
  )
}

function TicketsPage({ authSession }) {
  const ticketProfile = authSession?.user?.ticketProfile || null
  const visibleTickets = ticketProfile
    ? defaultTickets.filter((ticket) => ticket.key === ticketProfile)
    : defaultTickets
  const currentProfileLabel = ticketProfile ? ticketProfileLabels[ticketProfile] : null

  const ticketKeyToType = { speaker: 'Ponente', visitor: 'Visitante', student: 'Estudiante' }
  const [buying, setBuying] = useState(null)

  const handleBuy = async (ticket) => {
    if (!authSession?.token) {
      alert('Debes iniciar sesion para comprar tu boleta.')
      return
    }
    const ticketType = ticket.ticketType || ticketKeyToType[ticket.key]
    if (!ticketType) {
      alert('Tipo de boleta no soportado por la pasarela.')
      return
    }
    try {
      setBuying(ticket.title)
      const response = await fetch(buildApiUrl(apiConfig.paymentsApiUrl, '/payments/create-checkout-session'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authSession.tokenType || 'Bearer'} ${authSession.token}`
        },
        body: JSON.stringify({ ticketType, description: `${ticket.title} - ${ticket.subtitle}` })
      })
      const payload = await response.json().catch(() => ({}))
      const checkoutUrl = payload?.checkoutUrl || payload?.url
      if (!response.ok || !checkoutUrl) {
        alert(payload?.message || 'No fue posible iniciar el pago.')
        return
      }
      window.location.href = checkoutUrl
    } catch (error) {
      alert('Error de conexion con la pasarela de pagos.')
    } finally {
      setBuying(null)
    }
  }

  return (
    <div className="page active" id="page-boletas">
      <div className="page-band" data-bg="BOLETAS">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Boletería abierta</span>
          <h1>Boletería</h1>
        </div>
      </div>

      <div className="container py-6" style={{ maxWidth: 1100 }}>
        <div className="conference-pagination-summary" style={{ marginBottom: 28 }}>
          <span>
            {currentProfileLabel
              ? `Perfil registrado: ${currentProfileLabel}`
              : 'Visualizando boletería general'}
          </span>
          <span>
            {currentProfileLabel
              ? 'Se muestra la boleta disponible para tu perfil'
              : 'Inicia sesión o regístrate para ver tu boletería sugerida'}
          </span>
        </div>
        <div className="columns is-variable is-4 tickets-grid">
          {visibleTickets.map((ticket, index) => (
            <div className="column is-6-desktop" data-anim="fade-up" data-anim-delay={index * 120} key={ticket.title}>
              <div className={`boleta-card${ticket.featured ? ' featured' : ''}`} style={ticket.featured ? { marginTop: -12 } : undefined}>
                {ticket.featured ? <div className="boleta-hot-tag">Mas consultada</div> : null}
                {ticket.optional ? <div className="boleta-hot-tag" style={{ background: 'var(--gold)', color: 'var(--ink)' }}>Opcional</div> : null}
                <div className="boleta-name">{ticket.title}</div>
                <div className="boleta-for">{ticket.subtitle}</div>
                <div className="boleta-price"><sup>COP</sup> {ticket.price}</div>
                <ul className="boleta-features">
                  {ticket.features.map((feature) => <li className="boleta-feature" key={feature}>{feature}</li>)}
                </ul>
                <a className={`btn-register ${ticket.buttonClass}`} href="#" onClick={(event) => { event.preventDefault(); handleBuy(ticket) }} aria-disabled={buying === ticket.title}>{buying === ticket.title ? 'Procesando...' : 'Comprar aqui'}</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function TopicsPage() {
  return (
    <div className="page active" id="page-lineas" style={{ background: 'var(--ink)' }}>
      <div className="page-band" data-bg="LINEAS">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Ejes de investigación</span>
          <h1>Líneas Temáticas</h1>
        </div>
      </div>

      <div className="py-6" style={{ background: 'var(--ink)' }}>
        <div className="container" style={{ maxWidth: 1180 }}>
          <div className="lineas-intro">
            <h2>Temas de referencia</h2>
            <p>Estas son las temáticas de referencia para autores, conferencistas y participantes del congreso.</p>
          </div>
          <div className="topic-accordion">
            {topicGroups.map(([number, title, items]) => (
              <details className="topic-item" key={title}>
                <summary><span>{number}</span><strong>{title}</strong></summary>
                <ul className="topic-list">
                  {items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </details>
            ))}
          </div>
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function AboutPage() {
  return (
    <div className="page active" id="page-nosotros">
      <div className="page-band" data-bg="HISTORIA">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Nuestra historia</span>
          <h1>Nosotros</h1>
        </div>
      </div>

      <div className="container py-6 content-page" style={{ maxWidth: 1180 }}>
        <div className="content-hero-grid nosotros-hero">
          <div className="content-intro" data-anim="fade-right">
            <span className="section-eyebrow eyebrow-cerulean">Inicios de CONIITI</span>
            <h2 className="section-title">Innovación con<br /><em>visión de ingeniería</em></h2>
            <div className="gold-rule" style={{ marginBottom: 36 }} />
            <p className="acerca-lead"><strong>CONIITI</strong> es un espacio abierto de interacción entre actores del ecosistema innovador orientado a compartir nuevas aproximaciones para la transformación creativa de Colombia a través del diseño de soluciones con visión de ingeniería.</p>
            <p className="acerca-lead">La Universidad Católica de Colombia, en el marco de la Semana de Ingeniería, desarrolló el I Congreso Internacional de Innovación y Tendencias en Ingeniería en 2015, realizado entre el 14 y el 17 de octubre en Bogotá.</p>
            <p className="acerca-lead">Desde entonces, el congreso ha reunido conferencistas, ponencias, workshops y pósteres alrededor de líneas como software inteligente, infraestructura, medio ambiente, creatividad, innovación, emprendimiento y gestión de organizaciones.</p>
          </div>
          <div className="content-summary-panel history-summary" data-anim="fade-left">
            <div className="summary-kicker">Universidad Católica de Colombia</div>
            <h3>De la Semana de Ingeniería a un congreso internacional</h3>
            <p>CONIITI nace como un punto de encuentro académico para conectar investigación, industria y nuevas tendencias de ingeniería.</p>
            <div className="summary-meta">
              <span>Desde 2015</span>
              <span>Bogotá D.C.</span>
            </div>
          </div>
        </div>

        <div className="metric-grid mt-5">
          <div className="metric-card" data-anim="fade-up"><span className="metric-value">2015</span><span className="metric-label">I CONIITI</span></div>
          <div className="metric-card" data-anim="fade-up" data-anim-delay="100"><span className="metric-value">2016</span><span className="metric-label">II CONIITI</span></div>
          <div className="metric-card" data-anim="fade-up" data-anim-delay="200"><span className="metric-value">XII</span><span className="metric-label">CONIITI 2026</span></div>
        </div>

        <div className="history-grid mt-6">
          {historyCards.map((card, index) => (
            <article className="history-card" data-anim="fade-up" data-anim-delay={index * 120} key={card.year}>
              <div className="history-year">{card.year}</div>
              <div>
                <h3>{card.title}</h3>
                <p className="acerca-lead" style={{ fontSize: '1rem' }}>{card.description}</p>
                <ul className="history-list">
                  {card.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </div>
            </article>
          ))}
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function ContactPage({ form, submissionState, onFieldChange, onSubmit }) {
  return (
    <div className="page active" id="page-contacto" style={{ background: 'var(--ink)' }}>
      <div className="page-band" data-bg="CONTACTO">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Escribenos</span>
          <h1>Contacto</h1>
        </div>
      </div>

      <div className="py-6" style={{ background: 'var(--ink)' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="contact-layout">
            <div className="contact-info-column" data-anim="fade-right">
              <span className="section-eyebrow eyebrow-gold" style={{ marginBottom: 32, display: 'block' }}>Informacion de contacto</span>
              {contactItems.map(([icon, label, value]) => (
                <div className="contact-item" key={label}>
                  <div className="contact-icon"><i className={`bi ${icon}`} /></div>
                  <div><div className="contact-label">{label}</div><div className="contact-value">{value}</div></div>
                </div>
              ))}
            </div>

            <div className="contact-form-column" data-anim="fade-left">
              <form onSubmit={onSubmit}>
                <div className="contact-form-grid">
                  <div className="contact-field"><label className="form-label-custom">Nombre</label><input className="form-input" type="text" placeholder="Tu nombre" value={form.firstName} onChange={(event) => onFieldChange('firstName', event.target.value)} /></div>
                  <div className="contact-field"><label className="form-label-custom">Apellido</label><input className="form-input" type="text" placeholder="Tu apellido" value={form.lastName} onChange={(event) => onFieldChange('lastName', event.target.value)} /></div>
                  <div className="contact-field"><label className="form-label-custom">Correo electronico</label><input className="form-input" type="email" placeholder="correo@ejemplo.com" value={form.email} onChange={(event) => onFieldChange('email', event.target.value)} /></div>
                  <div className="contact-field"><label className="form-label-custom">Institucion</label><input className="form-input" type="text" placeholder="Tu universidad o empresa" value={form.institution} onChange={(event) => onFieldChange('institution', event.target.value)} /></div>
                  <div className="contact-field span-2">
                    <label className="form-label-custom">Tipo de consulta</label>
                    <select className="form-input" value={form.inquiryType} onChange={(event) => onFieldChange('inquiryType', event.target.value)}>
                      <option value="">Selecciona una opcion</option>
                      {contactOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="contact-field span-2"><label className="form-label-custom">Mensaje</label><textarea className="form-input" rows="5" placeholder="Escribe tu mensaje aqui..." value={form.message} onChange={(event) => onFieldChange('message', event.target.value)} /></div>
                  <div className="contact-field span-2">
                    {submissionState.message ? (
                      <div className={`contact-feedback ${submissionState.type}`}>{submissionState.message}</div>
                    ) : null}
                  </div>
                  <div className="contact-field span-2">
                    <button type="submit" className="btn-primary contact-submit-btn" style={{ cursor: 'pointer', clipPath: 'none' }} disabled={submissionState.submitting}>
                      <i className="bi bi-send" /> {submissionState.submitting ? 'Enviando...' : 'Enviar mensaje'}
                    </button>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>

      <SimpleFooter dark />
    </div>
  )
}

function buildCountdown() {
  const diff = new Date('2026-09-30T08:00:00-05:00') - new Date()
  if (diff <= 0) {
    return { days: '00', hours: '00', minutes: '00', seconds: '00' }
  }

  return {
    days: String(Math.floor(diff / 86400000)).padStart(2, '0'),
    hours: String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0'),
    minutes: String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0'),
    seconds: String(Math.floor((diff % 60000) / 1000)).padStart(2, '0')
  }
}

export default function App() {
  const [page, setPage] = useState('inicio')
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [mobileNavOpen, setMobileNavOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authSession, setAuthSession] = useState(null)
  const [currentHomeSlide, setCurrentHomeSlide] = useState(0)
  const [countdown, setCountdown] = useState(buildCountdown())
  const [scheduleDayIndex, setScheduleDayIndex] = useState(0)
  const [selectedSpeakerSlug, setSelectedSpeakerSlug] = useState(null)
  const [selectedScheduleEntry, setSelectedScheduleEntry] = useState(null)
  const [featuredSpeakers, setFeaturedSpeakers] = useState([
    { fullName: 'Giuseppe Moretti', initials: 'GM', institution: 'Politecnico di Milano', bio: 'Experto en robótica avanzada y sistemas autónomos con 25 años de investigación en Europa.', country: 'Italia', countryCode: 'IT', featured: true },
    { fullName: 'Claudia Russo', initials: 'CR', institution: 'Università La Sapienza', bio: 'Pionera en inteligencia artificial aplicada a la ingeniería biomédica y salud digital.', country: 'Italia', countryCode: 'IT', featured: true },
    { fullName: 'Dr. Jorge Arévalo', initials: 'JA', institution: 'Universidad Nacional', bio: 'Investigador líder en energías renovables y sostenibilidad para Latinoamérica.', country: 'Colombia', countryCode: 'CO', featured: true },
    { fullName: 'Laura Fontana', initials: 'LF', institution: 'Università di Bologna', bio: 'Especialista en nanomateriales y su aplicación en la ingeniería de materiales del futuro.', country: 'Italia', countryCode: 'IT', featured: true }
  ])
  const [speakers, setSpeakers] = useState(featuredSpeakers)
  const [conferenceCards, setConferenceCards] = useState([])
  const [conferenceCategories, setConferenceCategories] = useState(getFallbackConferenceCategories())
  const [selectedConferenceCategory, setSelectedConferenceCategory] = useState(getFallbackConferenceCategories()[0])
  const [scheduleDays, setScheduleDays] = useState([])
  const [featuredSpeakersLoaded, setFeaturedSpeakersLoaded] = useState(false)
  const [speakersLoaded, setSpeakersLoaded] = useState(false)
  const [conferenceCardsLoaded, setConferenceCardsLoaded] = useState(false)
  const [conferenceCategoriesLoaded, setConferenceCategoriesLoaded] = useState(false)
  const [conferenceCardsLoading, setConferenceCardsLoading] = useState(false)
  const [scheduleDaysLoaded, setScheduleDaysLoaded] = useState(false)
  const [favoriteConferenceIds, setFavoriteConferenceIds] = useState([])
  const [favoriteActionId, setFavoriteActionId] = useState(null)
  const [contactForm, setContactForm] = useState(initialContactFormState)
  const [contactSubmissionState, setContactSubmissionState] = useState({
    submitting: false,
    type: '',
    message: ''
  })

  async function parseJsonResponse(response) {
    try {
      return await response.json()
    } catch (_error) {
      return null
    }
  }

  useEffect(() => {
    const storedValue = readStoredAuthSession()
    if (!storedValue) {
      return undefined
    }

    let storedSession = null
    try {
      storedSession = JSON.parse(storedValue)
    } catch (_error) {
      clearStoredAuthSession()
      return undefined
    }

    if (!storedSession?.user) {
      clearStoredAuthSession()
      return undefined
    }

    setAuthSession(storedSession)

    if (!storedSession.token) {
      return undefined
    }

    const controller = new AbortController()

    async function validateStoredSession() {
      try {
        const response = await fetch(buildApiUrl(apiConfig.authApiUrl, '/auth/me'), {
          headers: {
            Authorization: `${storedSession.tokenType || 'Bearer'} ${storedSession.token}`
          },
          signal: controller.signal
        })

        if (response.status === 401) {
          clearStoredAuthSession()
          setAuthSession(null)
          return
        }

        if (!response.ok) {
          return
        }

        const payload = await response.json()
        if (payload?.ok && payload.user) {
          const refreshedSession = {
            ...storedSession,
            user: payload.user
          }
          persistAuthSession(refreshedSession)
          setAuthSession(refreshedSession)
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setAuthSession(storedSession)
        }
      }
    }

    validateStoredSession()

    return () => controller.abort()
  }, [])

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown(buildCountdown())
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const nextEmail = authSession?.user?.email || ''
    const { firstName, lastName } = splitFullName(authSession?.user?.fullName || '')

    setContactForm((current) => ({
      ...current,
      firstName: current.firstName || firstName,
      lastName: current.lastName || lastName,
      email: current.email || nextEmail
    }))
  }, [authSession])

  useEffect(() => {
    if (!authSession?.token) {
      setFavoriteConferenceIds([])
      return undefined
    }

    const controller = new AbortController()

    async function loadFavorites() {
      try {
        const response = await fetch(buildApiUrl(apiConfig.authApiUrl, '/auth/me/favorite-conferences'), {
          headers: {
            Authorization: `${authSession.tokenType || 'Bearer'} ${authSession.token}`
          },
          signal: controller.signal
        })

        const payload = await parseJsonResponse(response)
        if (response.ok && payload?.ok) {
          setFavoriteConferenceIds(payload.favorites || [])
        }
      } catch (error) {
        if (error.name !== 'AbortError') {
          setFavoriteConferenceIds([])
        }
      }
    }

    loadFavorites()

    return () => controller.abort()
  }, [authSession])

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentHomeSlide((current) => (current + 1) % 2)
    }, 6500)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const handleScroll = () => {
      document.getElementById('main-nav')?.classList.toggle('scrolled', window.scrollY > 30)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    const els = document.querySelectorAll('[data-anim]')
    if (!els.length) {
      return undefined
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          const delay = parseInt(entry.target.dataset.animDelay || '0', 10)
          setTimeout(() => entry.target.classList.add('anim-in'), delay)
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' })

    els.forEach((el) => {
      el.classList.remove('anim-in')
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [page, currentHomeSlide, scheduleDayIndex, conferenceCards, conferenceCategories, featuredSpeakers, speakers, scheduleDays])

  useEffect(() => {
    const maxScheduleViews = scheduleDays.length ? scheduleDays.length + 1 : 0
    if (maxScheduleViews && scheduleDayIndex >= maxScheduleViews) {
      setScheduleDayIndex(0)
    }
  }, [scheduleDayIndex, scheduleDays])

  useEffect(() => {
    if (!selectedScheduleEntry || !scheduleDays.length) {
      return
    }

    const targetIndex = scheduleDays.findIndex(
      (day) => day.id === selectedScheduleEntry.dateKey || day.entries.some((entry) => entry.slug === selectedScheduleEntry.slug)
    )

    if (targetIndex >= 0 && targetIndex !== scheduleDayIndex) {
      setScheduleDayIndex(targetIndex)
    }
  }, [scheduleDayIndex, scheduleDays, selectedScheduleEntry])

  useEffect(() => {
    if (!mobileNavOpen) {
      document.body.style.removeProperty('overflow')
      return undefined
    }

    document.body.style.overflow = 'hidden'
    return () => document.body.style.removeProperty('overflow')
  }, [mobileNavOpen])

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 992) {
        setMobileNavOpen(false)
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    let active = true

    async function loadDataForPage() {
      try {
        if (page === 'inicio' && !featuredSpeakersLoaded) {
          const result = await getFeaturedSpeakersUseCase.execute()
          if (!active) return
          if (result.length) setFeaturedSpeakers(result)
          setFeaturedSpeakersLoaded(true)
          return
        }

        let speakerCatalog = speakers
        if (['conferencistas', 'conferencias', 'cronograma'].includes(page) && !speakersLoaded) {
          const result = await getSpeakersUseCase.execute()
          if (!active) return
          if (result.length) {
            setSpeakers(result)
            speakerCatalog = result
          }
          setSpeakersLoaded(true)
        }

        if (page === 'conferencias' && !conferenceCategoriesLoaded) {
          const result = await conferenceRepository.getCategories()
          if (!active) return
          if (result.length) {
            setConferenceCategories(result)
            setSelectedConferenceCategory((current) => result.includes(current) ? current : result[0])
          }
          setConferenceCategoriesLoaded(true)
        }

        if (page === 'conferencias' && !conferenceCardsLoaded && selectedConferenceCategory) {
          setConferenceCardsLoading(true)
          const result = await getPublishedConferencesUseCase.execute(
            selectedConferenceCategory === favoritesFilterKey
              ? {}
              : { category: selectedConferenceCategory }
          )
          if (!active) return
          setConferenceCards(result.length ? result : [])
          setConferenceCardsLoaded(true)
          setConferenceCardsLoading(false)
          return
        }

        if (page === 'cronograma' && !scheduleDaysLoaded) {
          const result = await getMasterAgendaUseCase.execute()
          if (!active) return
          if (result.length) {
            setScheduleDays(hydrateScheduleDays(result, speakerCatalog))
          }
          setScheduleDaysLoaded(true)
        }
      } catch {
        if (!active) return

        if (page === 'inicio') setFeaturedSpeakersLoaded(true)
        if (page === 'conferencistas') setSpeakersLoaded(true)
        if (page === 'conferencias') {
          setConferenceCategoriesLoaded(true)
          setConferenceCardsLoaded(true)
          setConferenceCardsLoading(false)
        }
        if (page === 'cronograma') {
          setScheduleDaysLoaded(true)
        }
      }
    }

    loadDataForPage()

    return () => {
      active = false
    }
  }, [page, featuredSpeakersLoaded, speakersLoaded, conferenceCategoriesLoaded, conferenceCardsLoaded, selectedConferenceCategory, scheduleDaysLoaded])

  const scheduleTabs = useMemo(() => {
    if (!scheduleDays.length) {
      return []
    }

    const favoriteIdSet = new Set(favoriteConferenceIds)
    const favoriteEntries = scheduleDays
      .flatMap((day) => day.entries)
      .filter((entry) => favoriteIdSet.has(entry.conferenceId))
      .sort((left, right) => new Date(left.startDate) - new Date(right.startDate))

    return [
      ...scheduleDays,
      {
        id: favoritesFilterKey,
        label: 'Favoritos',
        entries: favoriteEntries
      }
    ]
  }, [favoriteConferenceIds, scheduleDays])

  async function handleToggleFavorite(conferenceId) {
    if (!authSession?.token) {
      setAuthMode('login')
      setIsAuthOpen(true)
      return
    }

    setFavoriteActionId(conferenceId)
    const isFavorite = favoriteConferenceIds.includes(conferenceId)
    const method = isFavorite ? 'DELETE' : 'POST'
    const url = isFavorite
      ? buildApiUrl(apiConfig.authApiUrl, `/auth/me/favorite-conferences/${conferenceId}`)
      : buildApiUrl(apiConfig.authApiUrl, '/auth/me/favorite-conferences')

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `${authSession.tokenType || 'Bearer'} ${authSession.token}`
        },
        body: isFavorite ? undefined : JSON.stringify({ conferenceId })
      })

      const payload = await parseJsonResponse(response)
      if (response.ok && payload?.ok) {
        setFavoriteConferenceIds(payload.favorites || [])
      }
    } finally {
      setFavoriteActionId(null)
    }
  }

  function handleContactFieldChange(field, value) {
    setContactForm((current) => ({
      ...current,
      [field]: value
    }))

    setContactSubmissionState((current) => ({
      ...current,
      type: '',
      message: ''
    }))
  }

  async function handleContactSubmit(event) {
    event.preventDefault()

    try {
      setContactSubmissionState({
        submitting: true,
        type: '',
        message: ''
      })

      const response = await fetch(buildApiUrl(apiConfig.contactApiUrl, '/contacto/messages'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(contactForm)
      })

      const payload = await parseJsonResponse(response)
      if (!response.ok || !payload?.ok) {
        setContactSubmissionState({
          submitting: false,
          type: 'error',
          message: payload?.message || 'No fue posible enviar el mensaje.'
        })
        return
      }

      setContactSubmissionState({
        submitting: false,
        type: 'success',
        message: 'Tu mensaje fue enviado y quedo registrado correctamente.'
      })
      setContactForm((current) => ({
        ...initialContactFormState,
        firstName: authSession?.user ? splitFullName(authSession.user.fullName).firstName : '',
        lastName: authSession?.user ? splitFullName(authSession.user.fullName).lastName : '',
        email: authSession?.user?.email || ''
      }))
    } catch (_error) {
      setContactSubmissionState({
        submitting: false,
        type: 'error',
        message: 'No hay conexion con el servicio de contacto.'
      })
    }
  }

  const currentView = useMemo(() => {
    switch (page) {
      case 'inicio':
        return <HomePage featuredSpeakers={featuredSpeakers} currentHomeSlide={currentHomeSlide} onHomeSlide={setCurrentHomeSlide} countdown={countdown} onOpenAuth={handleAuthEntry} onNavigate={handleNavigate} />
      case 'conferencias':
        return (
          <ConferencesPage
            conferenceCards={conferenceCards}
            conferenceCategories={conferenceCategories}
            selectedCategory={selectedConferenceCategory}
            onCategoryChange={handleConferenceCategoryChange}
            onOpenSchedule={handleOpenConferenceSchedule}
            speakers={speakers}
            onOpenSpeaker={handleOpenSpeaker}
            favoriteConferenceIds={favoriteConferenceIds}
            favoriteActionId={favoriteActionId}
            onToggleFavorite={handleToggleFavorite}
            isLoading={conferenceCardsLoading}
          />
        )
      case 'conferencistas':
        return <SpeakersPage speakers={speakers} selectedSpeakerSlug={selectedSpeakerSlug} onOpenConference={handleOpenConferenceFromSpeaker} />
      case 'comite':
        return <CommitteePage />
      case 'participacion':
        return <ParticipationPage onNavigate={handleNavigate} />
      case 'cronograma':
        return (
          <SchedulePage
            scheduleDays={scheduleTabs}
            dayIndex={scheduleDayIndex}
            onChangeDay={setScheduleDayIndex}
            onOpenSpeaker={handleOpenSpeaker}
            selectedEntrySlug={selectedScheduleEntry?.slug || null}
            favoriteConferenceIds={favoriteConferenceIds}
            favoriteActionId={favoriteActionId}
            onToggleFavorite={handleToggleFavorite}
          />
        )
      case 'boleteria':
        return <TicketsPage authSession={authSession} />
      case 'lineas':
        return <TopicsPage />
      case 'nosotros':
        return <AboutPage />
      case 'contacto':
        return <ContactPage form={contactForm} submissionState={contactSubmissionState} onFieldChange={handleContactFieldChange} onSubmit={handleContactSubmit} />
      default:
        return <HomePage featuredSpeakers={featuredSpeakers} currentHomeSlide={currentHomeSlide} onHomeSlide={setCurrentHomeSlide} countdown={countdown} onOpenAuth={handleAuthEntry} onNavigate={handleNavigate} />
    }
  }, [authSession, conferenceCards, conferenceCardsLoading, conferenceCategories, contactForm, contactSubmissionState, countdown, currentHomeSlide, favoriteActionId, favoriteConferenceIds, featuredSpeakers, page, scheduleDayIndex, scheduleTabs, selectedConferenceCategory, selectedScheduleEntry, selectedSpeakerSlug, speakers])

  function handleNavigate(nextPage) {
    setPage(nextPage)
    setDropdownOpen(false)
    setMobileNavOpen(false)
    setScheduleDayIndex(0)
    if (nextPage !== 'cronograma') {
      setSelectedScheduleEntry(null)
    }
    if (nextPage !== 'conferencistas') {
      setSelectedSpeakerSlug(null)
    }
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleConferenceCategoryChange(category) {
    setSelectedConferenceCategory(category)
    setConferenceCards([])
    setConferenceCardsLoaded(false)
    setConferenceCardsLoading(true)
    setMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleOpenSpeaker(speakerSlug) {
    setSelectedSpeakerSlug(speakerSlug)
    setPage('conferencistas')
    setDropdownOpen(false)
    setMobileNavOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleOpenConferenceSchedule(conference) {
    const nextSelection = {
      slug: conference.slug,
      dateKey: conference.startDate.slice(0, 10)
    }

    setSelectedScheduleEntry(nextSelection)

    const targetIndex = scheduleDays.findIndex((day) => day.id === nextSelection.dateKey)
    if (targetIndex >= 0) {
      setScheduleDayIndex(targetIndex)
    }

    setPage('cronograma')
    setDropdownOpen(false)
    setMobileNavOpen(false)
    setSelectedSpeakerSlug(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleOpenConferenceFromSpeaker(conferenceId, scheduledAt) {
    const matchingDay = scheduleDays.find((day) =>
      day.entries.some((entry) => entry.conferenceId === conferenceId)
    )

    if (matchingDay) {
      const matchingEntry = matchingDay.entries.find((entry) => entry.conferenceId === conferenceId)
      setSelectedScheduleEntry({
        slug: matchingEntry.slug,
        dateKey: matchingDay.id
      })
      setScheduleDayIndex(scheduleDays.findIndex((day) => day.id === matchingDay.id))
    } else if (scheduledAt) {
      setSelectedScheduleEntry({
        slug: null,
        dateKey: scheduledAt.slice(0, 10)
      })
    }

    if (scheduledAt) {
      const targetDate = scheduledAt.slice(0, 10)
      const targetIndex = scheduleDays.findIndex((day) => day.id === targetDate)
      if (targetIndex >= 0) {
        setScheduleDayIndex(targetIndex)
      }
    }

    setPage('cronograma')
    setDropdownOpen(false)
    setMobileNavOpen(false)
    setSelectedSpeakerSlug(null)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAuthEntry() {
    if (authSession?.user) {
      setPage('boleteria')
      setMobileNavOpen(false)
      return
    }

    setAuthMode('login')
    setIsAuthOpen(true)
    setMobileNavOpen(false)
  }

  function handleAuthenticated(payload) {
    if (payload?.user) {
      const nextSession = {
        token: payload.token,
        tokenType: payload.tokenType || 'Bearer',
        user: payload.user
      }

      persistAuthSession(nextSession)
      setAuthSession(nextSession)
    }

    setIsAuthOpen(false)
    setMobileNavOpen(false)
    setPage('boleteria')
  }

  function handleLogout() {
    clearStoredAuthSession()
    setAuthSession(null)
    setIsAuthOpen(false)
    setPage('inicio')
    setDropdownOpen(false)
    setMobileNavOpen(false)
  }

  return (
    <>
      <nav className="coniiti-navbar" id="main-nav">
        <div className="navbar-inner">
          <a className="brand" href="#" onClick={(event) => { event.preventDefault(); handleNavigate('inicio') }}>
            <span className="brand-mark">CONIITI</span>
            <span className="brand-year">Bogotá · 2026</span>
          </a>

          <button
            type="button"
            className={`nav-mobile-toggle${mobileNavOpen ? ' active' : ''}`}
            onClick={() => setMobileNavOpen((current) => !current)}
            aria-expanded={mobileNavOpen}
            aria-controls="mobile-nav-panel"
            aria-label="Abrir menu principal"
          >
            <span />
            <span />
            <span />
          </button>

          <ul className="nav-links">
            <li><a id="nav-inicio" className={page === 'inicio' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('inicio') }} href="#">Inicio</a></li>
            <li><a id="nav-conferencias" className={page === 'conferencias' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('conferencias') }} href="#">Conferencias</a></li>
            <li><a id="nav-cronograma" className={page === 'cronograma' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('cronograma') }} href="#">Cronograma</a></li>
            <li><a id="nav-conferencistas" className={page === 'conferencistas' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('conferencistas') }} href="#">Conferencistas</a></li>
            <li><a id="nav-nosotros" className={page === 'nosotros' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('nosotros') }} href="#">Nosotros</a></li>
            <li className={`has-dropdown${dropdownOpen ? ' open' : ''}`}>
              <button id="nav-mas" type="button" className={['comite', 'participacion', 'lineas', 'boleteria', 'contacto'].includes(page) ? 'active' : ''} onClick={() => setDropdownOpen((current) => !current)} aria-expanded={dropdownOpen}>
                Más sobre nosotros <i className="bi bi-chevron-down ms-1" style={{ fontSize: '.5rem' }} />
              </button>
              <div className="nav-dropdown">
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('comite') }}><span className="dot" /> Comité</a>
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('participacion') }}><span className="dot" /> Guía de participación</a>
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('lineas') }}><span className="dot" /> Líneas temáticas</a>
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('boleteria') }}><span className="dot" /> Boletería</a>
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('contacto') }}><span className="dot" /> Contacto</a>
              </div>
            </li>
            {authSession?.user ? (
              <li className="nav-session">
                <span className="nav-user">
                  <i className="bi bi-person-check" />
                  {authSession.user.fullName || authSession.user.email}
                </span>
                <button className="nav-logout" type="button" onClick={handleLogout}>
                  Cerrar sesión
                </button>
              </li>
            ) : (
              <li><a className="nav-cta" onClick={(event) => { event.preventDefault(); handleAuthEntry() }} href="#">Inscríbete</a></li>
            )}
          </ul>
        </div>

        <div
          className={`mobile-nav-backdrop${mobileNavOpen ? ' active' : ''}`}
          onClick={() => setMobileNavOpen(false)}
          aria-hidden={!mobileNavOpen}
        />

        <div id="mobile-nav-panel" className={`mobile-nav-panel${mobileNavOpen ? ' active' : ''}`} aria-hidden={!mobileNavOpen}>
          <div className="mobile-nav-section">
            <button type="button" className={`mobile-nav-link${page === 'inicio' ? ' active' : ''}`} onClick={() => handleNavigate('inicio')}>Inicio</button>
            <button type="button" className={`mobile-nav-link${page === 'conferencias' ? ' active' : ''}`} onClick={() => handleNavigate('conferencias')}>Conferencias</button>
            <button type="button" className={`mobile-nav-link${page === 'cronograma' ? ' active' : ''}`} onClick={() => handleNavigate('cronograma')}>Cronograma</button>
            <button type="button" className={`mobile-nav-link${page === 'conferencistas' ? ' active' : ''}`} onClick={() => handleNavigate('conferencistas')}>Conferencistas</button>
            <button type="button" className={`mobile-nav-link${page === 'nosotros' ? ' active' : ''}`} onClick={() => handleNavigate('nosotros')}>Nosotros</button>
          </div>
          <div className="mobile-nav-section subtle">
            <span className="mobile-nav-label">Mas sobre nosotros</span>
            <button type="button" className={`mobile-nav-link${page === 'comite' ? ' active' : ''}`} onClick={() => handleNavigate('comite')}>Comite</button>
            <button type="button" className={`mobile-nav-link${page === 'participacion' ? ' active' : ''}`} onClick={() => handleNavigate('participacion')}>Guia de participacion</button>
            <button type="button" className={`mobile-nav-link${page === 'lineas' ? ' active' : ''}`} onClick={() => handleNavigate('lineas')}>Lineas tematicas</button>
            <button type="button" className={`mobile-nav-link${page === 'boleteria' ? ' active' : ''}`} onClick={() => handleNavigate('boleteria')}>Boleteria</button>
            <button type="button" className={`mobile-nav-link${page === 'contacto' ? ' active' : ''}`} onClick={() => handleNavigate('contacto')}>Contacto</button>
          </div>

          <div className="mobile-nav-actions">
            {authSession?.user ? (
              <>
                <div className="mobile-nav-user">{authSession.user.fullName || authSession.user.email}</div>
                <button className="mobile-nav-secondary" type="button" onClick={handleLogout}>Cerrar sesion</button>
              </>
            ) : (
              <button className="mobile-nav-cta" type="button" onClick={handleAuthEntry}>Inscribete</button>
            )}
          </div>
        </div>
      </nav>

      {currentView}

      <AuthModal
        initialMode={authMode}
        isOpen={isAuthOpen}
        onAuthenticated={handleAuthenticated}
        onClose={() => setIsAuthOpen(false)}
      />
    </>
  )
}
