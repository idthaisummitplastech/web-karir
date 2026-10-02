import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const data = await fetchFromBackend("/recruitment/departments");
    return NextResponse.json({
      success: true,
      departments: data.departments || [],
    });
  } catch (error: any) {
    console.error("Fetch departments error:", error);
    // Fallback default departments from data_karyawan
    return NextResponse.json({
      success: true,
      departments: [
        'Accounting & Finance',
        'Assembly',
        'HQ Office',
        'HR & GA',
        'Injection',
        'Interseat',
        'Local Manager',
        'Maintenance',
        'Marketing',
        'Painting',
        'Planning',
        'Production',
        'Production Engineering',
        'Purchasing',
        'Quality Assurance',
        'Rack',
        'SYD & IT',
        'Store',
        'Thai Manager',
        'Warehouse & Delivery',
      ],
    });
  }
}
