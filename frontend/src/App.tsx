import { useState, useEffect } from 'react'
import { supabase } from './lib/supabase'
import { calculateScore, type ScoreBreakdown } from './lib/score'
import { SCORE_WEIGHTS } from './constants/scoreWeights'
import './App.css'

interface Step1Status {
  success: boolean
  message: string
  skillsCount?: number | null
  error?: string
}

interface Step2Status {
  success: boolean
  message: string
  skillsByRole?: Record<string, number>
  projectsByRole?: Record<string, number>
  error?: string
}

interface Step3Status {
  success: boolean
  message: string
  breakdown?: ScoreBreakdown
  error?: string
}

export default function App() {
  const [status, setStatus] = useState<Step1Status | null>(null)
  const [step2Status, setStep2Status] = useState<Step2Status | null>(null)
  const [step3Status, setStep3Status] = useState<Step3Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep2, setLoadingStep2] = useState(false)
  const [loadingStep3, setLoadingStep3] = useState(false)
  const [consoleErrors, setConsoleErrors] = useState<string[]>([])
  const [consoleWarnings, setConsoleWarnings] = useState<string[]>([])

  useEffect(() => {
    const read = () => {
      setConsoleErrors([...(window.__step1ConsoleErrors ?? [])])
      setConsoleWarnings([...(window.__step1ConsoleWarnings ?? [])])
    }
    read()
    const t = setInterval(read, 500)
    return () => clearInterval(t)
  }, [])
  useEffect(() => {
    if (status != null) {
      setConsoleErrors([...(window.__step1ConsoleErrors ?? [])])
      setConsoleWarnings([...(window.__step1ConsoleWarnings ?? [])])
    }
  }, [status])

  async function handleVerifyStep1() {
    setLoading(true)
    setStatus(null)
    try {
      if (!supabase) {
        setStatus({
          success: false,
          message: 'Supabase client not configured.',
          error: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env (see .env.example)',
        })
        return
      }
      const { count: skillsCount, error } = await supabase.from('skills').select('*', { count: 'exact', head: true })
      if (error) {
        setStatus({
          success: false,
          message: 'Supabase request failed.',
          error: error.message,
        })
        return
      }
      setStatus({
        success: true,
        message: 'Step 1 verified: types and Supabase (skilljob) are connected.',
        skillsCount: skillsCount ?? null,
      })
    } catch (e) {
      setStatus({
        success: false,
        message: 'Unexpected error.',
        error: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setLoading(false)
    }
  }

  async function handleVerifyStep2() {
    setLoadingStep2(true)
    setStep2Status(null)
    try {
      if (!supabase) {
        setStep2Status({
          success: false,
          message: 'Supabase client not configured.',
          error: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env',
        })
        return
      }
      const roles = ['Frontend Developer', 'Backend Developer', 'Data Analyst']
      const skillsByRole: Record<string, number> = {}
      const projectsByRole: Record<string, number> = {}
      for (const role of roles) {
        const { count: sc, error: se } = await supabase
          .from('skills')
          .select('*', { count: 'exact', head: true })
          .eq('role', role)
        if (se) throw new Error(`Skills: ${se.message}`)
        skillsByRole[role] = sc ?? 0
        const { count: pc, error: pe } = await supabase
          .from('projects')
          .select('*', { count: 'exact', head: true })
          .eq('role', role)
        if (pe) throw new Error(`Projects: ${pe.message}`)
        projectsByRole[role] = pc ?? 0
      }
      const totalSkills = Object.values(skillsByRole).reduce((a, b) => a + b, 0)
      const totalProjects = Object.values(projectsByRole).reduce((a, b) => a + b, 0)
      setStep2Status({
        success: true,
        message: `Step 2 verified: competency data in Supabase (${totalSkills} skills, ${totalProjects} projects).`,
        skillsByRole,
        projectsByRole,
      })
    } catch (e) {
      setStep2Status({
        success: false,
        message: 'Step 2 verification failed.',
        error: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setLoadingStep2(false)
    }
  }

  async function handleVerifyStep3() {
    setLoadingStep3(true)
    setStep3Status(null)
    try {
      if (!supabase) {
        setStep3Status({
          success: false,
          message: 'Supabase client not configured.',
          error: 'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env',
        })
        return
      }
      const { data: skills, error: skillsError } = await supabase
        .from('skills')
        .select('id, weight, difficulty')
        .eq('role', 'Frontend Developer')
        .limit(3)
      if (skillsError) throw new Error(`Skills: ${skillsError.message}`)
      const userSkills = (skills ?? []).map((s) => ({
        proficiency: 3 as number,
        skill: { weight: Number(s.weight) || 1 },
      }))
      const { data: projects } = await supabase
        .from('projects')
        .select('id, difficulty')
        .eq('role', 'Frontend Developer')
        .limit(2)
      const userProjects = (projects ?? []).map((p, i) => ({
        completed: i === 0,
        project: { difficulty: Number(p.difficulty) || 1 },
      }))
      const breakdown = calculateScore(userSkills, userProjects, 0, 0, 0)
      setStep3Status({
        success: true,
        message: `Step 3 verified: Employability Score engine (final ${breakdown.final_score}).`,
        breakdown,
      })
    } catch (e) {
      setStep3Status({
        success: false,
        message: 'Step 3 verification failed.',
        error: e instanceof Error ? e.message : String(e),
      })
    } finally {
      setLoadingStep3(false)
    }
  }

  const anyLoading = loading || loadingStep2 || loadingStep3

  return (
    <div className="app">
      <header className="header">
        <h1>EmployabilityOS</h1>
        <p className="tagline">Step 1, 2 & 3 — Project, types, competency data, score engine (Supabase: skilljob)</p>
      </header>

      <section className="weights">
        <h2>Score weights</h2>
        <ul>
          {Object.entries(SCORE_WEIGHTS).map(([key, value]) => (
            <li key={key}>
              <span className="key">{key}</span>
              <span className="value">{(value * 100).toFixed(0)}%</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="verify">
        <button
          type="button"
          className="btn-verify"
          onClick={handleVerifyStep1}
          disabled={anyLoading}
          data-testid="verify-step1"
          aria-label="Verify Step 1 Supabase connection"
        >
          {loading ? 'Verifying…' : 'Verify Step 1 (Supabase)'}
        </button>
        <button
          type="button"
          className="btn-verify"
          onClick={handleVerifyStep2}
          disabled={anyLoading}
          data-testid="verify-step2"
          aria-label="Verify Step 2 competency data in Supabase"
        >
          {loadingStep2 ? 'Verifying…' : 'Verify Step 2 (competency data)'}
        </button>
        <button
          type="button"
          className="btn-verify"
          onClick={handleVerifyStep3}
          disabled={anyLoading}
          data-testid="verify-step3"
          aria-label="Verify Step 3 Employability Score engine"
        >
          {loadingStep3 ? 'Verifying…' : 'Verify Step 3 (score engine)'}
        </button>
        {status && (
          <div className={`status ${status.success ? 'success' : 'error'}`}>
            <p>{status.message}</p>
            {status.skillsCount != null && (
              <p className="detail">Skills rows (verified): {status.skillsCount}</p>
            )}
            {status.error && (
              <p className="error-detail">{status.error}</p>
            )}
          </div>
        )}
        {step2Status && (
          <div className={`status ${step2Status.success ? 'success' : 'error'}`}>
            <p>{step2Status.message}</p>
            {step2Status.skillsByRole && (
              <p className="detail">
                Skills by role: {Object.entries(step2Status.skillsByRole).map(([r, n]) => `${r}: ${n}`).join(', ')}
              </p>
            )}
            {step2Status.projectsByRole && (
              <p className="detail">
                Projects by role: {Object.entries(step2Status.projectsByRole).map(([r, n]) => `${r}: ${n}`).join(', ')}
              </p>
            )}
            {step2Status.error && (
              <p className="error-detail">{step2Status.error}</p>
            )}
          </div>
        )}
        {step3Status && (
          <div className={`status ${step3Status.success ? 'success' : 'error'}`}>
            <p>{step3Status.message}</p>
            {step3Status.breakdown && (
              <div className="detail">
                <p>Technical: {step3Status.breakdown.technical} · Projects: {step3Status.breakdown.projects} · Resume: {step3Status.breakdown.resume} · Practical: {step3Status.breakdown.practical} · Interview: {step3Status.breakdown.interview}</p>
                <p><strong>Final score: {step3Status.breakdown.final_score}</strong></p>
              </div>
            )}
            {step3Status.error && (
              <p className="error-detail">{step3Status.error}</p>
            )}
          </div>
        )}
      </section>

      <section className="console-status" aria-live="polite">
        <h2>Console (verification)</h2>
        {consoleErrors.length === 0 && consoleWarnings.length === 0 && (
          <p className="console-ok">No console errors or warnings.</p>
        )}
        {consoleErrors.length > 0 && (
          <div className="console-errors">
            <p><strong>{consoleErrors.length} error(s)</strong> (showing first 10):</p>
            <ul>{consoleErrors.slice(0, 10).map((msg, i) => <li key={i}>{msg}</li>)}</ul>
          </div>
        )}
        {consoleWarnings.length > 0 && (
          <div className="console-warnings">
            <p><strong>{consoleWarnings.length} warning(s)</strong> (showing first 5):</p>
            <ul>{consoleWarnings.slice(0, 5).map((msg, i) => <li key={i}>{msg}</li>)}</ul>
          </div>
        )}
      </section>

      <footer className="footer">
        <p>Backend types and schema live in Supabase project <strong>skilljob</strong>. UI later.</p>
      </footer>
    </div>
  )
}
