import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ANTI_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized. Silakan login sebagai HR/User." },
        { status: 401, headers: ANTI_CACHE_HEADERS }
      );
    }

    const { searchParams } = new URL(req.url);
    const stage = searchParams.get("stage");
    const status = searchParams.get("status");
    const search = searchParams.get("search") || "";

    const params = new URLSearchParams();
    if (stage) params.set("stage", stage);
    if (status) params.set("status_filter", status);
    if (search) params.set("search", search);

    const applicants = await fetchFromBackend(`/applicants?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.adminId}`,
      },
    });

    return NextResponse.json({
      success: true,
      total: Array.isArray(applicants) ? applicants.length : 0,
      applicants: applicants || [],
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error("Fetch applicants error:", error);
    return NextResponse.json({ error: "Gagal memuat daftar pelamar." }, { 
      status: 500,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  }
}
