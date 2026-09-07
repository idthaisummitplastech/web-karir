import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { sendMailDirect, generateCorporateEmailWrapper } from "@/lib/email";

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
        ...map,
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

    const payload = await req.json();

    // Aksi Uji Coba Kirim Email Preview
    if (payload.action === "test_email") {
      const { to, subject, bodyContent } = payload;
      const targetEmail = to || session.email;

      if (!targetEmail) {
        return NextResponse.json({ error: "Alamat email tujuan tidak boleh kosong." }, { status: 400 });
      }

      const html = generateCorporateEmailWrapper(subject || "Uji Coba Template Email - PT ITSP", bodyContent || "<p>Ini adalah pesan uji coba template email.</p>");
      const result = await sendMailDirect({
        to: targetEmail,
        subject: `[PREVIEW TEMPLATE] ${subject || "Uji Coba Template Email PT ITSP"}`,
        html,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Gagal mengirim email uji coba." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Email uji coba template berhasil dikirimkan ke: ${targetEmail}`,
      });
    }

    // Simpan Pengaturan
    const settingsData = payload.settings || payload;

    for (const [key, value] of Object.entries(settingsData)) {
      const strVal = typeof value === "string" ? value : typeof value === "number" ? String(value) : null;
      if (strVal !== null) {
        await prisma.recruitmentSetting.upsert({
          where: { key },
          update: { value: strVal },
          create: { key, value: strVal },
        });
      }
    }

    return NextResponse.json({
      success: true,
      message: "Pengaturan dan template email berhasil disimpan secara permanen!",
    });
  } catch (error: any) {
    console.error("Save settings error:", error);
    return NextResponse.json({ error: "Gagal menyimpan pengaturan." }, { status: 500 });
  }
}
