import { useCallback, useEffect, useRef, useState } from 'react'
import { apiConfig } from '../../infrastructure/config/api'
import { AuthModal } from './AuthModal'

function getCountryLabel(speaker) {
  return `${speaker.countryCode || ''} ${speaker.country}`.trim()
}

function getSpeakerImageStyle(speaker, index) {
  if (index % 3 === 2) {
    return 'background:linear-gradient(135deg,var(--cerulean),var(--ink));'
  }

  if (speaker.featured) {
    return 'background:linear-gradient(135deg,var(--ink),var(--ink-mid));'
  }

  return ''
}

function renderSpeakersSection(container, speakers) {
  const speakersGrid = container.querySelector('.sec-speakers .columns.is-variable.is-3')
  if (!speakersGrid) {
    return
  }

  const speakerCards = speakers
    .slice(0, 4)
    .map((speaker, index) => {
      const expertise = Array.isArray(speaker.expertise) ? speaker.expertise.join(' | ') : ''
      return `
        <div class="column is-6-tablet is-3-desktop" data-anim="fade-up" data-anim-delay="${index * 80}">
          <div class="speaker-card">
            <div class="speaker-img" style="${getSpeakerImageStyle(speaker, index)}"><span class="speaker-initials">${speaker.initials}</span></div>
            <div class="speaker-info">
              <span class="speaker-name">${speaker.fullName}</span>
              <span class="speaker-role">${speaker.institution}</span>
              <p class="speaker-bio">${speaker.bio}</p>
              <span class="speaker-country">${getCountryLabel(speaker)}</span>
              ${expertise ? `<span class="speaker-country" style="opacity:1;margin-top:10px;">${expertise}</span>` : ''}
            </div>
          </div>
        </div>
      `
    })
    .join('')

  speakersGrid.innerHTML = speakerCards
}

function renderSpeakersPage(container, speakers) {
  const speakersGrid = container.querySelector('#page-conferencistas .columns.is-variable.is-3.is-multiline')
  if (!speakersGrid) {
    return
  }

  const speakerCards = speakers
    .map((speaker, index) => `
      <div class="column is-6-tablet is-3-desktop" data-anim="fade-up" data-anim-delay="${index * 80}">
        <div class="speaker-card">
          <div class="speaker-img" style="${getSpeakerImageStyle(speaker, index)}"><span class="speaker-initials">${speaker.initials}</span></div>
          <div class="speaker-info">
            <span class="speaker-name">${speaker.fullName}</span>
            <span class="speaker-role">${speaker.institution}</span>
            <p class="speaker-bio">${speaker.bio}</p>
            <span class="speaker-country">${getCountryLabel(speaker)}</span>
          </div>
        </div>
      </div>
    `)
    .join('')

  speakersGrid.innerHTML = speakerCards
}

function formatConferenceRange(conference) {
  try {
    const start = new Date(conference.startDate)
    const end = new Date(conference.endDate)
    const formatter = new Intl.DateTimeFormat('es-CO', {
      day: '2-digit',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
      timeZone: conference.timezone || 'UTC'
    })
    return `${formatter.format(start)} - ${formatter.format(end)}`
  } catch (_error) {
    return conference.modality || ''
  }
}

function renderConferencesPage(container, conferences) {
  const conferencesGrid = container.querySelector('#page-conferencias .columns.is-variable.is-5.is-multiline')
  if (!conferencesGrid) {
    return
  }

  const cards = conferences
    .map((conference, index) => `
      <div class="column is-4-desktop" data-anim="fade-up" data-anim-delay="${index * 100}">
        <div class="boleta-card">
          <div class="boleta-name">${conference.title}</div>
          <div class="boleta-for">${conference.category} · ${conference.modality}</div>
          <p class="acerca-lead" style="font-size:1rem;">${conference.description}</p>
          <p class="acerca-lead" style="font-size:.82rem; margin-top:16px; opacity:.8;">${formatConferenceRange(conference)} · ${conference.availableSeats} cupos disponibles</p>
          <a class="btn-register ${index % 3 === 0 ? 'btn-reg-gold' : index % 3 === 1 ? 'btn-reg-outline' : 'btn-reg-teal'}" onclick="navigate('cronograma')" href="#">Ver cronograma</a>
        </div>
      </div>
    `)
    .join('')

  conferencesGrid.innerHTML = cards
}

function formatAgendaTime(dateValue) {
  return new Intl.DateTimeFormat('es-CO', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
    timeZone: 'UTC'
  }).format(new Date(dateValue))
}

function buildAgendaPanels(entries) {
  const groups = new Map()

  entries.forEach((entry) => {
    const dateKey = new Date(entry.startsAt).toISOString().slice(0, 10)
    if (!groups.has(dateKey)) {
      groups.set(dateKey, [])
    }
    groups.get(dateKey).push(entry)
  })

  return Array.from(groups.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(0, 3)
    .map(([dateKey, dayEntries], index) => {
      const formattedDay = new Intl.DateTimeFormat('es-CO', { day: '2-digit', month: 'short', timeZone: 'UTC' }).format(new Date(dateKey))
      const button = `<button class="sched-tab-btn ${index === 0 ? 'active' : ''}" onclick="showDay('sd${index + 1}',this)">Día ${index + 1} &nbsp;·&nbsp; ${formattedDay}</button>`
      const panelRows = dayEntries
        .sort((a, b) => new Date(a.startsAt) - new Date(b.startsAt))
        .map((entry) => `
          <div class="sched-row">
            <div class="sched-time">${formatAgendaTime(entry.startsAt)}</div>
            <div>
              <span class="sched-badge badge-k">${entry.eventType || 'Agenda'}</span>
              <div class="sched-title">${entry.title}</div>
              <div class="sched-speaker">${entry.location || entry.owner || 'Programación oficial'}</div>
            </div>
          </div>
        `)
        .join('')
      const panel = `<div id="sd${index + 1}" class="sched-panel ${index === 0 ? 'active' : ''}">${panelRows}</div>`

      return { button, panel }
    })
}

function renderSchedulePage(container, entries) {
  const scheduleContainer = container.querySelector('#page-cronograma .container.py-6')
  if (!scheduleContainer || !entries.length) {
    return
  }

  const panels = buildAgendaPanels(entries)
  if (!panels.length) {
    return
  }

  scheduleContainer.innerHTML = `
    <div class="sched-tabs-wrap" data-anim="fade-up">
      ${panels.map((item) => item.button).join('')}
    </div>
    ${panels.map((item) => item.panel).join('')}
  `
}

export function LegacyLandingView({
  getLandingDocumentUseCase,
  getFeaturedSpeakersUseCase,
  getSpeakersUseCase,
  getPublishedConferencesUseCase,
  getMasterAgendaUseCase
}) {
  const containerRef = useRef(null)
  const [isAuthOpen, setIsAuthOpen] = useState(false)
  const [authMode, setAuthMode] = useState('login')

  const openAuthModal = useCallback((event, mode = 'login') => {
    if (event?.preventDefault) {
      event.preventDefault()
    }

    setAuthMode(mode)
    setIsAuthOpen(true)
  }, [])

  const closeAuthModal = useCallback(() => {
    setIsAuthOpen(false)
  }, [])

  const showAuthTab = useCallback((mode) => {
    setAuthMode(mode === 'register' ? 'register' : 'login')
  }, [])

  const installGlobalAuthHandlers = useCallback(() => {
    window.openAuthModal = (event) => openAuthModal(event, 'login')
    window.closeAuthModal = closeAuthModal
    window.showAuthTab = showAuthTab
  }, [closeAuthModal, openAuthModal, showAuthTab])

  const handleAuthenticated = useCallback(() => {
    if (typeof window.navigate === 'function') {
      window.navigate('boletas')
    }
  }, [])

  useEffect(() => {
    let mounted = true
    const injectedScripts = []

    const loadLegacyPage = async () => {
      const documentNode = await getLandingDocumentUseCase.execute()

      if (!mounted || !containerRef.current) {
        return
      }

      document.title = documentNode.title || 'CONIITI 2025'
      documentNode.getElementById('auth-modal')?.remove()

      const [featuredResult, speakersResult, conferencesResult, agendaResult] = await Promise.allSettled([
        getFeaturedSpeakersUseCase.execute(),
        getSpeakersUseCase.execute(),
        getPublishedConferencesUseCase.execute(),
        getMasterAgendaUseCase.execute()
      ])

      const featuredSpeakers = featuredResult.status === 'fulfilled' ? featuredResult.value : []
      const speakers = speakersResult.status === 'fulfilled' ? speakersResult.value : []
      const conferences = conferencesResult.status === 'fulfilled' ? conferencesResult.value : []
      const agendaEntries = agendaResult.status === 'fulfilled' ? agendaResult.value : []

      const bodyNodes = Array.from(documentNode.body.childNodes)
      const scriptNodes = bodyNodes.filter((node) => node.nodeName.toLowerCase() === 'script')

      bodyNodes.forEach((node) => {
        if (node.nodeName.toLowerCase() === 'script') {
          node.remove()
        }
      })

      containerRef.current.innerHTML = documentNode.body.innerHTML

      if (featuredSpeakers.length) {
        renderSpeakersSection(containerRef.current, featuredSpeakers)
      }

      if (speakers.length) {
        renderSpeakersPage(containerRef.current, speakers)
      }

      if (conferences.length) {
        renderConferencesPage(containerRef.current, conferences)
      }

      if (agendaEntries.length) {
        renderSchedulePage(containerRef.current, agendaEntries)
      }

      window.CONITI_CONFIG = {
        authApiUrl: apiConfig.authApiUrl,
        conferencesApiUrl: apiConfig.conferencesApiUrl,
        datesApiUrl: apiConfig.datesApiUrl,
        speakersApiUrl: apiConfig.speakersApiUrl
      }

      scriptNodes.forEach((oldScript) => {
        const script = document.createElement('script')
        Array.from(oldScript.attributes).forEach((attr) => {
          script.setAttribute(attr.name, attr.value)
        })
        script.text = oldScript.textContent || ''
        containerRef.current.appendChild(script)
        injectedScripts.push(script)
      })

      installGlobalAuthHandlers()
    }

    installGlobalAuthHandlers()
    loadLegacyPage()

    return () => {
      mounted = false
      delete window.openAuthModal
      delete window.closeAuthModal
      delete window.showAuthTab
      injectedScripts.forEach((script) => script.remove())
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [
    getFeaturedSpeakersUseCase,
    getLandingDocumentUseCase,
    getMasterAgendaUseCase,
    getPublishedConferencesUseCase,
    getSpeakersUseCase,
    installGlobalAuthHandlers
  ])

  return (
    <>
      <div ref={containerRef} />
      <AuthModal
        initialMode={authMode}
        isOpen={isAuthOpen}
        onAuthenticated={handleAuthenticated}
        onClose={closeAuthModal}
      />
    </>
  )
}
