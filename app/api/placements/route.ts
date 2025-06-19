import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { getPlacements, createPlacement } from "@/lib/db"
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

    if (!hasPermission(decoded.role, "VIEW_EMPLOYEES")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const placements = await getPlacements()
    return NextResponse.json(placements)
  } catch (error) {
    console.error("Placements fetch error:", error)
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

    if (!hasPermission(decoded.role, "CREATE_EMPLOYEE")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const placementData = await request.json()
    placementData.createdBy = decoded.userId

    // Validate required fields
    const requiredFields = [
      'studentId', 'startDate', 'endDate', 'visaType', 'companyName', 
      'companyAddress', 'industry', 'residentAddress', 'emergencyContact', 'languageProficiency'
    ]
    
    for (const field of requiredFields) {
      if (!placementData[field]) {
        return NextResponse.json({ error: `Missing required field: ${field}` }, { status: 400 })
      }
    }

    console.log("Creating placement with data:", placementData)

    const result = await createPlacement(placementData)
    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Placement creation error:", error)
    console.error("Error details:", {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    return NextResponse.json({ 
      error: "Internal server error", 
      details: error.message 
    }, { status: 500 })
  }
} 