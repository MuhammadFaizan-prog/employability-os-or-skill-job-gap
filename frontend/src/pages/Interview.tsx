import { useState, useEffect } from "react"
import { supabase } from "../lib/supabase"

const ROLES = ["Frontend Developer", "Backend Developer", "Data Analyst"] as const
const DIFFICULTIES = [1, 2, 3] as const

interface InterviewQuestionRow {
  id: string
  question_text: string
  role: string
  difficulty_level: number
}

export function Interview() {
  const [role, setRole] = useState<string>(ROLES[0])
  const [difficulty, setDifficulty] = useState<number | "all">("all")
  const [questions, setQuestions] = useState<InterviewQuestionRow[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!supabase) {
      setError("Supabase not configured.")
      return
    }
    setLoading(true)
    setError(null)
    let q = supabase
      .from("interview_questions")
      .select("id, question_text, role, difficulty_level")
      .eq("role", role)
      .order("difficulty_level")
    if (difficulty !== "all") {
      q = q.eq("difficulty_level", difficulty)
    }
    q.then(({ data, error: e }) => {
      if (e) {
        setError(e.message)
        setQuestions([])
      } else {
        setQuestions((data as InterviewQuestionRow[]) ?? [])
      }
    }).then(() => setLoading(false), () => setLoading(false))
  }, [role, difficulty])

  return (
    <div className="page">
      <h1>Interview Prep</h1>
      <p>Role-specific questions from Supabase (Step 7). Filter by difficulty.</p>

      <div className="interview-filters">
        <label>
          <span>Role</span>
          <select value={role} onChange={(e) => setRole(e.target.value)}>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r}</option>
            ))}
          </select>
        </label>
        <label>
          <span>Difficulty</span>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value === "all" ? "all" : Number(e.target.value))}>
            <option value="all">All</option>
            {DIFFICULTIES.map((d) => (
              <option key={d} value={d}>{d} (e.g. {d === 1 ? "Easy" : d === 2 ? "Medium" : "Hard"})</option>
            ))}
          </select>
        </label>
      </div>

      {error && <div className="status error"><p>{error}</p><p className="detail">Run supabase/interview-questions.sql in SQL Editor.</p></div>}

      {loading && <p>Loading questions…</p>}
      {!loading && !error && (
        <div className="interview-list">
          <h2>Questions ({questions.length})</h2>
          {questions.length === 0 ? (
            <p>No questions found. Seed interview_questions table.</p>
          ) : (
            <ul>
              {questions.map((q) => (
                <li key={q.id} className="interview-item">
                  <span className="interview-item__diff">L{q.difficulty_level}</span>
                  <p className="interview-item__text">{q.question_text}</p>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
