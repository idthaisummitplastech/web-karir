'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Button,
  TextField,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
} from '@mui/material';
import {
  Lock as LockIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';

export default function ChangePasswordPage() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (!currentPassword) {
      setErrorMsg('Kata sandi saat ini wajib diisi.');
      return;
    }

    if (newPassword.length < 12) {
      setErrorMsg('Kata sandi baru minimal 12 karakter.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Konfirmasi kata sandi baru tidak cocok.');
      return;
    }

    if (newPassword === currentPassword) {
      setErrorMsg('Kata sandi baru tidak boleh sama dengan kata sandi saat ini.');
      return;
    }

    setLoading(true);

    try {
      const res = await fetch('/api/admin/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Gagal memperbarui kata sandi.');
      }

      setSuccessMsg('Kata sandi berhasil diperbarui! Mengalihkan...');

      // Alihkan sesuai status MFA
      setTimeout(() => {
        if (data.mfaRequired) {
          router.push('/admin/mfa?setup=first-time');
        } else {
          router.push('/admin');
        }
      }, 1200);
    } catch (err: any) {
      setErrorMsg(err.message || 'Terjadi kesalahan saat mengganti kata sandi.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 640, mx: 'auto', py: 4 }}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: 800, color: '#0F172A', letterSpacing: '-0.02em', mb: 1 }}>
          Pembaruan Kata Sandi
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B' }}>
          Demi keamanan akun administrasi Anda, silakan ubah kata sandi dengan kombinasi yang kuat (minimal 12 karakter).
        </Typography>
      </Box>

      <Alert severity="warning" sx={{ mb: 3, borderRadius: 2 }}>
        <strong>Wajib Pembaruan Kata Sandi:</strong> Anda sedang menggunakan kata sandi sementara atau belum memperbarui kata sandi. Anda wajib mengganti kata sandi sebelum dapat mengakses menu admin lainnya.
      </Alert>

      {errorMsg && (
        <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
          {errorMsg}
        </Alert>
      )}

      {successMsg && (
        <Alert
          severity="success"
          icon={<CheckCircleIcon fontSize="inherit" />}
          sx={{ mb: 3, borderRadius: 2 }}
        >
          {successMsg}
        </Alert>
      )}

      <Card sx={{ borderRadius: 3, border: '1px solid #CBD5E1', boxShadow: '0 4px 16px rgba(0,0,0,0.05)', overflow: 'hidden' }}>
        <Box sx={{ p: 2.5, bgcolor: '#0F172A', color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <LockIcon sx={{ color: '#4ADE80' }} />
          <Typography variant="h6" sx={{ fontWeight: 800, fontSize: 17 }}>
            Formulir Kata Sandi Baru
          </Typography>
        </Box>

        <CardContent sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleSubmit} sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <TextField
              label="Kata Sandi Saat Ini (Sementara)"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowCurrent(!showCurrent)} edge="end" size="small">
                        {showCurrent ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Kata Sandi Baru"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              helperText="Minimal 12 karakter. Disarankan perpaduan huruf besar, huruf kecil, angka, dan simbol."
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowNew(!showNew)} edge="end" size="small">
                        {showNew ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <TextField
              label="Konfirmasi Kata Sandi Baru"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              fullWidth
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowConfirm(!showConfirm)} edge="end" size="small">
                        {showConfirm ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />

            <Button
              type="submit"
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                bgcolor: '#018730',
                color: '#FFFFFF',
                fontWeight: 700,
                py: 1.5,
                borderRadius: 2,
                '&:hover': { bgcolor: '#016624' },
              }}
            >
              {loading ? <CircularProgress size={24} sx={{ color: '#FFFFFF' }} /> : 'Simpan Kata Sandi Baru'}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
