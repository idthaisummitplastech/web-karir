import { NextResponse } from "next/server";
import { getApplicantSession } from "@/lib/auth";
import { fetchFromBackend } from "@/lib/api-client";
import { DEFAULT_SETTINGS, getEmbedMapsUrl, getPlantMapsUrl, DEFAULT_MCU_LOCATION } from "@/lib/constants";

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const ANTI_CACHE_HEADERS = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  'Pragma': 'no-cache',
  'Expires': '0',
};

export async function GET() {
  try {
    const session = await getApplicantSession();
    if (!session) {
      return NextResponse.json(
        { error: "Sesi pelamar tidak valid atau telah berakhir." },
        { status: 401, headers: ANTI_CACHE_HEADERS }
      );
    }

    const targetIdentifier = session.applicantId || session.email;
    if (!targetIdentifier) {
      return NextResponse.json(
        { error: "Sesi pelamar tidak valid." },
        { status: 401, headers: ANTI_CACHE_HEADERS }
      );
    }

    const data = await fetchFromBackend<{
      success: boolean;
      applicant: any;
      settings: Record<string, string>;
    }>(`/applicants/status/${encodeURIComponent(String(targetIdentifier))}`);

    if (!data || !data.applicant) {
      return NextResponse.json(
        { error: "Data pelamar tidak ditemukan." },
        { status: 404, headers: ANTI_CACHE_HEADERS }
      );
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
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      },
    });
  } catch (error: any) {
    console.error("Applicant status fetch error:", error);
    const isNotFound = error?.message?.includes("404") || error?.status === 404;
    return NextResponse.json(
      { error: error?.message || "Gagal memuat status pelamar." },
      { 
        status: isNotFound ? 404 : (error?.status || 500),
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        },
      }
    );
  }
}
