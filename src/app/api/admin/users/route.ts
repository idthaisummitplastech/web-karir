import { NextResponse } from "next/server";
import { getAdminSession, hashPassword } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { cmsPrisma } from "@/lib/cmsDb";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const users = await prisma.recruitmentAdmin.findMany({
      select: {
        id: true,
        username: true,
        name: true,
        email: true,
        role: true,
        department: true,
        isMfaEnabled: true,
        createdAt: true,
      },
      orderBy: { id: "asc" },
    });

    return NextResponse.json({ success: true, users });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat pengguna." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Super Admin yang berhak mengelola akun dan mereset status MFA." },
        { status: 403 }
      );
    }

    const { action, userId, username, name, email, password, role, department } = await req.json();

    if (action === "reset_mfa") {
      const updatedAdmin = await prisma.recruitmentAdmin.update({
        where: { id: Number(userId) },
        data: { isMfaEnabled: false, mfaSecret: null },
      });

      // Sinkronisasi reset MFA ke central CMS users
      try {
        await cmsPrisma.$queryRawUnsafe(
          "UPDATE users SET mfa_enabled = false, mfa_secret = null, updated_at = NOW() WHERE email = $1",
          updatedAdmin.email
        );
      } catch (cmsErr) {
        console.warn("Reset MFA sync to CMS failed:", cmsErr);
      }

      return NextResponse.json({
        success: true,
        message: "Pengaturan MFA berhasil di-reset. Akun dapat kembali login dan melakukan setup MFA ulang.",
      });
    }

    // Tambah Akun Baru
    if (!username || !password || !name || !email) {
      return NextResponse.json({ error: "Seluruh kolom wajib diisi." }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.recruitmentAdmin.create({
      data: {
        username: username.trim(),
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: hashedPassword,
        role: role || "hr",
        department: department || "Human Capital",
        isMfaEnabled: false,
      },
    });

    // Sinkronisasi otomatis ke Single Database Karyawan (web_perusahaan.users)
    try {
      const existingCms = await cmsPrisma.$queryRawUnsafe<any[]>(
        "SELECT id FROM users WHERE email = $1",
        newUser.email
      );

      if (existingCms.length === 0) {
        await cmsPrisma.$queryRawUnsafe(
          "INSERT INTO users (email, password, name, role, mfa_enabled, created_at, updated_at) VALUES ($1, $2, $3, $4, false, NOW(), NOW())",
          newUser.email,
          hashedPassword,
          newUser.name,
          newUser.role
        );
      } else {
        await cmsPrisma.$queryRawUnsafe(
          "UPDATE users SET name = $1, role = $2, password = $3, updated_at = NOW() WHERE email = $4",
          newUser.name,
          newUser.role,
          hashedPassword,
          newUser.email
        );
      }
    } catch (cmsErr) {
      console.warn("Sinkronisasi akun baru ke CMS users gagal atau dilewati:", cmsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${newUser.name} (${newUser.username}) berhasil dibuat dan disinkronkan ke database karyawan!`,
      user: newUser,
    });
  } catch (error: any) {
    console.error("User management error:", error);
    return NextResponse.json({ error: "Gagal memproses aksi pengguna." }, { status: 500 });
  }
}

