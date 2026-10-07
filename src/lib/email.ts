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
  // SMTP 100% via env — no host/email hardcoded in code (lihat .env.example).
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
    // Use direct configuration from Super Admin test form
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
    console.warn('[EMAIL WARNING] SMTP configuration incomplete via env (SMTP_HOST/SMTP_USER/SMTP_PASS/SMTP_FROM_EMAIL)');
    const err = 'SMTP configuration incomplete via env (SMTP_HOST / SMTP_USER / SMTP_PASS / SMTP_FROM_EMAIL kosong). Isi file .env — lihat .env.example.';
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
        rejectUnauthorized: false, // Safe for on-premise corporate mail servers such as Zimbra
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

    console.log('[EMAIL SENT] Successfully sent email to:', to, 'Message ID:', info.messageId);

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
    console.error('[EMAIL ERROR] Failed to send email to:', to, error.message);

    // Send Failed Log to Grafana Cloud (Non-blocking)
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

  // Clean up outer div wrapper if present
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
        boxHtml += renderActionButton('Go to PT ITSP Career Portal &rarr;', detectedUrl);
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
    } else if (block.startsWith('Yth. ') || block.startsWith('Dear ') || block.startsWith('Dear,')) {
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
<html xmlns="http://www.w3.org/1999/xhtml" lang="en">
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
                      <div style="font-size: 12px; color: #d1fae5; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin-top: 4px;">Integrated Recruitment System &amp; Official Career Portal</div>
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
                  This email was sent automatically by the PT ITSP Official ATS. Please do not reply directly to this address.
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

// 1. Pendaftaran Success
export function emailAccountCreated(name: string, position: string, email: string, tempPass: string, appUrl: string) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Thank you for your interest in joining <strong>PT Indonesia Thai Summit Plastech</strong> for the position of <strong>${position}</strong>.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      We have received your application. Your candidate portal account is now active — please log in to track your 7-stage selection progress:
    </p>
    
    ${renderInfoBoxTable([
      { label: 'Login Email:', value: email, isHighlight: true },
      { label: 'Temporary Password:', value: tempPass, isHighlight: true, isMono: true },
      { label: 'Applied Position:', value: position },
      { label: 'Current Stage:', value: 'Stage 1: Document & CV Screening', isBadge: true },
    ])}

    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Please access the applicant portal via the link below:
    </p>
    
    ${renderActionButton('Go to PT ITSP Career Portal &rarr;', `${appUrl}/login`)}

    <p style="margin: 16px 0 0 0; font-size: 13.5px; line-height: 1.6; color: #64748b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Please keep your login credentials confidential. We will update you on the document screening results as soon as possible.
    </p>
  `;
  return generateCorporateEmailWrapper('Application Registration Confirmation - PT ITSP', body);
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
    { label: 'Exam Subject:', value: 'Online Psychometric & Aptitude Test' },
    { label: 'Schedule:', value: scheduledAt || 'To be announced / Open on Dashboard', isHighlight: true },
    { label: 'Venue / Location:', value: location || 'PT ITSP Online Career Portal', isHighlight: true },
    { label: 'Exam Session Token:', value: examToken || 'PSIKO2026', isHighlight: true, isMono: true },
    {
      label: 'Important Notes:',
      value: 'The test button will be enabled at the scheduled time. Enter the Exam Session Token above on the portal test page.',
    },
  ];

  let mapsBtn = '';
  if (mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #018730; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Open Plant Google Maps Route &rarr;
        </a>
      </div>
    `;
  }

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Based on the qualification review and administrative verification you submitted, the Recruitment Team of <strong>PT Indonesia Thai Summit Plastech</strong> confirms that you have:
    </p>
    
    <table border="0" cellpadding="0" cellspacing="0" align="center" style="margin: 20px auto;">
      <tr>
        <td align="center" bgcolor="#dcfce7" style="background-color: #dcfce7; border: 1px solid #86efac; border-radius: 8px; padding: 12px 26px; font-weight: 700; font-size: 14.5px; color: #15803d; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
          PASSED DOCUMENT & ADMINISTRATIVE SCREENING
        </td>
      </tr>
    </table>

    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      You are now invited to proceed to <strong>Stage 2: Online Psychometric Test</strong> scheduled for:
    </p>

    ${renderInfoBoxTable(items)}
    ${mapsBtn}

    <div style="background-color: #fffbeb; border: 1px solid #fef3c7; border-left: 4px solid #f59e0b; border-radius: 6px; padding: 12px 16px; margin: 16px 0; font-size: 13px; color: #92400e; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
      <strong>⚠️ Perhatian Sistem Anti-Kecurangan:</strong> Selama ujian berlangsung, peserta dilarang keras membuka tab browser baru atau berpindah aplikasi. Sistem dilengkapi sensor proctoring otomatis yang akan menghentikan ujian jika terjadi pelanggaran berulang.
    </div>

    ${renderActionButton('Open Portal & Check Test Schedule &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Online Psychometric Test Invitation - PT ITSP', body);
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
    { label: 'Exam Subject:', value: 'Technical Competency & Field Expertise Assessment' },
    { label: 'Schedule:', value: scheduledAt || 'Per Schedule on Dashboard', isHighlight: true },
    { label: 'Venue / Location:', value: location || 'PT ITSP Online Career Portal', isHighlight: true },
    { label: 'Exam Session Token:', value: examToken || 'USER2026', isHighlight: true, isMono: true },
    { label: 'Exam Access:', value: 'Enter the User Exam Token above on the portal test page.' },
  ];

  let mapsBtn = '';
  if (mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #fc4509; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Open Plant Google Maps Route &rarr;
        </a>
      </div>
    `;
  }

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Congratulations! You have <strong>PASSED Stage 2: Online Psychometric Test</strong> for the position of <strong>${position}</strong> di PT Indonesia Thai Summit Plastech.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      You are eligible to proceed to <strong>Stage 3: Department Technical / User Test</strong>:
    </p>
    
    ${renderInfoBoxTable(items)}
    ${mapsBtn}

    ${renderActionButton('Access Technical Exam on Dashboard &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Technical / User Test Invitation - PT ITSP', body);
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
    { label: 'Schedule:', value: scheduleInfo.scheduledAt, isHighlight: true },
    {
      label: 'Interview Mode:',
      value: isOnline
        ? `VIRTUAL ONLINE (${(scheduleInfo.meetingPlatform || 'MS Teams').toUpperCase()})`
        : 'ONSITE AT COMPANY PLANT',
      isHighlight: true,
    },
  ];

  if (isOnline) {
    if (scheduleInfo.meetingLink) {
      items.push({
        label: 'Meeting Link:',
        value: `<a href="${scheduleInfo.meetingLink}" target="_blank" style="color: #018730; font-weight: bold; text-decoration: underline;">Click here to join &rarr;</a>`,
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
      items.push({ label: 'Room:', value: scheduleInfo.roomName });
    }
  }

  let mapsBtn = '';
  if (!isOnline && mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #018730; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Google Maps Directions (To Plant) &rarr;
        </a>
      </div>
    `;
  }

  const notice = isOnline
    ? `<p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.6; color: #475569; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Virtual Interview Terms:</strong> Please join 10 minutes before the scheduled time with a stable internet connection, camera on, and wearing formal attire.</p>`
    : `<p style="margin: 0 0 14px 0; font-size: 13.5px; line-height: 1.6; color: #475569; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;"><strong>Onsite Terms:</strong> Please arrive 15 minutes before the interview time, report to the plant security post with your original ID (KTP), wearing a collared formal shirt and closed shoes.</p>`;

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Congratulations! Based on the online test evaluation, the Human Capital Management Team of <strong>PT Indonesia Thai Summit Plastech</strong> invites you to attend <strong>Stage 4: HR Interview</strong>.
    </p>
    
    ${renderInfoBoxTable(items)}
    ${mapsBtn}
    ${notice}

    ${renderActionButton('Open Interview Waiting Room on Dashboard &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Official HR Interview Invitation - PT ITSP', body);
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
    { label: 'Interviewer:', value: scheduleInfo.interviewerName || 'Department Head & Related Supervisors' },
    { label: 'Interview Mode:', value: isOnline ? `VIRTUAL (${(scheduleInfo.meetingPlatform || 'MS Teams').toUpperCase()})` : 'ONSITE AT PLANT', isHighlight: true },
  ];

  if (isOnline) {
    if (scheduleInfo.meetingLink) {
      items.push({
        label: 'Meeting Link:',
        value: `<a href="${scheduleInfo.meetingLink}" target="_blank" style="color: #018730; font-weight: bold; text-decoration: underline;">Gabung Video Meeting &rarr;</a>`,
      });
    }
  } else {
    items.push({ label: 'Location:', value: scheduleInfo.locationAddress || 'PT ITSP Plant' });
    if (scheduleInfo.roomName) {
      items.push({ label: 'Room:', value: scheduleInfo.roomName });
    }
  }

  let mapsBtn = '';
  if (!isOnline && mapsUrl) {
    mapsBtn = `
      <div style="margin: 10px 0 6px 0; text-align: left;">
        <a href="${mapsUrl}" target="_blank" style="display: inline-block; background: #fc4509; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
          🗺️ Google Maps Directions (To Plant) &rarr;
        </a>
      </div>
    `;
  }

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      You have <strong>PASSED the HR Interview Stage</strong> and are invited to proceed to <strong>Stage 5: Department / User Interview</strong> with the division leadership.
    </p>
    
    ${renderInfoBoxTable(items)}
    ${mapsBtn}

    ${renderActionButton('View Details on Career Portal &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Department / User Interview Invitation - PT ITSP', body);
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
    { label: 'Partner Facility:', value: clinicName, isHighlight: true },
    { label: 'Referral Address:', value: clinicAddress },
    { label: 'Estimated Cost:', value: estimatedCost, isHighlight: true },
    { label: 'Medical Instructions:', value: instructions },
  ];

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Congratulations! You have completed the full technical interview series and are eligible to proceed to <strong>Stage 6: Medical Check-Up (MCU)</strong>.
    </p>
    
    ${renderInfoBoxTable(items)}

    <div style="margin: 10px 0 6px 0; text-align: left;">
      <a href="${clinicMapsUrl}" target="_blank" style="display: inline-block; background: #018730; color: #ffffff; text-decoration: none; padding: 8px 16px; border-radius: 6px; font-weight: 700; font-size: 13px;">
        🗺️ Open Partner Clinic / Hospital Google Maps Route &rarr;
      </a>
    </div>

    <div style="background-color: #eff6ff; border: 1px solid #bfdbfe; border-radius: 6px; padding: 14px 18px; margin: 18px 0; font-size: 13.5px; color: #1e40af; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6;">
      ℹ️ <strong>Important Note:</strong> You <em>do not need to upload any files</em> to the website. Official results will be sent directly and confidentially by the partner clinic/hospital to the PT ITSP HR Team. Your medical clearance status will be updated automatically on the applicant portal.
    </div>

    ${renderActionButton('View MCU Referral Letter on Portal &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Medical Check-Up (MCU) Referral Letter - PT ITSP', body);
}

// 7. Lolos MCU & Penerbitan Offering Letter
export function emailOfferingIssued(name: string, position: string, appUrl: string) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Based on the medical examination verification (Fit to Work) and management consideration, we are pleased to inform you that you have been declared <strong>SELECTED AS AN EMPLOYEE</strong> at <strong>PT Indonesia Thai Summit Plastech</strong>.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Official Offer Letter for the position of <strong>${position}</strong> has been issued on your candidate portal. Base salary, allowances, health benefits, and start date can be reviewed in full on the portal.
    </p>

    ${renderActionButton('Review & Accept Offer Letter &rarr;', `${appUrl}/portal/dashboard`, '#ea580c')}
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
    { label: 'Attendance Schedule:', value: signingDate, isHighlight: true },
    { label: 'Plant Location:', value: plantLocation },
    { label: 'Attire:', value: 'Formal white shirt, black trousers, and closed work shoes.' },
    {
      label: 'Required Documents:',
      value:
        'Original ID (KTP) & 2 photocopies, Tax ID (NPWP), Mandiri/BCA bank book, 3x4 photos (2 red background), original diploma & active police clearance (SKCK).',
    },
  ];

  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Thank you for accepting our official Employment Offer. Welcome to the extended family of <strong>PT Indonesia Thai Summit Plastech</strong>!
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      You are invited to our plant for the Physical Employment Contract (PKWT) signing, uniform collection & initial orientation:
    </p>
    
    ${renderInfoBoxTable(items)}

    ${renderActionButton('View Arrival Guide on Portal &rarr;', `${appUrl}/portal/dashboard`)}
  `;
  return generateCorporateEmailWrapper('Employment Contract Signing Invitation - PT ITSP', body);
}

// 9. Surat Penolakan Resmi (Bila Belum Memenuhi Syarat)
export function emailRejectionNotice(name: string, position: string, stageName: string) {
  const body = `
    <p style="margin: 0 0 16px 0; font-size: 15.5px; font-weight: 700; color: #0f172a; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Dear ${name},
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Thank you for the time, dedication, and interest you have shown throughout our employee selection process at <strong>PT Indonesia Thai Summit Plastech</strong> for the position of <strong>${position}</strong>.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      After carefully reviewing all candidate profiles at <strong>${stageName}</strong> we regret to inform you that we are unable to advance your application to the next stage at this time.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      This decision is based solely on technical profile fit and the specific requirements of the currently open position, and does not reflect your abilities or professional potential.
    </p>
    <p style="margin: 0 0 14px 0; font-size: 14px; line-height: 1.65; color: #334155; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      Your profile will remain confidentially stored in our talent pool, and we will not hesitate to contact you should a future vacancy match your qualifications.
    </p>
    <p style="margin: 16px 0 0 0; font-size: 13.5px; line-height: 1.6; color: #64748b; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      We wish you the very best in your career and professional future.
    </p>
  `;
  return generateCorporateEmailWrapper('Selection Status Notification - PT ITSP', body);
}

