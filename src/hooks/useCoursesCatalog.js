import { useEffect, useState } from 'react'
import { fallbackCourses } from '../lib/course-catalog'
import { supabase } from '../lib/supabase'

async function fetchCourses() {
  if (!supabase) {
    return []
  }

  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('is_active', true)

  if (error) {
    throw error
  }

  return data ?? []
}

export function useCoursesCatalog() {
  const [courses, setCourses] = useState(fallbackCourses)
  const [dataSource, setDataSource] = useState('fallback')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))

  useEffect(() => {
    let isMounted = true

    const loadCourses = async () => {
      if (!supabase) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const liveCourses = await fetchCourses()

        if (!isMounted) {
          return
        }

        if (liveCourses.length) {
          setCourses(liveCourses)
          setDataSource('live')
        } else {
          setCourses(fallbackCourses)
          setDataSource('fallback')
        }
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load courses', loadError)
        setCourses(fallbackCourses)
        setDataSource('fallback')
        setError('Course content is showing fallback data right now.')
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

  return {
    courses,
    dataSource,
    error,
    isLoading,
  }
}