import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { fetchRawFromBackend } from "@/lib/api-client";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized. Please log in." }, { status: 401 });
    }

    const body = await req.json();

    // Map and sanitize action & properties to match backend specifications
    const normalizedAction =
      body.action === "approve"
        ? "advance"
        : body.action === "update_token"
        ? "update_test_session"
        : body.action;

    const result = await fetchRawFromBackend("/recruitment/advance-stage", {
      method: "POST",
      headers: {
        "x-admin-id": String(session.adminId),
        "x-admin-role": session.role,
        "x-admin-department": session.department || "",
      },
      body: JSON.stringify({
        applicant_id: body.applicantId || body.applicant_id,
        action: normalizedAction,
        notes: body.notes || undefined,
        rejection_reason: body.rejectionReason || body.rejection_reason || undefined,
        scheduled_at: body.scheduledAt || body.scheduled_at || undefined,
        scheduled_until: body.scheduledUntil || body.scheduled_until || undefined,
        duration_minutes: body.durationMinutes || body.duration_minutes || undefined,
        token: body.token || undefined,
        location: body.location || undefined,
        maps_url: body.mapsUrl || body.maps_url || undefined,
        salary_offer: body.salaryOffer || body.salary_offer || undefined,
        offering_attachment: body.offeringAttachment || body.offering_attachment || body.offeringFile || undefined,
        offering_clauses: body.offeringClauses || body.offering_clauses || undefined,
        offering_signer_name: body.offeringSignerName || body.offering_signer_name || undefined,
        offering_signer_title: body.offeringSignerTitle || body.offering_signer_title || undefined,
        offering_signer_signature: body.offeringSignerSignature || body.offering_signer_signature || body.offeringSignature || undefined,
        offering_join_date: body.offeringJoinDate || body.offering_join_date || undefined,
        offering_ref_number: body.offeringRefNumber || body.offering_ref_number || undefined,
        meeting_platform: body.meetingPlatform || body.meeting_platform || undefined,
        meeting_link: body.meetingLink || body.meeting_link || undefined,
        meeting_passcode: body.meetingPasscode || body.meeting_passcode || undefined,
        interviewer_name: body.interviewerName || body.interviewer_name || undefined,
        target_stage: body.targetStage || body.target_stage || undefined,
        stage_status: body.stageStatus || body.stage_status || undefined,
        send_email: body.sendEmail !== undefined ? body.sendEmail : body.send_email !== undefined ? body.send_email : true,
        admin_id: session.adminId,
        admin_role: session.role,
        admin_department: session.department,
      }),
    });

    return NextResponse.json({
      success: true,
      message: result.message || result.data?.message || "Stage processed successfully.",
      emailSent: result.email_sent ?? result.data?.email_sent ?? true,
      emailError: result.email_error ?? result.data?.email_error ?? null,
    });
  } catch (error: any) {
    console.error("Advance stage error:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process stage change." },
      { status: 400 }
    );
  }
}
