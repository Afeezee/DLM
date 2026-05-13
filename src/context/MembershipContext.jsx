import { useCallback, useEffect, useState } from 'react'
import { useAuth } from '../hooks/useAuth'
import { supabase } from '../lib/supabase'
import { MembershipContext } from './membership-context'

export function MembershipProvider({ children }) {
  const { user } = useAuth()
  const [activeMembership, setActiveMembership] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  const refreshMembership = useCallback(
    async (userId = user?.id) => {
      if (!supabase || !userId) {
        setActiveMembership(null)
        return null
      }

      const { data, error } = await supabase
        .from('memberships')
        .select('*')
        .eq('user_id', userId)
        .eq('status', 'active')
        .order('end_date', { ascending: false })
        .limit(1)
        .maybeSingle()

      if (error) {
        console.warn('Unable to load membership', error)
        setActiveMembership(null)
        return null
      }

      setActiveMembership(data)
      return data
    },
    [user?.id],
  )

  useEffect(() => {
    let isMounted = true

    const loadMembership = async () => {
      if (!supabase || !user) {
        if (isMounted) {
          setActiveMembership(null)
          setIsLoading(false)
        }

        return
      }

      setIsLoading(true)
      await refreshMembership(user.id)

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadMembership()

    return () => {
      isMounted = false
    }
  }, [refreshMembership, user])

  return (
    <MembershipContext.Provider
      value={{
        activeMembership,
        isMember: activeMembership?.status === 'active',
        isLoading,
        refreshMembership,
        setActiveMembership,
      }}
    >
      {children}
    </MembershipContext.Provider>
  )
}