import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend, fetchRawFromBackend } from "@/lib/api-client";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const data = await fetchFromBackend("/recruitment/karyawan-sementara");
    return NextResponse.json({ success: true, karyawanList: data || [] });
  } catch (error: any) {
    console.error("Fetch id-cards error:", error);
    return NextResponse.json({ error: "Gagal memuat data karyawan sementara." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json();
    const { id } = body;
    if (!id) return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });

    const result = await fetchRawFromBackend(`/recruitment/karyawan-sementara/${id}/toggle-id-card`, {
      method: "PUT",
    });
    return NextResponse.json({ success: true, message: result.message || "Status ID Card diperbarui." });
  } catch (error: any) {
    console.error("Toggle ID card error:", error);
    return NextResponse.json({ error: error.message || "Gagal memperbarui status ID Card." }, { status: 400 });
  }
}
