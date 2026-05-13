import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

async function fetchUserAppointments(userId) {
  if (!supabase || !userId) {
    return []
  }

  const { data, error } = await supabase
    .from('appointments')
    .select(
      'id, addon_photobooth, address, created_at, date, notes, paystack_reference, price_paid, service_type, status, time_slot, service:services(id, name, duration_mins)',
    )
    .eq('user_id', userId)
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useUserAppointments() {
  const { user } = useAuth()
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(user && supabase))

  const refreshAppointments = useCallback(async () => {
    if (!supabase || !user) {
      setAppointments([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextAppointments = await fetchUserAppointments(user.id)
      setAppointments(nextAppointments)
      setIsLoading(false)
      return nextAppointments
    } catch (loadError) {
      console.warn('Unable to load user appointments', loadError)
      setAppointments([])
      setError('Unable to load your appointments right now.')
      setIsLoading(false)
      return []
    }
  }, [user])

  useEffect(() => {
    let isMounted = true

    const loadAppointments = async () => {
      if (!supabase || !user) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextAppointments = await fetchUserAppointments(user.id)

        if (!isMounted) {
          return
        }

        setAppointments(nextAppointments)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load user appointments', loadError)
        setAppointments([])
        setError('Unable to load your appointments right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadAppointments()

    return () => {
      isMounted = false
    }
  }, [user])

  return {
    appointments,
    error,
    isLoading,
    refreshAppointments,
  }
}