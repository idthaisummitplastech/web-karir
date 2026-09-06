'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  Chip,
} from '@mui/material';
import {
  Security as SecurityIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

function MfaContent() {
  const searchParams = useSearchParams();
  const isFirstTime = searchParams?.get('setup') === 'first-time';

  const [loading, setLoading] = useState(true);
  const [qrCodeUrl, setQrCodeUrl] = useState('');
  const [secretKey, setSecretKey] = useState('');
  const [isMfaEnabled, setIsMfaEnabled] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [processing, setProcessing] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchMfaSetup = () => {
    setLoading(true);
    fetch('/api/auth/mfa/setup')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setQrCodeUrl(data.qrCodeDataUrl);
          setSecretKey(data.secret);
          setIsMfaEnabled(data.isMfaEnabled);
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchMfaSetup();
  }, []);

  const handleVerify = async (enable: boolean) => {
    if (enable && !verificationCode.trim()) {
      setMessage({ type: 'error', text: 'Masukkan 6-digit kode verifikasi.' });
      return;
    }

    setProcessing(true);
    setMessage(null);

    try {
      const res = await fetch('/api/auth/mfa/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: verificationCode, enable }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      setMessage({ type: 'success', text: data.message });
      setIsMfaEnabled(enable);
      setVerificationCode('');
    } catch (err: any) {
      setMessage({ type: 'error', text: err.message });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <CircularProgress sx={{ color: '#018730' }} />
      </Box>
    );
  }

  return (
    <Box sx={{ maxWidth: 900 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em' }}>
          Keamanan Akun: Multi-Factor Authentication (MFA)
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Lindungi akun HR & User Departemen Anda menggunakan verifikasi 2 langkah berbasis waktu (TOTP) melalui Google Authenticator atau Microsoft Authenticator.
        </Typography>
      </Box>

      {isFirstTime && !isMfaEnabled && (
        <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
          <strong>Aktivasi MFA Wajib (Login Pertama):</strong> Demi keamanan integritas data seleksi dan pelamar, Anda diminta mengaktifkan Autentikasi Dua Langkah (Google Authenticator) di bawah ini sebelum melanjutkan ke menu lain.
        </Alert>
      )}

      {message && (
        <Alert severity={message.type} sx={{ mb: 3, borderRadius: 2 }}>
          {message.text}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid #CBD5E1', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <SecurityIcon sx={{ color: '#4ADE80' }} />
            <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17 }}>
              Status MFA: {isMfaEnabled ? 'AKTIF (TERLINDUNGI)' : 'BELUM AKTIF'}
            </Typography>
          </Box>
          <Chip
            label={isMfaEnabled ? 'TERLINDUNGI TOTP' : 'TIDAK AKTIF'}
            sx={{
              bgcolor: isMfaEnabled ? '#DCFCE7' : '#FEE2E2',
              color: isMfaEnabled ? '#15803D' : '#991B1B',
              fontWeight: 800,
            }}
          />
        </Box>

        <CardContent sx={{ p: 4 }}>
          {isMfaEnabled ? (
            <Box sx={{ textAlign: 'center', py: 3 }}>
              <CheckCircleIcon sx={{ fontSize: 64, color: '#16A34A', mb: 2 }} />
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                Akun Anda Telah Dilindungi MFA!
              </Typography>
              <Typography variant="body2" sx={{ color: '#64748B', maxWidth: 480, mx: 'auto', mb: 3 }}>
                Setiap kali login, Anda akan diminta memasukkan 6-digit kode verifikasi dari aplikasi Google Authenticator / Microsoft Authenticator di ponsel Anda.
              </Typography>
              <Button
                variant="outlined"
                color="error"
                disabled={processing}
                onClick={() => handleVerify(false)}
                sx={{ fontWeight: 700 }}
              >
                Nonaktifkan MFA
              </Button>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1.5fr' },
                gap: 4,
                alignItems: 'center',
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Box sx={{ p: 2, bgcolor: '#FFFFFF', borderRadius: 2, border: '1.5px solid #CBD5E1', display: 'inline-block' }}>
                  {qrCodeUrl ? (
                    <img src={qrCodeUrl} alt="MFA QR Code" style={{ width: 180, height: 180, display: 'block' }} />
                  ) : (
                    <CircularProgress size={40} />
                  )}
                </Box>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 1 }}>
                  Pindai menggunakan Google Authenticator
                </Typography>
              </Box>

              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1 }}>
                  Langkah-Langkah Aktivasi:
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>
                  1. Buka aplikasi <strong>Google Authenticator</strong> atau <strong>Microsoft Authenticator</strong> di HP Anda.
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mb: 1 }}>
                  2. Pilih ikon tambah (+), lalu pilih <strong>Pindai Kode QR</strong> di sebelah kiri.
                </Typography>
                <Typography variant="body2" sx={{ color: '#475569', mb: 2 }}>
                  3. Masukkan 6-digit kode yang muncul di aplikasi ke kolom di bawah:
                </Typography>

                <Box sx={{ mb: 2.5 }}>
                  <TextField
                    fullWidth
                    placeholder="Contoh: 123456"
                    value={verificationCode}
                    onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    slotProps={{
                      htmlInput: {
                        style: { textAlign: 'center', fontSize: 22, letterSpacing: '0.3em', fontWeight: 800 }
                      }
                    }}
                  />
                  <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block', mt: 0.5 }}>
                    Kunci Manual (bila kamera tidak berfungsi): <code>{secretKey}</code>
                  </Typography>
                </Box>

                <Button
                  variant="contained"
                  fullWidth
                  disabled={processing || verificationCode.length < 6}
                  onClick={() => handleVerify(true)}
                  sx={{ bgcolor: '#018730', fontWeight: 700, py: 1.3, '&:hover': { bgcolor: '#005c21' } }}
                >
                  {processing ? 'Memverifikasi...' : 'Verifikasi & Aktifkan MFA'}
                </Button>
              </Box>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}

export default function AdminMfaPage() {
  return (
    <Suspense fallback={<CircularProgress />}>
      <MfaContent />
    </Suspense>
  );
}
