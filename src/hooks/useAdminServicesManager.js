import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

function toSlug(value) {
  return String(value ?? '')
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}

function toNumberOrNull(value) {
  if (value === '' || value === null || value === undefined) {
    return null
  }

  const nextValue = Number(value)
  return Number.isNaN(nextValue) ? null : nextValue
}

async function fetchAdminServicesManager() {
  if (!supabase) {
    return { categories: [], services: [] }
  }

  const [{ data: categoryRows, error: categoryError }, { data: serviceRows, error: serviceError }] =
    await Promise.all([
      supabase.from('service_categories').select('*').order('display_order', { ascending: true }),
      supabase
        .from('services')
        .select('*, category:service_categories(name, slug)')
        .order('created_at', { ascending: false }),
    ])

  if (categoryError || serviceError) {
    throw categoryError ?? serviceError
  }

  return {
    categories: categoryRows ?? [],
    services: serviceRows ?? [],
  }
}

export function useAdminServicesManager() {
  const [categories, setCategories] = useState([])
  const [services, setServices] = useState([])
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshServicesManager = useCallback(async () => {
    if (!supabase) {
      setCategories([])
      setServices([])
      setIsLoading(false)
      return { categories: [], services: [] }
    }

    setIsLoading(true)
    setError('')

    try {
      const nextState = await fetchAdminServicesManager()
      setCategories(nextState.categories)
      setServices(nextState.services)
      setIsLoading(false)
      return nextState
    } catch (loadError) {
      console.warn('Unable to load services manager data', loadError)
      setCategories([])
      setServices([])
      setError('Unable to load services manager data right now.')
      setIsLoading(false)
      return { categories: [], services: [] }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadServicesManager = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextState = await fetchAdminServicesManager()

        if (!isMounted) {
          return
        }

        setCategories(nextState.categories)
        setServices(nextState.services)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load services manager data', loadError)
        setCategories([])
        setServices([])
        setError('Unable to load services manager data right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadServicesManager()

    return () => {
      isMounted = false
    }
  }, [])

  const updateService = async (serviceId, updates) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(serviceId)

    const normalizedUpdates = {
      ...updates,
      duration_mins: updates.duration_mins === undefined ? undefined : toNumberOrNull(updates.duration_mins),
      home_service_member_price:
        updates.home_service_member_price === undefined
          ? undefined
          : toNumberOrNull(updates.home_service_member_price),
      home_service_standard_price:
        updates.home_service_standard_price === undefined
          ? undefined
          : toNumberOrNull(updates.home_service_standard_price),
      member_price: updates.member_price === undefined ? undefined : toNumberOrNull(updates.member_price),
      standard_price: updates.standard_price === undefined ? undefined : toNumberOrNull(updates.standard_price),
    }

    const { data, error: updateError } = await supabase
      .from('services')
      .update(normalizedUpdates)
      .select('*, category:service_categories(name, slug)')
      .eq('id', serviceId)
      .single()

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setServices((current) =>
      current.map((service) =>
        service.id === serviceId
          ? {
              ...service,
              ...(data ?? normalizedUpdates),
            }
          : service,
      ),
    )

    return data
  }

  const createCategory = async (payload) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId('category')

    const { data, error: insertError } = await supabase
      .from('service_categories')
      .insert({
        display_order: toNumberOrNull(payload.displayOrder),
        name: payload.name,
        slug: payload.slug || toSlug(payload.name),
      })
      .select('*')
      .single()

    setUpdatingId('')

    if (insertError) {
      throw insertError
    }

    setCategories((current) => [...current, data].sort((left, right) => (left.display_order ?? 999) - (right.display_order ?? 999)))
    return data
  }

  const createService = async (payload) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId('service')

    const normalizedPayload = {
      category_id: payload.categoryId || null,
      description: payload.description,
      duration_mins: toNumberOrNull(payload.durationMins),
      has_home_service: Boolean(payload.hasHomeService),
      home_service_member_price: toNumberOrNull(payload.homeServiceMemberPrice),
      home_service_standard_price: toNumberOrNull(payload.homeServiceStandardPrice),
      image_url: payload.imageUrl || null,
      is_active: Boolean(payload.isActive),
      member_price: toNumberOrNull(payload.memberPrice),
      name: payload.name,
      standard_price: toNumberOrNull(payload.standardPrice),
    }

    const { data, error: insertError } = await supabase
      .from('services')
      .insert(normalizedPayload)
      .select('*, category:service_categories(name, slug)')
      .single()

    setUpdatingId('')

    if (insertError) {
      throw insertError
    }

    setServices((current) => [data, ...current])
    return data
  }

  return {
    categories,
    createCategory,
    createService,
    error,
    isLoading,
    refreshServicesManager,
    services,
    updateService,
    updatingId,
  }
}