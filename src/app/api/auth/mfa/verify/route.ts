import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { code, enable } = await req.json();

    if (!enable && session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses Ditolak: Staf tidak diperkenankan menonaktifkan MFA. Hubungi Super Admin jika ingin mereset." },
        { status: 403 }
      );
    }

    const data = await fetchFromBackend<{
      success: boolean;
      message: string;
    }>("/api/v1/auth/ats-mfa/verify", {
      method: "POST",
      body: JSON.stringify({
        admin_id: session.adminId,
        code,
        enable,
      }),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("MFA verify error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memverifikasi MFA." },
      { status: error?.status || 500 }
    );
  }
}
