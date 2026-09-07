import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== "admin" && session.role !== "hr")) {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Admin atau HR yang berhak menjalankan pembersihan database." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const mode = body?.mode || "soft_cleanup"; // 'soft_cleanup' (expire & purge heavy CVs) atau 'hard_delete' (hapus data gugur > 30 hari)

    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // 1. Temukan pelamar yang in_progress tapi didiamkan / mangkir > 30 hari
    const abandonedApplicants = await prisma.applicant.findMany({
      where: {
        stageStatus: "in_progress",
        createdAt: { lt: thirtyDaysAgo },
      },
      select: { id: true, currentStage: true },
    });

    let autoExpiredCount = 0;
    if (abandonedApplicants.length > 0) {
      for (const a of abandonedApplicants) {
        await prisma.applicant.update({
          where: { id: a.id },
          data: {
            stageStatus: "failed",
            failedAtStage: a.currentStage,
            rejectionReason: "Gugur Otomatis: Masa aktif seleksi berakhir (tidak ada aktivitas lebih dari 30 hari).",
          },
        });
      }
      autoExpiredCount = abandonedApplicants.length;
    }

    if (mode === "hard_delete") {
      // Hapus tuntas pelamar yang berstatus failed dan usianya > 30 hari
      const failedOld = await prisma.applicant.findMany({
        where: {
          stageStatus: "failed",
          createdAt: { lt: thirtyDaysAgo },
        },
        select: { id: true },
      });

      let hardDeletedCount = 0;
      for (const f of failedOld) {
        await prisma.karyawanSementara.deleteMany({ where: { applicantId: f.id } });
        await prisma.applicant.delete({ where: { id: f.id } });
        hardDeletedCount++;
      }

      return NextResponse.json({
        success: true,
        message: `Pembersihan Tuntas Selesai! ${autoExpiredCount} pelamar mangkir diubah statusnya menjadi Gugur, dan ${hardDeletedCount} data pelamar kedaluwarsa dihapus permanen dari database.`,
        autoExpiredCount,
        hardDeletedCount,
      });
    }

    // Default: Soft Cleanup (Kosongkan file CV Base64 dari pelamar gugur > 30 hari untuk hemat 95% ruang DB)
    const purgedCvResult = await prisma.applicant.updateMany({
      where: {
        stageStatus: "failed",
        createdAt: { lt: thirtyDaysAgo },
        cvFile: { not: "" },
      },
      data: {
        cvFile: "",
        cvFileSize: 0,
      },
    });

    return NextResponse.json({
      success: true,
      message: `Optimalisasi Database Selesai! ${autoExpiredCount} pelamar mangkir diubah statusnya menjadi Gugur, dan ${purgedCvResult.count} berkas CV lama berhasil dikosongkan. Beban database berkurang drastis.`,
      autoExpiredCount,
      purgedCvCount: purgedCvResult.count,
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pembersihan database: " + error.message },
      { status: 500 }
    );
  }
}
