'use client';

import React from 'react';
import { Box, Button, Card, Container, Typography } from '@mui/material';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 4, md: 6 } }}>
      <Card
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          textAlign: 'center',
          border: '1px solid #FCA5A5',
          boxShadow: '0 8px 30px rgba(239,68,68,0.08)',
        }}
      >
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: '50%',
            bgcolor: '#FEE2E2',
            color: '#DC2626',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mx: 'auto',
            mb: 2,
          }}
        >
          <WarningAmberIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h6" sx={{ fontWeight: 800, color: '#991B1B', mb: 1 }}>
          Admin Dashboard Failed to Load
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 2, lineHeight: 1.6 }}>
          Terjadi kesalahan saat merender halaman admin ini — biasanya karena data API tidak sesuai,
          sesi kedaluwarsa, atau gangguan koneksi backend. Detail di bawah untuk tim IT. Tidak perlu
          panik: coba muat ulang atau kembali ke dashboard.
        </Typography>
        {error?.message && (
          <Box
            sx={{
              textAlign: 'left',
              mt: 1,
              p: 1.5,
              bgcolor: '#FFF1F2',
              border: '1px solid #FECACA',
              color: '#9F1239',
              borderRadius: 1.5,
              fontFamily: 'monospace',
              fontSize: 12,
              wordBreak: 'break-word',
              whiteSpace: 'pre-wrap',
            }}
          >
            {error.message}
            {error.digest ? `\ndigest: ${error.digest}` : ''}
          </Box>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => reset()} sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}>
            Coba Muat Ulang
          </Button>
          <Button
            variant="outlined"
            onClick={() => (window.location.href = '/admin/applicants')}
            sx={{ fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}
          >
            Ke Data Pelamar
          </Button>
          <Button
            variant="text"
            onClick={() => (window.location.href = '/login')}
            sx={{ fontWeight: 700, color: '#64748B' }}
          >
            Ke Login
          </Button>
        </Box>
      </Card>
    </Container>
  );
}
