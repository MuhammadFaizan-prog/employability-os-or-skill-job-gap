import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import { setStoredRole } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'

type RoleId = 'frontend' | 'backend' | 'data-analyst' | 'ai-ml' | 'mobile'

const ROLE_DB_MAP: Record<RoleId, string> = {
  frontend: 'Frontend Developer',
  backend: 'Backend Developer',
  'data-analyst': 'Data Analyst',
  'ai-ml': 'AI/ML Engineer',
  mobile: 'Mobile Developer',
}

interface RoleMeta {
  id: RoleId
  title: string
  desc: string
}

const ROLE_CARDS: RoleMeta[] = [
  { id: 'frontend', title: 'Frontend Engineer', desc: 'Build responsive, interactive web applications using modern frameworks.' },
  { id: 'backend', title: 'Backend Engineer', desc: 'Architect scalable systems, APIs, and database structures.' },
  { id: 'data-analyst', title: 'Data Analyst', desc: 'Analyze data, build dashboards, and generate actionable business insights.' },
  { id: 'ai-ml', title: 'AI/ML Engineer', desc: 'Build intelligent systems with machine learning and deep learning models.' },
  { id: 'mobile', title: 'Mobile Developer', desc: 'Create cross-platform mobile apps for iOS and Android.' },
]

interface SupabaseSkillRow {
  id: string
  name: string
  role: string
  difficulty: number
  weight: number
}


function CodeBracketsIcon() {
  return (
    <svg className="role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 18l6-6-6-6" />
      <path d="M8 6l-6 6 6 6" />
    </svg>
  )
}

function ServerIcon() {
  return (
    <svg className="role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
      <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
      <line x1="6" y1="6" x2="6.01" y2="6" />
      <line x1="6" y1="18" x2="6.01" y2="18" />
    </svg>
  )
}

function ChartBarIcon() {
  return (
    <svg className="role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="12" width="4" height="9" rx="1" />
      <rect x="10" y="6" width="4" height="15" rx="1" />
      <rect x="17" y="2" width="4" height="19" rx="1" />
    </svg>
  )
}

function BrainIcon() {
  return (
    <svg className="role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2a7 7 0 0 1 7 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 0 1-2 2h-4a2 2 0 0 1-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 0 1 7-7z" />
      <path d="M9 21h6" />
      <path d="M10 17v4" />
      <path d="M14 17v4" />
    </svg>
  )
}

function SmartphoneIcon() {
  return (
    <svg className="role-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <rect x="5" y="2" width="14" height="20" rx="2" ry="2" />
      <line x1="12" y1="18" x2="12.01" y2="18" />
    </svg>
  )
}

function RoleIcon({ id }: { id: RoleId }) {
  switch (id) {
    case 'frontend': return <CodeBracketsIcon />
    case 'backend': return <ServerIcon />
    case 'data-analyst': return <ChartBarIcon />
    case 'ai-ml': return <BrainIcon />
    case 'mobile': return <SmartphoneIcon />
    default: return null
  }
}

const SKILLS_STORAGE_KEY = 'employabilityos_user_skills'
const PROJECTS_STORAGE_KEY = 'employabilityos_user_projects'

export function Onboarding() {
  const navigate = useNavigate()
  const [selectedRole, setSelectedRole] = useState<RoleId>('frontend')
  const [ratings, setRatings] = useState<Record<string, number>>({})
  const [fade, setFade] = useState(true)
  const [supabaseSkills, setSupabaseSkills] = useState<SupabaseSkillRow[]>([])
  const [skillCounts, setSkillCounts] = useState<Record<RoleId, number>>({ frontend: 0, backend: 0, 'data-analyst': 0, 'ai-ml': 0, mobile: 0 })
  const [projectCounts, setProjectCounts] = useState<Record<RoleId, number>>({ frontend: 0, backend: 0, 'data-analyst': 0, 'ai-ml': 0, mobile: 0 })
  const [loadingSkills, setLoadingSkills] = useState(true)

  const fetchCountsForAllRoles = useCallback(async () => {
    if (!supabase) return
    const sc: Record<RoleId, number> = { frontend: 0, backend: 0, 'data-analyst': 0, 'ai-ml': 0, mobile: 0 }
    const pc: Record<RoleId, number> = { frontend: 0, backend: 0, 'data-analyst': 0, 'ai-ml': 0, mobile: 0 }
    for (const card of ROLE_CARDS) {
      const dbRole = ROLE_DB_MAP[card.id]
      const [sRes, pRes] = await Promise.all([
        supabase.from('skills').select('id', { count: 'exact', head: true }).eq('role', dbRole),
        supabase.from('projects').select('id', { count: 'exact', head: true }).eq('role', dbRole),
      ])
      sc[card.id] = sRes.count ?? 0
      pc[card.id] = pRes.count ?? 0
    }
    setSkillCounts(sc)
    setProjectCounts(pc)
  }, [])

  const fetchSkillsForRole = useCallback(async (roleId: RoleId) => {
    if (!supabase) { setLoadingSkills(false); return }
    setLoadingSkills(true)
    const dbRole = ROLE_DB_MAP[roleId]
    const { data } = await supabase
      .from('skills')
      .select('id, name, role, difficulty, weight')
      .eq('role', dbRole)
      .order('difficulty')
    setSupabaseSkills((data ?? []) as SupabaseSkillRow[])
    setLoadingSkills(false)
  }, [])

  useEffect(() => { fetchCountsForAllRoles() }, [fetchCountsForAllRoles])
  useEffect(() => { fetchSkillsForRole(selectedRole) }, [selectedRole, fetchSkillsForRole])

  const handleRoleChange = (id: RoleId) => {
    if (id === selectedRole) return
    setFade(false)
    setTimeout(() => {
      setSelectedRole(id)
      setRatings({})
      setFade(true)
    }, 150)
  }

  const setRating = (skillId: string, value: number) => {
    setRatings((prev) => ({ ...prev, [skillId]: value }))
  }

  const handleSkip = (skillId: string) => {
    setRatings((prev) => {
      const next = { ...prev }
      delete next[skillId]
      return next
    })
  }

  const handleContinue = () => {
    setStoredRole(selectedRole)

    const skillRatings = supabaseSkills.map((s, i) => ({
      skillId: s.id,
      proficiency: ratings[s.id] ?? (i < 2 ? 3 : 2),
    }))
    localStorage.setItem(SKILLS_STORAGE_KEY, JSON.stringify(skillRatings))
    localStorage.removeItem(PROJECTS_STORAGE_KEY)

    navigate('/dashboard')
  }

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 120 }}>
      <div className="container" style={{ paddingTop: '4rem' }}>
        <header style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1>Select your career path</h1>
          <p style={{ margin: '0.5rem auto 0', color: 'var(--gray-dark)' }}>
            Choose a role that matches your goals to customize your readiness assessment.
          </p>
        </header>

        <div className="onboarding-grid">
          {ROLE_CARDS.map((r) => (
            <button
              key={r.id}
              type="button"
              className={`role-card ${r.id === selectedRole ? 'selected' : ''}`}
              onClick={() => handleRoleChange(r.id)}
            >
              <div className="role-header">
                <h3>{r.title}</h3>
                <RoleIcon id={r.id} />
              </div>
              <p className="role-desc">{r.desc}</p>
              <div className="role-meta">
                <span className="meta-item">{skillCounts[r.id] || '…'} Core Skills</span>
                <span className="meta-divider" style={{ display: 'inline-block' }} />
                <span className="meta-item">{projectCounts[r.id] || '…'} Projects</span>
              </div>
            </button>
          ))}
        </div>

        <section
          className="skills-section"
          style={{
            opacity: fade ? 1 : 0,
            transition: 'opacity 0.15s ease',
          }}
        >
          <div className="skills-header">
            <div>
              <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Self Assessment</h3>
              <p style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', margin: '0.25rem 0 0', maxWidth: 'none' }}>
                Rate your confidence level
              </p>
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 500 }}>1 = Novice, 5 = Expert</span>
          </div>
          <div className="skills-list">
            {loadingSkills ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-dark)' }}>Loading skills...</div>
            ) : supabaseSkills.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--gray-dark)' }}>No skills found for this role.</div>
            ) : (
              supabaseSkills.map((skill) => (
                <div key={skill.id} className="skill-row">
                  <span style={{ fontWeight: 500 }}>{skill.name}</span>
                  <div className="rating-control">
                    {[1, 2, 3, 4, 5].map((n) => (
                      <button
                        key={n}
                        type="button"
                        className={`rating-btn ${(ratings[skill.id] ?? 0) >= n ? 'active' : ''}`}
                        onClick={() => setRating(skill.id, n)}
                      >
                        {n}
                      </button>
                    ))}
                  </div>
                  <button
                    type="button"
                    className="skip-link"
                    onClick={() => handleSkip(skill.id)}
                  >
                    Skip
                  </button>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <footer className="sticky-footer visible">
        <button
          type="button"
          className="btn btn-primary"
          style={{ width: '100%', maxWidth: 400, height: 52, fontSize: '1.1rem' }}
          onClick={handleContinue}
        >
          Continue to Assessment
        </button>
      </footer>
    </div>
  )
}
