import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchAdminBackend } from "@/lib/api-client";

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
    const data = await fetchAdminBackend<any>(session, `/recruitment/employees/${id}`);

    return NextResponse.json(data, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Fetch employee detail error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load employee details." },
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

    const result = await fetchAdminBackend<any>(session, `/recruitment/employees/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Update employee error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to update employee data." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== "admin" && session.role !== "hr")) {
      return NextResponse.json({ error: "Akses ditolak. Hanya Administrator atau HR yang berhak menghapus data karyawan." }, { status: 403, headers: ANTI_CACHE_HEADERS });
    }

    const { id } = await params;
    const result = await fetchAdminBackend<any>(session, `/recruitment/employees/${id}`, {
      method: "DELETE",
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Delete employee error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete employee data." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}
