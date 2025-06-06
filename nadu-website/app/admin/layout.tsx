'use client'
import type React from "react"
import Link from "next/link"
import { BarChart3, Home, Package, Settings, ShoppingCart, Users } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { ModeToggle } from "@/components/mode-toggle"

interface AdminLayoutProps {
  children: React.ReactNode
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 flex h-16 items-center gap-4 border-b bg-background px-6">
        <Link href="/admin" className="flex items-center gap-2 font-semibold">
          <Package className="h-6 w-6" />
          <span>Nadu 管理後台</span>
        </Link>
        <nav className="hidden flex-1 items-center gap-6 md:flex">
          <Link
            href="/admin"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            儀表板
          </Link>
          <Link
            href="/admin/products"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            商品管理
          </Link>
          <Link
            href="/admin/orders"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            訂單管理
          </Link>
          <Link
            href="/admin/categories"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            分類管理
          </Link>
          <Link
            href="/admin/users"
            className="text-sm font-medium text-muted-foreground transition-colors hover:text-primary"
          >
            會員管理
          </Link>
        </nav>
        <div className="flex items-center gap-2">
          <ModeToggle />
          <Link href="/">
            <Button variant="outline" size="sm">
              前台首頁
            </Button>
          </Link>
        </div>
      </header>
      <div className="flex flex-1">
        <aside className="hidden w-64 border-r bg-muted/40 md:block">
          <nav className="grid gap-2 p-4 text-sm">
            <Link href="/admin">
              <Button variant="ghost" className={cn("w-full justify-start font-normal")}>
                <Home className="mr-2 h-4 w-4" />
                儀表板
              </Button>
            </Link>
            <Link href="/admin/products">
              <Button variant="ghost" className={cn("w-full justify-start font-normal")}>
                <Package className="mr-2 h-4 w-4" />
                商品管理
              </Button>
            </Link>
            <Link href="/admin/orders">
              <Button variant="ghost" className={cn("w-full justify-start font-normal")}>
                <ShoppingCart className="mr-2 h-4 w-4" />
                訂單管理
              </Button>
            </Link>
            <Link href="/admin/categories">
              <Button variant="ghost" className={cn("w-full justify-start font-normal")}>
                <Settings className="mr-2 h-4 w-4" />
                分類管理
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="ghost" className={cn("w-full justify-start font-normal")}>
                <Users className="mr-2 h-4 w-4" />
                會員管理
              </Button>
            </Link>
            <Link href="/admin/analytics">
              <Button variant="ghost" className={cn("w-full justify-start font-normal")}>
                <BarChart3 className="mr-2 h-4 w-4" />
                銷售分析
              </Button>
            </Link>
          </nav>
        </aside>
        <main className="flex-1 p-6">{children}</main>
      </div>
    </div>
  )
}
