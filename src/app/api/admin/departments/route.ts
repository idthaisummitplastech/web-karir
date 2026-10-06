import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

// ─── GET: list departments (with sections) ───────────────────────────────────
export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });

    const data = await fetchFromBackend("/departments?active_only=false");
    return NextResponse.json({
      success: true,
      departments: (data.data || []).map((d: any) => d.name),   // backward compat for jobs page
      departmentsFull: data.data || [],                           // full objects with sections
    });
  } catch (error: any) {
    console.error("Fetch departments error:", error);
    return NextResponse.json({ success: true, departments: FALLBACK, departmentsFull: [] });
  }
}

// ─── POST: create department ─────────────────────────────────────────────────
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await req.json();
    const data = await fetchFromBackend("/departments", { method: "POST", body: JSON.stringify(body) });
    return NextResponse.json({ success: true, department: data.data, message: data.message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal membuat departemen." }, { status: 500 });
  }
}

// ─── PUT: update department ──────────────────────────────────────────────────
export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id, ...body } = await req.json();
    if (!id) return NextResponse.json({ error: "ID departemen diperlukan." }, { status: 400 });
    const data = await fetchFromBackend(`/departments/${id}`, { method: "PUT", body: JSON.stringify(body) });
    return NextResponse.json({ success: true, department: data.data, message: data.message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal memperbarui departemen." }, { status: 500 });
  }
}

// ─── DELETE: delete department ────────────────────────────────────────────────
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID departemen diperlukan." }, { status: 400 });
    const data = await fetchFromBackend(`/departments/${id}`, { method: "DELETE" });
    return NextResponse.json({ success: true, message: data.message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Gagal menghapus departemen." }, { status: 500 });
  }
}

const FALLBACK = [
  'Accounting & Finance','Assembly','HQ Office','HR & GA','Injection','Interseat',
  'Local Manager','Maintenance','Marketing','Painting','Planning','Production',
  'Production Engineering','Purchasing','Quality Assurance','Rack','SYD & IT',
  'Store','Thai Manager','Warehouse & Delivery',
];
