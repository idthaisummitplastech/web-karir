import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { applicantId, testType } = await req.json();

    const submission = await prisma.testSubmission.findFirst({
      where: {
        applicantId: Number(applicantId),
        testType,
      },
    });

    if (!submission) {
      return NextResponse.json({ error: "Data sesi ujian peserta tidak ditemukan." }, { status: 404 });
    }

    // Reset status kunci dan pelanggaran
    const updated = await prisma.testSubmission.update({
      where: { id: submission.id },
      data: {
        isLocked: false,
        violationsCount: 0,
        submittedAt: null, // Buka kembali pengiriman jika sebelumnya tersubmit paksa
      },
    });

    return NextResponse.json({
      success: true,
      message: `Sesi ujian ${testType.toUpperCase()} berhasil di-reset! Calon karyawan kini dapat kembali login dan melanjutkan ujian tanpa hambatan.`,
      submission: updated,
    });
  } catch (error: any) {
    console.error("Reset test error:", error);
    return NextResponse.json({ error: "Gagal mereset sesi ujian." }, { status: 500 });
  }
}
