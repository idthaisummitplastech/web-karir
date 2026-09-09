import { NextResponse } from "next/server";
import { signApplicantToken } from "@/lib/auth";
import { fetchRawFromBackend } from "@/lib/api-client";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    let result: any;
    try {
      result = await fetchRawFromBackend("/auth/applicant-login", {
        method: "POST",
        body: JSON.stringify({
          email: email.trim().toLowerCase(),
          password,
        }),
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Akun pelamar tidak ditemukan atau password salah." },
        { status: 401 }
      );
    }

    const applicantData = result.data || result;

    // Sign JWT for Next.js cookie session
    const token = await signApplicantToken({
      applicantId: applicantData.id,
      email: applicantData.email,
      fullName: applicantData.fullName || applicantData.full_name,
      role: "applicant",
    });

    const cookieStore = await cookies();
    cookieStore.set("applicant_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      applicant: {
        id: applicantData.id,
        fullName: applicantData.fullName || applicantData.full_name,
        email: applicantData.email,
        currentStage: applicantData.currentStage || applicantData.current_stage,
        stageStatus: applicantData.stageStatus || applicantData.stage_status,
      },
    });
  } catch (error: any) {
    console.error("Applicant login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
