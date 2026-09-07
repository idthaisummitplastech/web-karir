import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { emailScreeningPassed, emailPsikotesPassed, emailMcuReferral, emailOfferingIssued, sendMailDirect, generateCorporateEmailWrapper } from "@/lib/email";
import { DEFAULT_SETTINGS, getPlantMapsUrl } from "@/lib/constants";

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) return NextResponse.json({ error: "Unauthorized. Silakan login." }, { status: 401 });
    const { applicantId, template } = await req.json();
    const applicant = await prisma.applicant.findUnique({ where: { id: Number(applicantId) }, include: { jobPosting: true } });
    if (!applicant) return NextResponse.json({ error: "Pelamar tidak ditemukan." }, { status: 404 });
    const settingsList = await prisma.recruitmentSetting.findMany();
    const settingsMap = settingsList.reduce((acc, c) => ({ ...acc, [c.key]: c.value }), {} as Record<string, string>);
    const renderTemplate = (key: string, defaultSubject: string, defaultHtml: string, vars: Record<string, string>) => {
      const customSub = settingsMap[`email_tpl_${key}_subject`];
      const customBody = settingsMap[`email_tpl_${key}_body`];
      if (customSub && customBody) {
        let sub = customSub; let body = customBody;
        Object.entries(vars).forEach(([k, v]) => {
          sub = sub.replace(new RegExp(`{${k}}`, "g"), v || "-");
          body = body.replace(new RegExp(`{${k}}`, "g"), v || "-");
        });
        body = body.replace(/\n/g, "<br/>");
        return { subject: sub, html: generateCorporateEmailWrapper(sub, `<div style="line-height:1.7;font-size:14px;color:#334155;">${body}</div>`) };
      }
      return { subject: defaultSubject, html: defaultHtml };
    };
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3001";
    let key = String(template || "");
    if (!key) {
      if (applicant.currentStage === 2) key = "screening_passed";
      else if (applicant.currentStage === 3) key = "psikotes_passed";
      else if (applicant.currentStage === 6) key = "mcu_referral";
      else if (applicant.currentStage === 7) key = "offering_issued";
      else key = "screening_passed";
    }
    let mailData = { subject: "", html: "" };
    if (key === "screening_passed") {
      const schedule = applicant.psikotesScheduledAt ? new Date(applicant.psikotesScheduledAt).toLocaleString("id-ID") : "Jadwal Terbuka di Dashboard";
      const loc = (applicant as any).psikotesLocation || "Portal Karir Online PT ITSP";
      const tok = applicant.psikotesToken || "PSIKO2026";
      const def = emailScreeningPassed(applicant.fullName, applicant.jobPosting.title, schedule, appUrl, loc, getPlantMapsUrl(loc) || undefined, tok);
      mailData = renderTemplate(key, `[PT ITSP] Hasil Screening & Undangan Psikotes - ${applicant.jobPosting.title}`, def, { nama: applicant.fullName, posisi: applicant.jobPosting.title, jadwal: schedule, lokasi: loc, token: tok, link_portal: `${appUrl}/login` });
    } else if (key === "psikotes_passed") {
      const schedule = applicant.userTestScheduledAt ? new Date(applicant.userTestScheduledAt).toLocaleString("id-ID") : "Sesuai Jadwal di Dashboard";
      const loc = (applicant as any).userTestLocation || "Portal Karir Online PT ITSP";
      const tok = applicant.userTestToken || "USER2026";
      const def = emailPsikotesPassed(applicant.fullName, applicant.jobPosting.title, schedule, appUrl, loc, getPlantMapsUrl(loc) || undefined, tok);
      mailData = renderTemplate(key, `[PT ITSP] Hasil Psikotes & Undangan Ujian Teknis - ${applicant.jobPosting.title}`, def, { nama: applicant.fullName, posisi: applicant.jobPosting.title, jadwal: schedule, lokasi: loc, token: tok, link_portal: `${appUrl}/login` });
    } else if (key === "mcu_referral") {
      const clinic = settingsMap["mcu_partner_name"] || DEFAULT_SETTINGS.mcuPartnerName;
      const address = settingsMap["mcu_partner_address"] || DEFAULT_SETTINGS.mcuPartnerAddress;
      const cost = settingsMap["mcu_estimated_cost"] || DEFAULT_SETTINGS.mcuEstimatedCost;
      const instr = settingsMap["mcu_instructions"] || DEFAULT_SETTINGS.mcuInstructions;
      const customMaps = getPlantMapsUrl(settingsMap["mcu_partner_maps"] || "") || undefined;
      const def = emailMcuReferral(applicant.fullName, applicant.jobPosting.title, clinic, address, cost, instr, appUrl, customMaps);
      mailData = renderTemplate(key, `[PT ITSP] Rujukan MCU - ${applicant.jobPosting.title}`, def, { nama: applicant.fullName, posisi: applicant.jobPosting.title, klinik_mcu: clinic, alamat_mcu: address, biaya_mcu: cost, link_portal: `${appUrl}/login` });
    } else if (key === "offering_issued") {
      const salary = applicant.offeringSalary || "Sesuai Standar Grade PT ITSP + Tunjangan";
      const def = emailOfferingIssued(applicant.fullName, applicant.jobPosting.title, appUrl);
      mailData = renderTemplate(key, `[PT ITSP] Offering Letter - ${applicant.jobPosting.title}`, def, { nama: applicant.fullName, posisi: applicant.jobPosting.title, gaji_offer: salary, link_portal: `${appUrl}/login` });
    } else {
      return NextResponse.json({ error: `Template ${key} tidak dikenal.` }, { status: 400 });
    }
    const result = await sendMailDirect({ to: applicant.email, subject: mailData.subject, html: mailData.html });
    if (!result.success) return NextResponse.json({ error: result.error || "Gagal mengirim email.", emailSent: false }, { status: 500 });
    return NextResponse.json({ success: true, message: `Email ${key} berhasil dikirim ulang ke ${applicant.email}!`, emailSent: true });
  } catch (error: any) {
    console.error("Resend email error:", error);
    return NextResponse.json({ error: "Gagal mengirim ulang email." }, { status: 500 });
  }
}
