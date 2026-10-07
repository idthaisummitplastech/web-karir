'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Box,
  Container,
  Typography,
  Card,
  CardContent,
  Tabs,
  Tab,
  TextField,
  Button,
  Alert,
  CircularProgress,
  InputAdornment,
  IconButton,
  Divider,
} from '@mui/material';
import {
  Visibility as EyeIcon,
  VisibilityOff as EyeOffIcon,
  Person as PersonIcon,
  AdminPanelSettings as AdminIcon,
  Lock as LockIcon,
  Security as SecurityIcon,
  Email as EmailIcon,
} from '@mui/icons-material';
import { useLanguage } from '@/lib/LanguageContext';

export default function LoginPage() {
  const router = useRouter();
  const { language } = useLanguage();
  const [tabIndex, setTabIndex] = useState(0); // 0: Applicant, 1: Admin HR/User

  // Applicant fields
  const [applicantEmail, setApplicantEmail] = useState('');
  const [applicantPassword, setApplicantPassword] = useState('');
  const [showApplicantPassword, setShowApplicantPassword] = useState(false);

  // Admin fields
  const [adminUsername, setAdminUsername] = useState('');
  const [adminPassword, setAdminPassword] = useState('');
  const [adminMfaCode, setAdminMfaCode] = useState('');
  const [showAdminPassword, setShowAdminPassword] = useState(false);
  const [isMfaRequired, setIsMfaRequired] = useState(false);
  const [mfaSetupData, setMfaSetupData] = useState<{
    qrCodeDataUrl: string;
    secret: string;
  } | null>(null);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle Applicant Login
  const handleApplicantLogin = async (e?: React.FormEvent, customEmail?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setError(null);
    setLoading(true);

    const emailToUse = customEmail || applicantEmail;
    const passToUse = customPass || applicantPassword;

    try {
      const res = await fetch('/api/auth/applicant-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: emailToUse,
          password: passToUse,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Login failed. Please check your email & password.');

      router.push('/portal/dashboard');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Handle Admin HR/User Login
  const handleAdminLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          username: adminUsername,
          password: adminPassword,
          mfaCode: adminMfaCode,
        }),
      });

      const data = await res.json();

      if (data.requireMfaSetup) {
        setMfaSetupData({
          qrCodeDataUrl: data.qrCodeDataUrl,
          secret: data.secret,
        });
        setIsMfaRequired(true);
        setError(null);
        setLoading(false);
        return;
      }

      if (data.requireMfa) {
        setMfaSetupData(null);
        setIsMfaRequired(true);
        setError(null);
        setLoading(false);
        return;
      }

      if (!res.ok) throw new Error(data.error || 'Login failed.');

      router.push('/admin/applicants');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      <Navbar />

      <Container maxWidth="sm" sx={{ py: 8, flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Card sx={{ borderRadius: 3, border: '1px solid #E2E8F0', boxShadow: '0 8px 30px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
          {/* Header */}
          <Box
            sx={{
              background: 'linear-gradient(135deg, #018730 0%, #005c21 100%)',
              color: '#FFFFFF',
              p: 3.5,
              textAlign: 'center',
              borderBottom: '4px solid #fc4509',
            }}
          >
            <Box
              sx={{
                width: 54,
                height: 54,
                bgcolor: '#FFFFFF',
                borderRadius: '12px',
                p: 0.6,
                mx: 'auto',
                mb: 1.5,
                boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Box
                component="img"
                src="/logo-plastech.jpg"
                alt="PT ITSP Logo"
                sx={{ width: '100%', height: '100%', objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: '-0.02em' }}>
              Login Sistem Rekrutmen & ATS
            </Typography>
            <Typography variant="body2" sx={{ color: '#D1FAE5', mt: 0.5 }}>
              PT Indonesia Thai Summit Plastech
            </Typography>
          </Box>

          <Tabs
            value={tabIndex}
            onChange={(_, val) => {
              setTabIndex(val);
              setError(null);
              setIsMfaRequired(false);
              setMfaSetupData(null);
              setAdminMfaCode('');
            }}
            variant="fullWidth"
            className="notranslate"
            translate="no"
            sx={{
              borderBottom: '1px solid #E2E8F0',
              bgcolor: '#F8FAFC',
              '& .Mui-selected': { color: '#018730', fontWeight: 800 },
              '& .MuiTabs-indicator': { bgcolor: '#018730', height: 3 },
            }}
          >
            <Tab
              icon={<PersonIcon />}
              iconPosition="start"
              className="notranslate"
              translate="no"
              label={
                <span className="notranslate" translate="no">
                  {language === 'id' ? 'Applicant Portal' : 'Applicant Portal'}
                </span>
              }
            />
            <Tab
              icon={<AdminIcon />}
              iconPosition="start"
              className="notranslate"
              translate="no"
              label={
                <span className="notranslate" translate="no">
                  {language === 'id' ? 'HR & User Admin' : 'HR & User Admin'}
                </span>
              }
            />
          </Tabs>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                {error}
              </Alert>
            )}

            {/* TAB 0: APPLICANT LOGIN */}
            {tabIndex === 0 && (
              <Box>
                <form onSubmit={handleApplicantLogin}>
                  <Box sx={{ mb: 2.5 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                      {language === 'id' ? 'Email Terdaftar Pelamar' : 'Registered Applicant Email'}
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      type="email"
                      placeholder="nama@email.com"
                      value={applicantEmail}
                      onChange={(e) => setApplicantEmail(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <EmailIcon sx={{ color: '#94A3B8' }} />
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                  </Box>

                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                      {language === 'id' ? 'Password Akun Pelamar' : 'Applicant Account Password'}
                    </Typography>
                    <TextField
                      fullWidth
                      required
                      type={showApplicantPassword ? 'text' : 'password'}
                      placeholder={language === 'id' ? 'Masukkan password akun pelamar' : 'Enter applicant password'}
                      value={applicantPassword}
                      onChange={(e) => setApplicantPassword(e.target.value)}
                      slotProps={{
                        input: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <LockIcon sx={{ color: '#94A3B8' }} />
                            </InputAdornment>
                          ),
                          endAdornment: (
                            <InputAdornment position="end">
                              <IconButton onClick={() => setShowApplicantPassword(!showApplicantPassword)} edge="end">
                                {showApplicantPassword ? <EyeOffIcon /> : <EyeIcon />}
                              </IconButton>
                            </InputAdornment>
                          ),
                        },
                      }}
                    />
                    <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.8 }}>
                      {language === 'id'
                        ? '*Password awal digenerate otomatis saat Anda mendaftar lowongan atau diberikan/direset oleh HR Admin.'
                        : '*Initial password is generated when applying or provided/reset by HR Admin.'}
                    </Typography>
                  </Box>

                  <Button
                    type="submit"
                    fullWidth
                    variant="contained"
                    size="large"
                    disabled={loading}
                    className="notranslate"
                    translate="no"
                    sx={{
                      bgcolor: '#018730',
                      color: '#FFFFFF',
                      fontWeight: 700,
                      py: 1.3,
                      borderRadius: 2,
                      fontSize: 15,
                      textTransform: 'none',
                      '&:hover': { bgcolor: '#005c21' },
                    }}
                  >
                    {loading ? (
                      <CircularProgress size={24} color="inherit" />
                    ) : (
                      <span className="notranslate" translate="no">
                        {language === 'id' ? 'Masuk ke Applicant Portal' : 'Login to Applicant Portal'}
                      </span>
                    )}
                  </Button>

                  <Box sx={{ textAlign: 'center', mt: 3 }}>
                    <Typography variant="body2" sx={{ color: '#64748B' }}>
                      Belum pernah melamar lowongan?{' '}
                      <Link href="/#job-vacancies" style={{ color: '#018730', fontWeight: 700, textDecoration: 'none' }}>
                        Pilih Posisi & Lamar Sekarang
                      </Link>
                    </Typography>
                  </Box>
                </form>
              </Box>
            )}

            {/* TAB 1: ADMIN HR & USER LOGIN (WITH MANDATORY ON-LOGIN MFA) */}
            {tabIndex === 1 && (
              <form onSubmit={handleAdminLogin}>
                {/* JIKA MEMERLUKAN SETUP MFA PERTAMA KALI (SCAN BARCODE LANGSUNG AKTIF) */}
                {mfaSetupData ? (
                  <Box sx={{ mb: 2 }}>
                    <Box
                      sx={{
                        p: 2.5,
                        bgcolor: '#F0FDF4',
                        borderRadius: 2.5,
                        border: '2px solid #22C55E',
                        boxShadow: '0 4px 16px rgba(34, 197, 94, 0.12)',
                        textAlign: 'center',
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: 1,
                          bgcolor: '#DCFCE7',
                          color: '#15803D',
                          px: 2,
                          py: 0.6,
                          borderRadius: 2,
                          fontWeight: 800,
                          fontSize: 13,
                          mb: 1.5,
                        }}
                      >
                        <SecurityIcon sx={{ fontSize: 18 }} />
                        Wajib Aktivasi Google Authenticator
                      </Box>

                      <Typography variant="body2" sx={{ color: '#166534', mb: 2, fontWeight: 500, fontSize: 13.5 }}>
                        Demi keamanan sistem perusahaan, setiap karyawan <strong>wajib scan barcode</strong> di bawah ini menggunakan aplikasi <strong>Google Authenticator</strong> pada smartphone Anda:
                      </Typography>

                      {/* Barcode Image */}
                      <Box
                        sx={{
                          bgcolor: '#FFFFFF',
                          p: 1.5,
                          borderRadius: 2,
                          border: '2px solid #018730',
                          width: 170,
                          height: 170,
                          mx: 'auto',
                          mb: 1.5,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          boxShadow: '0 2px 10px rgba(0,0,0,0.06)',
                        }}
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={mfaSetupData.qrCodeDataUrl}
                          alt="Scan Barcode MFA Google Authenticator"
                          style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                        />
                      </Box>

                      <Typography variant="caption" sx={{ color: '#475569', display: 'block', mb: 2, fontFamily: 'monospace', fontSize: 12 }}>
                        Kunci Manual: <strong>{mfaSetupData.secret}</strong>
                      </Typography>

                      <Box sx={{ textAlign: 'left', bgcolor: '#FFFFFF', p: 1.8, borderRadius: 2, border: '1px solid #BBF7D0', mb: 2 }}>
                        <Typography variant="caption" sx={{ color: '#15803D', fontWeight: 700, display: 'block', mb: 0.5 }}>
                          Langkah Aktivasi:
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#334155', display: 'block', lineHeight: 1.6 }}>
                          1. Buka aplikasi <strong>Google Authenticator</strong> di HP Anda.<br />
                          2. Tekan tanda <strong>(+)</strong> lalu pilih <strong>Pindai kode QR</strong>.<br />
                          3. Arahkan kamera HP ke barcode di atas.<br />
                          4. Masukkan 6 angka yang muncul di HP ke kotak berikut:
                        </Typography>
                      </Box>

                      <TextField
                        fullWidth
                        required
                        autoFocus
                        placeholder="Example: 123456"
                        value={adminMfaCode}
                        onChange={(e) => setAdminMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                        slotProps={{
                          htmlInput: {
                            style: { textAlign: 'center', fontSize: 24, letterSpacing: '0.35em', fontWeight: 800, bgcolor: '#FFFFFF' },
                          },
                        }}
                        helperText="Ketik 6 digit angka dari aplikasi Authenticator"
                      />
                    </Box>

                    <Box sx={{ display: 'flex', gap: 1.5, mt: 2 }}>
                      <Button
                        variant="outlined"
                        onClick={() => {
                          setMfaSetupData(null);
                          setIsMfaRequired(false);
                          setAdminMfaCode('');
                        }}
                        className="notranslate"
                        translate="no"
                        sx={{ py: 1.3, borderRadius: 2, fontWeight: 700, textTransform: 'none' }}
                      >
                        <span className="notranslate" translate="no">
                          {language === 'id' ? 'Cancel' : 'Cancel'}
                        </span>
                      </Button>
                      <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        disabled={loading || adminMfaCode.length < 6}
                        className="notranslate"
                        translate="no"
                        sx={{
                          bgcolor: '#018730',
                          color: '#FFFFFF',
                          fontWeight: 800,
                          py: 1.3,
                          borderRadius: 2,
                          fontSize: 15,
                          textTransform: 'none',
                          '&:hover': { bgcolor: '#005c21' },
                        }}
                      >
                        {loading ? (
                          <CircularProgress size={24} color="inherit" />
                        ) : (
                          <span className="notranslate" translate="no">
                            {language === 'id' ? 'Verifikasi & Aktifkan MFA' : 'Verify & Enable MFA'}
                          </span>
                        )}
                      </Button>
                    </Box>
                  </Box>
                ) : (
                  <>
                    <Box sx={{ mb: 2 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                        {language === 'id' ? 'Username / Email HR / User' : 'Username / HR Email / User'}
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        placeholder="admin / recruitment@itsp.co.id"
                        value={adminUsername}
                        onChange={(e) => setAdminUsername(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <PersonIcon sx={{ color: '#94A3B8' }} />
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                      <Typography variant="caption" sx={{ color: '#64748B', display: 'block', mt: 0.5 }}>
                        {language === 'id'
                          ? '*Gunakan username (misal: admin) atau email resmi (@itsp.co.id).'
                          : '*Use username (e.g. admin) or company email (@itsp.co.id).'}
                      </Typography>
                    </Box>

                    <Box sx={{ mb: isMfaRequired ? 2 : 3 }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#334155', mb: 1 }}>
                        {language === 'id' ? 'Password Akun Admin' : 'Password'}
                      </Typography>
                      <TextField
                        fullWidth
                        required
                        type={showAdminPassword ? 'text' : 'password'}
                        placeholder={language === 'id' ? 'Masukkan password admin' : 'Enter admin password'}
                        value={adminPassword}
                        onChange={(e) => setAdminPassword(e.target.value)}
                        slotProps={{
                          input: {
                            startAdornment: (
                              <InputAdornment position="start">
                                <LockIcon sx={{ color: '#94A3B8' }} />
                              </InputAdornment>
                            ),
                            endAdornment: (
                              <InputAdornment position="end">
                                <IconButton onClick={() => setShowAdminPassword(!showAdminPassword)} edge="end">
                                  {showAdminPassword ? <EyeOffIcon /> : <EyeIcon />}
                                </IconButton>
                              </InputAdornment>
                            ),
                          },
                        }}
                      />
                    </Box>

                    {/* MFA Code Input if already active (regular login) */}
                    {isMfaRequired && (
                      <Box sx={{ mb: 3, p: 2, bgcolor: '#FEF3C7', borderRadius: 2, border: '1px solid #FCD34D' }}>
                        <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#92400E', mb: 1, display: 'flex', alignItems: 'center', gap: 0.8 }}>
                          <SecurityIcon sx={{ fontSize: 18 }} />
                          2-Step Verification (MFA TOTP)
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#78350F', display: 'block', mb: 1.5 }}>
                          Open Google Authenticator on your phone and enter the 6-digit verification code:
                        </Typography>
                        <TextField
                          fullWidth
                          required
                          autoFocus
                          placeholder="Example: 123456"
                          value={adminMfaCode}
                          onChange={(e) => setAdminMfaCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                          slotProps={{
                            htmlInput: {
                              style: { textAlign: 'center', fontSize: 22, letterSpacing: '0.35em', fontWeight: 800 },
                            },
                          }}
                        />
                      </Box>
                    )}

                    <Button
                      type="submit"
                      fullWidth
                      variant="contained"
                      size="large"
                      disabled={loading}
                      className="notranslate"
                      translate="no"
                      sx={{
                        bgcolor: '#0F172A',
                        color: '#FFFFFF',
                        fontWeight: 700,
                        py: 1.3,
                        borderRadius: 2,
                        fontSize: 15,
                        textTransform: 'none',
                        '&:hover': { bgcolor: '#1E293B' },
                      }}
                    >
                      {loading ? (
                        <CircularProgress size={24} color="inherit" />
                      ) : (
                        <span className="notranslate" translate="no">
                          {isMfaRequired
                            ? (language === 'id' ? 'Verify & Sign In' : 'Verify & Sign In')
                            : (language === 'id' ? 'HR Admin / User Login' : 'Login HR Admin / User')}
                        </span>
                      )}
                    </Button>
                  </>
                )}
              </form>
            )}
          </CardContent>
        </Card>
      </Container>

      <Footer />
    </Box>
  );
}
