export interface EmailLogPayload {
  channel: 'web_karir' | 'web_perusahaan' | string;
  senderName: string;
  recipient: string;
  subject: string;
  status: 'SUCCESS' | 'FAILED';
  errorMessage?: string;
}

const DEFAULT_OTLP_URL = process.env.GRAFANA_OTLP_URL || 'https://otlp-gateway-prod-ap-southeast-2.grafana.net/otlp/v1/logs';
const DEFAULT_AUTH_HEADER = process.env.GRAFANA_AUTH_HEADER || 'Basic MTgyMTkyOTpnbGNfZXlKdklqb2lNVGt3TXpRM01DSXNJbTRpT2lKcGRITndMV1Z0WVdsc0xXeHZaM01pTENKcklqb2lRMVp0VWt0Vk1VazFaVE0wT0RjMk1tVjFVM3B3VURrMUlpd2liU0k2ZXlKeUlqb2ljSEp2WkMxaGNDMXpiM1YwYUdWaGMzUXRNaUo5ZlE9PQ==';

/**
 * Kirim log pengiriman email secara asinkron (Non-Blocking) ke Grafana Cloud Loki via OTLP Gateway.
 * Tidak membebani database dan log otomatis terhapus setelah 30 hari di Grafana.
 */
export async function pushEmailLogToGrafana(log: EmailLogPayload): Promise<void> {
  try {
    const otlpUrl = DEFAULT_OTLP_URL;
    const authHeader = DEFAULT_AUTH_HEADER;

    const timestampNano = (BigInt(Date.now()) * BigInt(1_000_000)).toString();

    const bodyText = log.status === 'SUCCESS'
      ? `[EMAIL SUCCESS] Terkirim ke ${log.recipient} | Subjek: "${log.subject}" | Kanal: ${log.channel} (${log.senderName})`
      : `[EMAIL FAILED] Gagal ke ${log.recipient} | Subjek: "${log.subject}" | Error: ${log.errorMessage || 'Unknown Error'}`;

    const otlpPayload = {
      resourceLogs: [
        {
          resource: {
            attributes: [
              { key: 'service.name', value: { stringValue: 'pt-itsp-ats-service' } },
              { key: 'deployment.environment', value: { stringValue: 'production' } },
              { key: 'app.name', value: { stringValue: 'PT Indonesia Thai Summit Plastech' } },
            ],
          },
          scopeLogs: [
            {
              scope: { name: 'email-delivery-engine' },
              logRecords: [
                {
                  timeUnixNano: timestampNano,
                  severityNumber: log.status === 'SUCCESS' ? 9 : 17, // 9 = INFO, 17 = ERROR
                  severityText: log.status === 'SUCCESS' ? 'INFO' : 'ERROR',
                  body: { stringValue: bodyText },
                  attributes: [
                    { key: 'channel', value: { stringValue: log.channel } },
                    { key: 'sender_name', value: { stringValue: log.senderName } },
                    { key: 'recipient', value: { stringValue: log.recipient } },
                    { key: 'subject', value: { stringValue: log.subject } },
                    { key: 'status', value: { stringValue: log.status } },
                    ...(log.errorMessage ? [{ key: 'error_message', value: { stringValue: log.errorMessage } }] : []),
                  ],
                },
              ],
            },
          ],
        },
      ],
    };

    // Kirim HTTP POST ke OTLP Gateway Grafana Cloud
    await fetch(otlpUrl, {
      method: 'POST',
      headers: {
        Authorization: authHeader,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(otlpPayload),
    });
  } catch (error) {
    // Fail-safe: Log error lokal tanpa mengganggu alur sistem
    console.error('[GRAFANA LOGGING ERROR]', error);
  }
}
