import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword, signApplicantToken } from "@/lib/auth";
import { emailAccountCreated, sendMailDirect, generateCorporateEmailWrapper } from "@/lib/email";
import { cookies } from "next/headers";

const MAX_FILE_SIZE_BYTES = 100 * 1024; // 100 KB strictly

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const {
      fullName,
      email,
      phone,
      birthDate,
      lastEducation,
      schoolName,
      major,
      jobPostingId,
      experience,
      englishSkill,
      otherLanguages,
      cvBase64, // Data URL: "data:application/pdf;base64,..."
      cvFileName,
      cvFileSize, // in bytes
    } = body;

    // 1. Validasi Input Wajib
    if (!fullName || !email || !phone || !birthDate || !lastEducation || !schoolName || !major || !jobPostingId || !cvBase64) {
      return NextResponse.json(
        { error: "Mohon lengkapi seluruh formulir pendaftaran 13 kolom yang bertanda bintang (*)." },
        { status: 400 }
      );
    }

    // 2. Validasi Batas Maksimal File CV 100 KB (Strict)
    let calculatedSize = cvFileSize || 0;
    if (!calculatedSize && cvBase64) {
      // Hitung ukuran dari base64 string
      const base64Data = cvBase64.replace(/^data:application\/pdf;base64,/, "");
      calculatedSize = Math.round((base64Data.length * 3) / 4);
    }

    if (calculatedSize > MAX_FILE_SIZE_BYTES) {
      return NextResponse.json(
        {
          error: `Ukuran file CV Anda (${(calculatedSize / 1024).toFixed(1)} KB) melebihi batas maksimal yang diizinkan (100 KB). Mohon kompres file PDF Anda menggunakan kompresor PDF online sebelum mengunggah.`,
        },
        { status: 400 }
      );
    }

    // Pastikan format file adalah PDF
    if (!cvBase64.startsWith("data:application/pdf;base64,")) {
      return NextResponse.json(
        { error: "Format berkas CV wajib berupa dokumen PDF (.pdf)." },
        { status: 400 }
      );
    }

    const normalizedEmail = email.trim().toLowerCase();

    // 3. Periksa apakah pelamar sudah pernah mendaftar
    const existing = await prisma.applicant.findUnique({
      where: { email: normalizedEmail },
    });

    if (existing) {
      return NextResponse.json(
        {
          error: "Alamat email ini sudah terdaftar dalam sistem rekrutmen. Silakan langsung login ke Portal Pelamar untuk memantau status seleksi Anda.",
        },
        { status: 400 }
      );
    }

    // 3b. Tolak lamaran ke lowongan yang tutup / terjadwal / kedaluwarsa
    const targetJob = await prisma.jobPosting.findUnique({ where: { id: Number(jobPostingId) } });
    if (!targetJob) {
      return NextResponse.json({ error: "Lowongan yang dipilih tidak ditemukan." }, { status: 404 });
    }
    const nowDate = new Date();
    if (!targetJob.isOpen) {
      return NextResponse.json({ error: "Mohon maaf, lowongan ini sudah DITUTUP dan tidak menerima lamaran baru." }, { status: 400 });
    }
    if (targetJob.openingDate && new Date(targetJob.openingDate).getTime() > nowDate.getTime()) {
      return NextResponse.json({ error: "Lowongan ini belum dibuka. Silakan kembali pada tanggal pembukaan." }, { status: 400 });
    }
    if (targetJob.closingDate && new Date(targetJob.closingDate).getTime() < nowDate.getTime()) {
      return NextResponse.json({ error: "Masa pendaftaran lowongan ini telah BERAKHIR (kedaluwarsa)." }, { status: 400 });
    }

    // 4. Hitung Usia dari Tanggal Lahir
    const birthDateObj = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birthDateObj.getFullYear();
    const monthDiff = today.getMonth() - birthDateObj.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDateObj.getDate())) {
      age--;
    }

    // 5. Generate Password Sementara Standar Berdasarkan Tahun Berjalan (e.g. Itsp@2026, Itsp@2027)
    const currentYear = new Date().getFullYear();
    const tempPassword = `Itsp@${currentYear}`;
    const hashedPassword = await hashPassword(tempPassword);

    // 6. Buat Record Pelamar
    const applicant = await prisma.applicant.create({
      data: {
        jobPostingId: Number(jobPostingId),
        fullName: fullName.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone.trim(),
        birthDate: birthDateObj,
        age: age > 0 ? age : 20,
        lastEducation,
        schoolName: schoolName.trim(),
        major: major.trim(),
        experience: experience || "Fresh Graduate",
        englishSkill: englishSkill || "Intermediate",
        otherLanguages: otherLanguages || "-",
        cvFile: cvBase64,
        cvFileSize: calculatedSize,
        currentStage: 1, // Stage 1: Screening Dokumen
        stageStatus: "in_progress",
      },
      include: {
        jobPosting: true,
      },
    });

    // 7. Siapkan & Kirim Email Kredensial Resmi
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    let emailHtml = emailAccountCreated(
      applicant.fullName,
      applicant.jobPosting.title,
      applicant.email,
      tempPassword,
      appUrl
    );
    let emailSubject = `Konfirmasi Pendaftaran & Kredensial Akun Portal Karir PT ITSP - ${applicant.jobPosting.title}`;

    // Cek jika Super Admin telah menetapkan template kustom di database
    try {
      const customSub = await prisma.recruitmentSetting.findUnique({ where: { key: "email_tpl_account_created_subject" } });
      const customBody = await prisma.recruitmentSetting.findUnique({ where: { key: "email_tpl_account_created_body" } });
      if (customSub?.value && customBody?.value) {
        emailSubject = customSub.value
          .replace(/{posisi}/g, applicant.jobPosting.title)
          .replace(/{nama}/g, applicant.fullName);

        const renderedBody = customBody.value
          .replace(/{nama}/g, applicant.fullName)
          .replace(/{posisi}/g, applicant.jobPosting.title)
          .replace(/{email}/g, applicant.email)
          .replace(/{password}/g, tempPassword)
          .replace(/{link_portal}/g, `${appUrl}/login`)
          .replace(/\n/g, "<br/>");

        emailHtml = generateCorporateEmailWrapper(
          emailSubject,
          `<div style="line-height: 1.7; font-size: 14px; color: #334155;">${renderedBody}</div>`
        );
      }
    } catch (tplErr) {
      console.warn("Custom email template fetch failed, using default:", tplErr);
    }

    try {
      await sendMailDirect({
        to: applicant.email,
        subject: emailSubject,
        html: emailHtml,
      });
      console.log(`[REAL EMAIL SENT] to ${applicant.email} (Password: ${tempPassword})`);
    } catch (mailErr: any) {
      console.error("[APPLY EMAIL ERROR] Gagal mengirim email pendaftaran:", mailErr?.message);
    }

    // 8. Buat Sesi Login Otomatis
    const token = await signApplicantToken({
      applicantId: applicant.id,
      email: applicant.email,
      fullName: applicant.fullName,
      role: "applicant",
    });

    const cookieStore = await cookies();
    cookieStore.set("applicant_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      message: "Pendaftaran lamaran kerja Anda berhasil dikirim!",
      applicant: {
        id: applicant.id,
        fullName: applicant.fullName,
        email: applicant.email,
        jobTitle: applicant.jobPosting.title,
      },
      tempPassword,
    });
  } catch (error: any) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pendaftaran. Silakan coba kembali." },
      { status: 500 }
    );
  }
}
