import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";
import { DEFAULT_SETTINGS, getEmbedMapsUrl, getPlantMapsUrl, DEFAULT_MCU_LOCATION } from "@/lib/constants";

export async function GET() {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json({ error: "Sesi pelamar tidak valid atau telah berakhir." }, { status: 401 });
    }

    const data = await fetchFromBackend<{
      success: boolean;
      applicant: any;
      settings: Record<string, string>;
    }>(`/api/v1/applicants/status/${session.applicantId}`);

    if (!data || !data.applicant) {
      return NextResponse.json({ error: "Data pelamar tidak ditemukan." }, { status: 404 });
    }

    const settingsMap = data.settings || {};

    return NextResponse.json({
      success: true,
      applicant: data.applicant,
      mcuConfig: {
        partnerName: settingsMap["mcu_partner_name"] || DEFAULT_SETTINGS.mcuPartnerName,
        partnerAddress: settingsMap["mcu_partner_address"] || DEFAULT_SETTINGS.mcuPartnerAddress,
        estimatedCost: settingsMap["mcu_estimated_cost"] || DEFAULT_SETTINGS.mcuEstimatedCost,
        instructions: settingsMap["mcu_instructions"] || DEFAULT_SETTINGS.mcuInstructions,
        mapsUrl:
          getPlantMapsUrl(settingsMap["mcu_partner_maps"] || "") ||
          getPlantMapsUrl(settingsMap["mcu_partner_address"] || "") ||
          getPlantMapsUrl(settingsMap["mcu_partner_name"] || "") ||
          DEFAULT_MCU_LOCATION.mapsUrl,
        embedUrl:
          getEmbedMapsUrl(settingsMap["mcu_partner_maps"] || "") ||
          getEmbedMapsUrl(settingsMap["mcu_partner_address"] || "") ||
          getEmbedMapsUrl(settingsMap["mcu_partner_name"] || "") ||
          DEFAULT_MCU_LOCATION.embedUrl,
      },
      plantConfig: {
        karawang: settingsMap["plant_address_karawang"] || DEFAULT_SETTINGS.plantAddressKarawang,
        cikarang: settingsMap["plant_address_cikarang"] || DEFAULT_SETTINGS.plantAddressCikarang,
      },
    });
  } catch (error: any) {
    console.error("Applicant status fetch error:", error);
    return NextResponse.json({ error: error?.message || "Gagal memuat status pelamar." }, { status: error?.status || 500 });
  }
}
