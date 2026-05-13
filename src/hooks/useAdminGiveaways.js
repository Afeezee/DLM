import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function fetchAdminGiveaways() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('giveaway_entries')
    .select('*, user:users(name, email)')
    .order('entry_date', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useAdminGiveaways() {
  const [entries, setEntries] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshEntries = useCallback(async () => {
    if (!supabase) {
      setEntries([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextEntries = await fetchAdminGiveaways()
      setEntries(nextEntries)
      setIsLoading(false)
      return nextEntries
    } catch (loadError) {
      console.warn('Unable to load giveaway entries', loadError)
      setEntries([])
      setError('Unable to load giveaway entries right now.')
      setIsLoading(false)
      return []
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadEntries = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextEntries = await fetchAdminGiveaways()

        if (!isMounted) {
          return
        }

        setEntries(nextEntries)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load giveaway entries', loadError)
        setEntries([])
        setError('Unable to load giveaway entries right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadEntries()

    return () => {
      isMounted = false
    }
  }, [])

  const publishWinnerAnnouncement = async (entry, month) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(entry.id)

    const { error: insertError } = await supabase.from('announcements').insert({
      body: `${entry.user?.name ?? 'A community member'} has been selected as the DLM giveaway winner for ${month}.`,
      category: 'giveaway',
      is_published: true,
      published_at: new Date().toISOString(),
      title: `Giveaway winner for ${month}`,
    })

    setUpdatingId('')

    if (insertError) {
      throw insertError
    }
  }

  return {
    entries,
    error,
    isLoading,
    publishWinnerAnnouncement,
    refreshEntries,
    updatingId,
  }
}