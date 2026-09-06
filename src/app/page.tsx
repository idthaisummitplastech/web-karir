'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  MenuItem,
  CircularProgress,
} from '@mui/material';
import {
  Search as SearchIcon,
  LocationOn as LocationIcon,
  Work as WorkIcon,
  CheckCircle as CheckCircleIcon,
  ArrowForward as ArrowForwardIcon,
  Security as ShieldIcon,
  Celebration as CelebrationIcon,
} from '@mui/icons-material';
import { RECRUITMENT_STAGES } from '@/lib/constants';

interface Job {
  id: number;
  title: string;
  department: string;
  location: string;
  type: string;
  experience: string;
  requirements: string;
  description: string;
}

export default function HomePage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');

  useEffect(() => {
    fetch('/api/jobs')
      .then((res) => res.json())
      .then((data) => {
        if (data.jobs) setJobs(data.jobs);
      })
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  const departments = ['All', ...Array.from(new Set(jobs.map((j) => j.department)))];

  const filteredJobs = jobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.requirements.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchDept = departmentFilter === 'All' || job.department === departmentFilter;
    return matchSearch && matchDept;
  });

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: '#F8FAFC' }}>
      <Navbar />

      {/* Hero Section */}
      <Box
        sx={{
          background: 'linear-gradient(135deg, #018730 0%, #004d1b 100%)',
          color: '#FFFFFF',
          pt: { xs: 8, md: 10 },
          pb: { xs: 10, md: 12 },
          position: 'relative',
          overflow: 'hidden',
          borderBottom: '4px solid #fc4509',
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: { xs: '1fr', md: '1.8fr 1.2fr' },
              gap: 4,
              alignItems: 'center',
            }}
          >
            <Box>
              <Chip
                label="PORTAL RESMI REKRUTMEN PT ITSP"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: '#FED7AA',
                  fontWeight: 700,
                  fontSize: 12,
                  mb: 2.5,
                  letterSpacing: '0.05em',
                  backdropFilter: 'blur(8px)',
                }}
              />
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 30, sm: 38, md: 46 },
                  lineHeight: 1.18,
                  mb: 2,
                  letterSpacing: '-0.03em',
                }}
              >
                Bangun Karir Profesional Anda di Industri Otomotif Masa Depan
              </Typography>
              <Typography
                variant="body1"
                sx={{
                  color: '#D1FAE5',
                  fontSize: { xs: 15, md: 17 },
                  lineHeight: 1.6,
                  maxWidth: 680,
                  mb: 4,
                }}
              >
                PT Indonesia Thai Summit Plastech membuka peluang bagi talenta unggul untuk bergabung sebagai bagian dari manufaktur plastic injection otomotif terkemuka. Pantau proses seleksi Anda secara transparan melalui sistem terpadu 7 tahap.
              </Typography>

              <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                <Button
                  component="a"
                  href="#lowongan"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: '#fc4509',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 15,
                    px: 3.5,
                    py: 1.4,
                    borderRadius: 2,
                    boxShadow: '0 8px 20px rgba(252, 69, 9, 0.35)',
                    '&:hover': { bgcolor: '#e03a03' },
                  }}
                >
                  Lihat Lowongan Kerja Aktif
                </Button>
                <Button
                  component={Link}
                  href="/portal/dashboard"
                  variant="outlined"
                  size="large"
                  sx={{
                    color: '#FFFFFF',
                    borderColor: 'rgba(255,255,255,0.4)',
                    fontWeight: 700,
                    fontSize: 15,
                    px: 3.5,
                    py: 1.4,
                    borderRadius: 2,
                    '&:hover': { borderColor: '#FFFFFF', bgcolor: 'rgba(255,255,255,0.1)' },
                  }}
                >
                  Masuk ke Portal Pelamar
                </Button>
              </Box>
            </Box>

            <Box
              sx={{
                bgcolor: 'rgba(255,255,255,0.08)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.2)',
                borderRadius: 3,
                p: 3,
                boxShadow: '0 12px 32px rgba(0,0,0,0.2)',
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: 700, mb: 2, color: '#FFFFFF', display: 'flex', alignItems: 'center', gap: 1 }}>
                <ShieldIcon sx={{ color: '#fc4509' }} /> Keunggulan Sistem Rekrutmen
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#4ADE80', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: 13.5 }}>
                    <strong>Alur 7 Tahap Transparan:</strong> Informasi status seleksi diperbarui langsung di dashboard Anda.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#4ADE80', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: 13.5 }}>
                    <strong>Tes Online Terjadwal:</strong> Ujian psikotes & teknis dengan token sesi & sistem anti-kecurangan aman.
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#4ADE80', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: 13.5 }}>
                    <strong>Notifikasi Email Otomatis:</strong> Setiap keputusan resmi dikirimkan langsung ke email kandidat.
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 7-Stage Process Stepper Overview (Uniform 4x2 Grid Layout) */}
      <Container maxWidth="lg" id="tahapan" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: '#018730', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em' }}
          >
            STANDAR PENERIMAAN KARYAWAN PT ITSP
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, mb: 1.5, fontSize: { xs: 26, sm: 32, md: 36 } }}>
            Alur Lengkap 7 Tahap Seleksi Calon Karyawan
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 680, mx: 'auto' }}>
            Setiap pelamar akan melalui tahapan seleksi terstruktur dan transparan, mulai dari berkas administrasi hingga penandatanganan kontrak kerja.
          </Typography>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: {
              xs: '1fr',
              sm: 'repeat(2, 1fr)',
              md: 'repeat(4, 1fr)',
            },
            gap: 2.5,
          }}
        >
          {RECRUITMENT_STAGES.map((st) => (
            <Card
              key={st.number}
              sx={{
                borderRadius: 2.5,
                border: '1.5px solid #E2E8F0',
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                minHeight: 185,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  borderColor: '#018730',
                  transform: 'translateY(-3px)',
                  boxShadow: '0 8px 24px rgba(1, 135, 48, 0.12)',
                },
              }}
            >
              <Box
                sx={{
                  bgcolor: st.number % 2 === 0 ? '#018730' : '#fc4509',
                  color: '#FFFFFF',
                  py: 1,
                  px: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em' }}>
                  TAHAP {st.number}
                </Typography>
                <Chip
                  label={st.shortName}
                  size="small"
                  sx={{
                    bgcolor: 'rgba(255,255,255,0.2)',
                    color: '#FFFFFF',
                    fontWeight: 700,
                    fontSize: 10,
                    height: 20,
                  }}
                />
              </Box>
              <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, lineHeight: 1.3 }}>
                  {st.name}
                </Typography>
                <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.5, fontSize: 13, flex: 1 }}>
                  {st.description}
                </Typography>
              </CardContent>
            </Card>
          ))}

          {/* 8th Balanced Milestone Card: Onboarding & ID Card */}
          <Card
            sx={{
              borderRadius: 2.5,
              border: '1.5px dashed #018730',
              display: 'flex',
              flexDirection: 'column',
              height: '100%',
              minHeight: 185,
              bgcolor: '#F0FDF4',
              transition: 'all 0.2s ease-in-out',
              '&:hover': {
                borderColor: '#005c21',
                transform: 'translateY(-3px)',
                boxShadow: '0 8px 24px rgba(1, 135, 48, 0.16)',
              },
            }}
          >
            <Box
              sx={{
                bgcolor: '#0F172A',
                color: '#FFFFFF',
                py: 1,
                px: 2,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}
            >
              <Typography variant="caption" sx={{ fontWeight: 800, letterSpacing: '0.05em', color: '#4ADE80' }}>
                HASIL AKHIR
              </Typography>
              <Chip
                icon={<CelebrationIcon sx={{ fontSize: 14, color: '#FED7AA !important' }} />}
                label="Onboarding"
                size="small"
                sx={{
                  bgcolor: 'rgba(255,255,255,0.15)',
                  color: '#FED7AA',
                  fontWeight: 700,
                  fontSize: 10,
                  height: 20,
                }}
              />
            </Box>
            <CardContent sx={{ p: 2.5, flex: 1, display: 'flex', flexDirection: 'column' }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 800, color: '#0F172A', mb: 1, lineHeight: 1.3 }}>
                Selamat Bergabung di PT ITSP!
              </Typography>
              <Typography variant="body2" sx={{ color: '#166534', lineHeight: 1.5, fontSize: 13, flex: 1 }}>
                Penerbitan ID Card Karyawan berstandar CR80, orientasi plant pabrik, dan penempatan kerja resmi.
              </Typography>
            </CardContent>
          </Card>
        </Box>
      </Container>

      {/* Active Job Postings Section */}
      <Box id="lowongan" sx={{ bgcolor: '#FFFFFF', py: 8, borderTop: '1px solid #E2E8F0' }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'flex-end', mb: 4, gap: 2 }}>
            <Box>
              <Typography variant="overline" sx={{ color: '#fc4509', fontWeight: 800, fontSize: 13 }}>
                PELUANG KARIR TERBUKA
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, fontSize: { xs: 26, sm: 32, md: 36 } }}>
                Daftar Lowongan Kerja Aktif
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              Menampilkan {filteredJobs.length} posisi yang siap dilamar
            </Typography>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <TextField
              placeholder="Cari posisi, keahlian, atau lokasi pabrik..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              sx={{ flex: '1 1 300px' }}
              slotProps={{
                input: {
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: '#94A3B8' }} />
                    </InputAdornment>
                  ),
                },
              }}
            />
            <TextField
              select
              label="Departemen"
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept === 'All' ? 'Semua Departemen' : dept}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Job List Cards */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#018730' }} />
              <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
                Memuat data lowongan kerja...
              </Typography>
            </Box>
          ) : filteredJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
              <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>
                Tidak ada lowongan yang sesuai dengan pencarian Anda.
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                Silakan ubah kata kunci pencarian atau pilih departemen lain.
              </Typography>
            </Box>
          ) : (
            <Box
              sx={{
                display: 'grid',
                gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
                gap: 3,
              }}
            >
              {filteredJobs.map((job) => (
                <Card
                  key={job.id}
                  sx={{
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    borderRadius: 3,
                    border: '1.5px solid #E2E8F0',
                    transition: 'all 0.25s ease-in-out',
                    '&:hover': {
                      borderColor: '#018730',
                      boxShadow: '0 8px 24px rgba(1, 135, 48, 0.12)',
                      transform: 'translateY(-3px)',
                    },
                  }}
                >
                  <CardContent sx={{ p: 3, flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5, gap: 1 }}>
                      <Box>
                        <Typography variant="h5" sx={{ fontWeight: 800, color: '#0F172A', fontSize: 20 }}>
                          {job.title}
                        </Typography>
                        <Typography variant="subtitle2" sx={{ color: '#018730', fontWeight: 700 }}>
                          {job.department}
                        </Typography>
                      </Box>
                      <Chip
                        label={job.type}
                        size="small"
                        sx={{ bgcolor: '#DCFCE7', color: '#15803D', fontWeight: 700, borderRadius: 1.5 }}
                      />
                    </Box>

                    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, color: '#64748B', fontSize: 13, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <LocationIcon sx={{ fontSize: 16, color: '#fc4509' }} />
                        <span>{job.location}</span>
                      </Box>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                        <WorkIcon sx={{ fontSize: 16, color: '#018730' }} />
                        <span>Pengalaman: {job.experience}</span>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 2 }}>
                      {job.description}
                    </Typography>

                    <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                        Kualifikasi Utama:
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.5, display: 'block' }}>
                        {job.requirements}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        Upload CV: Max 100 KB (PDF)
                      </Typography>
                      <Button
                        component={Link}
                        href={`/apply/${job.id}`}
                        variant="contained"
                        endIcon={<ArrowForwardIcon />}
                        sx={{
                          bgcolor: '#018730',
                          color: '#FFFFFF',
                          fontWeight: 700,
                          borderRadius: 2,
                          px: 3,
                          '&:hover': { bgcolor: '#005c21' },
                        }}
                      >
                        Lamar Sekarang
                      </Button>
                    </Box>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
