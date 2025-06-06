"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function AccountSettingsPage() {
  const [oldPassword, setOldPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const router = useRouter()
  const userId = typeof window !== 'undefined' ? localStorage.getItem('userId') : null

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!userId) { setError("請重新登入"); return }
    if (!oldPassword || !newPassword || !confirmPassword) { setError("請填寫所有欄位"); return }
    if (newPassword !== confirmPassword) { setError("新密碼不一致"); return }
    setLoading(true)
    const formData = new URLSearchParams()
    formData.append("user_id", userId)
    formData.append("old_password", oldPassword)
    formData.append("new_password", newPassword)
    const res = await fetch("/nadu-api/users-api.php?action=reset_password", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setSuccess("密碼已更新，請重新登入")
      setOldPassword("")
      setNewPassword("")
      setConfirmPassword("")
      setTimeout(() => { if (typeof window !== 'undefined') localStorage.removeItem('userId'); window.location.href = '/login' }, 1500)
    } else {
      setError(data.message || "密碼更新失敗")
    }
  }

  const handleDeleteAccount = async () => {
    if (!confirm("確定要刪除帳號嗎？此操作無法復原！")) return
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
    if (!userId) {
      setError("請先登入")
      return
    }
    setLoading(true)
    const res = await fetch("/nadu-api/users-api.php?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ user_id: userId }).toString(),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setSuccess("帳號已刪除")
      setTimeout(() => {
        if (typeof window !== 'undefined') localStorage.removeItem('userId')
        router.replace('/')
      }, 1500)
    } else {
      setError(data.message || "帳號刪除失敗")
    }
  }

  return (
    <div className="container py-10 max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">帳號設定</h1>
      <Card>
        <CardHeader>
          <CardTitle>變更密碼</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleChangePassword}>
            <div className="grid gap-2">
              <label htmlFor="old-password">舊密碼</label>
              <Input id="old-password" type="password" value={oldPassword} onChange={e => setOldPassword(e.target.value)} required autoComplete="current-password" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="new-password">新密碼</label>
              <Input id="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            <div className="grid gap-2">
              <label htmlFor="confirm-password">確認新密碼</label>
              <Input id="confirm-password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required autoComplete="new-password" />
            </div>
            {error && <div className="text-red-600 text-center">{error}</div>}
            {success && <div className="text-green-600 text-center">{success}</div>}
            <Button type="submit" className="w-full" disabled={loading}>{loading ? "儲存中..." : "變更密碼"}</Button>
          </form>
        </CardContent>
      </Card>
      <Card className="mt-8">
        <CardHeader>
          <CardTitle>刪除帳號</CardTitle>
        </CardHeader>
        <CardContent>
          <Button variant="destructive" className="w-full" onClick={handleDeleteAccount} disabled={loading}>刪除帳號</Button>
        </CardContent>
      </Card>
    </div>
  )
} 