import { useEffect, useState } from 'react'
import {
  deriveFashionCategories,
  fallbackFashionProducts,
} from '../lib/fashion-catalog'
import { isSupabaseConfigured, supabase } from '../lib/supabase'

const fallbackProducts = fallbackFashionProducts.filter((product) => product.is_active !== false)

export function useFashionProducts() {
  const [products, setProducts] = useState(fallbackProducts)
  const [categories, setCategories] = useState(deriveFashionCategories(fallbackProducts))
  const [isLoading, setIsLoading] = useState(isSupabaseConfigured)
  const [error, setError] = useState('')
  const [dataSource, setDataSource] = useState(isSupabaseConfigured ? 'supabase' : 'fallback')

  useEffect(() => {
    if (!supabase) {
      return undefined
    }

    let isMounted = true

    const loadProducts = async () => {
      setIsLoading(true)
      setError('')

      const { data, error: loadError } = await supabase
        .from('fashion_products')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })

      if (!isMounted) {
        return
      }

      if (loadError) {
        console.warn('Unable to load fashion catalogue', loadError)
        setProducts(fallbackProducts)
        setCategories(deriveFashionCategories(fallbackProducts))
        setDataSource('fallback')
        setError('Showing preview fashion data until the live catalogue is available.')
        setIsLoading(false)
        return
      }

      const nextProducts = (data ?? []).filter((product) => product.is_active !== false)

      setProducts(nextProducts)
      setCategories(deriveFashionCategories(nextProducts))
      setDataSource('supabase')
      setIsLoading(false)
    }

    void loadProducts()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    categories,
    dataSource,
    error,
    isLoading,
    products,
  }
}