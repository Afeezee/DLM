import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function fetchAdminMembershipData() {
  if (!supabase) {
    return { memberships: [], users: [] }
  }

  const [{ data: membershipRows, error: membershipError }, { data: userRows, error: userError }] =
    await Promise.all([
      supabase
        .from('memberships')
        .select('*, user:users(id, name, email)')
        .order('created_at', { ascending: false }),
      supabase.from('users').select('id, name, email').order('name', { ascending: true }),
    ])

  if (membershipError || userError) {
    throw membershipError ?? userError
  }

  return {
    memberships: membershipRows ?? [],
    users: userRows ?? [],
  }
}

export function useAdminMemberships() {
  const [memberships, setMemberships] = useState([])
  const [users, setUsers] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshMemberships = useCallback(async () => {
    if (!supabase) {
      setMemberships([])
      setUsers([])
      setIsLoading(false)
      return { memberships: [], users: [] }
    }

    setIsLoading(true)
    setError('')

    try {
      const nextState = await fetchAdminMembershipData()
      setMemberships(nextState.memberships)
      setUsers(nextState.users)
      setIsLoading(false)
      return nextState
    } catch (loadError) {
      console.warn('Unable to load memberships', loadError)
      setMemberships([])
      setUsers([])
      setError('Unable to load memberships right now.')
      setIsLoading(false)
      return { memberships: [], users: [] }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadMemberships = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextState = await fetchAdminMembershipData()

        if (!isMounted) {
          return
        }

        setMemberships(nextState.memberships)
        setUsers(nextState.users)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load memberships', loadError)
        setMemberships([])
        setUsers([])
        setError('Unable to load memberships right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadMemberships()

    return () => {
      isMounted = false
    }
  }, [])

  const updateMembershipStatus = async (membershipId, status) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(membershipId)

    const { error: updateError } = await supabase
      .from('memberships')
      .update({ status })
      .eq('id', membershipId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setMemberships((current) =>
      current.map((membership) =>
        membership.id === membershipId
          ? {
              ...membership,
              status,
            }
          : membership,
      ),
    )
  }

  const grantMembership = async (payload) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(payload.userId)

    const { data, error: insertError } = await supabase
      .from('memberships')
      .insert({
        end_date: payload.endDate,
        plan: payload.plan,
        start_date: payload.startDate,
        status: payload.status,
        user_id: payload.userId,
      })
      .select('*, user:users(id, name, email)')
      .single()

    setUpdatingId('')

    if (insertError) {
      throw insertError
    }

    setMemberships((current) => [data, ...current])
    return data
  }

  return {
    error,
    grantMembership,
    isLoading,
    memberships,
    refreshMemberships,
    updateMembershipStatus,
    updatingId,
    users,
  }
}