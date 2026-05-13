import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function fetchAdminAdverts() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('advert_submissions')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useAdminAdverts() {
  const [adverts, setAdverts] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshAdverts = useCallback(async () => {
    if (!supabase) {
      setAdverts([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextAdverts = await fetchAdminAdverts()
      setAdverts(nextAdverts)
      setIsLoading(false)
      return nextAdverts
    } catch (loadError) {
      console.warn('Unable to load adverts', loadError)
      setAdverts([])
      setError('Unable to load adverts right now.')
      setIsLoading(false)
      return []
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadAdverts = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextAdverts = await fetchAdminAdverts()

        if (!isMounted) {
          return
        }

        setAdverts(nextAdverts)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load adverts', loadError)
        setAdverts([])
        setError('Unable to load adverts right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadAdverts()

    return () => {
      isMounted = false
    }
  }, [])

  const updateAdvert = async (advertId, updates) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(advertId)

    const { error: updateError } = await supabase
      .from('advert_submissions')
      .update(updates)
      .eq('id', advertId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setAdverts((current) =>
      current.map((advert) =>
        advert.id === advertId
          ? {
              ...advert,
              ...updates,
            }
          : advert,
      ),
    )
  }

  return {
    adverts,
    error,
    isLoading,
    refreshAdverts,
    updateAdvert,
    updatingId,
  }
}