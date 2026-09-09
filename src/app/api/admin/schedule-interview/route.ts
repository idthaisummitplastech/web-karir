import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchRawFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const result = await fetchRawFromBackend("/recruitment/schedule-interview", {
      method: "POST",
      body: JSON.stringify({
        ...body,
        admin_id: session.adminId,
        admin_role: session.role,
        admin_department: session.department,
      }),
    });

    return NextResponse.json({
      success: true,
      message: result.message || result.data?.message || "Jadwal interview berhasil disimpan.",
    });
  } catch (error: any) {
    console.error("Schedule interview error:", error);
    return NextResponse.json({ error: error.message || "Gagal menjadwalkan interview." }, { status: 400 });
  }
}
