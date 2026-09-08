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
} from '@mui/icons-material';
import BrandLogo from '@/components/BrandLogo';
import LanguageToggle from '@/components/LanguageToggle';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [currentUserName, setCurrentUserName] = useState<string>('');

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
    await fetch('/api/auth/logout', { method: 'POST' });
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
      { label: 'Kelola Lowongan', href: '/admin/jobs', icon: <WorkIcon /> },
      { label: 'Bank Soal Psikotes', href: '/admin/questions', icon: <QuizIcon /> },
      { label: 'Cetak ID Card Karyawan', href: '/admin/id-cards', icon: <BadgeIcon /> },
      { label: 'Pengaturan MCU & Template Pesan', href: '/admin/settings', icon: <SettingsIcon /> },
    ];
  } else {
    // Super Admin: Full Access
    navItems = [
      { label: 'Data Pelamar (7 Tahap)', href: '/admin/applicants', icon: <PeopleIcon /> },
      { label: 'Kelola Lowongan', href: '/admin/jobs', icon: <WorkIcon /> },
      { label: 'Bank Soal Ujian Online', href: '/admin/questions', icon: <QuizIcon /> },
      { label: 'Cetak ID Card Karyawan', href: '/admin/id-cards', icon: <BadgeIcon /> },
      { label: 'Pengaturan MCU & Default', href: '/admin/settings', icon: <SettingsIcon /> },
      { label: 'Kelola Akun & Reset Password (Admin)', href: '/admin/users', icon: <SecurityIcon /> },
    ];
  }

  const currentTab = navItems.findIndex((item) => pathname.startsWith(item.href));

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F1F5F9' }}>
      {/* Top Admin Header */}
      <AppBar position="sticky" sx={{ bgcolor: '#0F172A', color: '#FFFFFF', boxShadow: '0 2px 10px rgba(0,0,0,0.15)' }}>
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ height: 68, display: 'flex', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <BrandLogo
                title="PORTAL HR & USER ATS"
                subtitle="PT Indonesia Thai Summit Plastech"
                lightText={true}
                size="small"
              />
            </Box>

            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* Language Switcher Toggle */}
              <LanguageToggle />

              {currentUserRole && (
                <Chip
                  label={
                    currentUserRole === 'admin' || currentUserRole === 'superadmin'
                      ? '👑 Super Administrator'
                      : currentUserRole === 'hr'
                      ? '👤 HR Recruitment'
                      : '🔧 User Departemen'
                  }
                  size="small"
                  sx={{
                    bgcolor:
                      currentUserRole === 'admin' || currentUserRole === 'superadmin'
                        ? 'rgba(252, 69, 9, 0.2)'
                        : currentUserRole === 'hr'
                        ? 'rgba(1, 135, 48, 0.25)'
                        : 'rgba(59, 130, 246, 0.25)',
                    color:
                      currentUserRole === 'admin' || currentUserRole === 'superadmin'
                        ? '#FB923C'
                        : currentUserRole === 'hr'
                        ? '#4ADE80'
                        : '#93C5FD',
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
          </Toolbar>
        </Container>

        {/* Subnav Tabs */}
        <Box sx={{ bgcolor: '#1E293B', borderTop: '1px solid #334155' }}>
          <Container maxWidth="xl">
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

      {/* Main Content */}
      <Box sx={{ flex: 1, py: 4 }}>
        <Container maxWidth="xl">{children}</Container>
      </Box>
    </Box>
  );
}
