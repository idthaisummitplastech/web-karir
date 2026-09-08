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

          {/* Desktop Nav Items */}
          <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 1.5 }}>
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
              <LanguageToggle />
            </Box>
          </Box>

          {/* Mobile Actions: Language Toggle + Hamburger Button */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1 }}>
            <LanguageToggle />
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ color: '#0F172A' }}
            >
              <MenuIcon />
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
        slotProps={{ paper: { sx: { width: 280, p: 2 } } }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <BrandLogo size="small" />
          <IconButton onClick={handleDrawerToggle}>
            <CloseIcon />
          </IconButton>
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
