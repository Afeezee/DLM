import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function fetchAdminAppointments() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('appointments')
    .select(
      'id, addon_photobooth, address, created_at, date, notes, paystack_reference, price_paid, service_type, status, time_slot, user:users(name, email, phone), service:services(name)',
    )
    .order('date', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useAdminAppointments() {
  const [appointments, setAppointments] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshAppointments = useCallback(async () => {
    if (!supabase) {
      setAppointments([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextAppointments = await fetchAdminAppointments()
      setAppointments(nextAppointments)
      setIsLoading(false)
      return nextAppointments
    } catch (loadError) {
      console.warn('Unable to load admin appointments', loadError)
      setAppointments([])
      setError('Unable to load appointments right now.')
      setIsLoading(false)
      return []
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadAppointments = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextAppointments = await fetchAdminAppointments()

        if (!isMounted) {
          return
        }

        setAppointments(nextAppointments)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load admin appointments', loadError)
        setAppointments([])
        setError('Unable to load appointments right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadAppointments()

    return () => {
      isMounted = false
    }
  }, [])

  const updateAppointmentStatus = async (appointmentId, status) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(appointmentId)

    const { error: updateError } = await supabase
      .from('appointments')
      .update({ status })
      .eq('id', appointmentId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setAppointments((current) =>
      current.map((appointment) =>
        appointment.id === appointmentId
          ? {
              ...appointment,
              status,
            }
          : appointment,
      ),
    )
  }

  return {
    appointments,
    error,
    isLoading,
    refreshAppointments,
    updateAppointmentStatus,
    updatingId,
  }
}