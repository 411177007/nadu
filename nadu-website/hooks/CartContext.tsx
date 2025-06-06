'use client'

import React, { createContext, useContext, useState, useEffect } from "react"

type CartItem = {
  id: number
  name: string
  image: string
  price: number
  quantity: number
}

type CartContextType = {
  cartItems: CartItem[]
  setCartItems: (items: CartItem[]) => void
  refreshCart: () => Promise<void>
}

const CartContext = createContext<CartContextType | undefined>(undefined)

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cartItems, setCartItems] = useState<CartItem[]>([])

  // 載入購物車資料
  const refreshCart = async () => {
    try {
      const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
      if (!userId) { setCartItems([]); return }
      const res = await fetch(`/nadu-api/cart-api.php?action=list&user_id=${userId}`)
      const data = await res.json()
      if (data.success && data.data && Array.isArray(data.data.cart)) {
        setCartItems(data.data.cart.map((item: any) => ({
          id: Number(item.id),
          name: item.name,
          image: item.image,
          price: Number(item.price),
          quantity: Number(item.quantity)
        })))
      } else {
        setCartItems([])
      }
    } catch { setCartItems([]) }
  }

  useEffect(() => {
    refreshCart()
  }, [])

  return (
    <CartContext.Provider value={{ cartItems, setCartItems, refreshCart }}>
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error("useCart must be used within CartProvider")
  return ctx
} 