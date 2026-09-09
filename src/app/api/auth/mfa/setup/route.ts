import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";
import QRCode from "qrcode";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const data = await fetchFromBackend<{
      success: boolean;
      secret: string;
      totp_uri: string;
      is_mfa_enabled: boolean;
    }>(`/api/v1/auth/ats-mfa/${session.adminId}/setup`);

    const qrCodeDataUrl = await QRCode.toDataURL(data.totp_uri);

    return NextResponse.json({
      success: true,
      secret: data.secret,
      qrCodeDataUrl,
      isMfaEnabled: data.is_mfa_enabled,
    });
  } catch (error: any) {
    console.error("MFA setup error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal menyiapkan MFA." },
      { status: error?.status || 500 }
    );
  }
}
