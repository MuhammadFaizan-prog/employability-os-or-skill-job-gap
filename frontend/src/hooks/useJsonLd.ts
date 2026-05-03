import { useEffect } from 'react'

/**
 * useJsonLd — injects a per-page JSON-LD <script> tag into <head>
 * and removes it on route change / unmount.
 *
 * Usage:
 *   useJsonLd({ "@context": "https://schema.org", "@type": "FAQPage", ... })
 */
export function useJsonLd(schema: Record<string, unknown>): void {
  useEffect(() => {
    const scriptId = `jsonld-page-${schema['@type'] ?? 'schema'}`
    // Remove existing to avoid duplicates on route change
    const existing = document.getElementById(scriptId)
    if (existing) existing.remove()

    const script = document.createElement('script')
    script.type = 'application/ld+json'
    script.id = scriptId
    script.textContent = JSON.stringify(schema)
    document.head.appendChild(script)

    return () => {
      const el = document.getElementById(scriptId)
      if (el) el.remove()
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps
}
