import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const nextValue = Number(value)
  return Number.isNaN(nextValue) ? null : nextValue
}

async function fetchAdminCourses() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase.from('courses').select('*')

  if (error) {
    throw error
  }

  return data ?? []
}

export function useAdminCourses() {
  const [courses, setCourses] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshCourses = useCallback(async () => {
    if (!supabase) {
      setCourses([])
      setIsLoading(false)
      return []
    }

    setIsLoading(true)
    setError('')

    try {
      const nextCourses = await fetchAdminCourses()
      setCourses(nextCourses)
      setIsLoading(false)
      return nextCourses
    } catch (loadError) {
      console.warn('Unable to load courses', loadError)
      setCourses([])
      setError('Unable to load courses right now.')
      setIsLoading(false)
      return []
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadCourses = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextCourses = await fetchAdminCourses()

        if (!isMounted) {
          return
        }

        setCourses(nextCourses)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load courses', loadError)
        setCourses([])
        setError('Unable to load courses right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadCourses()

    return () => {
      isMounted = false
    }
  }, [])

  const createCourse = async (payload) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId('course')

    const { data, error: insertError } = await supabase
      .from('courses')
      .insert({
        category: payload.category,
        description: payload.description,
        image_url: payload.imageUrl || null,
        is_active: Boolean(payload.isActive),
        member_price: toNumberOrNull(payload.memberPrice),
        selar_url: payload.selarUrl || null,
        standard_price: toNumberOrNull(payload.standardPrice),
        title: payload.title,
      })
      .select('*')
      .single()

    setUpdatingId('')

    if (insertError) {
      throw insertError
    }

    setCourses((current) => [data, ...current])
    return data
  }

  const updateCourse = async (courseId, updates) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(courseId)

    const normalizedUpdates = {
      ...updates,
      member_price: updates.member_price === undefined ? undefined : toNumberOrNull(updates.member_price),
      standard_price:
        updates.standard_price === undefined ? undefined : toNumberOrNull(updates.standard_price),
    }

    const { error: updateError } = await supabase.from('courses').update(normalizedUpdates).eq('id', courseId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setCourses((current) =>
      current.map((course) =>
        course.id === courseId
          ? {
              ...course,
              ...normalizedUpdates,
            }
          : course,
      ),
    )
  }

  return {
    courses,
    createCourse,
    error,
    isLoading,
    refreshCourses,
    updateCourse,
    updatingId,
  }
}