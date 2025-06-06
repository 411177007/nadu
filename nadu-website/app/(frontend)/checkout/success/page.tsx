"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"

export default function CheckoutSuccessPage() {
  return (
    <div className="container py-20 flex flex-col items-center">
      <h1 className="text-3xl font-bold mb-4">訂單已成立！</h1>
      <p className="mb-8">感謝您的訂購，我們會盡快為您處理。</p>
      <div className="flex gap-4">
        <Link href="/">
          <Button>回首頁</Button>
        </Link>
        <Link href="/account/orders">
          <Button variant="outline">查看訂單</Button>
        </Link>
      </div>
    </div>
  )
} 