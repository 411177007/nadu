"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ForgotPasswordPage() {
  const router = useRouter()
  const [email, setEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    setSuccess("")
    const res = await fetch("/nadu-api/users-api.php?action=reset_password", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ email, new_password: newPassword }).toString(),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success) {
      setSuccess("密碼已重設，請重新登入！")
      setTimeout(() => router.push("/login"), 1500)
    } else {
      setError(data.message || "重設失敗")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-black">忘記密碼</h1>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-black">Email</label>
          <Input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="text-black placeholder-black" placeholder="請輸入 Email" />
        </div>
        <div>
          <label htmlFor="new-password" className="block mb-1 font-medium text-black">新密碼</label>
          <Input id="new-password" name="new-password" type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required autoComplete="new-password" className="text-black placeholder-black" placeholder="請輸入新密碼" />
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        {success && <div className="text-green-600 text-sm text-center">{success}</div>}
        <Button type="submit" className="w-full" disabled={loading}>{loading ? "重設中..." : "重設密碼"}</Button>
      </form>
    </div>
  )
} 