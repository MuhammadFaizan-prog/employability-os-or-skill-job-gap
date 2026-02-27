import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useCodingChallenges } from '../hooks/useCodingChallenges'
import { getStoredRole } from '../hooks/useAuth'

function ensureHints(h: unknown): string[] {
  if (Array.isArray(h)) return h.map(String).filter(Boolean)
  if (typeof h === 'string') try { const a = JSON.parse(h); return Array.isArray(a) ? a.map(String) : []; } catch { return []; }
  return []
}

export function CodingChallenge() {
  const { challengeId } = useParams<{ challengeId: string }>()
  const navigate = useNavigate()
  const role = getStoredRole()
  const { challenges, loading, error, submitAttempt } = useCodingChallenges(role)

  const challenge = challenges.find(c => c.id === challengeId)
  const [code, setCode] = useState('')
  const [phase, setPhase] = useState<'attempt' | 'solution'>('attempt')
  const [submitting, setSubmitting] = useState(false)
  const [hintIndex, setHintIndex] = useState(-1)
  const startTimeRef = useRef<number>(Date.now())
  const [secondsLeft, setSecondsLeft] = useState(0)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!challenge) return
    setCode(challenge.starter_code || '')
    setPhase('attempt')
    setHintIndex(-1)
    startTimeRef.current = Date.now()
    const limit = (challenge.time_limit_minutes || 30) * 60
    setSecondsLeft(limit)
  }, [challenge])

  useEffect(() => {
    if (phase !== 'attempt' || !challenge || secondsLeft <= 0) return
    timerRef.current = setInterval(() => {
      setSecondsLeft(prev => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current)
          return 0
        }
        return prev - 1
      })
    }, 1000)
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [phase, challenge, secondsLeft])

  const handleSubmit = useCallback(async () => {
    if (!challenge || phase !== 'attempt') return
    setSubmitting(true)
    const timeSpent = Math.round((Date.now() - startTimeRef.current) / 1000)
    const { error: err } = await submitAttempt(challenge.id, code, timeSpent)
    setSubmitting(false)
    if (err) return
    setPhase('solution')
  }, [challenge, code, phase, submitAttempt])

  const hints = challenge ? ensureHints(challenge.hints) : []

  if (loading || !challengeId) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)' }}>Loading...</p>
      </div>
    )
  }

  if (!challenge) {
    return (
      <div className="container" style={{ paddingTop: '6rem', textAlign: 'center' }}>
        <p style={{ color: 'var(--gray-dark)', marginBottom: '1rem' }}>Challenge not found.</p>
        <button className="btn btn-outline" onClick={() => navigate('/interview')}>Back to Interview</button>
      </div>
    )
  }

  const timeStr = `${Math.floor(secondsLeft / 60)}:${(secondsLeft % 60).toString().padStart(2, '0')}`
  const companyTags = Array.isArray(challenge.company_tags) ? challenge.company_tags : []

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div className="container" style={{ paddingTop: '1.5rem' }}>
        {error && (
          <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)', marginBottom: '1rem', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1rem' }}>
          <button className="btn btn-outline" onClick={() => navigate('/interview')}>← Back to Interview</button>
          {phase === 'attempt' && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
              <span style={{ fontWeight: 600 }}>Time: {timeStr}</span>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Saving...' : 'Submit'}
              </button>
            </div>
          )}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1fr)',
            gap: '1.5rem',
            alignItems: 'start',
          }}
          className="coding-layout"
        >
          {/* Left: Problem */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '1.5rem', position: 'sticky', top: '1rem' }}>
            <h1 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{challenge.title}</h1>
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem', flexWrap: 'wrap' }}>
              <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20, border: '1px solid var(--gray-mid)', color: 'var(--gray-dark)' }}>
                {challenge.difficulty}
              </span>
              {companyTags.map((t, i) => (
                <span key={i} style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 20, background: 'var(--gray-light)', color: 'var(--gray-dark)' }}>{t}</span>
              ))}
            </div>
            <div style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', lineHeight: 1.6, color: 'var(--fg)' }}>
              {challenge.description}
            </div>
            {hints.length > 0 && (
              <div style={{ marginTop: '1.25rem' }}>
                <h3 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Hints</h3>
                {hints.map((h, i) => (
                  <div key={i} style={{ marginBottom: '0.5rem' }}>
                    {i <= hintIndex ? (
                      <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', margin: 0 }}>{h}</p>
                    ) : (
                      <button type="button" className="btn btn-outline" style={{ fontSize: '0.85rem' }} onClick={() => setHintIndex(i)}>
                        Reveal hint {i + 1}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right: Editor / Solution */}
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', overflow: 'hidden', minHeight: 320 }}>
            {phase === 'attempt' ? (
              <>
                <div style={{ padding: '0.5rem 1rem', borderBottom: '1px solid var(--border-color)', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
                  JavaScript
                </div>
                <textarea
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  spellCheck={false}
                  style={{
                    width: '100%',
                    minHeight: 320,
                    padding: '1rem',
                    fontFamily: 'ui-monospace, monospace',
                    fontSize: '0.9rem',
                    lineHeight: 1.5,
                    border: 'none',
                    resize: 'vertical',
                    background: 'var(--bg)',
                    color: 'var(--fg)',
                    boxSizing: 'border-box',
                  }}
                />
              </>
            ) : (
              <div style={{ padding: '1.5rem' }}>
                <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>Reference solution</h3>
                <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'ui-monospace, monospace', fontSize: '0.85rem', lineHeight: 1.5, margin: 0, padding: '1rem', background: 'var(--gray-light)', borderRadius: 'var(--radius-sm)', overflow: 'auto' }}>
                  {challenge.solution_code || 'No solution provided.'}
                </pre>
                <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button className="btn btn-outline" onClick={() => { setPhase('attempt'); setCode(challenge.starter_code || ''); setHintIndex(-1); startTimeRef.current = Date.now(); setSecondsLeft((challenge.time_limit_minutes || 30) * 60); }}>
                    Try again
                  </button>
                  <button className="btn btn-primary" onClick={() => navigate('/interview')}>Back to Interview</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
