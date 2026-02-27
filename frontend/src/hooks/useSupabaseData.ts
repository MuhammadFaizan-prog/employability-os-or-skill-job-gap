import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { calculateScore, type ScoreBreakdown } from '../lib/score'
import { analyzeSkillGap, type SkillGapResult, type SkillRow } from '../lib/skillGap'
import { computeRoadmapSummary, computeRoadmapSteps, type RoadmapSummary, type RoadmapSteps } from '../lib/roadmap'
import { analyzeResume, type ResumeAnalysisResult } from '../lib/resumeAnalyzer'

const DEFAULT_ROLE = 'Frontend Developer'

export interface SupabaseSkill {
  id: string; name: string; role: string; difficulty: number; weight: number
}

export interface SupabaseProject {
  id: string; title: string; role: string; difficulty: number; description?: string;
  required_skills?: string[]; evaluation_criteria?: string
}

export interface InterviewQuestion {
  id: string; question_text: string; role: string; difficulty_level: string; category?: string; hint?: string
}

export interface ResumeUpload {
  id: string; file_name: string; file_path: string; file_size: number; mime_type: string;
  created_at: string; analysis_result?: ResumeAnalysisResult
}

// ─── Skills ────────────────────────────────────────────────────────
export function useSkills(role = DEFAULT_ROLE) {
  const [skills, setSkills] = useState<SupabaseSkill[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    let cancelled = false
    ;(async () => {
      const { data, error: e } = await supabase.from('skills').select('*').eq('role', role).order('difficulty')
      if (cancelled) return
      if (e) { setError(e.message); setLoading(false); return }
      setSkills((data ?? []) as SupabaseSkill[])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [role])

  return { skills, loading, error }
}

// ─── Projects ──────────────────────────────────────────────────────
export function useProjects(role = DEFAULT_ROLE) {
  const [projects, setProjects] = useState<SupabaseProject[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    let cancelled = false
    ;(async () => {
      const { data, error: e } = await supabase.from('projects').select('*').eq('role', role).order('difficulty')
      if (cancelled) return
      if (e) { setError(e.message); setLoading(false); return }
      setProjects((data ?? []) as SupabaseProject[])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [role])

  return { projects, loading, error }
}

// ─── Score ─────────────────────────────────────────────────────────
export function useScore(role = DEFAULT_ROLE, userProficiencies: Record<string, number> = {}, completedProjectIds: string[] = []) {
  const { skills, loading: sl } = useSkills(role)
  const { projects, loading: pl } = useProjects(role)
  const [score, setScore] = useState<ScoreBreakdown | null>(null)

  useEffect(() => {
    if (sl || pl || skills.length === 0) return
    const userSkills = skills.map(s => ({
      proficiency: userProficiencies[s.id] ?? 3,
      skill: { weight: Number(s.weight) || 1 },
    }))
    const userProjects = projects.map(p => ({
      completed: completedProjectIds.includes(p.id),
      project: { difficulty: Number(p.difficulty) || 1 },
    }))
    setScore(calculateScore(userSkills, userProjects, 0, 0, 0))
  }, [skills, projects, sl, pl, userProficiencies, completedProjectIds])

  return { score, loading: sl || pl }
}

// ─── Skill Gap ─────────────────────────────────────────────────────
export function useSkillGap(role = DEFAULT_ROLE, userProficiencies: Record<string, number> = {}) {
  const { skills, loading } = useSkills(role)
  const [result, setResult] = useState<SkillGapResult | null>(null)

  useEffect(() => {
    if (loading || skills.length === 0) return
    const allSkills: SkillRow[] = skills.map(s => ({ id: s.id, name: s.name, role: s.role, difficulty: s.difficulty, weight: s.weight }))
    const userSkills = skills.map(s => ({ skillId: s.id, proficiency: userProficiencies[s.id] ?? 0 }))
    setResult(analyzeSkillGap(role, allSkills, userSkills))
  }, [skills, loading, role, userProficiencies])

  return { result, loading, skills }
}

// ─── Roadmap ───────────────────────────────────────────────────────
export function useRoadmap(role = DEFAULT_ROLE, userProficiencies: Record<string, number> = {}, completedProjectIds: string[] = []) {
  const { skills, loading: sl } = useSkills(role)
  const { projects, loading: pl } = useProjects(role)
  const [summary, setSummary] = useState<RoadmapSummary | null>(null)
  const [steps, setSteps] = useState<RoadmapSteps | null>(null)

  useEffect(() => {
    if (sl || pl || skills.length === 0) return
    const sr = skills.map(s => ({ id: s.id, name: s.name, difficulty: Number(s.difficulty) ?? 1, weight: s.weight != null ? Number(s.weight) : undefined }))
    const pr = projects.map(p => ({
      id: p.id, title: p.title, difficulty: Number(p.difficulty) ?? 1,
      required_skills: (p.required_skills ?? []) as string[],
      evaluation_criteria: p.evaluation_criteria ?? undefined,
    }))
    const us = skills.map(s => ({ skillId: s.id, proficiency: userProficiencies[s.id] ?? 0 }))
    const up = projects.filter(p => completedProjectIds.includes(p.id)).map(p => ({ projectId: p.id, completed: true }))
    setSummary(computeRoadmapSummary(role, sr, pr, us, up))
    setSteps(computeRoadmapSteps(role, sr, pr, us, up))
  }, [skills, projects, sl, pl, role, userProficiencies, completedProjectIds])

  return { summary, steps, loading: sl || pl, skills, projects }
}

// ─── Interview Questions ───────────────────────────────────────────
export function useInterviewQuestions(role = DEFAULT_ROLE) {
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) { setError('Supabase not configured'); setLoading(false); return }
    let cancelled = false
    ;(async () => {
      const { data, error: e } = await supabase
        .from('interview_questions')
        .select('id, question_text, role, difficulty_level, category, hint')
        .eq('role', role)
      if (cancelled) return
      if (e) { setError(e.message); setLoading(false); return }
      setQuestions((data ?? []) as InterviewQuestion[])
      setLoading(false)
    })()
    return () => { cancelled = true }
  }, [role])

  return { questions, loading, error }
}

// ─── Resume Upload ─────────────────────────────────────────────────
export function useResumeUpload() {
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [lastUpload, setLastUpload] = useState<ResumeUpload | null>(null)

  const upload = useCallback(async (file: File) => {
    if (!supabase) { setError('Supabase not configured'); return null }
    setUploading(true); setError(null)
    try {
      const { data: authData } = await supabase.auth.getUser()
      const userId = authData.user?.id
      if (!userId) throw new Error('You must be logged in to upload a resume')

      const ext = file.name.split('.').pop() || 'pdf'
      const path = `resumes/${userId}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`
      const { error: uploadErr } = await supabase.storage.from('documents').upload(path, file, { contentType: file.type, upsert: false })
      if (uploadErr) throw new Error(uploadErr.message)

      const analysis = analyzeResume(file)

      const { data: row, error: insertErr } = await supabase.from('resume_uploads').insert({
        user_id: userId, file_name: file.name, file_path: path, file_size: file.size, mime_type: file.type, analysis_result: analysis,
      }).select().single()
      if (insertErr) throw new Error(insertErr.message)

      const result = row as ResumeUpload
      setLastUpload(result)
      return result
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e)
      setError(msg)
      return null
    } finally { setUploading(false) }
  }, [])

  return { upload, uploading, error, lastUpload }
}

// ─── Resume History ────────────────────────────────────────────────
export function useResumeHistory() {
  const [history, setHistory] = useState<ResumeUpload[]>([])
  const [loading, setLoading] = useState(true)

  const refresh = useCallback(async () => {
    if (!supabase) { setLoading(false); return }
    const { data: authData } = await supabase.auth.getUser()
    const userId = authData.user?.id
    if (!userId) { setLoading(false); return }
    const { data } = await supabase
      .from('resume_uploads')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10)
    setHistory((data ?? []) as ResumeUpload[])
    setLoading(false)
  }, [])

  useEffect(() => { refresh() }, [refresh])

  return { history, loading, refresh }
}
