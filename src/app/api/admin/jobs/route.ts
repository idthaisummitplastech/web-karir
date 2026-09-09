import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchFromBackend, fetchRawFromBackend } from "@/lib/api-client";

function resolveJobStatus(job: { isOpen: boolean; openingDate: string | null; closingDate: string | null }) {
  const now = new Date();
  if (job.openingDate && new Date(job.openingDate).getTime() > now.getTime()) {
    return { effectiveOpen: false, statusLabel: "Terjadwal" };
  }
  if (job.closingDate && new Date(job.closingDate).getTime() < now.getTime()) {
    return { effectiveOpen: false, statusLabel: "Kedaluwarsa" };
  }
  if (!job.isOpen) {
    return { effectiveOpen: false, statusLabel: "Ditutup Manual" };
  }
  return { effectiveOpen: true, statusLabel: "Dibuka" };
}

function requireHr(session: any) {
  return session && (session.role === "hr" || session.role === "admin");
}

// GET: semua lowongan untuk HR/Admin termasuk yang tutup
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!requireHr(session)) {
      return NextResponse.json({ error: "Hanya HR & Super Admin." }, { status: 403 });
    }
    const jobs = await fetchFromBackend("/jobs/all");
    const enriched = (jobs || []).map((j: any) => ({ ...j, ...resolveJobStatus(j) }));
    return NextResponse.json({ success: true, jobs: enriched });
  } catch (e: any) {
    console.error("Fetch admin jobs error:", e);
    return NextResponse.json({ error: "Gagal memuat lowongan." }, { status: 500 });
  }
}

// POST: buat lowongan baru
export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!requireHr(session)) return NextResponse.json({ error: "Hanya HR & Super Admin." }, { status: 403 });
    const body = await req.json();
    const { title, department, location, type, experience, requirements, description, isOpen, openingDate, closingDate } = body;
    if (!title?.trim() || !department?.trim() || !requirements?.trim() || !description?.trim()) {
      return NextResponse.json({ error: "Judul, departemen, kualifikasi & deskripsi wajib diisi." }, { status: 400 });
    }

    const job = await fetchRawFromBackend("/jobs", {
      method: "POST",
      body: JSON.stringify({
        title: title.trim(),
        department: department.trim(),
        location: location?.trim() || "Karawang / Cikarang",
        type: type?.trim() || "Full-Time",
        experience: experience?.trim() || "1-3 Tahun",
        requirements: requirements.trim(),
        description: description.trim(),
        is_open: isOpen !== undefined ? Boolean(isOpen) : true,
        opening_date: openingDate || null,
        closing_date: closingDate || null,
      }),
    });
    return NextResponse.json({ success: true, message: "Lowongan berhasil dipublikasikan.", job: job.data || job });
  } catch (e: any) {
    console.error("Create job error:", e);
    return NextResponse.json({ error: e.message || "Gagal membuat lowongan." }, { status: 500 });
  }
}

// PUT: update / buka-tutup / set tanggal
export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!requireHr(session)) return NextResponse.json({ error: "Hanya HR & Super Admin." }, { status: 403 });
    const body = await req.json();
    const { id, ...updateData } = body;
    if (!id) return NextResponse.json({ error: "ID lowongan wajib disertakan." }, { status: 400 });

    const payload: any = {};
    if (updateData.title !== undefined) payload.title = updateData.title.trim();
    if (updateData.department !== undefined) payload.department = updateData.department.trim();
    if (updateData.location !== undefined) payload.location = updateData.location.trim();
    if (updateData.type !== undefined) payload.type = updateData.type;
    if (updateData.experience !== undefined) payload.experience = updateData.experience;
    if (updateData.requirements !== undefined) payload.requirements = updateData.requirements;
    if (updateData.description !== undefined) payload.description = updateData.description;
    if (updateData.isOpen !== undefined) payload.is_open = Boolean(updateData.isOpen);
    if (updateData.openingDate !== undefined) payload.opening_date = updateData.openingDate || null;
    if (updateData.closingDate !== undefined) payload.closing_date = updateData.closingDate || null;

    const job = await fetchRawFromBackend(`/jobs/${Number(id)}`, {
      method: "PUT",
      body: JSON.stringify(payload),
    });
    const jobData = job.data || job;
    return NextResponse.json({ success: true, message: "Lowongan diperbarui.", job: { ...jobData, ...resolveJobStatus(jobData) } });
  } catch (e: any) {
    console.error("Update job error:", e);
    return NextResponse.json({ error: e.message || "Gagal memperbarui lowongan." }, { status: 500 });
  }
}

// DELETE: hapus lowongan
export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!requireHr(session)) return NextResponse.json({ error: "Hanya HR & Super Admin." }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });

    await fetchRawFromBackend(`/jobs/${Number(id)}`, { method: "DELETE" });
    return NextResponse.json({ success: true, message: "Lowongan dihapus." });
  } catch (e: any) {
    console.error("Delete job error:", e);
    return NextResponse.json({ error: e.message || "Gagal menghapus lowongan." }, { status: 500 });
  }
}
