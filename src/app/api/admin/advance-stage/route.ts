import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  emailScreeningPassed,
  emailPsikotesPassed,
  emailMcuReferral,
  emailOfferingIssued,
  emailRejectionNotice,
} from "@/lib/email";
import { DEFAULT_SETTINGS, RECRUITMENT_STAGES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 });
    }

    const { applicantId, action, notes, scheduledAt, token, salaryOffer } = await req.json();

    const applicant = await prisma.applicant.findUnique({
      where: { id: Number(applicantId) },
      include: { jobPosting: true, karyawanData: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Pelamar tidak ditemukan." }, { status: 404 });
    }

    // =========================================================================
    // VALIDASI HAK APPROVAL PER TAHAP:
    // - Tahap HR: 1 (Screening), 2 (Psikotes), 4 (Interview HR), 6 (MCU), 7 (Offering)
    // - Tahap User Dept: 3 (Tes Teknis Kejuruan & Essay), 5 (Interview User)
    // - Super Admin: Memiliki hak pengawasan penuh di semua tahap
    // =========================================================================
    const hrStages = [1, 2, 4, 6, 7];
    const userDeptStages = [3, 5];

    if (session.role === "user_dept" && !userDeptStages.includes(applicant.currentStage)) {
      const stageName = RECRUITMENT_STAGES.find((s) => s.number === applicant.currentStage)?.name || `Tahap ${applicant.currentStage}`;
      return NextResponse.json(
        {
          error: `Akses Ditolak: ${stageName} merupakan wewenang Tim HR Recruitment. User Departemen hanya berwenang meloloskan Tahap 3 (Tes Teknis & Essay) dan Tahap 5 (Interview User).`,
        },
        { status: 403 }
      );
    }

    if (session.role === "hr" && !hrStages.includes(applicant.currentStage)) {
      const stageName = RECRUITMENT_STAGES.find((s) => s.number === applicant.currentStage)?.name || `Tahap ${applicant.currentStage}`;
      return NextResponse.json(
        {
          error: `Akses Ditolak: ${stageName} merupakan wewenang User Departemen terkait (${applicant.jobPosting.department}) untuk mengevaluasi dan meloloskan peserta.`,
        },
        { status: 403 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    // KASUS PENOLAKAN (REJECT)
    if (action === "reject") {
      const currentStageInfo = RECRUITMENT_STAGES.find((s) => s.number === applicant.currentStage);
      const stageName = currentStageInfo ? currentStageInfo.name : `Tahap ${applicant.currentStage}`;

      await prisma.applicant.update({
        where: { id: applicant.id },
        data: {
          stageStatus: "failed",
          failedAtStage: applicant.currentStage,
          rejectionReason: notes || "Kualifikasi belum sesuai dengan kebutuhan posisi saat ini.",
        },
      });

      // Kirim email penolakan resmi
      emailRejectionNotice(applicant.fullName, applicant.jobPosting.title, stageName);
      console.log(`[SIMULATED REJECTION EMAIL SENT] to ${applicant.email}`);

      return NextResponse.json({
        success: true,
        message: `Pelamar ${applicant.fullName} telah dinyatakan Tidak Lolos pada ${stageName}. Email pemberitahuan santun telah dikirimkan secara otomatis.`,
      });
    }

    // KASUS KELOLOSAN (APPROVE & ADVANCE STAGE)
    const nextStage = applicant.currentStage + 1;
    const updateData: any = {
      stageStatus: "in_progress",
    };

    if (nextStage <= 7) {
      updateData.currentStage = nextStage;
    } else {
      updateData.stageStatus = "passed";
    }

    // Penanganan khusus per tahap
    if (applicant.currentStage === 1) {
      // Lolos Screening -> Masuk Tahap 2 (Psikotes)
      updateData.screeningNotes = notes || "Berkas lengkap & memenuhi kualifikasi.";
      updateData.psikotesToken = token || "PSIKO2026";
      if (scheduledAt) updateData.psikotesScheduledAt = new Date(scheduledAt);

      emailScreeningPassed(
        applicant.fullName,
        applicant.jobPosting.title,
        scheduledAt ? new Date(scheduledAt).toLocaleString("id-ID") : "Jadwal Terbuka di Dashboard",
        appUrl
      );
    } else if (applicant.currentStage === 2) {
      // Lolos Psikotes -> Masuk Tahap 3 (Tes Teknis User)
      updateData.userTestToken = token || "USER2026";
      if (scheduledAt) updateData.userTestScheduledAt = new Date(scheduledAt);

      emailPsikotesPassed(
        applicant.fullName,
        applicant.jobPosting.title,
        scheduledAt ? new Date(scheduledAt).toLocaleString("id-ID") : "Sesuai Jadwal di Dashboard",
        appUrl
      );
    } else if (applicant.currentStage === 5) {
      // Lolos Interview User -> Masuk Tahap 6 (MCU)
      const settings = await prisma.recruitmentSetting.findMany();
      const sMap = settings.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {} as any);

      const clinic = sMap["mcu_partner_name"] || DEFAULT_SETTINGS.mcuPartnerName;
      const address = sMap["mcu_partner_address"] || DEFAULT_SETTINGS.mcuPartnerAddress;
      const cost = sMap["mcu_estimated_cost"] || DEFAULT_SETTINGS.mcuEstimatedCost;
      const instr = sMap["mcu_instructions"] || DEFAULT_SETTINGS.mcuInstructions;

      emailMcuReferral(applicant.fullName, applicant.jobPosting.title, clinic, address, cost, instr, appUrl);
    } else if (applicant.currentStage === 6) {
      // Lolos MCU -> Masuk Tahap 7 (Offering Letter)
      updateData.mcuNotes = notes || "Hasil MCU: Fit to Work (Memenuhi Syarat Medis)";
      updateData.offeringStatus = "issued";
      updateData.offeringSalary = salaryOffer || "Sesuai Standar Grade PT ITSP + Tunjangan";
      updateData.offeringLetter = notes || "Surat Penawaran Resmi PT ITSP: Selamat bergabung dengan paket kompensasi kompetitif, BPJS Kesehatan & Ketenagakerjaan, Asuransi, serta Makan & Transportasi Pabrik.";

      emailOfferingIssued(applicant.fullName, applicant.jobPosting.title, appUrl);
    } else if (applicant.currentStage === 7) {
      // Selesai Offering -> Otomatis Salin ke Karyawan Sementara
      updateData.stageStatus = "passed";
      updateData.contractSignedAt = new Date();

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
            tanggalBergabung: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            statusIntegrasi: "ready",
            idCardPrinted: false,
          },
        });
      }
    }

    const updated = await prisma.applicant.update({
      where: { id: applicant.id },
      data: updateData,
    });

    return NextResponse.json({
      success: true,
      message: `Berhasil meloloskan ${applicant.fullName} ke Tahap ${updated.currentStage}. Notifikasi email resmi telah dikirimkan secara otomatis!`,
      applicant: updated,
    });
  } catch (error: any) {
    console.error("Advance stage error:", error);
    return NextResponse.json({ error: "Gagal memproses perubahan tahap pelamar." }, { status: 500 });
  }
}
