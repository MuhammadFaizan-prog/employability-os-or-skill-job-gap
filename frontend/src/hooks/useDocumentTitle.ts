import { useEffect } from 'react'

const SITE_NAME = 'Skill–Job Gap'

/**
 * useDocumentTitle — sets the browser/tab title and updates the og:title and
 * twitter:title meta tags dynamically for SPA-route-level SEO.
 *
 * Usage:
 *   useDocumentTitle('Skill Gap Analysis')
 *   // → "Skill Gap Analysis | Skill–Job Gap"
 *
 *   useDocumentTitle('Home', true)  // pass `root=true` for the homepage
 *   // → "Skill–Job Gap | AI-Powered Career Readiness & Skills Assessment Platform"
 */
export function useDocumentTitle(pageTitle: string, root = false): void {
  useEffect(() => {
    const fullTitle = root
      ? `${SITE_NAME} | AI-Powered Career Readiness & Skills Assessment Platform`
      : `${pageTitle} | ${SITE_NAME}`

    document.title = fullTitle

    // Update OG title
    let ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]')
    if (!ogTitle) {
      ogTitle = document.createElement('meta')
      ogTitle.setAttribute('property', 'og:title')
      document.head.appendChild(ogTitle)
    }
    ogTitle.setAttribute('content', fullTitle)

    // Update Twitter title
    let twTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]')
    if (!twTitle) {
      twTitle = document.createElement('meta')
      twTitle.setAttribute('name', 'twitter:title')
      document.head.appendChild(twTitle)
    }
    twTitle.setAttribute('content', fullTitle)

    // Restore to homepage title on unmount
    return () => {
      document.title = `${SITE_NAME} | AI-Powered Career Readiness & Skills Assessment Platform`
    }
  }, [pageTitle, root])
}
