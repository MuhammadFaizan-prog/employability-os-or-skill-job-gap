import { Link, Outlet } from "react-router-dom"
import "../App.css"
import "./Layout.css"

export function Layout() {
  return (
    <div className="layout">
      <header className="layout__header">
        <Link to="/" className="layout__brand">EmployabilityOS</Link>
        <nav className="layout__nav">
          <Link to="/">Landing</Link>
          <Link to="/onboarding">Onboarding</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/skills">Skills</Link>
          <Link to="/roadmap">Roadmap</Link>
          <Link to="/projects">Projects</Link>
          <Link to="/resume">Resume</Link>
          <Link to="/interview">Interview</Link>
          <Link to="/profile">Profile</Link>
          <Link to="/verify">Verify</Link>
        </nav>
      </header>
      <main className="layout__main">
        <Outlet />
      </main>
    </div>
  )
}
