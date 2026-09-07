import { NextResponse } from "next/server";
import { getAdminSession, generateTotpSecret } from "@/lib/auth";
import * as OTPAuth from "otpauth";
import { prisma } from "@/lib/prisma";
import QRCode from "qrcode";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const admin = await prisma.recruitmentAdmin.findUnique({
      where: { id: session.adminId },
    });

    if (!admin) {
      return NextResponse.json({ error: "Admin tidak ditemukan." }, { status: 404 });
    }

    // Reuse existing secret agar QR stabil — JANGAN generate baru setiap GET.
    // Bug lama: secret selalu diganti tiap buka halaman, sehingga QR yang
    // sudah di-scan HP jadi tidak cocok lagi dengan secret di database
    // (inilah penyebab kode selalu "kedaluwarsa" walau jam sudah benar).
    let secret = admin.mfaSecret;
    let uri: string;
    if (secret) {
      const totp = new OTPAuth.TOTP({
        issuer: "PT ITSP ATS",
        label: admin.username,
        algorithm: "SHA1",
        digits: 6,
        period: 30,
        secret: OTPAuth.Secret.fromBase32(secret.trim().replace(/\s+/g, '').toUpperCase()),
      });
      uri = totp.toString();
    } else {
      const generated = generateTotpSecret(admin.username);
      secret = generated.secret;
      uri = generated.uri;

      // Save secret to database
      await prisma.recruitmentAdmin.update({
        where: { id: admin.id },
        data: { mfaSecret: secret },
      });
    }

    // Generate QR Code Data URL
    const qrCodeDataUrl = await QRCode.toDataURL(uri);

    return NextResponse.json({
      success: true,
      secret,
      qrCodeDataUrl,
      isMfaEnabled: admin.isMfaEnabled,
    });
  } catch (error: any) {
    console.error("MFA setup error:", error);
    return NextResponse.json({ error: "Gagal menyiapkan MFA." }, { status: 500 });
  }
}
