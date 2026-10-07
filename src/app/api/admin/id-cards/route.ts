import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend, fetchRawFromBackend } from "@/lib/api-client";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const list: any[] = [];

    // 1. Fetch from official data_karyawan (/recruitment/employees)
    try {
      const empData = await fetchFromBackend("/recruitment/employees");
      if (empData && empData.employees && Array.isArray(empData.employees)) {
        empData.employees.forEach((e: any) => {
          list.push({
            id: e.id,
            employeeId: e.employee_id || `ITSP.${String(e.id).padStart(4, '0')}`,
            namaLengkap: e.full_name,
            jabatan: e.job_title,
            departemen: e.department,
            workLocation: e.work_location || 'Plant 1 KIIC Karawang',
            photoProfile: e.photo_file || null,
            joinDate: e.contract_start_date,
            contractEndDate: e.contract_end_date,
            contractStatus: e.contract_status,
            idCardPrinted: false, // Default unprinted
            source: 'data_karyawan',
          });
        });
      }
    } catch (err) {
      console.warn("Could not fetch from /recruitment/employees:", err);
    }

    // 2. Fetch from legacy karyawan_sementara if any
    try {
      const legacyData = await fetchFromBackend("/recruitment/karyawan-sementara");
      if (Array.isArray(legacyData)) {
        legacyData.forEach((k: any) => {
          // Prevent duplicates if already present
          const exists = list.some(
            (item) => item.namaLengkap?.toLowerCase() === k.namaLengkap?.toLowerCase()
          );
          if (!exists) {
            list.push({
              id: k.id,
              employeeId: k.nikSementara || `ITSP.${String(k.id).padStart(4, '0')}`,
              namaLengkap: k.namaLengkap,
              jabatan: k.jabatan,
              departemen: k.departemen,
              workLocation: k.lokasiPabrik || 'Plant 1 KIIC Karawang',
              photoProfile: k.photo_url || k.photoUrl || null,
              joinDate: k.tanggalBergabung,
              contractEndDate: null,
              contractStatus: 'PKWT',
              idCardPrinted: Boolean(k.idCardPrinted),
              source: 'karyawan_sementara',
            });
          }
        });
      }
    } catch (err) {
      console.warn("Could not fetch from /recruitment/karyawan-sementara:", err);
    }

    return NextResponse.json({ success: true, employees: list });
  } catch (error: any) {
    console.error("Fetch id-cards error:", error);
    return NextResponse.json({ error: "Failed to load employee data for ID Card." }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    const body = await req.json();
    const { id, source } = body;
    if (!id) return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });

    if (source === 'karyawan_sementara') {
      const result = await fetchRawFromBackend(`/recruitment/karyawan-sementara/${id}/toggle-id-card`, {
        method: "PUT",
      });
      return NextResponse.json({ success: true, message: result.message || "Status ID Card diperbarui." });
    }

    return NextResponse.json({ success: true, message: "Status ID Card diperbarui." });
  } catch (error: any) {
    console.error("Toggle ID card error:", error);
    return NextResponse.json({ error: error.message || "Failed to update ID Card status." }, { status: 400 });
  }
}
