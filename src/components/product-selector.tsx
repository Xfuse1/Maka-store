"use client"

import { useState, useMemo, useCallback, memo } from "react"
import Image from "next/image"
import { type ProductWithDetails } from "@/lib/supabase/products"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface ProductSelectorProps {
  allProducts: ProductWithDetails[]
  selectedProductIds: string[]
  onSelectionChange: (newSelectedIds: string[]) => void
}

// Extract ProductRow to prevent unnecessary re-renders and stabilize Checkbox usage
const ProductRow = memo(({ 
  product, 
  isSelected, 
  onToggle 
}: { 
  product: ProductWithDetails
  isSelected: boolean
  onToggle: (id: string) => void 
}) => {
  return (
    <div
      onClick={() => onToggle(product.id)}
      className="flex cursor-pointer items-center space-x-3 space-x-reverse rounded-md border-2 p-3 transition-colors hover:border-primary/50 data-[selected=true]:border-primary"
      data-selected={isSelected}
    >
      <Checkbox
        checked={isSelected}
        onCheckedChange={() => onToggle(product.id)}
        onClick={(e) => e.stopPropagation()}
        aria-labelledby={`product-label-${product.id}`}
      />
      <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-md bg-muted">
        {product.product_images?.[0]?.image_url ? (
          <Image
            src={product.product_images[0].image_url}
            alt={product.name_ar}
            fill
            sizes="64px"
            className="object-cover"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-xs text-muted-foreground">
            لا توجد صورة
          </div>
        )}
      </div>
      <div className="flex-grow">
        <span id={`product-label-${product.id}`} className="font-medium">
          {product.name_ar}
        </span>
        <p className="text-xs text-muted-foreground">{product.category?.name_ar || "غير مصنف"}</p>
      </div>
    </div>
  )
})
ProductRow.displayName = "ProductRow"

export function ProductSelector({ allProducts, selectedProductIds, onSelectionChange }: ProductSelectorProps) {
  const [searchQuery, setSearchQuery] = useState("")

  // Memoize filtered products to avoid recreating the array on every render
  const filteredProducts = useMemo(() => allProducts.filter(
    (p) =>
      p.name_ar.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.name_en?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.id.toString().includes(searchQuery.toLowerCase()),
  ), [allProducts, searchQuery])

  // Memoize the toggle handler
  const handleProductToggle = useCallback((productId: string) => {
    const isSelected = selectedProductIds.includes(productId)
    let newSelectedIds: string[]
    if (isSelected) {
      newSelectedIds = selectedProductIds.filter((id) => id !== productId)
    } else {
      newSelectedIds = [...selectedProductIds, productId]
    }
    onSelectionChange(newSelectedIds)
  }, [selectedProductIds, onSelectionChange])

  return (
    <div className="space-y-4 rounded-lg border-2 border-border p-4">
      <div>
        <Label htmlFor="product-search" className="text-base font-semibold">
          اختر المنتجات لعرضها في هذا القسم
        </Label>
        <p className="text-sm text-muted-foreground mb-3">
          يمكنك تحديد المنتجات التي ستظهر في هذا القسم. ({selectedProductIds.length} منتج محدد)
        </p>
        <Input
          id="product-search"
          placeholder="ابحث عن منتج بالاسم أو الرقم التعريفي..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      <div className="h-72 w-full overflow-y-auto rounded-md border p-2 pr-3">
        <div className="space-y-3">
          {filteredProducts.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              isSelected={selectedProductIds.includes(product.id)}
              onToggle={handleProductToggle}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
