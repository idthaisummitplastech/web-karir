import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { buildBackendUrl } from "@/lib/api-client";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const backendUrl = buildBackendUrl(`/recruitment/employees/export?${searchParams.toString()}`);

    const res = await fetch(backendUrl, {
      headers: {
        Authorization: `Bearer ${session.adminId}`,
        'X-Internal-Secret': process.env.BACKEND_INTERNAL_SECRET || '',
      },
      cache: 'no-store',
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return NextResponse.json({ error: err.detail || err.message || "Failed to export employees." }, { status: res.status });
    }

    const arrayBuffer = await res.arrayBuffer();
    const curDate = new Date().toISOString().split('T')[0];
    const filename = `DATA_MASTER_KARYAWAN_PT_ITSP_${curDate}.xlsx`;

    return new NextResponse(Buffer.from(arrayBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    });
  } catch (error: any) {
    console.error("Export employees proxy error:", error);
    return NextResponse.json({ error: error.message || "Export error." }, { status: 500 });
  }
}
