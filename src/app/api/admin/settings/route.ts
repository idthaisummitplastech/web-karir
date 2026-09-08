import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { DEFAULT_SETTINGS } from "@/lib/constants";
import { sendMailDirect, generateCorporateEmailWrapper } from "@/lib/email";

export async function GET() {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const isSuperAdmin = session.role === "superadmin" || session.username === "admin";

    // 1. Ambil pengaturan umum (MCU, pabrik, template email)
    const list = await prisma.recruitmentSetting.findMany();
    const map = list.reduce((acc, curr) => {
      acc[curr.key] = curr.value;
      return acc;
    }, {} as Record<string, string>);

    const responseData: any = {
      success: true,
      isSuperAdmin,
      settings: {
        mcu_partner_name: map["mcu_partner_name"] || DEFAULT_SETTINGS.mcuPartnerName,
        mcu_partner_address: map["mcu_partner_address"] || DEFAULT_SETTINGS.mcuPartnerAddress,
        mcu_estimated_cost: map["mcu_estimated_cost"] || DEFAULT_SETTINGS.mcuEstimatedCost,
        mcu_instructions: map["mcu_instructions"] || DEFAULT_SETTINGS.mcuInstructions,
        plant_address_karawang: map["plant_address_karawang"] || DEFAULT_SETTINGS.plantAddressKarawang,
        plant_address_cikarang: map["plant_address_cikarang"] || DEFAULT_SETTINGS.plantAddressCikarang,
        ...map,
      },
    };

    // 2. Jika Super Admin, sertakan data kredensial SMTP Server, Multi-Kanal, dan Grafana
    if (isSuperAdmin) {
      const [smtpServer, channels, observability] = await Promise.all([
        prisma.smtpServer.findFirst({ orderBy: { id: "asc" } }),
        prisma.emailChannel.findMany({ orderBy: { id: "asc" } }),
        prisma.observabilitySetting.findFirst(),
      ]);

      responseData.smtpServer = smtpServer || {
        host: process.env.SMTP_HOST || "smtp.gmail.com",
        port: parseInt(process.env.SMTP_PORT || "587"),
        username: process.env.SMTP_USER || "info.itsp@thaisummit.co.id",
        password: process.env.SMTP_PASS || "",
        encryption: "tls",
        isActive: true,
      };

      responseData.channels = channels.length > 0 ? channels : [
        {
          appCode: "web_karir",
          appName: "Portal Karir & Rekrutmen ATS",
          senderName: "PT ITSP Recruitment",
          senderEmail: "info.itsp@thaisummit.co.id",
          replyTo: "recruitment@itsp.co.id",
          isActive: true,
        },
        {
          appCode: "web_perusahaan",
          appName: "Website Profil Perusahaan",
          senderName: "PT ITSP Marketing",
          senderEmail: "info.itsp@thaisummit.co.id",
          replyTo: "marketing@itsp.co.id",
          isActive: true,
        },
      ];

      responseData.observability = observability || {
        grafanaOtlpUrl: "https://otlp-gateway-prod-ap-southeast-2.grafana.net/otlp/v1/logs",
        grafanaAuthHeader: "Basic MTgyMTkyOTpnbGNfZXlKdklqb2lNVGt3TXpRM01DSXNJbTRpT2lKcGRITndMV1Z0WVdsc0xXeHZaM01pTENKcklqb2lRMVp0VWt0Vk1VazFaVE0wT0RjMk1tVjFVM3B3VURrMUlpd2liU0k2ZXlKeUlqb2ljSEp2WkMxaGNDMXpiM1YwYUdWaGMzUXRNaUo5ZlE9PQ==",
        grafanaDashboardUrl: "https://rubylake3285.grafana.net",
        isEnabled: true,
      };
    }

    return NextResponse.json(responseData);
  } catch (error: any) {
    console.error("Load settings error:", error);
    return NextResponse.json({ error: "Gagal memuat pengaturan." }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getAdminSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const isSuperAdmin = session.role === "superadmin" || session.username === "admin";
    const payload = await req.json();

    // 1. Aksi Khusus Super Admin: Simpan Konfigurasi SMTP Server, Multi-Kanal & Grafana
    if (payload.action === "save_smtp_and_channels") {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: "Akses ditolak. Pengaturan server email hanya dapat diubah oleh Super Admin." },
          { status: 403 }
        );
      }

      const { smtpServer, channels, observability } = payload;

      // Simpan Server SMTP
      if (smtpServer) {
        await prisma.smtpServer.upsert({
          where: { id: smtpServer.id || 1 },
          update: {
            host: smtpServer.host,
            port: parseInt(smtpServer.port) || 587,
            username: smtpServer.username,
            password: smtpServer.password,
            encryption: smtpServer.encryption || "tls",
            isActive: smtpServer.isActive ?? true,
          },
          create: {
            name: smtpServer.name || "Server Email Resmi PT ITSP",
            host: smtpServer.host,
            port: parseInt(smtpServer.port) || 587,
            username: smtpServer.username,
            password: smtpServer.password,
            encryption: smtpServer.encryption || "tls",
            isActive: smtpServer.isActive ?? true,
          },
        });
      }

      // Simpan Multi-Kanal Pengirim
      if (Array.isArray(channels)) {
        for (const ch of channels) {
          if (!ch.appCode) continue;
          await prisma.emailChannel.upsert({
            where: { appCode: ch.appCode },
            update: {
              appName: ch.appName,
              senderName: ch.senderName,
              senderEmail: ch.senderEmail,
              replyTo: ch.replyTo,
              isActive: ch.isActive ?? true,
            },
            create: {
              appCode: ch.appCode,
              appName: ch.appName,
              senderName: ch.senderName,
              senderEmail: ch.senderEmail,
              replyTo: ch.replyTo,
              isActive: ch.isActive ?? true,
            },
          });
        }
      }

      // Simpan Pengaturan Observability Grafana
      if (observability) {
        await prisma.observabilitySetting.upsert({
          where: { id: observability.id || 1 },
          update: {
            grafanaOtlpUrl: observability.grafanaOtlpUrl,
            grafanaAuthHeader: observability.grafanaAuthHeader,
            grafanaDashboardUrl: observability.grafanaDashboardUrl,
            isEnabled: observability.isEnabled ?? true,
          },
          create: {
            grafanaOtlpUrl: observability.grafanaOtlpUrl,
            grafanaAuthHeader: observability.grafanaAuthHeader,
            grafanaDashboardUrl: observability.grafanaDashboardUrl,
            isEnabled: observability.isEnabled ?? true,
          },
        });
      }

      return NextResponse.json({
        success: true,
        message: "Konfigurasi Server SMTP, Multi-Kanal Email, dan Grafana Cloud berhasil disimpan dan aktif!",
      });
    }

    // 2. Aksi Khusus Super Admin: Uji Coba Server SMTP Langsung
    if (payload.action === "test_smtp_connection") {
      if (!isSuperAdmin) {
        return NextResponse.json(
          { error: "Akses ditolak. Uji coba koneksi SMTP hanya dapat dilakukan oleh Super Admin." },
          { status: 403 }
        );
      }

      const targetEmail = payload.targetEmail || session.email;
      const testChannel = payload.channel || "web_karir";

      const html = generateCorporateEmailWrapper(
        "Verifikasi Koneksi Server Email - PT ITSP",
        `
        <div style="background-color: #ecfdf5; border: 1px solid #a7f3d0; border-radius: 8px; padding: 16px; margin-bottom: 20px;">
          <h3 style="color: #065f46; margin: 0 0 8px;">Koneksi Server Email Berhasil Diverifikasi!</h3>
          <p style="margin: 0; color: #047857; font-size: 14px;">Email ini mengonfirmasi bahwa konfigurasi server email resmi PT Indonesia Thai Summit Plastech telah terhubung dengan sempurna dan siap digunakan untuk pengiriman notifikasi seleksi dan publik.</p>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: 13px; color: #334155;">
          <tr><td style="padding: 8px 0; font-weight: bold; width: 160px;">Waktu Verifikasi:</td><td>${new Date().toLocaleString("id-ID", { timeZone: "Asia/Jakarta" })} WIB</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Kanal Pengirim:</td><td>${testChannel}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Tujuan Uji Coba:</td><td>${targetEmail}</td></tr>
          <tr><td style="padding: 8px 0; font-weight: bold;">Logging Engine:</td><td>Grafana Cloud (OTLP) Live Stream</td></tr>
        </table>
        `
      );

      const result = await sendMailDirect({
        to: targetEmail,
        subject: `[VERIFIKASI SERVER] Uji Coba Koneksi SMTP PT ITSP (${testChannel})`,
        html,
        channel: testChannel,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Gagal menghubungi server SMTP." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Email verifikasi koneksi SMTP berhasil dikirimkan ke: ${targetEmail}. Log pengiriman telah dialirkan ke Grafana Cloud!`,
      });
    }

    // 3. Aksi Uji Coba Kirim Preview Template (Untuk HR / Admin)
    if (payload.action === "test_email") {
      const { to, subject, bodyContent } = payload;
      const targetEmail = to || session.email;

      if (!targetEmail) {
        return NextResponse.json({ error: "Alamat email tujuan tidak boleh kosong." }, { status: 400 });
      }

      const html = generateCorporateEmailWrapper(
        subject || "Uji Coba Template Email - PT ITSP",
        bodyContent || "<p>Ini adalah pesan uji coba template email.</p>"
      );
      const result = await sendMailDirect({
        to: targetEmail,
        subject: `[PREVIEW TEMPLATE] ${subject || "Uji Coba Template Email PT ITSP"}`,
        html,
        channel: "web_karir",
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Gagal mengirim email uji coba." }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: `Email uji coba template berhasil dikirimkan ke: ${targetEmail}`,
      });
    }

    // 4. Simpan Pengaturan Umum (MCU & Lokasi Pabrik)
    const settingsData = payload.settings || payload;

    for (const [key, value] of Object.entries(settingsData)) {
      if (key === "action") continue;
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
