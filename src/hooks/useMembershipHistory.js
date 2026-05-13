import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

async function fetchMembershipHistory(userId) {
  if (!supabase || !userId) {
    return []
  }

  const { data, error } = await supabase
    .from('memberships')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useMembershipHistory() {
  const { user } = useAuth()
  const [history, setHistory] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(user && supabase))

  const refreshMembershipHistory = useCallback(async () => {
    if (!supabase || !user) {
      setHistory([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextHistory = await fetchMembershipHistory(user.id)
      setHistory(nextHistory)
      setIsLoading(false)
      return nextHistory
    } catch (loadError) {
      console.warn('Unable to load membership history', loadError)
      setHistory([])
      setError('Unable to load your membership history right now.')
      setIsLoading(false)
      return []
    }
  }, [user])

  useEffect(() => {
    let isMounted = true

    const loadMembershipHistory = async () => {
      if (!supabase || !user) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextHistory = await fetchMembershipHistory(user.id)

        if (!isMounted) {
          return
        }

        setHistory(nextHistory)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load membership history', loadError)
        setHistory([])
        setError('Unable to load your membership history right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadMembershipHistory()

    return () => {
      isMounted = false
    }
  }, [user])

  return {
    error,
    history,
    isLoading,
    refreshMembershipHistory,
  }
}