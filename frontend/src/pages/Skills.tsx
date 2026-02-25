import { Link } from 'react-router-dom'

export function Skills() {
  return (
    <div className="page">
      <h1>Skill Gap / Skills</h1>
      <p>Skill list with proficiency, gaps and priority skills. Step 4 logic verified from Supabase.</p>
      <p><Link to="/verify">Verify Step 4</Link> runs analysis dynamically.</p>
    </div>
  )
}
