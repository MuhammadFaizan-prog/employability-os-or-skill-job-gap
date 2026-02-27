/**
 * Shared hook: fetches skills, projects, interview questions from Supabase
 * and computes score, skill gap, and roadmap using the backend engine functions.
 * All pages consume this single source of truth.
 *
 * Supabase write-back: persists user_skills, user_projects, and scores
 * when the user is authenticated, with localStorage as fallback.
 */
import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'
import { calculateScore, type ScoreBreakdown } from '../lib/score'
import { analyzeSkillGap, type SkillGapResult, type SkillRow } from '../lib/skillGap'
import {
  computeRoadmapSummary,
  computeRoadmapSteps,
  type RoadmapSummary,
  type RoadmapSteps,
} from '../lib/roadmap'

const DEFAULT_ROLE = 'Frontend Developer'
const STORAGE_KEY = 'employabilityos_user_skills'
const PROJECTS_KEY = 'employabilityos_user_projects'
const FETCH_TIMEOUT_MS = 15_000

export interface SupabaseSkill {
  id: string
  name: string
  role: string
  difficulty: number
  weight: number
}

export interface SupabaseProject {
  id: string
  title: string
  role: string
  difficulty: number
  description?: string
  required_skills?: string[]
  evaluation_criteria?: string
}

export interface InterviewQuestion {
  id: string
  question_text: string
  role: string
  difficulty_level: string
  category?: string
  hint?: string
}

export interface UserSkillRating {
  skillId: string
  proficiency: number
}

export interface UserProjectStatus {
  projectId: string
  completed: boolean
}

interface RoleData {
  loading: boolean
  error: string | null
  role: string
  skills: SupabaseSkill[]
  projects: SupabaseProject[]
  interviewQuestions: InterviewQuestion[]
  userSkillRatings: UserSkillRating[]
  userProjectStatuses: UserProjectStatus[]
  scoreBreakdown: ScoreBreakdown | null
  skillGapResult: SkillGapResult | null
  roadmapSummary: RoadmapSummary | null
  roadmapSteps: RoadmapSteps | null
  setUserSkillRating: (skillId: string, proficiency: number) => void
  toggleProjectComplete: (projectId: string) => void
  refresh: () => void
}

function loadPersistedSkills(): UserSkillRating[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function persistSkills(ratings: UserSkillRating[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(ratings))
}

function loadPersistedProjects(): UserProjectStatus[] {
  try {
    const raw = localStorage.getItem(PROJECTS_KEY)
    return raw ? JSON.parse(raw) : []
  } catch { return [] }
}

function persistProjects(statuses: UserProjectStatus[]) {
  localStorage.setItem(PROJECTS_KEY, JSON.stringify(statuses))
}

async function syncSkillToSupabase(userId: string, skillId: string, proficiency: number) {
  if (!supabase) return
  await supabase.from('user_skills').upsert(
    { user_id: userId, skill_id: skillId, proficiency, last_updated: new Date().toISOString() },
    { onConflict: 'user_id,skill_id' }
  ).then(({ error }) => {
    if (error) console.warn('user_skills upsert:', error.message)
  })
}

async function syncProjectToSupabase(userId: string, projectId: string, completed: boolean) {
  if (!supabase) return
  await supabase.from('user_projects').upsert(
    { user_id: userId, project_id: projectId, completed, last_updated: new Date().toISOString() },
    { onConflict: 'user_id,project_id' }
  ).then(({ error }) => {
    if (error) console.warn('user_projects upsert:', error.message)
  })
}

async function persistScoreToSupabase(userId: string, score: ScoreBreakdown) {
  if (!supabase) return
  await supabase.from('scores').upsert(
    {
      user_id: userId,
      technical: Math.round(score.technical),
      projects: Math.round(score.projects),
      resume: Math.round(score.resume),
      practical: Math.round(score.practical),
      interview: Math.round(score.interview),
      final_score: Math.round(score.final_score),
      last_calculated: new Date().toISOString(),
    },
    { onConflict: 'user_id' }
  ).then(({ error }) => {
    if (error) console.warn('scores upsert:', error.message)
  })
}

export function useRoleData(role: string = DEFAULT_ROLE): RoleData {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [skills, setSkills] = useState<SupabaseSkill[]>([])
  const [projects, setProjects] = useState<SupabaseProject[]>([])
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [userSkillRatings, setUserSkillRatings] = useState<UserSkillRating[]>(loadPersistedSkills)
  const [userProjectStatuses, setUserProjectStatuses] = useState<UserProjectStatus[]>(loadPersistedProjects)
  const userIdRef = useRef<string | null>(null)

  const fetchData = useCallback(async () => {
    if (!supabase) {
      setError('Supabase not configured. Check .env for VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.')
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const userId = user?.id ?? null
      userIdRef.current = userId

      const withTimeout = <T,>(promise: PromiseLike<T>, label: string): Promise<T> =>
        Promise.race([
          promise,
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error(`${label} timed out after ${FETCH_TIMEOUT_MS / 1000}s`)), FETCH_TIMEOUT_MS)
          ),
        ])

      const [skillsRes, projectsRes, questionsRes] = await Promise.all([
        withTimeout(supabase.from('skills').select('id, name, role, difficulty, weight').eq('role', role).order('difficulty'), 'Skills query'),
        withTimeout(supabase.from('projects').select('id, title, role, difficulty, description, required_skills, evaluation_criteria').eq('role', role).order('difficulty'), 'Projects query'),
        withTimeout(supabase.from('interview_questions').select('id, question_text, role, difficulty_level, category, hint').eq('role', role), 'Questions query'),
      ])

      if (skillsRes.error) throw new Error('Skills: ' + skillsRes.error.message)
      if (projectsRes.error) throw new Error('Projects: ' + projectsRes.error.message)
      if (questionsRes.error) throw new Error('Questions: ' + questionsRes.error.message)

      const fetchedSkills = (skillsRes.data ?? []).map(s => ({
        ...s,
        difficulty: Number(s.difficulty) || 1,
        weight: Number(s.weight) || 1,
      }))
      const fetchedProjects = (projectsRes.data ?? []).map(p => ({
        ...p,
        difficulty: Number(p.difficulty) || 1,
        required_skills: (p.required_skills ?? []) as string[],
      }))

      setSkills(fetchedSkills)
      setProjects(fetchedProjects)
      setInterviewQuestions(questionsRes.data ?? [])

      // Try loading user progress from Supabase first (authenticated), fallback to localStorage
      let skillRatingsLoaded = false
      let projectStatusesLoaded = false

      if (userId) {
        const [userSkillsRes, userProjectsRes] = await Promise.all([
          supabase.from('user_skills').select('skill_id, proficiency').eq('user_id', userId),
          supabase.from('user_projects').select('project_id, completed').eq('user_id', userId),
        ])

        if (!userSkillsRes.error && userSkillsRes.data && userSkillsRes.data.length > 0) {
          const fromDb = userSkillsRes.data.map(r => ({
            skillId: r.skill_id,
            proficiency: Number(r.proficiency),
          }))
          setUserSkillRatings(fromDb)
          persistSkills(fromDb)
          skillRatingsLoaded = true
        }

        if (!userProjectsRes.error && userProjectsRes.data && userProjectsRes.data.length > 0) {
          const fromDb = userProjectsRes.data.map(r => ({
            projectId: r.project_id,
            completed: !!r.completed,
          }))
          setUserProjectStatuses(fromDb)
          persistProjects(fromDb)
          projectStatusesLoaded = true
        }
      }

      if (!skillRatingsLoaded) {
        const persisted = loadPersistedSkills()
        if (persisted.length === 0 && fetchedSkills.length > 0) {
          const defaults = fetchedSkills.map((s, i) => ({
            skillId: s.id,
            proficiency: i < 2 ? 4 : i < 4 ? 3 : 2,
          }))
          setUserSkillRatings(defaults)
          persistSkills(defaults)
        }
      }

      if (!projectStatusesLoaded) {
        const persistedProjects = loadPersistedProjects()
        if (persistedProjects.length === 0 && fetchedProjects.length > 0) {
          const defaults = fetchedProjects.map((p, i) => ({
            projectId: p.id,
            completed: i === 0,
          }))
          setUserProjectStatuses(defaults)
          persistProjects(defaults)
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err))
    } finally {
      setLoading(false)
    }
  }, [role, user])

  useEffect(() => { fetchData() }, [fetchData])

  const setUserSkillRating = useCallback((skillId: string, proficiency: number) => {
    setUserSkillRatings(prev => {
      const next = prev.filter(r => r.skillId !== skillId)
      next.push({ skillId, proficiency })
      persistSkills(next)
      return next
    })
    if (userIdRef.current) {
      syncSkillToSupabase(userIdRef.current, skillId, proficiency)
    }
  }, [])

  const toggleProjectComplete = useCallback((projectId: string) => {
    setUserProjectStatuses(prev => {
      const existing = prev.find(p => p.projectId === projectId)
      const newCompleted = existing ? !existing.completed : true
      const next = existing
        ? prev.map(p => p.projectId === projectId ? { ...p, completed: newCompleted } : p)
        : [...prev, { projectId, completed: true }]
      persistProjects(next)
      if (userIdRef.current) {
        syncProjectToSupabase(userIdRef.current, projectId, newCompleted)
      }
      return next
    })
  }, [])

  const skillRows: SkillRow[] = skills.map(s => ({
    id: s.id, name: s.name, role: s.role, difficulty: s.difficulty, weight: s.weight,
  }))

  const scoreBreakdown = skills.length > 0 ? (() => {
    const userSkillsForScore = skills.map(s => {
      const rating = userSkillRatings.find(r => r.skillId === s.id)
      return { proficiency: rating?.proficiency ?? 0, skill: { weight: s.weight } }
    })
    const userProjectsForScore = projects.map(p => {
      const status = userProjectStatuses.find(ps => ps.projectId === p.id)
      return { completed: status?.completed ?? false, project: { difficulty: p.difficulty } }
    })
    return calculateScore(userSkillsForScore, userProjectsForScore, 0, 0, 0)
  })() : null

  // Persist score to Supabase whenever it changes (debounced by effect)
  const prevScoreRef = useRef<number | null>(null)
  useEffect(() => {
    if (!scoreBreakdown || !userIdRef.current) return
    const rounded = Math.round(scoreBreakdown.final_score)
    if (prevScoreRef.current === rounded) return
    prevScoreRef.current = rounded
    persistScoreToSupabase(userIdRef.current, scoreBreakdown)
  }, [scoreBreakdown])

  const skillGapResult = skills.length > 0
    ? analyzeSkillGap(role, skillRows, userSkillRatings)
    : null

  const projectRows = projects.map(p => ({
    id: p.id, title: p.title, difficulty: p.difficulty,
    required_skills: p.required_skills ?? [],
    evaluation_criteria: p.evaluation_criteria,
  }))

  const roadmapSummary = skills.length > 0
    ? computeRoadmapSummary(role, skillRows, projectRows, userSkillRatings,
        userProjectStatuses.map(p => ({ projectId: p.projectId, completed: p.completed })))
    : null

  const roadmapSteps = skills.length > 0
    ? computeRoadmapSteps(role, skillRows, projectRows, userSkillRatings,
        userProjectStatuses.map(p => ({ projectId: p.projectId, completed: p.completed })))
    : null

  return {
    loading, error, role, skills, projects, interviewQuestions,
    userSkillRatings, userProjectStatuses,
    scoreBreakdown, skillGapResult, roadmapSummary, roadmapSteps,
    setUserSkillRating, toggleProjectComplete, refresh: fetchData,
  }
}
