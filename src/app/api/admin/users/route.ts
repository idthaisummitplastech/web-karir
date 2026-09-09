import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend, fetchRawFromBackend } from "@/lib/api-client";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    if (session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak. Hanya Admin." }, { status: 403 });
    }

    // Fetch CMS users from backend (central)
    const users = await fetchFromBackend("/cms/users");
    return NextResponse.json({ success: true, users: users || [] });
  } catch (error: any) {
    console.error("Fetch users error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar pengguna." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const result = await fetchRawFromBackend("/cms/users", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, user: result.data || result });
  } catch (error: any) {
    console.error("Create user error:", error);
    return NextResponse.json({ error: error.message || "Gagal menambah pengguna." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });

    const result = await fetchRawFromBackend(`/cms/users/${id}`, {
      method: "PUT",
      body: JSON.stringify(updateData),
    });

    return NextResponse.json({ success: true, user: result.data || result });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui pengguna." }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });

    await fetchRawFromBackend(`/cms/users/${id}`, { method: "DELETE" });
    return NextResponse.json({ success: true, message: "Pengguna berhasil dihapus." });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: error.message || "Gagal menghapus pengguna." }, { status: 500 });
  }
}
