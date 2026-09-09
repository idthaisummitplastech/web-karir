import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { testType, answers } = await req.json();

    const data = await fetchFromBackend<{
      success: boolean;
      score: number;
      isPassed: boolean;
      message: string;
    }>("/api/v1/tests/submit", {
      method: "POST",
      body: JSON.stringify({
        applicant_id: session.applicantId,
        test_type: testType,
        answers,
      }),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Exam submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal mengirimkan ujian." },
      { status: error?.status || 500 }
    );
  }
}
