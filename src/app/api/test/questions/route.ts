import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category") || "psikotes"; // 'psikotes' or 'user_test'

    const questions = await prisma.testQuestion.findMany({
      where: { category },
      orderBy: { sortOrder: "asc" },
    });

    // Sanitasi: Jangan kirim correctKey ke frontend calon karyawan
    const sanitized = questions.map((q) => {
      let parsedOptions: string[] = [];
      try {
        parsedOptions = JSON.parse(q.options);
      } catch {
        parsedOptions = [];
      }

      return {
        id: q.id,
        question: q.question,
        questionType: q.questionType || 'single_choice',
        imageUrl: q.imageUrl,
        options: parsedOptions,
        points: q.points,
        sortOrder: q.sortOrder,
      };
    });

    return NextResponse.json({
      success: true,
      category,
      totalQuestions: sanitized.length,
      questions: sanitized,
    });
  } catch (error: any) {
    console.error("Fetch questions error:", error);
    return NextResponse.json({ error: "Gagal memuat soal ujian." }, { status: 500 });
  }
}
