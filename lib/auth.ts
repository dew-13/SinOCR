import bcrypt from "bcryptjs"
import jwt from "jsonwebtoken"
import { getUserByEmail } from "./db"

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key"

export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword)
}

export function generateToken(user: { id: number; email: string; role: string }): string {
  return jwt.sign(
    {
      userId: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 24 * 60 * 60, // 24 hours
    },
    JWT_SECRET,
  )
}

export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET)
  } catch (error) {
    console.error("Token verification failed:", error)
    return null
  }
}

export async function authenticateUser(email: string, password: string) {
  try {
    const user = await getUserByEmail(email)

    if (!user || !user.is_active) {
      return null
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)

    if (!isValidPassword) {
      return null
    }

    return {
      id: user.id,
      email: user.email,
      fullName: user.full_name,
      role: user.role,
    }
  } catch (error) {
    console.error("Authentication error:", error)
    return null
  }
}

export function requireAuth(token: string) {
  const decoded = verifyToken(token)
  if (!decoded) {
    throw new Error("Invalid or expired token")
  }
  return decoded
}
