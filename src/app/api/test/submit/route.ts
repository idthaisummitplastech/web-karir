import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { testType, answers } = await req.json(); // answers: { [questionId]: "A" | "B" | "C" | "D" }

    // 1. Ambil Kunci Jawaban Resmi dari Database
    const questions = await prisma.testQuestion.findMany({
      where: { category: testType },
    });

    let calculatedScore = 0;
    let totalPossible = 0;

    questions.forEach((q) => {
      // Hanya soal pilihan ganda reguler yang memiliki kunci jawaban pasti yang dihitung otomatis!
      // Soal kepribadian (multi_choice) & essay dievaluasi langsung oleh HR / User Dept
      if ((!q.questionType || q.questionType === 'single_choice') && q.correctKey) {
        totalPossible += q.points;
        const applicantAnswer = (answers && answers[q.id]) || "";
        if (typeof applicantAnswer === "string" && applicantAnswer.toUpperCase() === q.correctKey.toUpperCase()) {
          calculatedScore += q.points;
        }
      }
    });

    const normalizedScore = totalPossible > 0 ? Math.round((calculatedScore / totalPossible) * 100) : 0;

    // 2. Simpan atau Update Hasil Ujian
    let submission = await prisma.testSubmission.findFirst({
      where: {
        applicantId: session.applicantId,
        testType,
      },
    });

    if (!submission) {
      submission = await prisma.testSubmission.create({
        data: {
          applicantId: session.applicantId,
          testType,
          score: normalizedScore,
          showScore: false, // Privacy default: numerical score hidden
          answers: JSON.stringify(answers || {}),
          isPassed: normalizedScore >= 70, // Preliminary pass threshold, HR can override
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.testSubmission.update({
        where: { id: submission.id },
        data: {
          score: normalizedScore,
          showScore: false,
          answers: JSON.stringify(answers || {}),
          isPassed: normalizedScore >= 70,
          submittedAt: new Date(),
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Ujian berhasil dikirimkan! Jawaban Anda telah tersimpan dan sedang ditinjau oleh Tim HR PT ITSP.",
      isPassed: submission.isPassed,
      // Note: Score is intentionally NOT returned here to maintain candidate score privacy!
    });
  } catch (error: any) {
    console.error("Submit test error:", error);
    return NextResponse.json({ error: "Gagal mengirimkan lembar ujian." }, { status: 500 });
  }
}
