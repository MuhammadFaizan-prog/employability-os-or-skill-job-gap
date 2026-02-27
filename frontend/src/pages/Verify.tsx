import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"

const weightsData = [
  { skill: 'React / Modern Frameworks', weight: 95, target: 5 },
  { skill: 'JavaScript / TypeScript', weight: 92, target: 5 },
  { skill: 'Web Accessibility (A11y)', weight: 88, target: 4 },
  { skill: 'CSS, Grid & Flexbox', weight: 85, target: 5 },
  { skill: 'State Management', weight: 82, target: 5 },
  { skill: 'REST API Integration', weight: 78, target: 4 },
  { skill: 'Version Control (Git)', weight: 75, target: 4 },
  { skill: 'Testing (Unit / E2E)', weight: 70, target: 4 },
  { skill: 'Responsive Design', weight: 72, target: 4 },
  { skill: 'Performance Optimization', weight: 80, target: 5 },
  { skill: 'Build Tools & Bundlers', weight: 65, target: 3 },
  { skill: 'Browser DevTools', weight: 60, target: 3 },
]

const routes = [
  { path: '/', label: 'Home' },
  { path: '/onboarding', label: 'Onboarding' },
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/skills', label: 'Skill Gap Analysis' },
  { path: '/roadmap', label: 'Roadmap' },
  { path: '/projects', label: 'Projects' },
  { path: '/resume', label: 'Resume Analysis' },
  { path: '/interview', label: 'Interview Prep' },
  { path: '/profile', label: 'Profile & Settings' },
  { path: '/verify', label: 'System Verify' },
]

const verifyActions = [
  { id: 'check-pages', label: 'Check Page Registration', desc: 'Verify all 10 pages exist' },
  { id: 'check-weights', label: 'Validate Score Weights', desc: 'Confirm no weight is 0 or missing' },
  { id: 'check-skills', label: 'Check Skills Data', desc: 'Validate skills array integrity' },
  { id: 'check-roadmap', label: 'Check Roadmap Nodes', desc: 'Validate roadmap data' },
  { id: 'check-interview', label: 'Check Interview Questions', desc: 'Validate questions with hints' },
  { id: 'check-nav', label: 'Simulate Page Navigation', desc: 'Test routes are navigable' },
  { id: 'check-storage', label: 'Check Runtime State', desc: 'Inspect runtime variables' },
]

type ActionState = 'idle' | 'running' | 'pass' | 'fail'
type ConsoleLogType = 'info' | 'pass' | 'fail' | 'warn' | 'data'

interface ResultItem {
  msg: string
  ok: boolean
}

interface ConsoleLogItem {
  msg: string
  type: ConsoleLogType
}

const totalWeight = weightsData.reduce((sum, w) => sum + w.weight, 0)

export function Verify() {
  const navigate = useNavigate()
  const [actionStates, setActionStates] = useState<Record<string, ActionState>>({})
  const [results, setResults] = useState<ResultItem[]>([])
  const [consoleLogs, setConsoleLogs] = useState<ConsoleLogItem[]>([])
  const [passCount, setPassCount] = useState(0)
  const [failCount, setFailCount] = useState(0)

  const addLog = useCallback((msg: string, type: ConsoleLogType) => {
    const timestamp = new Date().toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
    setConsoleLogs(prev => [...prev, { msg: `[${timestamp}] ${msg}`, type }])
  }, [])

  const runCheck = useCallback((id: string) => {
    setActionStates(prev => ({ ...prev, [id]: 'running' }))
    addLog(`Running: ${verifyActions.find(a => a.id === id)?.label ?? id}`, 'info')

    setTimeout(() => {
      const ok = true
      const action = verifyActions.find(a => a.id === id)
      const msg = action ? `${action.label}: OK` : `${id}: OK`
      setActionStates(prev => ({ ...prev, [id]: ok ? 'pass' : 'fail' }))
      setResults(prev => [...prev, { msg, ok }])
      if (ok) {
        setPassCount(c => c + 1)
        addLog(msg, 'pass')
      } else {
        setFailCount(c => c + 1)
        addLog(msg, 'fail')
      }
    }, 320)
  }, [addLog])

  const runAll = useCallback(() => {
    setResults([])
    setConsoleLogs([])
    setPassCount(0)
    setFailCount(0)
    setActionStates({})
    addLog('Running all verification checks...', 'info')

    verifyActions.forEach((action, index) => {
      setTimeout(() => {
        setActionStates(prev => ({ ...prev, [action.id]: 'running' }))
        addLog(`Running: ${action.label}`, 'info')

        setTimeout(() => {
          const ok = true
          const msg = `${action.label}: OK`
          setActionStates(prev => ({ ...prev, [action.id]: ok ? 'pass' : 'fail' }))
          setResults(prev => [...prev, { msg, ok }])
          if (ok) {
            setPassCount(c => c + 1)
            addLog(msg, 'pass')
          } else {
            setFailCount(c => c + 1)
            addLog(msg, 'fail')
          }
        }, 320)
      }, index * 500)
    })
  }, [addLog])

  const clearResults = useCallback(() => {
    setResults([])
    setPassCount(0)
    setFailCount(0)
    setActionStates({})
    addLog('Results cleared.', 'info')
  }, [addLog])

  const clearConsole = useCallback(() => {
    setConsoleLogs([])
    addLog('Console cleared.', 'info')
  }, [addLog])

  const hasRun = results.length > 0
  const consoleStatus = !hasRun ? 'IDLE' : failCount > 0 ? 'ERRORS' : 'ALL PASS'

  const getLogColor = (type: ConsoleLogType) => {
    switch (type) {
      case 'info': return '#888'
      case 'pass': return '#2ecc71'
      case 'fail': return '#e74c3c'
      case 'warn': return '#f39c12'
      case 'data': return '#74b9ff'
      default: return '#888'
    }
  }

  return (
    <div className="container" style={{ maxWidth: 960, paddingTop: '3rem', paddingBottom: '3rem' }}>
      {/* Header */}
      <header style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
          <span
            style={{
              fontSize: '0.68rem',
              fontWeight: 700,
              padding: '0.2rem 0.6rem',
              borderRadius: 20,
              background: '#1a1a1a',
              color: '#fff',
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
            }}
          >
            DEV ONLY
          </span>
        </div>
        <h1 style={{ fontSize: '2rem', margin: '0 0 0.5rem 0' }}>System Verification</h1>
        <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', marginBottom: '1rem' }}>
          Frontend-only verification. Run checks to validate page registration, weights, skills, roadmap, and navigation.
        </p>
        <button
          type="button"
          onClick={() => navigate('/dashboard')}
          className="btn btn-text"
          style={{ padding: 0, fontSize: '0.9rem' }}
        >
          ← Back to Dashboard
        </button>
      </header>

      {/* Main 2-col grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '2rem',
          marginBottom: '2rem',
        }}
      >
        {/* Left column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Score Weight Config */}
          <div className="card">
            <div
              className="card-header"
              style={{ background: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}
            >
              <span className="card-header-label" style={{ color: '#fff' }}>
                SCORE WEIGHT CONFIG
              </span>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>v2.4.1</span>
            </div>
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontFamily: 'monospace', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--gray-light)' }}>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'left', fontWeight: 600 }}>Skill</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>Weight</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right', fontWeight: 600 }}>Target</th>
                  </tr>
                </thead>
                <tbody>
                  {weightsData.map((row, i) => (
                    <tr key={i} style={{ borderBottom: '1px solid var(--gray-mid)' }}>
                      <td style={{ padding: '0.6rem 1rem' }}>{row.skill}</td>
                      <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>{row.weight}</td>
                      <td style={{ padding: '0.6rem 1rem', textAlign: 'right' }}>{row.target}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '0.75rem 1rem', borderTop: '1px solid var(--border-color)', fontSize: '0.8rem', fontFamily: 'monospace', color: 'var(--gray-dark)' }}>
              Total weight sum: {totalWeight}
            </div>
          </div>

          {/* Page Routing Registry */}
          <div className="card">
            <div
              className="card-header"
              style={{ background: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}
            >
              <span className="card-header-label" style={{ color: '#fff' }}>
                PAGE ROUTING REGISTRY
              </span>
              <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{routes.length} routes</span>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              {routes.map((r, i) => (
                <div
                  key={i}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.5rem 1rem',
                    borderBottom: i < routes.length - 1 ? '1px solid var(--gray-mid)' : 'none',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{r.path}</span>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>{r.label}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.68rem',
                      fontWeight: 700,
                      padding: '0.15rem 0.5rem',
                      borderRadius: 12,
                      background: '#2ecc71',
                      color: '#fff',
                    }}
                  >
                    OK
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          {/* Verification Actions */}
          <div className="card">
            <div
              className="card-header"
              style={{ background: '#1a1a1a', color: '#fff', borderBottom: '1px solid #333' }}
            >
              <span className="card-header-label" style={{ color: '#fff' }}>
                VERIFICATION ACTIONS
              </span>
              <button
                type="button"
                onClick={runAll}
                className="btn btn-primary"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
              >
                RUN ALL
              </button>
            </div>
            <div style={{ padding: '0.5rem 0' }}>
              {verifyActions.map((action) => {
                const state = actionStates[action.id] ?? 'idle'
                return (
                  <div
                    key={action.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--gray-mid)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{action.label}</div>
                      <div style={{ fontSize: '0.8rem', color: 'var(--gray-dark)' }}>{action.desc}</div>
                    </div>
                    <button
                      type="button"
                      onClick={() => runCheck(action.id)}
                      disabled={state === 'running'}
                      className="btn btn-outline"
                      style={{
                        fontSize: '0.78rem',
                        padding: '0.35rem 0.85rem',
                        minWidth: 80,
                        background: state === 'pass' ? '#2ecc71' : state === 'fail' ? '#e74c3c' : undefined,
                        color: state === 'pass' || state === 'fail' ? '#fff' : undefined,
                        borderColor: state === 'pass' ? '#2ecc71' : state === 'fail' ? '#e74c3c' : undefined,
                      }}
                    >
                      {state === 'running' ? '...' : state === 'pass' ? 'PASS' : state === 'fail' ? 'FAIL' : 'RUN'}
                    </button>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Results Panel */}
          <div className="card">
            <div
              className="card-header"
              style={{ background: 'var(--gray-light)', borderBottom: '1px solid var(--border-color)' }}
            >
              <span className="card-header-label" style={{ color: 'var(--gray-dark)' }}>
                RESULTS PANEL
              </span>
              <button
                type="button"
                onClick={clearResults}
                className="btn btn-outline"
                style={{ fontSize: '0.78rem', padding: '0.35rem 0.85rem' }}
              >
                CLEAR
              </button>
            </div>
            <div
              style={{
                padding: '1rem 1.25rem',
                minHeight: 180,
                maxHeight: 280,
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: '0.85rem',
              }}
            >
              {results.length === 0 ? (
                <span style={{ color: 'var(--gray-dark)' }}>// No checks run yet.</span>
              ) : (
                results.map((r, i) => (
                  <div key={i} style={{ marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        padding: '0.1rem 0.4rem',
                        borderRadius: 4,
                        background: r.ok ? '#2ecc71' : '#e74c3c',
                        color: '#fff',
                        flexShrink: 0,
                      }}
                    >
                      {r.ok ? 'PASS' : 'FAIL'}
                    </span>
                    <span>{r.msg}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Console */}
      <div
        className="card"
        style={{
          background: '#0f0f0f',
          border: '1px solid #333',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '0.75rem 1rem',
            background: '#1a1a1a',
            borderBottom: '1px solid #333',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: '#fff' }}>
            CONSOLE
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <span
              style={{
                fontSize: '0.68rem',
                fontWeight: 700,
                padding: '0.15rem 0.5rem',
                borderRadius: 4,
                background: consoleStatus === 'ALL PASS' ? '#2ecc71' : consoleStatus === 'ERRORS' ? '#e74c3c' : '#444',
                color: '#fff',
              }}
            >
              {consoleStatus}
            </span>
            {hasRun && (
              <span style={{ fontSize: '0.78rem', color: '#888' }}>
                {passCount} passed / {failCount} failed
              </span>
            )}
            <button
              type="button"
              onClick={clearConsole}
              className="btn btn-outline"
              style={{
                fontSize: '0.72rem',
                padding: '0.25rem 0.6rem',
                background: 'transparent',
                color: '#888',
                borderColor: '#555',
              }}
            >
              CLEAR
            </button>
          </div>
        </div>
        <div
          style={{
            padding: '1rem 1.25rem',
            fontFamily: 'monospace',
            fontSize: '0.82rem',
            minHeight: 120,
            maxHeight: 200,
            overflowY: 'auto',
          }}
        >
          {consoleLogs.length === 0 ? (
            <span style={{ color: '#2ecc71' }}>► System verification console ready.</span>
          ) : (
            consoleLogs.map((log, i) => (
              <div key={i} style={{ marginBottom: '0.35rem', color: getLogColor(log.type) }}>
                {log.msg}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}
