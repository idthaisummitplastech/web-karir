import nodemailer from 'nodemailer';
import fs from 'fs';
import path from 'path';
import { getPlantMapsUrl } from './constants';

export interface EmailPayload {
  to: string;
  applicantName: string;
  positionTitle: string;
  subject: string;
  contentHtml: string;
}

export interface SmtpConfigOverride {
  host?: string;
  port?: number | string;
  username?: string;
  password?: string;
  encryption?: 'ssl' | 'tls' | 'none' | string;
}

export async function sendMailDirect({
  to,
  subject,
  html,
  channel = 'web_karir',
  customSmtp,
}: {
  to: string;
  subject: string;
  html: string;
  channel?: 'web_karir' | 'web_perusahaan' | string;
  customSmtp?: SmtpConfigOverride;
}): Promise<{ success: boolean; error?: string }> {
  // SMTP 100% via env — tanpa host/email hardcoded di code (lihat .env.example).
  // Ganti/rotasi cukup via env: SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS,
  // SMTP_FROM_EMAIL, SMTP_FROM_NAME, SMTP_TARGET_HOST (opsional override),
  // SMTP_TLS_SNI (opsional override SNI).
  let host = (process.env.SMTP_HOST ?? '').trim();
  let port = parseInt(process.env.SMTP_PORT || '587');
  let user = (process.env.SMTP_USER ?? '').trim() || undefined;
  let pass = process.env.SMTP_PASS;
  let encryption = 'tls';
  let senderName = (process.env.SMTP_FROM_NAME ?? '').trim() || 'PT ITSP Recruitment';
  let senderEmail = (process.env.SMTP_FROM_EMAIL ?? '').trim() || user || '';
  let replyTo = senderEmail;

  if (customSmtp && customSmtp.host && customSmtp.username) {
    // Gunakan konfigurasi langsung dari form uji coba Super Admin
    host = customSmtp.host;
    port = parseInt(String(customSmtp.port || '587'));
    user = customSmtp.username;
    pass = customSmtp.password || pass;
    encryption = customSmtp.encryption || (port === 465 ? 'ssl' : 'tls');
    senderEmail = user;
    replyTo = user;
  } else {
    // Use environment variables for SMTP configuration
  }

  const from = senderName && senderEmail ? `"${senderName}" <${senderEmail}>` : senderEmail || user || '';

  if (!host || !user || !pass || !senderEmail) {
    console.warn('[EMAIL WARNING] Konfigurasi SMTP belum lengkap via env (SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM_EMAIL)');
    const err = 'Konfigurasi SMTP belum lengkap via env (SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_FROM_EMAIL kosong). Isi file .env — lihat .env.example.';
    // Log ke Grafana
    import('./grafana').then(({ pushEmailLogToGrafana }) => {
      pushEmailLogToGrafana({
        channel,
        senderName,
        recipient: to,
        subject,
        status: 'FAILED',
        errorMessage: err,
      });
    }).catch(() => {});
    return { success: false, error: err };
  }

  try {
    const isSecure = encryption === 'ssl' || port === 465;

    let targetHost = (process.env.SMTP_TARGET_HOST ?? '').trim() || host;
    let servername: string | undefined = (process.env.SMTP_TLS_SNI ?? '').trim() || undefined;

    // Opsional override via env (mis. split-DNS kantor):
    // SMTP_TARGET_HOST + SMTP_TLS_SNI — tanpa IP/host hardcoded di code.

    const transporter = nodemailer.createTransport({
      host: targetHost,
      port,
      secure: isSecure,
      auth: {
        user,
        pass,
      },
      tls: {
        rejectUnauthorized: false, // Aman untuk mail server korporat on-premise seperti Zimbra
        servername,
      },
    });

    const logoPath = path.join(process.cwd(), 'public', 'logo-plastech.jpg');
    const attachments = fs.existsSync(logoPath)
      ? [
          {
            filename: 'logo-plastech.jpg',
            path: logoPath,
            cid: 'companylogo',
          },
        ]
      : [];

    // Konversi HTML ke Plain-Text untuk deliverability
    const plainText = html
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<\/p>/gi, '\n\n')
      .replace(/<br\s*[\/]?>/gi, '\n')
      .replace(/<\/div>/gi, '\n')
      .replace(/<\/h[1-6]>/gi, '\n\n')
      .replace(/<li[^>]*>/gi, '• ')
      .replace(/<\/li>/gi, '\n')
      .replace(/<[^>]+>/g, '')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'")
      .replace(/\n{3,}/g, '\n\n')
      .trim();

    const info = await transporter.sendMail({
      from,
      to,
      replyTo: replyTo || from,
      subject,
      text: plainText,
      html,
      attachments,
      headers: {
        'X-Mailer': 'PT ITSP Enterprise Email Engine v1.0',
        'X-Auto-Response-Suppress': 'All',
        'Auto-Submitted': 'auto-generated',
        'X-Priority': '3',
        'Importance': 'Normal',
        'List-Unsubscribe': `<mailto:${user}?subject=unsubscribe>`,
      },
    });

    console.log('[EMAIL SENT] Berhasil mengirim email ke:', to, 'Message ID:', info.messageId);

    // Kirim Log Sukses ke Grafana Cloud secara Non-blocking
    import('./grafana').then(({ pushEmailLogToGrafana }) => {
      pushEmailLogToGrafana({
        channel,
        senderName,
        recipient: to,
        subject,
        status: 'SUCCESS',
      });
    }).catch(() => {});

    return { success: true };
  } catch (error: any) {
    console.error('[EMAIL ERROR] Gagal mengirim email ke:', to, error.message);

    // Kirim Log Gagal ke Grafana Cloud secara Non-blocking
    import('./grafana').then(({ pushEmailLogToGrafana }) => {
      pushEmailLogToGrafana({
        channel,
        senderName,
        recipient: to,
        subject,
        status: 'FAILED',
        errorMessage: error.message,
      });
    }).catch(() => {});

    return { success: false, error: error.message };
  }
}

export function renderInfoBoxTable(
  items: Array<{
    label: string;
    value: string;
    isHighlight?: boolean;
    isBadge?: boolean;
    isMono?: boolean;
  }>
): string {
  const rows = items
    .map(
      (item) => `
    <tr>
      <td width="160" valign="top" style="padding: 6px 0; font-size: 13.5px; font-weight: 600; color: #475569; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${item.label}</td>
      <td valign="top" style="padding: 6px 0; font-size: 13.5px; ${
        item.isHighlight ? 'font-weight: 700; color: #0f172a;' : 'color: #1e293b;'
      } font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        ${
          item.isBadge
            ? `<span style="display: inline-block; background-color: #e0f2fe; color: #0369a1; padding: 3px 10px; border-radius: 4px; font-size: 12px; font-weight: 700;">${item.value}</span>`
            : item.isMono
            ? `<code style="font-family: Consolas, 'Courier New', monospace; background-color: #e2e8f0; color: #0f172a; padding: 3px 7px; border-radius: 4px; font-size: 13px; font-weight: bold; letter-spacing: 0.05em;">${item.value}</code>`
            : item.value
        }
      </td>
    </tr>
  `
    )
    .join('');

  return `
    <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #018730; border-radius: 6px; margin: 18px 0; border-collapse: separate;">
      <tr>
        <td style="padding: 16px 20px;">
          <table width="100%" border="0" cellpadding="0" cellspacing="0">
            ${rows}
          </table>
        </td>
      </tr>
    </table>
  `;
}

export function renderActionButton(text: string, url: string, bgColor: string = '#018730'): string {
  return `
    <table border="0" cellspacing="0" cellpadding="0" align="center" style="margin: 22px auto;">
      <tr>
        <td align="center" bgcolor="${bgColor}" style="background-color: ${bgColor}; border-radius: 6px;">
          <a href="${url}" target="_blank" style="display: inline-block; padding: 12px 28px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; font-size: 14px; font-weight: 700; color: #ffffff !important; text-decoration: none; border-radius: 6px; border: 1px solid ${bgColor};">
            ${text}
          </a>
        </td>
      </tr>
    </table>
  `;
}

export function formatCorporateEmailBody(content: string): string {
  if (!content) return '';

  // Jika sudah merupakan tabel HTML lengkap, biarkan apa adanya
  if (content.includes('<table') && (content.includes('cellpadding') || content.includes('border'))) {
    return content;
  }

  // Bersihkan pembungkus div outer jika ada
  let text = content.trim();
  const divMatch = text.match(/^<div[^>]*>([\s\S]*)<\/div>$/i);
  if (divMatch) {
    text = divMatch[1].trim();
  }

  // Normalisasi <br> ke newline untuk pemisahan blok paragraf
  text = text.replace(/<br\s*[\/]?>/gi, '\n');

  const blocks = text.split(/\n\s*\n/).map((b) => b.trim()).filter(Boolean);
  const htmlParts: string[] = [];

  for (const block of blocks) {
    const lines = block.split('\n').map((l) => l.trim()).filter(Boolean);

    // Cek apakah blok ini kumpulan poin peluru (bullet points)
    const isBulletBlock = lines.every((l) => /^([•\-\*]|[\u2022\u2023\u25E6\u2043\u2219])\s*/.test(l));

    if (isBulletBlock && lines.length > 0) {
      let rows = '';
      let detectedUrl = '';

      for (const line of lines) {
        const cleanLine = line.replace(/^([•\-\*]|[\u2022\u2023\u25E6\u2043\u2219])\s*/, '');
        const colonIdx = cleanLine.indexOf(':');

        if (colonIdx > -1) {
          const label = cleanLine.substring(0, colonIdx + 1).trim();
          const val = cleanLine.substring(colonIdx + 1).trim();

          const urlMatch = val.match(/(https?:\/\/[^\s]+)/);
          let valHtml = val;
          if (urlMatch) {
            detectedUrl = urlMatch[1];
            valHtml = `<a href="${urlMatch[1]}" target="_blank" style="color: #018730; font-weight: 700; text-decoration: underline;">${urlMatch[1]}</a>`;
          }

          const isPassword = /password/i.test(label);

          rows += `
            <tr>
              <td width="160" valign="top" style="padding: 6px 0; font-size: 13.5px; font-weight: 600; color: #475569; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">${label}</td>
              <td valign="top" style="padding: 6px 0; font-size: 13.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                ${isPassword ? `<code style="font-family: Consolas, 'Courier New', monospace; background-color: #e2e8f0; color: #0f172a; padding: 2px 6px; border-radius: 4px; font-size: 13px;">${val}</code>` : valHtml}
              </td>
            </tr>
          `;
        } else {
          rows += `
            <tr>
              <td colspan="2" valign="top" style="padding: 5px 0; font-size: 13.5px; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">• ${cleanLine}</td>
            </tr>
          `;
        }
      }

      let boxHtml = `
        <table width="100%" border="0" cellpadding="0" cellspacing="0" bgcolor="#f8fafc" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-left: 4px solid #018730; border-radius: 6px; margin: 18px 0; border-collapse: separate;">
          <tr>
            <td style="padding: 16px 20px;">
              <table width="100%" border="0" cellpadding="0" cellspacing="0">
                ${rows}
              </table>
            </td>
          </tr>
        </table>
      `;

      if (detectedUrl) {
        boxHtml += renderActionButton('Masuk ke Portal Karir PT ITSP &rarr;', detectedUrl);
      }

      htmlParts.push(boxHtml);
    } else if (/LOLOS TAHAP/i.test(block)) {
      htmlParts.push(`
        <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 20px auto;">
          <tr>
            <td align="center" bgcolor="#dcfce7" style="background-color: #dcfce7; border: 1px solid #86efac; border-radius: 6px; padding: 12px 26px; font-weight: 700; font-size: 14.5px; color: #15803d; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
              ${block}
            </td>
          </tr>
        </table>
      `);
    } else if (block.startsWith('Yth. ')) {
      htmlParts.push(`
        <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          ${block}
        </p>
      `);
    } else {
      const formattedBlock = lines.join('<br />');
      htmlParts.push(`
        <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          ${formattedBlock}
        </p>
      `);
    }
  }

  return htmlParts.join('\n');
}

export function generateCorporateEmailWrapper(title: string, bodyContent: string): string {
  const formattedContent = formatCorporateEmailBody(bodyContent);

  return `<!DOCTYPE html PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml" lang="id">
<head>
  <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta name="format-detection" content="telephone=no" />
  <title>${title}</title>
  <!--[if mso]>
  <style type="text/css">
    body, table, td, p, a, li, blockquote { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif !important; }
  </style>
  <![endif]-->
</head>
<body style="margin: 0; padding: 20px 0; background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; -webkit-font-smoothing: antialiased; -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%;">
  <center>
    <table border="0" cellpadding="0" cellspacing="0" width="100%" bgcolor="#f1f5f9" style="background-color: #f1f5f9; table-layout: fixed;">
      <tr>
        <td align="center" style="padding: 10px 16px;">
          <!--[if (gte mso 9)|(IE)]>
          <table align="center" border="0" cellspacing="0" cellpadding="0" width="620">
          <tr>
          <td align="center" valign="top" width="620">
          <![endif]-->
          <table border="0" cellpadding="0" cellspacing="0" width="100%" style="max-width: 620px; background-color: #ffffff; border-radius: 8px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 14px rgba(0,0,0,0.06); border-collapse: separate;">
            <!-- CORPORATE HEADER -->
            <tr>
              <td bgcolor="#018730" style="background-color: #018730; border-bottom: 4px solid #fc4509; padding: 22px 28px;">
                <table width="100%" border="0" cellpadding="0" cellspacing="0">
                  <tr>
                    <td valign="middle" align="left" style="text-align: left;">
                      <div style="font-size: 11px; text-transform: uppercase; letter-spacing: 0.1em; color: #fed7aa; font-weight: 700; margin-bottom: 4px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">Human Capital Management</div>
                      <div style="font-size: 18px; font-weight: 800; color: #ffffff; line-height: 1.25; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; letter-spacing: -0.01em;">PT INDONESIA THAI SUMMIT PLASTECH</div>
                      <div style="font-size: 12px; color: #d1fae5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin-top: 4px;">Sistem Rekrutmen Terpadu &amp; Portal Karir Resmi</div>
                    </td>
                    <td valign="middle" align="right" width="70" style="width: 70px; text-align: right; padding-left: 15px;">
                      <table border="0" cellpadding="0" cellspacing="0" align="right" style="border-collapse: collapse;">
                        <tr>
                          <td align="center" bgcolor="#ffffff" style="background-color: #ffffff; padding: 5px; border-radius: 8px;">
                            <img src="cid:companylogo" alt="PT ITSP" width="56" height="56" border="0" style="display: block; width: 56px; height: 56px; max-width: 56px; outline: none; text-decoration: none; -ms-interpolation-mode: bicubic;" />
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- CORPORATE CONTENT -->
            <tr>
              <td bgcolor="#ffffff" style="background-color: #ffffff; padding: 32px 28px; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
                ${formattedContent}
              </td>
            </tr>

            <!-- CORPORATE FOOTER -->
            <tr>
              <td bgcolor="#0f172a" style="background-color: #0f172a; padding: 22px 28px; text-align: center; color: #94a3b8; font-size: 12px; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
                <strong style="color: #ffffff; font-size: 13px;">PT Indonesia Thai Summit Plastech (Thai Summit Group)</strong><br />
                Plant 1: Kawasan Industri KIIC, Lot FF-3, Karawang Barat 41361<br />
                Plant 2: Greenland International Industrial Center (GIIC), Deltamas, Cikarang Pusat 17530<br />
                <div style="margin-top: 10px; color: #64748b; font-size: 11px;">
                  Email ini dikirimkan otomatis oleh Sistem ATS Resmi PT ITSP. Mohon tidak membalas langsung ke alamat email ini.
                </div>
              </td>
            </tr>
          </table>
          <!--[if (gte mso 9)|(IE)]>
          </td>
          </tr>
          </table>
          <![endif]-->
        </td>
      </tr>
    </table>
  </center>
</body>
</html>`;
}

// 1. Pendaftaran Berhasil
export function emailAccountCreated(name: string, position: string, email: string, tempPass: string, appUrl: string) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Terima kasih atas minat dan antusiasme Anda untuk bergabung dengan <strong>PT Indonesia Thai Summit Plastech</strong> untuk posisi <strong>${position}</strong>.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Berkas lamaran Anda telah kami terima dalam sistem. Akun portal kandidat Anda telah aktif, silakan login untuk memantau status perkembangan seleksi 7 tahap Anda secara langsung:
    </p>
    
    ${renderInfoBoxTable([
      { label: 'Email Login:', value: email, isHighlight: true },
      { label: 'Password Sementara:', value: tempPass, isHighlight: true, isMono: true },
      { label: 'Posisi Dilamar:', value: position },
      { label: 'Tahap Saat Ini:', value: 'Tahap 1: Screening Dokumen & CV', isBadge: true },
    ])}

    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Silakan akses portal pelamar menggunakan tautan di bawah ini:
    </p>
    
    ${renderActionButton('Masuk ke Portal Karir PT ITSP &rarr;', `${appUrl}/login`)}

    <p style="margin: 16px 0 0 0; font-size: 13.5px; line-height: 1.6; color: #64748b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Mohon jaga kerahasiaan kredensial login Anda. Informasi hasil screening berkas akan kami perbarui sesegera mungkin.
    </p>
  `;
  return generateCorporateEmailWrapper('Konfirmasi Pendaftaran Lamaran - PT ITSP', body);
}

// 2. Lolos Screening Dokumen & Undangan Psikotes
export function emailScreeningPassed(
  name: string,
  position: string,
  scheduledAt: string,
  appUrl: string,
  location?: string,
  customMapsUrl?: string,
  examToken?: string
) {
  const mapsUrl = customMapsUrl || getPlantMapsUrl(location);
  const items = [
    { label: 'Mata Ujian:', value: 'Tes Psikotes & Potensi Akademik Online' },
    { label: 'Jadwal Pelaksanaan:', value: scheduledAt || 'Akan diumumkan / Terbuka di Dashboard', isHighlight: true },
    { label: 'Tempat / Lokasi:', value: location || 'Portal Karir Online PT ITSP', isHighlight: true },
    { label: 'Token Sesi Ujian:', value: examToken || 'PSIKO2026', isHighlight: true, isMono: true },
    {
      label: 'Ketentuan Khusus:',
      value: 'Tombol tes akan aktif pada jadwal yang ditentukan. Masukkan Token Sesi Ujian di atas pada halaman ujian portal.',
    },
  ];

  let mapsBtn = '';
  if (mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #018730; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Buka Rute Google Maps Pabrik &rarr;
        </a>
      </div>
    `;
  }

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Berdasarkan hasil evaluasi kualifikasi dan verifikasi berkas administrasi yang Anda kirimkan, Tim Rekrutmen <strong>PT Indonesia Thai Summit Plastech</strong> menyatakan bahwa Anda:
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 20px auto;">
      <tr>
        <td align="center" bgcolor="#dcfce7" style="background-color: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 12px 26px; font-weight: 700; font-size: 14.5px; color: #15803d; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          LOLOS TAHAP SCREENING DOKUMEN & ADMINISTRASI
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Selanjutnya, Anda diundang untuk mengikuti <strong>Tahap 2: Tes Psikotes Online</strong> yang akan dilaksanakan pada:
    </p>

    ${renderInfoBoxTable(items)}
    ${mapsBtn}

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #92400e; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
      <strong>⚠️ Perhatian Sistem Anti-Kecurangan:</strong> Selama ujian berlangsung, peserta dilarang keras membuka tab browser baru atau berpindah aplikasi. Sistem dilengkapi sensor proctoring otomatis yang akan menghentikan ujian jika terjadi pelanggaran berulang.
    </div>

    ${renderActionButton('Buka Portal & Cek Jadwal Tes &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Undangan Tes Psikotes Online - PT ITSP', body);
}

// 3. Lolos Psikotes & Undangan Tes User / Teknis
export function emailPsikotesPassed(
  name: string,
  position: string,
  scheduledAt: string,
  appUrl: string,
  location?: string,
  customMapsUrl?: string,
  examToken?: string
) {
  const mapsUrl = customMapsUrl || getPlantMapsUrl(location);
  const items = [
    { label: 'Materi Ujian:', value: 'Uji Kompetensi Teknis & Keahlian Bidang' },
    { label: 'Jadwal Pelaksanaan:', value: scheduledAt || 'Sesuai Jadwal di Dashboard', isHighlight: true },
    { label: 'Tempat / Lokasi:', value: location || 'Portal Karir Online PT ITSP', isHighlight: true },
    { label: 'Token Sesi Ujian:', value: examToken || 'USER2026', isHighlight: true, isMono: true },
    { label: 'Akses Ujian:', value: 'Masukkan Token Ujian User di atas pada halaman ujian portal.' },
  ];

  let mapsBtn = '';
  if (mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #fc4509; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Buka Rute Google Maps Pabrik &rarr;
        </a>
      </div>
    `;
  }

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Selamat! Anda dinyatakan <strong>LOLOS Tahap 2: Tes Psikotes Online</strong> untuk posisi <strong>${position}</strong> di PT Indonesia Thai Summit Plastech.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Anda berhak melanjutkan ke <strong>Tahap 3: Tes Teknis / User Test Departemen</strong>:
    </p>
    
    ${renderInfoBoxTable(items)}
    ${mapsBtn}

    ${renderActionButton('Akses Ujian Teknis di Dashboard &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Undangan Tes Teknis / User Test - PT ITSP', body);
}

// 4. Undangan Interview HR (Teams / Zoom / Onsite)
export function emailHrInterviewInvite(
  name: string,
  position: string,
  scheduleInfo: {
    scheduledAt: string;
    locationMode: string;
    meetingPlatform?: string;
    meetingLink?: string;
    meetingPasscode?: string;
    locationAddress?: string;
    mapsUrl?: string;
    roomName?: string;
    notes?: string;
  },
  appUrl: string
) {
  const isOnline = scheduleInfo.locationMode === 'online';
  const mapsUrl = scheduleInfo.mapsUrl || getPlantMapsUrl(scheduleInfo.locationAddress);

  const items: Array<{ label: string; value: string; isHighlight?: boolean; isMono?: boolean }> = [
    { label: 'Posisi:', value: position },
    { label: 'Jadwal Waktu:', value: scheduleInfo.scheduledAt, isHighlight: true },
    {
      label: 'Mode Interview:',
      value: isOnline
        ? `VIRTUAL ONLINE (${(scheduleInfo.meetingPlatform || 'MS Teams').toUpperCase()})`
        : 'ONSITE DI PABRIK PERUSAHAAN',
      isHighlight: true,
    },
  ];

  if (isOnline) {
    if (scheduleInfo.meetingLink) {
      items.push({
        label: 'Tautan Meeting:',
        value: `<a href="${scheduleInfo.meetingLink}" target="_blank" style="color: #018730; font-weight: bold; text-decoration: underline;">Klik di sini untuk bergabung &rarr;</a>`,
      });
    }
    if (scheduleInfo.meetingPasscode) {
      items.push({ label: 'Passcode / PIN:', value: scheduleInfo.meetingPasscode, isMono: true });
    }
  } else {
    items.push({
      label: 'Alamat Pabrik:',
      value: scheduleInfo.locationAddress || 'Kawasan Industri KIIC, Lot FF-3, Karawang Barat',
    });
    if (scheduleInfo.roomName) {
      items.push({ label: 'Ruangan:', value: scheduleInfo.roomName });
    }
  }

  let mapsBtn = '';
  if (!isOnline && mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #018730; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Petunjuk Arah Google Maps (Menuju Pabrik) &rarr;
        </a>
      </div>
    `;
  }

  const notice = isOnline
    ? `<p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.6; color: #475569; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Ketentuan Virtual Interview:</strong> Mohon bergabung 10 menit sebelum jadwal dimulai, menggunakan koneksi internet stabil, kamera aktif (On-Camera), serta mengenakan kemeja formal rapi.</p>`
    : `<p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.6; color: #475569; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Ketentuan Onsite:</strong> Mohon hadir 15 menit sebelum waktu interview, melapor ke pos security pabrik dengan menunjukkan KTP asli, mengenakan pakaian kemeja formal berkerah dan sepatu tertutup.</p>`;

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Selamat! Berdasarkan hasil evaluasi tes online, Tim Human Capital Management <strong>PT Indonesia Thai Summit Plastech</strong> mengundang Anda untuk mengikuti <strong>Tahap 4: Interview HR (Wawancara SDM)</strong>.
    </p>
    
    ${renderInfoBoxTable(items)}
    ${mapsBtn}
    ${notice}

    ${renderActionButton('Buka Ruang Tunggu Interview di Dashboard &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Undangan Resmi Interview HR - PT ITSP', body);
}

// 5. Undangan Interview User Departemen
export function emailUserInterviewInvite(
  name: string,
  position: string,
  scheduleInfo: {
    scheduledAt: string;
    locationMode: string;
    interviewerName?: string;
    meetingPlatform?: string;
    meetingLink?: string;
    meetingPasscode?: string;
    locationAddress?: string;
    mapsUrl?: string;
    roomName?: string;
  },
  appUrl: string
) {
  const isOnline = scheduleInfo.locationMode === 'online';
  const mapsUrl = scheduleInfo.mapsUrl || getPlantMapsUrl(scheduleInfo.locationAddress);

  const items: Array<{ label: string; value: string; isHighlight?: boolean }> = [
    { label: 'Posisi:', value: position },
    { label: 'Waktu Pelaksanaan:', value: scheduleInfo.scheduledAt, isHighlight: true },
    { label: 'Pewawancara:', value: scheduleInfo.interviewerName || 'Tim Kepala Departemen & Supervisor Terkait' },
    { label: 'Mode Interview:', value: isOnline ? `VIRTUAL (${(scheduleInfo.meetingPlatform || 'MS Teams').toUpperCase()})` : 'ONSITE DI PABRIK', isHighlight: true },
  ];

  if (isOnline) {
    if (scheduleInfo.meetingLink) {
      items.push({
        label: 'Tautan Meeting:',
        value: `<a href="${scheduleInfo.meetingLink}" target="_blank" style="color: #018730; font-weight: bold; text-decoration: underline;">Gabung Video Meeting &rarr;</a>`,
      });
    }
  } else {
    items.push({ label: 'Lokasi:', value: scheduleInfo.locationAddress || 'Pabrik PT ITSP' });
    if (scheduleInfo.roomName) {
      items.push({ label: 'Ruangan:', value: scheduleInfo.roomName });
    }
  }

  let mapsBtn = '';
  if (!isOnline && mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #fc4509; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Petunjuk Arah Google Maps (Menuju Pabrik) &rarr;
        </a>
      </div>
    `;
  }

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Anda dinyatakan <strong>LOLOS Tahap Interview HR</strong> dan diundang untuk melanjutkan ke <strong>Tahap 5: Interview User / Departemen Terkait</strong> bersama jajaran pimpinan divisi.
    </p>
    
    ${renderInfoBoxTable(items)}
    ${mapsBtn}

    ${renderActionButton('Lihat Rincian di Portal Karir &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Undangan Interview User / Departemen - PT ITSP', body);
}

// 6. Rujukan Medical Check-Up (MCU) Rekanan
export function emailMcuReferral(
  name: string,
  position: string,
  clinicName: string,
  clinicAddress: string,
  estimatedCost: string,
  instructions: string,
  appUrl: string,
  customClinicMapsUrl?: string
) {
  const clinicMapsUrl =
    customClinicMapsUrl ||
    getPlantMapsUrl(clinicAddress) ||
    getPlantMapsUrl(clinicName) ||
    'https://maps.google.com/?q=Klinik+Kimia+Farma+Galuh+Mas+Karawang';

  const items = [
    { label: 'Fasilitas Rekanan:', value: clinicName, isHighlight: true },
    { label: 'Alamat Rujukan:', value: clinicAddress },
    { label: 'Estimasi Biaya:', value: estimatedCost, isHighlight: true },
    { label: 'Petunjuk Medis:', value: instructions },
  ];

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Selamat! Anda telah menyelesaikan seluruh rangkaian wawancara teknis dan dinyatakan berhak melanjutkan ke <strong>Tahap 6: Pemeriksaan Kesehatan Medis (Medical Check-Up / MCU)</strong>.
    </p>
    
    ${renderInfoBoxTable(items)}

    <div style="margin: 10px 0 6px 0; text-align: left;">
      <a href="${clinicMapsUrl}" target="_blank" style="display: inline-block; background: #018730; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
        🗺️ Buka Rute Google Maps Klinik / RS Rekanan &rarr;
      </a>
    </div>

    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 14px 18px; margin: 18px 0; font-size: 13.5px; color: #1e40af; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
      ℹ️ <strong>Catatan Penting:</strong> Anda <em>tidak perlu mengunggah berkas apa pun</em> ke website. Hasil pemeriksaan resmi akan dikirimkan secara langsung dan rahasia oleh pihak klinik/RS rekanan kepada Tim HR PT ITSP. Status kelolosan medis Anda akan diperbarui otomatis di portal pelamar.
    </div>

    ${renderActionButton('Lihat Surat Pengantar MCU di Portal &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Surat Pengantar Medical Check-Up (MCU) - PT ITSP', body);
}

// 7. Lolos MCU & Penerbitan Offering Letter
export function emailOfferingIssued(name: string, position: string, appUrl: string) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Berdasarkan hasil verifikasi pemeriksaan medis (Fit to Work) dan pertimbangan manajemen, kami dengan bangga menginformasikan bahwa Anda dinyatakan <strong>LOLOS SELEKSI PENERIMAAN KARYAWAN</strong> di <strong>PT Indonesia Thai Summit Plastech</strong>.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Surat Penawaran Resmi (<strong>Offering Letter</strong>) untuk posisi <strong>${position}</strong> telah diterbitkan di portal kandidat Anda. Rincian gaji pokok, tunjangan, benefit kesehatan, dan tanggal mulai kerja dapat Anda tinjau secara lengkap di portal.
    </p>

    ${renderActionButton('Tinjau & Setujui Offering Letter &rarr;', `${appUrl}/portal/dashboard`, '#ea580c')}
  `;
  return generateCorporateEmailWrapper('Resmi: Penawaran Kerja (Offering Letter) - PT ITSP', body);
}

// 8. Undangan Tanda Tangan Kontrak Fisik
export function emailContractSigningInvite(
  name: string,
  position: string,
  signingDate: string,
  plantLocation: string,
  appUrl: string
) {
  const items = [
    { label: 'Jadwal Kehadiran:', value: signingDate, isHighlight: true },
    { label: 'Lokasi Pabrik:', value: plantLocation },
    { label: 'Pakaian:', value: 'Kemeja putih formal, celana panjang hitam bahan, dan sepatu kerja tertutup.' },
    {
      label: 'Dokumen Wajib:',
      value:
        'KTP asli & fotokopi 2 lbr, NPWP, Buku Rekening Mandiri/BCA, Pasfoto 3x4 (2 lembar latar merah), Ijazah asli & SKCK aktif.',
    },
  ];

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Terima kasih atas persetujuan Anda terhadap Surat Penawaran Kerja resmi kami. Selamat datang di keluarga besar <strong>PT Indonesia Thai Summit Plastech</strong>!
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Anda diundang untuk hadir ke pabrik kami guna penandatanganan Kontrak Kerja Fisik (PKWT) serta pengambilan seragam & orientasi kerja awal:
    </p>
    
    ${renderInfoBoxTable(items)}

    ${renderActionButton('Lihat Panduan Kedatangan di Portal &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Undangan Penandatanganan Kontrak Kerja - PT ITSP', body);
}

// 9. Surat Penolakan Resmi (Bila Belum Memenuhi Syarat)
export function emailRejectionNotice(name: string, position: string, stageName: string) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Yth. Sdr/i. ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Terima kasih banyak atas waktu, dedikasi, serta minat yang Anda tunjukkan dalam mengikuti proses seleksi penerimaan karyawan di <strong>PT Indonesia Thai Summit Plastech</strong> untuk posisi <strong>${position}</strong>.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Setelah mempertimbangkan secara seksama profil seluruh kandidat pada <strong>${stageName}</strong>, kami menginformasikan bahwa untuk saat ini kami belum dapat melanjutkan proses lamaran Anda ke tahapan berikutnya.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Keputusan ini murni didasarkan pada kesesuaian profil teknis dan kebutuhan spesifik posisi yang saat ini dibuka, dan bukan merupakan refleksi dari kemampuan serta potensi Anda sebagai profesional.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Data profil Anda akan tetap tersimpan secara rahasia dalam basis data talenta (<em>Talent Pool</em>) kami, dan kami tidak akan ragu untuk menghubungi Anda kembali apabila terdapat lowongan lain di masa mendatang yang sesuai dengan kualifikasi Anda.
    </p>
    <p style="margin: 16px 0 0 0; font-size: 13.5px; line-height: 1.6; color: #64748b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Kami mendoakan yang terbaik bagi kesuksesan karir dan masa depan profesional Anda.
    </p>
  `;
  return generateCorporateEmailWrapper('Pemberitahuan Status Seleksi - PT ITSP', body);
}

