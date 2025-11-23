const BUCKET_NAME = "products"

// Upload image to Supabase Storage via API route
export async function uploadProductImage(file: File, productId: string): Promise<string> {
  console.log("[v0] Uploading image via API route")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("productId", productId)

  const response = await fetch("/api/admin/storage/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] Error uploading image:", error)
    throw new Error(error.error || "Failed to upload image")
  }

  const { url } = await response.json()
  console.log("[v0] Image uploaded successfully:")
  return url
}

// Delete image from Supabase Storage via API route
export async function deleteProductImageFromStorage(imageUrl: string) {
  const response = await fetch("/api/admin/storage/delete", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] Error deleting image:", error)
    throw new Error(error.error || "Failed to delete image")
  }

  console.log("[v0] Image deleted from storage")
}

// Upload single image to Supabase Storage via API route
export async function uploadImage(file: File, folder = "homepage"): Promise<string> {
  console.log("[v0] Uploading image via API route")

  const formData = new FormData()
  formData.append("file", file)
  formData.append("productId", folder) // Using productId param for folder name

  const response = await fetch("/api/admin/storage/upload", {
    method: "POST",
    body: formData,
  })

  if (!response.ok) {
    const error = await response.json()
    console.error("[v0] Error uploading image:", error)
    throw new Error(error.error || "Failed to upload image")
  }

  const { url } = await response.json()
  console.log("[v0] Image uploaded successfully:")
  return url
}

// Upload multiple images
export async function uploadMultipleImages(files: File[], productId: string): Promise<string[]> {
  const uploadPromises = files.map((file) => uploadProductImage(file, productId))
  return Promise.all(uploadPromises)
}
