import { type NextRequest, NextResponse } from "next/server"
import { verifyToken, hashPassword } from "@/lib/auth"
import { getUsers, createUser } from "@/lib/db"
import { hasPermission } from "@/lib/permissions"

// GET /api/users - Get all users
export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    if (!hasPermission(decoded.role, "VIEW_ALL_USERS")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const users = await getUsers()
    return NextResponse.json(users)
  } catch (error) {
    console.error("Users fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/users - Create a new user
export async function POST(request: NextRequest) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    if (!hasPermission(decoded.role, "CREATE_ADMIN") && !hasPermission(decoded.role, "CREATE_TEACHER")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const { email, password, fullName, role } = await request.json()
    if (!email || !password || !fullName || !role) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    const createdBy = decoded.userId
    try {
      const passwordHash = await hashPassword(password)
      // For teacher/admin, force password change on first login
      const mustChangePassword = role === "teacher" || role === "admin"
      const result = await createUser({ email, passwordHash, fullName, role, createdBy, mustChangePassword })
      return NextResponse.json(result[0])
    } catch (dbError: any) {
      return NextResponse.json({ error: dbError?.message || String(dbError) }, { status: 500 })
    }
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || String(error) }, { status: 500 })
  }
} 