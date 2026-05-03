import { Outlet } from 'react-router-dom'
import { Nav } from './Nav'
import { Footer } from './Footer'
import './Nav.css'

export function Layout() {
  return (
    <>
      {/* Skip-to-content link for accessibility and SEO landmark */}
      <a
        href="#main-content"
        style={{
          position: 'absolute',
          top: '-100px',
          left: '1rem',
          zIndex: 9999,
          padding: '0.5rem 1rem',
          background: 'var(--fg)',
          color: 'var(--bg)',
          borderRadius: '4px',
          fontWeight: 600,
          textDecoration: 'none',
          transition: 'top 0.2s',
        }}
        onFocus={(e) => { e.currentTarget.style.top = '1rem' }}
        onBlur={(e) => { e.currentTarget.style.top = '-100px' }}
      >
        Skip to main content
      </a>

      <header role="banner">
        <Nav />
      </header>

      <main id="main-content" role="main">
        <Outlet />
      </main>

      <Footer />
    </>
  )
}

