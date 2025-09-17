import { type NextRequest, NextResponse } from "next/server";
import { verifyToken } from "@/lib/auth";
import { getPlacementById } from "@/lib/db";
import { hasPermission } from "@/lib/permissions";

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const token = request.headers.get("authorization")?.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }
    if (!hasPermission(decoded.role, "VIEW_EMPLOYEES")) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }
    const id = Number(params.id);
    if (!id) {
      return NextResponse.json({ error: "Invalid placement ID" }, { status: 400 });
    }
    const placement = await getPlacementById(id);
    if (!placement) {
      return NextResponse.json({ error: "Placement not found" }, { status: 404 });
    }
    return NextResponse.json(placement);
  } catch (error) {
    console.error("Placement fetch error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
