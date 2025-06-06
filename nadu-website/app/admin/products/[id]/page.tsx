"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function ProductEditPage() {
  const router = useRouter()
  const params = useParams()
  const id = params?.id as string
  const [name, setName] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [priceMin, setPriceMin] = useState("")
  const [priceMax, setPriceMax] = useState("")
  const [stock, setStock] = useState("")
  const [status, setStatus] = useState("published")
  const [image, setImage] = useState("")
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [description, setDescription] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imagePreview, setImagePreview] = useState<string>("")
  const [quantity, setQuantity] = useState(1)

  useEffect(() => {
    fetch("/nadu-api/category-api.php?action=list")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setCategories(data.data)
        }
      })
  }, [])

  useEffect(() => {
    if (!id) return
    fetch(`/nadu-api/product-api.php?action=detail&id=${id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setName(data.data.name || "")
          setCategoryId(String(data.data.category_id) || "")
          setPriceMin(String(data.data.price) || "")
          setPriceMax(String(data.data.original_price) || "")
          setStock(String(data.data.stock) || "")
          setStatus(data.data.status || "published")
          setImage(data.data.image || "")
          setImagePreview(data.data.image ? `/nadu-api/${data.data.image}` : "")
          setDescription(data.data.description || "")
          setQuantity(1)
        }
      })
  }, [id])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    if (!name || !categoryId || !priceMin || !priceMax || !stock) {
      setError("請填寫所有必填欄位")
      setLoading(false)
      return
    }
    const formData = new URLSearchParams()
    formData.append("id", id)
    formData.append("name", name)
    formData.append("category_id", categoryId)
    formData.append("price", priceMin)
    formData.append("original_price", priceMax)
    formData.append("stock", stock)
    formData.append("status", status)
    formData.append("image", image)
    formData.append("description", description)
    const res = await fetch("/nadu-api/product-api.php?action=update", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      router.push("/admin/products")
    } else {
      setError(data.message || "更新失敗")
    }
  }

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImage(ev.target?.result as string)
        setImagePreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (ev) => {
        setImage(ev.target?.result as string)
        setImagePreview(ev.target?.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  return (
    <div className="max-w-xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>編輯商品</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="product-name" className="block mb-1 font-medium">商品名稱</label>
              <Input id="product-name" name="name" value={name} onChange={e => setName(e.target.value)} required autoComplete="off" />
            </div>
            <div>
              <label htmlFor="product-category" className="block mb-1 font-medium">分類</label>
              <Select value={categoryId} onValueChange={setCategoryId} required name="category_id">
                <SelectTrigger id="product-category">
                  <SelectValue placeholder="請選擇分類" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={String(cat.id)}>{cat.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="product-price-min" className="block mb-1 font-medium">價格區間</label>
              <div className="flex gap-2">
                <Input id="product-price-min" name="price" type="number" min="0" value={priceMin} onChange={e => setPriceMin(e.target.value)} required placeholder="最低價" autoComplete="off" />
                <span className="self-center">~</span>
                <Input id="product-price-max" name="original_price" type="number" min="0" value={priceMax} onChange={e => setPriceMax(e.target.value)} required placeholder="最高價" autoComplete="off" />
              </div>
            </div>
            <div>
              <label htmlFor="product-stock" className="block mb-1 font-medium">庫存</label>
              <Input id="product-stock" name="stock" type="number" min="0" value={stock} onChange={e => setStock(e.target.value)} required autoComplete="off" />
            </div>
            <div>
              <label htmlFor="product-status" className="block mb-1 font-medium">狀態</label>
              <Select value={status} onValueChange={setStatus} required name="status">
                <SelectTrigger id="product-status">
                  <SelectValue placeholder="請選擇狀態" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="published">上架中</SelectItem>
                  <SelectItem value="draft">草稿</SelectItem>
                  <SelectItem value="out_of_stock">缺貨中</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label htmlFor="product-image" className="block mb-1 font-medium">主圖上傳</label>
              <div
                className="border rounded-md p-4 text-center cursor-pointer bg-muted hover:bg-muted/50"
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
              >
                {imagePreview ? (
                  <img src={imagePreview} alt="預覽" className="mx-auto max-h-40" />
                ) : (
                  <span>點擊或拖曳圖片到這裡上傳</span>
                )}
                <input
                  ref={fileInputRef}
                  id="product-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                  autoComplete="off"
                />
              </div>
            </div>
            <div>
              <label htmlFor="product-description" className="block mb-1 font-medium">商品描述</label>
              <Textarea id="product-description" name="description" value={description} onChange={e => setDescription(e.target.value)} required placeholder="請輸入商品描述" autoComplete="off" rows={4} />
            </div>
            <div>
              <label htmlFor="product-quantity" className="block mb-1 font-medium">數量</label>
              <div className="flex gap-2 items-center">
                <button type="button" aria-label="減少數量" onClick={() => setQuantity(q => Math.max(1, q - 1))}>-</button>
                <input
                  id="product-quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-16 text-center border rounded"
                  autoComplete="off"
                  aria-label="商品數量"
                />
                <button type="button" aria-label="增加數量" onClick={() => setQuantity(q => q + 1)}>+</button>
              </div>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">{loading ? "儲存中..." : "儲存變更"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 