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

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }
    if (session.role !== "admin" && session.role !== "hr") {
      return NextResponse.json({ error: "Akses ditolak. Hanya Administrator atau HR yang berhak menandai karyawan keluar." }, { status: 403, headers: ANTI_CACHE_HEADERS });
    }

    const { id } = await params;
    const body = await req.json();

    const result = await fetchFromBackend<any>(`/recruitment/employees/${id}/terminate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.adminId}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Terminate employee error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to mark employee as exited." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}
