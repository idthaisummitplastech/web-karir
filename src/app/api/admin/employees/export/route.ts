import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { buildBackendUrl, fetchFromBackend } from "@/lib/api-client";
import * as XLSX from "xlsx";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const curDate = new Date().toISOString().split('T')[0];
    const filename = `DATA_MASTER_KARYAWAN_PT_ITSP_${curDate}.xlsx`;

    // 1. Attempt to fetch primary generated .xlsx directly from FastAPI backend
    try {
      const backendUrl = buildBackendUrl(`/recruitment/employees/export?${searchParams.toString()}`);
      const res = await fetch(backendUrl, {
        headers: {
          'X-Internal-Secret': process.env.BACKEND_INTERNAL_SECRET || '',
          'X-Admin-Id': String(session.adminId || 1),
          'X-Admin-Role': session.role || 'admin',
          'X-Admin-Department': session.department || '',
        },
        cache: 'no-store',
      });

      if (res.ok) {
        const arrayBuffer = await res.arrayBuffer();
        if (arrayBuffer && arrayBuffer.byteLength > 100) {
          return new NextResponse(Buffer.from(arrayBuffer), {
            status: 200,
            headers: {
              'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              'Content-Disposition': `attachment; filename="${filename}"`,
              'Cache-Control': 'no-store, no-cache, must-revalidate',
            },
          });
        }
      }
    } catch (backendErr) {
      console.warn("Backend Excel export direct fetch failed, engaging Node SheetJS generator:", backendErr);
    }

    // 2. High-reliability fallback: Fetch data via enterprise API client and build real .xlsx with SheetJS
    const data = await fetchFromBackend<{
      total: number;
      employees: any[];
    }>(`/recruitment/employees?${searchParams.toString()}`, {
      headers: {
        'X-Internal-Secret': process.env.BACKEND_INTERNAL_SECRET || '',
        'X-Admin-Id': String(session.adminId || 1),
        'X-Admin-Role': session.role || 'admin',
      },
    });

    const employees = data?.employees || [];

    const headers = [
      "No",
      "ID Karyawan",
      "Payroll ID",
      "Nama Lengkap",
      "NIK KTP",
      "Jenis Kelamin",
      "Tempat Lahir",
      "Tanggal Lahir",
      "Usia",
      "Agama",
      "Status Pernikahan",
      "Status PTKP",
      "No. HP / WA",
      "Email",
      "Alamat KTP Lengkap",
      "RT KTP",
      "RW KTP",
      "Kelurahan KTP",
      "Kecamatan KTP",
      "Kota / Kab KTP",
      "Provinsi KTP",
      "Alamat Domisili",
      "Pendidikan Terakhir",
      "Nama Sekolah / Kampus",
      "Jurusan",
      "Departemen",
      "Section",
      "Jabatan / Posisi",
      "Level",
      "Plant",
      "Tipe Karyawan",
      "Status Kontrak",
      "Tgl Mulai Kontrak",
      "Tgl Selesai Kontrak",
      "Gaji Disepakati",
      "No. NPWP",
      "No. BPJS Ketenagakerjaan",
      "Status Kepegawaian",
      "Tgl Keluar",
      "Alasan Keluar",
      "Catatan HR",
    ];

    const rows = employees.map((emp, idx) => {
      const bdate = emp.birth_date ? String(emp.birth_date).slice(0, 10) : "";
      const sdate = emp.join_date || (emp.contract_start_date ? String(emp.contract_start_date).slice(0, 10) : "");
      const edate = emp.contract_end_date
        ? String(emp.contract_end_date).slice(0, 10)
        : (String(emp.contract_status || "").toUpperCase().includes("PKWTT") ? "TETAP" : "");
      const xdate = emp.exit_date ? String(emp.exit_date).slice(0, 10) : "";

      return [
        idx + 1,
        emp.employee_id || "",
        emp.payroll_id || "",
        emp.full_name || "",
        emp.national_id || emp.nik || "",
        emp.gender || "",
        emp.birth_place || "",
        bdate,
        emp.age ?? "",
        emp.religion || "",
        emp.marital_status || emp.marriage_status || "",
        emp.ptkp_status || "",
        emp.phone || "",
        emp.email || "",
        emp.ktp_street_address || emp.address_ktp || emp.street_ktp || "",
        emp.rt_ktp || "",
        emp.rw_ktp || "",
        emp.village_ktp || emp.ktp_kelurahan || "",
        emp.district_ktp || emp.ktp_kecamatan || "",
        emp.city_ktp || emp.ktp_city || "",
        emp.province_ktp || emp.ktp_province || "",
        emp.domicile_street_address || emp.address_domicile || emp.street_domicile || "",
        emp.education_level || emp.last_education || "",
        emp.institution_name || emp.school_name || "",
        emp.major || "",
        emp.department || "",
        emp.section || "",
        emp.job_title || "",
        emp.level || "",
        emp.plant || "",
        emp.employee_type || "",
        emp.contract_status || "",
        sdate,
        edate,
        emp.agreed_salary || emp.salary || "",
        emp.npwp || emp.npwp_number || "",
        emp.bpjs_tk_no || emp.bpjs_tk_number || "",
        emp.employee_status === "active" ? "Aktif" : "Resign / Nonaktif",
        xdate,
        emp.exit_reason || "",
        emp.notes || "",
      ];
    });

    const worksheetData = [headers, ...rows];
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(worksheetData);

    // Set auto column widths
    const colWidths = headers.map((h, colIdx) => {
      let maxLen = h.length;
      for (let r = 0; r < rows.length; r++) {
        const cellVal = String(rows[r][colIdx] || "");
        if (cellVal.length > maxLen) maxLen = cellVal.length;
      }
      return { wch: Math.min(Math.max(maxLen + 3, 12), 40) };
    });
    ws['!cols'] = colWidths;

    XLSX.utils.book_append_sheet(wb, ws, "Master Karyawan");
    const excelBuffer = XLSX.write(wb, { bookType: "xlsx", type: "buffer" });

    return new NextResponse(excelBuffer, {
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
