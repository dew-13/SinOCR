import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/db"
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

    if (!hasPermission(decoded.role, "VIEW_BASIC_ANALYTICS")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    // Fetch basic statistics
    const [
      totalStudents,
      employedStudents,
      totalUsers,
      totalCompanies,
      totalEmployees,
      districtStats,
      provinceStats,
      monthlyRegistrations,
      totalRegisteredStudents,
    ] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM students WHERE status = 'active'`,
      sql`SELECT COUNT(*) as count FROM students WHERE status = 'employed'`,
      sql`SELECT COUNT(*) as count FROM users`,
      sql`SELECT COUNT(*) as count FROM companies`,
      sql`SELECT COUNT(*) as count FROM employees`,
      sql`
        SELECT district, COUNT(*) as count 
        FROM students 
        GROUP BY district 
        ORDER BY count DESC 
        LIMIT 10
      `,
      sql`
        SELECT province, COUNT(*) as count 
        FROM students 
        GROUP BY province 
        ORDER BY count DESC
      `,
      sql`
        SELECT 
          DATE_TRUNC('month', created_at) as month,
          COUNT(*) as count
        FROM students 
        WHERE created_at >= CURRENT_DATE - INTERVAL '12 months'
        GROUP BY DATE_TRUNC('month', created_at)
        ORDER BY month
      `,
      sql`SELECT COUNT(*) as count FROM students`,
    ])

    return NextResponse.json({
      totalStudents: Number.parseInt(totalStudents[0]?.count || 0),
      employedStudents: Number.parseInt(employedStudents[0]?.count || 0),
      totalUsers: Number.parseInt(totalUsers[0]?.count || 0),
      totalCompanies: Number.parseInt(totalCompanies[0]?.count || 0),
      totalEmployees: Number.parseInt(totalEmployees[0]?.count || 0),
      districtStats,
      provinceStats,
      monthlyRegistrations,
      totalRegisteredStudents: Number.parseInt(totalRegisteredStudents?.[0]?.count || 0),
    })
  } catch (error) {
    console.error("Analytics error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
