"use client"

import { useState, useEffect, FormEvent, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

interface Category {
  id: number
  name: string
  description?: string
  image?: string
  is_active?: number
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [isActive, setIsActive] = useState("1")
  const [editingId, setEditingId] = useState<number | null>(null)
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const [image, setImage] = useState("")
  const [imagePreview, setImagePreview] = useState("")
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    fetchCategories()
  }, [])

  const fetchCategories = async () => {
    setLoading(true)
    const res = await fetch("/nadu-api/category-api.php?action=list")
    const data = await res.json()
    if (data.success && Array.isArray(data.data)) {
      setCategories(data.data)
    }
    setLoading(false)
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    const formData = new URLSearchParams()
    formData.append("name", name)
    formData.append("description", description)
    formData.append("is_active", isActive)
    formData.append("image", image)
    let url = "/nadu-api/category-api.php?action=create"
    if (editingId) {
      formData.append("id", String(editingId))
      url = "/nadu-api/category-api.php?action=update"
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setName("")
      setDescription("")
      setIsActive("1")
      setEditingId(null)
      fetchCategories()
    } else {
      setError(data.message || "操作失敗")
    }
  }

  const handleEdit = (cat: Category) => {
    setEditingId(cat.id)
    setName(cat.name)
    setDescription(cat.description || "")
    setIsActive(cat.is_active ? String(cat.is_active) : "1")
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm("確定要刪除這個分類嗎？")) return
    setLoading(true)
    const formData = new URLSearchParams()
    formData.append("id", String(id))
    const res = await fetch("/nadu-api/category-api.php?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      fetchCategories()
    } else {
      setError(data.message || "刪除失敗")
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8">
      <Card>
        <CardHeader>
          <CardTitle>分類管理</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4 mb-8">
            <div>
              <label htmlFor="category-name" className="block mb-1 font-medium">分類名稱</label>
              <Input id="category-name" name="name" value={name} onChange={e => setName(e.target.value)} required autoComplete="off" />
            </div>
            <div>
              <label htmlFor="category-description" className="block mb-1 font-medium">描述</label>
              <Input id="category-description" name="description" value={description} onChange={e => setDescription(e.target.value)} autoComplete="off" />
            </div>
            <div>
              <label htmlFor="category-active" className="block mb-1 font-medium">啟用</label>
              <select id="category-active" name="is_active" className="w-full border rounded px-2 py-1" value={isActive} onChange={e => setIsActive(e.target.value)} required autoComplete="off">
                <option value="1">啟用</option>
                <option value="0">停用</option>
              </select>
            </div>
            <div>
              <label htmlFor="category-image" className="block mb-1 font-medium">分類圖片</label>
              <div className="border rounded-md p-4 text-center cursor-pointer bg-muted hover:bg-muted/50" onClick={() => fileInputRef.current?.click()}>
                {imagePreview ? (
                  <img src={imagePreview} alt="預覽" className="mx-auto max-h-32" />
                ) : (
                  <span>點擊上傳圖片</span>
                )}
                <input
                  ref={fileInputRef}
                  id="category-image"
                  name="image"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={e => {
                    const file = e.target.files?.[0]
                    if (file) {
                      const reader = new FileReader()
                      reader.onload = ev => {
                        setImage(ev.target?.result as string)
                        setImagePreview(ev.target?.result as string)
                      }
                      reader.readAsDataURL(file)
                    }
                  }}
                  autoComplete="off"
                />
              </div>
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
            <Button type="submit" disabled={loading} className="w-full">{editingId ? "儲存變更" : "新增分類"}</Button>
            {editingId && <Button type="button" variant="outline" className="w-full mt-2" onClick={() => {
              setEditingId(null); setName(""); setDescription(""); setIsActive("1")
            }}>取消編輯</Button>}
          </form>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>名稱</TableHead>
                <TableHead>描述</TableHead>
                <TableHead>狀態</TableHead>
                <TableHead>操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map(cat => (
                <TableRow key={cat.id}>
                  <TableCell>{cat.name}</TableCell>
                  <TableCell>{cat.description}</TableCell>
                  <TableCell>{cat.is_active ? "啟用" : "停用"}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" onClick={() => handleEdit(cat)}>編輯</Button>
                    <Button size="sm" variant="destructive" className="ml-2" onClick={() => handleDelete(cat.id)}>刪除</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
} 