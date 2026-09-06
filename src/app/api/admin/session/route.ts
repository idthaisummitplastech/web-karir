import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    return NextResponse.json({
      success: true,
      role: session.role,
      name: session.name,
      email: session.email,
      department: session.department,
      isAdmin: session.role === "admin",
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat sesi." }, { status: 500 });
  }
}
