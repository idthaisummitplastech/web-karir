import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailHrInterviewInvite, emailUserInterviewInvite, sendMailDirect } from "@/lib/email";
import { DEFAULT_SETTINGS, getPlantMapsUrl } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const {
      applicantId,
      interviewType, // 'hr' or 'user'
      scheduledAt,
      locationMode, // 'online' or 'onsite'
      meetingPlatform,
      meetingLink,
      meetingPasscode,
      locationAddress,
      mapsUrl,
      roomName,
      interviewerName,
      notes,
    } = await req.json();

    const applicant = await prisma.applicant.findUnique({
      where: { id: Number(applicantId) },
      include: { jobPosting: true },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
    }

    const resolvedLocationAddress =
      locationAddress ||
      (applicant.jobPosting.location.includes("Cikarang")
        ? DEFAULT_SETTINGS.plantAddressCikarang
        : DEFAULT_SETTINGS.plantAddressKarawang);

    const resolvedMapsUrl = mapsUrl || getPlantMapsUrl(resolvedLocationAddress);

    // 1. Simpan Jadwal Interview
    const interview = await prisma.interviewSchedule.create({
      data: {
        applicantId: applicant.id,
        interviewType,
        scheduledAt: new Date(scheduledAt),
        locationMode: locationMode || "online",
        meetingPlatform: meetingPlatform || "teams",
        meetingLink: locationMode === "online" ? meetingLink : null,
        meetingPasscode: locationMode === "online" ? meetingPasscode : null,
        locationAddress: locationMode === "onsite" ? resolvedLocationAddress : null,
        roomName: roomName || "Ruang Meeting HCM Lt. 2",
        interviewerName: interviewerName || (interviewType === "hr" ? "Tim HR Recruitment" : "SPV / Manager Departemen"),
        notes,
        status: "scheduled",
      },
    });

    // 2. Majukan status pelamar jika belum di tahap ini
    const targetStage = interviewType === "hr" ? 4 : 5;
    if (applicant.currentStage < targetStage) {
      await prisma.applicant.update({
        where: { id: applicant.id },
        data: { currentStage: targetStage, stageStatus: "in_progress" },
      });
    }

    // 3. Kirim Email Undangan Resmi Berformat Korporat (di-await agar kegagalan terlihat)
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    const formattedDate = new Date(scheduledAt).toLocaleString("id-ID", {
      dateStyle: "full",
      timeStyle: "short",
    });

    let emailStatus: { success: boolean; error?: string } | null = null;

    if (interviewType === "hr") {
      const emailHtml = emailHrInterviewInvite(
        applicant.fullName,
        applicant.jobPosting.title,
        {
          scheduledAt: formattedDate,
          locationMode,
          meetingPlatform,
          meetingLink,
          meetingPasscode,
          locationAddress: resolvedLocationAddress,
          mapsUrl: resolvedMapsUrl,
          roomName,
        },
        appUrl
      );

      emailStatus = await sendMailDirect({
        to: applicant.email,
        subject: `[PT ITSP] Undangan Resmi Wawancara (Interview HR) - ${applicant.jobPosting.title}`,
        html: emailHtml,
      });
      if (!emailStatus.success) console.error("Email interview HR error:", emailStatus.error);
    } else {
      const emailHtml = emailUserInterviewInvite(
        applicant.fullName,
        applicant.jobPosting.title,
        {
          scheduledAt: formattedDate,
          locationMode,
          interviewerName,
          meetingPlatform,
          meetingLink,
          meetingPasscode,
          locationAddress: resolvedLocationAddress,
          mapsUrl: resolvedMapsUrl,
          roomName,
        },
        appUrl
      );

      emailStatus = await sendMailDirect({
        to: applicant.email,
        subject: `[PT ITSP] Undangan Resmi Wawancara Teknis (Interview User) - ${applicant.jobPosting.title}`,
        html: emailHtml,
      });
      if (!emailStatus.success) console.error("Email interview user error:", emailStatus.error);
    }

    return NextResponse.json({
      success: true,
      message: emailStatus && !emailStatus.success
        ? `Jadwal Interview ${interviewType.toUpperCase()} berhasil dibuat, namun email gagal terkirim (${emailStatus.error || "kesalahan SMTP"}).`
        : `Jadwal Interview ${interviewType.toUpperCase()} berhasil dibuat dan undangan email resmi (lengkap dengan Google Maps) telah dikirimkan ke ${applicant.email}!`,
      interview,
      emailSent: emailStatus ? emailStatus.success : undefined,
      emailError: emailStatus && !emailStatus.success ? emailStatus.error : undefined,
    });
  } catch (error: any) {
    console.error("Schedule interview error:", error);
    return NextResponse.json({ error: "Gagal menjadwalkan interview." }, { status: 500 });
  }
}
