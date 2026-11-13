/**
 * Helper pengiriman email konfirmasi lamaran (B3).
 *
 * sendMailDirect() mengembalikan { success: false } alih-alih melempar error,
 * sehingga .catch() pada pemanggil lama tidak pernah menangkap kegagalan SMTP.
 * Helper ini menunggu hasil nyata dengan batas waktu agar respons API tidak
 * tertahan lama ketika server SMTP lambat.
 */

export interface MailDeliveryResult {
  success: boolean;
  error?: string;
}

export interface ApplicationEmailOutcome {
  sent: boolean;
  error?: string;
  timedOut?: boolean;
}

export const DEFAULT_EMAIL_TIMEOUT_MS = 5000;

/**
 * Tunggu hasil pengiriman email dengan timeout. Tidak pernah melempar.
 * Kegagalan/timeout dikembalikan sebagai { sent: false, error }.
 */
export async function awaitEmailDelivery(
  send: () => Promise<MailDeliveryResult>,
  timeoutMs: number = DEFAULT_EMAIL_TIMEOUT_MS
): Promise<ApplicationEmailOutcome> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    const timeout = new Promise<ApplicationEmailOutcome>((resolve) => {
      timer = setTimeout(
        () => resolve({ sent: false, error: 'timeout', timedOut: true }),
        timeoutMs
      );
    });

    const delivery = send()
      .then((result): ApplicationEmailOutcome =>
        result && result.success
          ? { sent: true }
          : { sent: false, error: result?.error || 'unknown_error' }
      )
      .catch((err: any): ApplicationEmailOutcome => ({
        sent: false,
        error: err?.message || 'send_failed',
      }));

    return await Promise.race([delivery, timeout]);
  } finally {
    if (timer) clearTimeout(timer);
  }
}

/** Pesan netral untuk pelamar ketika email konfirmasi gagal terkirim. */
export const EMAIL_FAILED_APPLICANT_MESSAGE =
  'Pendaftaran berhasil, email konfirmasi belum terkirim. Silakan hubungi HR.';
