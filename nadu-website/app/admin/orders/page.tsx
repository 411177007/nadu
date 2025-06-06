"use client"

import { useState, useEffect } from "react"
import { Eye, MoreHorizontal, Search } from "lucide-react"
import Link from "next/link"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 訂單資料介面
interface Order {
  id: string
  customer: string
  email: string
  date: string
  total: number
  status: string
  items: number
}

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")

  const filteredOrders = orders.filter((order) => {
    const matchesSearch =
      order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.customer.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.email.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === "all" || order.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const handleUpdateStatus = (id: string, newStatus: string) => {
    setOrders(orders.map((order) => (order.id === id ? { ...order, status: newStatus } : order)))
  }

  useEffect(() => {
    fetch('/nadu-api/order-api.php?action=list')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data && data.data.orders) {
          setOrders(data.data.orders.map((order: any) => ({
            id: order.id,
            customer: order.shipping_name,
            email: order.user_email || '',
            date: order.created_at,
            total: order.total_amount,
            status: order.status,
            items: order.items_count || 0
          })))
        }
      })
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">訂單管理</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>訂單列表</CardTitle>
          <CardDescription>查看並管理所有訂單</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <label htmlFor="order-search" className="sr-only">搜尋訂單</label>
                <Input
                  id="order-search"
                  name="order-search"
                  type="search"
                  placeholder="搜尋訂單編號、客戶名稱或電子郵件..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="訂單狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有狀態</SelectItem>
                  <SelectItem value="處理中">處理中</SelectItem>
                  <SelectItem value="運送中">運送中</SelectItem>
                  <SelectItem value="已完成">已完成</SelectItem>
                  <SelectItem value="已取消">已取消</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>訂單編號</TableHead>
                  <TableHead>客戶</TableHead>
                  <TableHead>日期</TableHead>
                  <TableHead className="text-right">金額</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      沒有找到符合條件的訂單
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>
                        <div>
                          <div>{order.customer}</div>
                          <div className="text-sm text-muted-foreground">{order.email}</div>
                        </div>
                      </TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell className="text-right">NT$ {order.total}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "已完成"
                              ? "bg-green-500/10 text-green-600"
                              : order.status === "運送中"
                                ? "bg-blue-500/10 text-blue-600"
                                : order.status === "處理中"
                                  ? "bg-yellow-500/10 text-yellow-600"
                                  : "bg-red-500/10 text-red-600"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="h-4 w-4" />
                              <span className="sr-only">打開選單</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem asChild>
                              <Link href={`/admin/orders/${order.id}`} className="flex items-center">
                              <Eye className="mr-2 h-4 w-4" />
                              查看詳情
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "處理中")}>設為處理中</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "運送中")}>設為運送中</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleUpdateStatus(order.id, "已完成")}>設為已完成</DropdownMenuItem>
                            <DropdownMenuItem onClick={async () => {
                              if (!confirm('確定要取消這筆訂單嗎？')) return
                              const res = await fetch('/nadu-api/order-api.php?action=update_status', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                                body: `id=${order.id}&status=已取消`
                              })
                              const data = await res.json()
                              if (data.success) {
                                handleUpdateStatus(order.id, '已取消')
                              } else {
                                alert(data.message || '取消失敗')
                              }
                            }}>取消訂單</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
