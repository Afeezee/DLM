import { useEffect, useState } from 'react'
import { CartContext } from './cart-context'

const cartStorageKey = 'dlm-cart-items'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    if (typeof window === 'undefined') {
      return []
    }

    try {
      const savedItems = window.localStorage.getItem(cartStorageKey)
      return savedItems ? JSON.parse(savedItems) : []
    } catch {
      return []
    }
  })

  useEffect(() => {
    window.localStorage.setItem(cartStorageKey, JSON.stringify(items))
  }, [items])

  const addItem = (item) => {
    setItems((current) => {
      const existingIndex = current.findIndex((entry) => entry.id === item.id)

      if (existingIndex >= 0) {
        return current.map((entry, index) =>
          index === existingIndex
            ? { ...entry, quantity: (entry.quantity ?? 1) + (item.quantity ?? 1) }
            : entry,
        )
      }

      return [...current, { ...item, quantity: item.quantity ?? 1 }]
    })
  }

  const removeItem = (itemId) => {
    setItems((current) => current.filter((item) => item.id !== itemId))
  }

  const updateQuantity = (itemId, quantity) => {
    if (quantity <= 0) {
      removeItem(itemId)
      return
    }

    setItems((current) =>
      current.map((item) =>
        item.id === itemId
          ? {
              ...item,
              quantity,
            }
          : item,
      ),
    )
  }

  const clearCart = () => setItems([])

  const subtotal = items.reduce(
    (total, item) => total + Number(item.price ?? 0) * Number(item.quantity ?? 1),
    0,
  )

  return (
    <CartContext.Provider
      value={{
        addItem,
        clearCart,
        itemCount: items.reduce((total, item) => total + (item.quantity ?? 1), 0),
        items,
        removeItem,
        subtotal,
        updateQuantity,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}