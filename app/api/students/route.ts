import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getStudents, createStudent } from "@/lib/db"
import { hasPermission } from "@/lib/permissions"

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

    if (!hasPermission(decoded.role, "VIEW_STUDENTS")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const students = await getStudents()
    return NextResponse.json(students)
  } catch (error) {
    console.error("Students fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    if (!hasPermission(decoded.role, "CREATE_STUDENT")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const studentData = await request.json()
    studentData.createdBy = decoded.userId

    const result = await createStudent(studentData)
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Student creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
