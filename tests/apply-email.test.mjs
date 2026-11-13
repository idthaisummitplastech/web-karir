/**
 * Tes helper B3 — outcome email lamaran (tanpa SMTP nyata, tanpa jaringan).
 * Jalankan: node --experimental-strip-types --test tests/apply-email.test.mjs
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import {
  awaitEmailDelivery,
  EMAIL_FAILED_APPLICANT_MESSAGE,
} from '../src/lib/apply-email.ts';

test('email sukses -> sent true', async () => {
  const outcome = await awaitEmailDelivery(async () => ({ success: true }));
  assert.deepEqual(outcome, { sent: true });
});

test('sendMailDirect mengembalikan {success:false} -> sent false dengan error', async () => {
  const outcome = await awaitEmailDelivery(async () => ({ success: false, error: 'SMTP auth failed' }));
  assert.equal(outcome.sent, false);
  assert.equal(outcome.error, 'SMTP auth failed');
});

test('sendMailDirect melempar -> tidak crash, sent false', async () => {
  const outcome = await awaitEmailDelivery(async () => {
    throw new Error('connection refused');
  });
  assert.equal(outcome.sent, false);
  assert.match(outcome.error, /connection refused/);
});

test('SMTP lambat melebihi timeout -> sent false, timedOut true', async () => {
  const started = Date.now();
  const outcome = await awaitEmailDelivery(
    () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 500)),
    50
  );
  assert.equal(outcome.sent, false);
  assert.equal(outcome.timedOut, true);
  assert.ok(Date.now() - started < 400, 'tidak boleh menunggu SMTP lambat');
});

test('pesan pelamar saat gagal bersifat netral', () => {
  assert.match(EMAIL_FAILED_APPLICANT_MESSAGE, /Pendaftaran berhasil/);
  assert.match(EMAIL_FAILED_APPLICANT_MESSAGE, /hubungi HR/);
});
