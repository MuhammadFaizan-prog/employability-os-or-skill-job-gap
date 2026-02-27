import { useState, useMemo, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRoleData } from '../hooks/useRoleData'
import { getStoredRole } from '../hooks/useAuth'

const PRACTICED_KEY = 'employabilityos_practiced'

function loadPracticed(): Record<string, boolean> {
  try {
    const raw = localStorage.getItem(PRACTICED_KEY)
    return raw ? JSON.parse(raw) : {}
  } catch { return {} }
}

function savePracticed(data: Record<string, boolean>) {
  localStorage.setItem(PRACTICED_KEY, JSON.stringify(data))
}

export function Interview() {
  const navigate = useNavigate()
  const role = getStoredRole()
  const { loading, error, interviewQuestions, skillGapResult } = useRoleData(role)

  const [topicFilter, setTopicFilter] = useState<'all' | string>('all')
  const [diffFilter, setDiffFilter] = useState<'all' | string>('all')
  const [practiced, setPracticed] = useState<Record<string, boolean>>(loadPracticed)
  const [expanded, setExpanded] = useState<Set<string>>(new Set())

  const gapSkillNames = useMemo(() => {
    const names = new Set<string>()
    skillGapResult?.gaps.forEach(g => names.add(g.skill.name.toLowerCase()))
    skillGapResult?.priorityFocus.forEach(p => names.add(p.skill.name.toLowerCase()))
    return names
  }, [skillGapResult])

  const questionsWithGap = useMemo(() => {
    return interviewQuestions.map(q => {
      const cat = (q.category || '').toLowerCase()
      const isGap = gapSkillNames.has(cat) || [...gapSkillNames].some(g => cat.includes(g) || g.includes(cat))
      return { ...q, gap: isGap }
    })
  }, [interviewQuestions, gapSkillNames])

  const topics = useMemo(() => {
    const set = new Set(questionsWithGap.map(q => q.category || 'General'))
    return Array.from(set).sort()
  }, [questionsWithGap])

  const filtered = useMemo(() => {
    return questionsWithGap.filter(q => {
      if (topicFilter !== 'all' && (q.category || 'General') !== topicFilter) return false
      if (diffFilter !== 'all' && q.difficulty_level !== diffFilter) return false
      return true
    })
  }, [questionsWithGap, topicFilter, diffFilter])

  const gapCount = useMemo(() => filtered.filter(q => q.gap).length, [filtered])
  const practicedCount = useMemo(() => filtered.filter(q => practiced[q.id]).length, [filtered, practiced])

  const togglePracticed = useCallback((id: string) => {
    setPracticed(prev => {
      const next = { ...prev, [id]: !prev[id] }
      savePracticed(next)
      return next
    })
  }, [])

  const markAllPracticed = () => {
    const next = { ...practiced }
    filtered.forEach(q => { next[q.id] = true })
    setPracticed(next)
    savePracticed(next)
  }

  const resetAll = () => {
    setPracticed({})
    savePracticed({})
    setExpanded(new Set())
  }

  const toggleExpanded = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const getDifficultyDots = (difficulty: string) => {
    const filled = difficulty === 'Easy' ? 1 : difficulty === 'Medium' ? 2 : 3
    return (
      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
        {[1, 2, 3].map(i => (
          <span key={i} style={{ width: 6, height: 6, borderRadius: '50%', backgroundColor: i <= filled ? 'var(--fg)' : 'var(--gray-mid)' }} />
        ))}
        <span style={{ marginLeft: 4, fontSize: '0.78rem', color: 'var(--gray-dark)' }}>{difficulty}</span>
      </span>
    )
  }

  if (loading) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)' }}>Loading interview questions...</p>
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
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Interview Prep</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span className="role-badge">{roleBadge}</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)' }}>
              Practice interview questions aligned to your role. Focus on skill gaps to strengthen weak areas.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>

        {/* Filter Controls */}
        <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', background: 'var(--gray-light)', marginBottom: '1rem' }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--gray-dark)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.75rem' }}>FILTER</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="topic-select" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-dark)' }}>Topic</label>
              <select id="topic-select" value={topicFilter} onChange={e => setTopicFilter(e.target.value)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', minWidth: 140 }}>
                <option value="all">All Topics</option>
                {topics.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <label htmlFor="diff-select" style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-dark)' }}>Difficulty</label>
              <select id="diff-select" value={diffFilter} onChange={e => setDiffFilter(e.target.value)} style={{ padding: '0.35rem 0.6rem', fontSize: '0.85rem', minWidth: 100 }}>
                <option value="all">All</option>
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>
            <span style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>{filtered.length} question{filtered.length !== 1 ? 's' : ''}</span>
            <div style={{ marginLeft: 'auto', display: 'flex', gap: '0.5rem' }}>
              <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }} onClick={markAllPracticed}>Mark All Practiced</button>
              <button className="btn btn-outline" style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }} onClick={resetAll}>Reset</button>
            </div>
          </div>
        </div>

        {/* Results Summary Line */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', fontSize: '0.9rem', color: 'var(--gray-dark)' }}>
          <span>{filtered.length} question{filtered.length !== 1 ? 's' : ''} — {gapCount} aligned to your skill gaps</span>
          <span>{practicedCount} practiced</span>
        </div>

        {/* Questions List */}
        <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', overflow: 'hidden' }}>
          {filtered.map((q, i) => (
            <div key={q.id} style={{ borderBottom: i < filtered.length - 1 ? '1px solid var(--gray-mid)' : 'none' }}>
              <div onClick={() => toggleExpanded(q.id)} style={{ display: 'grid', gridTemplateColumns: '32px 1fr auto auto', alignItems: 'center', gap: '1rem', padding: '1rem 1.25rem', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'var(--gray-light)' }} onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'transparent' }}>
                <button onClick={e => { e.stopPropagation(); togglePracticed(q.id) }} style={{ width: 22, height: 22, borderRadius: '50%', border: '1px solid var(--border-color)', background: practiced[q.id] ? 'var(--fg)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', flexShrink: 0 }} aria-label={practiced[q.id] ? 'Mark unpracticed' : 'Mark as practiced'}>
                  {practiced[q.id] && <svg width="12" height="12" fill="none" stroke="var(--bg)" strokeWidth="3" viewBox="0 0 24 24"><polyline points="20 6 9 17 4 12" /></svg>}
                </button>
                <p style={{ fontWeight: 600, fontSize: '0.925rem', margin: 0, textDecoration: practiced[q.id] ? 'line-through' : 'none', opacity: practiced[q.id] ? 0.6 : 1 }}>{q.question_text}</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                  {q.gap && <span style={{ fontSize: '0.68rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: 20, letterSpacing: '0.04em', border: '2px solid var(--fg)', color: 'var(--fg)' }}>YOUR GAP</span>}
                  <span style={{ fontSize: '0.72rem', padding: '0.15rem 0.5rem', borderRadius: 20, border: '1px solid var(--gray-mid)', color: 'var(--gray-dark)' }}>{q.category || 'General'}</span>
                  {getDifficultyDots(q.difficulty_level)}
                </div>
                <svg style={{ width: 20, height: 20, flexShrink: 0, transition: 'transform 0.2s', transform: expanded.has(q.id) ? 'rotate(90deg)' : 'rotate(0)' }} fill="none" stroke="var(--gray-dark)" strokeWidth="2.5" viewBox="0 0 24 24"><polyline points="9 18 15 12 9 6" /></svg>
              </div>
              {expanded.has(q.id) && (
                <div style={{ padding: '0 1.25rem 1.25rem 3.5rem', animation: 'fadeIn 0.2s ease-out' }}>
                  <div style={{ padding: '1rem 1.25rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)' }}>
                    <p style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--gray-dark)', marginBottom: '0.4rem' }}>HINT</p>
                    <p style={{ fontSize: '0.88rem', lineHeight: 1.55, color: 'var(--fg)', marginBottom: '1rem' }}>{q.hint || 'No hint available for this question.'}</p>
                    <button className="btn btn-outline" style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }} onClick={e => { e.stopPropagation(); togglePracticed(q.id) }}>
                      {practiced[q.id] ? 'Mark Unpracticed' : 'Mark as Practiced ✓'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
          {filtered.length === 0 && (
            <div style={{ padding: '3rem', textAlign: 'center', color: 'var(--gray-dark)' }}>
              {interviewQuestions.length === 0 ? 'No questions loaded. Complete onboarding first.' : 'No questions match your filters.'}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}




