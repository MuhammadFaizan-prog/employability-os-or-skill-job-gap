import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoleData } from '../hooks/useRoleData'
import { getStoredRole } from '../hooks/useAuth'

const STATUS_LABELS: Record<string, string> = {
  done: 'DONE', next: 'IN PROGRESS', upcoming: 'QUEUED',
  suggested: 'SUGGESTED', locked: 'LOCKED',
}

export function RoadmapPage() {
  const navigate = useNavigate()
  const role = getStoredRole()
  const { loading, error, skills, projects, roadmapSteps, roadmapSummary } = useRoleData(role)
  const [activeNode, setActiveNode] = useState<string | null>(null)

  const skillSteps = roadmapSteps?.skillSteps ?? []
  const projectSteps = roadmapSteps?.projectSteps ?? []

  const completedSkills = roadmapSummary?.skillsDone ?? 0
  const inProgressSkills = roadmapSummary?.skillsNext ?? 0
  const projectsDone = roadmapSummary?.projectsDone ?? 0
  const totalProjects = projects.length
  const totalSkills = skills.length

  const estTimeLeft = useMemo(() => {
    return skillSteps.filter(s => s.status !== 'done').length * 2
  }, [skillSteps])

  const selectedSkill = activeNode?.startsWith('skill-')
    ? skillSteps.find(s => `skill-${s.id}` === activeNode)
    : null
  const selectedProject = activeNode?.startsWith('proj-')
    ? projectSteps.find(p => `proj-${p.id}` === activeNode)
    : null

  const getStatusBadge = (status: string) => {
    if (status === 'done' || status === 'next' || status === 'suggested') return 'badge badge-filled'
    if (status === 'upcoming' || status === 'locked') return 'badge badge-muted'
    return 'badge badge-outline'
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)' }}>Loading roadmap...</p>
      </div>
    )
  }

  const roleBadge = role.toUpperCase()

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 100 }}>
      <div className="container" style={{ paddingTop: '3rem' }}>
        {error && (
          <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
            Note: {error}. Showing local data.
          </div>
        )}

        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Career Roadmap</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span className="role-badge">{roleBadge}</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
              Follow your sequenced skill and project progression to reach your career goals.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>

        {/* Stats Bar */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', overflow: 'hidden', marginBottom: '3rem' }}>
          {[
            { label: 'Total Skills', val: String(totalSkills) },
            { label: 'Completed', val: String(completedSkills) },
            { label: 'In Progress', val: String(inProgressSkills) },
            { label: 'Projects Done', val: `${projectsDone} / ${totalProjects}` },
            { label: 'Est. Time Left', val: `${estTimeLeft} hrs` },
          ].map((s, i) => (
            <div key={s.label} style={{ padding: '1.25rem 1.5rem', borderRight: i < 4 ? '1px solid var(--border-color)' : 'none' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.4rem' }}>{s.label}</p>
              <p style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{s.val}</p>
            </div>
          ))}
        </div>

        {/* Main Layout */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2.5rem', alignItems: 'start' }}>
          <div>
            <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '1.5rem' }}>Skill Progression Path</h3>
            <div style={{ position: 'relative', paddingLeft: 56 }}>
              <div style={{ position: 'absolute', left: 24, top: 20, bottom: 20, width: 2, background: 'var(--gray-mid)', zIndex: 0 }} />
              {skillSteps.map((skill, i) => {
                const nodeId = `skill-${skill.id}`
                const isActive = activeNode === nodeId
                const dotBg = skill.status === 'upcoming' ? 'var(--gray-mid)' : 'var(--fg)'
                return (
                  <div key={skill.id} className="roadmap-node" style={{ position: 'relative', marginBottom: i < skillSteps.length - 1 ? 12 : 0 }}>
                    <div style={{ position: 'absolute', left: -38, top: '50%', transform: 'translateY(-50%)', width: 12, height: 12, borderRadius: '50%', border: '2px solid var(--bg)', zIndex: 1, background: dotBg }} />
                    <div className={`roadmap-node-inner ${isActive ? 'active-node' : ''}`} onClick={() => setActiveNode(nodeId)}>
                      <div style={{ flex: 1 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{skill.name}</span>
                          <span className={getStatusBadge(skill.status)}>{STATUS_LABELS[skill.status] ?? skill.status.toUpperCase()}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '0.3rem' }}>
                          <span style={{ fontSize: '0.78rem', fontWeight: 600, color: isActive ? 'rgba(255,255,255,0.7)' : 'var(--gray-dark)' }}>Difficulty {skill.difficulty}</span>
                          {skill.userProficiency !== undefined && (
                            <span style={{ fontSize: '0.78rem', color: isActive ? 'rgba(255,255,255,0.6)' : 'var(--gray-dark)' }}>Proficiency: {skill.userProficiency}/5</span>
                          )}
                        </div>
                      </div>
                      <svg width="14" height="14" fill="none" stroke={isActive ? 'rgba(255,255,255,0.6)' : 'var(--gray-dark)'} strokeWidth="2" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
                    </div>
                  </div>
                )
              })}
            </div>

            {/* Project Milestones */}
            <div style={{ marginTop: '3rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
                <h3 style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--gray-dark)', margin: 0 }}>Project Milestones</h3>
                <span style={{ fontSize: '0.8rem', color: 'var(--gray-dark)' }}>{projectsDone} of {totalProjects} complete</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem' }}>
                {projectSteps.map(proj => {
                  const nodeId = `proj-${proj.id}`
                  const isActive = activeNode === nodeId
                  return (
                    <div key={proj.id} className={`project-card ${isActive ? 'active-project' : ''}`} onClick={() => setActiveNode(nodeId)}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.6rem' }}>
                        <p style={{ fontWeight: 700, fontSize: '0.9rem' }}>{proj.title}</p>
                        <span className={getStatusBadge(proj.status)}>{STATUS_LABELS[proj.status] ?? proj.status.toUpperCase()}</span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: isActive ? 'rgba(255,255,255,0.65)' : 'var(--gray-dark)', marginBottom: '0.5rem' }}>Difficulty {proj.difficulty}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                        {(proj.required_skills ?? []).slice(0, 3).map(sk => (
                          <span key={sk} style={{ fontSize: '0.7rem', fontWeight: 600, padding: '0.15rem 0.45rem', borderRadius: 4, background: isActive ? 'rgba(255,255,255,0.2)' : 'var(--gray-light)', border: isActive ? 'none' : '1px solid var(--border-color)' }}>{sk}</span>
                        ))}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          {/* Detail Panel */}
          <div className="card" style={{ position: 'sticky', top: 80 }}>
            <div className="card-header">
              <span className="card-header-label" style={{ color: 'var(--gray-dark)' }}>Detail View</span>
              <button onClick={() => setActiveNode(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-dark)', fontSize: '1rem' }}>✕</button>
            </div>
            <div style={{ padding: '1.75rem' }}>
              {!selectedSkill && !selectedProject ? (
                <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', textAlign: 'center', padding: '2rem 0' }}>Click any skill or project to view details.</p>
              ) : selectedSkill ? (
                <>
                  <span className={getStatusBadge(selectedSkill.status)}>{STATUS_LABELS[selectedSkill.status]}</span>
                  <h3 style={{ fontSize: '1.1rem', margin: '1rem 0 0.5rem' }}>{selectedSkill.name}</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                    <div style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.3rem' }}>Difficulty</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedSkill.difficulty}</p>
                    </div>
                    <div style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)' }}>
                      <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.3rem' }}>Proficiency</p>
                      <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedSkill.userProficiency ?? 0}/5</p>
                    </div>
                  </div>
                  {selectedSkill.status !== 'done' ? (
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem' }}>
                      {selectedSkill.status === 'next' ? 'Continue Learning' : 'Start This Skill'}
                    </button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)' }}>
                      <svg width="14" height="14" fill="none" stroke="var(--fg)" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Skill Completed</span>
                    </div>
                  )}
                </>
              ) : selectedProject ? (
                <>
                  <span className={getStatusBadge(selectedProject.status)}>{STATUS_LABELS[selectedProject.status]}</span>
                  <h3 style={{ fontSize: '1.1rem', margin: '1rem 0 0.5rem' }}>{selectedProject.title}</h3>
                  {selectedProject.evaluation_criteria && (
                    <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', marginBottom: '1rem', lineHeight: 1.5 }}>{selectedProject.evaluation_criteria}</p>
                  )}
                  <div style={{ padding: '0.85rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', marginBottom: '1rem' }}>
                    <p style={{ fontSize: '0.68rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.3rem' }}>Difficulty</p>
                    <p style={{ fontSize: '0.9rem', fontWeight: 700 }}>{selectedProject.difficulty}</p>
                  </div>
                  {selectedProject.required_skills && selectedProject.required_skills.length > 0 && (
                    <div style={{ marginBottom: '1.5rem' }}>
                      <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.5rem' }}>Required Skills</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                        {selectedProject.required_skills.map(sk => (
                          <span key={sk} style={{ fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.55rem', borderRadius: 4, background: 'var(--gray-light)', border: '1px solid var(--border-color)' }}>{sk}</span>
                        ))}
                      </div>
                    </div>
                  )}
                  {selectedProject.status !== 'done' && selectedProject.status !== 'locked' && (
                    <button className="btn btn-primary" style={{ width: '100%', fontSize: '0.9rem' }}>
                      {selectedProject.status === 'suggested' ? 'Start Project' : 'Start Project'}
                    </button>
                  )}
                  {selectedProject.status === 'locked' && (
                    <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', fontStyle: 'italic' }}>Complete prerequisite skills to unlock.</p>
                  )}
                  {selectedProject.status === 'done' && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.75rem 1rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)' }}>
                      <svg width="14" height="14" fill="none" stroke="var(--fg)" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>
                      <span style={{ fontSize: '0.82rem', fontWeight: 600 }}>Project Completed</span>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
