import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi pelamar tidak valid atau telah berakhir." }, { status: 401 });
    }

    const applicant = await prisma.applicant.findUnique({
      where: { id: session.applicantId },
      include: {
        jobPosting: true,
        testSubmissions: true,
        interviews: {
          orderBy: { createdAt: "desc" },
        },
        karyawanData: true,
      },
    });

    if (!applicant) {
      return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
    }

    // Ambil default settings dari DB jika ada
    const settingsList = await prisma.recruitmentSetting.findMany();
    const settingsMap = settingsList.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    // Privacy filter: Numerical score is masked unless showScore is true
    const sanitizedSubmissions = applicant.testSubmissions.map((sub) => ({
      id: sub.id,
      testType: sub.testType,
      isPassed: sub.isPassed,
      isLocked: sub.isLocked,
      violationsCount: sub.violationsCount,
      score: sub.showScore ? sub.score : null, // Hidden for privacy!
      showScore: sub.showScore,
      submittedAt: sub.submittedAt,
    }));

    return NextResponse.json({
      success: true,
      applicant: {
        id: applicant.id,
        fullName: applicant.fullName,
        email: applicant.email,
        phone: applicant.phone,
        lastEducation: applicant.lastEducation,
        schoolName: applicant.schoolName,
        major: applicant.major,
        experience: applicant.experience,
        englishSkill: applicant.englishSkill,
        currentStage: applicant.currentStage,
        stageStatus: applicant.stageStatus,
        failedAtStage: applicant.failedAtStage,
        rejectionReason: applicant.rejectionReason,
        screeningNotes: applicant.screeningNotes,
        psikotesScheduledAt: applicant.psikotesScheduledAt,
        psikotesLocation: (applicant as any).psikotesLocation || 'Portal Karir Online PT ITSP',
        userTestScheduledAt: applicant.userTestScheduledAt,
        userTestLocation: (applicant as any).userTestLocation || 'Portal Karir Online PT ITSP',
        mcuNotes: applicant.mcuNotes,
        offeringLetter: applicant.offeringLetter,
        offeringSalary: applicant.offeringSalary,
        offeringStatus: applicant.offeringStatus,
        contractSignedAt: applicant.contractSignedAt,
        jobPosting: {
          id: applicant.jobPosting.id,
          title: applicant.jobPosting.title,
          department: applicant.jobPosting.department,
          location: applicant.jobPosting.location,
        },
        testSubmissions: sanitizedSubmissions,
        interviews: applicant.interviews,
        karyawanData: applicant.karyawanData,
      },
      mcuConfig: {
        partnerName: settingsMap["mcu_partner_name"] || DEFAULT_SETTINGS.mcuPartnerName,
        partnerAddress: settingsMap["mcu_partner_address"] || DEFAULT_SETTINGS.mcuPartnerAddress,
        estimatedCost: settingsMap["mcu_estimated_cost"] || DEFAULT_SETTINGS.mcuEstimatedCost,
        instructions: settingsMap["mcu_instructions"] || DEFAULT_SETTINGS.mcuInstructions,
      },
      plantConfig: {
        karawang: settingsMap["plant_address_karawang"] || DEFAULT_SETTINGS.plantAddressKarawang,
        cikarang: settingsMap["plant_address_cikarang"] || DEFAULT_SETTINGS.plantAddressCikarang,
      },
    });
  } catch (error: any) {
    console.error("Applicant status fetch error:", error);
    return NextResponse.json({ error: "Gagal memuat status pelamar." }, { status: 500 });
  }
}
