import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const isSuperAdmin = session.role === "superadmin" || session.username === "admin";
    return NextResponse.json({
      success: true,
      role: isSuperAdmin ? "superadmin" : session.role,
      name: session.name,
      email: session.email,
      department: session.department,
      isAdmin: session.role === "admin" || isSuperAdmin,
      isSuperAdmin,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat sesi." }, { status: 500 });
  }
}
