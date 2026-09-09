import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function POST() {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    const data = await fetchFromBackend<{
      success: boolean;
      message: string;
      nik?: string;
    }>("/api/v1/applicants/accept-offer", {
      method: "POST",
      body: JSON.stringify({ applicant_id: session.applicantId }),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Accept offer error:", error);
    return NextResponse.json(
      { error: error?.message || "Gagal memproses persetujuan offering." },
      { status: error?.status || 500 }
    );
  }
}
