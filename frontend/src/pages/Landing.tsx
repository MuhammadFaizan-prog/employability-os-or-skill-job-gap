import { Link } from 'react-router-dom'

export function Landing() {
  return (
    <div className="page landing">
      <h1>EmployabilityOS</h1>
      <p className="tagline">AI-Powered Career Readiness & Employability Scoring</p>
      <p>Measure and improve your job readiness with a real-time Employability Score.</p>
      <div className="landing__actions">
        <Link to="/onboarding" className="btn-verify">Get started</Link>
        <Link to="/dashboard" className="btn-verify">Dashboard</Link>
        <Link to="/verify" className="btn-verify">Verify steps 1–5</Link>
      </div>
    </div>
  )
}
