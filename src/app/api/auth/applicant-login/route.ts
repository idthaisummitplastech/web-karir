import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signApplicantToken } from "@/lib/auth";
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

    const applicant = await prisma.applicant.findUnique({
      where: { email: email.trim().toLowerCase() },
      include: { jobPosting: true },
    });

    if (!applicant) {
      return NextResponse.json(
        { error: "Akun pelamar dengan email tersebut tidak ditemukan." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, applicant.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Password yang Anda masukkan salah. Silakan periksa email konfirmasi pendaftaran Anda." },
        { status: 401 }
      );
    }

    // Sign JWT
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
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: "/",
    });

    return NextResponse.json({
      success: true,
      applicant: {
        id: applicant.id,
        fullName: applicant.fullName,
        email: applicant.email,
        currentStage: applicant.currentStage,
        stageStatus: applicant.stageStatus,
        jobTitle: applicant.jobPosting.title,
      },
    });
  } catch (error: any) {
    console.error("Applicant login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal pada server." }, { status: 500 });
  }
}
