'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  Button,
  Container,
  Chip,
  Tabs,
  Tab,
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
  People as PeopleIcon,
  Event as EventIcon,
  Settings as SettingsIcon,
  Badge as BadgeIcon,
  Security as SecurityIcon,
  Quiz as QuizIcon,
  Logout as LogoutIcon,
  Work as WorkIcon,
  AssignmentInd as EmployeeIcon,
  Menu as MenuIcon,
  Close as CloseIcon,
  AccountCircle as AccountIcon,
} from '@mui/icons-material';
import BrandLogo from '@/components/BrandLogo';
import LanguageToggle from '@/components/LanguageToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  React.useEffect(() => {
    fetch('/api/admin/session')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setCurrentUserRole(data.role);
          setCurrentUserName(data.name || '');
        }
      })
      .catch((err) => console.error(err));
  }, []);

  const handleLogout = async () => {
    await fetch('/api/auth/logout?type=admin', { method: 'POST' });
    router.push('/login');
  };

  // NAVIGASI MENU KHUSUS PER ROLE:
  let navItems: { label: string; href: string; icon: React.ReactElement }[] = [];
  if (currentUserRole === 'user_dept') {
    navItems = [
      { label: 'Data Pelamar & Evaluasi Teknis', href: '/admin/applicants', icon: <PeopleIcon /> },
      { label: 'Bank Soal Teknis Departemen', href: '/admin/questions', icon: <QuizIcon /> },
    ];
  } else if (currentUserRole === 'hr') {
    navItems = [
      { label: 'Data Pelamar (7 Tahap)', href: '/admin/applicants', icon: <PeopleIcon /> },
      { label: 'Data Karyawan', href: '/admin/employees', icon: <EmployeeIcon /> },
      { label: 'Kelola Lowongan', href: '/admin/jobs', icon: <WorkIcon /> },
      { label: 'Bank Soal Psikotes', href: '/admin/questions', icon: <QuizIcon /> },
      { label: 'Cetak ID Card Karyawan', href: '/admin/id-cards', icon: <BadgeIcon /> },
      { label: 'Pengaturan MCU & Template Pesan', href: '/admin/settings', icon: <SettingsIcon /> },
    ];
  } else {
    // Super Admin: Full Access
    navItems = [
      { label: 'Data Pelamar (7 Tahap)', href: '/admin/applicants', icon: <PeopleIcon /> },
      { label: 'Data Karyawan', href: '/admin/employees', icon: <EmployeeIcon /> },
      { label: 'Kelola Lowongan', href: '/admin/jobs', icon: <WorkIcon /> },
      { label: 'Bank Soal Ujian Online', href: '/admin/questions', icon: <QuizIcon /> },
      { label: 'Cetak ID Card Karyawan', href: '/admin/id-cards', icon: <BadgeIcon /> },
      { label: 'Pengaturan MCU & Default', href: '/admin/settings', icon: <SettingsIcon /> },
      { label: 'Kelola Akun & Reset Password (Admin)', href: '/admin/users', icon: <SecurityIcon /> },
    ];
  }

  const currentTab = navItems.findIndex((item) => pathname.startsWith(item.href));

  const roleLabel =
    currentUserRole === 'admin' || currentUserRole === 'superadmin'
      ? '👑 Super Administrator'
      : currentUserRole === 'hr'
      ? '👤 HR Recruitment'
      : '🔧 User Departemen';

  const roleBgColor =
    currentUserRole === 'admin' || currentUserRole === 'superadmin'
      ? 'rgba(252, 69, 9, 0.2)'
      : currentUserRole === 'hr'
      ? 'rgba(1, 135, 48, 0.25)'
      : 'rgba(59, 130, 246, 0.25)';

  const roleTextColor =
    currentUserRole === 'admin' || currentUserRole === 'superadmin'
      ? '#FB923C'
      : currentUserRole === 'hr'
      ? '#4ADE80'
      : '#93C5FD';

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
      {/* Top Admin Header */}
      <AppBar position="sticky" sx={{ bgcolor: '#0F172A', color: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2.5, md: 3 } }}>
          <Toolbar disableGutters sx={{ height: { xs: 60, md: 68 }, display: 'flex', justifyContent: 'space-between', gap: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', minWidth: 0 }}>
              <BrandLogo
                title="PORTAL HR & USER ATS"
                subtitle="PT Indonesia Thai Summit Plastech"
                lightText={true}
                size="small"
              />
            </Box>

            {/* Desktop Navigation & Actions */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, alignItems: 'center', gap: 2, flexShrink: 0 }}>
              <LanguageToggle />

              {currentUserRole && (
                <Chip
                  label={roleLabel}
                  size="small"
                  sx={{
                    bgcolor: roleBgColor,
                    color: roleTextColor,
                    fontWeight: 800,
                    fontSize: 12,
                    border: '1px solid currentColor',
                  }}
                />
              )}
              <Button
                variant="outlined"
                size="small"
                onClick={handleLogout}
                startIcon={<LogoutIcon />}
                sx={{ color: '#EF4444', borderColor: '#EF4444', fontWeight: 700 }}
              >
                Keluar
              </Button>
            </Box>

            {/* Mobile Actions: Language Toggle + Hamburger Button */}
            <Box sx={{ display: { xs: 'flex', md: 'none' }, alignItems: 'center', gap: 1, flexShrink: 0 }}>
              <LanguageToggle size="small" />
              <IconButton
                onClick={() => setMobileDrawerOpen(true)}
                sx={{
                  color: '#FFFFFF',
                  bgcolor: 'rgba(255, 255, 255, 0.08)',
                  borderRadius: '10px',
                  p: 0.8,
                  '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.16)' },
                }}
                aria-label="Buka menu navigasi"
              >
                <MenuIcon sx={{ fontSize: 24 }} />
              </IconButton>
            </Box>
          </Toolbar>
        </Container>

        {/* Subnav Tabs: Shown on md up where it's spacious */}
        <Box sx={{ bgcolor: '#1E293B', borderTop: '1px solid #334155', display: { xs: 'none', md: 'block' } }}>
          <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2.5, md: 3 } }}>
            <Tabs
              value={currentTab >= 0 ? currentTab : 0}
              variant="scrollable"
              scrollButtons="auto"
              sx={{
                '& .Mui-selected': { color: '#4ADE80 !important', fontWeight: 800 },
                '& .MuiTabs-indicator': { bgcolor: '#4ADE80', height: 3 },
                minHeight: 48,
              }}
            >
              {navItems.map((item) => (
                <Tab
                  key={item.href}
                  component={Link}
                  href={item.href}
                  icon={item.icon}
                  iconPosition="start"
                  label={item.label}
                  sx={{ color: '#CBD5E1', fontSize: 13, textTransform: 'none', py: 1.2 }}
                />
              ))}
            </Tabs>
          </Container>
        </Box>
      </AppBar>

      {/* Mobile Drawer Navigation */}
      <Drawer
        anchor="right"
        open={mobileDrawerOpen}
        onClose={() => setMobileDrawerOpen(false)}
        slotProps={{
          paper: {
            sx: {
              width: { xs: '85%', sm: 340 },
              bgcolor: '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              flexDirection: 'column',
              p: 2.5,
            },
          },
        }}
      >
        {/* Drawer Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2.5 }}>
          <BrandLogo
            title="PORTAL ATS"
            subtitle="PT ITSP"
            lightText={true}
            size="small"
          />
          <IconButton
            onClick={() => setMobileDrawerOpen(false)}
            sx={{ color: '#94A3B8', '&:hover': { color: '#FFFFFF' } }}
          >
            <CloseIcon />
          </IconButton>
        </Box>

        {/* User Profile Card in Drawer */}
        <Box
          sx={{
            p: 2,
            mb: 2.5,
            bgcolor: '#1E293B',
            borderRadius: 2,
            border: '1px solid #334155',
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 1.5 }}>
            <AccountIcon sx={{ color: '#4ADE80', fontSize: 32 }} />
            <Box sx={{ minWidth: 0, flex: 1 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 800, color: '#FFFFFF', lineHeight: 1.3 }}>
                {currentUserName || 'User Internal ATS'}
              </Typography>
              <Typography variant="caption" sx={{ color: '#94A3B8', display: 'block' }}>
                Akun Terverifikasi
              </Typography>
            </Box>
          </Box>
          {currentUserRole && (
            <Chip
              label={roleLabel}
              size="small"
              sx={{
                bgcolor: roleBgColor,
                color: roleTextColor,
                fontWeight: 800,
                fontSize: 11,
                border: '1px solid currentColor',
                width: '100%',
                justifyContent: 'center',
              }}
            />
          )}
        </Box>

        <Divider sx={{ borderColor: '#334155', mb: 2 }} />

        {/* Navigation Links */}
        <Typography variant="overline" sx={{ color: '#64748B', fontWeight: 800, fontSize: 11, letterSpacing: '0.08em', px: 1, mb: 1 }}>
          MENU MANAJEMEN ATS
        </Typography>

        <List sx={{ flex: 1, p: 0, overflowY: 'auto' }}>
          {navItems.map((item) => {
            const isActive = pathname.startsWith(item.href);
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.8 }}>
                <ListItemButton
                  component={Link}
                  href={item.href}
                  onClick={() => setMobileDrawerOpen(false)}
                  sx={{
                    borderRadius: 2,
                    py: 1.2,
                    px: 1.5,
                    bgcolor: isActive ? 'rgba(74, 222, 128, 0.15)' : 'transparent',
                    border: isActive ? '1px solid rgba(74, 222, 128, 0.3)' : '1px solid transparent',
                    '&:hover': { bgcolor: 'rgba(255, 255, 255, 0.06)' },
                  }}
                >
                  <ListItemIcon sx={{ color: isActive ? '#4ADE80' : '#94A3B8', minWidth: 36 }}>
                    {item.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={item.label}
                    primaryTypographyProps={{
                      fontSize: 13.5,
                      fontWeight: isActive ? 800 : 600,
                      color: isActive ? '#4ADE80' : '#E2E8F0',
                    }}
                  />
                </ListItemButton>
              </ListItem>
            );
          })}
        </List>

        <Divider sx={{ borderColor: '#334155', my: 2 }} />

        {/* Logout Button */}
        <Button
          fullWidth
          variant="contained"
          color="error"
          onClick={handleLogout}
          startIcon={<LogoutIcon />}
          sx={{
            py: 1.2,
            borderRadius: 2,
            fontWeight: 800,
            fontSize: 14,
            boxShadow: '0 4px 12px rgba(239, 68, 68, 0.3)',
          }}
        >
          Keluar dari Sistem
        </Button>
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flex: 1, py: { xs: 2.5, sm: 3, md: 4 } }}>
        <Container maxWidth="xl" sx={{ px: { xs: 1.5, sm: 2.5, md: 3 } }}>{children}</Container>
      </Box>
    </Box>
  );
}
