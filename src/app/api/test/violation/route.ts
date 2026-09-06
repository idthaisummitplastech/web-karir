import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { testType } = await req.json(); // 'psikotes' or 'user_test'

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
          answers: "{}",
          violationsCount: 1,
          startedAt: new Date(),
        },
      });
    } else {
      submission = await prisma.testSubmission.update({
        where: { id: submission.id },
        data: {
          violationsCount: submission.violationsCount + 1,
          isLocked: submission.violationsCount + 1 >= 2, // 2 strikes then lock
        },
      });
    }

    const isLocked = submission.violationsCount >= 2;

    return NextResponse.json({
      success: true,
      violationsCount: submission.violationsCount,
      isLocked,
      message: isLocked
        ? "Ujian Anda telah dihentikan dan dikunci secara otomatis karena terdeteksi berpindah aplikasi/tab sebanyak 2 kali. Silakan hubungi Tim HR untuk permohonan reset."
        : "Peringatan Keamanan: Terdeteksi perpindahan tab/jendela. Pelanggaran 1 dari maksimal 2 kali. Jika terulang, ujian akan otomatis dikunci!",
    });
  } catch (error: any) {
    console.error("Record violation error:", error);
    return NextResponse.json({ error: "Gagal mencatat pelanggaran." }, { status: 500 });
  }
}
