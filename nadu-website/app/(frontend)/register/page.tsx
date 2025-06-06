"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function RegisterPage() {
  const router = useRouter()
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [phone, setPhone] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError("")
    const res = await fetch("/nadu-api/users-api.php?action=register", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name, email, password, phone }).toString(),
    })
    const data = await res.json()
    setLoading(false)
    if (data.success && data.data && data.data.id) {
      if (typeof window !== 'undefined') localStorage.setItem("userId", String(data.data.id))
      router.push("/account")
    } else {
      setError(data.message || "註冊失敗")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-neutral-900">會員註冊</h1>
        <div>
          <label htmlFor="name" className="block mb-1 font-medium text-neutral-900">姓名</label>
          <Input id="name" name="name" value={name} onChange={e => setName(e.target.value)} required autoComplete="name" className="text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 focus:border-primary" placeholder="請輸入姓名" />
        </div>
        <div>
          <label htmlFor="email" className="block mb-1 font-medium text-neutral-900">Email</label>
          <Input id="email" name="email" type="email" value={email} onChange={e => setEmail(e.target.value)} required autoComplete="email" className="text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 focus:border-primary" placeholder="請輸入 Email" />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-neutral-900">密碼</label>
          <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="new-password" className="text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 focus:border-primary" placeholder="請輸入密碼" />
        </div>
        <div>
          <label htmlFor="phone" className="block mb-1 font-medium text-neutral-900">手機</label>
          <Input id="phone" name="phone" value={phone} onChange={e => setPhone(e.target.value)} required autoComplete="tel" className="text-neutral-900 placeholder:text-neutral-400 bg-white border border-neutral-300 focus:border-primary" placeholder="請輸入手機號碼" />
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90" disabled={loading}>{loading ? "註冊中..." : "註冊"}</Button>
      </form>
    </div>
  )
} 