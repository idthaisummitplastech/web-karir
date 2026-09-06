import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const { testType, token } = await req.json(); // testType: 'psikotes' or 'user_test'

    const applicant = await prisma.applicant.findUnique({
      where: { id: session.applicantId },
      include: { testSubmissions: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
    }

    // 1. Cek Tahap Pelamar
    const requiredStage = testType === "psikotes" ? 2 : 3;
    if (applicant.currentStage < requiredStage) {
      return NextResponse.json(
        { error: `Anda belum dapat mengakses ujian ini. Tahap Anda saat ini adalah Tahap ${applicant.currentStage}.` },
        { status: 403 }
      );
    }

    // 2. Cek Jadwal Terkunci
    const scheduledDate = testType === "psikotes" ? applicant.psikotesScheduledAt : applicant.userTestScheduledAt;
    if (scheduledDate && new Date(scheduledDate).getTime() > Date.now()) {
      return NextResponse.json(
        {
          error: `Tombol ujian masih terkunci! Ujian baru dapat dibuka pada jadwal yang telah ditetapkan: ${new Date(scheduledDate).toLocaleString("id-ID")}.`,
          isLockedByTime: true,
        },
        { status: 403 }
      );
    }

    // 3. Cek Token Sesi Ujian (Batch token atau token personal)
    const expectedToken = testType === "psikotes" ? applicant.psikotesToken : applicant.userTestToken;
    const cleanInputToken = (token || "").trim().toUpperCase();

    // Default room batch token jika HR belum menginput token khusus
    const validTokens = [
      expectedToken?.toUpperCase(),
      "ITSP2026",
      "PSIKO2026",
      "USER2026",
    ].filter(Boolean);

    if (!validTokens.includes(cleanInputToken)) {
      return NextResponse.json(
        { error: "Password / Token Ujian salah! Silakan tanyakan Token Sesi Ujian yang sah kepada Tim HR / Pengawas di ruangan." },
        { status: 400 }
      );
    }

    // 4. Cek apakah ujian sudah pernah disubmit atau dikunci
    const existingSubmission = applicant.testSubmissions.find((s) => s.testType === testType);
    if (existingSubmission && existingSubmission.submittedAt) {
      return NextResponse.json(
        { error: "Anda telah menyelesaikan dan mengirimkan ujian ini sebelumnya." },
        { status: 400 }
      );
    }

    if (existingSubmission && existingSubmission.isLocked) {
      return NextResponse.json(
        {
          error: "Sesi ujian Anda telah terkunci oleh sistem keamanan anti-kecurangan karena terdeteksi meninggalkan halaman tes. Silakan hubungi Tim HR untuk meminta Reset Sesi Ujian bila terjadi kendala teknis.",
          isLocked: true,
        },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Token valid! Mengarahkan ke ruang ujian online...",
    });
  } catch (error: any) {
    console.error("Token verification error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi token ujian." }, { status: 500 });
  }
}
