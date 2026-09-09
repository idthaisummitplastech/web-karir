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
    const result = await fetchRawFromBackend("/recruitment/resend-email", {
      method: "POST",
      body: JSON.stringify({ ...body, admin_id: session.adminId }),
    });
    return NextResponse.json({ success: true, message: result.message || "Email berhasil dikirim ulang." });
  } catch (error: any) {
    console.error("Resend email error:", error);
    return NextResponse.json({ error: error.message || "Gagal mengirim ulang email." }, { status: 400 });
  }
}
