import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'

const sectionStyle = { maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }
const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' }

export function EmployabilityOS() {
  usePageMeta({
    title: 'Employability OS | AI-Powered Career Readiness Operating System',
    description: 'Employability OS is an AI-powered platform that maps your skills, identifies job gaps, and builds a personalised learning roadmap. For students, universities, and employers.',
    canonical: 'https://employability-os-or-skill-job-gap.vercel.app/employability-os',
    noIndex: false,
  })
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: 'What is Employability OS?', a: 'Employability OS (Employability Operating System) is an AI-powered digital platform that manages every layer of a person\'s career readiness journey — skill assessment, gap analysis, AI learning roadmap, resume analysis, interview preparation, and verified skill certification — in one unified system. Think of it as an operating system for your career.' },
    { q: 'Who is Employability OS for?', a: 'Employability OS is built for students and graduates who need structured support to close the gap between academic education and employer expectations; for universities looking for data-driven employability reporting; and for employers and HR teams who want to verify candidate skill readiness before hiring.' },
    { q: 'How is Employability OS different from traditional career platforms?', a: 'Traditional platforms focus on job listings and CV storage. Employability OS measures your actual skill profile against real employer benchmarks, quantifies the gap with a precise score (0–100), generates a prioritised AI learning roadmap, and issues a verified readiness badge — replacing guesswork with a systematic, data-backed approach.' },
    { q: 'Is Employability OS free?', a: 'Yes. The full skill gap assessment and employability score are completely free to access. Advanced features including AI roadmap generation, resume analysis, and interview preparation are available after creating a free account.' },
    { q: 'How is the employability score calculated?', a: 'The score is a weighted composite across five dimensions: Technical Skills (30%), Project Experience (25%), Communication & Soft Skills (20%), Resume Quality (15%), and Interview Readiness (10%) — benchmarked against real employer requirements for your target role.' },
    { q: 'Can universities use Employability OS?', a: 'Yes. Universities and training providers can use Employability OS to track cohort-level employability scores, generate programme-level gap reports, demonstrate graduate outcomes to employers, and identify curriculum gaps by skill domain.' },
  ]

  return (
    <main id="main-content" style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      <nav aria-label="Breadcrumb" style={{ ...sectionStyle, paddingTop: '1.5rem', paddingBottom: 0, fontSize: '0.85rem', color: '#64748b' }}>
        <Link to="/" style={{ color: '#7c3aed', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>›</span>
        <span>Employability OS</span>
      </nav>

      {/* Hero */}
      <section style={{ ...sectionStyle, padding: '4rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '999px', padding: '0.4rem 1.2rem', fontSize: '0.82rem', color: '#a78bfa', marginBottom: '1.5rem', fontWeight: 500 }}>AI-Powered Career Platform</div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Employability OS — The Operating System for Your Career
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.75, color: '#94a3b8', maxWidth: '700px', margin: '0 auto 2rem' }}>
          <strong style={{ color: '#e2e8f0' }}>Employability OS</strong> is an AI-powered platform that systematically measures your skills, identifies exact gaps between you and your target role, and builds a personalised roadmap to close them.
        </p>
        <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
          <Link to="/signup" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>Start Free Assessment →</Link>
          <Link to="/skill-job-gap" style={{ display: 'inline-block', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', color: '#e2e8f0', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 600 }}>What is a Skill–Job Gap?</Link>
        </div>
      </section>

      {/* Answer block */}
      <section style={{ ...sectionStyle, maxWidth: '900px', marginBottom: '4rem' }}>
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>What is Employability OS?</h2>
          <p style={{ lineHeight: 1.8, color: '#cbd5e1', fontSize: '1rem' }}>
            <strong style={{ color: '#a78bfa' }}>Employability OS</strong> (Employability Operating System) is a structured digital framework that manages every stage of a person's career readiness journey. Like a computer operating system manages hardware and software, Employability OS manages all the processes needed to become job-ready: skill assessment, gap identification, AI learning recommendations, project building, resume analysis, interview coaching, and verified certification — in one unified platform.
          </p>
        </div>
      </section>

      {/* How it works */}
      <section style={{ ...sectionStyle, marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', color: '#fff' }}>How Employability OS Works</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem' }}>A 5-stage operating cycle from skill gaps to job readiness</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '1.25rem' }}>
          {[
            { step: '01', title: 'Assess', desc: '45-minute competency evaluation across technical, practical, and communication skills.', icon: '📊' },
            { step: '02', title: 'Analyse', desc: 'AI benchmarks your scores against real employer requirements and generates a gap score.', icon: '🔍' },
            { step: '03', title: 'Plan', desc: 'Receive a personalised AI learning roadmap with prioritised courses and milestones.', icon: '🗺️' },
            { step: '04', title: 'Build', desc: 'Complete guided projects and earn verifiable proof of your skills.', icon: '🔨' },
            { step: '05', title: 'Certify', desc: 'Get a verified readiness badge and shareable PDF report for job applications.', icon: '🏆' },
          ].map(s => (
            <div key={s.step} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{s.icon}</div>
              <div style={{ fontSize: '0.72rem', color: '#7c3aed', fontWeight: 700, marginBottom: '0.4rem', letterSpacing: '0.1em' }}>STEP {s.step}</div>
              <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.87rem', color: '#94a3b8', lineHeight: 1.6 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Who it's for */}
      <section style={{ ...sectionStyle, marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', color: '#fff' }}>Who is Employability OS For?</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem' }}>Built for every stakeholder in the employability ecosystem</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(270px, 1fr))', gap: '1.5rem' }}>
          {[
            { audience: 'Students & Graduates', icon: '🎓', benefits: ['Know exactly where your skill gaps are', 'Get a structured roadmap to close them', 'Build verified portfolio projects', 'Earn a recognised readiness certificate', 'Prepare for interviews with AI coaching'] },
            { audience: 'Universities & Providers', icon: '🏫', benefits: ['Track cohort employability scores', 'Generate programme-level gap reports', 'Demonstrate graduate outcomes to employers', 'Identify curriculum gaps by skill domain', 'Improve graduate employment rates'] },
            { audience: 'Employers & HR Teams', icon: '🏢', benefits: ['Screen candidates by verified skill readiness', 'Reduce mis-hires with objective benchmarking', 'Set role-specific readiness thresholds', 'Save recruitment cost and time', 'Build a pipeline of pre-assessed candidates'] },
          ].map(a => (
            <div key={a.audience} style={cardStyle}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>{a.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '1rem' }}>{a.audience}</h3>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                {a.benefits.map(b => <li key={b} style={{ color: '#94a3b8', fontSize: '0.88rem', display: 'flex', gap: '0.5rem' }}><span style={{ color: '#7c3aed' }}>✓</span>{b}</li>)}
              </ul>
            </div>
          ))}
        </div>
      </section>

      {/* Comparison table */}
      <section style={{ ...sectionStyle, maxWidth: '860px', marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>Employability OS vs. Traditional Platforms</h2>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.93rem' }}>
            <thead>
              <tr style={{ background: 'rgba(124,58,237,0.12)' }}>
                {['Feature', 'Employability OS', 'Traditional Platforms'].map(h => (
                  <th key={h} style={{ padding: '0.9rem 1rem', textAlign: h === 'Feature' ? 'left' : 'center', color: h === 'Traditional Platforms' ? '#64748b' : '#a78bfa', fontWeight: 700, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ['Skill Gap Quantification', '✅ Precise score', '❌ Not measured'],
                ['AI-Powered Roadmap', '✅ Personalised per role', '❌ Generic advice'],
                ['Employer Benchmark Data', '✅ Real requirements', '❌ Self-reported'],
                ['Verified Readiness Badge', '✅ Shareable certificate', '❌ Not available'],
                ['Resume & Interview AI', '✅ Built-in tools', '❌ Separate purchase'],
                ['University Reporting', '✅ Cohort analytics', '❌ Not available'],
                ['Free to Start', '✅ Yes', '⚠️ Mostly paid'],
              ].map(([f, eos, trad], i) => (
                <tr key={f} style={{ background: i % 2 === 0 ? 'rgba(255,255,255,0.01)' : 'transparent' }}>
                  <td style={{ padding: '0.8rem 1rem', color: '#cbd5e1', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{f}</td>
                  <td style={{ padding: '0.8rem 1rem', textAlign: 'center', color: '#4ade80', borderBottom: '1px solid rgba(255,255,255,0.05)', fontWeight: 600 }}>{eos}</td>
                  <td style={{ padding: '0.8rem 1rem', textAlign: 'center', color: '#94a3b8', borderBottom: '1px solid rgba(255,255,255,0.05)' }}>{trad}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ ...sectionStyle, maxWidth: '800px', marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.5rem', color: '#fff' }}>Frequently Asked Questions about Employability OS</h2>
        <dl>
          {faqs.map((faq, i) => (
            <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <dt>
                <button onClick={() => setOpen(open === i ? null : i)} aria-expanded={open === i} style={{ width: '100%', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1.1rem 0', textAlign: 'left', color: '#e2e8f0', fontSize: '0.97rem', fontWeight: 600, fontFamily: 'Inter, sans-serif' }}>
                  {faq.q}
                  <span style={{ flexShrink: 0, marginLeft: '1rem', color: '#7c3aed', transform: open === i ? 'rotate(45deg)' : 'none', transition: 'transform 0.2s', fontSize: '1.3rem', fontWeight: 400 }}>+</span>
                </button>
              </dt>
              {open === i && <dd style={{ margin: 0, padding: '0 0 1.1rem', color: '#94a3b8', lineHeight: 1.75, fontSize: '0.93rem' }}>{faq.a}</dd>}
            </div>
          ))}
        </dl>
      </section>

      {/* CTA */}
      <section style={{ ...sectionStyle, maxWidth: '860px', marginBottom: '5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Ready to Run Employability OS?</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Join thousands of students, graduates, and professionals who have used Employability OS to bridge their skill–job gap.</p>
          <Link to="/signup" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>Start Free — No Credit Card Required</Link>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            Also see: <Link to="/employability-app" style={{ color: '#7c3aed', textDecoration: 'none' }}>Employability App</Link> · <Link to="/skill-job-gap" style={{ color: '#7c3aed', textDecoration: 'none' }}>Skill–Job Gap</Link> · <Link to="/employability" style={{ color: '#7c3aed', textDecoration: 'none' }}>Employability Hub</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
