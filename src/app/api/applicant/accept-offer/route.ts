import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid." }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id: session.applicantId },
      include: { jobPosting: true, karyawanData: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
    }

    if (applicant.currentStage !== 7) {
      return NextResponse.json(
        { error: "Anda belum berada pada Tahap 7 (Offering Letter)." },
        { status: 400 }
      );
    }

    // 1. Update status pelamar
    const updatedApplicant = await prisma.applicant.update({
      where: { id: applicant.id },
      data: {
        offeringStatus: "accepted",
        stageStatus: "passed",
        contractSignedAt: new Date(),
      },
    });

    // 2. Buat Data Karyawan Sementara jika belum ada
    if (!applicant.karyawanData) {
      const count = await prisma.karyawanSementara.count();
      const nextNum = (count + 1).toString().padStart(3, "0");
      const tempNik = `TEMP-${new Date().getFullYear()}-${nextNum}`;

      await prisma.karyawanSementara.create({
        data: {
          applicantId: applicant.id,
          nikSementara: tempNik,
          namaLengkap: applicant.fullName,
          email: applicant.email,
          noHp: applicant.phone,
          departemen: applicant.jobPosting.department,
          jabatan: applicant.jobPosting.title,
          tanggalBergabung: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Default join: 1 week from now
          statusIntegrasi: "ready",
          idCardPrinted: false,
        },
      });
    }

    return NextResponse.json({
      success: true,
      message: "Selamat! Anda telah resmi menyetujui Penawaran Kerja PT Indonesia Thai Summit Plastech. Data Anda telah diproses ke bagian Human Capital untuk penerbitan ID Card & jadwal penandatanganan kontrak fisik di pabrik.",
    });
  } catch (error: any) {
    console.error("Accept offer error:", error);
    return NextResponse.json({ error: "Gagal memproses persetujuan offering." }, { status: 500 });
  }
}
