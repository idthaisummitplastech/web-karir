import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/auth";
import { fetchRawFromBackend } from "@/lib/api-client";
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

    let result: any;
    try {
      result = await fetchRawFromBackend("/auth/ats-login", {
        method: "POST",
        body: JSON.stringify({
          username: username.trim(),
          password,
          mfa_code: mfaCode || "",
        }),
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Login gagal." },
        { status: 401 }
      );
    }

    // Backend returns requireMfaSetup or requireMfa if MFA step needed
    if (result.requireMfaSetup || result.require_mfa_setup) {
      // Generate QR code from totp_uri
      const totpUri = result.totpUri || result.totp_uri;
      let qrCodeDataUrl = "";
      if (totpUri) {
        qrCodeDataUrl = await QRCode.toDataURL(totpUri);
      }

      return NextResponse.json({
        requireMfaSetup: true,
        qrCodeDataUrl,
        secret: result.secret,
        email: result.email,
        username: result.username,
        name: result.name,
        message: result.message || "Akun Anda diwajibkan mengaktifkan Google Authenticator.",
      });
    }

    if (result.requireMfa || result.require_mfa) {
      return NextResponse.json({
        requireMfa: true,
        message: result.message || "Akun dilindungi MFA. Masukkan 6-digit kode Authenticator.",
      });
    }

    // Successful login
    const admin = result.admin;
    if (!admin) {
      return NextResponse.json({ error: "Data admin tidak valid." }, { status: 500 });
    }

    // Sign local JWT for Next.js cookie session
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
      source: result.source,
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
