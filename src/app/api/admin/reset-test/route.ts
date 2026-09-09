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
    const result = await fetchRawFromBackend("/recruitment/reset-test", {
      method: "POST",
      body: JSON.stringify({ ...body, admin_id: session.adminId }),
    });
    return NextResponse.json({ success: true, message: result.message || "Tes berhasil direset." });
  } catch (error: any) {
    console.error("Reset test error:", error);
    return NextResponse.json({ error: error.message || "Gagal mereset tes." }, { status: 400 });
  }
}
