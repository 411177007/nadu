"use client"

import { useState, useEffect } from "react"
import { Calendar, Download } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, AreaChart, Area } from "recharts"
// @ts-expect-error: no types for react-date-range
import { DateRange } from 'react-date-range'
import { addDays, format } from 'date-fns'
import 'react-date-range/dist/styles.css'
import 'react-date-range/dist/theme/default.css'

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

// 銷售資料介面
interface SalesData {
  date: string
  orders: number
  revenue: number
  avgOrderValue: number
}

// 商品分析介面
interface ProductAnalytics {
  name: string
  sales: number
  revenue: number
  percentageOfTotal: number
}

// 客戶分析介面
interface CustomerAnalytics {
  newVsReturning: {
    new: number
    returning: number
  }
  topCustomers: {
    name: string
    orders: number
    spent: number
  }[]
}

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("daily")
  const [salesData, setSalesData] = useState<{ daily: SalesData[]; monthly: SalesData[] }>({
    daily: [],
    monthly: [],
  })
  const [topProducts, setTopProducts] = useState<ProductAnalytics[]>([])
  const [customerData, setCustomerData] = useState<CustomerAnalytics>({
    newVsReturning: { new: 0, returning: 0 },
    topCustomers: [],
  })
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<any>({})
  const [dateRange, setDateRange] = useState({
    startDate: addDays(new Date(), -29),
    endDate: new Date(),
    key: 'selection',
  })
  const [showDatePicker, setShowDatePicker] = useState(false)

  useEffect(() => {
    setLoading(true)
    const params = `?start=${format(dateRange.startDate, 'yyyy-MM-dd')}&end=${format(dateRange.endDate, 'yyyy-MM-dd')}`
    fetch(`http://localhost/nadu-api/analytics-api.php${params}`)
      .then(res => res.json())
      .then(data => {
        if (data.success && data.data) {
          setStats(data.data)
          setSalesData({ daily: data.data.daily, monthly: data.data.monthly })
          setTopProducts(data.data.topProducts)
          setCustomerData({
            newVsReturning: data.data.newVsReturning || { new: 0, returning: 0 },
            topCustomers: data.data.topCustomers || []
          })
        }
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [dateRange])

  // 百分比計算
  const totalCustomers = customerData.newVsReturning.new + customerData.newVsReturning.returning
  const newPercent = totalCustomers > 0 ? Math.round(customerData.newVsReturning.new / totalCustomers * 100) : 0
  const returningPercent = totalCustomers > 0 ? Math.round(customerData.newVsReturning.returning / totalCustomers * 100) : 0

  // 匯出報表
  function exportCSV() {
    const rows = [
      ['日期', '訂單數', '銷售額', '平均訂單金額'],
      ...(timeRange === 'daily' ? salesData.daily : salesData.monthly).map(row => [
        row.date,
        row.orders,
        row.revenue,
        row.avgOrderValue
      ])
    ]
    const csvContent = rows.map(e => e.join(",")).join("\n")
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.setAttribute('download', `sales_report_${format(dateRange.startDate, 'yyyyMMdd')}_${format(dateRange.endDate, 'yyyyMMdd')}.csv`)
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">銷售分析</h1>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => setShowDatePicker(v => !v)}>
            <Calendar className="mr-2 h-4 w-4" />
            {format(dateRange.startDate, 'yyyy/MM/dd')} - {format(dateRange.endDate, 'yyyy/MM/dd')}
          </Button>
          {showDatePicker && (
            <div className="absolute z-50 bg-white border rounded shadow mt-2">
              <DateRange
                editableDateInputs={true}
                onChange={(item: any) => setDateRange(item.selection)}
                moveRangeOnFirstSelection={false}
                ranges={[dateRange]}
                maxDate={new Date()}
                locale={undefined}
              />
            </div>
          )}
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="mr-2 h-4 w-4" />
            匯出報表
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">總銷售額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ {stats.totalRevenue?.toLocaleString?.('zh-TW', { minimumFractionDigits: 2 }) || 0}</div>
            <div className="mt-4 h-[80px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground text-xs">
              {loading ? '載入中...' : (
                <ResponsiveContainer width="100%" height={80}>
                  <AreaChart data={timeRange === 'daily' ? salesData.daily : salesData.monthly}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f59e42" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#f59e42" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" hide/>
                    <YAxis hide/>
                    <Area type="monotone" dataKey="revenue" stroke="#f59e42" fillOpacity={1} fill="url(#colorRevenue)" />
                  </AreaChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">訂單數</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.orders || 0}</div>
            <div className="mt-4 h-[80px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground text-xs">
              {loading ? '載入中...' : (
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={timeRange === 'daily' ? salesData.daily : salesData.monthly}>
                    <XAxis dataKey="date" hide/>
                    <YAxis hide/>
                    <Line type="monotone" dataKey="orders" stroke="#f59e42" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均訂單金額</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">NT$ {stats.avgOrder?.toLocaleString?.('zh-TW', { minimumFractionDigits: 2 }) || 0}</div>
            <div className="mt-4 h-[80px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground text-xs">
              {loading ? '載入中...' : (
                <ResponsiveContainer width="100%" height={80}>
                  <LineChart data={timeRange === 'daily' ? salesData.daily : salesData.monthly}>
                    <XAxis dataKey="date" hide/>
                    <YAxis hide/>
                    <Line type="monotone" dataKey="avgOrderValue" stroke="#f59e42" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">銷售分析</TabsTrigger>
          <TabsTrigger value="products">商品分析</TabsTrigger>
          <TabsTrigger value="customers">客戶分析</TabsTrigger>
        </TabsList>
        <TabsContent value="sales" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center">
              <div className="space-y-1.5">
                <CardTitle>銷售趨勢</CardTitle>
                <CardDescription>查看一段時間內的銷售趨勢</CardDescription>
              </div>
              <div className="ml-auto">
                <Select value={timeRange} onValueChange={setTimeRange}>
                  <SelectTrigger className="w-[120px]">
                    <SelectValue placeholder="選擇時間範圍" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="daily">每日</SelectItem>
                    <SelectItem value="monthly">每月</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full bg-muted/20 rounded-md flex items-center justify-center text-muted-foreground">
                {loading ? '載入中...' : (
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={timeRange === 'daily' ? salesData.daily : salesData.monthly} margin={{ top: 20, right: 30, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value: any) => typeof value === 'number' ? `NT$ ${value.toLocaleString('zh-TW', { minimumFractionDigits: 2 })}` : value} />
                      <Legend />
                      <Line type="monotone" dataKey="revenue" name="銷售額" stroke="#f59e42" strokeWidth={2} />
                      <Line type="monotone" dataKey="orders" name="訂單數" stroke="#44403c" strokeWidth={2} />
                      <Line type="monotone" dataKey="avgOrderValue" name="平均訂單金額" stroke="#a3a3a3" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </div>
              <div className="mt-6 rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>日期</TableHead>
                      <TableHead className="text-right">訂單數</TableHead>
                      <TableHead className="text-right">銷售額</TableHead>
                      <TableHead className="text-right">平均訂單金額</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          載入中...
                        </TableCell>
                      </TableRow>
                    ) : timeRange === "daily" ? (
                      salesData.daily.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={4} className="h-24 text-center">
                            尚無每日銷售資料
                          </TableCell>
                        </TableRow>
                      ) : (
                        salesData.daily.map((day) => (
                          <TableRow key={day.date}>
                            <TableCell>{day.date}</TableCell>
                            <TableCell className="text-right">{day.orders}</TableCell>
                            <TableCell className="text-right">NT$ {Number(day.revenue).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</TableCell>
                            <TableCell className="text-right">NT$ {Number(day.avgOrderValue).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ))
                      )
                    ) : salesData.monthly.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          尚無每月銷售資料
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesData.monthly.map((month) => (
                          <TableRow key={month.date}>
                            <TableCell>{month.date}</TableCell>
                            <TableCell className="text-right">{month.orders}</TableCell>
                          <TableCell className="text-right">NT$ {Number(month.revenue).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">NT$ {Number(month.avgOrderValue).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="products" className="space-y-4">
          <Card>
              <CardHeader>
                <CardTitle>熱門商品</CardTitle>
              <CardDescription>銷售表現最好的商品</CardDescription>
              </CardHeader>
              <CardContent>
              <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>商品名稱</TableHead>
                        <TableHead className="text-right">銷售量</TableHead>
                        <TableHead className="text-right">銷售額</TableHead>
                        <TableHead className="text-right">佔總銷售額比例</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                    {loading ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          載入中...
                        </TableCell>
                      </TableRow>
                    ) : topProducts.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={4} className="h-24 text-center">
                          尚無商品銷售資料
                        </TableCell>
                      </TableRow>
                    ) : (
                      topProducts.map((product) => (
                        <TableRow key={product.name}>
                          <TableCell>{product.name}</TableCell>
                          <TableCell className="text-right">{product.sales}</TableCell>
                          <TableCell className="text-right">NT$ {Number(product.revenue).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</TableCell>
                          <TableCell className="text-right">{product.percentageOfTotal}%</TableCell>
                        </TableRow>
                      ))
                    )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
        </TabsContent>
        <TabsContent value="customers" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>新舊客戶比例</CardTitle>
                <CardDescription>新客戶與回購客戶的比例</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-[200px] w-full flex items-center justify-center">
                  <ResponsiveContainer width="100%" height={200}>
                    <PieChart>
                      <Pie
                        data={totalCustomers === 0 ? [{ name: '無資料', value: 1 }] : [
                          { name: '新客戶', value: newPercent },
                          { name: '回購客戶', value: returningPercent },
                        ]}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        outerRadius={70}
                        label={totalCustomers === 0 ? undefined : ({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      >
                        {totalCustomers === 0 ? (
                          <Cell key="無資料" fill="#e5e5e5" />
                        ) : (
                          <>
                            <Cell key="新客戶" fill="#f59e42" />
                            <Cell key="回購客戶" fill="#44403c" />
                          </>
                        )}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-primary mr-2" style={{ background: '#f59e42' }}></div>
                      <span>新客戶</span>
                    </div>
                    <span>{newPercent}%</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="h-2 w-2 rounded-full bg-muted mr-2" style={{ background: '#44403c' }}></div>
                      <span>回購客戶</span>
                    </div>
                    <span>{returningPercent}%</span>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>最佳客戶</CardTitle>
                <CardDescription>消費金額最高的客戶</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>客戶名稱</TableHead>
                        <TableHead className="text-right">訂單數</TableHead>
                        <TableHead className="text-right">消費金額</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            載入中...
                          </TableCell>
                        </TableRow>
                      ) : customerData.topCustomers.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={3} className="h-24 text-center">
                            尚無客戶資料
                          </TableCell>
                        </TableRow>
                      ) : (
                        customerData.topCustomers.map((customer) => (
                          <TableRow key={customer.name}>
                            <TableCell>{customer.name}</TableCell>
                            <TableCell className="text-right">{customer.orders}</TableCell>
                            <TableCell className="text-right">NT$ {Number(customer.spent).toLocaleString('zh-TW', { minimumFractionDigits: 2 })}</TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
