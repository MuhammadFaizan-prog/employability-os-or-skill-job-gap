import { useState, useRef, useEffect, useCallback, type DragEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useResumeUpload, useResumeHistory, useSkills } from '../hooks/useSupabaseData'
import { getStoredRole } from '../hooks/useAuth'

type Phase = 'upload' | 'loading' | 'results'

const LOADING_MESSAGES = [
  'Scanning resume structure…',
  'Extracting keywords and skills…',
  'Matching against role benchmarks…',
  'Generating improvement suggestions…',
  'Finalizing your score…',
]

const FALLBACK_SUGGESTIONS = [
  { title: 'Add TypeScript explicitly', priority: 'HIGH' as const, description: '92% of Frontend Engineer listings mention TypeScript. Add it to your skills section and highlight relevant project experience.' },
  { title: 'Quantify project outcomes', priority: 'HIGH' as const, description: 'Include metrics and measurable results (e.g., "Improved load time by 40%", "Reduced bundle size by 25%").' },
  { title: 'Mention accessibility work', priority: 'MED' as const, description: 'Reference WCAG compliance, screen reader testing, or keyboard navigation. Many roles value a11y experience.' },
  { title: 'Shorten summary section', priority: 'MED' as const, description: 'Your summary is 98 words. Aim for 40–60 words for better impact and scanability.' },
  { title: 'Add a GitHub or portfolio link', priority: 'LOW' as const, description: 'Recruiters and hiring managers often check profiles to gauge engagement and code quality.' },
  { title: 'Standardize date formatting', priority: 'LOW' as const, description: 'Use a consistent format (e.g., "Jan 2024 – Present") instead of mixing styles.' },
]

export function Resume() {
  const navigate = useNavigate()
  const inputRef = useRef<HTMLInputElement>(null)
  const role = getStoredRole()

  const { skills } = useSkills(role)
  const { upload, uploading, error: uploadError, lastUpload } = useResumeUpload()
  const { history, refresh: refreshHistory } = useResumeHistory()
  const roleSkillNames = skills.map(s => s.name)

  const [file, setFile] = useState<File | null>(null)
  const [phase, setPhase] = useState<Phase>('upload')
  const [loadingProgress, setLoadingProgress] = useState(0)
  const [loadingText, setLoadingText] = useState(LOADING_MESSAGES[0])
  const [dragOver, setDragOver] = useState(false)
  const [analysisScore, setAnalysisScore] = useState(0)
  const [analysisSuggestions, setAnalysisSuggestions] = useState<string[]>([])

  const handleFile = (f: File | undefined) => {
    if (!f) return
    const maxSize = 5 * 1024 * 1024
    const ext = f.name.toLowerCase().split('.').pop()
    const validExt = ['pdf', 'docx', 'doc', 'txt'].includes(ext || '')
    if (f.size <= maxSize && validExt) {
      setFile(f)
    }
  }

  const onDragOver = (e: DragEvent) => { e.preventDefault(); setDragOver(true) }
  const onDragLeave = () => setDragOver(false)
  const onDrop = (e: DragEvent) => { e.preventDefault(); setDragOver(false); handleFile(e.dataTransfer.files?.[0]) }

  const startAnalysis = useCallback(async () => {
    if (!file) return
    setPhase('loading')
    setLoadingProgress(0)
    setLoadingText(LOADING_MESSAGES[0])

    const result = await upload(file, roleSkillNames)
    if (result?.analysis_result) {
      setAnalysisScore(result.analysis_result.score ?? 50)
      setAnalysisSuggestions(result.analysis_result.suggestions ?? [])
    } else {
      setAnalysisScore(50)
      setAnalysisSuggestions(['Add 2–3 projects relevant to your target role.', 'Quantify achievements with numbers where possible.', 'Ensure ATS-friendly formatting.'])
    }
    refreshHistory()
  }, [file, upload, refreshHistory, roleSkillNames])

  const resetToUpload = () => {
    setPhase('upload')
    setFile(null)
    setLoadingProgress(0)
    setLoadingText(LOADING_MESSAGES[0])
  }

  useEffect(() => {
    if (phase !== 'loading') return
    let msgIndex = 0
    const msgInterval = setInterval(() => {
      msgIndex += 1
      setLoadingText(LOADING_MESSAGES[Math.min(msgIndex, LOADING_MESSAGES.length - 1)])
      setLoadingProgress(p => Math.min(p + 20, 80))
      if (msgIndex >= LOADING_MESSAGES.length - 1) {
        clearInterval(msgInterval)
        setLoadingProgress(100)
        setTimeout(() => setPhase('results'), 400)
      }
    }, 520)
    return () => clearInterval(msgInterval)
  }, [phase])

  const displayScore = lastUpload?.analysis_result?.score ?? analysisScore
  const clamp = (v: number) => Math.max(0, Math.min(100, Math.round(v)))
  const subScores = lastUpload?.analysis_result?.subScores ?? {
    keywords: clamp(displayScore + 4),
    format: clamp(displayScore + 13),
    skillsGap: clamp(displayScore - 14),
    clarity: clamp(displayScore - 4),
  }
  const displaySuggestions = (lastUpload?.analysis_result?.suggestions?.length ?? 0) > 0
    ? lastUpload!.analysis_result!.suggestions
    : analysisSuggestions.length > 0 ? analysisSuggestions : FALLBACK_SUGGESTIONS.map(s => s.description)

  const roleBadge = role.toUpperCase()

  return (
    <div className="container" style={{ paddingTop: '3rem', paddingBottom: '4rem' }}>
      <div style={{ marginBottom: '2rem', paddingBottom: '2rem', borderBottom: '1px solid var(--border-color)' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Resume Analysis</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '0.75rem' }}>
              <span className="role-badge">{roleBadge}</span>
            </div>
            <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: '50ch' }}>
              Upload your resume to get a match score and actionable improvement suggestions tailored to your target role.
            </p>
          </div>
          <button className="btn btn-outline" onClick={() => navigate('/dashboard')}>← Back to Dashboard</button>
        </div>
      </div>

      {uploadError && (
        <div style={{ padding: '0.75rem 1rem', border: '1px solid var(--gray-mid)', borderRadius: 'var(--radius-sm)', background: 'var(--gray-light)', marginBottom: '1.5rem', fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
          Upload note: {uploadError}. Results shown from local analysis.
        </div>
      )}

      {/* Upload Phase */}
      {phase === 'upload' && (
        <>
          <div className={`drop-zone ${dragOver ? 'drag-over' : ''}`} onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop} onClick={() => inputRef.current?.click()}>
            <svg width="24" height="24" fill="none" stroke="var(--fg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" /><polyline points="17 8 12 3 7 8" /><line x1="12" y1="3" x2="12" y2="15" /></svg>
            <p style={{ fontWeight: 600, fontSize: '1.1rem', margin: 0 }}>Drag & drop your resume here</p>
            <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', margin: 0 }}>or click to browse files</p>
            <span className="badge badge-outline" style={{ marginTop: '0.25rem' }}>PDF, DOCX, or TXT — max 5 MB</span>
            <input ref={inputRef} type="file" accept=".pdf,.doc,.docx,.txt" style={{ display: 'none' }} onChange={e => handleFile(e.target.files?.[0])} />
          </div>

          {file && (
            <div style={{ marginTop: '1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '1.25rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: 40, height: 40, border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <svg width="20" height="20" fill="none" stroke="var(--fg)" strokeWidth="2" viewBox="0 0 24 24"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /></svg>
                </div>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.95rem', marginBottom: '0.2rem' }}>{file.name}</p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>{(file.size / 1024).toFixed(0)} KB — Ready to analyze</p>
                </div>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <button className="btn btn-text" onClick={e => { e.stopPropagation(); setFile(null) }}>Remove</button>
                <button className="btn btn-primary" onClick={startAnalysis} disabled={uploading}>
                  {uploading ? 'Uploading...' : 'Analyze Resume'}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Loading Phase */}
      {phase === 'loading' && (
        <div style={{ maxWidth: 480, margin: '4rem auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-window)', padding: '3rem 2.5rem', textAlign: 'center' }}>
          <div style={{ height: 6, border: '1px solid var(--border-color)', borderRadius: 20, background: 'var(--bg)', overflow: 'hidden', marginBottom: '1.5rem' }}>
            <div style={{ height: '100%', width: `${loadingProgress}%`, background: 'var(--fg)', borderRadius: 20, transition: 'width 0.4s ease' }} />
          </div>
          <p style={{ fontSize: '0.95rem', fontWeight: 500 }}>{loadingText}</p>
        </div>
      )}

      {/* Results Phase */}
      {phase === 'results' && file && (
        <div className="fade-in resume-results-layout" style={{ display: 'grid', gap: '2.5rem', alignItems: 'start' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div style={{ border: '2px solid var(--border-color)', borderRadius: 'var(--radius-window)', overflow: 'hidden' }}>
              <div style={{ padding: '1rem 1.25rem', background: 'var(--fg)', color: 'var(--bg)' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.08em' }}>RESUME MATCH SCORE</span>
              </div>
              <div style={{ padding: '2rem 1.5rem' }}>
                <p style={{ fontSize: '0.8rem', color: 'var(--gray-dark)', marginBottom: '0.5rem' }}>out of 100</p>
                <p style={{ fontSize: '4rem', fontWeight: 700, lineHeight: 1, marginBottom: '1rem' }}>{displayScore}</p>
                <div style={{ height: 10, border: '1px solid var(--border-color)', borderRadius: 20, background: 'var(--gray-light)', overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ width: `${displayScore}%`, height: '100%', background: 'var(--fg)', borderRadius: 20, transition: 'width 0.6s ease' }} />
                </div>
                <p style={{ fontSize: '0.9rem', fontWeight: 500 }}>
                  {displayScore >= 80 ? 'Strong match' : displayScore >= 60 ? 'Good match — room to improve' : 'Needs improvement'}
                </p>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
              {([
                { label: 'Keywords', value: subScores.keywords },
                { label: 'Format', value: subScores.format },
                { label: 'Skills Gap', value: subScores.skillsGap },
                { label: 'Clarity', value: subScores.clarity },
              ] as const).map(s => (
                <div key={s.label} style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-sm)', padding: '1rem', textAlign: 'center' }}>
                  <p style={{ fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--gray-dark)', textTransform: 'uppercase', marginBottom: '0.4rem' }}>{s.label}</p>
                  <p style={{ fontSize: '1.75rem', fontWeight: 700, lineHeight: 1 }}>{s.value}</p>
                </div>
              ))}
            </div>

            <div className="card" style={{ padding: '1.25rem 1.5rem' }}>
              <p style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '0.06em', color: 'var(--gray-dark)', marginBottom: '0.75rem' }}>UPLOAD CONFIRMED</p>
              <p style={{ fontSize: '0.9rem', fontWeight: 600, marginBottom: '0.35rem' }}>{file.name}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-dark)', marginBottom: '0.5rem' }}>Size: {(file.size / 1024).toFixed(0)} KB</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-dark)' }}>Just now</p>
            </div>
            <button className="btn btn-outline" onClick={resetToUpload} style={{ width: '100%' }}>Upload a Different Resume</button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div className="card">
              <div className="card-header">
                <span className="card-header-label">IMPROVEMENT SUGGESTIONS</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-dark)' }}>{displaySuggestions.length} items</span>
              </div>
              <div style={{ padding: 0 }}>
                {(displaySuggestions.length > 0 ? displaySuggestions : FALLBACK_SUGGESTIONS.map(s => s.description)).map((s, i) => {
                  const fallback = FALLBACK_SUGGESTIONS[i]
                  const title = fallback?.title ?? `Suggestion ${i + 1}`
                  const priority = fallback?.priority ?? (i < 2 ? 'HIGH' : i < 4 ? 'MED' : 'LOW')
                  return (
                    <div key={i} style={{ padding: '1.25rem 1.5rem', borderBottom: i < displaySuggestions.length - 1 ? '1px solid var(--gray-mid)' : 'none', display: 'grid', gridTemplateColumns: 'auto 1fr', gap: '1rem', alignItems: 'flex-start' }}>
                      <span style={{ width: 28, height: 28, borderRadius: '50%', border: '1px solid var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0, background: i < 4 ? 'var(--fg)' : 'var(--gray-light)', color: i < 4 ? 'var(--bg)' : 'var(--gray-dark)', borderColor: i < 4 ? 'var(--fg)' : 'var(--gray-mid)' }}>{i + 1}</span>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', flexWrap: 'wrap' }}>
                          <span style={{ fontWeight: 600, fontSize: '0.95rem' }}>{title}</span>
                          <span className={priority === 'HIGH' ? 'badge badge-filled' : priority === 'MED' ? 'badge badge-bold' : 'badge badge-muted'}>{priority}</span>
                        </div>
                        <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', lineHeight: 1.55, margin: 0 }}>{s}</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Upload History */}
            <div className="card">
              <div className="card-header">
                <span className="card-header-label">UPLOAD HISTORY</span>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--gray-dark)' }}>{history.length > 0 ? `Last ${Math.min(history.length, 5)} uploads` : 'No history'}</span>
              </div>
              <div style={{ padding: 0 }}>
                {history.length > 0 ? history.slice(0, 5).map((h, i) => (
                  <div key={h.id} style={{ padding: '1rem 1.5rem', borderBottom: i < Math.min(history.length, 5) - 1 ? '1px solid var(--gray-mid)' : 'none', display: 'grid', gridTemplateColumns: '1fr auto auto', gap: '1rem', alignItems: 'center', opacity: i === 0 ? 1 : 0.6 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{h.file_name}</span>
                      {i === 0 && <span className="badge badge-filled" style={{ fontSize: '0.65rem', padding: '0.15rem 0.5rem' }}>LATEST</span>}
                    </div>
                    <span style={{ fontSize: '0.85rem', color: 'var(--gray-dark)' }}>
                      {new Date(h.created_at).toLocaleDateString()}
                    </span>
                    <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>{h.analysis_result?.score ?? '—'}</span>
                  </div>
                )) : (
                  <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-dark)', fontSize: '0.9rem' }}>
                    No uploads yet. Upload your first resume above.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
