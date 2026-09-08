'use client';

import React from 'react';
import { Box, Container, Typography, Divider } from '@mui/material';
import { Security as SecurityIcon, LocationOn as LocationIcon } from '@mui/icons-material';

import BrandLogo from '@/components/BrandLogo';
import { useLanguage } from '@/lib/LanguageContext';

export default function Footer() {
  const { t } = useLanguage();

  return (
    <Box sx={{ bgcolor: '#0F172A', color: '#CBD5E1', pt: 8, pb: 4 }}>
      <Container maxWidth="lg">
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '2fr 1.5fr 1fr' },
            gap: 4,
          }}
        >
          <Box>
            <Box sx={{ mb: 2 }}>
              <BrandLogo
                title="PT INDONESIA THAI SUMMIT PLASTECH"
                subtitle="Automotive Plastic & Interior Systems"
                lightText={true}
                size="medium"
              />
            </Box>
            <Typography variant="body2" sx={{ color: '#94A3B8', lineHeight: 1.7, mb: 2 }}>
              {t('footer_about', 'Tier-1 automotive plastic injection molding, precision painting, and interior assembly manufacturing. Proud member of global Thai Summit Group.')}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, color: '#38BDF8', fontSize: 12 }}>
              <SecurityIcon sx={{ fontSize: 16 }} />
              <span>{t('footer_security', 'Protected & Isolated Recruitment System (MFA + Secure Proctoring)')}</span>
            </Box>
          </Box>

          <Box>
            <Typography variant="subtitle2" sx={{ color: '#FFFFFF', fontWeight: 700, mb: 1.5, display: 'flex', alignItems: 'center', gap: 0.8 }}>
              <LocationIcon sx={{ color: '#FC4509', fontSize: 18 }} />
              {t('footer_plants', 'PT ITSP MANUFACTURING PLANTS')}
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
                  {t('footer_plant_1_title', 'PLANT 1 (KARAWANG)')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', lineHeight: 1.6 }}>
                  {t('footer_plant_1_desc', 'KIIC Industrial Estate, Jl. Permata Raya Lot FF-3, Sirnabaya, Telukjambe Timur, Karawang, West Java 41361.')}
                </Typography>
              </Box>
              <Box sx={{ p: 2, borderRadius: 2, bgcolor: '#1E293B', border: '1px solid #334155' }}>
                <Typography variant="subtitle2" sx={{ color: '#FB923C', fontWeight: 700, mb: 0.5 }}>
                  {t('footer_plant_2_title', 'PLANT 2 (CIKARANG)')}
                </Typography>
                <Typography variant="caption" sx={{ color: '#CBD5E1', display: 'block', lineHeight: 1.6 }}>
                  {t('footer_plant_2_desc', 'Greenland International Industrial Center (GIIC) Block CD No. 01, Deltamas, Central Cikarang, Bekasi, West Java 17530.')}
                </Typography>
              </Box>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 4, borderColor: '#334155' }} />

        <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            © {new Date().getFullYear()} {t('footer_rights', 'PT Indonesia Thai Summit Plastech. All rights reserved.')}
          </Typography>
          <Typography variant="caption" sx={{ color: '#64748B' }}>
            {t('footer_sub', 'Integrated Recruitment Portal & Official ATS')}
          </Typography>
        </Box>
      </Container>
    </Box>
  );
}
