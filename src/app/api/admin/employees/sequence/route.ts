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
    const joinDate = searchParams.get("join_date") || searchParams.get("joinDate") || "";
    const customSeq = searchParams.get("custom_seq") || searchParams.get("customSeq") || "";

    const params = new URLSearchParams();
    if (joinDate) params.set("join_date", joinDate);
    if (customSeq) params.set("custom_seq", customSeq);

    const data = await fetchFromBackend<any>(`/recruitment/employee-sequence?${params.toString()}`, {
      headers: {
        Authorization: `Bearer ${session.adminId}`,
      },
    });

    return NextResponse.json(data, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Fetch employee sequence error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to load employee sequence ID." },
      { status: 500, headers: ANTI_CACHE_HEADERS }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401, headers: ANTI_CACHE_HEADERS });
    }

    const body = await req.json();
    const result = await fetchFromBackend<any>("/recruitment/employee-sequence", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session.adminId}`,
      },
      body: JSON.stringify(body),
    });

    return NextResponse.json(result, { headers: ANTI_CACHE_HEADERS });
  } catch (error: any) {
    console.error("Set employee sequence error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to adjust employee sequence number." },
      { status: 400, headers: ANTI_CACHE_HEADERS }
    );
  }
}
