"use client"

import Image from "next/image"
import Link from "next/link"
import { Minus, Plus, ShoppingCart, Star } from "lucide-react"
import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { apiGet, Product } from "@/lib/api"
import { Textarea } from "@/components/ui/textarea"

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const id = typeof params.id === 'string' ? params.id : Array.isArray(params.id) ? params.id[0] : ''
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSize, setSelectedSize] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [reviews, setReviews] = useState<any[]>([])
  const [reviewLoading, setReviewLoading] = useState(true)
  const [myRating, setMyRating] = useState(0)
  const [myComment, setMyComment] = useState("")
  const [reviewError, setReviewError] = useState("")
  const [reviewSuccess, setReviewSuccess] = useState("")

  // 新增：計算平均評分與評價數
  const reviewCount = reviews.length
  const averageRating = reviewCount
    ? (reviews.reduce((sum, r) => sum + (r.rating || 0), 0) / reviewCount)
    : 0

  useEffect(() => {
    if (!id) return
    setLoading(true)
    apiGet<Product>(`/nadu-api/product-api.php?action=detail&id=${id}`)
      .then((data) => {
        setProduct(data)
        setLoading(false)
      })
      .catch(() => setLoading(false))
    apiGet<{ products: Product[] }>(`/nadu-api/product-api.php?action=list&limit=4`)
      .then((data) => {
        setRelatedProducts(data.products.filter((p) => String(p.id) !== id))
      })
    setReviewLoading(true)
    fetch(`/nadu-api/product-api.php?action=list_reviews&product_id=${id}`)
      .then(res => res.json())
      .then(data => {
        setReviews(data.success && data.reviews ? data.reviews : (data.data?.reviews || []))
        setReviewLoading(false)
      })
      .catch(() => setReviewLoading(false))
  }, [id])

  const handleAddToCart = async () => {
    setError(""); setSuccess("")
    if (!selectedSize) {
      setError("請選擇尺寸")
      return
    }
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
    if (!userId) {
      router.push("/login")
      return
    }
    const res = await fetch("/nadu-api/cart-api.php?action=add", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        user_id: userId,
        product_id: String(product?.id),
        quantity: String(quantity),
        size: selectedSize,
      }).toString(),
    })
    const data = await res.json()
    if (data.success) {
      setSuccess("已加入購物車！")
    } else {
      setError(data.message || "加入購物車失敗")
    }
  }

  const handleBuyNow = async () => {
    await handleAddToCart()
    router.push("/cart")
  }

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setReviewError(""); setReviewSuccess("")
    const userId = typeof window !== 'undefined' ? localStorage.getItem("userId") : null
    if (!userId) { setReviewError("請先登入"); return }
    if (!myRating) { setReviewError("請選擇星數"); return }
    const res = await fetch("/nadu-api/product-api.php?action=add_review", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ user_id: userId, product_id: id, rating: String(myRating), comment: myComment }).toString(),
    })
    const data = await res.json()
    if (data.success) {
      setReviewSuccess("感謝您的評價！")
      setMyRating(0)
      setMyComment("")
    } else {
      setReviewError(data.message || "送出失敗")
    }
  }

  if (loading) return <div className="container py-10">載入中...</div>
  if (!product) return <div className="container py-10">查無此商品</div>

  return (
    <div className="container py-10">
      <div className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link href="/" className="hover:text-primary">首頁</Link>
        <span>/</span>
        <Link href={`/category/${product.category_id}`} className="hover:text-primary">{product.category_name}</Link>
        <span>/</span>
        <span className="text-foreground">{product.name}</span>
      </div>
      <div className="grid gap-8 md:grid-cols-2">
        {/* Product Images */}
        <div className="flex flex-col gap-4">
          <div className="overflow-hidden rounded-lg border">
            <Image
              src={product.image ? `/nadu-api/${product.image}` : "/placeholder.svg"}
              alt={product.name || "Product"}
              width={600}
              height={600}
              className="h-full w-full object-cover"
            />
          </div>
        </div>
        {/* Product Info */}
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{product.name}</h1>
            <div className="mb-4 flex items-center gap-2">
              <div className="flex items-center">
                {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                    className={`h-5 w-5 ${i < Math.round(averageRating) ? "text-yellow-400" : "text-muted-foreground"}`}
                    />
                  ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {averageRating.toFixed(1)} ({reviewCount} 評價)
              </span>
            </div>
            <div className="mb-4 flex items-center gap-2">
              <Badge variant="outline">{product.category_name}</Badge>
              <Badge variant="outline" className="bg-primary/10">庫存: {product.stock || 0}</Badge>
            </div>
            <div className="mb-6">
              <div className="flex items-center gap-2">
                <span className="text-2xl font-bold text-primary">NT$ {product.price}</span>
                {product.original_price && (
                  <span className="text-sm text-muted-foreground line-through">NT$ {product.original_price}</span>
                )}
              </div>
            </div>
          </div>
          <div className="space-y-4">
            <div>
              <h3 className="mb-2 font-medium">尺寸</h3>
              <div className="flex flex-wrap gap-2">
                {["S", "M", "L", "XL"].map((size) => (
                  <Button
                    key={size}
                    variant={selectedSize === size ? "default" : "outline"}
                    className="h-10 w-10 rounded-md p-0"
                    onClick={() => setSelectedSize(size)}
                    type="button"
                  >
                    {size}
                  </Button>
                ))}
              </div>
            </div>
            <div>
              <label htmlFor="product-quantity" className="block mb-1 font-medium">數量</label>
              <div className="flex gap-2 items-center">
                <button type="button" aria-label="減少數量" onClick={() => setQuantity(q => Math.max(1, q - 1))} className="h-8 w-8 rounded border flex items-center justify-center">-</button>
                <input
                  id="product-quantity"
                  name="quantity"
                  type="number"
                  min={1}
                  value={quantity}
                  onChange={e => setQuantity(Number(e.target.value))}
                  className="w-16 text-center border rounded"
                  autoComplete="off"
                  aria-label="商品數量"
                />
                <button type="button" aria-label="增加數量" onClick={() => setQuantity(q => q + 1)} className="h-8 w-8 rounded border flex items-center justify-center">+</button>
              </div>
            </div>
          </div>
          {error && <div className="text-red-600 text-sm">{error}</div>}
          {success && <div className="text-green-600 text-sm">{success}</div>}
          <div className="flex flex-col gap-4 sm:flex-row">
            <Button className="flex-1 gap-2" onClick={handleAddToCart} type="button">
              <ShoppingCart className="h-5 w-5" />加入購物車
            </Button>
            <Button variant="secondary" className="flex-1" onClick={handleBuyNow} type="button">
              立即購買
            </Button>
          </div>
          <Tabs defaultValue="description" className="mt-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="description">商品描述</TabsTrigger>
              <TabsTrigger value="specifications">規格</TabsTrigger>
              <TabsTrigger value="shipping">運送與退貨</TabsTrigger>
            </TabsList>
            <TabsContent value="description" className="mt-4">
              <Card>
                <CardContent className="p-4 text-sm leading-relaxed">
                  <div dangerouslySetInnerHTML={{ __html: (product.description || '').replace(/\n/g, '<br />') }} />
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="specifications" className="mt-4">
              <Card>
                <CardContent className="p-4">
                  <ul className="space-y-2 text-sm">
                    {/* 若有規格資料可顯示 */}
                  </ul>
                </CardContent>
              </Card>
            </TabsContent>
            <TabsContent value="shipping" className="mt-4">
              <Card>
                <CardContent className="p-4 text-sm leading-relaxed">
                  <h4 className="mb-2 font-medium">運送資訊</h4>
                  <p className="mb-4">我們提供全台灣免運費服務，一般訂單處理時間為1-2個工作日，配送時間約為2-3個工作日。</p>
                  <h4 className="mb-2 font-medium">退貨政策</h4>
                  <p>如對商品不滿意，可在收到商品後7天內申請退貨。商品必須保持全新狀態且包裝完整。退款將在收到退回商品後的7個工作日內處理。</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
          {/* 評價區塊 */}
          <div className="mt-12">
            <h2 className="mb-4 text-xl font-bold">商品評價</h2>
            <form className="mb-6 flex flex-col gap-2 max-w-lg" onSubmit={handleReviewSubmit}>
              <div className="flex items-center gap-2">
                {Array(5).fill(0).map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setMyRating(i + 1)}
                    className={myRating > i ? "text-yellow-400" : "text-gray-400"}
                    aria-label={`評分${i + 1}星`}
                  >
                    <Star className="h-6 w-6" />
                  </button>
                ))}
                <span className="ml-2">{myRating} / 5</span>
              </div>
              <Textarea
                placeholder="留下您的評論..."
                value={myComment}
                onChange={e => setMyComment(e.target.value)}
                rows={3}
                className="resize-none"
              />
              {reviewError && <div className="text-red-600 text-sm">{reviewError}</div>}
              {reviewSuccess && <div className="text-green-600 text-sm">{reviewSuccess}</div>}
              <Button type="submit" className="w-32">送出評價</Button>
            </form>
            {reviewLoading ? <div>載入中...</div> : (
              <div className="space-y-4">
                {reviews.length === 0 && <div className="text-muted-foreground">尚無評價</div>}
                {reviews.map(r => (
                  <div key={r.id} className="border rounded p-4">
                    <div className="flex items-center gap-2 mb-1">
                      {Array(5).fill(0).map((_, i) => (
                        <Star key={i} className={`h-4 w-4 ${i < r.rating ? "text-yellow-400" : "text-gray-300"}`} />
                      ))}
                      <span className="text-sm text-muted-foreground">by {r.user_name} · {r.created_at?.slice(0, 16).replace('T', ' ')}</span>
                    </div>
                    <div className="text-sm">{r.comment}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      {/* Related Products */}
      <div className="mt-16">
        <h2 className="mb-6 text-2xl font-bold">相關商品</h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
          {relatedProducts.map((product) => (
            <Link key={product.id} href={`/product/${product.id}`}>
              <Card className="h-full overflow-hidden transition-all hover:shadow-md">
                <div className="aspect-square overflow-hidden">
                  <Image
                    src={product.image ? `/nadu-api/${product.image}` : "/placeholder.svg"}
                    alt={product.name}
                    width={300}
                    height={300}
                    className="h-full w-full object-cover transition-transform duration-300 hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <div className="font-semibold">{product.name}</div>
                  <div className="text-primary font-bold">NT$ {product.price}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
