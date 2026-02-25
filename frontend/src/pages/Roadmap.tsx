import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { computeRoadmapSteps, type RoadmapSteps } from '../lib/roadmap'
import { RoadmapDiagram } from '../components/RoadmapDiagram'

export function RoadmapPage() {
  const [steps, setSteps] = useState<RoadmapSteps | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function loadRoadmap() {
    if (!supabase) { setError('Supabase not configured.'); return }
    setLoading(true)
    setError(null)
    setSteps(null)
    try {
      const role = 'Frontend Developer'
      const { data: skills, error: se } = await supabase.from('skills').select('id, name, difficulty, weight').eq('role', role).order('difficulty')
      if (se) throw new Error(se.message)
      const { data: projects, error: pe } = await supabase.from('projects').select('id, title, difficulty, required_skills, evaluation_criteria').eq('role', role).order('difficulty')
      if (pe) throw new Error(pe.message)
      const skillList = skills ?? []
      const projectList = projects ?? []
      const userSkills = skillList.slice(0, 4).map((s, i) => ({ skillId: s.id, proficiency: i < 2 ? 5 : i < 3 ? 4 : 2 }))
      const userProjects = projectList.slice(0, 1).map((p) => ({ projectId: p.id, completed: true }))
      const skillRows = skillList.map((s) => ({ id: s.id, name: s.name, difficulty: Number(s.difficulty) ?? 1, weight: s.weight != null ? Number(s.weight) : undefined }))
      const projectRows = projectList.map((p) => ({ id: p.id, title: p.title, difficulty: Number(p.difficulty) ?? 1, required_skills: (p.required_skills ?? []) as string[], evaluation_criteria: p.evaluation_criteria ?? undefined }))
      setSteps(computeRoadmapSteps(role, skillRows, projectRows, userSkills, userProjects))
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="page">
      <h1>Roadmap</h1>
      <p>Ordered skills and projects from Supabase (Step 5).</p>
      <button type="button" className="btn-verify" onClick={loadRoadmap} disabled={loading}>{loading ? 'Loading…' : 'Load Roadmap'}</button>
      {error && <p className="status error"><strong>Error:</strong> {error}</p>}
      {steps && <RoadmapDiagram steps={steps} />}
    </div>
  )
}
