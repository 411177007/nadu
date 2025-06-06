"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"

export default function AdminOrderDetailPage() {
  const params = useParams()
  const id = params?.id as string
  const [order, setOrder] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  // 狀態與付款方式對應表
  const statusMap: Record<string, string> = {
    pending: "等待處理",
    processing: "處理中",
    shipping: "運送中",
    completed: "已完成",
    cancelled: "已取消"
  }
  const paymentMap: Record<string, string> = {
    credit_card: "信用卡",
    cod: "貨到付款",
    bank: "銀行轉帳"
  }

  // 金額格式化
  const formatAmount = (n: number) => n != null ? n.toLocaleString('zh-TW', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) : ''

  useEffect(() => {
    setLoading(true)
    fetch(`/nadu-api/order-api.php?action=detail&id=${id}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) setOrder(data.data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container py-10">載入中...</div>
  if (!order) return <div className="container py-10">查無此訂單</div>

  const totalAmount = Number(order.total_amount) || 0;
  const shippingFee = Number(order.shipping_fee) || 0;
  const grandTotal = totalAmount + shippingFee;

  return (
    <div className="container py-10 max-w-2xl">
      <h1 className="mb-6 text-2xl font-bold">訂單詳情（管理）</h1>
      <Card>
        <CardHeader>
          <CardTitle>訂單編號：{order.id}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>狀態：{statusMap[order.status] || order.status}</div>
          <div>下單時間：{order.created_at}</div>
          <div>收件人：{order.shipping_name}</div>
          <div>電話：{order.shipping_phone}</div>
          <div>地址：{order.shipping_address}</div>
          <div>付款方式：{paymentMap[order.payment_method] || order.payment_method}</div>
          <div className="mt-4 font-medium">商品明細：</div>
          <ul className="mb-2">
            {order.items && order.items.map((item: any) => (
              <li key={item.id} className="flex justify-between">
                <span>{item.product_name} x {item.quantity}</span>
                <span>NT$ {item.product_price * item.quantity}</span>
              </li>
            ))}
          </ul>
          <div className="flex justify-between"><span>小計</span><span>NT$ {formatAmount(order.total_amount)}</span></div>
          <div className="flex justify-between"><span>運費</span><span>{order.shipping_fee === 0 ? "免運費" : `NT$ ${formatAmount(order.shipping_fee)}`}</span></div>
          <div className="flex justify-between font-bold"><span>總計</span><span>NT$ {formatAmount(grandTotal)}</span></div>
        </CardContent>
      </Card>
      <div className="mt-6 flex gap-4">
        <Link href="/admin/orders">
          <Button>回訂單列表</Button>
        </Link>
        <Link href="/admin">
          <Button variant="outline">回後台首頁</Button>
        </Link>
      </div>
    </div>
  )
} 