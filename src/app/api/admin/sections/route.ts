import { NextRequest, NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";
import { getAdminSession } from "@/lib/auth";

// POST: create section under a department
export async function POST(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const body = await req.json();
    const { department_id, ...rest } = body;
    if (!department_id) return NextResponse.json({ error: "department_id diperlukan." }, { status: 400 });
    const data = await fetchFromBackend(`/departments/${department_id}/sections`, {
      method: "POST",
      body: JSON.stringify({ department_id, ...rest }),
    });
    return NextResponse.json({ success: true, section: data?.data || data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to create section." }, { status: 500 });
  }
}

// PUT: update section
export async function PUT(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { id, department_id, ...body } = await req.json();
    if (!id || !department_id) return NextResponse.json({ error: "ID section & department_id diperlukan." }, { status: 400 });
    const data = await fetchFromBackend(`/departments/${department_id}/sections/${id}`, {
      method: "PUT",
      body: JSON.stringify(body),
    });
    return NextResponse.json({ success: true, section: data?.data || data });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to update section." }, { status: 500 });
  }
}

// DELETE: delete section
export async function DELETE(req: NextRequest) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    const department_id = searchParams.get("department_id");
    if (!id || !department_id) return NextResponse.json({ error: "ID & department_id diperlukan." }, { status: 400 });
    const data = await fetchFromBackend(`/departments/${department_id}/sections/${id}`, { method: "DELETE" });
    return NextResponse.json({ success: true, message: data.message });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || "Failed to delete section." }, { status: 500 });
  }
}
