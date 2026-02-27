import { useNavigate } from 'react-router-dom'
import { useRoleData } from '../hooks/useRoleData'
import { getStoredRole } from '../hooks/useAuth'
import { SCORE_WEIGHTS } from '../constants/scoreWeights'

export function Dashboard() {
  const navigate = useNavigate()
  const role = getStoredRole()
  const {
    loading,
    error,
    skills,
    projects,
    userProjectStatuses,
    scoreBreakdown,
    skillGapResult,
    roadmapSteps,
  } = useRoleData(role)

  const finalScore = scoreBreakdown?.final_score ?? 0
  const roundedScore = Math.round(finalScore)
  const dashOffset = 502 - (502 * roundedScore) / 100

  const breakdownItems = [
    { label: 'Technical', value: scoreBreakdown?.technical ?? 0 },
    { label: 'Projects', value: scoreBreakdown?.projects ?? 0 },
    { label: 'Resume', value: scoreBreakdown?.resume ?? 0 },
    { label: 'Practical', value: scoreBreakdown?.practical ?? 0 },
    { label: 'Interview', value: scoreBreakdown?.interview ?? 0 },
  ]

  const strengthCount = skillGapResult?.strengths.length ?? 0
  const gapCount = skillGapResult?.gaps.length ?? 0
  const priorityCount = skillGapResult?.priorityFocus.length ?? 0

  const completedProjects = userProjectStatuses.filter(p => p.completed).length
  const totalProjects = projects.length || 1
  const projectPct = Math.round((completedProjects / totalProjects) * 100)

  const roadmapPreview = (roadmapSteps?.skillSteps ?? [])
    .filter(s => s.status !== 'done')
    .slice(0, 3)
    .map(s => ({
      title: s.name,
      subtitle: `Difficulty ${s.difficulty} · est. time`,
      badge: s.status === 'next' ? 'IN PROGRESS' : 'QUEUED',
      filled: s.status === 'next',
    }))

  const suggestedSkill = skillGapResult?.suggestedNextSkill

  const roleBadge = role.toUpperCase()
  const lastUpdated = scoreBreakdown?.last_calculated
    ? new Date(scoreBreakdown.last_calculated).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
    : 'Not yet calculated'

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)' }}>Loading dashboard data...</p>
      </div>
    )
  }

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      {error && (
        <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
          Note: {error}. Showing computed data from local state.
        </div>
      )}

      {/* 1. Header Strip */}
      <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', paddingBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', marginBottom: '3rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Your Dashboard</h1>
          <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: '1rem' }}>
            <span className="role-badge">{roleBadge}</span>
            <span style={{ fontSize: '0.9rem', color: 'var(--gray-dark)' }}>Last updated: {lastUpdated}</span>
          </div>
        </div>
        <button className="btn btn-outline" onClick={() => navigate('/onboarding')}>Retake Assessment</button>
      </div>

      {/* 2. Score Overview */}
      <div className="dash-score-grid" style={{ display: 'grid', gap: '3rem', margin: '2rem 0 3rem' }}>
        <div className="card" style={{ padding: '2.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
          <svg width="180" height="180" viewBox="0 0 200 200">
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--gray-mid)" strokeWidth="14" strokeDasharray="502" strokeLinecap="round" transform="rotate(-90 100 100)" />
            <circle cx="100" cy="100" r="80" fill="none" stroke="var(--fg)" strokeWidth="14" strokeDasharray="502" strokeDashoffset={dashOffset} strokeLinecap="round" transform="rotate(-90 100 100)" style={{ transition: 'stroke-dashoffset 0.8s ease' }} />
            <text x="100" y="95" textAnchor="middle" fontFamily="var(--font-main)" fontSize="38" fontWeight="700" fill="var(--fg)">{roundedScore}</text>
            <text x="100" y="118" textAnchor="middle" fontFamily="var(--font-main)" fontSize="13" fill="var(--gray-dark)">Overall Score</text>
          </svg>
          <p style={{ fontSize: '0.95rem', fontWeight: 600, marginTop: '1rem', marginBottom: '0.25rem' }}>
            {roundedScore >= 80 ? 'Top 15% of Candidates' : roundedScore >= 60 ? 'Top 35% of Candidates' : 'Building Momentum'}
          </p>
          <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
            Based on {skills.length} skills and {projects.length} projects
          </p>
        </div>

        <div className="card" style={{ padding: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Score Breakdown</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {breakdownItems.map((item) => (
              <div key={item.label} style={{ display: 'grid', gridTemplateColumns: '130px 1fr 36px', alignItems: 'center', gap: '1rem' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {item.label}
                  <span style={{ fontSize: '0.72rem', color: 'var(--gray-dark)', marginLeft: '0.35rem' }}>
                    ({Math.round((SCORE_WEIGHTS[item.label.toLowerCase() as keyof typeof SCORE_WEIGHTS] ?? 0) * 100)}%)
                  </span>
                </span>
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${item.value}%` }} />
                </div>
                <span style={{ fontSize: '0.9rem', fontWeight: 500, textAlign: 'right' }}>{item.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 3. Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '1.5rem' }}>
        <div className="stat-card">
          <p className="stat-label">Strengths</p>
          <p className="stat-value">{strengthCount}</p>
          <p className="stat-desc">Skills above benchmark</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Skill Gaps</p>
          <p className="stat-value">{gapCount}</p>
          <p className="stat-desc">Areas needing improvement</p>
        </div>
        <div className="stat-card">
          <p className="stat-label">Priority Focus</p>
          <p className="stat-value">{priorityCount}</p>
          <p className="stat-desc">Critical gaps to close first</p>
        </div>
      </div>

      {/* 4. View all skills link */}
      <div style={{ marginBottom: '2rem' }}>
        <button onClick={() => navigate('/skills')} style={{ fontSize: '0.9rem', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4, color: 'var(--fg)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-main)' }}>View all skills →</button>
      </div>

      {/* 5. Bottom Grid */}
      <div className="dash-bottom-grid" style={{ display: 'grid', gap: '1.5rem', marginBottom: '2rem' }}>
        <div className="card">
          <div className="card-header">
            <h3 style={{ fontSize: '1rem', margin: 0 }}>Roadmap</h3>
            <button onClick={() => navigate('/roadmap')} style={{ fontSize: '0.8rem', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-main)', color: 'var(--fg)' }}>View full roadmap →</button>
          </div>
          <div style={{ padding: 0 }}>
            {roadmapPreview.length > 0 ? roadmapPreview.map((item, i) => (
              <div key={i} style={{ padding: '1.25rem 1.5rem', borderBottom: i < roadmapPreview.length - 1 ? '1px solid var(--gray-mid)' : 'none', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.25rem' }}>{item.title}</p>
                  <p style={{ fontSize: '0.8rem', color: 'var(--gray-dark)' }}>{item.subtitle}</p>
                </div>
                <span className={item.filled ? 'badge badge-filled' : 'badge badge-outline'}>{item.badge}</span>
              </div>
            )) : (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-dark)', fontSize: '0.9rem' }}>
                Complete onboarding to generate your roadmap.
              </div>
            )}
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="card" style={{ padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', margin: 0 }}>Project Progress</h3>
              <button onClick={() => navigate('/projects')} style={{ fontSize: '0.8rem', fontWeight: 500, textDecoration: 'underline', textUnderlineOffset: 4, background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-main)', color: 'var(--fg)' }}>View projects →</button>
            </div>
            <p style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem' }}>
              {completedProjects} of {projects.length} completed
            </p>
            <div className="progress-bar"><div className="progress-fill" style={{ width: `${projectPct}%` }} /></div>
          </div>

          <div className="card" style={{ padding: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1rem' }}>Quick Actions</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/onboarding')}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83" /></svg>
                New Assessment
              </button>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/resume')}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /></svg>
                Resume Analysis
              </button>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/interview')}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M21 15a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><path d="M9 10l2 2 4-4" /></svg>
                Interview Prep
              </button>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }} onClick={() => navigate('/profile')}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                My Profile
              </button>
              <button className="btn btn-outline" style={{ fontSize: '0.85rem', padding: '0.6rem 1rem', justifyContent: 'flex-start', display: 'inline-flex', alignItems: 'center', gap: '0.5rem', gridColumn: '1 / -1' }} onClick={() => navigate('/verify')}>
                <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" /></svg>
                Dev: Verify
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 6. Suggested Next Step */}
      {suggestedSkill && (
        <div style={{ border: '2px solid var(--fg)', borderRadius: 'var(--radius-window)', padding: '2rem', background: 'var(--gray-light)', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start', flex: '1 1 300px' }}>
            <div style={{ width: 48, height: 48, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--bg)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <svg width="24" height="24" fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
                <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
              </svg>
            </div>
            <div>
              <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.5rem' }}>SUGGESTED NEXT STEP</p>
              <p style={{ fontWeight: 600, fontSize: '1.1rem', marginBottom: '0.35rem' }}>
                Focus on {suggestedSkill.name} to close your top skill gap.
              </p>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-dark)' }}>
                Weight: {suggestedSkill.weight ?? 'N/A'} · Difficulty: {suggestedSkill.difficulty ?? 'N/A'}
              </p>
            </div>
          </div>
          <button className="btn btn-primary" style={{ whiteSpace: 'nowrap', flexShrink: 0 }} onClick={() => navigate('/roadmap')}>Start Now</button>
        </div>
      )}

    </div>
  )
}
