"use client"

import Link from "next/link"
import { ArrowUpRight, DollarSign, Package, ShoppingCart, Users, BarChart3 } from "lucide-react"
import { useEffect, useState } from "react"
import { ChartContainer } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('http://localhost/nadu-api/analytics-api.php')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStats(data.data)
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">儀表板</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            下載報表
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">總銷售額</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ {stats.totalRevenue?.toLocaleString?.('zh-TW', { minimumFractionDigits: 2 }) || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">訂單數</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders || 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">會員數</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.users || 0}</div>
          </CardContent>
        </Card>
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">商品數</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
            <div className="text-2xl font-bold">{stats.products || 0}</div>
            </CardContent>
          </Card>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">概覽</TabsTrigger>
          <TabsTrigger value="orders">訂單</TabsTrigger>
          <TabsTrigger value="products">商品</TabsTrigger>
        </TabsList>
        <TabsContent value="overview" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>銷售趨勢</CardTitle>
                <CardDescription>過去30天的銷售趨勢</CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <div className="h-[200px] w-full">
                  {loading ? (
                    <div className="flex items-center justify-center h-full text-muted-foreground">載入中...</div>
                  ) : (
                    <ChartContainer config={{}}>
                      <LineChart data={stats.daily || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="銷售額" />
                      </LineChart>
                    </ChartContainer>
                  )}
                </div>
              </CardContent>
            </Card>
            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle>熱門商品</CardTitle>
                <CardDescription>銷售量最高的商品</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-muted-foreground">載入中...</div>
                  ) : (stats.topProducts || []).slice(0, 3).map((product: any, index: number) => (
                    <div key={index} className="flex items-center">
                      <div className="w-2 h-2 rounded-full bg-primary mr-2"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{product.name}</p>
                      </div>
                      <div className="text-sm font-medium">{product.sales} 件</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            <Card className="lg:col-span-4">
              <CardHeader>
                <CardTitle>最近訂單</CardTitle>
                <CardDescription>最近5筆訂單</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {loading ? (
                    <div className="text-muted-foreground">載入中...</div>
                  ) : (stats.recentOrders || []).map((order: any) => (
                    <div key={order.id} className="flex items-center justify-between border-b py-2">
                      <div>
                        <span className="font-medium">#{order.order_number}</span> - {order.user_name}
                      </div>
                      <div>NT$ {(Number(order.total_amount) + Number(order.shipping_fee)).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</div>
                      <div className="text-xs text-muted-foreground">{order.status}</div>
                      <div className="text-xs text-muted-foreground">{order.created_at?.slice(0, 16).replace('T', ' ')}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>最近訂單</CardTitle>
              <CardDescription>查看並管理最近的訂單</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>訂單編號</TableHead>
                    <TableHead>客戶</TableHead>
                    <TableHead>日期</TableHead>
                    <TableHead>金額</TableHead>
                    <TableHead>狀態</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mock data for recent orders */}
                  {/* {recentOrders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-medium">{order.id}</TableCell>
                      <TableCell>{order.customer}</TableCell>
                      <TableCell>{order.date}</TableCell>
                      <TableCell>{order.total}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            order.status === "已完成"
                              ? "bg-green-500/10 text-green-600"
                              : order.status === "運送中"
                                ? "bg-blue-500/10 text-blue-600"
                                : "bg-yellow-500/10 text-yellow-600"
                          }
                        >
                          {order.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))} */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>熱門商品</CardTitle>
              <CardDescription>查看銷售表現最好的商品</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>商品名稱</TableHead>
                    <TableHead className="text-right">銷售量</TableHead>
                    <TableHead className="text-right">銷售額</TableHead>
                    <TableHead className="text-right">庫存</TableHead>
                    <TableHead className="text-right">操作</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {/* Mock data for top products */}
                  {/* {topProducts.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell className="text-right">{product.sales} 件</TableCell>
                      <TableCell className="text-right">{product.revenue}</TableCell>
                      <TableCell className="text-right">{product.stock} 件</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="sm">
                          查看
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))} */}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">快速操作</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/products/new">
                  <Package className="mr-2 h-4 w-4" />
                  新增商品
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/orders">
                  <ShoppingCart className="mr-2 h-4 w-4" />
                  處理訂單
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/admin/analytics">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  查看銷售報表
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
