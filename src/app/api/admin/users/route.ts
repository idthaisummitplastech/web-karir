import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend, fetchRawFromBackend } from "@/lib/api-client";

function isAdminSession(s: { role: string; username: string; email: string } | null) {
  if (!s) return false;
  return s.role === "admin" || s.role === "superadmin" || s.username === "admin" || s.email === "admin@itsp.co.id";
}

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Akses ditolak. Hanya Admin." }, { status: 403 });
    }

    // Fetch CMS users and employee departments from backend
    const [users, deptData] = await Promise.all([
      fetchFromBackend("/cms/users"),
      fetchFromBackend("/recruitment/departments").catch(() => ({ departments: [] })),
    ]);

    return NextResponse.json({
      success: true,
      users: users || [],
      departments: deptData?.departments || [],
    });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Failed to load user list." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const result = await fetchRawFromBackend("/cms/users", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({
      success: true,
      user: result.data || result,
      message: result.message || "Aksi berhasil diproses.",
    });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: error.message || "Failed to add user." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "ID is required." }, { status: 400 });

    const result = await fetchRawFromBackend(`/cms/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    return NextResponse.json({ success: true, user: result.data || result });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: error.message || "Failed to update user." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!isAdminSession(session)) {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID is required." }, { status: 400 });

    await fetchRawFromBackend(`/cms/users/${id}`, { method: "DELETE" });
    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus." });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message || "Failed to delete user." }, { status: 500 });
  }
}
