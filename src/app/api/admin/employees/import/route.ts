import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBackendBaseUrl } from "@/lib/urls";

export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== "admin" && session.role !== "hr")) {
      return NextResponse.json(
        { error: "Akses ditolak. Hanya Administrator atau HR yang berhak mengimpor data karyawan." },
        { status: 403 }
      );
    }

    const formData = await req.formData();
    const file = formData.get("file");
    if (!file) {
      return NextResponse.json({ error: "File Excel (.xlsx) wajib diunggah." }, { status: 400 });
    }

    const internalSecret = process.env.BACKEND_INTERNAL_SECRET || "";
    const backendUrl = `${getBackendBaseUrl()}/recruitment/employees/import-excel`;

    const res = await fetch(backendUrl, {
      method: "POST",
      headers: {
        "X-Internal-Secret": internalSecret,
        "X-Admin-Id": String(session.adminId),
        "X-Admin-Role": session.role,
      },
      body: formData,
    });

    const data = await res.json();
    if (!res.ok) {
      return NextResponse.json(
        { error: data.detail || data.error || "Failed to import Excel data." },
        { status: res.status }
      );
    }

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Import employees Excel error:", error);
    return NextResponse.json(
      { error: error.message || "Terjadi kesalahan saat mengunggah file." },
      { status: 500 }
    );
  }
}
