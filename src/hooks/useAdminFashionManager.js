import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../lib/supabase'

async function fetchAdminFashionManager() {
  if (!supabase) {
    return { orders: [], products: [] }
  }

  const [{ data: productRows, error: productError }, { data: orderRows, error: orderError }] =
    await Promise.all([
      supabase.from('fashion_products').select('*').order('created_at', { ascending: false }),
      supabase
        .from('fashion_orders')
        .select('*, user:users(name, email)')
        .order('created_at', { ascending: false }),
    ])

  if (productError || orderError) {
    throw productError ?? orderError
  }

  return {
    orders: orderRows ?? [],
    products: productRows ?? [],
  }
}

export function useAdminFashionManager() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [isCreatingProduct, setIsCreatingProduct] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(Boolean(supabase))
  const [updatingId, setUpdatingId] = useState('')

  const refreshFashionManager = useCallback(async () => {
    if (!supabase) {
      setOrders([])
      setProducts([])
      setIsLoading(false)
      return { orders: [], products: [] }
    }

    setIsLoading(true)
    setError('')

    try {
      const nextState = await fetchAdminFashionManager()
      setProducts(nextState.products)
      setOrders(nextState.orders)
      setIsLoading(false)
      return nextState
    } catch (error) {
      console.warn('Unable to load fashion manager data', error)
      setOrders([])
      setProducts([])
      setError('Unable to load the fashion manager right now.')
      setIsLoading(false)
      return { orders: [], products: [] }
    }
  }, [])

  useEffect(() => {
    let isMounted = true

    const loadFashionManager = async () => {
      if (!supabase) {
        return
      }

      setIsLoading(true)
      setError('')

      try {
        const nextState = await fetchAdminFashionManager()

        if (!isMounted) {
          return
        }

        setProducts(nextState.products)
        setOrders(nextState.orders)
      } catch (loadError) {
        if (!isMounted) {
          return
        }

        console.warn('Unable to load fashion manager data', loadError)
        setOrders([])
        setProducts([])
        setError('Unable to load the fashion manager right now.')
      }

      if (isMounted) {
        setIsLoading(false)
      }
    }

    void loadFashionManager()

    return () => {
      isMounted = false
    }
  }, [])

  const updateOrderStatus = async (orderId, deliveryStatus) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(orderId)

    const { error: updateError } = await supabase
      .from('fashion_orders')
      .update({ delivery_status: deliveryStatus })
      .eq('id', orderId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setOrders((current) =>
      current.map((order) =>
        order.id === orderId
          ? {
              ...order,
              delivery_status: deliveryStatus,
            }
          : order,
      ),
    )
  }

  const updateProduct = async (productId, updates) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setUpdatingId(productId)

    const { error: updateError } = await supabase
      .from('fashion_products')
      .update(updates)
      .eq('id', productId)

    setUpdatingId('')

    if (updateError) {
      throw updateError
    }

    setProducts((current) =>
      current.map((product) =>
        product.id === productId
          ? {
              ...product,
              ...updates,
            }
          : product,
      ),
    )
  }

  const createProduct = async (payload) => {
    if (!supabase) {
      throw new Error('Supabase is not configured.')
    }

    setIsCreatingProduct(true)

    const nextProduct = {
      ...payload,
      image_urls: (payload.image_urls ?? []).filter(Boolean),
    }

    const { data, error: insertError } = await supabase
      .from('fashion_products')
      .insert(nextProduct)
      .select('*')
      .single()

    setIsCreatingProduct(false)

    if (insertError) {
      throw insertError
    }

    setProducts((current) => [data, ...current])
    return data
  }

  return {
    createProduct,
    error,
    isCreatingProduct,
    isLoading,
    orders,
    products,
    refreshFashionManager,
    updateOrderStatus,
    updateProduct,
    updatingId,
  }
}