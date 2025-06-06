"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Edit, MoreHorizontal, Plus, Search, Trash2 } from "lucide-react"

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
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type Product = {
  id: number
  name: string
  category_id: number
  category_name: string
  price: number
  stock: number
  status: string
  [key: string]: any
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [categories, setCategories] = useState<{id:number, name:string}[]>([])

  useEffect(() => {
    setLoading(true)
    let url = `/nadu-api/product-api.php?action=list&status=${statusFilter}`
    if (categoryFilter !== "all") url += `&category_name=${encodeURIComponent(categoryFilter)}`
    if (searchTerm) url += `&search=${encodeURIComponent(searchTerm)}`
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.products) {
          setProducts(data.data.products)
        } else if (data.success && Array.isArray(data.data)) {
          setProducts(data.data)
        } else {
          setProducts([])
        }
        setLoading(false)
      })
    // 取得分類
    fetch('/nadu-api/category-api.php?action=list')
      .then(res => res.json())
      .then(data => {
        if (data.success && Array.isArray(data.data)) setCategories(data.data)
      })
  }, [searchTerm, categoryFilter, statusFilter])

  const filteredProducts = products.filter((product: Product) => {
    const matchesSearch = product.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesCategory = categoryFilter === "all" || product.category_name === categoryFilter
    const matchesStatus = statusFilter === "all" || product.status === statusFilter
    return matchesSearch && matchesCategory && matchesStatus
  })

  const handleDeleteProduct = async (id: number) => {
    if (!window.confirm('確定要刪除這個商品嗎？')) return;
    const formData = new URLSearchParams();
    formData.append('id', String(id));
    const res = await fetch(`/nadu-api/product-api.php?action=delete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: formData.toString(),
    });
    const data = await res.json();
    if (data.success) {
      setProducts(products.filter((product) => product.id !== id));
    } else {
      alert(data.message || '刪除失敗');
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">商品管理</h1>
        <Link href="/admin/products/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            新增商品
          </Button>
        </Link>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>商品列表</CardTitle>
          <CardDescription>管理您的商品，包括編輯、上架和下架</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="mb-4 flex flex-col gap-4 md:flex-row">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <label htmlFor="product-search" className="sr-only">搜尋商品</label>
                <Input
                  id="product-search"
                  name="product-search"
                  type="search"
                  placeholder="搜尋商品..."
                  className="pl-8"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="商品分類" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有分類</SelectItem>
                  {categories.map(c => (
                    <SelectItem key={c.id} value={c.name}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="商品狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">所有狀態</SelectItem>
                  <SelectItem value="published">上架中</SelectItem>
                  <SelectItem value="out_of_stock">缺貨中</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>商品名稱</TableHead>
                  <TableHead>分類</TableHead>
                  <TableHead className="text-right">價格</TableHead>
                  <TableHead className="text-right">庫存</TableHead>
                  <TableHead>狀態</TableHead>
                  <TableHead className="text-right">操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProducts.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="h-24 text-center">
                      沒有找到符合條件的商品
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProducts.map((product: Product) => (
                    <TableRow key={product.id}>
                      <TableCell className="font-medium">{product.name}</TableCell>
                      <TableCell>{product.category_name}</TableCell>
                      <TableCell className="text-right">NT$ {product.price}</TableCell>
                      <TableCell className="text-right">{product.stock}</TableCell>
                      <TableCell>
                        <Badge
                          variant="outline"
                          className={
                            product.status === "published"
                              ? "bg-green-500/10 text-green-600"
                              : product.status === "out_of_stock"
                                ? "bg-red-500/10 text-red-600"
                                : "bg-yellow-500/10 text-yellow-600"
                          }
                        >
                          {product.status === "published"
                            ? "上架中"
                            : product.status === "out_of_stock"
                              ? "缺貨中"
                              : "草稿"}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <span className="sr-only">開啟選單</span>
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>操作</DropdownMenuLabel>
                            <DropdownMenuItem>
                              <Link href={`/admin/products/${product.id}`} className="flex w-full items-center">
                                <Edit className="mr-2 h-4 w-4" />
                                編輯
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => handleDeleteProduct(product.id)}>
                              <Trash2 className="mr-2 h-4 w-4" />
                              刪除
                            </DropdownMenuItem>
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
