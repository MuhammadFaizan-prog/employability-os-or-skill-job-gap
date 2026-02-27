import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoleData } from '../hooks/useRoleData'
import { getStoredRole } from '../hooks/useAuth'

type FilterValue = 'all' | 'gap' | 'strength' | 'priority'
type SortValue = 'default' | 'weight-desc' | 'proficiency-asc' | 'difficulty-asc' | 'gap-desc'

function computeStatus(proficiency: number, target: number, weight: number): 'strength' | 'gap' | 'priority' {
  if (proficiency >= target) return 'strength'
  const gap = target - proficiency
  if (weight >= 85 && gap >= 2) return 'priority'
  return 'gap'
}

export function Skills() {
  const navigate = useNavigate()
  const role = getStoredRole()
  const {
    loading,
    error,
    skills,
    userSkillRatings,
    skillGapResult,
    setUserSkillRating,
  } = useRoleData(role)

  const [currentFilter, setCurrentFilter] = useState<FilterValue>('all')
  const [currentSort, setCurrentSort] = useState<SortValue>('default')
  const [saveText, setSaveText] = useState('Save Changes')

  const TARGET_PROFICIENCY = 4

  const skillsWithStatus = useMemo(() => {
    return skills.map(s => {
      const rating = userSkillRatings.find(r => r.skillId === s.id)
      const proficiency = rating?.proficiency ?? 0
      const target = TARGET_PROFICIENCY
      const status = computeStatus(proficiency, target, s.weight)
      return { ...s, proficiency, target, status }
    })
  }, [skills, userSkillRatings])

  const summary = useMemo(() => ({
    strengths: skillsWithStatus.filter(s => s.status === 'strength').length,
    gaps: skillsWithStatus.filter(s => s.status === 'gap').length,
    priority: skillsWithStatus.filter(s => s.status === 'priority').length,
  }), [skillsWithStatus])

  const suggestedNext = skillGapResult?.suggestedNextSkill
  const suggestedSkillData = suggestedNext
    ? skillsWithStatus.find(s => s.id === suggestedNext.id)
    : null

  const filteredAndSorted = useMemo(() => {
    let data = currentFilter === 'all'
      ? skillsWithStatus
      : skillsWithStatus.filter(s => s.status === currentFilter)

    if (currentSort === 'weight-desc') data = [...data].sort((a, b) => b.weight - a.weight)
    else if (currentSort === 'proficiency-asc') data = [...data].sort((a, b) => a.proficiency - b.proficiency)
    else if (currentSort === 'difficulty-asc') data = [...data].sort((a, b) => a.difficulty - b.difficulty)
    else if (currentSort === 'gap-desc') data = [...data].sort((a, b) => (b.target - b.proficiency) - (a.target - a.proficiency))
    return data
  }, [skillsWithStatus, currentFilter, currentSort])

  const priorityFocus = useMemo(() => {
    return skillsWithStatus
      .filter(s => s.status === 'priority' || s.status === 'gap')
      .sort((a, b) => (b.target - b.proficiency) - (a.target - a.proficiency) || b.weight - a.weight)
      .slice(0, 3)
  }, [skillsWithStatus])

  const updateRating = (skillId: string, value: number) => {
    setUserSkillRating(skillId, value)
  }

  const handleSave = () => {
    setSaveText('Saved ✓')
    setTimeout(() => setSaveText('Save Changes'), 2000)
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)' }}>Loading skills data...</p>
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

        {/* Header */}
        <div className="page-header">
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Skill Gap Analysis</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span className="role-badge">{roleBadge}</span>
              <span style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
                {skills.length} skills assessed · Last updated today
              </span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
              Review your proficiency across role-relevant skills. Update ratings to recalculate gap analysis.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>

        {/* Summary Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.5rem', marginBottom: '2rem' }}>
          <div className="stat-card" style={{ padding: '1.5rem' }}>
            <p className="stat-label" style={{ marginBottom: '0.5rem' }}>Strengths</p>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.3rem' }}>{summary.strengths}</p>
            <p className="stat-desc">Skills at or above target</p>
          </div>
          <div className="stat-card" style={{ padding: '1.5rem' }}>
            <p className="stat-label" style={{ marginBottom: '0.5rem' }}>Skill Gaps</p>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.3rem' }}>{summary.gaps}</p>
            <p className="stat-desc">Skills below acceptable level</p>
          </div>
          <div className="stat-card" style={{ padding: '1.5rem' }}>
            <p className="stat-label" style={{ marginBottom: '0.5rem' }}>Priority Focus</p>
            <p style={{ fontSize: '2.25rem', fontWeight: 700, lineHeight: 1, marginBottom: '0.3rem' }}>{summary.priority}</p>
            <p className="stat-desc">Critical gaps to close first</p>
          </div>
        </div>

        {/* Suggested Next Skill */}
        {suggestedSkillData && (
          <div style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '1.25rem 1.5rem', marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '1rem', background: 'var(--gray-light)' }}>
            <svg width="20" height="20" fill="none" stroke="var(--fg)" strokeWidth="2" viewBox="0 0 24 24"><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" /></svg>
            <div style={{ flex: 1 }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em', color: 'var(--gray-dark)' }}>RECOMMENDED NEXT SKILL</span>
              <p style={{ fontWeight: 700, fontSize: '1.1rem', margin: '0.25rem 0 0.35rem' }}>{suggestedSkillData.name}</p>
              <p style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', margin: 0 }}>
                Weight {suggestedSkillData.weight} · Your proficiency {suggestedSkillData.proficiency}/5 vs target {suggestedSkillData.target}/5
              </p>
            </div>
            <button className="btn btn-primary" onClick={() => {
              const el = document.querySelector(`[data-skill-id="${suggestedSkillData.id}"]`)
              el?.scrollIntoView({ behavior: 'smooth', block: 'center' })
            }}>Focus This Skill</button>
          </div>
        )}

        {/* Filter + Sort */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0.875rem 1.25rem', border: '1px solid var(--border-color)', borderBottom: 'none', borderRadius: 'var(--radius-sm) var(--radius-sm) 0 0', background: 'var(--gray-light)' }}>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-dark)', marginRight: '0.5rem' }}>FILTER:</span>
            {(['all', 'gap', 'strength', 'priority'] as const).map(f => (
              <button key={f} onClick={() => setCurrentFilter(f)} style={{ fontSize: '0.8rem', fontWeight: 500, padding: '0.3rem 0.8rem', border: `1px solid ${currentFilter === f ? 'var(--fg)' : 'var(--border-color)'}`, borderRadius: 20, background: currentFilter === f ? 'var(--fg)' : 'transparent', color: currentFilter === f ? 'var(--bg)' : 'var(--fg)', cursor: 'pointer', fontFamily: 'var(--font-main)' }}>
                {f === 'all' ? 'All' : f === 'gap' ? 'Gaps Only' : f === 'strength' ? 'Strengths' : 'Priority'}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-dark)' }}>SORT:</span>
            <select value={currentSort} onChange={e => setCurrentSort(e.target.value as SortValue)} style={{ fontSize: '0.8rem', fontWeight: 500, padding: '0.3rem 0.6rem', width: 'auto' }}>
              <option value="default">Default</option>
              <option value="weight-desc">Weight High→Low</option>
              <option value="proficiency-asc">Proficiency Low→High</option>
              <option value="difficulty-asc">Difficulty Easy→Hard</option>
              <option value="gap-desc">Biggest Gap First</option>
            </select>
          </div>
        </div>

        {/* Skills Table */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: '0 0 var(--radius-window) var(--radius-window)', overflow: 'hidden', marginBottom: '2.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 100px 80px 200px 110px', background: 'var(--fg)', color: 'var(--bg)', padding: '0.75rem 1.5rem', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.07em', textTransform: 'uppercase' as const }}>
            <span>Skill Name</span><span>Difficulty</span><span>Weight</span><span>Proficiency</span><span style={{ textAlign: 'center' }}>Status</span>
          </div>
          {filteredAndSorted.map(s => {
            const statusStyle = s.status === 'strength'
              ? { background: 'var(--fg)', color: 'var(--bg)', border: 'none' }
              : s.status === 'priority'
                ? { border: '2px solid var(--fg)', color: 'var(--fg)', background: 'transparent', fontWeight: 700 }
                : { border: '1px solid var(--border-color)', color: 'var(--fg)', background: 'transparent' }
            return (
              <div key={s.id} data-skill-id={s.id} style={{ display: 'grid', gridTemplateColumns: '2fr 100px 80px 200px 110px', alignItems: 'center', padding: '0.9rem 1.5rem', borderBottom: '1px solid var(--gray-mid)' }}>
                <p style={{ fontWeight: 600, fontSize: '0.9rem', maxWidth: 'none', margin: 0 }}>{s.name}</p>
                <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>{s.difficulty <= 2 ? 'Easy' : s.difficulty <= 3 ? 'Medium' : 'Hard'}</span>
                <span style={{ fontSize: '0.875rem', fontWeight: 700 }}>{s.weight}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[1, 2, 3, 4, 5].map(n => (
                      <button key={n} onClick={() => updateRating(s.id, n)} style={{ width: 32, height: 32, borderRadius: '50%', border: '1px solid var(--border-color)', background: n <= s.proficiency ? 'var(--fg)' : 'transparent', color: n <= s.proficiency ? 'var(--bg)' : 'var(--fg)', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.15s', fontFamily: 'var(--font-main)' }}>
                        {n}
                      </button>
                    ))}
                  </div>
                  <span style={{ fontSize: '0.8rem', color: 'var(--gray-dark)' }}>/ {s.target}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'center' }}>
                  <span style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.25rem 0.65rem', borderRadius: 20, ...statusStyle, letterSpacing: '0.04em' }}>
                    {s.status.toUpperCase()}
                  </span>
                </div>
              </div>
            )
          })}
          {filteredAndSorted.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-dark)' }}>
              {skills.length === 0 ? 'No skills loaded. Complete onboarding first.' : 'No skills match this filter.'}
            </div>
          )}
        </div>

        {/* Priority Focus */}
        {priorityFocus.length > 0 && (
          <div style={{ marginBottom: '3rem' }}>
            <h3 style={{ fontSize: '1rem', marginBottom: '1.25rem' }}>Priority Focus — Top Gaps to Close</h3>
            <div className="card">
              <div style={{ display: 'grid', gridTemplateColumns: '48px 1fr 180px 180px', gap: '1.5rem', alignItems: 'center', padding: '0.75rem 1.5rem', borderBottom: '1px solid var(--border-color)', background: 'var(--gray-light)', fontSize: '0.75rem', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' as const, color: 'var(--gray-dark)' }}>
                <span>#</span><span>Skill</span><span>Your Level</span><span>Target Level</span>
              </div>
              {priorityFocus.map((s, i) => (
                <div key={s.id} style={{ display: 'grid', gridTemplateColumns: '48px 1fr 180px 180px', gap: '1.5rem', alignItems: 'center', padding: '1.25rem 1.5rem', borderBottom: i < priorityFocus.length - 1 ? '1px solid var(--gray-mid)' : 'none' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 700 }}>{i + 1}</span>
                  <p style={{ fontWeight: 600, fontSize: '0.925rem', maxWidth: 'none', margin: 0 }}>{s.name}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: 8, border: '1px solid var(--border-color)', borderRadius: 20, overflow: 'hidden', background: 'var(--bg)' }}>
                      <div style={{ width: `${(s.proficiency / 5) * 100}%`, height: '100%', background: 'var(--fg)', borderRadius: 20 }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{s.proficiency}/5</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ flex: 1, height: 8, border: '1px solid var(--border-color)', borderRadius: 20, overflow: 'hidden', background: 'var(--bg)' }}>
                      <div style={{ width: `${(s.target / 5) * 100}%`, height: '100%', background: 'var(--gray-mid)', borderRadius: 20 }} />
                    </div>
                    <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--gray-dark)' }}>{s.target}/5</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Fixed Action Bar */}
      <div style={{ position: 'fixed', bottom: 0, left: 0, width: '100%', background: 'var(--bg)', borderTop: '1px solid var(--border-color)', padding: '1rem 2rem', display: 'flex', justifyContent: 'center', gap: '1rem', zIndex: 50 }}>
        <button className="btn btn-primary" onClick={handleSave}>{saveText}</button>
        <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
      </div>
    </div>
  )
}
