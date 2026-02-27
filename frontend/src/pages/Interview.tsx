import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useRoleData } from '../hooks/useRoleData'
import { useCodingChallenges } from '../hooks/useCodingChallenges'
import { useAuth, getStoredRole } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import type { InterviewQuestion } from '../hooks/useRoleData'

type Phase = 'overview' | 'active' | 'results'

const QUIZ_TIME_MINUTES = 30

function getDifficultyLabel(level: string | number): string {
  if (typeof level === 'number') return level === 1 ? 'Easy' : level === 2 ? 'Medium' : 'Hard'
  return String(level)
}

function ensureOptions(q: InterviewQuestion): string[] {
  const o = q.options
  if (Array.isArray(o) && o.length >= 2) return o.map(String)
  if (typeof o === 'string') try { const arr = JSON.parse(o); return Array.isArray(arr) ? arr.map(String) : []; } catch { return [] }
  return []
}

type Tab = 'quiz' | 'coding' | 'system_design'

const SYSTEM_DESIGN_SCENARIOS: { key: string; title: string; scenario: string; referenceSolution: string }[] = [
  { key: 'realtime-editor', title: 'Real-time collaborative editor', scenario: 'Design a real-time collaborative text editor (like Google Docs) for the frontend. How would you handle conflicts?', referenceSolution: 'Use WebSockets for real-time sync. Consider Operational Transformation (OT) or CRDTs for conflict resolution. Optimistic UI updates with rollback on conflict. Offline support with queue and sync when back online.' },
  { key: 'feed-ranking', title: 'Social feed ranking', scenario: 'How would you design a feed ranking system that shows relevant content to users?', referenceSolution: 'Define signals: recency, engagement (likes, comments), user interests, diversity. Score = weighted sum. Use batch jobs for precomputation; cache hot results. A/B test ranking weights.' },
  { key: 'rate-limiter', title: 'API rate limiter', scenario: 'Design a distributed rate limiter for an API (e.g. per user, per IP).', referenceSolution: 'Sliding window or token bucket. Store counters in Redis with TTL. Key: user_id or IP. For distributed: use consistent hashing or a single Redis cluster. Return 429 and Retry-After header.' },
]

export function Interview() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const role = getStoredRole()
  const { loading, error, interviewQuestions, refresh } = useRoleData(role)
  const { challenges, attempts, loading: codingLoading } = useCodingChallenges(role)
  const [activeTab, setActiveTab] = useState<Tab>('quiz')
  const [sdScenarioKey, setSdScenarioKey] = useState<string | null>(null)
  const [sdResponse, setSdResponse] = useState('')
  const [sdSubmitted, setSdSubmitted] = useState(false)
  const [sdSaving, setSdSaving] = useState(false)

  const quizQuestions = interviewQuestions.filter(
    q => ensureOptions(q).length >= 2 && q.correct_answer != null && q.correct_answer !== ''
  )

  const [phase, setPhase] = useState<Phase>('overview')
  const [startTime, setStartTime] = useState<number>(0)
  const [answers, setAnswers] = useState<Record<string, { selected: string; timeSpentSeconds: number }>>({})
  const [currentIndex, setCurrentIndex] = useState(0)
  const [persisting, setPersisting] = useState(false)
  const questionStartRef = useRef<number>(Date.now())
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)
  const submittedRef = useRef(false)
  const [secondsLeft, setSecondsLeft] = useState(QUIZ_TIME_MINUTES * 60)

  const startQuiz = useCallback(() => {
    submittedRef.current = false
    setPhase('active')
    setStartTime(Date.now())
    setAnswers({})
    setCurrentIndex(0)
    setSecondsLeft(QUIZ_TIME_MINUTES * 60)
    questionStartRef.current = Date.now()
  }, [])

  const setAnswer = useCallback((questionId: string, option: string) => {
    const now = Date.now()
    const elapsed = Math.round((now - questionStartRef.current) / 1000)
    setAnswers(prev => ({
      ...prev,
      [questionId]: { selected: option, timeSpentSeconds: elapsed },
    }))
    questionStartRef.current = now
  }, [])

  useEffect(() => {
    if (phase !== 'active' || quizQuestions.length === 0) return
    questionStartRef.current = Date.now()
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
  }, [phase, quizQuestions.length])

  const submitQuiz = useCallback(async () => {
    if (phase !== 'active' || quizQuestions.length === 0) return
    setPhase('results')
    if (timerRef.current) {
      clearInterval(timerRef.current)
      timerRef.current = null
    }

    const userId = user?.id
    if (userId && supabase) {
      setPersisting(true)
      try {
        const rows = quizQuestions.map(q => {
          const a = answers[q.id]
          const selected = a?.selected ?? ''
          const correct = (q.correct_answer ?? '').trim() === selected.trim()
          return {
            user_id: userId,
            question_id: q.id,
            answer_selected: selected,
            is_correct: correct,
            time_spent_seconds: a?.timeSpentSeconds ?? 0,
          }
        })
        await supabase.from('user_interview_progress').upsert(rows, {
          onConflict: 'user_id,question_id',
        })
        await refresh()
      } catch (e) {
        console.warn('Failed to persist quiz results:', e)
      } finally {
        setPersisting(false)
      }
    }
  }, [phase, quizQuestions, answers, user?.id, refresh])

  useEffect(() => {
    if (phase === 'active' && secondsLeft <= 0 && !submittedRef.current) {
      submittedRef.current = true
      submitQuiz()
    }
  }, [phase, secondsLeft, submitQuiz])

  const correctCount = quizQuestions.filter(
    q => (answers[q.id]?.selected ?? '').trim() === (q.correct_answer ?? '').trim()
  ).length
  const totalCount = quizQuestions.length
  const scorePct = totalCount > 0 ? Math.round((correctCount / totalCount) * 100) : 0
  const timeTakenSeconds = phase !== 'overview' && startTime > 0 ? Math.round((Date.now() - startTime) / 1000) : 0

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
              Practice MCQ questions and coding challenges aligned to your role.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>

        {/* Tabs: Quiz | Coding */}
        <div
          className="interview-tabs"
          style={{ display: 'flex', gap: '0.25rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)' }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('quiz')}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'quiz' ? '2px solid var(--fg)' : '2px solid transparent',
              background: 'none',
              fontWeight: activeTab === 'quiz' ? 600 : 500,
              cursor: 'pointer',
              color: 'var(--fg)',
            }}
          >
            Quiz (MCQ)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('coding')}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'coding' ? '2px solid var(--fg)' : '2px solid transparent',
              background: 'none',
              fontWeight: activeTab === 'coding' ? 600 : 500,
              cursor: 'pointer',
              color: 'var(--fg)',
            }}
          >
            Coding Challenges
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('system_design')}
            style={{
              padding: '0.6rem 1.25rem',
              border: 'none',
              borderBottom: activeTab === 'system_design' ? '2px solid var(--fg)' : '2px solid transparent',
              background: 'none',
              fontWeight: activeTab === 'system_design' ? 600 : 500,
              cursor: 'pointer',
              color: 'var(--fg)',
            }}
          >
            System Design
          </button>
        </div>

        {/* System Design */}
        {activeTab === 'system_design' && (
          <div style={{ maxWidth: 720 }}>
            {!sdScenarioKey ? (
              <>
                <p style={{ color: 'var(--gray-dark)', marginBottom: '1rem' }}>Scenario-based system design questions. Pick one and write your approach.</p>
                <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                  {SYSTEM_DESIGN_SCENARIOS.map(s => (
                    <li key={s.key} style={{ marginBottom: '0.75rem' }}>
                      <button
                        type="button"
                        onClick={() => { setSdScenarioKey(s.key); setSdResponse(''); setSdSubmitted(false); }}
                        style={{
                          display: 'block',
                          width: '100%',
                          textAlign: 'left',
                          padding: '1rem 1.25rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          background: 'var(--bg)',
                          color: 'var(--fg)',
                          fontWeight: 600,
                          cursor: 'pointer',
                        }}
                      >
                        {s.title}
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            ) : (() => {
              const scenario = SYSTEM_DESIGN_SCENARIOS.find(s => s.key === sdScenarioKey)
              if (!scenario) return null
              if (sdSubmitted) {
                return (
                  <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '1.5rem' }}>
                    <h3 style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Reference solution</h3>
                    <p style={{ whiteSpace: 'pre-wrap', fontSize: '0.95rem', color: 'var(--gray-dark)', lineHeight: 1.6 }}>{scenario.referenceSolution}</p>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1.5rem', flexWrap: 'wrap' }}>
                      <button type="button" className="btn btn-outline" onClick={() => { setSdScenarioKey(null); setSdResponse(''); setSdSubmitted(false); }}>Back to list</button>
                      <button type="button" className="btn btn-outline" onClick={() => { setSdResponse(''); setSdSubmitted(false); }}>Try again</button>
                    </div>
                  </div>
                )
              }
              return (
                <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '1.5rem' }}>
                  <button type="button" className="btn btn-outline" style={{ marginBottom: '1rem', fontSize: '0.85rem' }} onClick={() => { setSdScenarioKey(null); setSdResponse(''); setSdSubmitted(false); }}>← Back to list</button>
                  <h3 style={{ fontSize: '1.1rem', marginBottom: '0.75rem' }}>{scenario.title}</h3>
                  <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', marginBottom: '1.25rem', lineHeight: 1.5 }}>{scenario.scenario}</p>
                  <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Your approach</label>
                  <textarea
                    value={sdResponse}
                    onChange={e => setSdResponse(e.target.value)}
                    placeholder="Describe your design: components, data flow, trade-offs..."
                    rows={8}
                    style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-sm)', border: '1px solid var(--border-color)', fontFamily: 'inherit', fontSize: '0.9rem', marginBottom: '1rem', resize: 'vertical' }}
                  />
                  <button
                    type="button"
                    className="btn btn-primary"
                    disabled={sdSaving}
                    onClick={async () => {
                      setSdSaving(true)
                      if (user?.id && supabase) {
                        try {
                          await supabase.from('system_design_attempts').insert({
                            user_id: user.id,
                            scenario_key: sdScenarioKey,
                            response_text: sdResponse,
                          })
                        } catch {
                          // table may not exist yet
                        }
                      }
                      setSdSaving(false)
                      setSdSubmitted(true)
                    }}
                  >
                    {sdSaving ? 'Saving...' : 'Submit & see solution'}
                  </button>
                </div>
              )
            })()}
          </div>
        )}

        {/* Coding Challenges list */}
        {activeTab === 'coding' && (
          <div style={{ maxWidth: 720 }}>
            {codingLoading ? (
              <p style={{ color: 'var(--gray-dark)' }}>Loading coding challenges...</p>
            ) : challenges.length === 0 ? (
              <p style={{ color: 'var(--gray-dark)' }}>No coding challenges for this role yet.</p>
            ) : (
              <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
                {challenges.map(c => {
                  const attempt = attempts[c.id]
                  return (
                    <li key={c.id} style={{ marginBottom: '0.75rem' }}>
                      <Link
                        to={`/interview/coding/${c.id}`}
                        style={{
                          display: 'block',
                          padding: '1rem 1.25rem',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          textDecoration: 'none',
                          color: 'var(--fg)',
                          background: 'var(--bg)',
                          transition: 'border-color 0.15s, background 0.15s',
                        }}
                      >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                          <span style={{ fontWeight: 600 }}>{c.title}</span>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                            <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.6rem', borderRadius: 20, border: '1px solid var(--gray-mid)', color: 'var(--gray-dark)' }}>{c.difficulty}</span>
                            {attempt && <span style={{ fontSize: '0.75rem', color: 'var(--gray-dark)' }}>{attempt.passed ? 'Solved' : 'Attempted'}</span>}
                          </div>
            </div>
                        {Array.isArray(c.company_tags) && c.company_tags.length > 0 && (
                          <div style={{ marginTop: '0.5rem', display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                            {c.company_tags.slice(0, 4).map((t, i) => (
                              <span key={i} style={{ fontSize: '0.7rem', padding: '0.15rem 0.5rem', borderRadius: 12, background: 'var(--gray-light)', color: 'var(--gray-dark)' }}>{t}</span>
                            ))}
            </div>
                        )}
                      </Link>
                    </li>
                  )
                })}
              </ul>
            )}
            </div>
        )}

        {/* Quiz content (Overview / Active / Results) */}
        {activeTab === 'quiz' && (
        <>
        {/* Overview */}
        {phase === 'overview' && (
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '2.5rem', maxWidth: 520 }}>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>Quiz Overview</h2>
            <p style={{ color: 'var(--gray-dark)', marginBottom: '1.5rem' }}>
              {quizQuestions.length} questions · ~{Math.ceil(quizQuestions.length * 1.5)} min · {QUIZ_TIME_MINUTES} min time limit
            </p>
            {quizQuestions.length === 0 ? (
              <p style={{ color: 'var(--gray-dark)' }}>No MCQ questions available for this role. Complete onboarding and ensure your role has questions with options.</p>
            ) : (
              <button className="btn btn-primary" style={{ width: '100%', padding: '0.9rem 1.5rem', fontSize: '1.05rem' }} onClick={startQuiz}>
                Start Quiz
              </button>
            )}
          </div>
        )}

        {/* Active Quiz */}
        {phase === 'active' && quizQuestions.length > 0 && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <span style={{ fontSize: '1rem', fontWeight: 600 }}>
                Time left: {Math.floor(secondsLeft / 60)}:{(secondsLeft % 60).toString().padStart(2, '0')}
              </span>
              <span style={{ fontSize: '0.9rem', color: 'var(--gray-dark)' }}>
                Question {currentIndex + 1} of {quizQuestions.length}
              </span>
        </div>

            <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '1.5rem 2rem', marginBottom: '1.5rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, padding: '0.2rem 0.6rem', borderRadius: 20, border: '1px solid var(--gray-mid)', color: 'var(--gray-dark)' }}>
                  {getDifficultyLabel(quizQuestions[currentIndex].difficulty_level)}
                </span>
                {quizQuestions[currentIndex].category && (
                  <span style={{ fontSize: '0.75rem', color: 'var(--gray-dark)' }}>{quizQuestions[currentIndex].category}</span>
                )}
              </div>
              <p style={{ fontWeight: 600, fontSize: '1.05rem', marginBottom: '1.25rem', lineHeight: 1.5 }}>
                {quizQuestions[currentIndex].question_text}
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                {ensureOptions(quizQuestions[currentIndex]).map((opt, i) => {
                  const q = quizQuestions[currentIndex]
                  const isSelected = (answers[q.id]?.selected ?? '') === opt
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setAnswer(q.id, opt)}
                      style={{
                        padding: '0.85rem 1rem',
                        textAlign: 'left',
                        border: `2px solid ${isSelected ? 'var(--fg)' : 'var(--border-color)'}`,
                        borderRadius: 'var(--radius-sm)',
                        background: isSelected ? 'var(--gray-light)' : 'transparent',
                        fontWeight: isSelected ? 600 : 500,
                        cursor: 'pointer',
                        transition: 'border-color 0.15s, background 0.15s',
                      }}
                    >
                      <span style={{ marginRight: '0.5rem', color: 'var(--gray-dark)' }}>{String.fromCharCode(65 + i)}.</span>
                      {opt}
                    </button>
                  )
                })}
              </div>
              {quizQuestions[currentIndex].hint && (
                <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', marginTop: '1rem', fontStyle: 'italic' }}>
                  Hint: {quizQuestions[currentIndex].hint}
                </p>
              )}
        </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentIndex(i => Math.max(0, i - 1))}
                  disabled={currentIndex === 0}
                >
                  Previous
                </button>
                <button
                  className="btn btn-outline"
                  onClick={() => setCurrentIndex(i => Math.min(quizQuestions.length - 1, i + 1))}
                  disabled={currentIndex === quizQuestions.length - 1}
                >
                  Next
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                {quizQuestions.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setCurrentIndex(i)}
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      border: i === currentIndex ? '2px solid var(--fg)' : '1px solid var(--gray-mid)',
                      background: answers[quizQuestions[i].id] ? 'var(--fg)' : 'transparent',
                      color: answers[quizQuestions[i].id] ? 'var(--bg)' : 'var(--fg)',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                    }}
                  >
                    {i + 1}
                  </button>
                ))}
                <button className="btn btn-primary" onClick={submitQuiz}>
                  Submit Quiz
                    </button>
                  </div>
                </div>
          </>
        )}

        {/* Results */}
        {phase === 'results' && (
          <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '2rem', maxWidth: 560 }}>
            <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>Quiz Results</h2>
            {persisting && <p style={{ color: 'var(--gray-dark)', marginBottom: '1rem' }}>Saving results...</p>}
            <p style={{ fontSize: '2.5rem', fontWeight: 700, marginBottom: '0.25rem' }}>{scorePct}%</p>
            <p style={{ color: 'var(--gray-dark)', marginBottom: '1.5rem' }}>
              {correctCount} correct out of {totalCount} · Time: {Math.floor(timeTakenSeconds / 60)}m {timeTakenSeconds % 60}s
            </p>
            <div style={{ marginBottom: '1.5rem' }}>
              {quizQuestions.map((q, i) => {
                const a = answers[q.id]?.selected ?? ''
                const correct = (q.correct_answer ?? '').trim() === a.trim()
                return (
                  <div key={q.id} style={{ padding: '0.75rem 0', borderBottom: i < quizQuestions.length - 1 ? '1px solid var(--gray-mid)' : 'none', display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                    <span style={{ width: 24, height: 24, borderRadius: '50%', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: correct ? 'var(--fg)' : 'var(--gray-mid)', color: correct ? 'var(--bg)' : 'var(--fg)', fontSize: '0.75rem', fontWeight: 700 }}>
                      {correct ? '✓' : '✗'}
                    </span>
                    <div>
                      <p style={{ fontSize: '0.9rem', fontWeight: 500, marginBottom: '0.25rem' }}>{q.question_text}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--gray-dark)' }}>
                        Your answer: {a || '—'} {correct ? '' : `· Correct: ${q.correct_answer ?? '—'}`}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
            <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
              <button className="btn btn-primary" onClick={startQuiz}>Try Again</button>
              <button className="btn btn-outline" onClick={() => setPhase('overview')}>Back to Overview</button>
              <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>Dashboard</button>
            </div>
          </div>
        )}
        </>
          )}
      </div>
    </div>
  )
}
