/**
 * Fetch coding challenges by role and submit attempts to user_coding_attempts.
 */
import { useState, useEffect, useCallback } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from './useAuth'

export interface CodingChallenge {
  id: string
  title: string
  description: string
  difficulty: string
  role: string
  category: string
  starter_code: string
  solution_code: string
  test_cases: unknown
  hints: string[] | unknown
  time_limit_minutes: number
  company_tags: string[] | null
}

export interface UserCodingAttempt {
  id: string
  challenge_id: string
  submitted_code: string
  passed: boolean
  time_spent_seconds: number
  attempted_at: string
}

export function useCodingChallenges(role: string) {
  const { user } = useAuth()
  const [challenges, setChallenges] = useState<CodingChallenge[]>([])
  const [attempts, setAttempts] = useState<Record<string, UserCodingAttempt>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchChallenges = useCallback(async () => {
    if (!role) {
      setChallenges([])
      setLoading(false)
      return
    }
    setLoading(true)
    setError(null)
    try {
      if (!supabase) {
        setLoading(false)
        return
      }
      const { data, error: err } = await supabase
        .from('coding_challenges')
        .select('*')
        .eq('role', role)
        .order('difficulty', { ascending: true })

      if (err) throw err
      setChallenges((data as CodingChallenge[]) ?? [])
    } catch (e) {
      setError(e instanceof Error ? e.message : String(e))
      setChallenges([])
    } finally {
      setLoading(false)
    }
  }, [role])

  const fetchAttempts = useCallback(async () => {
    if (!user?.id) return
    if (!supabase) return
    try {
      const { data, error: err } = await supabase
        .from('user_coding_attempts')
        .select('id, challenge_id, submitted_code, passed, time_spent_seconds, attempted_at')
        .eq('user_id', user.id)

      if (err) throw err
      const byChallenge: Record<string, UserCodingAttempt> = {}
      for (const row of data ?? []) {
        byChallenge[(row as UserCodingAttempt).challenge_id] = row as UserCodingAttempt
      }
      setAttempts(byChallenge)
    } catch {
      setAttempts({})
    }
  }, [user?.id])

  useEffect(() => {
    fetchChallenges()
  }, [fetchChallenges])

  useEffect(() => {
    fetchAttempts()
  }, [fetchAttempts])

  const refresh = useCallback(() => {
    fetchChallenges()
    fetchAttempts()
  }, [fetchChallenges, fetchAttempts])

  const submitAttempt = useCallback(
    async (challengeId: string, submittedCode: string, timeSpentSeconds: number) => {
      if (!user?.id || !supabase) return { error: 'Not authenticated' }
      try {
        const { error: err } = await supabase.from('user_coding_attempts').insert({
          user_id: user.id,
          challenge_id: challengeId,
          submitted_code: submittedCode,
          passed: false,
          time_spent_seconds: timeSpentSeconds,
        })
        if (err) throw err
        await fetchAttempts()
        return { error: null }
      } catch (e) {
        return { error: e instanceof Error ? e.message : String(e) }
      }
    },
    [user?.id, fetchAttempts]
  )

  return {
    challenges,
    attempts,
    loading,
    error,
    refresh,
    submitAttempt,
  }
}
