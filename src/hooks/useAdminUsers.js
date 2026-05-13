import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function countByUserId(rows, onlyWhen) {
  return (rows ?? []).reduce((accumulator, row) => {
    if (!row.user_id || (onlyWhen && !onlyWhen(row))) {
      return accumulator
    }

    accumulator[row.user_id] = (accumulator[row.user_id] ?? 0) + 1
    return accumulator
  }, {})
}

async function fetchAdminUsers() {
  if (!supabase) {
    return []
  }

  const [
    { data: users, error: userError },
    { data: appointments, error: appointmentError },
    { data: orders, error: orderError },
    { data: memberships, error: membershipError },
    { data: trainings, error: trainingError },
  ] = await Promise.all([
    supabase.from('users').select('*').order('created_at', { ascending: false }),
    supabase.from('appointments').select('user_id'),
    supabase.from('fashion_orders').select('user_id'),
    supabase.from('memberships').select('user_id, status'),
    supabase.from('training_registrations').select('user_id'),
  ])

  if (userError || appointmentError || orderError || membershipError || trainingError) {
    throw userError ?? appointmentError ?? orderError ?? membershipError ?? trainingError
  }

  const appointmentCounts = countByUserId(appointments)
  const orderCounts = countByUserId(orders)
  const membershipCounts = countByUserId(memberships, (membership) => membership.status === 'active')
  const trainingCounts = countByUserId(trainings)

  return (users ?? []).map((user) => ({
    ...user,
    appointmentCount: appointmentCounts[user.id] ?? 0,
    membershipCount: membershipCounts[user.id] ?? 0,
    orderCount: orderCounts[user.id] ?? 0,
    trainingCount: trainingCounts[user.id] ?? 0,
  }))
}

export function useAdminUsers() {
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshUsers = useCallback(async () => {
    if (!supabase) {
      setUsers([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextUsers = await fetchAdminUsers()
      setUsers(nextUsers)
      setIsLoading(false)
      return nextUsers
    } catch (loadError) {
      console.warn('Unable to load users', loadError)
      setUsers([])
      setError('Unable to load users right now.')
      setIsLoading(false)
      return []
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadUsers = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextUsers = await fetchAdminUsers()

        if (!isMounted) {
          return
        }

        setUsers(nextUsers)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load users', loadError)
        setUsers([])
        setError('Unable to load users right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadUsers()

    return () => {
      isMounted = false
    }
  }, [])

  const updateUserRole = async (userId, role) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(userId)

    const { error: updateError } = await supabase.from('users').update({ role }).eq('id', userId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setUsers((current) =>
      current.map((user) =>
        user.id === userId
          ? {
              ...user,
              role,
            }
          : user,
      ),
    )
  }

  return {
    error,
    isLoading,
    refreshUsers,
    updateUserRole,
    updatingId,
    users,
  }
}