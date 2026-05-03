import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function Privacy() {
  usePageMeta({
    title: 'Privacy Policy | Skill–Job Gap',
    description: 'Learn how Skill–Job Gap collects, uses, and protects your personal data. We are committed to transparency and your privacy.',
    canonical: 'https://www.skilljobgap.com/privacy',
    noIndex: false,
  })

  const lastUpdated = '3 May 2026'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-dark)' }}>
          <li><Link to="/" style={{ color: 'var(--gray-dark)', textDecoration: 'none' }}>Home</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Privacy Policy</li>
        </ol>
      </nav>

      <h1>Privacy Policy</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '2rem' }}>Last updated: {lastUpdated}</p>

      <section aria-labelledby="intro-heading">
        <h2 id="intro-heading">1. Introduction</h2>
        <p>Skill–Job Gap ("we", "our", "us") operates the career readiness and skill gap analysis platform at <strong>skilljobgap.com</strong>. This Privacy Policy explains what personal data we collect, how we use it, and your rights.</p>
      </section>

      <section aria-labelledby="data-heading" style={{ marginTop: '2rem' }}>
        <h2 id="data-heading">2. Data We Collect</h2>
        <ul>
          <li><strong>Account data:</strong> Name, email address, and password hash when you register.</li>
          <li><strong>Assessment data:</strong> Skill proficiency ratings, role selection, and assessment responses.</li>
          <li><strong>Usage data:</strong> Pages visited, feature interactions, and session timestamps.</li>
          <li><strong>Uploaded content:</strong> Resume files you choose to upload for analysis.</li>
        </ul>
      </section>

      <section aria-labelledby="use-heading" style={{ marginTop: '2rem' }}>
        <h2 id="use-heading">3. How We Use Your Data</h2>
        <ul>
          <li>To provide and personalize the career readiness assessment and learning roadmap.</li>
          <li>To calculate your employability score and skill gap analysis.</li>
          <li>To send essential account-related communications (no marketing without consent).</li>
          <li>To improve platform features using anonymized, aggregated analytics.</li>
        </ul>
      </section>

      <section aria-labelledby="storage-heading" style={{ marginTop: '2rem' }}>
        <h2 id="storage-heading">4. Data Storage and Security</h2>
        <p>Your data is stored on <strong>Supabase</strong> infrastructure with row-level security enforced. We use industry-standard encryption in transit (TLS 1.3) and at rest. We do not sell your personal data to third parties.</p>
      </section>

      <section aria-labelledby="rights-heading" style={{ marginTop: '2rem' }}>
        <h2 id="rights-heading">5. Your Rights</h2>
        <p>You have the right to access, correct, export, or delete your personal data at any time. To exercise these rights, contact us at the address below.</p>
      </section>

      <section aria-labelledby="contact-heading" style={{ marginTop: '2rem' }}>
        <h2 id="contact-heading">6. Contact Us</h2>
        <p>Questions about this policy? Contact: <strong>privacy@skilljobgap.com</strong></p>
      </section>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--gray-dark)' }}>
        <Link to="/terms" style={{ color: 'var(--gray-dark)' }}>Terms of Service</Link>
        {' · '}
        <Link to="/" style={{ color: 'var(--gray-dark)' }}>Back to Home</Link>
      </div>
    </div>
  )
}
