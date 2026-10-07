import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    let liveDepartment = session.department;
    let liveRole = session.role;
    let liveName = session.name;

    try {
      const liveProfile = await fetchFromBackend<any>('/auth/me/admin', {
        headers: {
          'x-admin-id': String(session.adminId),
          'x-admin-role': session.role,
          'x-admin-department': session.department || '',
        },
      });
      if (liveProfile) {
        liveDepartment = liveProfile.department || liveDepartment;
        liveRole = liveProfile.role || liveRole;
        liveName = liveProfile.name || liveName;
      }
    } catch {
      // Fallback to session token payload if backend unreachable
    }

    const isSuperAdmin =
      liveRole === "superadmin" ||
      liveRole === "admin" ||
      session.username === "admin" ||
      session.email === "admin@itsp.co.id";

    return NextResponse.json({
      success: true,
      role: isSuperAdmin ? "admin" : liveRole,
      name: liveName,
      email: session.email,
      department: liveDepartment,
      isAdmin: liveRole === "admin" || isSuperAdmin,
      isSuperAdmin,
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Failed to load session." }, { status: 500 });
  }
}
