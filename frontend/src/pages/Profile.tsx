import { useState, useEffect, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth, getStoredRole } from '../hooks/useAuth'
import { ROLE_IDS } from '../constants/scoreWeights'
import { supabase } from '../lib/supabase'

export function Profile() {
  const navigate = useNavigate()
  const { user, profile, signOut, updateProfile } = useAuth()
  const currentRole = getStoredRole()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [bio, setBio] = useState('')
  const [selectedRole, setSelectedRole] = useState('')
  const [showRoleWarning, setShowRoleWarning] = useState(false)
  const [saveConfirm, setSaveConfirm] = useState(false)
  const [saveError, setSaveError] = useState('')
  const [saving, setSaving] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [avatarUploading, setAvatarUploading] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  useEffect(() => {
    if (profile) {
      setName(profile.full_name || user?.user_metadata?.full_name || '')
      setEmail(profile.email || user?.email || '')
      setBio(profile.bio || '')
    } else if (user) {
      setName(user.user_metadata?.full_name ?? '')
      setEmail(user.email ?? '')
    }
  }, [profile, user])

  const handleSave = async () => {
    setSaving(true)
    setSaveError('')
    const { error } = await updateProfile({
      full_name: name.trim(),
      bio: bio.trim(),
    })
    setSaving(false)
    if (error) {
      setSaveError(error)
      return
    }
    setSaveConfirm(true)
    setTimeout(() => setSaveConfirm(false), 2500)
  }

  const handleRoleSelect = (value: string) => {
    setSelectedRole(value)
    setShowRoleWarning(value !== '')
  }

  const handleRoleChange = async () => {
    if (!selectedRole) return
    setSaving(true)
    const { error } = await updateProfile({ role: selectedRole })
    setSaving(false)
    if (error) {
      setSaveError(error)
      return
    }
    localStorage.removeItem('employabilityos_user_skills')
    localStorage.removeItem('employabilityos_user_projects')
    window.location.reload()
  }

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file || !user || !supabase) return
    const allowed = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
    if (!allowed.includes(file.type)) {
      setSaveError('Please choose a JPEG, PNG, WebP, or GIF image.')
      return
    }
    if (file.size > 2 * 1024 * 1024) {
      setSaveError('Image must be under 2 MB.')
      return
    }
    setAvatarUploading(true)
    setSaveError('')
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${user.id}/avatar.${ext}`
      const { error: uploadErr } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
      if (uploadErr) throw uploadErr
      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(path)
      const { error: profileErr } = await updateProfile({ avatar_url: urlData.publicUrl })
      if (profileErr) throw new Error(profileErr)
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Avatar upload failed')
    } finally {
      setAvatarUploading(false)
      e.target.value = ''
    }
  }

  const handleDeleteConfirm = async () => {
    if (!user?.id || !supabase) {
      setShowDeleteModal(false)
      await signOut()
      navigate('/')
      return
    }
    setDeleteError('')
    try {
      const { error } = await supabase.rpc('delete_user_data', { target_user_id: user.id })
      if (error) throw error
    } catch (err) {
      setDeleteError(err instanceof Error ? err.message : 'Failed to delete data')
      return
    }
    setShowDeleteModal(false)
    await signOut()
    navigate('/')
  }

  const roles = [...ROLE_IDS]

  return (
    <div style={{ minHeight: '100vh', paddingBottom: 80 }}>
      <div
        className="container"
        style={{
          maxWidth: 780,
          marginLeft: 'auto',
          marginRight: 'auto',
          paddingTop: '3rem',
          paddingLeft: '2rem',
          paddingRight: '2rem',
        }}
      >
        {/* Header */}
        <header style={{ marginBottom: '3rem' }}>
          <button
            type="button"
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'none',
              border: 'none',
              fontFamily: 'var(--font-main)',
              fontSize: '0.9rem',
              color: 'var(--gray-dark)',
              cursor: 'pointer',
              marginBottom: '1rem',
              padding: 0,
              textDecoration: 'underline',
              textUnderlineOffset: 4,
            }}
          >
            ← Back to Dashboard
          </button>
          <h1 style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>Profile & Settings</h1>
          <p style={{ fontSize: '0.95rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
            Manage your account information, role, and subscription.
          </p>
        </header>

        {/* User Information */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <span className="card-header-label">USER INFORMATION</span>
          </div>
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'row', gap: '2rem', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.5rem' }}>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/gif"
                onChange={handleAvatarChange}
                style={{ display: 'none' }}
              />
              <div
                style={{
                  width: 80,
                  height: 80,
                  borderRadius: '50%',
                  background: 'var(--gray-light)',
                  border: '1px solid var(--border-color)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  overflow: 'hidden',
                }}
              >
                {(profile?.avatar_url || user?.user_metadata?.avatar_url) ? (
                  <img
                    src={profile?.avatar_url || user?.user_metadata?.avatar_url}
                    alt="Avatar"
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                ) : (
                  <svg width="36" height="36" fill="none" stroke="var(--gray-dark)" strokeWidth="1.5" viewBox="0 0 24 24">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.9rem' }}
                disabled={avatarUploading}
                onClick={() => fileInputRef.current?.click()}
              >
                {avatarUploading ? 'Uploading...' : 'Change'}
              </button>
            </div>
            <div style={{ flex: 1, minWidth: 280 }}>
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '1.25rem',
                  marginBottom: '1.25rem',
                }}
              >
                <div>
                  <label htmlFor="profile-name">Full Name</label>
                  <input
                    id="profile-name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>
                <div>
                  <label htmlFor="profile-email">Email</label>
                  <input
                    id="profile-email"
                    type="email"
                    value={email}
                    readOnly
                    style={{ opacity: 0.6, cursor: 'not-allowed' }}
                    title="Email is managed through your authentication provider"
                  />
                </div>
              </div>
              <div style={{ marginBottom: '1.25rem' }}>
                <label htmlFor="profile-bio">Bio (optional)</label>
                <textarea
                  id="profile-bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  rows={2}
                />
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button type="button" className="btn btn-primary" onClick={handleSave} disabled={saving}>
                  {saving ? 'Saving…' : 'Save Changes'}
                </button>
                {saveConfirm && (
                  <span style={{ fontSize: '0.9rem', color: 'var(--gray-dark)', fontWeight: 500 }}>
                    ✓ Saved to Supabase
                  </span>
                )}
                {saveError && (
                  <span style={{ fontSize: '0.85rem', color: 'var(--danger)', fontWeight: 500 }}>
                    {saveError}
                  </span>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Role Management */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <span className="card-header-label">ROLE MANAGEMENT</span>
          </div>
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                border: '1px solid var(--border-color)',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--gray-light)',
                padding: '1rem 1.25rem',
                marginBottom: '1.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
              }}
            >
              <svg
                width="20"
                height="20"
                fill="none"
                stroke="var(--gray-dark)"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <path d="M16 18l6-6-6-6M8 6l-6 6 6 6" />
              </svg>
              <div>
                <span
                  style={{
                    display: 'block',
                    fontSize: '0.7rem',
                    fontWeight: 700,
                    letterSpacing: '0.06em',
                    color: 'var(--gray-dark)',
                    textTransform: 'uppercase',
                    marginBottom: '0.25rem',
                  }}
                >
                  Current Role
                </span>
                <span style={{ fontWeight: 700, fontSize: '1rem' }}>{currentRole}</span>
                <span
                  className="badge badge-filled"
                  style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}
                >
                  ACTIVE
                </span>
              </div>
            </div>
            <div style={{ marginBottom: '1rem' }}>
              <label htmlFor="profile-role">Switch to a Different Role</label>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-end', marginTop: '0.5rem' }}>
                <select
                  id="profile-role"
                  value={selectedRole}
                  onChange={(e) => handleRoleSelect(e.target.value)}
                  style={{ flex: 1 }}
                >
                  <option value="">Select a role...</option>
                  {roles.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  className="btn btn-outline"
                  disabled={!selectedRole}
                  style={{ flexShrink: 0 }}
                  onClick={handleRoleChange}
                >
                  Change Role
                </button>
              </div>
            </div>
            {showRoleWarning && (
              <div
                style={{
                  border: '1px solid var(--fg)',
                  borderRadius: 'var(--radius-sm)',
                  background: 'var(--gray-light)',
                  padding: '1rem 1.25rem',
                  display: 'flex',
                  gap: '0.75rem',
                  alignItems: 'flex-start',
                }}
              >
                <svg
                  width="20"
                  height="20"
                  fill="none"
                  stroke="var(--fg)"
                  strokeWidth="2.5"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0, marginTop: 2 }}
                >
                  <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                  <line x1="12" y1="9" x2="12" y2="13" />
                  <line x1="12" y1="17" x2="12.01" y2="17" />
                </svg>
                <p style={{ fontSize: '0.88rem', color: 'var(--gray-dark)', maxWidth: 'none', margin: 0 }}>
                  Heads up: Changing your role will reset your skill assessments and roadmap. Your score
                  history and resume analyses will be preserved.
                </p>
              </div>
            )}
          </div>
        </section>

        {/* Subscription */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <span className="card-header-label">SUBSCRIPTION</span>
          </div>
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                marginBottom: '1.5rem',
              }}
            >
              <svg
                width="24"
                height="24"
                fill="none"
                stroke="var(--fg)"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                <line x1="8" y1="21" x2="16" y2="21" />
                <line x1="12" y1="17" x2="12" y2="21" />
              </svg>
              <div>
                <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>Free Plan</span>
                <span
                  className="badge badge-filled"
                  style={{ marginLeft: '0.5rem', verticalAlign: 'middle' }}
                >
                  CURRENT
                </span>
              </div>
            </div>
            <button type="button" className="btn btn-primary" style={{ marginBottom: '2rem' }}>
              Upgrade to Pro ↗
            </button>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              {/* Free column */}
              <div
                style={{
                  border: '1px solid var(--border-color)',
                  borderRadius: 'var(--radius-window)',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ marginBottom: '1rem', fontSize: '1rem' }}>Free</h3>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    1 role track
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem' }}>
                    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    3 resume uploads/mo
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-dark)' }}>
                    <svg width="16" height="16" fill="none" stroke="var(--gray-mid)" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Peer comparison
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--gray-dark)' }}>
                    <svg width="16" height="16" fill="none" stroke="var(--gray-mid)" strokeWidth="2.5" viewBox="0 0 24 24">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                    Verified certificate
                  </li>
                </ul>
              </div>

              {/* Pro column */}
              <div
                style={{
                  background: 'var(--fg)',
                  color: 'var(--bg)',
                  borderRadius: 'var(--radius-window)',
                  padding: '1.5rem',
                }}
              >
                <h3 style={{ marginBottom: '0.25rem', fontSize: '1rem', color: 'var(--bg)' }}>Pro</h3>
                <p style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--bg)' }}>
                  $12/mo
                </p>
                <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: 0, padding: 0 }}>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--bg)' }}>
                    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Unlimited role tracks
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--bg)' }}>
                    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Unlimited resume uploads
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--bg)' }}>
                    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Peer comparison
                  </li>
                  <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.9rem', color: 'var(--bg)' }}>
                    <svg width="16" height="16" fill="none" stroke="#22c55e" strokeWidth="2.5" viewBox="0 0 24 24">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    Verified certificate
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        {/* Account Actions */}
        <section className="card" style={{ marginBottom: '2rem' }}>
          <div className="card-header">
            <span className="card-header-label">ACCOUNT ACTIONS</span>
          </div>
          <div style={{ padding: '2rem' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingBottom: '1.5rem',
                marginBottom: '1.5rem',
                borderBottom: '1px solid var(--border-color)',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="var(--fg)"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0 }}
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                  <polyline points="16 17 21 12 16 7" />
                  <line x1="21" y1="12" x2="9" y2="12" />
                </svg>
                <div>
                  <p style={{ fontWeight: 700, fontSize: '1rem', marginBottom: '0.25rem', maxWidth: 'none' }}>
                    Log Out
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                    Sign out of your account on this device.
                  </p>
                </div>
              </div>
              <button type="button" className="btn btn-outline" onClick={async () => { await signOut(); navigate('/') }}>
                Log Out
              </button>
            </div>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '1rem',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                <svg
                  width="24"
                  height="24"
                  fill="none"
                  stroke="var(--danger)"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                  style={{ flexShrink: 0 }}
                >
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                  <line x1="10" y1="11" x2="10" y2="17" />
                  <line x1="14" y1="11" x2="14" y2="17" />
                </svg>
                <div>
                  <p
                    style={{
                      fontWeight: 700,
                      fontSize: '1rem',
                      marginBottom: '0.25rem',
                      maxWidth: 'none',
                      color: 'var(--danger)',
                    }}
                  >
                    Delete Account
                  </p>
                  <p style={{ fontSize: '0.85rem', color: 'var(--gray-dark)', maxWidth: 'none' }}>
                    Permanently delete your account and all associated data.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="btn btn-outline"
                style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={() => setShowDeleteModal(true)}
              >
                Delete Account
              </button>
            </div>
          </div>
        </section>
      </div>

      {/* Delete Confirm Modal */}
      {showDeleteModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-modal-title"
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem',
          }}
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowDeleteModal(false)
          }}
        >
          <div
            className="card"
            style={{
              maxWidth: 420,
              width: '100%',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '1.25rem 1.5rem',
                borderBottom: '1px solid var(--border-color)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <h2
                id="delete-modal-title"
                style={{
                  fontSize: '1.25rem',
                  fontWeight: 700,
                  color: 'var(--danger)',
                  margin: 0,
                }}
              >
                Delete Account
              </h2>
              <button
                type="button"
                onClick={() => setShowDeleteModal(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  fontSize: '1.25rem',
                  lineHeight: 1,
                  color: 'var(--gray-dark)',
                }}
              >
                ×
              </button>
            </div>
            <div style={{ padding: '1.5rem' }}>
              <p style={{ fontWeight: 700, marginBottom: '0.5rem', maxWidth: 'none' }}>
                Are you absolutely sure?
              </p>
              <p
                style={{
                  fontSize: '0.9rem',
                  color: 'var(--gray-dark)',
                  marginBottom: '1.5rem',
                  maxWidth: 'none',
                }}
              >
                This action cannot be undone. All your data, progress, and assessment history will be
                permanently deleted.
              </p>
              {deleteError && (
                <p style={{ fontSize: '0.9rem', color: 'var(--danger)', marginBottom: '1rem' }}>{deleteError}</p>
              )}
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
                <button
                  type="button"
                  className="btn"
                  style={{
                    background: 'var(--danger)',
                    color: 'var(--bg)',
                    border: 'none',
                  }}
                  onClick={handleDeleteConfirm}
                >
                  Yes, Delete My Account
                </button>
                <button type="button" className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
