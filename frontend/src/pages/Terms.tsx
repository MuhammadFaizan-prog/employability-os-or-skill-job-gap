import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

export function Terms() {
  usePageMeta({
    title: 'Terms of Service | Skill–Job Gap',
    description: 'Read the Terms of Service for Skill–Job Gap. By using our career readiness platform you agree to these terms.',
    canonical: 'https://www.skilljobgap.com/terms',
    noIndex: false,
  })

  const lastUpdated = '3 May 2026'

  return (
    <div style={{ maxWidth: 800, margin: '0 auto', padding: '4rem 2rem' }}>
      <nav aria-label="Breadcrumb" style={{ marginBottom: '2rem' }}>
        <ol style={{ listStyle: 'none', padding: 0, display: 'flex', gap: '0.5rem', fontSize: '0.875rem', color: 'var(--gray-dark)' }}>
          <li><Link to="/" style={{ color: 'var(--gray-dark)', textDecoration: 'none' }}>Home</Link></li>
          <li aria-hidden="true">›</li>
          <li aria-current="page">Terms of Service</li>
        </ol>
      </nav>

      <h1>Terms of Service</h1>
      <p style={{ color: 'var(--gray-dark)', marginBottom: '2rem' }}>Last updated: {lastUpdated}</p>

      <section aria-labelledby="accept-heading">
        <h2 id="accept-heading">1. Acceptance of Terms</h2>
        <p>By accessing or using the Skill–Job Gap platform ("Service"), you agree to be bound by these Terms of Service. If you do not agree, do not use the Service.</p>
      </section>

      <section aria-labelledby="service-heading" style={{ marginTop: '2rem' }}>
        <h2 id="service-heading">2. Description of Service</h2>
        <p>Skill–Job Gap provides an AI-powered career readiness and skill gap analysis platform. The Service includes skill assessment tools, learning roadmaps, resume analysis, and interview preparation features. We reserve the right to modify or discontinue features at any time.</p>
      </section>

      <section aria-labelledby="account-heading" style={{ marginTop: '2rem' }}>
        <h2 id="account-heading">3. Account Registration</h2>
        <p>You must provide accurate information when creating an account. You are responsible for maintaining the confidentiality of your login credentials and for all activity that occurs under your account.</p>
      </section>

      <section aria-labelledby="conduct-heading" style={{ marginTop: '2rem' }}>
        <h2 id="conduct-heading">4. Acceptable Use</h2>
        <p>You agree not to: (a) use the Service for any unlawful purpose; (b) attempt to gain unauthorized access to any part of the Service; (c) upload malicious content or attempt to interfere with platform security; (d) misrepresent your identity or qualifications.</p>
      </section>

      <section aria-labelledby="ip-heading" style={{ marginTop: '2rem' }}>
        <h2 id="ip-heading">5. Intellectual Property</h2>
        <p>All platform content, features, and functionality — including but not limited to assessment frameworks, scoring algorithms, and UI design — are the exclusive property of Skill–Job Gap. Your assessment data remains your property; you grant us a license to process it to provide the Service.</p>
      </section>

      <section aria-labelledby="disclaimer-heading" style={{ marginTop: '2rem' }}>
        <h2 id="disclaimer-heading">6. Disclaimer of Warranties</h2>
        <p>The Service is provided "as is" without warranties of any kind. We do not guarantee employment outcomes, specific score improvements, or that all assessment content will match every employer's requirements.</p>
      </section>

      <section aria-labelledby="liability-heading" style={{ marginTop: '2rem' }}>
        <h2 id="liability-heading">7. Limitation of Liability</h2>
        <p>To the maximum extent permitted by law, Skill–Job Gap shall not be liable for any indirect, incidental, special, or consequential damages arising from your use of the Service.</p>
      </section>

      <section aria-labelledby="termination-heading" style={{ marginTop: '2rem' }}>
        <h2 id="termination-heading">8. Termination</h2>
        <p>We reserve the right to suspend or terminate your account if you violate these terms. You may delete your account at any time from the Profile settings page.</p>
      </section>

      <section aria-labelledby="contact-heading" style={{ marginTop: '2rem' }}>
        <h2 id="contact-heading">9. Contact</h2>
        <p>Questions about these terms? Contact: <strong>legal@skilljobgap.com</strong></p>
      </section>

      <div style={{ marginTop: '3rem', paddingTop: '2rem', borderTop: '1px solid var(--border-color)', fontSize: '0.875rem', color: 'var(--gray-dark)' }}>
        <Link to="/privacy" style={{ color: 'var(--gray-dark)' }}>Privacy Policy</Link>
        {' · '}
        <Link to="/" style={{ color: 'var(--gray-dark)' }}>Back to Home</Link>
      </div>
    </div>
  )
}
