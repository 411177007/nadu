"use client"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

export default function PaymentPage() {
  const [methods, setMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [type, setType] = useState("credit_card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardHolder, setCardHolder] = useState("")
  const [expireMonth, setExpireMonth] = useState("")
  const [expireYear, setExpireYear] = useState("")
  const [bankAccount, setBankAccount] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null

  const fetchMethods = async () => {
    if (!userId) return
    setLoading(true)
    const res = await fetch(`/nadu-api/payment-method-api.php?action=list&user_id=${userId}`)
    const data = await res.json()
    setMethods(data.success ? data.data : [])
    setLoading(false)
  }

  useEffect(() => {
    if (!userId) return
    fetchMethods()
  }, [userId])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(""); setSuccess("")
    if (!userId) return
    const formData = new URLSearchParams()
    formData.append("user_id", userId)
    formData.append("type", type)
    if (type === "credit_card") {
      formData.append("card_number", cardNumber)
      formData.append("card_holder", cardHolder)
      formData.append("expire_month", expireMonth)
      formData.append("expire_year", expireYear)
      formData.append("bank_account", "")
    } else {
      formData.append("card_number", "")
      formData.append("card_holder", "")
      formData.append("expire_month", "")
      formData.append("expire_year", "")
      formData.append("bank_account", bankAccount)
    }
    const res = await fetch("/nadu-api/payment-method-api.php?action=add", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: formData.toString(),
    })
    const data = await res.json()
    if (data.success) {
      setSuccess("新增成功！")
      setCardNumber("")
      setCardHolder("")
      setExpireMonth("")
      setExpireYear("")
      setBankAccount("")
      fetchMethods()
    } else {
      setError(data.message || "新增失敗")
    }
  }

  const handleDelete = async (id: number) => {
    if (!userId) return
    if (!confirm("確定要刪除這個付款方式？")) return
    const res = await fetch("/nadu-api/payment-method-api.php?action=delete", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ id: String(id), user_id: userId }).toString(),
    })
    const data = await res.json()
    if (data.success) {
      setSuccess("已刪除")
      fetchMethods()
    } else {
      setError(data.message || "刪除失敗")
    }
  }

  return (
    <div className="container py-10 max-w-xl">
      <h1 className="mb-6 text-2xl font-bold">付款方式管理</h1>
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>新增付款方式</CardTitle>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={handleAdd}>
            <div className="flex gap-4">
              <label>
                <input type="radio" name="type" value="credit_card" checked={type === "credit_card"} onChange={() => setType("credit_card")}/>
                信用卡
              </label>
              <label>
                <input type="radio" name="type" value="bank" checked={type === "bank"} onChange={() => setType("bank")}/>
                銀行帳戶
              </label>
            </div>
            {type === "credit_card" ? (
              <div className="grid gap-2">
                <label htmlFor="card-number" className="block mb-1 font-medium">卡號</label>
                <Input id="card-number" name="cardNumber" placeholder="卡號" value={cardNumber} onChange={e => setCardNumber(e.target.value)} required autoComplete="cc-number" />
                <label htmlFor="card-holder" className="block mb-1 font-medium">持卡人</label>
                <Input id="card-holder" name="cardHolder" placeholder="持卡人" value={cardHolder} onChange={e => setCardHolder(e.target.value)} required autoComplete="cc-name" />
                <div className="flex gap-2">
                  <label htmlFor="expire-month" className="block mb-1 font-medium">月</label>
                  <Input id="expire-month" name="expireMonth" placeholder="月" value={expireMonth} onChange={e => setExpireMonth(e.target.value)} required className="w-20" autoComplete="cc-exp-month" />
                  <label htmlFor="expire-year" className="block mb-1 font-medium">年</label>
                  <Input id="expire-year" name="expireYear" placeholder="年" value={expireYear} onChange={e => setExpireYear(e.target.value)} required className="w-28" autoComplete="cc-exp-year" />
                </div>
              </div>
            ) : (
              <Input placeholder="銀行帳號" value={bankAccount} onChange={e => setBankAccount(e.target.value)} required autoComplete="off" />
            )}
            {error && <div className="text-red-600 text-center">{error}</div>}
            {success && <div className="text-green-600 text-center">{success}</div>}
            <Button type="submit" className="w-full">新增付款方式</Button>
          </form>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>我的付款方式</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? <div>載入中...</div> : methods.length === 0 ? <div>尚無付款方式</div> : (
            <ul className="space-y-4">
              {methods.map(method => (
                <li key={method.id} className="flex justify-between items-center border-b pb-2">
                  <div>
                    <div className="font-medium">{method.type === "credit_card" ? "信用卡" : "銀行帳戶"}</div>
                    {method.type === "credit_card" ? (
                      <div className="text-sm">{method.card_holder} {method.card_number} 有效期:{method.expire_month}/{method.expire_year}</div>
                    ) : (
                      <div className="text-sm">{method.bank_account}</div>
                    )}
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDelete(method.id)}>刪除</Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 