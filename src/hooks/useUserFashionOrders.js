import { useCallback, useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { supabase } from '../lib/supabase'

async function fetchUserFashionOrders(userId) {
  if (!supabase || !userId) {
    return []
  }

  const { data, error } = await supabase
    .from('fashion_orders')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useUserFashionOrders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(user && supabase))

  const refreshOrders = useCallback(async () => {
    if (!supabase || !user) {
      setOrders([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextOrders = await fetchUserFashionOrders(user.id)
      setOrders(nextOrders)
      setIsLoading(false)
      return nextOrders
    } catch (loadError) {
      console.warn('Unable to load fashion orders', loadError)
      setOrders([])
      setError('Unable to load your fashion orders right now.')
      setIsLoading(false)
      return []
    }
  }, [user])

  useEffect(() => {
    let isMounted = true

    const loadOrders = async () => {
      if (!supabase || !user) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextOrders = await fetchUserFashionOrders(user.id)

        if (!isMounted) {
          return
        }

        setOrders(nextOrders)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load fashion orders', loadError)
        setOrders([])
        setError('Unable to load your fashion orders right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadOrders()

    return () => {
      isMounted = false
    }
  }, [user])

  return {
    error,
    isLoading,
    orders,
    refreshOrders,
  }
}