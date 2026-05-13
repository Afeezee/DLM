import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function fetchAdminTrainingRegistrations() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('training_registrations')
    .select('*, user:users(name, email, phone)')
    .order('registration_date', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useAdminTrainingRegistrations() {
  const [registrations, setRegistrations] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshRegistrations = useCallback(async () => {
    if (!supabase) {
      setRegistrations([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextRegistrations = await fetchAdminTrainingRegistrations()
      setRegistrations(nextRegistrations)
      setIsLoading(false)
      return nextRegistrations
    } catch (loadError) {
      console.warn('Unable to load training registrations', loadError)
      setRegistrations([])
      setError('Unable to load training registrations right now.')
      setIsLoading(false)
      return []
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadRegistrations = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextRegistrations = await fetchAdminTrainingRegistrations()

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
        setError('Unable to load training registrations right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadRegistrations()

    return () => {
      isMounted = false
    }
  }, [])

  const updateRegistrationStatus = async (registrationId, status) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(registrationId)

    const { error: updateError } = await supabase
      .from('training_registrations')
      .update({ status })
      .eq('id', registrationId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setRegistrations((current) =>
      current.map((registration) =>
        registration.id === registrationId
          ? {
              ...registration,
              status,
            }
          : registration,
      ),
    )
  }

  return {
    error,
    isLoading,
    refreshRegistrations,
    registrations,
    updateRegistrationStatus,
    updatingId,
  }
}