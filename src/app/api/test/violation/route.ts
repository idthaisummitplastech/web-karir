import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { testType } = await req.json();

    const data = await fetchFromBackend<{
      success: boolean;
      violationsCount: number;
      violations_count?: number;
      isLocked: boolean;
      is_locked?: boolean;
      message: string;
    }>("/api/v1/tests/violation", {
      method: "POST",
      body: JSON.stringify({
        applicant_id: session.applicantId,
        test_type: testType,
      }),
    });

    return NextResponse.json({
      success: true,
      violationsCount: data.violationsCount ?? data.violations_count ?? 1,
      isLocked: data.isLocked ?? data.is_locked ?? false,
      message: data.message,
    });
  } catch (error: any) {
    console.error("Record violation error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mencatat pelanggaran." },
      { status: error?.status || 500 }
    );
  }
}
