import { type NextRequest, NextResponse } from "next/server"
import { verifyToken } from "@/lib/auth"
import { sql } from "@/lib/db"
import { hasPermission } from "@/lib/permissions"

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

    if (!hasPermission(decoded.role, "VIEW_STUDENTS")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const studentId = params.id

    // Fetch the student by ID
    const result = await sql`
      SELECT * FROM students 
      WHERE id = ${studentId}
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    const student = result[0]

    return NextResponse.json(student)
  } catch (error) {
    console.error("Student fetch error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    if (!hasPermission(decoded.role, "UPDATE_STUDENT")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const studentId = params.id
    const data = await request.json()

    // Update the student
    const result = await sql`
      UPDATE students 
      SET 
        full_name = ${data.fullName},
        permanent_address = ${data.permanentAddress},
        district = ${data.district},
        province = ${data.province},
        date_of_birth = ${data.dateOfBirth},
        national_id = ${data.nationalId},
        passport_id = ${data.passportId || null},
        passport_expired_date = ${data.passportExpiredDate || null},
        sex = ${data.sex},
        marital_status = ${data.maritalStatus},
        spouse_name = ${data.spouseName || null},
        number_of_children = ${data.numberOfChildren || 0},
        mobile_phone = ${data.mobilePhone},
        whatsapp_number = ${data.whatsappNumber},
        has_driving_license = ${data.hasDrivingLicense},
        vehicle_type = ${data.vehicleType || null},
        email_address = ${data.emailAddress},
        expected_job_category = ${data.expectedJobCategory},
        education_ol = ${data.educationOL || false},
        education_al = ${data.educationAL || false},
        other_qualifications = ${data.otherQualifications || null},
        work_experience = ${data.workExperience || null},
        work_experience_abroad = ${data.workExperienceAbroad || null},
        guardian_contact = ${data.guardianContact},
        status = ${data.status || 'pending'},
        updated_at = NOW()
      WHERE id = ${studentId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json(result[0])
  } catch (error) {
    console.error("Student update error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

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

    if (!hasPermission(decoded.role, "DELETE_STUDENT")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 })
    }

    const studentId = params.id

    // Delete the student
    const result = await sql`
      DELETE FROM students 
      WHERE id = ${studentId}
      RETURNING *
    `

    if (result.length === 0) {
      return NextResponse.json({ error: "Student not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Student deleted successfully" })
  } catch (error) {
    console.error("Student delete error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}