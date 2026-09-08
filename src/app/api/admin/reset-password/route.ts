import { NextResponse } from "next/server";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cmsPrisma } from "@/lib/cmsDb";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Akses ditolak." }, { status: 401 });
    }

    const { targetType, targetId, newPassword } = await req.json();

    if (!targetType || !targetId) {
      return NextResponse.json({ error: "Parameter target tidak lengkap." }, { status: 400 });
    }

    // Generate default annual secure password (e.g. Itsp@2026, Itsp@2027) if not provided
    const currentYear = new Date().getFullYear();
    const defaultPassword = `Itsp@${currentYear}`;
    const resolvedPassword =
      newPassword && newPassword.trim().length >= 6
        ? newPassword.trim()
        : defaultPassword;

    const hashedPassword = await hashPassword(resolvedPassword);

    if (targetType === "applicant") {
      const applicant = await prisma.applicant.findUnique({
        where: { id: Number(targetId) },
      });

      if (!applicant) {
        return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
      }

      await prisma.applicant.update({
        where: { id: applicant.id },
        data: { password: hashedPassword },
      });

      return NextResponse.json({
        success: true,
        message: `Password pelamar ${applicant.fullName} berhasil di-reset menjadi: ${resolvedPassword}`,
        newPassword: resolvedPassword,
      });
    } else if (targetType === "admin") {
      // HANYA SUPER ADMIN YANG BERHAK MERESET PASSWORD STAF/INTERNAL
      if (session.role !== "admin" && session.role !== "superadmin") {
        return NextResponse.json(
          { error: "Akses Ditolak: Hanya Super Administrator yang berhak mereset password akun staf/karyawan." },
          { status: 403 }
        );
      }

      const admin = await prisma.recruitmentAdmin.findUnique({
        where: { id: Number(targetId) },
      });

      if (!admin) {
        return NextResponse.json({ error: "Data user admin tidak ditemukan." }, { status: 404 });
      }

      await prisma.recruitmentAdmin.update({
        where: { id: admin.id },
        data: { password: hashedPassword },
      });

      // Sinkronisasi reset password ke central CMS users
      try {
        await cmsPrisma.$queryRawUnsafe(
          "UPDATE users SET password = $1, updated_at = NOW() WHERE email = $2",
          hashedPassword,
          admin.email
        );
      } catch (cmsErr) {
        console.warn("Sync password reset to CMS failed:", cmsErr);
      }

      return NextResponse.json({
        success: true,
        message: `Password akun ${admin.name} (${admin.username}) berhasil di-reset menjadi: ${resolvedPassword}`,
        newPassword: resolvedPassword,
      });
    }

    return NextResponse.json({ error: "Tipe target tidak valid." }, { status: 400 });
  } catch (error: any) {
    console.error("Reset password error:", error);
    return NextResponse.json({ error: "Gagal mereset password." }, { status: 500 });
  }
}
