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
    const contractEval = searchParams.get("contract_eval") || searchParams.get("contractEval");
    const search = searchParams.get("search") || "";
    const sort = searchParams.get("sort") || "desc";

    const params = new URLSearchParams();
    if (department) params.set("department", department);
    if (contractStatus) params.set("contract_status", contractStatus);
    if (employeeStatus) params.set("employee_status", employeeStatus);
    if (contractEval) params.set("contract_eval", contractEval);
    if (search) params.set("search", search);
    if (sort) params.set("sort", sort);

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

    // If applicant_id is present, it's signing contract from applicants flow
    const endpoint = body.applicant_id ? "/recruitment/hire-contract" : "/recruitment/employees";

    const result = await fetchFromBackend<any>(endpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.adminId}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Employee create/hire error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal memproses penambahan data karyawan." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session || (session.role !== "admin" && session.role !== "hr")) {
      return NextResponse.json({ error: "Akses ditolak. Hanya Administrator atau HR yang berhak mereset data karyawan." }, { status: 403, headers: ANTI_CACHE_HEADERS });
    }

    const result = await fetchFromBackend<any>("/recruitment/employees/all", {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${session.adminId}`,
      },
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Delete all employees error:", error);
    return NextResponse.json(
      { error: error.message || "Gagal menghapus seluruh data karyawan." },
      { status: 500, headers: ANTI_CACHE_HEADERS }
    );
  }
}
