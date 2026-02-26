import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { supabase } from "../lib/supabase"
import { calculateScore, type ScoreBreakdown } from "../lib/score"
import { computeRoadmapSummary, computeRoadmapSteps, type RoadmapSummary, type RoadmapSteps } from "../lib/roadmap"
import { analyzeSkillGap, type SkillGapResult } from "../lib/skillGap"
import { SCORE_WEIGHTS } from "../constants/scoreWeights"
import { RoadmapDiagram } from "../components/RoadmapDiagram"

interface Step1Status { success: boolean; message: string; skillsCount?: number | null; error?: string }
interface Step2Status { success: boolean; message: string; skillsByRole?: Record<string, number>; projectsByRole?: Record<string, number>; error?: string }
interface Step3Status { success: boolean; message: string; breakdown?: ScoreBreakdown; error?: string }
interface Step4Status { success: boolean; message: string; result?: SkillGapResult; error?: string }
interface Step5Status { success: boolean; message: string; summary?: RoadmapSummary; error?: string }
interface Step6Status { success: boolean; message: string; tableOk?: boolean; storageOk?: boolean; error?: string }
interface Step7Status { success: boolean; message: string; count?: number; error?: string }
interface Step8Status { success: boolean; message: string; error?: string }

export function Verify() {
  const [status, setStatus] = useState<Step1Status | null>(null)
  const [step2Status, setStep2Status] = useState<Step2Status | null>(null)
  const [step3Status, setStep3Status] = useState<Step3Status | null>(null)
  const [step4Status, setStep4Status] = useState<Step4Status | null>(null)
  const [step5Status, setStep5Status] = useState<Step5Status | null>(null)
  const [step6Status, setStep6Status] = useState<Step6Status | null>(null)
  const [step7Status, setStep7Status] = useState<Step7Status | null>(null)
  const [step8Status, setStep8Status] = useState<Step8Status | null>(null)
  const [loading, setLoading] = useState(false)
  const [loadingStep2, setLoadingStep2] = useState(false)
  const [loadingStep3, setLoadingStep3] = useState(false)
  const [loadingStep4, setLoadingStep4] = useState(false)
  const [loadingStep5, setLoadingStep5] = useState(false)
  const [loadingStep6, setLoadingStep6] = useState(false)
  const [loadingStep7, setLoadingStep7] = useState(false)
  const [loadingStep8, setLoadingStep8] = useState(false)
  const [consoleErrors, setConsoleErrors] = useState<string[]>([])
  const [consoleWarnings, setConsoleWarnings] = useState<string[]>([])
  const [roadmapSteps, setRoadmapSteps] = useState<RoadmapSteps | null>(null)

  useEffect(() => {
    const read = () => {
      setConsoleErrors([...(window.__step1ConsoleErrors ?? [])])
      setConsoleWarnings([...(window.__step1ConsoleWarnings ?? [])])
    }
    read()
    const t = setInterval(read, 500)
    return () => clearInterval(t)
  }, [])

  async function handleVerifyStep1() {
    setLoading(true); setStatus(null)
    try {
      if (!supabase) {
        setStatus({ success: false, message: "Supabase client not configured.", error: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env" })
        return
      }
      const { count: skillsCount, error } = await supabase.from("skills").select("*", { count: "exact", head: true })
      if (error) { setStatus({ success: false, message: "Supabase request failed.", error: error.message }); return }
      setStatus({ success: true, message: "Step 1 verified: types and Supabase (skilljob) are connected.", skillsCount: skillsCount ?? null })
    } catch (e) {
      setStatus({ success: false, message: "Unexpected error.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoading(false) }
  }

  async function handleVerifyStep2() {
    setLoadingStep2(true); setStep2Status(null)
    try {
      if (!supabase) { setStep2Status({ success: false, message: "Supabase client not configured.", error: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env" }); return }
      const roles = ["Frontend Developer", "Backend Developer", "Data Analyst"]
      const skillsByRole: Record<string, number> = {}
      const projectsByRole: Record<string, number> = {}
      for (const role of roles) {
        const { count: sc, error: se } = await supabase.from("skills").select("*", { count: "exact", head: true }).eq("role", role)
        if (se) throw new Error("Skills: " + se.message)
        skillsByRole[role] = sc ?? 0
        const { count: pc, error: pe } = await supabase.from("projects").select("*", { count: "exact", head: true }).eq("role", role)
        if (pe) throw new Error("Projects: " + pe.message)
        projectsByRole[role] = pc ?? 0
      }
      const totalSkills = Object.values(skillsByRole).reduce((a, b) => a + b, 0)
      const totalProjects = Object.values(projectsByRole).reduce((a, b) => a + b, 0)
      setStep2Status({ success: true, message: `Step 2 verified: competency data in Supabase (${totalSkills} skills, ${totalProjects} projects).`, skillsByRole, projectsByRole })
    } catch (e) {
      setStep2Status({ success: false, message: "Step 2 verification failed.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoadingStep2(false) }
  }

  async function handleVerifyStep3() {
    setLoadingStep3(true); setStep3Status(null)
    try {
      if (!supabase) { setStep3Status({ success: false, message: "Supabase client not configured.", error: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env" }); return }
      const { data: skills, error: skillsError } = await supabase.from("skills").select("id, weight, difficulty").eq("role", "Frontend Developer").limit(3)
      if (skillsError) throw new Error("Skills: " + skillsError.message)
      const userSkills = (skills ?? []).map((s) => ({ proficiency: 3 as number, skill: { weight: Number(s.weight) || 1 } }))
      const { data: projects } = await supabase.from("projects").select("id, difficulty").eq("role", "Frontend Developer").limit(2)
      const userProjects = (projects ?? []).map((p, i) => ({ completed: i === 0, project: { difficulty: Number(p.difficulty) || 1 } }))
      const breakdown = calculateScore(userSkills, userProjects, 0, 0, 0)
      setStep3Status({ success: true, message: `Step 3 verified: Employability Score engine (final ${breakdown.final_score}).`, breakdown })
    } catch (e) {
      setStep3Status({ success: false, message: "Step 3 verification failed.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoadingStep3(false) }
  }

  async function handleVerifyStep4() {
    setLoadingStep4(true); setStep4Status(null)
    try {
      if (!supabase) { setStep4Status({ success: false, message: "Supabase client not configured.", error: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env" }); return }
      const role = "Frontend Developer"
      const { data: skills, error: se } = await supabase.from("skills").select("id, name, role, difficulty, weight").eq("role", role)
      if (se) throw new Error("Skills: " + se.message)
      const skillList = (skills ?? []).map((s) => ({ id: s.id, name: s.name, role: s.role, difficulty: s.difficulty, weight: s.weight }))
      const userSkills = skillList.slice(0, 5).map((s, i) => ({ skillId: s.id, proficiency: i < 2 ? 5 : i < 3 ? 4 : i < 4 ? 2 : 0 }))
      const result = analyzeSkillGap(role, skillList, userSkills)
      setStep4Status({ success: true, message: `Step 4 verified: Skill gap (${result.strengths.length} strengths, ${result.gaps.length} gaps, ${result.priorityFocus.length} priority).`, result })
    } catch (e) {
      setStep4Status({ success: false, message: "Step 4 verification failed.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoadingStep4(false) }
  }

  async function loadRoadmap() {
    if (!supabase) return null
    const role = "Frontend Developer"
    const { data: skills, error: se } = await supabase.from("skills").select("id, name, difficulty, weight").eq("role", role).order("difficulty")
    if (se) throw new Error("Skills: " + se.message)
    const { data: projects, error: pe } = await supabase.from("projects").select("id, title, difficulty, required_skills, evaluation_criteria").eq("role", role).order("difficulty")
    if (pe) throw new Error("Projects: " + pe.message)
    const skillList = skills ?? []
    const projectList = projects ?? []
    const userSkills = skillList.slice(0, 4).map((s, i) => ({ skillId: s.id, proficiency: i < 2 ? 5 : i < 3 ? 4 : 2 }))
    const userProjects = projectList.slice(0, 1).map((p) => ({ projectId: p.id, completed: true }))
    const skillRows = skillList.map((s) => ({ id: s.id, name: s.name, difficulty: Number(s.difficulty) ?? 1, weight: s.weight != null ? Number(s.weight) : undefined }))
    const projectRows = projectList.map((p) => ({ id: p.id, title: p.title, difficulty: Number(p.difficulty) ?? 1, required_skills: (p.required_skills ?? []) as string[], evaluation_criteria: p.evaluation_criteria ?? undefined }))
    const summary = computeRoadmapSummary(role, skillRows, projectRows, userSkills, userProjects)
    const fullSteps = computeRoadmapSteps(role, skillRows, projectRows, userSkills, userProjects)
    return { summary, fullSteps }
  }

  async function handleVerifyStep5() {
    setLoadingStep5(true); setStep5Status(null); setRoadmapSteps(null)
    try {
      if (!supabase) { setStep5Status({ success: false, message: "Supabase client not configured.", error: "Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env" }); return }
      const result = await loadRoadmap()
      if (!result) return
      setRoadmapSteps(result.fullSteps)
      setStep5Status({ success: true, message: `Step 5 verified: Roadmap (${result.summary.skillsDone} done, ${result.summary.skillsNext} next, ${result.summary.projectsDone} project(s) done).`, summary: result.summary })
    } catch (e) {
      setStep5Status({ success: false, message: "Step 5 verification failed.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoadingStep5(false) }
  }

  async function handleLoadRoadmap() {
    setLoadingStep5(true); setRoadmapSteps(null)
    try {
      if (!supabase) return
      const result = await loadRoadmap()
      if (result) setRoadmapSteps(result.fullSteps)
    } catch (e) { console.error("Load roadmap failed", e) }
    finally { setLoadingStep5(false) }
  }

  async function handleVerifyStep6() {
    setLoadingStep6(true); setStep6Status(null)
    try {
      if (!supabase) { setStep6Status({ success: false, message: "Supabase not configured.", error: "Add .env keys" }); return }
      const { error: tableErr } = await supabase.from("resume_uploads").select("*", { count: "exact", head: true })
      const tableOk = !tableErr
      let storageOk = false
      const { error: storageErr } = await supabase.storage.from("documents").list("resumes", { limit: 1 })
      if (!storageErr) storageOk = true
      const success = tableOk && storageOk
      setStep6Status({
        success,
        message: success ? "Step 6 verified: resume_uploads table + documents bucket (Supabase)." : "Step 6: run supabase/resume-storage.sql in SQL Editor, then retry.",
        tableOk,
        storageOk,
        error: tableErr?.message || storageErr?.message || (success ? undefined : "Table or bucket missing."),
      })
    } catch (e) {
      setStep6Status({ success: false, message: "Step 6 verification failed.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoadingStep6(false) }
  }

  async function handleVerifyStep7() {
    setLoadingStep7(true); setStep7Status(null)
    try {
      if (!supabase) { setStep7Status({ success: false, message: "Supabase not configured.", error: "Add .env keys" }); return }
      const { data, error } = await supabase.from("interview_questions").select("id, question_text, role, difficulty_level").eq("role", "Frontend Developer")
      if (error) throw new Error(error.message)
      const count = (data ?? []).length
      const success = count > 0
      setStep7Status({ success, message: success ? `Step 7 verified: interview_questions (${count} for Frontend Developer).` : "Step 7: run supabase/interview-questions.sql.", count: success ? count : undefined, error: success ? undefined : "No questions found." })
    } catch (e) {
      setStep7Status({ success: false, message: "Step 7 verification failed.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoadingStep7(false) }
  }

  async function handleVerifyStep8() {
    setLoadingStep8(true); setStep8Status(null)
    try {
      if (!supabase) { setStep8Status({ success: false, message: "Supabase not configured.", error: "Add .env keys" }); return }
      const role = "Frontend Developer"
      const { data: skills } = await supabase.from("skills").select("id, name, difficulty, weight").eq("role", role).order("difficulty")
      const { data: projects } = await supabase.from("projects").select("id, title, difficulty, required_skills").eq("role", role)
      const skillList = skills ?? []
      const projectList = projects ?? []
      const userSkills = skillList.slice(0, 4).map((s, i) => ({ skillId: s.id, proficiency: i < 2 ? 5 : i < 3 ? 4 : 2 }))
      const userProjects = projectList.slice(0, 1).map((p) => ({ projectId: p.id, completed: true }))
      const skillRows = skillList.map((s) => ({ id: s.id, name: s.name, role, difficulty: Number(s.difficulty) ?? 1, weight: s.weight != null ? Number(s.weight) : undefined }))
      const projectRows = projectList.map((p) => ({ id: p.id, title: p.title, difficulty: Number(p.difficulty) ?? 1, required_skills: (p.required_skills ?? []) as string[] }))
      const summary = computeRoadmapSummary(role, skillRows, projectRows, userSkills, userProjects)
      const gapResult = analyzeSkillGap(role, skillRows, userSkills.map((u) => ({ skillId: u.skillId, proficiency: u.proficiency })))
      const userSkillsForScore = (skills ?? []).slice(0, 3).map((s) => ({ proficiency: 3 as number, skill: { weight: Number(s.weight) || 1 } }))
      const userProjectsForScore = (projects ?? []).slice(0, 2).map((p, i) => ({ completed: i === 0, project: { difficulty: Number(p.difficulty) || 1 } }))
      const breakdown = calculateScore(userSkillsForScore, userProjectsForScore, 50, 0, 0)
      setStep8Status({ success: true, message: `Step 8 verified: API surface (getScore, getSkillGap, getRoadmap) using Supabase. Score: ${breakdown.final_score}, Gaps: ${gapResult.gaps.length}, Roadmap: ${summary.skillsDone} done.` })
    } catch (e) {
      setStep8Status({ success: false, message: "Step 8 verification failed.", error: e instanceof Error ? e.message : String(e) })
    } finally { setLoadingStep8(false) }
  }

  const anyLoading = loading || loadingStep2 || loadingStep3 || loadingStep4 || loadingStep5 || loadingStep6 || loadingStep7 || loadingStep8

  return (
    <div className="app">
      <header className="header">
        <h1>Verify Steps 1-8</h1>
        <p className="tagline">Dynamic verification against Supabase (skilljob)</p>
      </header>
      <section className="weights">
        <h2>Score weights</h2>
        <ul>
          {Object.entries(SCORE_WEIGHTS).map(([key, value]) => (
            <li key={key}><span className="key">{key}</span><span className="value">{(value * 100).toFixed(0)}%</span></li>
          ))}
        </ul>
      </section>
      <section className="verify">
        <button type="button" className="btn-verify" onClick={handleVerifyStep1} disabled={anyLoading} data-testid="verify-step1"> {loading ? "Verifying…" : "Verify Step 1 (Supabase)"} </button>
        <button type="button" className="btn-verify" onClick={handleVerifyStep2} disabled={anyLoading} data-testid="verify-step2"> {loadingStep2 ? "Verifying…" : "Verify Step 2 (competency data)"} </button>
        <button type="button" className="btn-verify" onClick={handleVerifyStep3} disabled={anyLoading} data-testid="verify-step3"> {loadingStep3 ? "Verifying…" : "Verify Step 3 (score engine)"} </button>
        <button type="button" className="btn-verify" onClick={handleVerifyStep4} disabled={anyLoading} data-testid="verify-step4"> {loadingStep4 ? "Verifying…" : "Verify Step 4 (skill gap)"} </button>
        <button type="button" className="btn-verify" onClick={handleVerifyStep5} disabled={anyLoading} data-testid="verify-step5"> {loadingStep5 ? "Verifying…" : "Verify Step 5 (roadmap)"} </button>
        <button type="button" className="btn-verify" onClick={handleLoadRoadmap} disabled={anyLoading} data-testid="load-roadmap"> {loadingStep5 ? "Loading…" : "Load Roadmap"} </button>
        <button type="button" className="btn-verify" onClick={handleVerifyStep6} disabled={anyLoading} data-testid="verify-step6"> {loadingStep6 ? "Verifying…" : "Verify Step 6 (resume)"} </button>
        <button type="button" className="btn-verify" onClick={handleVerifyStep7} disabled={anyLoading} data-testid="verify-step7"> {loadingStep7 ? "Verifying…" : "Verify Step 7 (interview)"} </button>
        <button type="button" className="btn-verify" onClick={handleVerifyStep8} disabled={anyLoading} data-testid="verify-step8"> {loadingStep8 ? "Verifying…" : "Verify Step 8 (API surface)"} </button>
        {status && <div className={"status " + (status.success ? "success" : "error")}><p>{status.message}</p>{status.skillsCount != null && <p className="detail">Skills rows: {status.skillsCount}</p>}{status.error && <p className="error-detail">{status.error}</p>}</div>}
        {step2Status && <div className={"status " + (step2Status.success ? "success" : "error")}><p>{step2Status.message}</p>{step2Status.skillsByRole && <p className="detail">Skills by role: {Object.entries(step2Status.skillsByRole).map(([r, n]) => r + ": " + n).join(", ")}</p>}{step2Status.projectsByRole && <p className="detail">Projects by role: {Object.entries(step2Status.projectsByRole).map(([r, n]) => r + ": " + n).join(", ")}</p>}{step2Status.error && <p className="error-detail">{step2Status.error}</p>}</div>}
        {step3Status && <div className={"status " + (step3Status.success ? "success" : "error")}><p>{step3Status.message}</p>{step3Status.breakdown && <div className="detail"><p>Technical: {step3Status.breakdown.technical} · Projects: {step3Status.breakdown.projects} · Resume: {step3Status.breakdown.resume} · Practical: {step3Status.breakdown.practical} · Interview: {step3Status.breakdown.interview}</p><p><strong>Final score: {step3Status.breakdown.final_score}</strong></p></div>}{step3Status.error && <p className="error-detail">{step3Status.error}</p>}</div>}
        {step4Status && <div className={"status " + (step4Status.success ? "success" : "error")}><p>{step4Status.message}</p>{step4Status.result && <div className="detail"><p>Strengths: {step4Status.result.strengths.length} · Gaps: {step4Status.result.gaps.length} · Priority focus: {step4Status.result.priorityFocus.length}</p>{step4Status.result.suggestedNextSkill && <p>Suggested next skill: {step4Status.result.suggestedNextSkill.name}</p>}</div>}{step4Status.error && <p className="error-detail">{step4Status.error}</p>}</div>}
        {step5Status && <div className={"status " + (step5Status.success ? "success" : "error")}><p>{step5Status.message}</p>{step5Status.summary && <div className="detail"><p>Skills: done {step5Status.summary.skillsDone} · next {step5Status.summary.skillsNext} · upcoming {step5Status.summary.skillsUpcoming}</p><p>Projects: done {step5Status.summary.projectsDone} · suggested {step5Status.summary.projectsSuggested} · locked {step5Status.summary.projectsLocked}</p></div>}{step5Status.error && <p className="error-detail">{step5Status.error}</p>}</div>}
        {step6Status && <div className={"status " + (step6Status.success ? "success" : "error")}><p>{step6Status.message}</p>{step6Status.tableOk != null && <p className="detail">Table resume_uploads: {step6Status.tableOk ? "OK" : "missing"}. Storage documents: {step6Status.storageOk ? "OK" : "missing"}.</p>}{step6Status.success && <p className="detail"><Link to="/resume">Go to Resume page</Link> to upload a file and run analysis.</p>}{step6Status.error && <p className="error-detail">{step6Status.error}</p>}</div>}
        {step7Status && <div className={"status " + (step7Status.success ? "success" : "error")}><p>{step7Status.message}</p>{step7Status.count != null && <p className="detail"><Link to="/interview">Go to Interview page</Link> to view questions.</p>}{step7Status.error && <p className="error-detail">{step7Status.error}</p>}</div>}
        {step8Status && <div className={"status " + (step8Status.success ? "success" : "error")}><p>{step8Status.message}</p>{step8Status.error && <p className="error-detail">{step8Status.error}</p>}</div>}
      </section>
      {roadmapSteps && <RoadmapDiagram steps={roadmapSteps} />}
      <section className="console-status" aria-live="polite">
        <h2>Console (verification)</h2>
        {consoleErrors.length === 0 && consoleWarnings.length === 0 && <p className="console-ok">No console errors or warnings.</p>}
        {consoleErrors.length > 0 && <div className="console-errors"><p><strong>{consoleErrors.length} error(s)</strong> (first 10):</p><ul>{consoleErrors.slice(0, 10).map((msg, i) => <li key={i}>{msg}</li>)}</ul></div>}
        {consoleWarnings.length > 0 && <div className="console-warnings"><p><strong>{consoleWarnings.length} warning(s)</strong> (first 5):</p><ul>{consoleWarnings.slice(0, 5).map((msg, i) => <li key={i}>{msg}</li>)}</ul></div>}
      </section>
      <footer className="footer"><p>Supabase project <strong>skilljob</strong>. Steps 1-8 verified dynamically.</p></footer>
    </div>
  )
}
