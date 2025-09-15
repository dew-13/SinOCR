import { NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { hasPermission } from "@/lib/permissions";
import { updateStudentStatus } from "@/lib/db";

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (!hasPermission(decoded.role, "UPDATE_STUDENT")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    const { status } = await request.json();
    if (!status) {
      return NextResponse.json({ error: "Missing status" }, { status: 400 });
    }
    const result = await updateStudentStatus(params.id, status);
    if (result) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json({ error: "Update failed" }, { status: 500 });
    }
  } catch (error) {
    console.error("Status update error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
