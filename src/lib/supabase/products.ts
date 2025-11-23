import { getSupabaseBrowserClient } from "./client"

export type ProductWithDetails = {
  id: string
  name_ar: string
  name_en: string
  slug: string
  description_ar: string | null
  description_en: string | null
  category_id: string | null
  base_price: number
  is_featured: boolean
  is_active: boolean
  free_shipping?: boolean
  shipping_type?: "free" | "paid" | null
  shipping_cost?: number | null
  created_at: string
  category?: {
    name_ar: string
    name_en: string
  }
  product_images: Array<{
    id: string
    image_url: string
    alt_text_ar?: string | null
    display_order: number
    is_primary: boolean
  }>
  product_variants: Array<{
    id: string
    name_ar: string
    name_en: string
    size: string | null
    color: string | null
    color_hex: string | null
    price: number
    inventory_quantity: number
    sku?: string | null
  }>
}

export type CreateProductData = {
  name_ar: string
  name_en: string
  slug: string
  description_ar: string | null
  description_en: string | null
  category_id: string | null
  base_price: number
  is_featured?: boolean
  is_active?: boolean
  sku?: string
  inventory_quantity?: number
  shipping_type?: "free" | "paid" | null
  shipping_cost?: number | null
}

export type CreateVariantData = {
  product_id: string
  name_ar: string
  name_en: string
  size: string
  color: string
  color_hex: string
  price: number
  inventory_quantity: number
  sku?: string
}

export type CreateImageData = {
  product_id: string
  image_url: string
  alt_text_ar?: string
  alt_text_en?: string
  display_order: number
  is_primary: boolean
}

// Get all products with details
export async function getAllProducts() {
  try {
    const response = await fetch("/api/admin/products")

    // If the response is not OK, try to extract server error message and return empty list
    if (!response.ok) {
      const body = await response.text().catch(() => null)
      try {
        const parsed = body ? JSON.parse(body) : null
        console.error("[v0] getAllProducts: server error", parsed?.error ?? parsed)
      } catch (e) {
        console.error("[v0] getAllProducts: non-json error body", body)
      }
      return []
    }

    const json = await response.json().catch(() => ({ data: [] }))
    return (json.data || []) as ProductWithDetails[]
  } catch (err) {
    console.error("[v0] getAllProducts: fetch failed", err)
    return []
  }
}

// Get product by ID
export async function getProductById(id: string) {
  const response = await fetch(`/api/admin/products/${id}`)
  if (!response.ok) throw new Error("Failed to fetch product")
  const { data } = await response.json()
  return data as ProductWithDetails
}

// Create product
export async function createProduct(productData: CreateProductData) {
  const response = await fetch("/api/admin/products", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    // If the API returns a structured error object, stringify it for better messages
    let message = "Failed to create product"
    if (errorBody) {
      if (typeof errorBody.error === "string") message = errorBody.error
      else if (typeof errorBody.message === "string") message = errorBody.message
      else message = JSON.stringify(errorBody.error ?? errorBody)
    }

    throw new Error(message)
  }

  const { data } = await response.json()
  return data
}

// Update product
export async function updateProduct(id: string, productData: Partial<CreateProductData>) {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(productData),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    let message = "Failed to update product"
    if (errorBody) {
      if (typeof errorBody.error === "string") message = errorBody.error
      else if (typeof errorBody.message === "string") message = errorBody.message
      else message = JSON.stringify(errorBody.error ?? errorBody)
    }
    throw new Error(message)
  }

  const { data } = await response.json()
  return data
}

// Delete product
export async function deleteProduct(id: string) {
  const response = await fetch(`/api/admin/products/${id}`, {
    method: "DELETE",
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    let message = "Failed to delete product"
    if (errorBody) {
      if (typeof errorBody.error === "string") message = errorBody.error
      else if (typeof errorBody.message === "string") message = errorBody.message
      else message = JSON.stringify(errorBody.error ?? errorBody)
    }
    throw new Error(message)
  }
}

// Create product variant
export async function createProductVariant(variantData: CreateVariantData) {
  console.log("[v0] Creating variant with data:", variantData)
  
  try {
    const response = await fetch("/api/admin/products/variants", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(variantData),
    })

    const responseData = await response.json().catch(() => null)
    console.log("[v0] Variant response:", responseData)

    if (!response.ok) {
      let message = `HTTP ${response.status}: Failed to create variant`
      if (responseData) {
        if (typeof responseData.error === "string") message = responseData.error
        else if (typeof responseData.message === "string") message = responseData.message
        else message = JSON.stringify(responseData.error ?? responseData)
      }
      throw new Error(message)
    }

    return responseData?.data
  } catch (error) {
    console.error("[v0] Error creating variant:", error)
    throw error
  }
}

// Update product variant
export async function updateProductVariant(id: string, variantData: Partial<CreateVariantData>) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase.from("product_variants").update(variantData).eq("id", id).select().single()

  if (error) {
    console.error("[v0] Error updating variant:", error)
    throw error
  }

  return data
}

// Delete product variant
export async function deleteProductVariant(id: string) {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("product_variants").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting variant:", error)
    throw error
  }
}

// Create product image
export async function createProductImage(imageData: CreateImageData) {
  const response = await fetch("/api/admin/products/images", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(imageData),
  })

  if (!response.ok) {
    const errorBody = await response.json().catch(() => null)
    let message = "Failed to create image"
    if (errorBody) {
      if (typeof errorBody.error === "string") message = errorBody.error
      else if (typeof errorBody.message === "string") message = errorBody.message
      else message = JSON.stringify(errorBody.error ?? errorBody)
    }
    throw new Error(message)
  }

  const { data } = await response.json()
  return data
}

// Delete product image
export async function deleteProductImage(id: string) {
  const supabase = getSupabaseBrowserClient()

  const { error } = await supabase.from("product_images").delete().eq("id", id)

  if (error) {
    console.error("[v0] Error deleting image:", error)
    throw error
  }
}

// Get all categories
export async function getAllCategories() {
  const response = await fetch("/api/admin/categories")
  if (!response.ok) throw new Error("Failed to fetch categories")
  const { data } = await response.json()
  return data
}

// Search products
export async function searchProducts(query: string) {
  const supabase = getSupabaseBrowserClient()

  const { data, error } = await supabase
    .from("products")
    .select(`
      *,
      category:categories(name_ar, name_en),
      product_images(*),
      product_variants(*)
    `)
    .or(`name_ar.ilike.%${query}%,name_en.ilike.%${query}%`)
    .order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error searching products:", error)
    throw error
  }

  return data as ProductWithDetails[]
}
