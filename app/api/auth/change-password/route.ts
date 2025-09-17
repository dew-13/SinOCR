import { type NextRequest, NextResponse } from "next/server"
import { hashPassword, verifyToken } from "@/lib/auth"
import { sql } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || ""
    const token = authHeader.replace("Bearer ", "")
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { newPassword } = await request.json()
    if (!newPassword || typeof newPassword !== "string" || newPassword.length < 6) {
      return NextResponse.json({ error: "New password is required (min 6 chars)" }, { status: 400 })
    }

    const passwordHash = await hashPassword(newPassword)

    const result = await sql`
      UPDATE users
      SET password_hash = ${passwordHash}, must_change_password = false, updated_at = CURRENT_TIMESTAMP
      WHERE id = ${decoded.userId}
      RETURNING id
    `

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Password updated" })
  } catch (error) {
    console.error("Change password error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}


