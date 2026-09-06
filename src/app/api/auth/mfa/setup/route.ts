import { NextResponse } from "next/server";
import { getAdminSession, generateTotpSecret } from "@/lib/auth";
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

    // Generate new TOTP secret if not set
    const { secret, uri } = generateTotpSecret(admin.username);

    // Save secret to database
    await prisma.recruitmentAdmin.update({
      where: { id: admin.id },
      data: { mfaSecret: secret },
    });

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
