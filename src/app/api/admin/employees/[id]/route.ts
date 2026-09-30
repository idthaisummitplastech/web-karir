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

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }

    const { id } = await params;
    const data = await fetchFromBackend<any>(`/recruitment/employees/${id}`, {
      headers: {
        Authorization: `Bearer ${session.adminId}`,
      },
    });

    return NextResponse.json(data, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Fetch employee detail error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memuat rincian data karyawan." },
      { status: 404, headers: ANTI_CACHE_HEADERS }
    );
  }
}

export async function PUT(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }

    const { id } = await params;
    const body = await req.json();

    const result = await fetchFromBackend<any>(`/recruitment/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.adminId}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Update employee error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memperbarui data karyawan." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session || session.role !== "admin") {
      return NextResponse.json({ error: "Hanya Super Administrator yang berhak menghapus data karyawan." }, { status: 403, headers: ANTI_CACHE_HEADERS });
    }

    const { id } = await params;
    const result = await fetchFromBackend<any>(`/recruitment/employees/${id}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.adminId}`,
      },
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Delete employee error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus data karyawan." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}
