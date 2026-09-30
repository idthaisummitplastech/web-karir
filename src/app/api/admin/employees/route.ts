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
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }

    const { searchParams } = new URL(req.url);
    const department = searchParams.get("department");
    const contractStatus = searchParams.get("contract_status") || searchParams.get("contractStatus");
    const employeeStatus = searchParams.get("employee_status") || searchParams.get("employeeStatus");
    const search = searchParams.get("search") || "";

    const params = new URLSearchParams();
    if (department) params.set("department", department);
    if (contractStatus) params.set("contract_status", contractStatus);
    if (employeeStatus) params.set("employee_status", employeeStatus);
    if (search) params.set("search", search);

    const data = await fetchFromBackend<{
      success: boolean;
      total: number;
      employees: any[];
    }>(`/recruitment/employees?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.adminId}`,
      },
    });

    return NextResponse.json({
      success: true,
      total: data?.total || 0,
      employees: data?.employees || [],
    }, {
      headers: ANTI_CACHE_HEADERS,
    });
  } catch (error: any) {
    console.error("Fetch employees error:", error);
    return NextResponse.json({ error: error.message || "Gagal memuat data karyawan." }, {
      status: 500,
      headers: ANTI_CACHE_HEADERS,
    });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }

    const body = await req.json();
    const result = await fetchFromBackend<any>("/recruitment/hire-contract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.adminId}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Hire contract error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses penandatanganan kontrak karyawan." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}
