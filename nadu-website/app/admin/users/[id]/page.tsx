"use client"
import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default function UserDetailPage() {
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''
  const [user, setUser] = useState<any>(null)
  const [payments, setPayments] = useState<any[]>([])
  const [addresses, setAddresses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    setLoading(true)
    Promise.all([
      fetch(`/nadu-api/users-api.php?action=detail&id=${id}`).then(res => res.json()),
      fetch(`/nadu-api/payment-method-api.php?action=list&user_id=${id}`).then(res => res.json()),
      fetch(`/nadu-api/users-api.php?action=list_addresses&user_id=${id}`).then(res => res.json()),
    ]).then(([userRes, payRes, addrRes]) => {
      setUser(userRes.data || null)
      setPayments(payRes.data || [])
      setAddresses(addrRes.data || [])
      setLoading(false)
    })
  }, [id])

  if (loading) return <div className="container py-10">載入中...</div>
  if (!user) return <div className="container py-10">查無此會員</div>

  return (
    <div className="container py-10 space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>會員基本資料</CardTitle>
        </CardHeader>
        <CardContent>
          <div>姓名：{user.name}</div>
          <div>電子郵件：{user.email}</div>
          <div>電話：{user.phone || '-'}</div>
          <div>註冊日期：{user.created_at}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>付款方式</CardTitle>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? <div>無付款方式</div> : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>類型</TableHead>
                  <TableHead>卡號/帳號</TableHead>
                  <TableHead>持卡人/戶名</TableHead>
                  <TableHead>到期</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p: any) => (
                  <TableRow key={p.id}>
                    <TableCell>{p.type === 'credit_card' ? '信用卡' : '銀行帳戶'}</TableCell>
                    <TableCell>{p.card_number || p.bank_account || '-'}</TableCell>
                    <TableCell>{p.card_holder || '-'}</TableCell>
                    <TableCell>{p.expire_month && p.expire_year ? `${p.expire_month}/${p.expire_year}` : '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>收貨地址</CardTitle>
        </CardHeader>
        <CardContent>
          {addresses.length === 0 ? <div>無收貨地址</div> : (
            <ul className="space-y-2">
              {addresses.map((addr: any) => (
                <li key={addr.id}>{addr.address}</li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
} 