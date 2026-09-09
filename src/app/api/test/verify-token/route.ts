import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { testType, token } = await req.json();

    const data = await fetchFromBackend<{
      success: boolean;
      message: string;
    }>("/api/v1/tests/verify-token", {
      method: "POST",
      body: JSON.stringify({
        applicant_id: session.applicantId,
        test_type: testType,
        token,
      }),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Token verification error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memverifikasi token ujian." },
      { status: error?.status || 500 }
    );
  }
}
