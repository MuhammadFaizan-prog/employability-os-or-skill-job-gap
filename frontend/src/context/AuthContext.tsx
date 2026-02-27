import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'
import { supabase } from '../lib/supabase'
import { setStoredRole } from '../lib/roleStorage'
import type { User, Session } from '@supabase/supabase-js'

export interface UserProfile {
  id: string
  email: string
  full_name: string
  avatar_url: string
  bio: string
  role: string
  created_at: string
  updated_at: string
}

interface AuthContextValue {
  user: User | null
  session: Session | null
  profile: UserProfile | null
  loading: boolean
  isLoggedIn: boolean
  signIn: (email: string, password: string) => Promise<{ error: string | null }>
  signUp: (email: string, password: string, fullName?: string) => Promise<{ error: string | null; needsConfirmation?: boolean }>
  signInWithGoogle: () => Promise<{ error: string | null }>
  signOut: () => Promise<void>
  updateProfile: (updates: Partial<Pick<UserProfile, 'full_name' | 'bio' | 'avatar_url' | 'role'>>) => Promise<{ error: string | null }>
  loadProfile: (authUser: User | null) => Promise<void>
}

const AuthContext = createContext<AuthContextValue | null>(null)

async function upsertUserProfile(
  userId: string,
  email: string,
  fullName: string,
  avatarUrl?: string,
): Promise<void> {
  if (!supabase) return
  const { error } = await supabase.from('users').upsert(
    {
      id: userId,
      email,
      full_name: fullName,
      avatar_url: avatarUrl ?? '',
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' },
  )
  if (error) {
    console.warn('User profile upsert failed:', error.message)
  }
}

async function fetchUserProfile(userId: string): Promise<UserProfile | null> {
  if (!supabase) return null
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single()
  if (error || !data) return null
  return data as UserProfile
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  const loadProfile = useCallback(async (authUser: User | null) => {
    if (!authUser) {
      setProfile(null)
      return
    }
    const p = await fetchUserProfile(authUser.id)
    if (p) {
      setProfile(p)
      if (p.role) setStoredRole(p.role)
    }
  }, [])

  useEffect(() => {
    if (!supabase) {
      setLoading(false)
      return
    }

    let mounted = true
    let initialDone = false

    const markReady = () => {
      if (!initialDone && mounted) {
        initialDone = true
        setLoading(false)
      }
    }

    const timeout = setTimeout(markReady, 3000)

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, s) => {
      if (!mounted) return
      setSession(s)
      const u = s?.user ?? null
      setUser(u)

      if (!initialDone) {
        markReady()
      }

      if (u) {
        loadProfile(u).catch(() => {})
      }

      if (_event === 'SIGNED_IN' && u) {
        const meta = u.user_metadata ?? {}
        upsertUserProfile(
          u.id,
          u.email ?? '',
          meta.full_name ?? meta.name ?? '',
          meta.avatar_url ?? meta.picture ?? '',
        ).catch(() => {})
      }

      if (_event === 'SIGNED_OUT') {
        setProfile(null)
      }
    })

    return () => {
      mounted = false
      clearTimeout(timeout)
      subscription.unsubscribe()
    }
  }, [loadProfile])

  const signIn = useCallback(async (email: string, password: string) => {
    if (!supabase) return { error: 'Supabase not configured' }
    const { data, error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) return { error: error.message }
    if (data.user) await loadProfile(data.user)
    return { error: null }
  }, [loadProfile])

  const signUp = useCallback(
    async (email: string, password: string, fullName?: string) => {
      if (!supabase) return { error: 'Supabase not configured' }
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: fullName ? { data: { full_name: fullName } } : undefined,
      })
      if (error) return { error: error.message }

      const needsConfirmation = !data.session

      if (data.user && data.session) {
        await upsertUserProfile(data.user.id, email, fullName ?? '')
        await loadProfile(data.user)
      }

      return { error: null, needsConfirmation }
    },
    [loadProfile],
  )

  const signInWithGoogle = useCallback(async () => {
    if (!supabase) return { error: 'Supabase not configured' }
    try {
      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY
      if (supabaseUrl && anonKey) {
        const settingsRes = await fetch(`${supabaseUrl}/auth/v1/settings`, {
          headers: { apikey: anonKey },
        }).catch(() => null)
        if (settingsRes?.ok) {
          const settings = await settingsRes.json()
          if (!settings?.external?.google) {
            return {
              error: 'Google sign-in is not enabled for this project. Please enable the Google provider in Supabase Dashboard → Authentication → Providers, or use email/password instead.',
            }
          }
        }
      }

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/dashboard` },
      })
      if (error) return { error: error.message }
      return { error: null }
    } catch (err) {
      return { error: err instanceof Error ? err.message : 'Google sign-in failed unexpectedly.' }
    }
  }, [])

  const signOut = useCallback(async () => {
    if (!supabase) return
    await supabase.auth.signOut()
    setUser(null)
    setSession(null)
    setProfile(null)
  }, [])

  const updateProfile = useCallback(
    async (updates: Partial<Pick<UserProfile, 'full_name' | 'bio' | 'avatar_url' | 'role'>>) => {
      if (!supabase || !user) return { error: 'Not authenticated' }
      const payload: Record<string, unknown> = {
        ...updates,
        updated_at: new Date().toISOString(),
      }
      const { error } = await supabase.from('users').update(payload).eq('id', user.id)
      if (error) return { error: error.message }
      if (updates.role) setStoredRole(updates.role)
      await loadProfile(user)
      return { error: null }
    },
    [user, loadProfile],
  )

  const isLoggedIn = !!session || !!user

  return (
    <AuthContext.Provider
      value={{
        user, session, profile, loading, isLoggedIn,
        signIn, signUp, signInWithGoogle, signOut,
        updateProfile, loadProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within an AuthProvider')
  return ctx
}
