import { useCallback, useEffect, useState } from 'react'
import { AuthContext } from './auth-context'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [profile, setProfile] = useState(null)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)

  const refreshProfile = useCallback(
    async (userId = user?.id) => {
      if (!supabase || !userId) {
        setProfile(null)
        return null
      }

      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('id', userId)
        .maybeSingle()

      if (error) {
        console.warn('Unable to load profile', error)
        setProfile(null)
        return null
      }

      setProfile(data)
      return data
    },
    [user?.id],
  )

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isMounted = true

    const hydrateSession = async () => {
      setIsLoading(true)

      const {
        data: { session: activeSession },
        error,
      } = await supabase.auth.getSession()

      if (!isMounted) {
        return
      }

      if (error) {
        console.warn('Unable to restore session', error)
        setIsLoading(false)
        return
      }

      setSession(activeSession ?? null)
      setUser(activeSession?.user ?? null)

      if (activeSession?.user) {
        await refreshProfile(activeSession.user.id)
      } else {
        setProfile(null)
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void hydrateSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      if (nextSession?.user) {
        setIsLoading(true)
      }

      setSession(nextSession ?? null)
      setUser(nextSession?.user ?? null)

      if (nextSession?.user) {
        void refreshProfile(nextSession.user.id).finally(() => {
          if (isMounted) {
            setIsLoading(false)
          }
        })
      } else {
        setProfile(null)
        setIsLoading(false)
      }
    })

    return () => {
      isMounted = false
      subscription.unsubscribe()
    }
  }, [refreshProfile])

  const signOut = async () => {
    if (!supabase) {
      return
    }

    await supabase.auth.signOut()
    setProfile(null)
  }

  const signIn = async ({ email, password }) => {
    if (!supabase) {
      return {
        data: null,
        error: new Error('Supabase is not configured.'),
      }
    }

    setIsLoading(true)

    const response = await supabase.auth.signInWithPassword({ email, password })

    if (response.error || !response.data.user) {
      setIsLoading(false)
      return response
    }

    const nextProfile = await refreshProfile(response.data.user.id)
    setIsLoading(false)

    return {
      data: {
        ...response.data,
        profile: nextProfile,
      },
      error: null,
    }
  }

  const signUp = async ({ email, password, profile: profileInput }) => {
    if (!supabase) {
      return {
        data: null,
        error: new Error('Supabase is not configured.'),
      }
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: profileInput,
      },
    })

    if (error || !data.user) {
      return { data, error }
    }

    if (data.session?.user) {
      await refreshProfile(data.user.id)
    }

    return { data, error: null }
  }

  return (
    <AuthContext.Provider
      value={{
        isLoading,
        isSupabaseConfigured,
        profile,
        refreshProfile,
        session,
        signIn,
        signUp,
        signOut,
        user,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}