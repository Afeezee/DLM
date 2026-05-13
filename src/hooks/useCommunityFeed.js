import { useEffect, useState } from 'react'
import { useAuth } from './useAuth'
import { fallbackAnnouncements } from '../lib/community-content'
import { supabase } from '../lib/supabase'

export function getCurrentGiveawayMonth() {
  return new Date().toISOString().slice(0, 7)
}

async function fetchAnnouncements() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .eq('is_published', true)
    .order('published_at', { ascending: false })
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

async function fetchGiveawayEntry(userId, month) {
  if (!supabase || !userId) {
    return null
  }

  const { data, error } = await supabase
    .from('giveaway_entries')
    .select('*')
    .eq('user_id', userId)
    .eq('month', month)
    .maybeSingle()

  if (error) {
    throw error
  }

  return data
}

export function useCommunityFeed() {
  const { user } = useAuth()
  const [announcements, setAnnouncements] = useState(fallbackAnnouncements)
  const [dataSource, setDataSource] = useState('fallback')
  const [error, setError] = useState('')
  const [giveawayEntry, setGiveawayEntry] = useState(null)
  const [isEntering, setIsEntering] = useState(false)
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const currentMonth = getCurrentGiveawayMonth()

  useEffect(() => {
    let isMounted = true

    const loadFeed = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const [liveAnnouncements, currentEntry] = await Promise.all([
          fetchAnnouncements(),
          user ? fetchGiveawayEntry(user.id, currentMonth) : Promise.resolve(null),
        ])

        if (!isMounted) {
          return
        }

        if (liveAnnouncements.length) {
          setAnnouncements(liveAnnouncements)
          setDataSource('live')
        } else {
          setAnnouncements(fallbackAnnouncements)
          setDataSource('fallback')
        }

        setGiveawayEntry(currentEntry)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load community feed', loadError)
        setAnnouncements(fallbackAnnouncements)
        setDataSource('fallback')
        setGiveawayEntry(null)
        setError('Community updates are showing fallback content right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadFeed()

    return () => {
      isMounted = false
    }
  }, [currentMonth, user])

  const enterGiveaway = async () => {
    if (!supabase || !user) {
      throw new Error('Sign in before entering the monthly giveaway.')
    }

    setIsEntering(true)

    const { data, error: entryError } = await supabase
      .from('giveaway_entries')
      .upsert(
        {
          month: currentMonth,
          user_id: user.id,
        },
        {
          onConflict: 'user_id,month',
        },
      )
      .select('*')
      .single()

    setIsEntering(false)

    if (entryError) {
      throw entryError
    }

    setGiveawayEntry(data)
    return data
  }

  return {
    announcements,
    currentMonth,
    dataSource,
    enterGiveaway,
    error,
    giveawayEntry,
    isEntering,
    isLoading,
  }
}