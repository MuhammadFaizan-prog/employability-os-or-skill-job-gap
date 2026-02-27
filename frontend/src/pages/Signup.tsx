import { useState, useCallback, type FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export function Signup() {
  const navigate = useNavigate()
  const { signUp, signInWithGoogle } = useAuth()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ name?: string; email?: string; password?: string; confirm?: string }>({})
  const [showPassword1, setShowPassword1] = useState(false)
  const [showPassword2, setShowPassword2] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [showConfirmation, setShowConfirmation] = useState(false)

  const validateName = useCallback((val: string) => {
    if (!val.trim()) return 'Full name is required.'
    return undefined
  }, [])

  const validateEmail = useCallback((val: string) => {
    if (!val.trim() || !/^[^@]+@[^@]+\.[^@]+$/.test(val.trim())) return 'Please enter a valid email address.'
    return undefined
  }, [])

  const validatePassword = useCallback((val: string) => {
    if (val.length < 8) return 'Password must be at least 8 characters.'
    return undefined
  }, [])

  const validateConfirm = useCallback((val: string) => {
    if (val !== password) return 'Passwords do not match.'
    return undefined
  }, [password])

  const handleBlurName = () => setErrors(e => ({ ...e, name: validateName(name) }))
  const handleBlurEmail = () => setErrors(e => ({ ...e, email: validateEmail(email) }))
  const handleBlurPassword = () => setErrors(e => ({ ...e, password: validatePassword(password) }))
  const handleBlurConfirm = () => setErrors(e => ({ ...e, confirm: validateConfirm(confirm) }))

  const strength = (() => {
    if (!password) return null
    let score = 0
    if (password.length >= 8) score++
    if (/[0-9]/.test(password)) score++
    if (/[A-Z]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    const levels = [
      { pct: '25%', color: '#e74c3c', text: 'Weak' },
      { pct: '50%', color: '#f39c12', text: 'Fair' },
      { pct: '75%', color: '#3498db', text: 'Good' },
      { pct: '100%', color: '#27ae60', text: 'Strong' },
    ]
    return levels[Math.max(0, score - 1)]
  })()

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    const errs: typeof errors = {}
    const nErr = validateName(name)
    const eErr = validateEmail(email)
    const pErr = validatePassword(password)
    const cErr = validateConfirm(confirm)
    if (nErr) errs.name = nErr
    if (eErr) errs.email = eErr
    if (pErr) errs.password = pErr
    if (cErr) errs.confirm = cErr
    setErrors(errs)
    if (Object.keys(errs).length) return
    setLoading(true)
    const { error, needsConfirmation } = await signUp(email.trim(), password, name.trim())
    if (error) {
      setErrors({ email: error })
      setLoading(false)
      return
    }
    if (needsConfirmation) {
      setShowConfirmation(true)
      setLoading(false)
      return
    }
    navigate('/onboarding')
  }

  if (showConfirmation) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem 5rem' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <div className="card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)', textAlign: 'center' }}>
            <div style={{ padding: '3rem 2.5rem' }}>
              <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gray-light)', border: '2px solid var(--fg)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                <svg width="28" height="28" fill="none" stroke="var(--fg)" strokeWidth="2.5" viewBox="0 0 24 24"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
              </div>
              <h2 style={{ fontSize: '1.5rem', marginBottom: '0.75rem' }}>Check your email</h2>
              <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', marginBottom: '1.5rem', maxWidth: 'none' }}>
                We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account, then come back and log in.
              </p>
              <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={() => navigate('/login')}>
                Go to Login
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem 5rem' }}>
      <div style={{ width: '100%', maxWidth: 460 }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.78rem', fontWeight: 600, color: 'var(--gray-dark)', border: '1px solid var(--gray-mid)', borderRadius: 20, padding: '0.3rem 0.85rem' }}>
            <CheckmarkIcon /> Takes less than a minute
          </span>
        </div>

        <div className="card" style={{ boxShadow: '0 4px 24px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '2.25rem 2.5rem 1.75rem', borderBottom: '1px solid var(--border-color)', background: 'var(--gray-light)', textAlign: 'center' }}>
            <h1 style={{ fontSize: '1.65rem', marginBottom: '0.5rem' }}>Create your account</h1>
            <p style={{ fontSize: '0.925rem', color: 'var(--gray-dark)', maxWidth: '34ch', margin: '0 auto' }}>Start measuring your skill–job gap and build your personalized roadmap.</p>
          </div>

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
                  setErrors({ email: error })
                  setGoogleLoading(false)
                }
              }}
            >
              <GoogleIcon /> {googleLoading ? 'Redirecting…' : 'Continue with Google'}
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-mid)' }} />
              <span style={{ fontSize: '0.78rem', fontWeight: 500, color: 'var(--gray-dark)' }}>or</span>
              <div style={{ flex: 1, height: 1, background: 'var(--gray-mid)' }} />
            </div>

            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: '1.1rem' }}>
                <label>Full Name</label>
                <input
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={e => { setName(e.target.value); setErrors(err => { const n = { ...err }; delete n.name; return n }) }}
                  onBlur={handleBlurName}
                  style={errors.name ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.name && <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.35rem', fontWeight: 500 }}>{errors.name}</div>}
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label>Email Address</label>
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setErrors(err => { const n = { ...err }; delete n.email; return n }) }}
                  onBlur={handleBlurEmail}
                  style={errors.email ? { borderColor: 'var(--danger)' } : {}}
                />
                {errors.email && <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.35rem', fontWeight: 500 }}>{errors.email}</div>}
              </div>

              <div style={{ marginBottom: '1.1rem' }}>
                <label>Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword1 ? 'text' : 'password'}
                    placeholder="••••••••"
                    value={password}
                    onChange={e => { setPassword(e.target.value); setErrors(err => { const n = { ...err }; delete n.password; delete n.confirm; return n }) }}
                    onBlur={handleBlurPassword}
                    style={{ paddingRight: '2.75rem', ...(errors.password ? { borderColor: 'var(--danger)' } : {}) }}
                  />
                  <button type="button" onClick={() => setShowPassword1(!showPassword1)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-dark)', padding: 0 }}>
                    <EyeIcon />
                  </button>
                </div>
                {password.length > 0 && strength && (
                  <div style={{ marginTop: '0.6rem' }}>
                    <div style={{ height: 4, background: 'var(--gray-mid)', borderRadius: 20, overflow: 'hidden', marginBottom: '0.35rem' }}>
                      <div style={{ height: '100%', width: strength.pct, background: strength.color, borderRadius: 20, transition: 'width 0.3s' }} />
                    </div>
                    <span style={{ fontSize: '0.72rem', fontWeight: 600, color: strength.color }}>{strength.text}</span>
                    <span style={{ fontSize: '0.72rem', color: 'var(--gray-dark)' }}> · min. 8 chars, 1 number</span>
                  </div>
                )}
                {errors.password && <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.35rem', fontWeight: 500 }}>{errors.password}</div>}
              </div>

              <div style={{ marginBottom: '1.5rem' }}>
                <label>Confirm Password</label>
                <div style={{ position: 'relative' }}>
                  <input
                    type={showPassword2 ? 'text' : 'password'}
                    placeholder="Re-enter your password"
                    value={confirm}
                    onChange={e => { setConfirm(e.target.value); setErrors(err => { const n = { ...err }; delete n.confirm; return n }) }}
                    onBlur={handleBlurConfirm}
                    style={{ paddingRight: '2.75rem', ...(errors.confirm ? { borderColor: 'var(--danger)' } : {}) }}
                  />
                  <button type="button" onClick={() => setShowPassword2(!showPassword2)} style={{ position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--gray-dark)', padding: 0 }}>
                    <EyeIcon />
                  </button>
                </div>
                {errors.confirm && <div style={{ fontSize: '0.78rem', color: 'var(--danger)', marginTop: '0.35rem', fontWeight: 500 }}>{errors.confirm}</div>}
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.85rem 1rem', fontSize: '1rem' }} disabled={loading}>
                {loading ? 'Creating account…' : 'Create Account'}
              </button>
            </form>
          </div>

          <div style={{ padding: '1.25rem 2.5rem', borderTop: '1px solid var(--border-color)', background: 'var(--gray-light)', textAlign: 'center' }}>
            <p style={{ fontSize: '0.875rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => navigate('/login')} style={{ background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'var(--font-main)', fontSize: '0.875rem', fontWeight: 600, color: 'var(--fg)', textDecoration: 'underline', padding: 0 }}>Log in</button>
            </p>
          </div>
        </div>

        <p style={{ textAlign: 'center', fontSize: '0.75rem', color: 'var(--gray-dark)', marginTop: '1.25rem', maxWidth: 'none' }}>
          By signing up you agree to our <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Terms of Service</span> and <span style={{ textDecoration: 'underline', cursor: 'pointer' }}>Privacy Policy</span>.
        </p>
      </div>
    </div>
  )
}

function CheckmarkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  )
}

function GoogleIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  )
}
