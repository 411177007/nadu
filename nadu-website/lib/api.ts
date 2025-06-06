// API 請求封裝與型別定義

export type Product = {
  id: number
  name: string
  category_id: number
  category_name: string
  price: number
  stock: number
  status: string
  description?: string
  images?: string[]
  image?: string
  original_price?: number
  is_featured?: number
}

export type Category = {
  id: number
  name: string
  slug?: string
  image?: string
}

export type CartItem = {
  id: number
  product_id: number
  name: string
  price: number
  quantity: number
  image?: string
  selected?: boolean
}

export type User = {
  id: number
  name: string
  email: string
  avatar?: string
  level?: string
  points?: number
  phone?: string
}

export type Order = {
  id: number
  user_id: number
  total: number
  status: string
  date: string
  items: number
}

export async function apiGet<T>(url: string): Promise<T> {
  const res = await fetch(url, { cache: 'no-store' })
  if (!res.ok) throw new Error('API 錯誤')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'API 回傳失敗')
  return data.data as T
}

export async function apiPost<T>(url: string, body: Record<string, any>): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams(body).toString(),
  })
  if (!res.ok) throw new Error('API 錯誤')
  const data = await res.json()
  if (!data.success) throw new Error(data.message || 'API 回傳失敗')
  return data.data as T
} 