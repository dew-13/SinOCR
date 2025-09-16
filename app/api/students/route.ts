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

    const { searchParams } = new URL(request.url)
    const options: any = {}
    if (searchParams.get("q")) options.search = searchParams.get("q")
    if (searchParams.get("marital_status")) options.marital_status = searchParams.get("marital_status")
    if (searchParams.get("sex")) options.sex = searchParams.get("sex")
    if (searchParams.get("district")) options.district = searchParams.get("district")
    if (searchParams.get("province")) options.province = searchParams.get("province")
    if (searchParams.get("has_driving_license")) options.has_driving_license = searchParams.get("has_driving_license")
    if (searchParams.get("format")) options.format = searchParams.get("format")
    const students = await getStudents(options)
    if (options.format === "csv") {
      // Convert to CSV
      const fields = students.length > 0 ? Object.keys(students[0]) : []
      const csvRows = [fields.join(",")].concat(
        students.map((row: any) => fields.map(f => `"${(row[f] ?? "").toString().replace(/"/g, '""')}"`).join(","))
      )
      const csv = csvRows.join("\r\n")
      return new NextResponse(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=students.csv"
        }
      })
    }
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
