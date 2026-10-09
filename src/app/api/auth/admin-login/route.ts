import { NextResponse } from "next/server";
import { signAdminToken } from "@/lib/auth";
import { fetchRawFromBackend } from "@/lib/api-client";
import { cookies } from "next/headers";
import QRCode from "qrcode";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    // Employee ID primary (DataKaryawan.employee_id e.g. ITSP.004.02.16), email/username fallback 6 months
    const raw: string = String(body.employee_id || body.employee_id_or_email || body.login || body.username || body.email || "").trim();
    const password: string = String(body.password || "");
    const mfaCode: string = String(body.mfaCode || body.mfa_code || "");

    if (!raw || !password) {
      return NextResponse.json(
        { error: "Employee ID / Email and password are required." },
        { status: 400 }
      );
    }

    let result: any;
    try {
      result = await fetchRawFromBackend("/auth/ats-login", {
        method: "POST",
        body: JSON.stringify({
          employee_id: raw,
          employee_id_or_email: raw,
          login: raw,
          username: raw,
          email: raw,
          password,
          mfa_code: mfaCode || "",
        }),
      });
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Login failed." },
        { status: 401 }
      );
    }

    if (result.requireMfaSetup || result.require_mfa_setup) {
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

    const admin = result.admin;
    if (!admin) {
      return NextResponse.json({ error: "Data admin tidak valid." }, { status: 500 });
    }

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
      maxAge: 60 * 60 * 24,
      path: "/",
    });

    return NextResponse.json({
      success: true,
      source: result.source,
      admin: {
        id: admin.id,
        username: admin.username,
        employee_id: admin.employee_id || admin.employeeId || null,
        employeeId: admin.employee_id || admin.employeeId || null,
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
