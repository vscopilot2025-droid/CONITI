import { useEffect, useRef } from 'react'

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

export function LegacyLandingView({ getLandingDocumentUseCase, getFeaturedSpeakersUseCase }) {
  const containerRef = useRef(null)

  useEffect(() => {
    let mounted = true
    const injectedScripts = []

    const loadLegacyPage = async () => {
      const documentNode = await getLandingDocumentUseCase.execute()

      if (!mounted || !containerRef.current) {
        return
      }

      document.title = documentNode.title || 'CONIITI 2025'

      let speakers = []
      try {
        speakers = await getFeaturedSpeakersUseCase.execute()
      } catch (_error) {
        speakers = []
      }

      const bodyNodes = Array.from(documentNode.body.childNodes)
      const scriptNodes = bodyNodes.filter((node) => node.nodeName.toLowerCase() === 'script')

      bodyNodes.forEach((node) => {
        if (node.nodeName.toLowerCase() === 'script') {
          node.remove()
        }
      })

      containerRef.current.innerHTML = documentNode.body.innerHTML

      if (speakers.length) {
        renderSpeakersSection(containerRef.current, speakers)
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
    }

    loadLegacyPage()

    return () => {
      mounted = false
      injectedScripts.forEach((script) => script.remove())
      if (containerRef.current) {
        containerRef.current.innerHTML = ''
      }
    }
  }, [getFeaturedSpeakersUseCase, getLandingDocumentUseCase])

  return <div ref={containerRef} />
}
