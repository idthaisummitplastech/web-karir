import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { comparePassword, signAdminToken, verifyTotpCode, generateTotpSecret } from "@/lib/auth";
import { findCmsUserByEmail, cmsPrisma } from "@/lib/cmsDb";
import { cookies } from "next/headers";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    const { username, password, mfaCode } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username/Email dan password wajib diisi." },
        { status: 400 }
      );
    }

    const cleanInput = username.trim();

    // 1. Cek terlebih dahulu di Database Utama Perusahaan (web_perusahaan.users)
    // Ini mengimplementasikan arsitektur Single Database Karyawan (Shared DB)
    const cmsUser = await findCmsUserByEmail(cleanInput);

    if (cmsUser) {
      // Validasi password terhadap hash di web_perusahaan.users
      const isMatch = await comparePassword(password, cmsUser.password);
      if (!isMatch) {
        return NextResponse.json(
          { error: "Password salah. Silakan coba kembali." },
          { status: 401 }
        );
      }

      // Validasi Hak Akses (Role-Based Access Control)
      if (cmsUser.role === "marketing") {
        return NextResponse.json(
          {
            error:
              "Akses Ditolak: Akun Anda terdaftar sebagai Tim Marketing (CMS Portal Perusahaan) dan tidak memiliki hak akses ke Portal Karir & Rekrutmen ATS.",
          },
          { status: 403 }
        );
      }

      // Pastikan role diizinkan di Portal Karir ATS
      const allowedRoles = ["admin", "hr", "user_dept"];
      if (!allowedRoles.includes(cmsUser.role)) {
        return NextResponse.json(
          {
            error: `Akses Ditolak: Role '${cmsUser.role}' belum diberikan izin untuk mengakses Portal Rekrutmen.`,
          },
          { status: 403 }
        );
      }

      // =========================================================================
      // KEAMANAN MFA WAJIB (MANDATORY ON LOGIN):
      // Jika MFA belum aktif, user WAJIB scan barcode & input 6 digit saat login!
      // =========================================================================
      if (!cmsUser.mfa_enabled || !cmsUser.mfa_secret) {
        let secretToUse = cmsUser.mfa_secret;

        if (!secretToUse) {
          const totpData = generateTotpSecret(cmsUser.email);
          secretToUse = totpData.secret;

          // Simpan secret sementara ke DB central agar siap diverifikasi
          try {
            await cmsPrisma.$queryRawUnsafe(
              "UPDATE users SET mfa_secret = $1, updated_at = NOW() WHERE email = $2",
              secretToUse,
              cmsUser.email
            );
          } catch (e) {
            console.warn("Save pending MFA secret to CMS users failed:", e);
          }
        }

        // Jika user belum mengirimkan 6-digit mfaCode, sajikan barcode QR Code sekarang juga!
        if (!mfaCode) {
          const totpUri = `otpauth://totp/PT%20ITSP%20ATS:${encodeURIComponent(cmsUser.email)}?secret=${secretToUse}&issuer=PT%20ITSP%20ATS&algorithm=SHA1&digits=6&period=30`;
          const qrCodeDataUrl = await QRCode.toDataURL(totpUri);

          return NextResponse.json({
            requireMfaSetup: true,
            qrCodeDataUrl,
            secret: secretToUse,
            email: cmsUser.email,
            name: cmsUser.name,
            message: "Akun Anda diwajibkan mengaktifkan Google Authenticator. Silakan scan barcode di bawah ini menggunakan aplikasi Authenticator pada smartphone Anda untuk melanjutkan login.",
          });
        }

        // Jika user sudah mengirimkan 6-digit mfaCode, verifikasi kode tersebut!
        const isValidCode = verifyTotpCode(secretToUse, mfaCode);
        if (!isValidCode) {
          return NextResponse.json(
            { error: "Kode verifikasi 6-digit tidak valid atau sudah kedaluwarsa. Pastikan jam di HP Anda akurat dan masukkan kode yang sedang aktif." },
            { status: 401 }
          );
        }

        // Kode valid! Aktifkan status MFA sekarang secara permanen di database pusat
        try {
          await cmsPrisma.$queryRawUnsafe(
            "UPDATE users SET mfa_enabled = true, mfa_secret = $1, updated_at = NOW() WHERE email = $2",
            secretToUse,
            cmsUser.email
          );
        } catch (e) {
          console.warn("Activate MFA in CMS users failed:", e);
        }

        cmsUser.mfa_enabled = true;
        cmsUser.mfa_secret = secretToUse;
      } else {
        // Akun SUDAH aktif MFA -> minta 6-digit OTP reguler
        if (!mfaCode) {
          return NextResponse.json({
            requireMfa: true,
            message: "Akun Anda dilindungi MFA. Masukkan 6-digit kode dari aplikasi Authenticator Anda.",
          });
        }

        let isValidCode = verifyTotpCode(cmsUser.mfa_secret, mfaCode);

        // Fallback 1: Cek terhadap secret di database recruitment_admins jika ada perbedaan secret antar database
        if (!isValidCode) {
          const atsAdminCheck = await prisma.recruitmentAdmin.findFirst({
            where: { email: cmsUser.email },
          });
          if (atsAdminCheck?.mfaSecret && verifyTotpCode(atsAdminCheck.mfaSecret, mfaCode)) {
            isValidCode = true;
            // Sinkronisasi secret ke cmsUser agar konsisten
            await cmsPrisma.$queryRawUnsafe(
              "UPDATE users SET mfa_secret = $1, mfa_enabled = true WHERE email = $2",
              atsAdminCheck.mfaSecret,
              cmsUser.email
            ).catch(() => {});
          }
        }

        // Fallback 2: Cek terhadap Backup Codes pengguna jika user memasukkan kode cadangan
        if (!isValidCode && cmsUser.backup_codes) {
          try {
            const cleanInputCode = mfaCode.trim().toUpperCase().replace(/\s+/g, '');
            const parsedCodes: string[] = JSON.parse(cmsUser.backup_codes);
            const foundIdx = parsedCodes.findIndex(
              (c) => c.replace(/-/g, '').toUpperCase() === cleanInputCode.replace(/-/g, '')
            );
            if (foundIdx !== -1) {
              isValidCode = true;
              // Gunakan kode cadangan (one-time use) dan hapus dari daftar
              parsedCodes.splice(foundIdx, 1);
              await cmsPrisma.$queryRawUnsafe(
                "UPDATE users SET backup_codes = $1 WHERE email = $2",
                JSON.stringify(parsedCodes),
                cmsUser.email
              ).catch(() => {});
            }
          } catch {}
        }

        if (!isValidCode) {
          return NextResponse.json(
            { error: "Kode MFA Authenticator 6-digit tidak valid atau sudah kedaluwarsa. Pastikan jam di HP Anda akurat (atau gunakan salah satu Kode Cadangan / Backup Code)." },
            { status: 401 }
          );
        }
      }

      // Tentukan Departemen Default berdasarkan Role
      let deptName = "General Management";
      if (cmsUser.role === "hr") deptName = "Human Capital";
      else if (cmsUser.role === "user_dept") deptName = "Engineering";
      else if (cmsUser.role === "admin") deptName = "IT & Systems";

      // Sinkronisasi record ke recruitment_admins di DB web_karir untuk relasi internal
      let atsAdmin = await prisma.recruitmentAdmin.findFirst({
        where: {
          OR: [
            { email: cmsUser.email },
            { username: cmsUser.email.split("@")[0] },
          ],
        },
      });

      if (atsAdmin) {
        atsAdmin = await prisma.recruitmentAdmin.update({
          where: { id: atsAdmin.id },
          data: {
            email: cmsUser.email,
            name: cmsUser.name,
            role: cmsUser.role as "admin" | "hr" | "user_dept",
            department: deptName,
            isMfaEnabled: true,
            mfaSecret: cmsUser.mfa_secret,
          },
        });
      } else {
        atsAdmin = await prisma.recruitmentAdmin.create({
          data: {
            username: cmsUser.email.split("@")[0],
            email: cmsUser.email,
            password: cmsUser.password,
            name: cmsUser.name,
            role: cmsUser.role as "admin" | "hr" | "user_dept",
            department: deptName,
            isMfaEnabled: true,
            mfaSecret: cmsUser.mfa_secret,
          },
        });
      }

      // Buat Admin JWT Token
      const token = await signAdminToken({
        adminId: atsAdmin.id,
        username: atsAdmin.username,
        name: atsAdmin.name,
        email: atsAdmin.email,
        role: atsAdmin.role as "hr" | "user_dept" | "admin",
        department: atsAdmin.department,
        isMfaVerified: true,
      });

      const cookieStore = await cookies();
      cookieStore.set("admin_session", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24, // 24 hours
        path: "/",
      });

      return NextResponse.json({
        success: true,
        source: "central_cms_users",
        admin: {
          id: atsAdmin.id,
          username: atsAdmin.username,
          name: atsAdmin.name,
          role: atsAdmin.role,
          department: atsAdmin.department,
          isMfaEnabled: true,
        },
      });
    }

    // 2. Fallback: Cek di tabel lokal recruitment_admins (misal username singkat: 'hr.recruitment', 'user.engineering', 'admin')
    const admin = await prisma.recruitmentAdmin.findFirst({
      where: {
        OR: [
          { username: cleanInput },
          { email: cleanInput.toLowerCase() },
        ],
      },
    });

    if (!admin) {
      return NextResponse.json(
        { error: "Kredensial login tidak ditemukan. Pastikan Anda menggunakan email karyawan terdaftar." },
        { status: 401 }
      );
    }

    const isMatch = await comparePassword(password, admin.password);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Password salah. Silakan coba kembali." },
        { status: 401 }
      );
    }

    // WAJIB MFA SETUP ON LOGIN (FALLBACK LOCAL ADMIN)
    if (!admin.isMfaEnabled || !admin.mfaSecret) {
      let secretToUse = admin.mfaSecret;
      if (!secretToUse) {
        const totpData = generateTotpSecret(admin.username);
        secretToUse = totpData.secret;
        await prisma.recruitmentAdmin.update({
          where: { id: admin.id },
          data: { mfaSecret: secretToUse },
        });
      }

      if (!mfaCode) {
        const totpUri = `otpauth://totp/PT%20ITSP%20ATS:${encodeURIComponent(admin.username)}?secret=${secretToUse}&issuer=PT%20ITSP%20ATS&algorithm=SHA1&digits=6&period=30`;
        const qrCodeDataUrl = await QRCode.toDataURL(totpUri);

        return NextResponse.json({
          requireMfaSetup: true,
          qrCodeDataUrl,
          secret: secretToUse,
          username: admin.username,
          message: "Akun Anda diwajibkan mengaktifkan Google Authenticator. Silakan scan barcode di bawah ini menggunakan aplikasi Authenticator pada smartphone Anda untuk melanjutkan login.",
        });
      }

      const isValidCode = verifyTotpCode(secretToUse, mfaCode);
      if (!isValidCode) {
        return NextResponse.json(
          { error: "Kode MFA Authenticator 6-digit tidak valid atau sudah kedaluwarsa. Pastikan jam di HP Anda sinkron." },
          { status: 401 }
        );
      }

      await prisma.recruitmentAdmin.update({
        where: { id: admin.id },
        data: { isMfaEnabled: true, mfaSecret: secretToUse },
      });
      admin.isMfaEnabled = true;
      admin.mfaSecret = secretToUse;
    } else {
      // Regular MFA check if already enabled
      if (!mfaCode) {
        return NextResponse.json({
          requireMfa: true,
          message: "Akun dilindungi MFA. Masukkan 6-digit kode Authenticator Anda.",
        });
      }

      const isValidCode = verifyTotpCode(admin.mfaSecret, mfaCode);
      if (!isValidCode) {
        return NextResponse.json(
          { error: "Kode MFA Authenticator 6-digit tidak valid atau sudah kedaluwarsa." },
          { status: 401 }
        );
      }
    }

    // Sign Admin JWT
    const token = await signAdminToken({
      adminId: admin.id,
      username: admin.username,
      name: admin.name,
      email: admin.email,
      role: admin.role as "hr" | "user_dept" | "admin",
      department: admin.department,
      isMfaVerified: true,
    });

    const cookieStore = await cookies();
    cookieStore.set("admin_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24, // 24 hours
      path: "/",
    });

    return NextResponse.json({
      success: true,
      source: "local_recruitment_admins",
      admin: {
        id: admin.id,
        username: admin.username,
        name: admin.name,
        role: admin.role,
        department: admin.department,
        isMfaEnabled: true,
      },
    });
  } catch (error: any) {
    console.error("Admin login error:", error);
    return NextResponse.json({ error: "Terjadi kesalahan internal server." }, { status: 500 });
  }
}
