'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  AppBar,
  Toolbar,
  Container,
  Box,
  Button,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Typography,
} from '@mui/material';
import {
  Work as WorkIcon,
  Timeline as TrackIcon,
  AccountCircle as AccountIcon,
  AdminPanelSettings as AdminIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
} from '@mui/icons-material';

import BrandLogo from '@/components/BrandLogo';
import LanguageToggle from '@/components/LanguageToggle';
import { useLanguage } from '@/lib/LanguageContext';

export default function Navbar() {
  const { t } = useLanguage();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

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
      <Container maxWidth="lg" sx={{ px: { xs: 1.5, sm: 2.5, md: 3 } }}>
        <Toolbar disableGutters sx={{ height: { xs: 62, sm: 68, md: 74 }, display: 'flex', justifyContent: 'space-between', gap: { xs: 1, sm: 2 } }}>
          {/* Logo & Brand matching CMS */}
          <Link href="/" style={{ textDecoration: 'none', minWidth: 0, flex: 1, display: 'flex', alignItems: 'center' }}>
            <BrandLogo
              title="PT INDONESIA THAI SUMMIT PLASTECH"
              subtitle="PORTAL KARIR RESMI & ATS"
              size="medium"
            />
          </Link>

          {/* Desktop Nav Items */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5, flexShrink: 0 }}>
            <Button
              component={Link}
              href="/#lowongan"
              startIcon={<WorkIcon sx={{ color: '#018730' }} />}
              sx={{ color: '#334155', fontWeight: 600, px: 1.5 }}
            >
              {t('nav_jobs', 'Job Vacancies')}
            </Button>
            <Button
              component={Link}
              href="/#tahapan"
              startIcon={<TrackIcon sx={{ color: '#fc4509' }} />}
              sx={{ color: '#334155', fontWeight: 600, px: 1.5 }}
            >
              {t('nav_stages', '7 Selection Stages')}
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
                px: 2,
              }}
            >
              {t('nav_portal', 'Applicant Portal')}
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
                px: 2,
              }}
            >
              {t('nav_login', 'Login')}
            </Button>

            {/* Language Switcher Toggle */}
            <Box sx={{ ml: 1 }}>
              <LanguageToggle size="small" />
            </Box>
          </Box>

          {/* Mobile Actions: Language Toggle + Hamburger Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: { xs: 0.75, sm: 1 }, flexShrink: 0 }}>
            <LanguageToggle size="small" />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="end"
              onClick={handleDrawerToggle}
              sx={{
                color: '#018730',
                p: { xs: 0.75, sm: 1 },
                bgcolor: 'rgba(1, 135, 48, 0.08)',
                borderRadius: '10px',
                '&:hover': { bgcolor: 'rgba(1, 135, 48, 0.16)' },
              }}
            >
              <MenuIcon sx={{ fontSize: { xs: 24, sm: 26 } }} />
            </IconButton>
          </Box>
        </Toolbar>
      </Container>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        slotProps={{ paper: { sx: { width: { xs: '85%', sm: 320 }, p: 2.5 } } }}
      >
        {/* Drawer Header: Brand Logo & Close Button */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1, mb: 2 }}>
          <Box sx={{ minWidth: 0, flex: 1, overflow: 'hidden' }}>
            <BrandLogo size="small" />
          </Box>
          <IconButton
            onClick={handleDrawerToggle}
            aria-label="close drawer"
            sx={{
              color: '#475569',
              p: 1,
              bgcolor: '#F1F5F9',
              borderRadius: '10px',
              flexShrink: 0,
              '&:hover': { bgcolor: '#E2E8F0', color: '#0F172A' },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>

        {/* Drawer Language Switcher Row */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            bgcolor: '#F8FAFC',
            border: '1px solid #E2E8F0',
            py: 1,
            px: 1.5,
            borderRadius: 2,
            mb: 2,
          }}
        >
          <Typography variant="body2" sx={{ fontWeight: 600, color: '#475569', fontSize: '0.85rem' }}>
            Language / Bahasa
          </Typography>
          <LanguageToggle size="small" />
        </Box>
        <Divider sx={{ mb: 2 }} />

        <List>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/#lowongan"
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <WorkIcon sx={{ color: '#018730' }} />
              </ListItemIcon>
              <ListItemText primary={t('nav_jobs', 'Job Vacancies')} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/#tahapan"
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <TrackIcon sx={{ color: '#fc4509' }} />
              </ListItemIcon>
              <ListItemText primary={t('nav_stages', '7 Selection Stages')} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding sx={{ mt: 1 }}>
            <ListItemButton
              component={Link}
              href="/portal/dashboard"
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <AccountIcon sx={{ color: '#018730' }} />
              </ListItemIcon>
              <ListItemText primary={t('nav_portal', 'Applicant Portal')} />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton
              component={Link}
              href="/login"
              onClick={handleDrawerToggle}
            >
              <ListItemIcon>
                <AdminIcon sx={{ color: '#0F172A' }} />
              </ListItemIcon>
              <ListItemText primary={t('nav_login', 'Login')} />
            </ListItemButton>
          </ListItem>
        </List>
      </Drawer>
    </AppBar>
  );
}
