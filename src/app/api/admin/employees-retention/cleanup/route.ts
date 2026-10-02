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

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }
    if (session.role !== "admin" && session.role !== "hr") {
      return NextResponse.json({ error: "Akses ditolak." }, { status: 403, headers: ANTI_CACHE_HEADERS });
    }

    const result = await fetchFromBackend<any>(`/recruitment/employees-retention/cleanup`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.adminId}`,
      },
      body: JSON.stringify({}),
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Cleanup retention error:", error);
    return NextResponse.json({ error: error.message || "Gagal membersihkan data retensi." }, { status: 400, headers: ANTI_CACHE_HEADERS });
  }
}
