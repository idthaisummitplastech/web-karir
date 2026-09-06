import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/constants";

export async function GET() {
  try {
    const list = await prisma.recruitmentSetting.findMany();
    const map = list.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    return NextResponse.json({
      success: true,
      settings: {
        mcu_partner_name: map["mcu_partner_name"] || DEFAULT_SETTINGS.mcuPartnerName,
        mcu_partner_address: map["mcu_partner_address"] || DEFAULT_SETTINGS.mcuPartnerAddress,
        mcu_estimated_cost: map["mcu_estimated_cost"] || DEFAULT_SETTINGS.mcuEstimatedCost,
        mcu_instructions: map["mcu_instructions"] || DEFAULT_SETTINGS.mcuInstructions,
        plant_address_karawang: map["plant_address_karawang"] || DEFAULT_SETTINGS.plantAddressKarawang,
        plant_address_cikarang: map["plant_address_cikarang"] || DEFAULT_SETTINGS.plantAddressCikarang,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: "Gagal memuat pengaturan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const settingsData = await req.json();

    for (const [key, value] of Object.entries(settingsData)) {
      if (typeof value === "string") {
        await prisma.recruitmentSetting.upsert({
          where: { key },
          update: { value },
          create: { key, value },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan default rekrutmen & klinik rekanan berhasil disimpan!",
    });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}
