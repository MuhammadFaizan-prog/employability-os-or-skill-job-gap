import { useState } from 'react'
import { Link } from 'react-router-dom'
import { usePageMeta } from '../hooks/usePageMeta'
import { useJsonLd } from '../hooks/useJsonLd'

const cardStyle: React.CSSProperties = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '14px', padding: '1.5rem' }
const wrap = { maxWidth: '1100px', margin: '0 auto', padding: '0 2rem' }

export function SkillJobGapPage() {
  usePageMeta({
    title: 'Skill Job Gap | What It Is, Why It Matters & How to Close It',
    description: 'A skill–job gap is the measurable difference between your current skills and what employers require. Learn what causes it, how it is measured, and how to close it with AI.',
    canonical: 'https://employabilityos.pages.dev/skill-job-gap',
    noIndex: false,
  })
  useJsonLd({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': 'https://employabilityos.pages.dev/skill-job-gap#webpage',
        'url': 'https://employabilityos.pages.dev/skill-job-gap',
        'name': 'Skill Job Gap | What It Is, Why It Matters & How to Close It',
        'description': 'A skill-job gap is the measurable difference between your current skills and what employers require. Learn what causes it, how it is measured, and how to close it.',
        'isPartOf': { '@id': 'https://employabilityos.pages.dev/#website' },
        'breadcrumb': { '@type': 'BreadcrumbList', 'itemListElement': [
          { '@type': 'ListItem', 'position': 1, 'name': 'Home', 'item': 'https://employabilityos.pages.dev/' },
          { '@type': 'ListItem', 'position': 2, 'name': 'Skill-Job Gap', 'item': 'https://employabilityos.pages.dev/skill-job-gap' },
        ]},
      },
      {
        '@type': 'DefinedTerm',
        'name': 'Skill-Job Gap',
        'description': 'A skill-job gap is the measurable difference between the skills a candidate currently possesses and the skills an employer requires for a specific job role.',
        'inDefinedTermSet': 'https://employabilityos.pages.dev/skill-job-gap',
      },
      {
        '@type': 'FAQPage',
        'mainEntity': [
          { '@type': 'Question', 'name': 'What is a skill job gap?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'A skill-job gap is the measurable difference between the skills a person currently possesses and the skills required by employers for a specific job role. It exists at the individual level and at the systemic level where the workforce lacks the skills employers need.' } },
          { '@type': 'Question', 'name': 'What causes the skill-job gap?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'The skill-job gap is caused by rapid technological change, outdated degree programmes, lack of employer-aligned benchmarks, and limited access to practical experience such as internships and project work.' } },
          { '@type': 'Question', 'name': 'How do I close my skill-job gap?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Closing a skill-job gap requires three steps: (1) Identify it precisely with a structured assessment; (2) Prioritise your gaps by employer importance using AI; (3) Close it systematically by following a personalised learning roadmap and building portfolio projects.' } },
          { '@type': 'Question', 'name': 'How long does it take to close a skill-job gap?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Minor skill gaps can be closed in 2-4 weeks of focused learning. Larger gaps across multiple dimensions typically take 3-6 months of structured effort following a prioritised roadmap.' } },
          { '@type': 'Question', 'name': 'Can employers use the skill-job gap platform?', 'acceptedAnswer': { '@type': 'Answer', 'text': 'Yes. Employers can set role-specific skill benchmarks, screen candidates against those benchmarks, and identify candidates whose gap scores meet their minimum thresholds.' } },
        ],
      },
    ],
  })
  const [open, setOpen] = useState<number | null>(null)

  const faqs = [
    { q: 'What is a skill–job gap?', a: 'A skill–job gap (also written as skill job gap) is the measurable difference between the skills a person currently possesses and the skills required by employers for a specific job role. It exists at the individual level (a candidate missing required competencies) and at the systemic level (industries or economies where the workforce as a whole lacks the skills employers need). Our platform quantifies this gap with a precise score for each skill dimension.' },
    { q: 'What causes the skill–job gap?', a: 'The skill–job gap is caused by several converging factors: (1) Rapid technological change — employers adopt new tools faster than educational institutions update curricula; (2) Outdated degree programmes — universities often teach theory without practical, employer-relevant application; (3) Lack of employer-aligned benchmarks — students do not know what skills employers actually require; (4) Limited access to practical experience — project work, internships, and real-world exposure remain unevenly distributed.' },
    { q: 'How does the platform measure the skill–job gap?', a: 'Our platform measures the skill–job gap by comparing your self-assessed proficiency ratings (validated through structured tasks and questions) against a standardised benchmark built from real employer hiring requirements across five dimensions: technical skills, project experience, communication and soft skills, resume quality, and interview readiness. The result is a gap score for each area and an overall readiness percentage.' },
    { q: 'How do I close my skill–job gap?', a: 'Closing a skill–job gap requires three steps: (1) Identify it precisely — use our platform to generate your exact gap profile by skill area; (2) Prioritise — our AI ranks your gaps by employer importance and learning effort required; (3) Close it systematically — follow the personalised learning roadmap, complete guided projects, and track your score improvement over time.' },
    { q: 'How long does it take to close a skill–job gap?', a: 'The time to close a skill–job gap depends on the size and nature of the gaps. Minor skill gaps (e.g., one missing tool or framework) can often be closed in 2–4 weeks of focused learning. Larger gaps across multiple dimensions typically take 3–6 months of structured effort following a prioritised roadmap. Our platform tracks your progress in real time so you know exactly how far you have come and how far you have to go.' },
    { q: 'Can employers use the skill–job gap platform?', a: 'Yes. Employers can use our platform to set role-specific skill benchmarks, screen candidates against those benchmarks before interviews, and identify candidates whose gap scores meet their minimum thresholds. This replaces subjective CV screening with objective, data-driven pre-qualification.' },
  ]

  return (
    <main id="main-content" style={{ background: '#0a0a0f', minHeight: '100vh', color: '#e2e8f0', fontFamily: 'Inter, sans-serif' }}>
      <nav aria-label="Breadcrumb" style={{ ...wrap, paddingTop: '1.5rem', paddingBottom: 0, fontSize: '0.85rem', color: '#64748b' }}>
        <Link to="/" style={{ color: '#7c3aed', textDecoration: 'none' }}>Home</Link>
        <span style={{ margin: '0 0.5rem' }}>›</span>
        <span>Skill–Job Gap</span>
      </nav>

      {/* Hero */}
      <section style={{ ...wrap, padding: '4rem 2rem 3rem', textAlign: 'center' }}>
        <div style={{ display: 'inline-block', background: 'rgba(124,58,237,0.15)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '999px', padding: '0.4rem 1.2rem', fontSize: '0.82rem', color: '#a78bfa', marginBottom: '1.5rem', fontWeight: 500 }}>The Definitive Guide</div>
        <h1 style={{ fontSize: 'clamp(1.8rem, 4vw, 3rem)', fontWeight: 800, lineHeight: 1.15, marginBottom: '1.5rem', background: 'linear-gradient(135deg, #fff 0%, #a78bfa 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          What is a Skill–Job Gap? Definition, Causes & How to Close It
        </h1>
        <p style={{ fontSize: '1.1rem', lineHeight: 1.75, color: '#94a3b8', maxWidth: '700px', margin: '0 auto 2rem' }}>
          The <strong style={{ color: '#e2e8f0' }}>skill–job gap</strong> is one of the most significant barriers between qualified candidates and employment. This guide explains what it is, what causes it, how to measure it, and how our platform helps you close it systematically.
        </p>
        <Link to="/signup" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', padding: '0.85rem 2rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700 }}>Measure Your Skill Gap Free →</Link>
      </section>

      {/* Answer block — Featured Snippet target */}
      <section style={{ ...wrap, maxWidth: '900px', marginBottom: '4rem' }}>
        <div style={{ background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: '16px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: '#fff' }}>Skill–Job Gap: Definition</h2>
          <p style={{ lineHeight: 1.8, color: '#cbd5e1', fontSize: '1.05rem' }}>
            A <strong style={{ color: '#a78bfa' }}>skill–job gap</strong> (or skill job gap) is the measurable difference between the skills a candidate currently possesses and the skills an employer requires for a specific job role. It can be measured at the individual level (a single candidate vs. a single job requirement) or at the systemic level (an industry or economy where the general workforce lacks the skills that employers collectively need). The skill–job gap is one of the primary reasons qualified-looking candidates fail to secure employment despite having relevant educational credentials.
          </p>
        </div>
      </section>

      {/* Causes */}
      <section style={{ ...wrap, marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', color: '#fff' }}>What Causes the Skill–Job Gap?</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem' }}>Four structural factors that create and sustain the gap</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.25rem' }}>
          {[
            { icon: '⚡', title: 'Rapid Technological Change', desc: 'Employers adopt new tools, frameworks, and technologies faster than educational institutions update their curricula. A degree completed 2–3 years ago may already be missing several in-demand skills.' },
            { icon: '📚', title: 'Outdated Degree Programmes', desc: 'University curricula often prioritise theoretical knowledge over practical, employer-relevant application. Students graduate with academic knowledge but without the hands-on skills employers require from day one.' },
            { icon: '🔭', title: 'No Employer Benchmarks', desc: 'Most students and graduates do not know exactly what skills employers require for their target roles. Without a clear benchmark, skill development is unfocused and misaligned.' },
            { icon: '💼', title: 'Limited Practical Experience', desc: 'Internships, placements, and real-world project experience remain unevenly distributed. Many graduates enter the job market without the applied experience employers prioritise in hiring decisions.' },
          ].map(c => (
            <div key={c.title} style={cardStyle}>
              <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>{c.icon}</div>
              <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.5rem', fontSize: '1rem' }}>{c.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.65 }}>{c.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How we measure it */}
      <section style={{ ...wrap, maxWidth: '900px', marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', color: '#fff' }}>How the Platform Measures Your Skill–Job Gap</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem' }}>A 5-dimension framework benchmarked against real employer requirements</p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {[
            { dim: 'Technical Skills', weight: '30%', desc: 'Programming languages, frameworks, tools, domain knowledge relevant to your target role.', bar: 30 },
            { dim: 'Project Experience', weight: '25%', desc: 'Portfolio quality, complexity of projects built, and relevance to employer requirements.', bar: 25 },
            { dim: 'Communication & Soft Skills', weight: '20%', desc: 'Written communication, teamwork, problem-solving, and professional conduct indicators.', bar: 20 },
            { dim: 'Resume Quality', weight: '15%', desc: 'Structure, keyword alignment, ATS compatibility, and presentation of your experience.', bar: 15 },
            { dim: 'Interview Readiness', weight: '10%', desc: 'Confidence, STAR-response quality, and role-specific knowledge demonstrated in mock sessions.', bar: 10 },
          ].map(d => (
            <div key={d.dim} style={{ ...cardStyle, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontWeight: 700, color: '#fff', fontSize: '0.97rem', margin: 0 }}>{d.dim}</h3>
                <span style={{ fontSize: '0.85rem', color: '#7c3aed', fontWeight: 700 }}>{d.weight}</span>
              </div>
              <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '999px', overflow: 'hidden' }}>
                <div style={{ height: '100%', width: `${d.bar * 3}%`, background: 'linear-gradient(90deg, #7c3aed, #2563eb)', borderRadius: '999px' }} />
              </div>
              <p style={{ fontSize: '0.85rem', color: '#94a3b8', margin: 0, lineHeight: 1.6 }}>{d.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How to close it */}
      <section style={{ ...wrap, marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.75rem', color: '#fff' }}>How to Close Your Skill–Job Gap</h2>
        <p style={{ textAlign: 'center', color: '#94a3b8', marginBottom: '2.5rem' }}>A systematic 3-stage approach used by thousands of job seekers</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.25rem' }}>
          {[
            { num: '1', title: 'Identify It Precisely', desc: 'Complete the free assessment to generate your exact gap profile. Know your score for each of the five dimensions — not just a vague sense of what is missing.', cta: null },
            { num: '2', title: 'Prioritise Strategically', desc: 'Not all gaps are equal. Our AI ranks your gaps by employer importance and learning efficiency — so you work on what matters most first, not what is easiest.', cta: null },
            { num: '3', title: 'Close It Systematically', desc: 'Follow your personalised roadmap: complete curated learning, build portfolio projects, and track your score improvement in real time until you meet the employer benchmark.', cta: null },
          ].map(s => (
            <div key={s.num} style={{ ...cardStyle, textAlign: 'center' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, color: '#fff', margin: '0 auto 1rem', fontSize: '1.1rem' }}>{s.num}</div>
              <h3 style={{ fontWeight: 700, color: '#fff', marginBottom: '0.6rem', fontSize: '1rem' }}>{s.title}</h3>
              <p style={{ fontSize: '0.88rem', color: '#94a3b8', lineHeight: 1.65 }}>{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Stats / proof */}
      <section style={{ ...wrap, maxWidth: '860px', marginBottom: '5rem' }}>
        <div style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '2.5rem' }}>
          <h2 style={{ fontSize: '1.4rem', fontWeight: 800, textAlign: 'center', marginBottom: '2rem', color: '#fff' }}>The Skill–Job Gap by the Numbers</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '1.5rem', textAlign: 'center' }}>
            {[
              { stat: '87%', label: 'of employers report a skills shortage in candidates they interview', source: 'McKinsey, 2023' },
              { stat: '40%', label: 'of graduates feel their degree did not adequately prepare them for employment', source: 'OECD, 2024' },
              { stat: '6–8 weeks', label: 'average time to close a targeted skill gap with structured learning', source: 'Platform data' },
              { stat: '3×', label: 'higher interview success rate reported by users who completed the full roadmap', source: 'Platform data' },
            ].map(s => (
              <div key={s.stat}>
                <div style={{ fontSize: '2rem', fontWeight: 800, color: '#a78bfa', marginBottom: '0.5rem' }}>{s.stat}</div>
                <p style={{ fontSize: '0.83rem', color: '#94a3b8', lineHeight: 1.5, marginBottom: '0.3rem' }}>{s.label}</p>
                <span style={{ fontSize: '0.75rem', color: '#475569' }}>{s.source}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section style={{ ...wrap, maxWidth: '800px', marginBottom: '5rem' }}>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, textAlign: 'center', marginBottom: '2.5rem', color: '#fff' }}>Skill–Job Gap — Frequently Asked Questions</h2>
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
      <section style={{ ...wrap, maxWidth: '860px', marginBottom: '5rem' }}>
        <div style={{ background: 'linear-gradient(135deg, rgba(124,58,237,0.2), rgba(37,99,235,0.15))', border: '1px solid rgba(124,58,237,0.3)', borderRadius: '20px', padding: '3rem 2rem', textAlign: 'center' }}>
          <h2 style={{ fontSize: '1.7rem', fontWeight: 800, color: '#fff', marginBottom: '1rem' }}>Find Out Your Skill–Job Gap Score</h2>
          <p style={{ color: '#94a3b8', marginBottom: '2rem' }}>Free assessment. Instant results. Personalised AI roadmap to close your gaps.</p>
          <Link to="/signup" style={{ display: 'inline-block', background: 'linear-gradient(135deg, #7c3aed, #2563eb)', color: '#fff', padding: '1rem 2.5rem', borderRadius: '10px', textDecoration: 'none', fontWeight: 700, fontSize: '1rem' }}>Start Free — Get Your Gap Score →</Link>
          <p style={{ marginTop: '1rem', fontSize: '0.85rem', color: '#64748b' }}>
            Also see: <Link to="/employability-os" style={{ color: '#7c3aed', textDecoration: 'none' }}>Employability OS</Link> · <Link to="/employability-app" style={{ color: '#7c3aed', textDecoration: 'none' }}>Employability App</Link> · <Link to="/employability" style={{ color: '#7c3aed', textDecoration: 'none' }}>Employability Hub</Link>
          </p>
        </div>
      </section>
    </main>
  )
}
