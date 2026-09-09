import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend, fetchRawFromBackend } from "@/lib/api-client";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const isSuperAdmin = session.role === "superadmin" || session.role === "admin";
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Hanya Super Admin yang dapat mengakses pengaturan." }, { status: 403 });
    }

    const settings = await fetchFromBackend("/recruitment/settings");
    return NextResponse.json({ success: true, settings: settings || {} });
  } catch (error: any) {
    console.error("Fetch settings error:", error);
    return NextResponse.json({ error: "Gagal memuat pengaturan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const isSuperAdmin = session.role === "superadmin" || session.role === "admin";
    if (!isSuperAdmin) {
      return NextResponse.json({ error: "Hanya Super Admin." }, { status: 403 });
    }

    const body = await req.json();
    await fetchRawFromBackend("/recruitment/settings", {
      method: "POST",
      body: JSON.stringify(body),
    });

    return NextResponse.json({ success: true, message: "Pengaturan berhasil disimpan." });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: error.message || "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}
