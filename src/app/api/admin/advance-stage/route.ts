import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  emailScreeningPassed,
  emailPsikotesPassed,
  emailMcuReferral,
  emailOfferingIssued,
  emailRejectionNotice,
  sendMailDirect,
  generateCorporateEmailWrapper,
} from "@/lib/email";
import { DEFAULT_SETTINGS, RECRUITMENT_STAGES } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 });
    }

    const { applicantId, action, notes, scheduledAt, token, salaryOffer, location } = await req.json();

    const applicant = await prisma.applicant.findUnique({
      where: { id: Number(applicantId) },
      include: { jobPosting: true, karyawanData: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Pelamar tidak ditemukan." }, { status: 404 });
    }

    // RBAC: Cek hak akses per role
    // HR: Tahap 1, 2, 4, 6, 7
    // User Dept: Tahap 3 (Tes Teknis) & Tahap 5 (Interview Teknis)
    const userDeptStages = [3, 5];
    const hrStages = [1, 2, 4, 6, 7];

    if (session.role === "user_dept") {
      if (!userDeptStages.includes(applicant.currentStage)) {
        const stageName = RECRUITMENT_STAGES.find((s) => s.number === applicant.currentStage)?.name || `Tahap ${applicant.currentStage}`;
        return NextResponse.json(
          {
            error: `Akses Ditolak: User Departemen hanya berhak meloloskan pelamar pada Tahap 3 (Ujian Teknis) & Tahap 5 (Interview User). ${stageName} adalah wewenang HR Recruitment.`,
          },
          { status: 403 }
        );
      }

      // Validasi Kesesuaian Departemen:
      // User Departemen HANYA berhak meloloskan pelamar yang melamar pada divisinya sendiri
      const userDept = (session.department || "").trim().toLowerCase();
      const jobDept = (applicant.jobPosting?.department || "").trim().toLowerCase();

      if (userDept && jobDept && !jobDept.includes(userDept) && !userDept.includes(jobDept)) {
        return NextResponse.json(
          {
            error: `Akses Ditolak: Anda login sebagai User Departemen '${session.department}'. Anda hanya berhak mengevaluasi & meloloskan pelamar untuk lowongan divisi '${session.department}'. Pelamar ini melamar untuk divisi '${applicant.jobPosting?.department}'.`,
          },
          { status: 403 }
        );
      }
    }

    if (session.role === "hr" && !hrStages.includes(applicant.currentStage)) {
      const stageName = RECRUITMENT_STAGES.find((s) => s.number === applicant.currentStage)?.name || `Tahap ${applicant.currentStage}`;
      return NextResponse.json(
        {
          error: `Akses Ditolak: ${stageName} adalah wewenang penilaian teknis User Departemen (${applicant.jobPosting?.department || 'Terkait'}). Mohon tunggu evaluasi dari tim departemen tersebut.`,
        },
        { status: 403 }
      );
    }

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";

    // KASUS PERBARUI JADWAL, TEMPAT & TOKEN SESI UJIAN (UPDATE TEST SESSION / TOKEN)
    if (action === "update_test_session" || action === "update_token") {
      const updateData: any = {};
      if (applicant.currentStage === 2) {
        if (token) updateData.psikotesToken = token.trim().toUpperCase();
        if (scheduledAt !== undefined) updateData.psikotesScheduledAt = scheduledAt ? new Date(scheduledAt) : null;
        if (location !== undefined) updateData.psikotesLocation = location.trim();
      } else if (applicant.currentStage === 3) {
        if (token) updateData.userTestToken = token.trim().toUpperCase();
        if (scheduledAt !== undefined) updateData.userTestScheduledAt = scheduledAt ? new Date(scheduledAt) : null;
        if (location !== undefined) updateData.userTestLocation = location.trim();
      } else {
        return NextResponse.json(
          { error: `Pelamar berada di Tahap ${applicant.currentStage} yang bukan tahapan ujian online berbasis token.` },
          { status: 400 }
        );
      }

      await prisma.applicant.update({
        where: { id: applicant.id },
        data: updateData,
      });

      return NextResponse.json({
        success: true,
        message: `Pengaturan jadwal, tempat & token ujian untuk ${applicant.fullName} berhasil diperbarui!`,
      });
    }

    // Ambil Pengaturan & Master Template Email Kustom dari Database
    const settingsList = await prisma.recruitmentSetting.findMany();
    const settingsMap = settingsList.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {} as Record<string, string>);

    const renderTemplate = (key: string, defaultSubject: string, defaultHtml: string, vars: Record<string, string>) => {
      const customSub = settingsMap[`email_tpl_${key}_subject`];
      const customBody = settingsMap[`email_tpl_${key}_body`];

      if (customSub && customBody) {
        let sub = customSub;
        let body = customBody;
        Object.entries(vars).forEach(([k, v]) => {
          sub = sub.replace(new RegExp(`{${k}}`, "g"), v || "-");
          body = body.replace(new RegExp(`{${k}}`, "g"), v || "-");
        });
        body = body.replace(/\n/g, "<br/>");
        return {
          subject: sub,
          html: generateCorporateEmailWrapper(
            sub,
            `<div style="line-height: 1.7; font-size: 14px; color: #334155;">${body}</div>`
          ),
        };
      }

      return { subject: defaultSubject, html: defaultHtml };
    };

    // KASUS PENOLAKAN (REJECT)
    if (action === "reject") {
      const currentStageInfo = RECRUITMENT_STAGES.find((s) => s.number === applicant.currentStage);
      const stageName = currentStageInfo ? currentStageInfo.name : `Tahap ${applicant.currentStage}`;

      await prisma.applicant.update({
        where: { id: applicant.id },
        data: {
          stageStatus: "failed",
          failedAtStage: applicant.currentStage,
          rejectionReason: notes || "Kualifikasi teknis belum memenuhi kriteria spesifikasi saat ini.",
        },
      });

      const rejectDefaultHtml = emailRejectionNotice(applicant.fullName, applicant.jobPosting.title, stageName);
      const mailData = renderTemplate(
        "rejection_notice",
        `[PT ITSP] Pemberitahuan Status Seleksi - ${applicant.jobPosting.title}`,
        rejectDefaultHtml,
        {
          nama: applicant.fullName,
          posisi: applicant.jobPosting.title,
          tahap_gagal: stageName,
        }
      );

      sendMailDirect({
        to: applicant.email,
        subject: mailData.subject,
        html: mailData.html,
      }).catch((err) => console.error("Email reject error:", err));

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
      if (location) (updateData as any).psikotesLocation = location.trim();

      const formattedSchedule = scheduledAt ? new Date(scheduledAt).toLocaleString("id-ID") : "Jadwal Terbuka di Dashboard";
      const testLocation = location ? location.trim() : "Portal Karir Online PT ITSP";
      const defaultHtml = emailScreeningPassed(
        applicant.fullName,
        applicant.jobPosting.title,
        formattedSchedule,
        appUrl,
        testLocation
      );
      const mailData = renderTemplate(
        "screening_passed",
        `[PT ITSP] Hasil Screening & Undangan Psikotes - ${applicant.jobPosting.title}`,
        defaultHtml,
        {
          nama: applicant.fullName,
          posisi: applicant.jobPosting.title,
          jadwal: formattedSchedule,
          lokasi: testLocation,
          token: token || "PSIKO2026",
          link_portal: `${appUrl}/login`,
        }
      );
      sendMailDirect({
        to: applicant.email,
        subject: mailData.subject,
        html: mailData.html,
      }).catch((err) => console.error("Email screening error:", err));
    } else if (applicant.currentStage === 2) {
      // Lolos Psikotes -> Masuk Tahap 3 (Tes Teknis User)
      updateData.userTestToken = token || "USER2026";
      if (scheduledAt) updateData.userTestScheduledAt = new Date(scheduledAt);
      if (location) (updateData as any).userTestLocation = location.trim();

      const formattedSchedule = scheduledAt ? new Date(scheduledAt).toLocaleString("id-ID") : "Sesuai Jadwal di Dashboard";
      const testLocation = location ? location.trim() : "Portal Karir Online PT ITSP";
      const defaultHtml = emailPsikotesPassed(
        applicant.fullName,
        applicant.jobPosting.title,
        formattedSchedule,
        appUrl,
        testLocation
      );
      const mailData = renderTemplate(
        "psikotes_passed",
        `[PT ITSP] Hasil Psikotes & Undangan Ujian Teknis - ${applicant.jobPosting.title}`,
        defaultHtml,
        {
          nama: applicant.fullName,
          posisi: applicant.jobPosting.title,
          jadwal: formattedSchedule,
          lokasi: testLocation,
          token: token || "USER2026",
          link_portal: `${appUrl}/login`,
        }
      );
      sendMailDirect({
        to: applicant.email,
        subject: mailData.subject,
        html: mailData.html,
      }).catch((err) => console.error("Email psikotes error:", err));
    } else if (applicant.currentStage === 5) {
      // Lolos Interview User -> Masuk Tahap 6 (MCU)
      const clinic = settingsMap["mcu_partner_name"] || DEFAULT_SETTINGS.mcuPartnerName;
      const address = settingsMap["mcu_partner_address"] || DEFAULT_SETTINGS.mcuPartnerAddress;
      const cost = settingsMap["mcu_estimated_cost"] || DEFAULT_SETTINGS.mcuEstimatedCost;
      const instr = settingsMap["mcu_instructions"] || DEFAULT_SETTINGS.mcuInstructions;

      const defaultHtml = emailMcuReferral(applicant.fullName, applicant.jobPosting.title, clinic, address, cost, instr, appUrl);
      const mailData = renderTemplate(
        "mcu_referral",
        `[PT ITSP] Rujukan Medical Check-Up (MCU) - ${applicant.jobPosting.title}`,
        defaultHtml,
        {
          nama: applicant.fullName,
          posisi: applicant.jobPosting.title,
          klinik_mcu: clinic,
          alamat_mcu: address,
          biaya_mcu: cost,
          link_portal: `${appUrl}/login`,
        }
      );
      sendMailDirect({
        to: applicant.email,
        subject: mailData.subject,
        html: mailData.html,
      }).catch((err) => console.error("Email MCU error:", err));
    } else if (applicant.currentStage === 6) {
      // Lolos MCU -> Masuk Tahap 7 (Offering Letter)
      updateData.mcuNotes = notes || "Hasil MCU: Fit to Work (Memenuhi Syarat Medis)";
      updateData.offeringStatus = "issued";
      updateData.offeringSalary = salaryOffer || "Sesuai Standar Grade PT ITSP + Tunjangan";
      updateData.offeringLetter = notes || "Surat Penawaran Resmi PT ITSP: Selamat bergabung dengan paket kompensasi kompetitif, BPJS Kesehatan & Ketenagakerjaan, Asuransi, serta Makan & Transportasi Pabrik.";

      const defaultHtml = emailOfferingIssued(applicant.fullName, applicant.jobPosting.title, appUrl);
      const mailData = renderTemplate(
        "offering_issued",
        `[PT ITSP] Resmi: Penawaran Kerja (Offering Letter) - ${applicant.jobPosting.title}`,
        defaultHtml,
        {
          nama: applicant.fullName,
          posisi: applicant.jobPosting.title,
          gaji_offer: salaryOffer || "Sesuai Standar Grade PT ITSP + Tunjangan",
          link_portal: `${appUrl}/login`,
        }
      );
      sendMailDirect({
        to: applicant.email,
        subject: mailData.subject,
        html: mailData.html,
      }).catch((err) => console.error("Email offering error:", err));
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
