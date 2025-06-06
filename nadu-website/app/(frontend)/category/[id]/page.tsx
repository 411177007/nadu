"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { apiGet, Product, Category } from "@/lib/api"
import Link from "next/link"
import Image from "next/image"

export default function CategoryPage() {
  const params = useParams()
  const id = params?.id as string
  const [category, setCategory] = useState<Category | null>(null)
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    Promise.all([
      apiGet<Category>(`/nadu-api/category-api.php?action=detail&id=${id}`),
      apiGet<{ products: Product[] }>(`/nadu-api/product-api.php?action=list&category_id=${id}`)
    ]).then(([cat, prodRes]) => {
      setCategory(cat)
      setProducts(prodRes.products)
      setLoading(false)
    }).catch(() => setLoading(false))
  }, [id])

  if (loading) return <div className="container py-10">載入中...</div>
  if (!category) return <div className="container py-10">查無此分類</div>

  return (
    <div className="container py-10">
      <h1 className="mb-6 text-2xl font-bold">{category.name}</h1>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {products.map(product => (
          <Link key={product.id} href={`/product/${product.id}`}>
            <div className="rounded-lg border p-4 flex flex-col items-center">
              <Image 
                src={
                  product.images && product.images.length > 0
                    ? `/nadu-api/${product.images[0]}`
                    : product.image
                      ? `/nadu-api/${product.image}`
                      : "/placeholder.svg"
                }
                alt={product.name}
                width={200}
                height={200}
              />
              <div className="mt-2 font-medium">{product.name}</div>
              <div className="text-primary font-bold">NT$ {product.price}</div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
} 