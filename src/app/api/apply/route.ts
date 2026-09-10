import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";
import { getAppUrl } from "@/lib/urls";
import { emailAccountCreated, sendMailDirect, generateCorporateEmailWrapper } from "@/lib/email";

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
      cvBase64,
      cvFileSize,
    } = body;

    const cleanFullName = fullName ? String(fullName).trim() : "";
    const cleanEmail = email ? String(email).trim().toLowerCase() : "";
    const cleanPhone = phone ? String(phone).trim() : "";
    const cleanSchoolName = schoolName ? String(schoolName).trim() : "";
    const cleanMajor = major ? String(major).trim() : "";
    const cleanLastEducation = lastEducation ? String(lastEducation).trim() : "";

    // 1. Validation
    if (
      !cleanFullName ||
      !cleanEmail ||
      !cleanPhone ||
      !birthDate ||
      !cleanLastEducation ||
      !cleanSchoolName ||
      !cleanMajor ||
      !jobPostingId ||
      !cvBase64
    ) {
      return NextResponse.json(
        { error: "Mohon lengkapi seluruh formulir pendaftaran yang bertanda bintang (*)." },
        { status: 400 }
      );
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Format alamat email tidak valid. Pastikan Anda memasukkan email aktif dengan benar." },
        { status: 400 }
      );
    }

    // 2. File size validation (100 KB limit)
    let calculatedSize = cvFileSize || 0;
    if (!calculatedSize && cvBase64) {
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

    // Call FastAPI backend to register applicant
    const result = await fetchFromBackend<{
      success: boolean;
      message: string;
      temp_password?: string;
      applicant: {
        id: number;
        full_name: string;
        email: string;
        current_stage: number;
        stage_status: string;
        job_posting: {
          id: number;
          title: string;
          department?: string;
        };
      };
    }>("/api/v1/applicants/apply", {
      method: "POST",
      body: JSON.stringify({
        job_posting_id: Number(jobPostingId),
        full_name: cleanFullName,
        email: cleanEmail,
        phone: cleanPhone,
        birth_date: birthDate,
        last_education: cleanLastEducation,
        school_name: cleanSchoolName,
        major: cleanMajor,
        experience: experience || "Fresh Graduate",
        english_skill: englishSkill || "Intermediate",
        other_languages: otherLanguages || "-",
        cv_file: cvBase64,
        cv_file_size: calculatedSize,
      }),
    });

    // Send email with credentials
    if (result.success && result.applicant) {
      const tempPassword = result.temp_password || `Itsp@${new Date().getFullYear()}`;
      const appUrl = getAppUrl();
      const jobTitle = result.applicant.job_posting?.title || "Posisi Pilihan";

      const emailSubject = `Konfirmasi Pendaftaran & Kredensial Akun Portal Karir PT ITSP - ${jobTitle}`;
      const emailHtml = emailAccountCreated(
        result.applicant.full_name,
        jobTitle,
        result.applicant.email,
        tempPassword,
        appUrl
      );

      sendMailDirect({
        to: result.applicant.email,
        subject: emailSubject,
        html: emailHtml,
      }).catch((mailErr) => {
        console.error("[APPLY EMAIL ERROR] Gagal mengirim email:", mailErr?.message);
      });
    }

    return NextResponse.json({
      success: true,
      message: result.message || "Pendaftaran lamaran kerja Anda berhasil dikirim!",
      applicant: result.applicant,
    });
  } catch (error: any) {
    console.error("Application submission error:", error);
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan saat memproses pendaftaran. Silakan coba kembali." },
      { status: error?.status || 500 }
    );
  }
}
