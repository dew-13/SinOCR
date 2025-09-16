import { type NextRequest, NextResponse } from "next/server"
import { verifyPassword } from "@/lib/auth"
import { getUserByEmail } from "@/lib/db"

export async function POST(request: NextRequest) {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV === "production") {
      return NextResponse.json({ error: "Not available in production" }, { status: 403 })
    }

    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const user = await getUserByEmail(email)

    if (!user) {
      return NextResponse.json(
        {
          error: "User not found",
          debug: { email, userExists: false },
        },
        { status: 404 },
      )
    }

    const isValidPassword = await verifyPassword(password, user.password_hash)

    return NextResponse.json({
      message: "Password test completed",
      debug: {
        email: user.email,
        userExists: true,
        isActive: user.is_active,
        passwordValid: isValidPassword,
        role: user.role,
        passwordHashLength: user.password_hash?.length || 0,
      },
    })
  } catch (error) {
    console.error("Test error:", error)
    return NextResponse.json(
      {
        error: "Internal server error",
        debug: { errorMessage: error.message },
      },
      { status: 500 },
    )
  }
}
