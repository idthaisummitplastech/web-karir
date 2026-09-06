'use client';

import React from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Typography,
  Button,
  Chip,
} from '@mui/material';
import {
  Work as WorkIcon,
  Timeline as TrackIcon,
  AccountCircle as AccountIcon,
  AdminPanelSettings as AdminIcon,
} from '@mui/icons-material';

import BrandLogo from '@/components/BrandLogo';

export default function Navbar() {
  return (
    <AppBar
      position="sticky"
      sx={{
        backgroundColor: '#FFFFFF',
        color: '#0F172A',
        boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
        borderBottom: '1px solid #E2E8F0',
      }}
    >
      <Container maxWidth="lg">
        <Toolbar disableGutters sx={{ height: 74, display: 'flex', justifyContent: 'space-between' }}>
          {/* Logo & Brand matching CMS */}
          <Link href="/" style={{ textDecoration: 'none' }}>
            <BrandLogo
              title="PT INDONESIA THAI SUMMIT PLASTECH"
              subtitle="PORTAL KARIR RESMI & ATS"
              size="medium"
            />
          </Link>

          {/* Nav Items */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1 }}>
            <Button
              component={Link}
              href="/#lowongan"
              startIcon={<WorkIcon sx={{ color: '#018730' }} />}
              sx={{ color: '#334155', fontWeight: 600 }}
            >
              Lowongan Kerja
            </Button>
            <Button
              component={Link}
              href="/#tahapan"
              startIcon={<TrackIcon sx={{ color: '#fc4509' }} />}
              sx={{ color: '#334155', fontWeight: 600 }}
            >
              7 Tahap Seleksi
            </Button>
            <Button
              component={Link}
              href="/portal/dashboard"
              variant="outlined"
              color="primary"
              startIcon={<AccountIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                borderWidth: 1.5,
                borderColor: '#018730',
              }}
            >
              Portal Pelamar
            </Button>
            <Button
              component={Link}
              href="/login"
              variant="contained"
              startIcon={<AdminIcon />}
              sx={{
                borderRadius: 2,
                fontWeight: 700,
                bgcolor: '#0F172A',
                '&:hover': { bgcolor: '#1E293B' },
              }}
            >
              Login
            </Button>
          </Box>
        </Toolbar>
      </Container>
    </AppBar>
  );
}
