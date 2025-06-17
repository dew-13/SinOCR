import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getUserById, updateUser, deleteUser } from "@/lib/db"
import { hasPermission } from "@/lib/permissions"

// GET /api/users/[id] - Get a specific user
export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
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
    const user = await getUserById(parseInt(params.id))
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json(user)
  } catch (error) {
    console.error("User fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/users/[id] - Update a user
export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    if (!hasPermission(decoded.role, "UPDATE_USER")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const userData = await request.json()
    // Only pass allowed fields to updateUser
    const updateFields: any = {}
    if (userData.email) updateFields.email = userData.email
    if (userData.fullName) updateFields.fullName = userData.fullName
    if (userData.role) updateFields.role = userData.role
    if (userData.passwordHash) updateFields.passwordHash = userData.passwordHash
    try {
      const result = await updateUser(parseInt(params.id), updateFields)
      if (!result || result.length === 0) {
        return NextResponse.json({ error: "User not found" }, { status: 404 })
      }
      return NextResponse.json(result[0])
    } catch (dbError) {
      return NextResponse.json({ error: dbError.message || dbError.toString() }, { status: 500 })
    }
  } catch (error) {
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 })
  }
}

// DELETE /api/users/[id] - Delete a user (soft delete)
export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }
    if (!hasPermission(decoded.role, "DELETE_USER")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }
    const result = await deleteUser(parseInt(params.id))
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }
    return NextResponse.json({ message: "User deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: error.message || error.toString() }, { status: 500 })
  }
} 