import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function GET(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "psikotes";

    const data = await fetchFromBackend<{
      success: boolean;
      category: string;
      totalQuestions: number;
      questions: any[];
      reused?: boolean;
    }>(`/api/v1/tests/candidate-questions?applicant_id=${session.applicantId}&category=${encodeURIComponent(category)}`);

    const questions = data.questions || [];
    const pgCount = questions.filter((q) => q.questionType !== "essay").length;
    const essayCount = questions.filter((q) => q.questionType === "essay").length;

    return NextResponse.json({
      success: true,
      category: data.category || category,
      totalQuestions: data.totalQuestions || questions.length,
      pgCount,
      essayCount,
      questions,
      reused: data.reused ?? false,
    });
  } catch (error: any) {
    console.error("Test questions fetch error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memuat soal ujian." },
      { status: error?.status || 500 }
    );
  }
}
