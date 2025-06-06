"use client"
import { useEffect, useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { Star } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Product, apiGet } from "@/lib/api"

export default function SearchPage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    apiGet<{ products: Product[] }>("/nadu-api/product-api.php?action=list&limit=100&sort=id&order=DESC")
      .then(res => setProducts(res.products))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="container py-10">
      <h1 className="text-2xl font-bold mb-4">熱門商品</h1>
      {loading ? <p>載入中...</p> : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {products.map(product => (
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
                    {Array(5).fill(0).map((_, i) => (
                      <Star key={i} className="h-4 w-4 text-muted-foreground" />
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
      )}
    </div>
  )
}
 