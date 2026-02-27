import { useNavigate } from 'react-router-dom'

export function Landing() {
  const navigate = useNavigate()

  return (
    <div className="fade-in landing-page" style={{ position: 'relative', overflowX: 'hidden' }}>
      {/* Sparkle SVGs */}
      <svg className="sparkle" width="24" height="24" viewBox="0 0 24 24" style={{ top: '15%', left: '10%' }}>
        <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" className="sparkle-icon" />
      </svg>
      <svg className="sparkle" width="16" height="16" viewBox="0 0 24 24" style={{ top: '25%', right: '15%' }}>
        <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" className="sparkle-icon" />
      </svg>
      <svg className="sparkle" width="20" height="20" viewBox="0 0 24 24" style={{ bottom: '10%', left: '5%' }}>
        <path d="M12 0L14 10L24 12L14 14L12 24L10 14L0 12L10 10L12 0Z" className="sparkle-icon" />
      </svg>

      {/* Hero section */}
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1>Validate your career readiness with data.</h1>
            <p>
              Measure your professional skills against industry benchmarks using our standardized assessment framework. Built for the modern workforce.
            </p>
            <div className="hero-actions">
              <button className="btn btn-primary" onClick={() => navigate('/onboarding')}>
                Start Assessment
              </button>
              <button className="btn btn-text" onClick={() => navigate('/dashboard')}>
                View Sample Report
              </button>
            </div>
          </div>
        </div>
        <svg width="200" height="100" style={{ position: 'absolute', bottom: -50, left: '10%', zIndex: -1, opacity: 0.5 }}>
          <path d="M10,10 Q50,90 190,90" fill="none" stroke="#1a1a1a" strokeWidth="1" />
          <circle cx="10" cy="10" r="3" fill="#1a1a1a" />
          <path d="M185,85 L190,90 L185,95" fill="none" stroke="#1a1a1a" strokeWidth="1" />
        </svg>
      </section>

      {/* How It Works section */}
      <section className="section-spacer">
        <div className="container">
          <div style={{ marginBottom: '4rem', textAlign: 'center' }}>
            <h2>How It Works</h2>
            <p style={{ margin: '0 auto' }}>Four simple steps to certify your skills.</p>
          </div>
          <div className="steps-grid">
            <div className="steps-connector" aria-hidden="true" />
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Register</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Create your professional profile and select your target industry.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Assess</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Complete the 45-minute core competency evaluation.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Analyze</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Receive instant AI-powered scoring and gap analysis.
              </p>
            </div>
            <div className="step-card">
              <div className="step-number">4</div>
              <h3>Certify</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Get your verified badge and shareable readiness report.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features section */}
      <section className="section-spacer" style={{ background: 'var(--gray-light)', borderTop: '1px solid var(--border-color)', borderBottom: '1px solid var(--border-color)' }}>
        <div className="container">
          <div style={{ marginBottom: '3rem' }}>
            <h2>Platform Features</h2>
          </div>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
              <h3>Timed Simulations</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Real-world scenarios with strict time constraints to test pressure handling.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="20" x2="18" y2="10" />
                  <line x1="12" y1="20" x2="12" y2="4" />
                  <line x1="6" y1="20" x2="6" y2="14" />
                </svg>
              </div>
              <h3>Live Analytics</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Granular data points tracked in real-time as you progress through tasks.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <h3>Industry Standards</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Benchmarks updated quarterly based on top employer requirements.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
              </div>
              <h3>Peer Comparison</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                See how you stack up against other candidates in your cohort.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <line x1="10" y1="9" x2="8" y2="9" />
                </svg>
              </div>
              <h3>PDF Reports</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Downloadable, detailed breakdown suitable for resume attachments.
              </p>
            </div>
            <div className="feature-card">
              <div className="feature-icon-box">
                <svg className="icon" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--fg)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              </div>
              <h3>Global Access</h3>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                Cloud-based platform accessible from any modern browser worldwide.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comprehensive Scoring section */}
      <section className="section-spacer">
        <div className="container">
          <div className="score-layout">
            <div>
              <h2>Comprehensive Scoring</h2>
              <p style={{ marginBottom: '2rem', color: 'var(--gray-dark)' }}>
                Our proprietary algorithm breaks down your performance into key dimensions, giving you a clear roadmap for improvement.
              </p>
              <ul style={{ listStyle: 'none', paddingLeft: '1rem', borderLeft: '1px solid #1a1a1a', margin: 0, display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <li>Technical Accuracy</li>
                <li>Speed &amp; Efficiency</li>
                <li>Problem Solving</li>
              </ul>
            </div>
            <div className="score-preview-window">
              <div className="window-header">
                <span className="dot" />
                <span className="dot" />
                <span className="dot" />
                <span style={{ fontFamily: 'monospace', fontSize: '0.75rem', marginLeft: 'auto', color: 'var(--gray-dark)' }}>
                  RESULT_PREVIEW.DAT
                </span>
              </div>
              <div className="score-content">
                <div className="score-main">
                  <div className="gauge">
                    <span className="gauge-value">84</span>
                  </div>
                  <div>
                    <p style={{ fontWeight: 600, marginBottom: '0.25rem', maxWidth: 'none' }}>Overall Score</p>
                    <p style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>Top 15% of candidates</p>
                  </div>
                </div>
                <div className="breakdown-list">
                  <div className="breakdown-item">
                    <span>Logic</span>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '92%' }} />
                    </div>
                    <span>92</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Communication</span>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '78%' }} />
                    </div>
                    <span>78</span>
                  </div>
                  <div className="breakdown-item">
                    <span>Technical</span>
                    <div className="progress-track">
                      <div className="progress-fill" style={{ width: '88%' }} />
                    </div>
                    <span>88</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA section */}
      <section className="cta-section section-spacer">
        <div className="container">
          <h2>Ready to prove your skills?</h2>
          <button className="btn btn-primary" style={{ padding: '1rem 2.5rem', fontSize: '1.1rem' }} onClick={() => navigate('/onboarding')}>
            Get Certified Now
          </button>
        </div>
      </section>
    </div>
  )
}
