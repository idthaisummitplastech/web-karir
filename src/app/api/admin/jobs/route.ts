import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getAdminSession } from "@/lib/auth";

function resolveJobStatus(job: { isOpen: boolean; openingDate: Date | null; closingDate: Date | null }) {
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
    const jobs = await prisma.jobPosting.findMany({
      orderBy: { createdAt: "desc" },
      include: { _count: { select: { applicants: true } } },
    });
    const enriched = jobs.map((j) => ({ ...j, ...resolveJobStatus(j) }));
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
    let opening: Date | null = null;
    let closing: Date | null = null;
    if (openingDate) {
      opening = new Date(openingDate);
      if (isNaN(opening.getTime())) return NextResponse.json({ error: "Tanggal buka tidak valid." }, { status: 400 });
    }
    if (closingDate) {
      closing = new Date(closingDate);
      closing.setHours(23, 59, 59, 999);
      if (isNaN(closing.getTime())) return NextResponse.json({ error: "Tanggal tutup tidak valid." }, { status: 400 });
    }
    if (opening && closing && opening.getTime() > closing.getTime()) {
      return NextResponse.json({ error: "Tanggal buka tidak boleh sesudah tanggal tutup." }, { status: 400 });
    }
    const job = await prisma.jobPosting.create({
      data: {
        title: title.trim(), department: department.trim(),
        location: location?.trim() || "Karawang / Cikarang",
        type: type?.trim() || "Full-Time", experience: experience?.trim() || "1-3 Tahun",
        requirements: requirements.trim(), description: description.trim(),
        isOpen: isOpen !== undefined ? Boolean(isOpen) : true,
        openingDate: opening, closingDate: closing,
      },
    });
    return NextResponse.json({ success: true, message: "Lowongan berhasil dipublikasikan.", job });
  } catch (e: any) {
    console.error("Create job error:", e);
    return NextResponse.json({ error: "Gagal membuat lowongan." }, { status: 500 });
  }
}

// PUT: update / buka-tutup / set tanggal
export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!requireHr(session)) return NextResponse.json({ error: "Hanya HR & Super Admin." }, { status: 403 });
    const body = await req.json();
    const { id, title, department, location, type, experience, requirements, description, isOpen, openingDate, closingDate } = body;
    if (!id) return NextResponse.json({ error: "ID lowongan wajib disertakan." }, { status: 400 });
    const data: any = {};
    if (title !== undefined) data.title = title.trim();
    if (department !== undefined) data.department = department.trim();
    if (location !== undefined) data.location = location.trim();
    if (type !== undefined) data.type = type;
    if (experience !== undefined) data.experience = experience;
    if (requirements !== undefined) data.requirements = requirements;
    if (description !== undefined) data.description = description;
    if (isOpen !== undefined) data.isOpen = Boolean(isOpen);
    if (openingDate !== undefined) data.openingDate = openingDate ? new Date(openingDate) : null;
    if (closingDate !== undefined) {
      if (!closingDate) data.closingDate = null;
      else { const c = new Date(closingDate); c.setHours(23, 59, 59, 999); data.closingDate = c; }
    }
    if (data.openingDate && data.closingDate && new Date(data.openingDate).getTime() > new Date(data.closingDate).getTime()) {
      return NextResponse.json({ error: "Tanggal buka tidak boleh sesudah tanggal tutup." }, { status: 400 });
    }
    const job = await prisma.jobPosting.update({ where: { id: Number(id) }, data });
    return NextResponse.json({ success: true, message: "Lowongan diperbarui.", job: { ...job, ...resolveJobStatus(job) } });
  } catch (e: any) {
    console.error("Update job error:", e);
    return NextResponse.json({ error: "Gagal memperbarui lowongan." }, { status: 500 });
  }
}

// DELETE: hapus (ditolak bila sudah ada pelamar)
export async function DELETE(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    if (!requireHr(session)) return NextResponse.json({ error: "Hanya HR & Super Admin." }, { status: 403 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID wajib disertakan." }, { status: 400 });
    const count = await prisma.applicant.count({ where: { jobPostingId: Number(id) } });
    if (count > 0) {
      return NextResponse.json({ error: `Tidak dapat dihapus: sudah ada ${count} pelamar. Gunakan saklar Tutup.` }, { status: 400 });
    }
    await prisma.jobPosting.delete({ where: { id: Number(id) } });
    return NextResponse.json({ success: true, message: "Lowongan dihapus." });
  } catch (e: any) {
    console.error("Delete job error:", e);
    return NextResponse.json({ error: "Gagal menghapus lowongan." }, { status: 500 });
  }
}
