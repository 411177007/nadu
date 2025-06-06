"use client"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function AdminLoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [showReset, setShowReset] = useState(false)
  const [resetUser, setResetUser] = useState("")
  const [resetPwd, setResetPwd] = useState("")
  const [resetMsg, setResetMsg] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    try {
      const res = await fetch("/nadu-api/admin-auth-api.php?action=login", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username, password }).toString(),
      })
      const data = await res.json()
      if (data.success && data.token) {
        localStorage.setItem("adminToken", data.token)
        router.replace("/admin")
      } else {
        setError(data.message || "登入失敗")
      }
    } catch {
      setError("API 請求失敗")
    }
  }

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetMsg("")
    try {
      const res = await fetch("/nadu-api/admin-auth-api.php?action=reset_password", {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({ username: resetUser, new_password: resetPwd }).toString(),
      })
      const data = await res.json()
      if (data.success) {
        setResetMsg("密碼已重設，請重新登入")
      } else {
        setResetMsg(data.message || "重設失敗")
      }
    } catch {
      setResetMsg("API 請求失敗")
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-muted">
      <form onSubmit={handleSubmit} className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-6">
        <h1 className="text-2xl font-bold mb-4 text-center text-neutral-900">後台登入</h1>
        <div>
          <label htmlFor="username" className="block mb-1 font-medium text-neutral-900">帳號</label>
          <Input id="username" name="username" value={username} onChange={e => setUsername(e.target.value)} required autoComplete="username" />
        </div>
        <div>
          <label htmlFor="password" className="block mb-1 font-medium text-neutral-900">密碼</label>
          <Input id="password" name="password" type="password" value={password} onChange={e => setPassword(e.target.value)} required autoComplete="current-password" />
        </div>
        {error && <div className="text-red-600 text-sm text-center">{error}</div>}
        <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">登入</Button>
        <Button type="button" variant="link" className="w-full" onClick={() => setShowReset(v => !v)}>
          {showReset ? "返回登入" : "忘記/重設密碼"}
        </Button>
        {showReset && (
          <form onSubmit={handleReset} className="space-y-2 mt-4">
            <div>
              <label htmlFor="reset-user" className="block mb-1 font-medium text-neutral-900">帳號</label>
              <Input id="reset-user" name="reset-user" value={resetUser} onChange={e => setResetUser(e.target.value)} required autoComplete="username" />
            </div>
            <div>
              <label htmlFor="reset-pwd" className="block mb-1 font-medium text-neutral-900">新密碼</label>
              <Input id="reset-pwd" name="reset-pwd" type="password" value={resetPwd} onChange={e => setResetPwd(e.target.value)} required autoComplete="new-password" />
            </div>
            <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90">重設密碼</Button>
            {resetMsg && <div className="text-center text-sm mt-2 text-green-600">{resetMsg}</div>}
          </form>
        )}
      </form>
    </div>
  )
} 