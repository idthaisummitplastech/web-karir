import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi tidak valid atau telah berakhir." }, { status: 401 });
    }

    const body = await req.json().catch(() => ({}));

    const data = await fetchFromBackend<{
      success: boolean;
      message: string;
      nik?: string;
    }>("/api/v1/applicants/accept-offer", {
      method: "POST",
      body: JSON.stringify({
        applicant_id: session.applicantId,
        signed_contract_file: body.signed_contract_file || body.signedContractFile || body.signedFile || undefined,
      }),
    });

    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Accept offer error:", error);
    return NextResponse.json(
      { error: error?.message || "Failed to process offer acceptance." },
      { status: error?.status || 500 }
    );
  }
}
