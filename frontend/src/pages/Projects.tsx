import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoleData } from '../hooks/useRoleData'
import { getStoredRole } from '../hooks/useAuth'

type StatusFilter = 'all' | 'done' | 'suggested' | 'locked'

function difficultyDots(difficulty: number) {
  return (
    <span style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
      {[1, 2, 3].map(i => (
        <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', background: i <= difficulty ? 'var(--fg)' : 'var(--gray-mid)' }} />
      ))}
    </span>
  )
}

function difficultyLabel(d: number): string {
  return d <= 1 ? 'Easy' : d <= 2 ? 'Medium' : 'Hard'
}

export function Projects() {
  const navigate = useNavigate()
  const role = getStoredRole()
  const { loading, error, projects, userProjectStatuses, toggleProjectComplete, roadmapSteps } = useRoleData(role)

  const [diffFilter, setDiffFilter] = useState<'all' | string>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [modalProject, setModalProject] = useState<string | null>(null)

  const projectSteps = roadmapSteps?.projectSteps ?? []

  const projectsWithStatus = useMemo(() => {
    return projects.map(p => {
      const step = projectSteps.find(s => s.id === p.id)
      const userStatus = userProjectStatuses.find(s => s.projectId === p.id)
      const status = userStatus?.completed ? 'done' : (step?.status ?? 'locked')
      return { ...p, status, step }
    })
  }, [projects, projectSteps, userProjectStatuses])

  const filtered = useMemo(() => {
    return projectsWithStatus.filter(p => {
      if (diffFilter !== 'all' && difficultyLabel(p.difficulty) !== diffFilter) return false
      if (statusFilter !== 'all' && p.status !== statusFilter) return false
      return true
    })
  }, [projectsWithStatus, diffFilter, statusFilter])

  const doneCount = projectsWithStatus.filter(p => p.status === 'done').length
  const totalCount = projectsWithStatus.length
  const progressPct = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0

  const nextMilestone = projectsWithStatus.find(p => p.status === 'suggested') ?? null

  const modalProj = modalProject ? projectsWithStatus.find(p => p.id === modalProject) : null

  const statusBadgeClass = (status: string) => {
    if (status === 'done') return 'badge badge-filled'
    if (status === 'suggested') return 'badge badge-outline'
    return 'badge badge-muted'
  }
  const statusLabel = (status: string) => {
    if (status === 'done') return 'COMPLETED'
    if (status === 'suggested') return 'AVAILABLE'
    return 'LOCKED'
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)' }}>Loading projects...</p>
      </div>
    )
  }

  const roleBadge = role.toUpperCase()

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: '3rem' }}>
        {error && (
          <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
            Note: {error}. Showing local data.
          </div>
        )}

        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Projects</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span className="role-badge">{roleBadge}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>{totalCount} projects · {doneCount} completed</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
              Complete projects to validate your skills in practice and improve your readiness score.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>

        {/* Filter Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '2rem', padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', background: 'var(--gray-light)' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-dark)', textTransform: 'uppercase' }}>FILTER</span>
          <select value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={{ width: 'auto' }}>
            <option value="all">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value as StatusFilter)} style={{ width: 'auto' }}>
            <option value="all">All Statuses</option>
            <option value="done">Completed</option>
            <option value="suggested">Available</option>
            <option value="locked">Locked</option>
          </select>
          <span style={{ marginLeft: 'auto', fontSize: '0.82rem', color: 'var(--gray-dark)' }}>Showing {filtered.length} projects</span>
        </div>

        {/* Projects Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2.5rem' }}>
          {filtered.map(p => (
            <div key={p.id} className={`proj-card ${p.status === 'done' ? 'proj-done' : ''} ${p.status === 'locked' ? 'proj-locked' : ''}`} onClick={() => p.status !== 'locked' && setModalProject(p.id)}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '0.85rem' }}>
                <h3 style={{ fontSize: '1rem', margin: 0, lineHeight: 1.3 }}>{p.title}</h3>
                <span className={statusBadgeClass(p.status)}>{statusLabel(p.status)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', fontSize: '0.78rem', color: 'var(--gray-dark)' }}>
                {difficultyDots(p.difficulty)}
                <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{difficultyLabel(p.difficulty)}</span>
              </div>
              {p.description && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', marginBottom: '1.1rem', lineHeight: 1.55, flex: 1 }}>{p.description}</p>
              )}
              {p.required_skills && p.required_skills.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1.25rem' }}>
                  {p.required_skills.slice(0, 4).map(s => (
                    <span key={s} style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: 4, background: 'var(--gray-light)', border: '1px solid var(--gray-mid)' }}>{s}</span>
                  ))}
                </div>
              )}
              <div style={{ borderTop: '1px solid var(--gray-mid)', paddingTop: '1rem', marginTop: 'auto' }}>
                {p.status === 'locked' ? (
                  <button disabled style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem', cursor: 'not-allowed', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-main)', color: 'var(--gray-dark)' }}>
                    Complete prerequisites first
                  </button>
                ) : p.status === 'done' ? (
                  <button onClick={e => { e.stopPropagation(); toggleProjectComplete(p.id) }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--fg)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-main)', color: 'var(--fg)' }}>
                    <svg width="12" height="12" fill="none" stroke="var(--fg)" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                    Completed
                  </button>
                ) : (
                  <button onClick={e => { e.stopPropagation(); toggleProjectComplete(p.id) }} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', background: 'none', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '0.35rem 0.75rem', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600, fontFamily: 'var(--font-main)', color: 'var(--gray-dark)' }}>
                    Mark Done
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-dark)' }}>
            {projects.length === 0 ? 'No projects loaded. Complete onboarding first.' : 'No projects match your filters.'}
          </div>
        )}

        {/* Progress Summary */}
        <div className="card" style={{ marginBottom: '2rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 0 }}>
            <div style={{ padding: '1.75rem 2rem', borderRight: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.75rem' }}>Overall Progress</p>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '2.5rem', fontWeight: 700, lineHeight: 1 }}>{doneCount}</span>
                <span style={{ fontSize: '1rem', color: 'var(--gray-dark)' }}>of {totalCount} completed</span>
              </div>
              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progressPct}%` }} /></div>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', marginTop: '0.75rem' }}>{progressPct}% of track complete</p>
            </div>
            <div style={{ padding: '1.75rem 2rem', borderRight: '1px solid var(--border-color)' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.75rem' }}>Score Contribution</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '0.3rem' }}>+{doneCount * 5}</p>
              <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>Up to +{(totalCount - doneCount) * 5} more available</p>
            </div>
            <div style={{ padding: '1.75rem 2rem' }}>
              <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.75rem' }}>Next Milestone</p>
              {nextMilestone ? (
                <>
                  <p style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>{nextMilestone.title}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', marginBottom: '1rem' }}>Available · {difficultyLabel(nextMilestone.difficulty)} difficulty</p>
                  <button className="btn btn-primary" onClick={() => setModalProject(nextMilestone.id)}>Continue →</button>
                </>
              ) : (
                <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>All projects completed!</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal */}
      {modalProj && (
        <div onClick={() => setModalProject(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(0,0,0,0.35)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div onClick={e => e.stopPropagation()} style={{ background: 'var(--bg)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', width: '100%', maxWidth: 560, overflow: 'hidden', margin: '2rem' }}>
            <div className="card-header">
              <span className="card-header-label" style={{ color: 'var(--gray-dark)' }}>Project Details</span>
              <button onClick={() => setModalProject(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-dark)', fontSize: '1.1rem' }}>✕</button>
            </div>
            <div style={{ padding: '2rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.75rem', marginBottom: '1rem' }}>
                <h2 style={{ fontSize: '1.35rem', margin: 0 }}>{modalProj.title}</h2>
                <span className={statusBadgeClass(modalProj.status)}>{statusLabel(modalProj.status)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
                {difficultyDots(modalProj.difficulty)}
                <span style={{ fontWeight: 600, color: 'var(--fg)' }}>{difficultyLabel(modalProj.difficulty)}</span>
              </div>
              {modalProj.description && (
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', marginBottom: '1.5rem', lineHeight: 1.6 }}>{modalProj.description}</p>
              )}
              {modalProj.required_skills && modalProj.required_skills.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                  <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.07em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.6rem' }}>Required Skills</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                    {modalProj.required_skills.map(s => (
                      <span key={s} style={{ fontSize: '0.82rem', fontWeight: 600, padding: '0.25rem 0.65rem', borderRadius: 4, background: 'var(--gray-light)', border: '1px solid var(--border-color)' }}>{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', paddingTop: '1.25rem', borderTop: '1px solid var(--gray-mid)' }}>
                {modalProj.status !== 'locked' && (
                  <button className="btn btn-primary" style={{ flex: 1 }} onClick={() => { toggleProjectComplete(modalProj.id); setModalProject(null) }}>
                    {modalProj.status === 'done' ? 'Mark Incomplete' : 'Complete'}
                  </button>
                )}
                <button className="btn btn-outline" onClick={() => setModalProject(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
