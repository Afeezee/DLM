import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function sumAmount(rows) {
  return (rows ?? []).reduce((total, row) => total + Number(row.amount ?? row.total_amount ?? 0), 0)
}

async function fetchAdminAnalytics() {
  if (!supabase) {
    return null
  }

  const [
    { data: users, error: userError },
    { data: appointments, error: appointmentError },
    { data: memberships, error: membershipError },
    { data: payments, error: paymentError },
    { data: adverts, error: advertError },
    { data: trainings, error: trainingError },
    { data: fashionOrders, error: fashionOrderError },
  ] = await Promise.all([
    supabase.from('users').select('id, created_at'),
    supabase.from('appointments').select('id, created_at, status, price_paid'),
    supabase.from('memberships').select('id, status, created_at'),
    supabase.from('payments').select('id, amount, payment_type, status, created_at'),
    supabase.from('advert_submissions').select('id, status, created_at'),
    supabase.from('training_registrations').select('id, registration_date'),
    supabase.from('fashion_orders').select('id, total_amount, created_at'),
  ])

  if (userError || appointmentError || membershipError || paymentError || advertError || trainingError || fashionOrderError) {
    throw userError ?? appointmentError ?? membershipError ?? paymentError ?? advertError ?? trainingError ?? fashionOrderError
  }

  const successfulPayments = (payments ?? []).filter((payment) => payment.status === 'success')

  return {
    activeMemberships: (memberships ?? []).filter((membership) => membership.status === 'active').length,
    advertsPending: (adverts ?? []).filter((advert) => advert.status === 'pending').length,
    appointmentsPending: (appointments ?? []).filter((appointment) => appointment.status === 'pending').length,
    fashionRevenue: sumAmount(fashionOrders),
    monthlyRevenue: sumAmount(successfulPayments),
    totalAppointments: appointments?.length ?? 0,
    totalTrainings: trainings?.length ?? 0,
    totalUsers: users?.length ?? 0,
  }
}

export function useAdminAnalytics() {
  const [analytics, setAnalytics] = useState(null)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))

  useEffect(() => {
    let isMounted = true

    const loadAnalytics = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextAnalytics = await fetchAdminAnalytics()

        if (!isMounted) {
          return
        }

        setAnalytics(nextAnalytics)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load analytics', loadError)
        setAnalytics(null)
        setError('Unable to load analytics right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadAnalytics()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    analytics,
    error,
    isLoading,
  }
}