import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== "admin" && session.role !== "hr")) {
      return NextResponse.json(
        { error: "Akses Ditolak: Hanya Admin atau HR yang berhak menjalankan pembersihan database." },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const data = await fetchFromBackend<{
      success: boolean;
      message: string;
      autoExpiredCount?: number;
      auto_expired_count?: number;
      hardDeletedCount?: number;
      hard_deleted_count?: number;
      purgedCvCount?: number;
      purged_cv_count?: number;
    }>("/api/v1/recruitment/cleanup-applicants", {
      method: "POST",
      body: JSON.stringify({ mode: body?.mode || "soft_cleanup" }),
    });

    return NextResponse.json({
      success: true,
      message: data.message,
      autoExpiredCount: data.autoExpiredCount ?? data.auto_expired_count ?? 0,
      hardDeletedCount: data.hardDeletedCount ?? data.hard_deleted_count,
      purgedCvCount: data.purgedCvCount ?? data.purged_cv_count,
    });
  } catch (error: any) {
    console.error("Cleanup error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan saat memproses pembersihan database: " + (error?.message || "") },
      { status: error?.status || 500 }
    );
  }
}
