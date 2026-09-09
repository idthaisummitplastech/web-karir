import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchRawFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 });
    }

    const body = await req.json();

    const result = await fetchRawFromBackend("/recruitment/advance-stage", {
      method: "POST",
      body: JSON.stringify({
        ...body,
        applicant_id: body.applicantId || body.applicant_id,
        admin_id: session.adminId,
        admin_role: session.role,
        admin_department: session.department,
      }),
    });

    return NextResponse.json({
      success: true,
      message: result.message || result.data?.message || "Tahap berhasil diproses.",
    });
  } catch (error: any) {
    console.error("Advance stage error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses perubahan tahap." },
      { status: 400 }
    );
  }
}
