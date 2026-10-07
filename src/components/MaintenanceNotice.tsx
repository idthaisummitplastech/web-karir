'use client';

import * as React from 'react';
import Link from 'next/link';
import {
  Box,
  Container,
  Typography,
  Card,
  Button,
  Chip,
  Grid,
  Stack,
  Divider,
} from '@mui/material';
import EngineeringIcon from '@mui/icons-material/Engineering';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import PublicIcon from '@mui/icons-material/Public';
import SpeedIcon from '@mui/icons-material/Speed';
import SecurityIcon from '@mui/icons-material/Security';
import SupportAgentIcon from '@mui/icons-material/SupportAgent';
import EmailIcon from '@mui/icons-material/Email';

interface MaintenanceNoticeProps {
  title?: string;
  subtitle?: string;
  isNotFound?: boolean;
}

export default function MaintenanceNotice({
  title = 'Career Services Under Maintenance & Integration',
  subtitle = 'The page or vacancy you are looking for is being updated by the PT Indonesia Thai Summit Plastech Recruitment & HR Team to ensure a smooth and accurate selection process.',
  isNotFound = false,
}: MaintenanceNoticeProps) {
  return (
    <Box
      sx={{
        bgcolor: '#F8FAFC',
        minHeight: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 12 },
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: '-10%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '700px',
          height: '350px',
          background: 'radial-gradient(circle, rgba(1,135,48,0.12) 0%, rgba(252,69,9,0.05) 50%, transparent 70%)',
          filter: 'blur(50px)',
          zIndex: 0,
          pointerEvents: 'none',
        }}
      />

      <Container maxWidth="md" sx={{ position: 'relative', zIndex: 1 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.1)',
            bgcolor: '#FFFFFF',
            overflow: 'hidden',
            textAlign: 'center',
            p: { xs: 3, sm: 6 },
          }}
        >
          <Box
            sx={{
              height: 5,
              width: '100%',
              background: 'linear-gradient(90deg, #018730 0%, #fc4509 100%)',
              position: 'absolute',
              top: 0,
              left: 0,
            }}
          />

          <Box
            sx={{
              width: 96,
              height: 96,
              borderRadius: '50%',
              bgcolor: 'rgba(1, 135, 48, 0.08)',
              color: '#018730',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto',
              mb: 3,
              boxShadow: '0 0 0 10px rgba(1, 135, 48, 0.04)',
            }}
          >
            <EngineeringIcon sx={{ fontSize: 52 }} />
          </Box>

          <Chip
            label={isNotFound ? '🛠️ PAGE / VACANCY IN PROGRESS' : '⚡ RECRUITMENT SYSTEM MAINTENANCE'}
            sx={{
              bgcolor: 'rgba(1, 135, 48, 0.1)',
              color: '#018730',
              fontWeight: 800,
              fontSize: 12,
              letterSpacing: 0.8,
              py: 0.5,
              px: 1,
              mb: 2.5,
              borderRadius: '20px',
            }}
          />

          <Typography
            variant="h3"
            component="h1"
            sx={{
              fontWeight: 800,
              fontSize: { xs: 26, sm: 34, md: 38 },
              color: '#0F172A',
              letterSpacing: '-0.02em',
              lineHeight: 1.25,
              mb: 2,
            }}
          >
            {title}
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#64748B',
              fontSize: { xs: 15, sm: 17 },
              lineHeight: 1.7,
              maxWidth: 640,
              mx: 'auto',
              mb: 4,
            }}
          >
            {subtitle}
          </Typography>

          <Grid container spacing={2} sx={{ mb: 4, textAlign: 'left' }}>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', height: '100%' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                  <SpeedIcon sx={{ color: '#018730', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    Sistem ATS Aktif
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  Data pelamar yang sudah masuk tetap aman dan tersimpan.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', height: '100%' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                  <SecurityIcon sx={{ color: '#018730', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    Seleksi 100% Gratis
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  PT ITSP does not charge any fees at any stage of the recruitment process.
                </Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Box sx={{ p: 2, borderRadius: 2.5, bgcolor: '#F8FAFC', border: '1px solid #F1F5F9', height: '100%' }}>
                <Stack direction="row" spacing={1.5} alignItems="center" sx={{ mb: 0.5 }}>
                  <SupportAgentIcon sx={{ color: '#018730', fontSize: 20 }} />
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, color: '#1E293B' }}>
                    HR Support
                  </Typography>
                </Stack>
                <Typography variant="caption" sx={{ color: '#64748B', display: 'block', lineHeight: 1.4 }}>
                  Contact the recruitment team via the official company email.
                </Typography>
              </Box>
            </Grid>
          </Grid>

          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={2}
            justifyContent="center"
            sx={{ mb: 4 }}
          >
            <Button
              component={Link}
              href="/"
              variant="contained"
              size="large"
              startIcon={<HomeIcon />}
              sx={{
                bgcolor: '#018730',
                color: '#FFFFFF',
                fontWeight: 700,
                px: 3.5,
                py: 1.3,
                borderRadius: 2.5,
                boxShadow: '0 10px 20px -5px rgba(1, 135, 48, 0.4)',
                '&:hover': { bgcolor: '#016d26' },
              }}
            >
              Career Home
            </Button>
            <Button
              component={Link}
              href="/portal"
              variant="outlined"
              size="large"
              startIcon={<AssignmentIndIcon />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 600,
                px: 3,
                py: 1.3,
                borderRadius: 2.5,
                '&:hover': {
                  borderColor: '#018730',
                  color: '#018730',
                  bgcolor: 'rgba(1, 135, 48, 0.04)',
                },
              }}
            >
              Applicant Portal
            </Button>
            <Button
              component="a"
              href="https://thaisummitplastech.co.id"
              variant="text"
              size="large"
              startIcon={<PublicIcon />}
              sx={{
                color: '#64748B',
                fontWeight: 600,
                px: 2,
                py: 1.3,
                borderRadius: 2.5,
                '&:hover': { color: '#018730', bgcolor: 'rgba(1, 135, 48, 0.04)' },
              }}
            >
              Website Company
            </Button>
          </Stack>

          <Divider sx={{ my: 3, borderColor: '#F1F5F9' }} />

          <Stack
            direction="row"
            spacing={1}
            justifyContent="center"
            alignItems="center"
            sx={{ color: '#64748B', fontSize: 13 }}
          >
            <EmailIcon sx={{ fontSize: 16, color: '#fc4509' }} />
            <span>HR & Recruitment Contact: info.itsp@thaisummit.co.id</span>
          </Stack>
        </Card>
      </Container>
    </Box>
  );
}
