"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AccountOrdersPage() {
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
    if (!userId) return
    setLoading(true)
    fetch(`/nadu-api/order-api.php?action=list&user_id=${userId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.orders) setOrders(data.data.orders)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  if (loading) return <div className="container py-10">載入中...</div>

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">我的訂單</h1>
      {orders.length === 0 ? (
        <div>目前沒有訂單</div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => (
            <Card key={order.id}>
              <CardHeader>
                <CardTitle>訂單編號：{order.id}</CardTitle>
              </CardHeader>
              <CardContent>
                <div>金額：NT$ {order.total_amount}</div>
                <div>狀態：{order.status}</div>
                <div>下單時間：{order.created_at}</div>
                <Link href={`/account/orders/${order.id}`}>
                  <Button className="mt-2">查看明細</Button>
                </Link>
                {['pending', '處理中'].includes(order.status) && (
                  <Button className="mt-2 ml-2" variant="destructive" onClick={async () => {
                    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
                    if (!userId) return
                    if (!confirm('確定要取消這筆訂單嗎？')) return
                    const res = await fetch('/nadu-api/order-api.php?action=cancel', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                      body: `id=${order.id}&user_id=${userId}`
                    })
                    const data = await res.json()
                    if (data.success) {
                      setOrders(orders.map(o => o.id === order.id ? { ...o, status: 'cancelled' } : o))
                    } else {
                      alert(data.message || '取消失敗')
                    }
                  }}>
                    取消訂單
                  </Button>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
} 