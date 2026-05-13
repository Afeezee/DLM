import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

async function fetchTrainingRegistrations(userId) {
  if (!supabase || !userId) {
    return []
  }

  const { data, error } = await supabase
    .from('training_registrations')
    .select('*')
    .eq('user_id', userId)
    .order('registration_date', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useTrainingRegistrations() {
  const { user } = useAuth()
  const [registrations, setRegistrations] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(user && supabase))
  const [isRegistering, setIsRegistering] = useState(false)

  const refreshRegistrations = useCallback(async () => {
    if (!supabase || !user) {
      setRegistrations([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextRegistrations = await fetchTrainingRegistrations(user.id)
      setRegistrations(nextRegistrations)
      setIsLoading(false)
      return nextRegistrations
    } catch (loadError) {
      console.warn('Unable to load training registrations', loadError)
      setRegistrations([])
      setError('Unable to load your training registrations right now.')
      setIsLoading(false)
      return []
    }
  }, [user])

  useEffect(() => {
    let isMounted = true

    const loadRegistrations = async () => {
      if (!supabase || !user) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextRegistrations = await fetchTrainingRegistrations(user.id)

        if (!isMounted) {
          return
        }

        setRegistrations(nextRegistrations)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load training registrations', loadError)
        setRegistrations([])
        setError('Unable to load your training registrations right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadRegistrations()

    return () => {
      isMounted = false
    }
  }, [user])

  const registerForTraining = async (programmeName) => {
    if (!supabase || !user) {
      throw new Error('Sign in before registering for a training programme.')
    }

    setIsRegistering(true)

    const { error: registrationError } = await supabase.from('training_registrations').upsert(
      {
        programme_name: programmeName,
        status: 'registered',
        user_id: user.id,
      },
      {
        onConflict: 'user_id,programme_name',
      },
    )

    setIsRegistering(false)

    if (registrationError) {
      throw registrationError
    }

    const nextRegistrations = await fetchTrainingRegistrations(user.id)
    setRegistrations(nextRegistrations)
    return nextRegistrations
  }

  return {
    error,
    isLoading,
    isRegistering,
    refreshRegistrations,
    registerForTraining,
    registrations,
  }
}