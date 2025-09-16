import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getCompanyById, updateCompany, deleteCompany } from "@/lib/db"
import { hasPermission } from "@/lib/permissions"

// GET /api/companies/[id] - Get a specific company
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const company = await getCompanyById(parseInt(params.id))
    if (!company) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(company)
  } catch (error) {
    console.error("Company fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PUT /api/companies/[id] - Update a company
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!hasPermission(decoded.role, "UPDATE_COMPANY")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const companyData = await request.json()
    const result = await updateCompany(parseInt(params.id), companyData)

    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Company update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE /api/companies/[id] - Delete a company
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "")

    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const decoded = verifyToken(token)
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    if (!hasPermission(decoded.role, "DELETE_COMPANY")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const result = await deleteCompany(parseInt(params.id))
    if (!result || result.length === 0) {
      return NextResponse.json({ error: "Company not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Company deleted successfully" })
  } catch (error) {
    console.error("Company deletion error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
} 