"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, Trash2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { apiGet, apiPost, CartItem } from "@/lib/api"
import { useCart } from "@/hooks/CartContext"

export default function CartPage() {
  const { cartItems, refreshCart } = useCart()
  const [selectedIds, setSelectedIds] = useState<number[]>([])
  const [allSelected, setAllSelected] = useState(true)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    refreshCart().then(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    setSelectedIds(cartItems.map(item => item.id))
    setAllSelected(true)
  }, [cartItems])

  const handleSelectAll = () => {
    const newSelected = !allSelected
    setAllSelected(newSelected)
    setSelectedIds(newSelected ? cartItems.map(item => item.id) : [])
  }

  const handleSelectItem = (id: number) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id))
      setAllSelected(false)
    } else {
      const newIds = [...selectedIds, id]
      setSelectedIds(newIds)
      setAllSelected(newIds.length === cartItems.length)
    }
  }

  const handleQuantityChange = async (id: number, change: number) => {
    const item = cartItems.find((item) => item.id === id)
    if (!item) return
    const newQty = Math.max(1, item.quantity + change)
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
    await apiPost("/nadu-api/cart-api.php?action=update", { id, quantity: newQty, user_id: userId })
    await refreshCart()
  }

  const handleRemoveItem = async (id: number) => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null
    await apiPost("/nadu-api/cart-api.php?action=delete", { id, user_id: userId })
    await refreshCart()
  }

  const selectedItems = cartItems.filter(item => selectedIds.includes(item.id))
  const subtotal = selectedItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shipping = subtotal > 2000 ? 0 : 100
  const total = subtotal + shipping

  if (loading) return <div className="container py-10">載入中...</div>

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">購物車</h1>

      {cartItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12">
          <div className="mb-4 text-6xl">🛒</div>
          <h2 className="mb-2 text-xl font-semibold">您的購物車是空的</h2>
          <p className="mb-6 text-muted-foreground">快去選購您喜愛的商品吧！</p>
          <Link href="/">
            <Button>繼續購物</Button>
          </Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader className="px-6">
                <div className="flex items-center">
                  <Checkbox id="select-all" checked={allSelected} onCheckedChange={handleSelectAll} />
                  <label htmlFor="select-all" className="ml-2 text-sm font-medium">
                    全選 ({cartItems.length} 件商品)
                  </label>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className="w-[50px]"></TableHead>
                      <TableHead>商品</TableHead>
                      <TableHead className="text-right">單價</TableHead>
                      <TableHead className="text-center">數量</TableHead>
                      <TableHead className="text-right">小計</TableHead>
                      <TableHead className="w-[70px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {cartItems.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Checkbox id={`cart-item-${item.id}`} name={`cart-item-${item.id}`} checked={selectedIds.includes(item.id)} onCheckedChange={() => handleSelectItem(item.id)} />
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-3">
                            <Image
                              src={item.image ? `/nadu-api/${item.image}` : "/placeholder.svg"}
                              alt={item.name}
                              width={60}
                              height={60}
                              className="rounded-md object-cover"
                            />
                            <div className="font-medium">{item.name}</div>
                          </div>
                        </TableCell>
                        <TableCell className="text-right">NT$ {item.price}</TableCell>
                        <TableCell>
                          <div className="flex items-center justify-center">
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-r-none"
                              aria-label="減少數量"
                              onClick={() => handleQuantityChange(item.id, -1)}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <div className="flex h-8 w-10 items-center justify-center border-y" aria-label="商品數量">{item.quantity}</div>
                            <Button
                              variant="outline"
                              size="icon"
                              className="h-8 w-8 rounded-l-none"
                              aria-label="增加數量"
                              onClick={() => handleQuantityChange(item.id, 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                        </TableCell>
                        <TableCell className="text-right font-medium">NT$ {item.price * item.quantity}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(item.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>

          <div>
            <Card>
              <CardHeader>
                <CardTitle>訂單摘要</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">商品小計</span>
                  <span>NT$ {subtotal}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">運費</span>
                  <span>{shipping === 0 ? "免運費" : `NT$ ${shipping}`}</span>
                </div>
                {shipping > 0 && <div className="text-xs text-muted-foreground">消費滿 NT$2,000 即可享有免運費</div>}
                <Separator />
                <div className="flex justify-between font-medium">
                  <span>總計</span>
                  <span>NT$ {total}</span>
                </div>
              </CardContent>
              <CardFooter>
                <Button className="w-full" size="lg" disabled={selectedItems.length === 0} onClick={() => window.location.href = '/checkout'}>
                  前往結帳
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
