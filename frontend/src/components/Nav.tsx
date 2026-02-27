import { useState, useEffect, useRef, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth, getStoredRole } from '../hooks/useAuth'

const NAV_GROUPS = [
  {
    id: 'methodology',
    label: 'Methodology',
    items: [
      { label: 'How It Works', sub: 'Platform overview', path: '/#how-it-works' },
      { label: 'Skill–Job Gap Model', sub: 'How gaps are measured', path: '/#model' },
      { label: 'Scoring Framework', sub: 'Weight & benchmark logic', path: '/#scoring' },
      { label: 'Roadmap Logic', sub: 'How paths are sequenced', path: '/#roadmap-logic' },
    ],
  },
  {
    id: 'assessments',
    label: 'Assessments',
    items: [
      { label: 'Dashboard', sub: 'Overall readiness overview', path: '/dashboard' },
      { label: 'Skill Gap Analysis', sub: 'Measure your skill gaps', path: '/skills' },
    ],
  },
  {
    id: 'execution',
    label: 'Execution',
    items: [
      { label: 'Learning Roadmap', sub: 'Your skill progression path', path: '/roadmap' },
      { label: 'Projects', sub: 'Practice through building', path: '/projects' },
      { label: 'Progress Tracking', sub: 'See your growth over time', path: '/dashboard' },
    ],
  },
  {
    id: 'jobreadiness',
    label: 'Job Readiness',
    items: [
      { label: 'Resume Analyzer', sub: 'AI-powered resume scoring', path: '/resume' },
      { label: 'Interview Preparation', sub: 'Practice gap-aligned questions', path: '/interview' },
    ],
  },
]

const PAGE_PARENT: Record<string, string> = {
  '/dashboard': 'assessments',
  '/skills': 'assessments',
  '/roadmap': 'execution',
  '/projects': 'execution',
  '/resume': 'jobreadiness',
  '/interview': 'jobreadiness',
}

export function Nav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { isLoggedIn, signOut } = useAuth()
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [profileOpen, setProfileOpen] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerSections, setDrawerSections] = useState<Record<string, boolean>>({})
  const navRef = useRef<HTMLElement>(null)

  const loggedIn = isLoggedIn
  const roleBadge = getStoredRole().toUpperCase()

  const activeParent = PAGE_PARENT[location.pathname] || null

  const closeAll = useCallback(() => {
    setOpenDropdown(null)
    setProfileOpen(false)
  }, [])

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (navRef.current && !navRef.current.contains(e.target as Node)) closeAll()
    }
    const handleEsc = (e: KeyboardEvent) => { if (e.key === 'Escape') closeAll() }
    document.addEventListener('click', handleClick)
    document.addEventListener('keydown', handleEsc)
    return () => {
      document.removeEventListener('click', handleClick)
      document.removeEventListener('keydown', handleEsc)
    }
  }, [closeAll])

  const go = (path: string) => {
    closeAll()
    setDrawerOpen(false)
    if (path.startsWith('/#')) return
    navigate(path)
  }

  const handleBrandClick = () => {
    closeAll()
    navigate(loggedIn ? '/dashboard' : '/')
  }

  const handleLogout = async () => {
    await signOut()
    closeAll()
    navigate('/')
  }

  return (
    <>
      <nav className="nav" ref={navRef}>
        <div className="nav-inner">
          <button className="nav-brand" onClick={handleBrandClick}>
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="6" fill="var(--fg)" />
              <path d="M7 18 L11 10 L14 15 L17 11 L21 18" stroke="var(--bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
              <circle cx="21" cy="10" r="2" fill="var(--bg)" />
            </svg>
            Skill–Job Gap
          </button>

          <div className="nav-center">
            {NAV_GROUPS.map(g => (
              <div key={g.id} className={`nav-item ${openDropdown === g.id ? 'open' : ''}`}>
                <button
                  className={`nav-trigger ${activeParent === g.id ? 'nav-active' : ''}`}
                  onClick={(e) => { e.stopPropagation(); setOpenDropdown(openDropdown === g.id ? null : g.id) }}
                >
                  {g.label}
                  <svg className="nav-trigger-chevron" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
                </button>
                <div className="nav-dropdown" role="menu">
                  {g.items.map(item => (
                    <button key={item.label} className="nav-dropdown-item" role="menuitem" onClick={() => go(item.path)}>
                      <div>
                        <div className="nav-dropdown-item-label">{item.label}</div>
                        <div className="nav-dropdown-item-sub">{item.sub}</div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <div className="nav-item">
              <button className="nav-link" onClick={() => go('/#pricing')}>Pricing</button>
            </div>
          </div>

          <div className="nav-right">
            {!loggedIn ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <button className="nav-signin" onClick={() => go('/login')}>Sign In</button>
                <button className="nav-cta" onClick={() => go('/signup')}>Get Started</button>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <button className="nav-role-badge" onClick={() => go('/onboarding')}>{roleBadge}</button>
                <div className={`nav-profile-wrap ${profileOpen ? 'open' : ''}`}>
                  <button className="nav-profile-btn" onClick={(e) => { e.stopPropagation(); setProfileOpen(!profileOpen) }}>
                    <svg width="15" height="15" fill="none" stroke="var(--fg)" strokeWidth="2" viewBox="0 0 24 24"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></svg>
                  </button>
                  <div className="nav-profile-dropdown" role="menu">
                    <button className="nav-profile-item" onClick={() => go('/profile')}>Profile</button>
                    <div style={{ height: 1, background: 'var(--gray-mid)', margin: '0.3rem 0' }} />
                    <button className="nav-profile-item" style={{ color: 'var(--danger)' }} onClick={handleLogout}>Log out</button>
                  </div>
                </div>
              </div>
            )}
            <button className="nav-hamburger" onClick={() => setDrawerOpen(true)} aria-label="Open menu">
              <span /><span /><span />
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <div className={`nav-drawer ${drawerOpen ? 'open' : ''}`} role="dialog" aria-modal="true">
        <div className="nav-drawer-overlay" onClick={() => setDrawerOpen(false)} />
        <div className="nav-drawer-panel">
          <div className="nav-drawer-header">
            <div className="nav-drawer-brand">Skill–Job Gap</div>
            <button className="nav-drawer-close" onClick={() => setDrawerOpen(false)}>✕</button>
          </div>
          {NAV_GROUPS.map(g => (
            <div key={g.id} className={`nav-drawer-section ${drawerSections[g.id] ? 'open' : ''}`}>
              <button className="nav-drawer-section-btn" onClick={() => setDrawerSections(s => ({ ...s, [g.id]: !s[g.id] }))}>
                {g.label}
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="6 9 12 15 18 9" /></svg>
              </button>
              <div className="nav-drawer-children">
                {g.items.map(item => (
                  <button key={item.label} className="nav-drawer-child" onClick={() => go(item.path)}>{item.label}</button>
                ))}
              </div>
            </div>
          ))}
          <div className="nav-drawer-auth">
            {!loggedIn ? (
              <>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => go('/login')}>Sign In</button>
                <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => go('/signup')}>Get Started</button>
              </>
            ) : (
              <>
                <button className="btn btn-outline" style={{ width: '100%' }} onClick={() => go('/profile')}>Profile</button>
                <button className="btn btn-outline" style={{ width: '100%', color: 'var(--danger)', borderColor: 'var(--danger)' }} onClick={handleLogout}>Log out</button>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
