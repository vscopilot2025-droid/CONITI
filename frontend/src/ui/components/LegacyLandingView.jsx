import { useEffect, useRef } from 'react'

export function LegacyLandingView({ getLandingDocumentUseCase }) {
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

      const bodyNodes = Array.from(documentNode.body.childNodes)
      const scriptNodes = bodyNodes.filter((node) => node.nodeName.toLowerCase() === 'script')

      bodyNodes.forEach((node) => {
        if (node.nodeName.toLowerCase() === 'script') {
          node.remove()
        }
      })

      containerRef.current.innerHTML = documentNode.body.innerHTML

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
  }, [getLandingDocumentUseCase])

  return <div ref={containerRef} />
}
