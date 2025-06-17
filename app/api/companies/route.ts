import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getCompanies, createCompany } from "@/lib/db"
import { hasPermission } from "@/lib/permissions"

// GET /api/companies - Get all companies
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

    if (!hasPermission(decoded.role, "VIEW_COMPANIES")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const companies = await getCompanies()
    return NextResponse.json(companies)
  } catch (error) {
    console.error("Companies fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST /api/companies - Create a new company
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

    if (!hasPermission(decoded.role, "CREATE_COMPANY")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const companyData = await request.json()
    companyData.createdBy = decoded.userId

    const result = await createCompany(companyData)
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Company creation error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 