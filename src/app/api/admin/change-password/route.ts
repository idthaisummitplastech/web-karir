import { NextResponse } from "next/server";
import { getAdminSession, signAdminToken, getAdminCookieOptions } from "@/lib/auth";
import { fetchFromBackend, fetchAdminRawBackend } from "@/lib/api-client";
import { cookies } from "next/headers";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const body = await req.json();
    const currentPassword = String(body.currentPassword || body.current_password || body.oldPassword || "").trim();
    const newPassword = String(body.newPassword || body.new_password || "").trim();

    if (!newPassword || newPassword.length < 12) {
      return NextResponse.json(
        { error: "Kata sandi baru minimal 12 karakter." },
        { status: 400 }
      );
    }

    let backendSuccess = false;

    // 1. Coba ubah password via endpoint profil CMS dengan verifikasi password lama
    try {
      await fetchFromBackend("/cms/profile", {
        method: "PUT",
        headers: {
          "X-CMS-User-Id": String(session.adminId),
        },
        body: JSON.stringify({
          action: "change_password",
          user_id: session.adminId,
          current_password: currentPassword,
          new_password: newPassword,
        }),
      });
      backendSuccess = true;
    } catch (cmsErr: any) {
      // Jika gagal verifikasi kata sandi lama, jangan fallback sembarangan
      if (cmsErr.message && (cmsErr.message.includes("tidak sesuai") || cmsErr.message.includes("Kata sandi"))) {
        return NextResponse.json({ error: cmsErr.message }, { status: 400 });
      }

      // 2. Fallback untuk akun lokal recruitment_admins yang tidak ada di tabel users CMS
      try {
        await fetchAdminRawBackend(session, "/recruitment/reset-password", {
          method: "POST",
          body: JSON.stringify({
            target_type: "admin",
            target_id: session.adminId,
            new_password: newPassword,
          }),
        });
        backendSuccess = true;
      } catch (recErr: any) {
        return NextResponse.json(
          { error: recErr.message || "Gagal memperbarui kata sandi di backend." },
          { status: 400 }
        );
      }
    }

    if (backendSuccess) {
      // Terbitkan ulang cookie sesi admin dengan mustChangePassword = false
      const updatedToken = await signAdminToken({
        ...session,
        mustChangePassword: false,
      });

      const cookieStore = await cookies();
      cookieStore.set("admin_session", updatedToken, getAdminCookieOptions());

      return NextResponse.json({
        success: true,
        message: "Kata sandi berhasil diperbarui.",
        mustChangePassword: false,
        mfaRequired: session.mfaRequired ?? false,
      });
    }

    return NextResponse.json({ error: "Gagal memperbarui kata sandi." }, { status: 500 });
  } catch (error: any) {
    return NextResponse.json(
      { error: error?.message || "Terjadi kesalahan pada server." },
      { status: 500 }
    );
  }
}
