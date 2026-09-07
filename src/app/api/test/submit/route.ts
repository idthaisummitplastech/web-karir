import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { testType, answers } = await req.json(); // answers: { [questionId]: "A" | "B" | "C" | "D" | essay text | string[] }

    // 1. Ambil submission stabil untuk tahu paket soal + peta opsi peserta
    const submission0 = await prisma.testSubmission.findFirst({
      where: { applicantId: session.applicantId, testType },
    });
    let assignedIds: number[] | null = null;
    let optionMap: Record<string, number[]> = {};
    if ((submission0 as any)?.questionSet) {
      try {
        const parsed = JSON.parse((submission0 as any).questionSet);
        if (Array.isArray(parsed)) assignedIds = parsed.map((x) => Number(x)).filter((x) => Number.isFinite(x));
      } catch {}
    }
    if ((submission0 as any)?.optionMap) {
      try {
        const parsed = JSON.parse((submission0 as any).optionMap);
        if (parsed && typeof parsed === "object") optionMap = parsed;
      } catch {}
    }

    // 1b. Ambil Kunci Jawaban Resmi — hanya soal dalam paket peserta (adil: nilai dari soal yang dikerjakan)
    const questions = assignedIds && assignedIds.length > 0
      ? await prisma.testQuestion.findMany({ where: { id: { in: assignedIds } } })
      : await prisma.testQuestion.findMany({ where: { category: testType } });

    let calculatedScore = 0;
    let totalPossible = 0;

    const toOrigLetter = (qId: number, displayedLetter: string): string | null => {
      const map = optionMap[String(qId)];
      const di = (displayedLetter || "").toUpperCase().charCodeAt(0) - 65;
      if (!Array.isArray(map) || di < 0 || di >= map.length) return displayedLetter?.toUpperCase() || null; // fallback: bank lama tanpa acak
      const origIdx = map[di];
      return String.fromCharCode(65 + origIdx);
    };

    questions.forEach((q) => {
      // Hanya soal pilihan ganda reguler yang memiliki kunci jawaban pasti yang dihitung otomatis!
      // Soal kepribadian (multi_choice) & essay dievaluasi langsung oleh HR / User Dept
      if ((!q.questionType || q.questionType === 'single_choice') && q.correctKey) {
        totalPossible += q.points;
        const applicantAnswer = (answers && (answers as any)[q.id]) || "";
        if (typeof applicantAnswer === "string" && applicantAnswer.length > 0) {
          const origLetter = optionMap[String(q.id)] ? toOrigLetter(q.id, applicantAnswer.slice(0, 1)) : applicantAnswer.slice(0, 1).toUpperCase();
          if (origLetter && origLetter.toUpperCase() === q.correctKey.toUpperCase()) {
            calculatedScore += q.points;
          }
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
