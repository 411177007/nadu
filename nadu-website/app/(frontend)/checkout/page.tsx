"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useCart } from "@/hooks/CartContext"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"

export default function CheckoutPage() {
  const { cartItems, refreshCart } = useCart()
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [address, setAddress] = useState("")
  const [payment, setPayment] = useState("credit_card")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 100
  const total = subtotal + shipping

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
    console.log("submit", userId)
    setLoading(true)
    setError("")
    if (!userId) {
      setError("請先登入")
      setLoading(false)
      window.location.href = "/login"
      return
    }
    try {
      console.log("準備送出訂單", { userId, name, phone, address, payment, cartItems })
      const res = await fetch("/nadu-api/order-api.php?action=create", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          user_id: userId,
          shipping_name: name,
          shipping_phone: phone,
          shipping_address: address,
          payment_method: payment,
          items: JSON.stringify(cartItems.map(i => ({ product_id: i.id, quantity: i.quantity })))
        }).toString(),
      })
      console.log("fetch 完成", res)
      const data = await res.json()
      setLoading(false)
      if (data.success) {
        await fetch("/nadu-api/cart-api.php?action=clear", { method: "POST" })
        await refreshCart()
        router.push("/checkout/success")
      } else {
        setError(data.message || "下單失敗")
      }
    } catch (err) {
      setLoading(false)
      setError("送出訂單時發生錯誤：" + (err?.message || err))
      console.error("送出訂單錯誤", err)
    }
  }

  if (cartItems.length === 0) return <div className="container py-10">購物車為空</div>

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">結帳</h1>
      <form onSubmit={handleSubmit} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>收件資訊</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <label htmlFor="shipping_name" className="block mb-1 font-medium">收件人姓名</label>
            <Input id="shipping_name" name="shipping_name" placeholder="收件人姓名" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" />
            <label htmlFor="shipping_phone" className="block mb-1 font-medium">手機號碼</label>
            <Input id="shipping_phone" name="shipping_phone" placeholder="手機號碼" value={phone} onChange={e => setPhone(e.target.value)} required autoComplete="tel" />
            <label htmlFor="shipping_address" className="block mb-1 font-medium">收件地址</label>
            <Input id="shipping_address" name="shipping_address" placeholder="收件地址" value={address} onChange={e => setAddress(e.target.value)} required autoComplete="street-address" />
            <div>
              <label htmlFor="payment_method" className="block mb-1 font-medium">付款方式</label>
              <select id="payment_method" name="payment_method" value={payment} onChange={e => setPayment(e.target.value)} className="w-full border rounded p-2" autoComplete="cc-type">
                <option value="credit_card">信用卡</option>
                <option value="cod">貨到付款</option>
                <option value="bank">銀行轉帳</option>
              </select>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>訂單明細</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {cartItems.map(item => (
              <div key={item.id} className="flex justify-between">
                <span>{item.name} x {item.quantity}</span>
                <span>NT$ {item.price * item.quantity}</span>
              </div>
            ))}
            <Separator />
            <div className="flex justify-between"><span>小計</span><span>NT$ {subtotal}</span></div>
            <div className="flex justify-between"><span>運費</span><span>{shipping === 0 ? "免運費" : `NT$ ${shipping}`}</span></div>
            <div className="flex justify-between font-bold"><span>總計</span><span>NT$ {total}</span></div>
          </CardContent>
        </Card>
        {error && <div className="text-red-600 text-center">{error}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "送出中..." : "送出訂單"}</Button>
      </form>
    </div>
  )
} 