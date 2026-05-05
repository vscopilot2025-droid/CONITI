import { useEffect, useMemo, useState } from 'react'
import { GetFeaturedSpeakers } from '../application/use-cases/GetFeaturedSpeakers'
import { GetMasterAgenda } from '../application/use-cases/GetMasterAgenda'
import { GetPublishedConferences } from '../application/use-cases/GetPublishedConferences'
import { GetSpeakers } from '../application/use-cases/GetSpeakers'
import { HttpConferenceRepository } from '../infrastructure/repositories/HttpConferenceRepository'
import { apiConfig, buildApiUrl } from '../infrastructure/config/api'
import { HttpScheduleRepository } from '../infrastructure/repositories/HttpScheduleRepository'
import { HttpSpeakerRepository } from '../infrastructure/repositories/HttpSpeakerRepository'
import { AuthModal } from './components/AuthModal'

const authStorageKey = 'coniti.auth'

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
    title: 'Visitante',
    subtitle: 'Público general',
    price: '180K',
    buttonClass: 'btn-reg-outline',
    features: [
      'Acceso a conferencias magistrales',
      'Material digital del evento',
      'Certificado de asistencia',
      'Feria de innovación tecnológica'
    ]
  },
  {
    title: 'Ponente',
    subtitle: 'Investigadores y académicos',
    price: '320K',
    featured: true,
    buttonClass: 'btn-reg-gold',
    features: [
      'Todo el paquete Visitante',
      'Publicación en memorias IEEE',
      'Presentación de artículo o póster',
      'Acceso a sesiones cerradas',
      'Almuerzo incluido los 3 días'
    ]
  },
  {
    title: 'Estudiante',
    subtitle: 'Pregrado y posgrado',
    price: '90K',
    buttonClass: 'btn-reg-teal',
    features: [
      'Conferencias y talleres',
      'Certificado de participación',
      'Mentorías con conferencistas',
      'Red de contactos estudiantil'
    ]
  }
]

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
  ['bi-envelope', 'Correo electrónico', 'coniiti2025@ucatolica.edu.co'],
  ['bi-telephone', 'Teléfono', '+57 (601) 327 7300 Ext. 5000'],
  ['bi-geo-alt', 'Dirección', 'Av. Caracas #46-72, Bogotá D.C.'],
  ['bi-clock', 'Horario', 'Lun – Vie, 8:00 AM – 5:00 PM']
]

const contactOptions = [
  'Inscripción y boletas',
  'Ponencias y abstracts',
  'Patrocinio',
  'Prensa y medios',
  'Otra consulta'
]

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

function formatAgendaTime(value) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }).format(new Date(value))
}

function normalizeConferenceCards(conferences) {
  if (!conferences.length) {
    return defaultConferences
  }

  return conferences.slice(0, 6).map((conference, index) => ({
    title: conference.title,
    subtitle: `${conference.category} · ${conference.modality}`,
    description: conference.description,
    meta: `${formatDateRange(conference.startDate, conference.endDate, conference.timezone)} · ${conference.availableSeats} cupos`,
    action: index % 2 === 0 ? 'Ver cronograma' : 'Conferencistas',
    actionClass: index % 3 === 0 ? 'btn-reg-gold' : index % 3 === 1 ? 'btn-reg-outline' : 'btn-reg-teal',
    target: index % 2 === 0 ? 'cronograma' : 'conferencistas'
  }))
}

function normalizeScheduleDays(entries) {
  if (!entries.length) {
    return [
      {
        label: 'Día 1 · Oct 15',
        rows: [
          ['8:00 AM', 'Registro', 'Acreditación y bienvenida', 'Comité organizador CONIITI', 'badge-br'],
          ['9:00 AM', 'Keynote', 'Ingeniería e innovación: el puente entre Italia y América Latina', 'Giuseppe Moretti · Politecnico di Milano', 'badge-k'],
          ['11:00 AM', 'Panel', 'Transformación digital en la industria 4.0', 'Panel internacional de expertos', 'badge-p']
        ]
      },
      {
        label: 'Día 2 · Oct 16',
        rows: [
          ['9:00 AM', 'Keynote', 'Nanomateriales: la próxima revolución industrial', 'Laura Fontana · Università di Bologna', 'badge-k'],
          ['11:00 AM', 'Panel', 'Energías renovables para una ingeniería sostenible', 'Dr. Jorge Arévalo · Universidad Nacional', 'badge-p']
        ]
      },
      {
        label: 'Día 3 · Oct 17',
        rows: [
          ['9:00 AM', 'Keynote', 'El futuro de la movilidad: ciudades inteligentes e infraestructura', '', 'badge-k'],
          ['3:00 PM', 'Ceremonia', 'Premiación de mejores trabajos y clausura oficial', '', 'badge-br']
        ]
      }
    ]
  }

  const grouped = new Map()
  entries.forEach((entry) => {
    const key = new Date(entry.startsAt).toISOString().slice(0, 10)
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(entry)
  })

  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 3)
    .map(([date, dayEntries], index) => ({
      label: `Día ${index + 1} · ${new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(date))}`,
      rows: dayEntries
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
        .map((entry) => [
          formatAgendaTime(entry.startsAt),
          entry.eventType || 'Agenda',
          entry.title,
          entry.location || entry.owner || '',
          index % 3 === 0 ? 'badge-k' : index % 3 === 1 ? 'badge-p' : 'badge-t'
        ])
    }))
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
                <p className="footer-brand-sub">Congreso Internacional de Innovación y Tendencias en Ingeniería. Universidad Católica de Colombia · 2025</p>
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
                    <a href="https://maps.google.com" target="_blank" rel="noreferrer" className="map-link">
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
          <p className="footer-copy mb-0">{full ? '© 2025 CONIITI — Universidad Católica de Colombia. Todos los derechos reservados.' : '© 2025 CONIITI — Universidad Católica de Colombia.'}</p>
          <p className="footer-motto mb-0">Con il cuore in Italia 🇮🇹</p>
        </div>
      </div>
    </footer>
  )
}

function HomePage({ featuredSpeakers, currentHomeSlide, onHomeSlide, countdown, onOpenAuth, onNavigate }) {
  const nextSlide = () => onHomeSlide((currentHomeSlide + 1) % 2)
  const prevSlide = () => onHomeSlide((currentHomeSlide + 1) % 2)

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

              <div className="container" style={{ width: '100%', maxWidth: 1340, padding: '0 60px', position: 'relative', zIndex: 2 }}>
                <div className="columns is-vcentered" style={{ minHeight: 'calc(100vh - 170px)', paddingTop: 60 }}>
                  <div className="column is-8-widescreen is-10-desktop">
                    <div className="hero-overline">
                      <span className="hero-overline-bar" />
                      <span className="hero-overline-text">Universidad Católica de Colombia · X Edición</span>
                    </div>

                    <h1 className="hero-title">CONIITI</h1>
                    <span className="hero-title-ghost">2025</span>

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
                  <div className="hero-sidebar-val">Oct 15–17</div>
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
                  <div className="hero-sidebar-val">X · Décima</div>
                </div>
              </div>

              <div className="stats-band" style={{ position: 'absolute', bottom: 0, left: 0, right: 0 }}>
                <div className="columns is-gapless mb-0">
                  <div className="column"><div className="stat-unit"><span className="stat-num">{featuredSpeakers.length || 48}</span><span className="stat-lbl">Conferencistas</span></div></div>
                  <div className="column"><div className="stat-unit"><span className="stat-num">12</span><span className="stat-lbl">Países</span></div></div>
                  <div className="column"><div className="stat-unit"><span className="stat-num">6</span><span className="stat-lbl">Líneas temáticas</span></div></div>
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
                    <span className="section-eyebrow eyebrow-gold">País invitado · 2025</span>
                    <h2 className="pais-giant">
                      Italia
                      <span className="pais-em">La República Italiana</span>
                    </h2>
                    <p className="pais-desc">
                      Italia, cuna del Renacimiento y la innovación, llega a CONIITI 2025 trayendo su legado de excelencia en diseño, ingeniería y ciencia para inspirar a la próxima generación de ingenieros latinoamericanos.
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
                ['20', 'Sep', 'Cierre de inscripciones con descuento', 'Precio reducido disponible hasta esta fecha. Luego aplica tarifa regular.'],
                ['30', 'Sep', 'Entrega de artículos completos', 'Fecha límite para cargar las versiones definitivas de los artículos aceptados.'],
                ['15', 'Oct', '¡Inauguración del Congreso!', 'Apertura oficial de CONIITI 2025 en la Universidad Católica de Colombia, Bogotá.']
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
            <div className="column is-6-desktop" data-anim="fade-left" data-anim-delay="100" style={{ paddingTop: 320 }}>
              <div className="timeline-card">
                <p className="tl-head">Línea de tiempo 2025</p>
                <div className="tl-list">
                  {[
                    ['Agosto 2025', 'Convocatoria abierta', true],
                    ['Septiembre 2025', 'Evaluación y selección de ponencias'],
                    ['1 – 14 Oct 2025', 'Registro de asistentes'],
                    ['15 – 17 Oct 2025', 'Congreso CONIITI 2025'],
                    ['Noviembre 2025', 'Publicación de memorias oficiales']
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
            Bogotá D.C., Colombia · 15, 16 y 17 de Octubre de 2025
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
          <div className="columns is-variable is-3">
            {featuredSpeakers.slice(0, 4).map((speaker, index) => (
              <div className="column is-6-tablet is-3-desktop" data-anim="fade-up" data-anim-delay={index * 80} key={speaker.slug || speaker.fullName}>
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
        </div>
      </section>

      <SimpleFooter full />
    </div>
  )
}

function ConferencesPage({ conferenceCards, onNavigate }) {
  return (
    <div className="page active" id="page-conferencias">
      <div className="page-band" data-bg="CONFERENCIAS">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Programa académico</span>
          <h1>Conferencias</h1>
        </div>
      </div>

      <div className="container py-6" style={{ maxWidth: 1180 }}>
        <div className="columns is-variable is-5 is-multiline">
          {conferenceCards.map((conference, index) => (
            <div className="column is-4-desktop" data-anim="fade-up" data-anim-delay={index * 100} key={`${conference.title}-${index}`}>
              <div className="boleta-card">
                <div className="boleta-name">{conference.title}</div>
                <div className="boleta-for">{conference.subtitle}</div>
                <p className="acerca-lead" style={{ fontSize: '1rem' }}>{conference.description}</p>
                {'meta' in conference ? <p className="acerca-lead" style={{ fontSize: '.82rem', marginTop: 16 }}>{conference.meta}</p> : null}
                <a className={`btn-register ${conference.actionClass}`} onClick={(event) => { event.preventDefault(); onNavigate(conference.target) }} href="#">{conference.action}</a>
              </div>
            </div>
          ))}
        </div>
      </div>

      <SimpleFooter />
    </div>
  )
}

function SpeakersPage({ speakers }) {
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
          <div className="columns is-variable is-3 is-multiline">
            {speakers.map((speaker, index) => (
              <div className="column is-6-tablet is-3-desktop" data-anim="fade-up" data-anim-delay={index * 80} key={speaker.slug || speaker.fullName}>
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

function SchedulePage({ scheduleDays, dayIndex, onChangeDay }) {
  return (
    <div className="page active" id="page-cronograma">
      <div className="page-band" data-bg="CRONOGRAMA">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Programa oficial</span>
          <h1>Cronograma 2025</h1>
        </div>
      </div>

      <div className="container py-6" style={{ maxWidth: 960 }}>
        <div className="sched-tabs-wrap" data-anim="fade-up">
          {scheduleDays.map((day, index) => (
            <button className={`sched-tab-btn${index === dayIndex ? ' active' : ''}`} key={day.label} onClick={() => onChangeDay(index)}>{day.label}</button>
          ))}
        </div>

        {scheduleDays.map((day, index) => (
          <div id={`sd${index + 1}`} className={`sched-panel${index === dayIndex ? ' active' : ''}`} key={day.label}>
            {day.rows.map(([time, badge, title, speaker, badgeClass]) => (
              <div className="sched-row" key={`${time}-${title}`}>
                <div className="sched-time">{time}</div>
                <div>
                  <span className={`sched-badge ${badgeClass}`}>{badge}</span>
                  <div className="sched-title">{title}</div>
                  {speaker ? <div className="sched-speaker">{speaker}</div> : null}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>

      <SimpleFooter />
    </div>
  )
}

function TicketsPage() {
  return (
    <div className="page active" id="page-boletas">
      <div className="page-band" data-bg="BOLETAS">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Inscripciones abiertas</span>
          <h1>Boletas de Acceso</h1>
        </div>
      </div>

      <div className="container py-6" style={{ maxWidth: 1100 }}>
        <div className="columns is-variable is-4">
          {defaultTickets.map((ticket, index) => (
            <div className="column is-4-desktop" data-anim="fade-up" data-anim-delay={index * 120} key={ticket.title}>
              <div className={`boleta-card${ticket.featured ? ' featured' : ''}`} style={ticket.featured ? { marginTop: -12 } : undefined}>
                {ticket.featured ? <div className="boleta-hot-tag">Más popular</div> : null}
                <div className="boleta-name">{ticket.title}</div>
                <div className="boleta-for">{ticket.subtitle}</div>
                <div className="boleta-price"><sup>COP</sup> {ticket.price}</div>
                <ul className="boleta-features">
                  {ticket.features.map((feature) => <li className="boleta-feature" key={feature}>{feature}</li>)}
                </ul>
                <a className={`btn-register ${ticket.buttonClass}`} href="#" onClick={(event) => event.preventDefault()}>Comprar aquí</a>
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

function ContactPage() {
  return (
    <div className="page active" id="page-contacto" style={{ background: 'var(--ink)' }}>
      <div className="page-band" data-bg="CONTACTO">
        <div className="container" style={{ maxWidth: 1200 }}>
          <span className="section-eyebrow eyebrow-gold">Escríbenos</span>
          <h1>Contacto</h1>
        </div>
      </div>

      <div className="py-6" style={{ background: 'var(--ink)' }}>
        <div className="container" style={{ maxWidth: 1100 }}>
          <div className="columns is-variable is-8">
            <div className="column is-4-desktop" data-anim="fade-right">
              <span className="section-eyebrow eyebrow-gold" style={{ marginBottom: 32, display: 'block' }}>Información de contacto</span>
              {contactItems.map(([icon, label, value]) => (
                <div className="contact-item" key={label}>
                  <div className="contact-icon"><i className={`bi ${icon}`} /></div>
                  <div><div className="contact-label">{label}</div><div className="contact-value">{value}</div></div>
                </div>
              ))}
            </div>

            <div className="column is-8-desktop" data-anim="fade-left">
              <form onSubmit={(event) => event.preventDefault()}>
                <div className="columns is-variable is-3 is-multiline">
                  <div className="column is-6"><label className="form-label-custom">Nombre</label><input className="form-input" type="text" placeholder="Tu nombre" /></div>
                  <div className="column is-6"><label className="form-label-custom">Apellido</label><input className="form-input" type="text" placeholder="Tu apellido" /></div>
                  <div className="column is-12"><label className="form-label-custom">Correo electrónico</label><input className="form-input" type="email" placeholder="correo@ejemplo.com" /></div>
                  <div className="column is-6"><label className="form-label-custom">Institución</label><input className="form-input" type="text" placeholder="Tu universidad o empresa" /></div>
                  <div className="column is-6">
                    <label className="form-label-custom">Tipo de consulta</label>
                    <select className="form-input">
                      <option value="">Selecciona una opción</option>
                      {contactOptions.map((option) => <option key={option}>{option}</option>)}
                    </select>
                  </div>
                  <div className="column is-12"><label className="form-label-custom">Mensaje</label><textarea className="form-input" rows="5" placeholder="Escribe tu mensaje aquí..." /></div>
                  <div className="column is-12">
                    <button type="submit" className="btn-primary" style={{ cursor: 'pointer', clipPath: 'none' }}>
                      <i className="bi bi-send" /> Enviar mensaje
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
  const diff = new Date('2025-10-15T08:00:00') - new Date()
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
  const [authMode, setAuthMode] = useState('login')
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authSession, setAuthSession] = useState(null)
  const [currentHomeSlide, setCurrentHomeSlide] = useState(0)
  const [countdown, setCountdown] = useState(buildCountdown())
  const [scheduleDayIndex, setScheduleDayIndex] = useState(0)
  const [featuredSpeakers, setFeaturedSpeakers] = useState([
    { fullName: 'Giuseppe Moretti', initials: 'GM', institution: 'Politecnico di Milano', bio: 'Experto en robótica avanzada y sistemas autónomos con 25 años de investigación en Europa.', country: 'Italia', countryCode: 'IT', featured: true },
    { fullName: 'Claudia Russo', initials: 'CR', institution: 'Università La Sapienza', bio: 'Pionera en inteligencia artificial aplicada a la ingeniería biomédica y salud digital.', country: 'Italia', countryCode: 'IT', featured: true },
    { fullName: 'Dr. Jorge Arévalo', initials: 'JA', institution: 'Universidad Nacional', bio: 'Investigador líder en energías renovables y sostenibilidad para Latinoamérica.', country: 'Colombia', countryCode: 'CO', featured: true },
    { fullName: 'Laura Fontana', initials: 'LF', institution: 'Università di Bologna', bio: 'Especialista en nanomateriales y su aplicación en la ingeniería de materiales del futuro.', country: 'Italia', countryCode: 'IT', featured: true }
  ])
  const [speakers, setSpeakers] = useState(featuredSpeakers)
  const [conferenceCards, setConferenceCards] = useState(defaultConferences)
  const [scheduleDays, setScheduleDays] = useState(normalizeScheduleDays([]))
  const [featuredSpeakersLoaded, setFeaturedSpeakersLoaded] = useState(false)
  const [speakersLoaded, setSpeakersLoaded] = useState(false)
  const [conferenceCardsLoaded, setConferenceCardsLoaded] = useState(false)
  const [scheduleDaysLoaded, setScheduleDaysLoaded] = useState(false)

  useEffect(() => {
    const storedValue = localStorage.getItem(authStorageKey)
    if (!storedValue) {
      return undefined
    }

    let storedSession = null
    try {
      storedSession = JSON.parse(storedValue)
    } catch (_error) {
      localStorage.removeItem(authStorageKey)
      return undefined
    }

    if (!storedSession?.user) {
      localStorage.removeItem(authStorageKey)
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
          localStorage.removeItem(authStorageKey)
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
          localStorage.setItem(authStorageKey, JSON.stringify(refreshedSession))
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
  }, [page, currentHomeSlide, scheduleDayIndex, conferenceCards, featuredSpeakers, speakers, scheduleDays])

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

        if (page === 'conferencistas' && !speakersLoaded) {
          const result = await getSpeakersUseCase.execute()
          if (!active) return
          if (result.length) setSpeakers(result)
          setSpeakersLoaded(true)
          return
        }

        if (page === 'conferencias' && !conferenceCardsLoaded) {
          const result = await getPublishedConferencesUseCase.execute()
          if (!active) return
          if (result.length) setConferenceCards(normalizeConferenceCards(result))
          setConferenceCardsLoaded(true)
          return
        }

        if (page === 'cronograma' && !scheduleDaysLoaded) {
          const result = await getMasterAgendaUseCase.execute()
          if (!active) return
          if (result.length) setScheduleDays(normalizeScheduleDays(result))
          setScheduleDaysLoaded(true)
        }
      } catch {
        if (!active) return

        if (page === 'inicio') setFeaturedSpeakersLoaded(true)
        if (page === 'conferencistas') setSpeakersLoaded(true)
        if (page === 'conferencias') setConferenceCardsLoaded(true)
        if (page === 'cronograma') setScheduleDaysLoaded(true)
      }
    }

    loadDataForPage()

    return () => {
      active = false
    }
  }, [page, featuredSpeakersLoaded, speakersLoaded, conferenceCardsLoaded, scheduleDaysLoaded])

  const currentView = useMemo(() => {
    switch (page) {
      case 'inicio':
        return <HomePage featuredSpeakers={featuredSpeakers} currentHomeSlide={currentHomeSlide} onHomeSlide={setCurrentHomeSlide} countdown={countdown} onOpenAuth={handleAuthEntry} onNavigate={setPage} />
      case 'conferencias':
        return <ConferencesPage conferenceCards={conferenceCards} onNavigate={setPage} />
      case 'conferencistas':
        return <SpeakersPage speakers={speakers} />
      case 'comite':
        return <CommitteePage />
      case 'participacion':
        return <ParticipationPage onNavigate={setPage} />
      case 'cronograma':
        return <SchedulePage scheduleDays={scheduleDays} dayIndex={scheduleDayIndex} onChangeDay={setScheduleDayIndex} />
      case 'boletas':
        return <TicketsPage />
      case 'lineas':
        return <TopicsPage />
      case 'nosotros':
        return <AboutPage />
      case 'contacto':
        return <ContactPage />
      default:
        return <HomePage featuredSpeakers={featuredSpeakers} currentHomeSlide={currentHomeSlide} onHomeSlide={setCurrentHomeSlide} countdown={countdown} onOpenAuth={handleAuthEntry} onNavigate={setPage} />
    }
  }, [authSession, conferenceCards, countdown, currentHomeSlide, featuredSpeakers, page, scheduleDayIndex, scheduleDays, speakers])

  function handleNavigate(nextPage) {
    setPage(nextPage)
    setDropdownOpen(false)
    setScheduleDayIndex(0)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  function handleAuthEntry() {
    if (authSession?.user) {
      setPage('boletas')
      return
    }

    setAuthMode('login')
    setIsAuthOpen(true)
  }

  function handleAuthenticated(payload) {
    if (payload?.user) {
      setAuthSession({
        token: payload.token,
        tokenType: payload.tokenType || 'Bearer',
        user: payload.user
      })
    }

    setIsAuthOpen(false)
    setPage('boletas')
  }

  function handleLogout() {
    localStorage.removeItem(authStorageKey)
    setAuthSession(null)
    setIsAuthOpen(false)
    setPage('inicio')
    setDropdownOpen(false)
  }

  return (
    <>
      <nav className="coniiti-navbar" id="main-nav">
        <div className="navbar-inner">
          <a className="brand" href="#" onClick={(event) => { event.preventDefault(); handleNavigate('inicio') }}>
            <span className="brand-mark">CONIITI</span>
            <span className="brand-year">Bogotá · 2025</span>
          </a>

          <ul className="nav-links">
            <li><a id="nav-inicio" className={page === 'inicio' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('inicio') }} href="#">Inicio</a></li>
            <li><a id="nav-conferencias" className={page === 'conferencias' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('conferencias') }} href="#">Conferencias</a></li>
            <li><a id="nav-cronograma" className={page === 'cronograma' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('cronograma') }} href="#">Cronograma</a></li>
            <li><a id="nav-conferencistas" className={page === 'conferencistas' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('conferencistas') }} href="#">Conferencistas</a></li>
            <li><a id="nav-nosotros" className={page === 'nosotros' ? 'active' : ''} onClick={(event) => { event.preventDefault(); handleNavigate('nosotros') }} href="#">Nosotros</a></li>
            <li className={`has-dropdown${dropdownOpen ? ' open' : ''}`}>
              <button id="nav-mas" type="button" className={['comite', 'participacion', 'lineas', 'boletas', 'contacto'].includes(page) ? 'active' : ''} onClick={() => setDropdownOpen((current) => !current)} aria-expanded={dropdownOpen}>
                Más sobre nosotros <i className="bi bi-chevron-down ms-1" style={{ fontSize: '.5rem' }} />
              </button>
              <div className="nav-dropdown">
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('comite') }}><span className="dot" /> Comité</a>
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('participacion') }}><span className="dot" /> Guía de participación</a>
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('lineas') }}><span className="dot" /> Líneas temáticas</a>
                <a href="#" onClick={(event) => { event.preventDefault(); handleNavigate('boletas') }}><span className="dot" /> Inscripciones</a>
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
