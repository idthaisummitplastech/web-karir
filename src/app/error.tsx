'use client';

import React from 'react';
import { Box, Button, Card, Container, Typography } from '@mui/material';
import ErrorOutlineIcon from '@mui/icons-material/ErrorOutlined';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <Card
        sx={{
          p: { xs: 3, sm: 4 },
          borderRadius: 3,
          textAlign: 'center',
          border: '1px solid #FECACA',
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
          <ErrorOutlineIcon sx={{ fontSize: 40 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 800, color: '#991B1B', mb: 1 }}>
          Halaman gagal dimuat
        </Typography>
        <Typography variant="body2" sx={{ color: '#64748B', mb: 1, lineHeight: 1.6 }}>
          Terjadi kesalahan runtime saat merender halaman ini. Silakan muat ulang. Jika berlanjut, hubungi tim IT.
        </Typography>
        {error?.message && (
          <Typography
            variant="caption"
            sx={{
              display: 'block',
              mt: 1,
              p: 1.5,
              bgcolor: '#FFF1F2',
              color: '#9F1239',
              borderRadius: 1.5,
              fontFamily: 'monospace',
              wordBreak: 'break-word',
            }}
          >
            {error.message}
            {error.digest ? ` (digest: ${error.digest})` : ''}
          </Typography>
        )}
        <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mt: 3, flexWrap: 'wrap' }}>
          <Button variant="contained" onClick={() => reset()} sx={{ bgcolor: '#018730', fontWeight: 700, '&:hover': { bgcolor: '#005c21' } }}>
            Muat Ulang Halaman
          </Button>
          <Button variant="outlined" onClick={() => (window.location.href = '/admin/applicants')} sx={{ fontWeight: 700, borderColor: '#CBD5E1', color: '#334155' }}>
            Ke Dashboard
          </Button>
        </Box>
      </Card>
    </Container>
  );
}
