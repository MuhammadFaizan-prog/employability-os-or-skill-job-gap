import { useEffect } from 'react'

interface PageMetaOptions {
  title: string
  description: string
  canonical?: string
  noIndex?: boolean
}

/**
 * usePageMeta — full per-page meta management for SPAs.
 * Sets title, description, canonical, og:description, twitter:description,
 * and optionally adds noindex for private/auth pages.
 *
 * Usage:
 *   usePageMeta({
 *     title: 'Skill Gap Analysis | Skill–Job Gap',
 *     description: 'Review your proficiency against role benchmarks...',
 *     canonical: 'https://www.skilljobgap.com/skills',
 *     noIndex: true,  // for auth-protected pages
 *   })
 */
export function usePageMeta({ title, description, canonical, noIndex = false }: PageMetaOptions): void {
  useEffect(() => {
    // Title
    document.title = title

    // Description
    const setMeta = (selector: string, attr: string, value: string) => {
      let el = document.querySelector<HTMLMetaElement>(selector)
      if (!el) {
        el = document.createElement('meta')
        const [attrName, attrVal] = attr.split('=')
        el.setAttribute(attrName, attrVal)
        document.head.appendChild(el)
      }
      el.setAttribute('content', value)
    }

    setMeta('meta[name="description"]', 'name=description', description)
    setMeta('meta[property="og:title"]', 'property=og:title', title)
    setMeta('meta[property="og:description"]', 'property=og:description', description)
    setMeta('meta[name="twitter:title"]', 'name=twitter:title', title)
    setMeta('meta[name="twitter:description"]', 'name=twitter:description', description)

    // Canonical
    if (canonical) {
      let canonEl = document.querySelector<HTMLLinkElement>('link[rel="canonical"]')
      if (!canonEl) {
        canonEl = document.createElement('link')
        canonEl.setAttribute('rel', 'canonical')
        document.head.appendChild(canonEl)
      }
      canonEl.setAttribute('href', canonical)
    }

    // noIndex for private/auth pages
    let robotsEl = document.querySelector<HTMLMetaElement>('meta[name="robots"]')
    if (!robotsEl) {
      robotsEl = document.createElement('meta')
      robotsEl.setAttribute('name', 'robots')
      document.head.appendChild(robotsEl)
    }
    robotsEl.setAttribute(
      'content',
      noIndex
        ? 'noindex, nofollow'
        : 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1'
    )
  }, [title, description, canonical, noIndex])
}
