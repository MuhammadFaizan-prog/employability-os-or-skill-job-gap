import { useState, type FormEvent } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Login() {
  const navigate = useNavigate()
  const location = useLocation()
  const { signIn, signInWithGoogle } = useAuth()
  const redirectTo = (location.state as { from?: { pathname: string } })?.from?.pathname ?? '/dashboard'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setEmailError('')
    setPasswordError('')

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    let hasError = false

    if (!email.trim() || !emailRegex.test(email.trim())) {
      setEmailError('Please enter a valid email address.')
      hasError = true
    }

    if (!password) {
      setPasswordError('Password is required.')
      hasError = true
    }

    if (hasError) return

    setLoading(true)
    const { error } = await signIn(email.trim(), password)
    if (error) {
      setPasswordError(error)
      setLoading(false)
      return
    }
    navigate(redirectTo)
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '3rem 1.5rem 5rem',
      }}
    >
      <div style={{ width: '100%', maxWidth: 460 }}>
        {/* Trust badge */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              fontSize: '0.78rem',
              fontWeight: 600,
              color: 'var(--gray-dark)',
              border: '1px solid var(--gray-mid)',
              borderRadius: 20,
              padding: '0.3rem 0.85rem',
            }}
          >
            <CheckmarkSvg />
            Pick up where you left off
          </span>
        </div>

        {/* Card */}
        <div
          className="card"
          style={{
            border: '1px solid var(--border-color)',
            borderRadius: 'var(--radius-window)',
            boxShadow: '0 4px 24px rgba(0,0,0,0.05)',
            overflow: 'hidden',
          }}
        >
          {/* Card Header */}
          <div
            style={{
              padding: '2.25rem 2.5rem 1.75rem',
              background: 'var(--gray-light)',
              textAlign: 'center',
              borderBottom: '1px solid var(--border-color)',
            }}
          >
            <h1 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Welcome back</h1>
            <p
              style={{
                fontSize: '0.925rem',
                color: 'var(--gray-dark)',
                maxWidth: '32ch',
                margin: '0 auto',
              }}
            >
              Log in to continue your career readiness journey.
            </p>
          </div>

          {/* Form Body */}
          <div style={{ padding: '2rem 2.5rem' }}>
            <button
              type="button"
              className="btn btn-outline"
              style={{ width: '100%', marginBottom: '1.5rem', gap: '0.65rem' }}
              disabled={googleLoading}
              onClick={async () => {
                setGoogleLoading(true)
                const { error } = await signInWithGoogle()
                if (error) {
                  setPasswordError(error)
                  setGoogleLoading(false)
                }
              }}
            >
              <GoogleLogoSvg />
              {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem',
                marginBottom: '1.5rem',
              }}
            >
              <div style={{ flex: 1, height: 1, background: 'var(--gray-mid)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--gray-dark)' }}>
                or
              </span>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-mid)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label htmlFor="login-email">EMAIL ADDRESS</label>
                <input
                  id="login-email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={emailError ? { borderColor: 'var(--danger)' } : {}}
                />
                {emailError && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--danger)',
                      marginTop: '0.35rem',
                      fontWeight: 500,
                    }}
                  >
                    {emailError}
                  </div>
                )}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: '0.45rem',
                  }}
                >
                  <label htmlFor="login-password" style={{ marginBottom: 0 }}>
                    PASSWORD
                  </label>
                  <span
                    style={{
                      fontSize: '0.75rem',
                      fontWeight: 600,
                      color: 'var(--gray-dark)',
                      textDecoration: 'underline',
                      cursor: 'pointer',
                    }}
                  >
                    Forgot password?
                  </span>
                </div>
                <div style={{ position: 'relative' }}>
                  <input
                    id="login-password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    style={{
                      paddingRight: '2.75rem',
                      ...(passwordError ? { borderColor: 'var(--danger)' } : {}),
                    }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    style={{
                      position: 'absolute',
                      right: '0.75rem',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: 'var(--gray-dark)',
                      padding: 0,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {showPassword ? <EyeOffSvg /> : <EyeSvg />}
                  </button>
                </div>
                {passwordError && (
                  <div
                    style={{
                      fontSize: '0.78rem',
                      color: 'var(--danger)',
                      marginTop: '0.35rem',
                      fontWeight: 500,
                    }}
                  >
                    {passwordError}
                  </div>
                )}
              </div>

              <button
                type="submit"
                className="btn btn-primary"
                style={{
                  width: '100%',
                  padding: '0.85rem 1rem',
                  fontSize: '1rem',
                }}
                disabled={loading}
              >
                {loading ? 'Logging in...' : 'Log In'}
              </button>
            </form>
          </div>

          {/* Card Footer */}
          <div
            style={{
              padding: '1.25rem 2.5rem',
              background: 'var(--gray-light)',
              borderTop: '1px solid var(--border-color)',
              textAlign: 'center',
            }}
          >
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
              Don't have an account?{' '}
              <Link
                to="/signup"
                style={{
                  fontWeight: 600,
                  color: 'var(--fg)',
                  textDecoration: 'underline',
                }}
              >
                Sign up
              </Link>
            </p>
          </div>
        </div>

        {/* Fine print */}
        <p
          style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            color: 'var(--gray-dark)',
            marginTop: '1.25rem',
            maxWidth: 'none',
          }}
        >
          By logging in you agree to our{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span>{' '}
          and{' '}
          <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}

function CheckmarkSvg() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function GoogleLogoSvg() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </svg>
  )
}

function EyeSvg() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}

function EyeOffSvg() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}
