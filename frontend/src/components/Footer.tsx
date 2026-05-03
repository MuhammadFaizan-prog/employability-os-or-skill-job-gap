import { Link } from 'react-router-dom'

/**
 * Footer — SEO & E-E-A-T component.
 *
 * Provides:
 * - Crawlable <a> links to all public pages (important since nav uses buttons)
 * - Legal page links (Privacy, Terms) for E-E-A-T trust signals
 * - Semantic <footer> landmark for accessibility and crawler parsing
 * - Organization name + copyright for entity recognition
 */
export function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer
      role="contentinfo"
      aria-label="Site footer"
      style={{
        borderTop: '1px solid var(--border-color)',
        padding: '3rem 2rem 2rem',
        marginTop: 'auto',
        background: 'var(--bg)',
      }}
    >
      <div
        style={{
          maxWidth: 1100,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem',
        }}
      >
        {/* Brand */}
        <div>
          <Link
            to="/"
            style={{
              fontWeight: 700,
              fontSize: '1.1rem',
              textDecoration: 'none',
              color: 'var(--fg)',
              display: 'block',
              marginBottom: '0.75rem',
            }}
          >
            Skill–Job Gap
          </Link>
          <p style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', lineHeight: 1.6, margin: 0 }}>
            AI-powered career readiness and skill gap analysis platform.
          </p>
        </div>

        {/* Platform links — crawlable <a> tags fixing T8 finding */}
        <nav aria-label="Platform navigation">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Platform
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/signup" style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>Get Started Free</Link></li>
            <li><Link to="/login" style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>Sign In</Link></li>
            <li><a href="/#faq" style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>FAQ</a></li>
          </ul>
        </nav>

        {/* Resources */}
        <nav aria-label="Resources navigation">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Resources
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><a href="/llms.txt" style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>AI Context (llms.txt)</a></li>
            <li><a href="/sitemap.xml" style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>Sitemap</a></li>
          </ul>
        </nav>

        {/* Legal — E-E-A-T signals */}
        <nav aria-label="Legal navigation">
          <h3 style={{ fontSize: '0.875rem', fontWeight: 600, marginBottom: '0.75rem', color: 'var(--fg)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            Legal
          </h3>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            <li><Link to="/privacy" style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>Privacy Policy</Link></li>
            <li><Link to="/terms" style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', textDecoration: 'none' }}>Terms of Service</Link></li>
          </ul>
        </nav>
      </div>

      {/* Bottom bar */}
      <div
        style={{
          maxWidth: 1100,
          margin: '2rem auto 0',
          paddingTop: '1.5rem',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '0.5rem',
        }}
      >
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-dark)', margin: 0 }}>
          &copy; {currentYear} Skill–Job Gap. All rights reserved.
        </p>
        <p style={{ fontSize: '0.8rem', color: 'var(--gray-dark)', margin: 0 }}>
          Built to close the gap between skills and opportunities.
        </p>
      </div>
    </footer>
  )
}
