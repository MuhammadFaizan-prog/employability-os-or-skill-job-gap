import { Link } from 'react-router-dom'

export function Dashboard() {
  return (
    <div className="page">
      <h1>Dashboard</h1>
      <p>Employability Score overview, skill progress, project completion. UI to be implemented.</p>
      <ul>
        <li><Link to="/skills">Skills</Link></li>
        <li><Link to="/roadmap">Roadmap</Link></li>
        <li><Link to="/projects">Projects</Link></li>
        <li><Link to="/resume">Resume</Link></li>
        <li><Link to="/interview">Interview</Link></li>
        <li><Link to="/profile">Profile</Link></li>
      </ul>
    </div>
  )
}
