import type React from "react"
import { SiteFooter } from "@/components/site-footer"
import { SiteHeader } from "@/components/site-header"
import { CartProvider } from "@/hooks/CartContext"

export default function FrontendLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <CartProvider>
    <div className="relative flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
    </div>
    </CartProvider>
  )
}
