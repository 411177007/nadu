"use client"

import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { apiGet, Product, Category } from "@/lib/api"

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([])
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [heroImage, setHeroImage] = useState<string | null>(null)
  const [carouselIndex, setCarouselIndex] = useState(0)
  const router = useRouter()
  const [search, setSearch] = useState("")

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiGet<{ categories: Category[] }>("/nadu-api/category-api.php?action=list"),
      apiGet<{ products: Product[] }>("/nadu-api/product-api.php?action=list&limit=8"),
      apiGet<{ image: string | null }>("/nadu-api/hero-image-api.php?action=get")
    ]).then(([catRes, prodRes, heroRes]) => {
      setCategories(Array.isArray(catRes) ? catRes : catRes.categories || [])
      setFeaturedProducts(prodRes.products)
      setHeroImage(heroRes.image)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [])

  useEffect(() => {
    if (featuredProducts.length === 0) return
    const timer = setInterval(() => {
      setCarouselIndex(idx => (idx + 1) % featuredProducts.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [featuredProducts])

  return (
    <div className="flex flex-col gap-12 pb-8">
      {/* Header 搜尋列 */}
      <div className="flex items-center gap-2 px-6 py-4">
        <span className="text-2xl font-bold">Nadu</span>
        <form className="flex-1 flex gap-2" onSubmit={e => { e.preventDefault(); if (search) router.push(`/search?q=${encodeURIComponent(search)}`) }}>
          <input
            type="text"
            placeholder="搜尋商品..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="flex-1 rounded border px-3 py-2 bg-transparent text-white"
            name="q"
            id="search-input"
            autoComplete="off"
          />
          <Button type="submit" variant="outline">搜尋</Button>
        </form>
      </div>

      {/* Hero Section */}
      <section className="w-full bg-muted py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid gap-6 lg:grid-cols-2 lg:gap-12">
            <div className="flex flex-col justify-center space-y-4">
              <div className="space-y-2">
                <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">Nadu 官方代購網站</h1>
                <p className="max-w-[600px] text-muted-foreground md:text-xl">
                  精選全球優質商品，為您帶來最優質的購物體驗
                </p>
              </div>
              <div className="flex flex-col gap-2 min-[400px]:flex-row">
                <a href="#featured-products">
                  <Button size="lg" className="bg-primary text-primary-foreground">
                    立即購物
                  </Button>
                </a>
                <Link href="/about">
                  <Button size="lg" variant="outline">
                    了解更多
                  </Button>
                </Link>
              </div>
            </div>
            <div className="flex items-center justify-center relative">
              {featuredProducts.length > 0 ? (
                <div className="relative w-[500px] h-[500px]">
              <Image
                    src={featuredProducts[carouselIndex]?.image ? `/nadu-api/${featuredProducts[carouselIndex].image}` : "/placeholder.svg"}
                    alt={featuredProducts[carouselIndex]?.name || "熱門商品"}
                width={500}
                height={500}
                    className="rounded-lg object-cover w-full h-full"
              />
                  <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                    {featuredProducts.map((_, idx) => (
                      <button key={idx} className={`w-3 h-3 rounded-full ${carouselIndex === idx ? 'bg-primary' : 'bg-gray-300'}`} onClick={() => setCarouselIndex(idx)} />
                    ))}
                  </div>
                  <div className="absolute bottom-12 left-0 right-0 text-center text-white text-xl font-bold drop-shadow">
                    {featuredProducts[carouselIndex]?.name}
                  </div>
                </div>
              ) : (
                <div className="w-[500px] h-[500px] bg-gray-200 flex items-center justify-center rounded-lg">載入中...</div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="container px-4 md:px-6">
        <h2 className="text-2xl font-bold mb-4">商品分類</h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {categories.map((cat) => (
            <Link key={cat.id} href={`/category/${cat.id}`}>
              <Card className="hover:shadow-md transition">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={cat.image ? `/nadu-api/${cat.image}` : "/placeholder.svg"}
                    alt={cat.name}
                    width={400}
                    height={400}
                    className="h-full w-full object-cover"
                  />
                </div>
                <CardHeader className="p-4">
                  <CardTitle className="text-base">{cat.name}</CardTitle>
                </CardHeader>
              </Card>
              </Link>
            ))}
        </div>
      </section>

      {/* Featured Products Section */}
      <section id="featured-products" className="container px-4 md:px-6">
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold tracking-tight">熱門商品</h2>
            <Link href="/search" className="flex items-center text-primary">
              查看全部 <ArrowRight className="ml-1 h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {featuredProducts.map((product) => (
              <Link key={product.id} href={`/product/${product.id}`}>
                <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                  <div className="aspect-square overflow-hidden">
                    <Image
                      src={product.image ? `/nadu-api/${product.image}` : "/placeholder.svg"}
                      alt={product.name}
                      width={400}
                      height={400}
                      className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                    />
                  </div>
                  <CardHeader className="p-4">
                    <div className="flex items-start justify-between">
                      <CardTitle className="line-clamp-2 text-base">{product.name}</CardTitle>
                      <Badge variant="outline">{product.category_name}</Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="p-4 pt-0">
                    <div className="flex items-center gap-1">
                      {/* 若有評分可顯示，暫以0顯示 */}
                      {Array(5)
                        .fill(0)
                        .map((_, i) => (
                          <Star
                            key={i}
                            className={`h-4 w-4 text-muted-foreground`}
                          />
                        ))}
                      <span className="ml-1 text-xs text-muted-foreground">0</span>
                    </div>
                  </CardContent>
                  <CardFooter className="p-4 pt-0">
                    <p className="font-bold">NT$ {product.price}</p>
                  </CardFooter>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
