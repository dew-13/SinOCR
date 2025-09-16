import { writeFile, mkdir } from "fs/promises"
import { existsSync } from "fs"
import path from "path"

export async function saveUploadedFile(file: File, directory = "uploads"): Promise<string> {
  try {
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Create upload directory if it doesn't exist
    const uploadDir = path.join(process.cwd(), "public", directory)
    if (!existsSync(uploadDir)) {
      await mkdir(uploadDir, { recursive: true })
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const extension = path.extname(file.name)
    const filename = `${timestamp}_${randomString}${extension}`

    const filepath = path.join(uploadDir, filename)
    await writeFile(filepath, buffer)

    // Return the public URL path
    return `/${directory}/${filename}`
  } catch (error) {
    console.error("Error saving file:", error)
    throw new Error("Failed to save file")
  }
}

export function validateImageFile(file: File): boolean {
  const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/gif"]
  const maxSize = 5 * 1024 * 1024 // 5MB

  if (!allowedTypes.includes(file.type)) {
    throw new Error("Invalid file type. Only JPEG, PNG, and GIF are allowed.")
  }

  if (file.size > maxSize) {
    throw new Error("File size too large. Maximum size is 5MB.")
  }

  return true
}
