"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { CreditCard, LogOut, Package, Settings, User } from "lucide-react"
import { useRouter } from "next/navigation"
import Image from "next/image"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { apiGet, User as UserType, Order } from "@/lib/api"

export default function AccountPage() {
  const router = useRouter()
  const [user, setUser] = useState<UserType | null>(null)
  const [orders, setOrders] = useState<Order[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [editName, setEditName] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [success, setSuccess] = useState("")
  const [error, setError] = useState("")
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [avatarUploading, setAvatarUploading] = useState(false)

  useEffect(() => {
    const storedId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null;
    if (!storedId) {
      router.replace('/login')
      return
    }
    setUserId(storedId)
  }, [router])

  useEffect(() => {
    if (!userId) return;
    setLoading(true)
    setError("")
    Promise.all([
      fetch(`/nadu-api/users-api.php?action=profile&user_id=${userId}`).then(res => res.json()),
      fetch(`/nadu-api/order-api.php?action=list&user_id=${userId}`).then(res => res.json())
    ]).then(([userRes, orderRes]) => {
      if (userRes.success && userRes.data) {
        setUser(userRes.data)
        setEditName(userRes.data.name || "")
        setEditPhone(userRes.data.phone || "")
      } else {
        setError(userRes.message || "會員資料取得失敗")
      }
      if (orderRes.success && orderRes.data && Array.isArray(orderRes.data.orders)) {
        setOrders(orderRes.data.orders)
      }
      setLoading(false)
    }).catch(() => { setLoading(false); setError("資料載入失敗") })
  }, [userId])

  const handleUpdateProfile = async () => {
    if (!userId) return;
    setSuccess(""); setError("")
    const formData = new URLSearchParams();
    formData.append("user_id", userId);
    formData.append("name", editName);
    formData.append("phone", editPhone);
    const res = await fetch("/nadu-api/users-api.php?action=update", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    });
    const data = await res.json();
    if (data.success) {
      setSuccess("會員資料已更新！")
      setUser((u) => u ? { ...u, name: editName, phone: editPhone } : u)
    } else {
      setError(data.message || "更新失敗")
    }
  }

  const handleLogout = () => {
    if (typeof window !== 'undefined') localStorage.removeItem('userId')
    router.replace('/login')
  }

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setAvatarFile(file)
    const reader = new FileReader()
    reader.onload = (ev) => {
      setAvatarPreview(ev.target?.result as string)
    }
    reader.readAsDataURL(file)
  }

  const handleAvatarUpload = async () => {
    if (!avatarFile || !userId || !avatarPreview) return
    setAvatarUploading(true)
    const res = await fetch("/nadu-api/users-api.php?action=upload_avatar", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ user_id: userId, avatar: avatarPreview }).toString(),
    })
    const data = await res.json()
    setAvatarUploading(false)
    if (data.success && data.data?.avatar) {
      setUser((u) => u ? { ...u, avatar: `/nadu-api/${data.data.avatar}` } : u)
      setAvatarPreview(null)
      setAvatarFile(null)
      alert("頭像已更新！")
    } else {
      alert(data.message || "頭像上傳失敗")
    }
  }

  if (loading) return <div className="container py-10">載入中...</div>

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">會員中心</h1>
      {error && <div className="text-red-600 mb-4">{error}</div>}
      {success && <div className="text-green-600 mb-4">{success}</div>}
      <div className="grid gap-6 md:grid-cols-[250px_1fr]">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col items-center space-y-4">
              <div className="flex flex-col items-center gap-2 w-full">
                <div className="relative w-24 h-24 mb-2">
              <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarPreview || user?.avatar || "/placeholder.svg"} alt={user?.name} />
                <AvatarFallback>{user?.name?.slice(0, 1)}</AvatarFallback>
              </Avatar>
                  {avatarPreview && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center rounded-full">
                      <span className="text-white text-xs">預覽</span>
                    </div>
                  )}
                </div>
                <label className="block w-full">
                  <input type="file" accept="image/*" onChange={handleAvatarChange} className="hidden" />
                  <Button asChild variant="outline" className="w-full"><span>選擇新頭像</span></Button>
                </label>
                {avatarPreview && (
                  <Button size="sm" className="w-full" onClick={handleAvatarUpload} disabled={avatarUploading}>
                    {avatarUploading ? "上傳中..." : "儲存頭像"}
                  </Button>
                )}
              </div>
              <div className="space-y-1 text-center">
                <h2 className="text-xl font-bold">{user?.name}</h2>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
              <div className="w-full space-y-1 text-center">
                <Badge variant="outline" className="w-full justify-center">{user?.level}</Badge>
                <p className="text-xs text-muted-foreground">會員點數: {user?.points} 點</p>
              </div>
            </div>
            <Separator className="my-6" />
            <nav className="flex flex-col space-y-1">
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/account"><User className="mr-2 h-4 w-4" />會員資料</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/account/orders"><Package className="mr-2 h-4 w-4" />訂單查詢</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/account/payment"><CreditCard className="mr-2 h-4 w-4" />付款方式</Link>
              </Button>
              <Button variant="ghost" className="justify-start" asChild>
                <Link href="/account/settings"><Settings className="mr-2 h-4 w-4" />帳號設定</Link>
              </Button>
              <Button variant="ghost" className="justify-start text-red-500 hover:text-red-500" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />登出
              </Button>
            </nav>
          </CardContent>
        </Card>
        <div className="space-y-6">
          <Tabs defaultValue="profile">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="profile">個人資料</TabsTrigger>
              <TabsTrigger value="orders">訂單記錄</TabsTrigger>
              <TabsTrigger value="settings">帳號設定</TabsTrigger>
            </TabsList>
            <TabsContent value="profile" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>個人資料</CardTitle>
                  <CardDescription>查看並更新您的個人資料</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid gap-2">
                    <Label htmlFor="name">姓名</Label>
                    <Input id="name" value={editName} onChange={e => setEditName(e.target.value)} autoComplete="name" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="email">電子郵件</Label>
                    <Input id="email" type="email" value={user?.email || ""} disabled autoComplete="email" />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="phone">手機號碼</Label>
                    <Input id="phone" type="tel" value={editPhone} onChange={e => setEditPhone(e.target.value)} autoComplete="tel" />
                  </div>
                </CardContent>
                <CardFooter>
                  <Button onClick={handleUpdateProfile}>儲存變更</Button>
                </CardFooter>
              </Card>
            </TabsContent>
            <TabsContent value="orders" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>訂單記錄</CardTitle>
                  <CardDescription>查看您的訂單歷史記錄和狀態</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders.length === 0 && <div className="text-muted-foreground">尚無訂單記錄</div>}
                    {orders.map((order) => (
                      <div key={order.id} className="rounded-lg border p-4 hover:bg-muted/50">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-medium">訂單編號：{order.id}</h3>
                            <p className="text-sm text-muted-foreground">{order.date} · {order.items} 件商品</p>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="text-right">
                              <p className="font-medium">NT$ {order.total}</p>
                              <Badge variant="outline" className={order.status === "已完成" ? "bg-green-500/10 text-green-600" : order.status === "運送中" ? "bg-blue-500/10 text-blue-600" : "bg-yellow-500/10 text-yellow-600"}>{order.status}</Badge>
                            </div>
                            <Button variant="ghost" size="sm">查看詳情</Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="settings" className="mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>帳號設定</CardTitle>
                  <CardDescription>管理您的帳號設定和密碼</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-4">
                    <h3 className="font-medium">變更密碼</h3>
                    <div className="grid gap-2">
                      <Label htmlFor="current-password">目前密碼</Label>
                      <Input id="current-password" type="password" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="new-password">新密碼</Label>
                      <Input id="new-password" type="password" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="confirm-password">確認新密碼</Label>
                      <Input id="confirm-password" type="password" />
                    </div>
                  </div>
                </CardContent>
                <CardFooter>
                  <Button>更新密碼</Button>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  )
}
