import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { applicantId, testType, score, showScore, isPassed } = await req.json();

    let submission = await prisma.testSubmission.findFirst({
      where: {
        applicantId: Number(applicantId),
        testType,
      },
    });

    if (!submission) {
      submission = await prisma.testSubmission.create({
        data: {
          applicantId: Number(applicantId),
          testType,
          score: score !== undefined ? Number(score) : null,
          showScore: Boolean(showScore),
          isPassed: isPassed !== undefined ? Boolean(isPassed) : true,
          answers: "{}",
          submittedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.testSubmission.update({
        where: { id: submission.id },
        data: {
          score: score !== undefined ? Number(score) : submission.score,
          showScore: showScore !== undefined ? Boolean(showScore) : submission.showScore,
          isPassed: isPassed !== undefined ? Boolean(isPassed) : submission.isPassed,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Data evaluasi nilai berhasil diperbarui!",
      submission,
    });
  } catch (error: any) {
    console.error("Update score error:", error);
    return NextResponse.json({ error: "Gagal memperbarui nilai tes." }, { status: 500 });
  }
}
