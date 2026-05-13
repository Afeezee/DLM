import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function fetchAdminAnnouncements() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('announcements')
    .select('*')
    .order('created_at', { ascending: false })

  if (error) {
    throw error
  }

  return data ?? []
}

export function useAdminAnnouncements() {
  const [announcements, setAnnouncements] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshAnnouncements = useCallback(async () => {
    if (!supabase) {
      setAnnouncements([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextAnnouncements = await fetchAdminAnnouncements()
      setAnnouncements(nextAnnouncements)
      setIsLoading(false)
      return nextAnnouncements
    } catch (loadError) {
      console.warn('Unable to load announcements', loadError)
      setAnnouncements([])
      setError('Unable to load announcements right now.')
      setIsLoading(false)
      return []
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadAnnouncements = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextAnnouncements = await fetchAdminAnnouncements()

        if (!isMounted) {
          return
        }

        setAnnouncements(nextAnnouncements)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load announcements', loadError)
        setAnnouncements([])
        setError('Unable to load announcements right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadAnnouncements()

    return () => {
      isMounted = false
    }
  }, [])

  const createAnnouncement = async (payload) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId('announcement')

    const publishedAt = payload.isPublished ? new Date().toISOString() : null
    const { data, error: insertError } = await supabase
      .from('announcements')
      .insert({
        body: payload.body,
        category: payload.category,
        image_url: payload.imageUrl || null,
        is_published: Boolean(payload.isPublished),
        published_at: publishedAt,
        title: payload.title,
      })
      .select('*')
      .single()

    setUpdatingId('')

    if (insertError) {
      throw insertError
    }

    setAnnouncements((current) => [data, ...current])
    return data
  }

  const updateAnnouncement = async (announcementId, updates) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(announcementId)

    const normalizedUpdates = {
      ...updates,
      published_at:
        updates.is_published === true
          ? updates.published_at || new Date().toISOString()
          : updates.is_published === false
            ? null
            : updates.published_at,
    }

    const { error: updateError } = await supabase
      .from('announcements')
      .update(normalizedUpdates)
      .eq('id', announcementId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setAnnouncements((current) =>
      current.map((announcement) =>
        announcement.id === announcementId
          ? {
              ...announcement,
              ...normalizedUpdates,
            }
          : announcement,
      ),
    )
  }

  return {
    announcements,
    createAnnouncement,
    error,
    isLoading,
    refreshAnnouncements,
    updateAnnouncement,
    updatingId,
  }
}