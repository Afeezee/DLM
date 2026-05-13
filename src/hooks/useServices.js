import { useEffect, useState } from 'react'
import {
  attachServiceCategories,
  fallbackServiceCategories,
  fallbackServices,
} from '../lib/service-catalog'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const fallbackCatalogue = attachServiceCategories(
  fallbackServiceCategories,
  fallbackServices.filter((service) => service.is_active !== false),
)

export function useServices() {
  const [categories, setCategories] = useState(fallbackServiceCategories)
  const [services, setServices] = useState(fallbackCatalogue)
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')
  const [dataSource, setDataSource] = useState(isSupabaseConfigured ? 'supabase' : 'fallback')

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isMounted = true

    const loadServices = async () => {
      setIsLoading(true)
      setError('')

      const [{ data: categoryRows, error: categoryError }, { data: serviceRows, error: serviceError }] =
        await Promise.all([
          supabase
            .from('service_categories')
            .select('*')
            .order('display_order', { ascending: true })
            .order('name', { ascending: true }),
          supabase.from('services').select('*').eq('is_active', true).order('created_at', {
            ascending: false,
          }),
        ])

      if (!isMounted) {
        return
      }

      if (categoryError || serviceError) {
        console.warn('Unable to load services catalogue', categoryError ?? serviceError)
        setCategories(fallbackServiceCategories)
        setServices(fallbackCatalogue)
        setError('Showing preview data until the catalogue is available.')
        setDataSource('fallback')
        setIsLoading(false)
        return
      }

      const nextCategories = categoryRows ?? []
      const nextServices = attachServiceCategories(nextCategories, serviceRows ?? [])

      setCategories(nextCategories)
      setServices(nextServices)
      setDataSource('supabase')
      setIsLoading(false)
    }

    void loadServices()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    categories,
    dataSource,
    error,
    isLoading,
    services,
  }
}