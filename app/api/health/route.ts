import { type NextRequest, NextResponse } from "next/server"
import { sql } from "@/lib/db"

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const result = await sql`SELECT 1 as test`

    // Get table counts
    const [userCount, studentCount, companyCount, employeeCount] = await Promise.all([
      sql`SELECT COUNT(*) as count FROM users WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM students`,
      sql`SELECT COUNT(*) as count FROM companies WHERE is_active = true`,
      sql`SELECT COUNT(*) as count FROM employees`,
    ])

    return NextResponse.json({
      status: "healthy",
      database: "connected",
      timestamp: new Date().toISOString(),
      tables: {
        users: userCount[0]?.count || 0,
        students: studentCount[0]?.count || 0,
        companies: companyCount[0]?.count || 0,
        employees: employeeCount[0]?.count || 0,
      },
    })
  } catch (error) {
    console.error("Health check failed:", error)
    return NextResponse.json(
      {
        status: "unhealthy",
        database: "disconnected",
        error: error.message,
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    )
  }
}
