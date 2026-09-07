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

    // Kumpulkan seluruh departemen unik yang pernah dibuat di sistem
    const jobDepts = await prisma.jobPosting.findMany({ select: { department: true }, distinct: ['department'] });
    const questionDepts = await prisma.testQuestion.findMany({ select: { department: true }, distinct: ['department'] });
    const adminDepts = await prisma.recruitmentAdmin.findMany({ select: { department: true }, distinct: ['department'] });

    const baseDepts = [
      "Human Capital",
      "Engineering",
      "IT",
      "Production",
      "Quality Control",
      "Purchasing",
      "HSE",
      "PPIC",
      "Maintenance",
      "Finance & Accounting",
    ];

    const departments = Array.from(
      new Set([
        ...baseDepts,
        ...jobDepts.map((j) => j.department?.trim()).filter(Boolean as any),
        ...questionDepts.map((q) => q.department?.trim()).filter(Boolean as any),
        ...adminDepts.map((a) => a.department?.trim()).filter(Boolean as any),
      ])
    ).sort();

    return NextResponse.json({ success: true, users, departments });
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
    if (!username || !name || !email) {
      return NextResponse.json({ error: "Kolom username, nama, dan email wajib diisi." }, { status: 400 });
    }

    const currentYear = new Date().getFullYear();
    const finalPassword = password && password.trim().length >= 6 ? password.trim() : `Itsp@${currentYear}`;
    const hashedPassword = await hashPassword(finalPassword);

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

// PUT /api/admin/users - Edit User Details (Name, Username, Email, Role, Department, optional Password)
export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Super Admin yang berhak mengubah data akun pengguna." },
        { status: 403 }
      );
    }

    const { id, username, name, email, role, department, newPassword } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "ID pengguna wajib disertakan." }, { status: 400 });
    }

    const targetUser = await prisma.recruitmentAdmin.findUnique({
      where: { id: Number(id) },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Cegah admin mengubah rolenya sendiri jika itu akun aktifnya
    if (targetUser.id === session.adminId && role && role !== "admin") {
      return NextResponse.json(
        { error: "Anda tidak dapat mencabut hak Super Administrator dari akun Anda sendiri yang sedang aktif." },
        { status: 400 }
      );
    }

    const updateData: any = {};
    if (username) updateData.username = username.trim();
    if (name) updateData.name = name.trim();
    if (email) updateData.email = email.trim().toLowerCase();
    if (role) updateData.role = role;
    if (department !== undefined) updateData.department = department.trim();

    if (newPassword && newPassword.trim().length > 0) {
      if (newPassword.trim().length < 6) {
        return NextResponse.json({ error: "Password baru minimal 6 karakter." }, { status: 400 });
      }
      updateData.password = await hashPassword(newPassword.trim());
    }

    const updatedUser = await prisma.recruitmentAdmin.update({
      where: { id: targetUser.id },
      data: updateData,
    });

    // Sinkronisasi update ke central CMS users
    try {
      if (updateData.password) {
        await cmsPrisma.$queryRawUnsafe(
          "UPDATE users SET name = $1, role = $2, password = $3, email = $4, updated_at = NOW() WHERE email = $5",
          updatedUser.name,
          updatedUser.role,
          updateData.password,
          updatedUser.email,
          targetUser.email
        );
      } else {
        await cmsPrisma.$queryRawUnsafe(
          "UPDATE users SET name = $1, role = $2, email = $3, updated_at = NOW() WHERE email = $4",
          updatedUser.name,
          updatedUser.role,
          updatedUser.email,
          targetUser.email
        );
      }
    } catch (cmsErr) {
      console.warn("Sinkronisasi update pengguna ke CMS gagal:", cmsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Data akun ${updatedUser.name} (${updatedUser.username}) berhasil diperbarui!`,
      user: updatedUser,
    });
  } catch (error: any) {
    console.error("Update user error:", error);
    return NextResponse.json({ error: "Gagal memperbarui data pengguna." }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=123 - Hapus User
export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    if (session.role !== "admin") {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Super Admin yang berhak menghapus akun pengguna." },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id) {
      return NextResponse.json({ error: "ID pengguna tidak valid." }, { status: 400 });
    }

    const targetUser = await prisma.recruitmentAdmin.findUnique({
      where: { id },
    });

    if (!targetUser) {
      return NextResponse.json({ error: "Pengguna tidak ditemukan." }, { status: 404 });
    }

    // Cegah admin menghapus dirinya sendiri
    if (targetUser.id === session.adminId) {
      return NextResponse.json(
        { error: "Anda tidak dapat menghapus akun Super Admin Anda sendiri yang sedang aktif digunakan." },
        { status: 400 }
      );
    }

    // Cegah menghapus jika tersisa hanya 1 admin di sistem
    if (targetUser.role === "admin") {
      const adminCount = await prisma.recruitmentAdmin.count({ where: { role: "admin" } });
      if (adminCount <= 1) {
        return NextResponse.json(
          { error: "Tidak dapat menghapus satu-satunya akun Super Admin di sistem." },
          { status: 400 }
        );
      }
    }

    await prisma.recruitmentAdmin.delete({
      where: { id },
    });

    // Sinkronisasi hapus ke central CMS users
    try {
      await cmsPrisma.$queryRawUnsafe(
        "DELETE FROM users WHERE email = $1",
        targetUser.email
      );
    } catch (cmsErr) {
      console.warn("Sinkronisasi hapus pengguna ke CMS gagal:", cmsErr);
    }

    return NextResponse.json({
      success: true,
      message: `Akun ${targetUser.name} (${targetUser.username}) berhasil dihapus dari sistem dan database karyawan.`,
    });
  } catch (error: any) {
    console.error("Delete user error:", error);
    return NextResponse.json({ error: "Gagal menghapus pengguna." }, { status: 500 });
  }
}


