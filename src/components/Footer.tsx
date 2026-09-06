'use client';

import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import { Security as SecurityIcon, LocationOn as LocationIcon } from '@mui/icons-material';

export default function Footer() {
  return (
    <Box sx={{ bgcolor: '#0F172A', color: '#94A3B8', pt: 6, pb: 4, mt: 8 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1.2fr 1.8fr' },
            gap: 4,
          }}
        >
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
              <Box
                sx={{
                  width: 36,
                  height: 36,
                  borderRadius: 1.5,
                  bgcolor: '#018730',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: 800,
                  fontSize: 16,
                  border: '1.5px solid #fc4509',
                }}
              >
                TS
              </Box>
              <Typography variant="h6" sx={{ color: '#FFFFFF', fontWeight: 800, fontSize: 16 }}>
                PT INDONESIA THAI SUMMIT PLASTECH
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7, mb: 2 }}>
              Manufaktur otomotif plastic injection molding, spray painting, dan interior assembly presisi tinggi. Bagian dari Thai Summit Group global.
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#38BDF8', fontSize: 12 }}>
              <SecurityIcon sx={{ fontSize: 16 }} />
              <span>Sistem Rekrutmen Terisolasi & Terproteksi (MFA + Proctoring)</span>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LocationIcon sx={{ color: '#FC4509', fontSize: 18 }} />
              LOKASI PABRIK PT ITSP
            </Typography>
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr' },
                gap: 2,
              }}
            >
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#1E293B', border: '1px solid #334155' }}>
                <Typography variant="subtitle2" sx={{ color: '#4ADE80', fontWeight: 700, mb: 0.5 }}>
                  PLANT 1 (KARAWANG)
                </Typography>
                <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', lineHeight: 1.6 }}>
                  Kawasan Industri KIIC, Jl. Permata Raya Lot FF-3, Sirnabaya, Telukjambe Timur, Karawang, Jawa Barat 41361.
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#1E293B', border: '1px solid #334155' }}>
                <Typography variant="subtitle2" sx={{ color: '#FB923C', fontWeight: 700, mb: 0.5 }}>
                  PLANT 2 (CIKARANG)
                </Typography>
                <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', lineHeight: 1.6 }}>
                  Greenland International Industrial Center (GIIC) Blok CD No. 01, Kota Deltamas, Cikarang Pusat, Bekasi, Jawa Barat 17530.
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: '#334155' }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            © {new Date().getFullYear()} PT Indonesia Thai Summit Plastech. Seluruh hak cipta dilindungi undang-undang.
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            Sistem Rekrutmen Terpadu & Portal Karir Resmi (ATS)
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
