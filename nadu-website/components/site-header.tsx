"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Search, ShoppingCart, User } from "lucide-react"
import { useEffect, useState } from "react"
import { apiGet, Category } from "@/lib/api"
import { useCart } from "@/hooks/CartContext"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
} from "@/components/ui/navigation-menu"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { ModeToggle } from "@/components/mode-toggle"

export function SiteHeader() {
  const pathname = usePathname()
  const isAdmin = pathname.startsWith("/admin")

  const [categories, setCategories] = useState<Category[]>([])
  const [search, setSearch] = useState("")
  const { cartItems } = useCart()
  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0)

  useEffect(() => {
    apiGet<any[]>("/nadu-api/category-api.php?action=list")
      .then(data => {
        console.log('API 回傳分類資料', data)
        setCategories((data || []).map((c: any) => ({
          id: Number(c.id),
          name: c.name
        })))
      })
      .catch((err) => {
        console.log('API 請求失敗', err)
        setCategories([])
      })
  }, [])

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) window.location.href = `/search?keyword=${encodeURIComponent(search)}`;
  };

  if (isAdmin) {
    return null
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        <Link href="/" className="mr-6 flex items-center space-x-2">
          <span className="text-xl font-bold">Nadu</span>
        </Link>
        <div className="flex flex-1 items-center justify-between space-x-2 md:justify-end">
          <div className="w-full flex-1 md:w-auto md:flex-none">
            <form onSubmit={handleSearch} className="flex items-center gap-2">
              <label htmlFor="header-search" className="sr-only">搜尋商品</label>
              <Input
                id="header-search"
                name="header-search"
                type="search"
                placeholder="搜尋商品..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-40 md:w-64"
              />
              <Button type="submit" size="icon" variant="outline">
                <Search className="h-4 w-4" />
              </Button>
            </form>
          </div>
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/"
              className={cn(
                "flex items-center text-lg font-medium transition-colors hover:text-primary",
                pathname === "/" ? "text-primary" : "text-foreground",
              )}
            >
              首頁
            </Link>
          </nav>
          <div className="flex items-center gap-2">
            <Link href="/cart">
              <Button variant="ghost" size="icon" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                    {cartCount}
                </span>
                )}
              </Button>
            </Link>
            <Link href="/account">
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </Link>
            <ModeToggle />
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="icon" className="md:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                  <span className="sr-only">Toggle Menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4">
                  <Link href="/" className="text-lg font-medium transition-colors hover:text-primary">
                    首頁
                  </Link>
                  <Link href="/cart" className="text-lg font-medium transition-colors hover:text-primary">
                    購物車
                  </Link>
                  <Link href="/account" className="text-lg font-medium transition-colors hover:text-primary">
                    會員中心
                  </Link>
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
