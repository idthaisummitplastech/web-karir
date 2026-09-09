import { NextResponse } from "next/server";
import { fetchFromBackend } from "@/lib/api-client";

export async function GET() {
  try {
    const jobs = await fetchFromBackend("/jobs");
    return NextResponse.json({ success: true, jobs });
  } catch (error: any) {
    console.error("Failed to fetch jobs from backend:", error.message);
    return NextResponse.json({ error: "Gagal memuat lowongan." }, { status: 500 });
  }
}
