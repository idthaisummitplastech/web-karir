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
import { useLanguage } from '@/lib/LanguageContext';
import { translateJob, JobItem } from '@/lib/contentTranslator';

export default function HomePage() {
  const { language, t } = useLanguage();
  const [jobs, setJobs] = useState<JobItem[]>([]);
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

  // Translate all jobs dynamically based on current language
  const localizedJobs = jobs.map((j) => translateJob(j, language));

  const departments = ['All', ...Array.from(new Set(localizedJobs.map((j) => j.department)))];

  const filteredJobs = localizedJobs.filter((job) => {
    const matchSearch =
      job.title.toLowerCase().includes(search.toLowerCase()) ||
      job.requirements.toLowerCase().includes(search.toLowerCase()) ||
      job.location.toLowerCase().includes(search.toLowerCase());
    const matchDept = departmentFilter === 'All' || job.department === departmentFilter;
    return matchSearch && matchDept;
  });

  // Bilingual stages mapping
  const stageTranslations: Record<number, { name: string; shortName: string; desc: string }> = {
    1: {
      name: language === 'en' ? 'Administrative & CV Screening' : 'Seleksi Administrasi & Berkas',
      shortName: language === 'en' ? 'Screening' : 'Screening',
      desc: language === 'en'
        ? 'Document verification and qualification review against position criteria by the HR Team.'
        : 'Verifikasi berkas administrasi dan riwayat kualifikasi oleh Tim HR PT ITSP.',
    },
    2: {
      name: language === 'en' ? 'Online Psychometric Assessment' : 'Tes Psikotes Online',
      shortName: language === 'en' ? 'Psychometrics' : 'Psikotes',
      desc: language === 'en'
        ? 'Standardized psychological evaluation and aptitude testing with secure session tokens.'
        : 'Ujian psikotes dan potensi akademik online dengan token sesi & pengawasan aman.',
    },
    3: {
      name: language === 'en' ? 'Technical Competency Test' : 'Tes Teknis / User Test',
      shortName: language === 'en' ? 'Technical Test' : 'Tes Teknis',
      desc: language === 'en'
        ? 'Assessment of practical technical expertise aligned with department requirements.'
        : 'Uji kompetensi teknis dan spesialisasi sesuai departemen yang dilamar.',
    },
    4: {
      name: language === 'en' ? 'HR In-Depth Interview' : 'Interview HR (Online / Onsite)',
      shortName: language === 'en' ? 'HR Interview' : 'Interview HR',
      desc: language === 'en'
        ? 'Behavioral and cultural alignment interview with PT ITSP Human Resources.'
        : 'Wawancara kompetensi kepribadian & budaya kerja bersama Tim HRD PT ITSP.',
    },
    5: {
      name: language === 'en' ? 'User & Department Interview' : 'Interview User Departemen',
      shortName: language === 'en' ? 'User Interview' : 'Interview User',
      desc: language === 'en'
        ? 'In-depth interview with Department Heads & Section Supervisors.'
        : 'Wawancara teknis mendalam bersama Kepala Departemen & Supervisor terkait.',
    },
    6: {
      name: language === 'en' ? 'Medical Check-Up (MCU)' : 'Medical Check-Up (MCU Rekanan)',
      shortName: language === 'en' ? 'MCU' : 'MCU',
      desc: language === 'en'
        ? 'Physical fitness and occupational health check at certified medical partner clinics.'
        : 'Pemeriksaan kesehatan fisik di Klinik / RS Rekanan resmi PT ITSP.',
    },
    7: {
      name: language === 'en' ? 'Job Offer & Contract Signing' : 'Offering Letter & Kontrak Kerja',
      shortName: language === 'en' ? 'Offering' : 'Offering',
      desc: language === 'en'
        ? 'Official job offer letter detailing compensation package and contract signing.'
        : 'Penerbitan surat penawaran kerja resmi, kompensasi & benefit, serta penandatanganan kontrak.',
    },
  };

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
                label={t('hero_badge', 'OFFICIAL RECRUITMENT PORTAL PT ITSP')}
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
                component="h1"
                sx={{
                  fontWeight: 800,
                  fontSize: { xs: 30, sm: 38, md: 46 },
                  lineHeight: 1.18,
                  mb: 2,
                  letterSpacing: '-0.03em',
                }}
              >
                {language === 'en' ? 'Build Your Future Career With' : 'Bangun Karir Masa Depan Anda Bersama'}{' '}
                <Box component="span" sx={{ color: '#FED7AA' }}>
                  {language === 'en' ? 'Automotive Innovation Leaders' : 'Pemimpin Inovasi Otomotif'}
                </Box>
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
                {t('hero_subtitle', 'Join our world-class automotive manufacturing team. Explore high-impact career opportunities in plastic injection molding, precision tooling, robotic spray painting, and interior assembly.')}
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
                  {t('hero_btn_explore', 'Explore Openings')}
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
                  {t('hero_btn_portal', 'Check Application Status')}
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
                <ShieldIcon sx={{ color: '#fc4509' }} />{' '}
                {language === 'en' ? 'Recruitment System Highlights' : 'Keunggulan Sistem Rekrutmen'}
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.8 }}>
                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#4ADE80', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: 13.5 }}>
                    <strong>{language === 'en' ? 'Transparent 7-Step Workflow:' : 'Alur 7 Tahap Transparan:'}</strong>{' '}
                    {language === 'en' ? 'Live status tracking in your applicant dashboard.' : 'Informasi status seleksi diperbarui langsung di dashboard Anda.'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#4ADE80', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: 13.5 }}>
                    <strong>{language === 'en' ? 'Scheduled Online Exams:' : 'Tes Online Terjadwal:'}</strong>{' '}
                    {language === 'en' ? 'Psychometric & technical exams with verified session tokens & security.' : 'Ujian psikotes & teknis dengan token sesi & sistem anti-kecurangan aman.'}
                  </Typography>
                </Box>
                <Box sx={{ display: 'flex', gap: 1.2 }}>
                  <CheckCircleIcon sx={{ color: '#4ADE80', fontSize: 20 }} />
                  <Typography variant="body2" sx={{ color: '#E2E8F0', fontSize: 13.5 }}>
                    <strong>{language === 'en' ? 'Automated Email Notifications:' : 'Notifikasi Email Otomatis:'}</strong>{' '}
                    {language === 'en' ? 'Official selection decisions sent directly to candidate emails.' : 'Setiap keputusan resmi dikirimkan langsung ke email kandidat.'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>

      {/* 7-Stage Process Stepper Overview */}
      <Container maxWidth="lg" id="tahapan" sx={{ py: 8 }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography
            variant="overline"
            sx={{ color: '#018730', fontWeight: 800, fontSize: 13, letterSpacing: '0.1em' }}
          >
            {t('stages_badge', 'TRANSPARENT RECRUITMENT')}
          </Typography>
          <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, mb: 1.5, fontSize: { xs: 26, sm: 32, md: 36 } }}>
            {t('stages_title', '7 Steps of Integrated Selection Process')}
          </Typography>
          <Typography variant="body1" sx={{ color: '#64748B', maxWidth: 680, mx: 'auto' }}>
            {t('stages_subtitle', 'Our recruitment process is completely transparent, merit-based, and 100% FREE OF CHARGE at every stage. Beware of fraudulent job offers.')}
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
          {RECRUITMENT_STAGES.map((st) => {
            const stage = stageTranslations[st.number] || st;
            return (
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
                    {language === 'en' ? `STAGE ${st.number}` : `TAHAP ${st.number}`}
                  </Typography>
                  <Chip
                    label={stage.shortName}
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
                    {stage.name}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#64748B', lineHeight: 1.5, fontSize: 13, flex: 1 }}>
                    {stage.desc}
                  </Typography>
                </CardContent>
              </Card>
            );
          })}

          {/* 8th Balanced Milestone Card: Onboarding */}
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
                {language === 'en' ? 'FINAL OUTCOME' : 'HASIL AKHIR'}
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
                {language === 'en' ? 'Welcome to PT ITSP Family!' : 'Selamat Bergabung di PT ITSP!'}
              </Typography>
              <Typography variant="body2" sx={{ color: '#166534', lineHeight: 1.5, fontSize: 13, flex: 1 }}>
                {language === 'en'
                  ? 'CR80 standard employee ID card issuance, plant safety induction, and official job placement.'
                  : 'Penerbitan ID Card Karyawan berstandar CR80, orientasi plant pabrik, dan penempatan kerja resmi.'}
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
                {t('jobs_badge', 'CURRENT OPENINGS')}
              </Typography>
              <Typography variant="h3" sx={{ fontWeight: 800, color: '#0F172A', mt: 0.5, fontSize: { xs: 26, sm: 32, md: 36 } }}>
                {t('jobs_title', 'Open Career Opportunities')}
              </Typography>
            </Box>
            <Typography variant="body2" sx={{ color: '#64748B' }}>
              {language === 'en'
                ? `Showing ${filteredJobs.length} active positions ready to apply`
                : `Menampilkan ${filteredJobs.length} posisi yang siap dilamar`}
            </Typography>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2, mb: 4 }}>
            <TextField
              placeholder={t('search_placeholder', 'Search position, department, or location...')}
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
              label={t('dept_filter_label', 'Department')}
              value={departmentFilter}
              onChange={(e) => setDepartmentFilter(e.target.value)}
              sx={{ minWidth: 220 }}
            >
              {departments.map((dept) => (
                <MenuItem key={dept} value={dept}>
                  {dept === 'All' ? t('dept_filter_all', 'All Departments') : dept}
                </MenuItem>
              ))}
            </TextField>
          </Box>

          {/* Job List Cards */}
          {loading ? (
            <Box sx={{ textAlign: 'center', py: 8 }}>
              <CircularProgress sx={{ color: '#018730' }} />
              <Typography variant="body2" sx={{ color: '#64748B', mt: 2 }}>
                {language === 'en' ? 'Loading career opportunities...' : 'Memuat data lowongan kerja...'}
              </Typography>
            </Box>
          ) : filteredJobs.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 8, bgcolor: '#F8FAFC', borderRadius: 3, border: '1px dashed #CBD5E1' }}>
              <Typography variant="h6" sx={{ color: '#475569', fontWeight: 700 }}>
                {t('job_empty_title', 'No Job Vacancies Found')}
              </Typography>
              <Typography variant="body2" sx={{ color: '#94A3B8', mt: 1 }}>
                {t('job_empty_desc', 'No current job openings match your search criteria. Please try another keyword or department.')}
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
                        <span>{language === 'en' ? `Experience: ${job.experience}` : `Pengalaman: ${job.experience}`}</span>
                      </Box>
                    </Box>

                    <Typography variant="body2" sx={{ color: '#334155', lineHeight: 1.6, mb: 2 }}>
                      {job.description}
                    </Typography>

                    <Box sx={{ p: 1.8, bgcolor: '#F8FAFC', borderRadius: 2, border: '1px solid #E2E8F0', mb: 3 }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, color: '#475569', display: 'block', mb: 0.5 }}>
                        {language === 'en' ? 'Key Qualifications:' : 'Kualifikasi Utama:'}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#64748B', lineHeight: 1.5, display: 'block' }}>
                        {job.requirements}
                      </Typography>
                    </Box>

                    <Box sx={{ mt: 'auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', pt: 1 }}>
                      <Typography variant="caption" sx={{ color: '#94A3B8' }}>
                        {language === 'en' ? 'CV Upload: Max 100 KB (PDF)' : 'Upload CV: Max 100 KB (PDF)'}
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
                        {t('job_btn_apply', 'Apply Now')}
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
