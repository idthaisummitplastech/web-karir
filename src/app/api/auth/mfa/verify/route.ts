import { NextResponse } from "next/server";
import { getAdminSession, verifyTotpCode } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { code, enable } = await req.json();

    const admin = await prisma.recruitmentAdmin.findUnique({
      where: { id: session.adminId },
    });

    if (!admin || !admin.mfaSecret) {
      return NextResponse.json({ error: "Secret MFA belum diinisialisasi." }, { status: 400 });
    }

    if (enable) {
      const isValid = verifyTotpCode(admin.mfaSecret, code);
      if (!isValid) {
        return NextResponse.json(
          { error: "Kode verifikasi 6-digit tidak valid atau sudah kedaluwarsa. Pastikan jam HP (iPhone: Pengaturan > Umum > Tanggal & Waktu > Atur Otomatis AKTIF) dan jam laptop/server sudah sinkron (WIB UTC+7), lalu masukkan kode yang sedang aktif." },
          { status: 400 }
        );
      }

      await prisma.recruitmentAdmin.update({
        where: { id: admin.id },
        data: { isMfaEnabled: true },
      });

      return NextResponse.json({
        success: true,
        message: "Autentikasi 2 Langkah (Google Authenticator) berhasil diaktifkan untuk akun Anda!",
      });
    } else {
      // Disable MFA - Strictly restricted to admin role
      if (session.role !== "admin") {
        return NextResponse.json(
          { error: "Akses Ditolak: Staf tidak diperkenankan menonaktifkan MFA. Hubungi Super Admin jika ingin mereset." },
          { status: 403 }
        );
      }

      await prisma.recruitmentAdmin.update({
        where: { id: admin.id },
        data: { isMfaEnabled: false },
      });

      return NextResponse.json({
        success: true,
        message: "MFA berhasil dinonaktifkan.",
      });
    }
  } catch (error: any) {
    console.error("MFA verify error:", error);
    return NextResponse.json({ error: "Gagal memverifikasi MFA." }, { status: 500 });
  }
}
