'use client';

import * as React from 'react';
import Link from 'next/link';
import { Box, Container, Typography, Button, Stack, Paper } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import DashboardIcon from '@mui/icons-material/Dashboard';
import SearchOffIcon from '@mui/icons-material/SearchOff';

export default function KarirNotFound() {
  return (
    <Box
      sx={{
        bgcolor: '#F8FAFC',
        minHeight: '85vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: { xs: 8, md: 12 },
        position: 'relative',
      }}
    >
      <Container maxWidth="sm">
        <Paper
          elevation={0}
          sx={{
            p: { xs: 4, sm: 6 },
            borderRadius: 4,
            border: '1px solid #E2E8F0',
            textAlign: 'center',
            bgcolor: '#FFFFFF',
            boxShadow: '0 20px 45px -15px rgba(15, 23, 42, 0.08)',
          }}
        >
          <Box
            sx={{
              width: 80,
              height: 80,
              borderRadius: '50%',
              bgcolor: 'rgba(239, 68, 68, 0.08)',
              color: '#DC2626',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mx: 'auto',
              mb: 3,
            }}
          >
            <SearchOffIcon sx={{ fontSize: 44 }} />
          </Box>

          <Typography
            variant="h2"
            sx={{
              fontWeight: 900,
              fontSize: { xs: 40, sm: 54 },
              color: '#0F172A',
              letterSpacing: '-0.03em',
              mb: 1,
            }}
          >
            404
          </Typography>

          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: '#1E293B',
              mb: 1.5,
              fontSize: { xs: 20, sm: 24 },
            }}
          >
            Page Not Found
          </Typography>

          <Typography
            variant="body1"
            sx={{
              color: '#64748B',
              fontSize: 15,
              lineHeight: 1.6,
              mb: 4,
              maxWidth: 420,
              mx: 'auto',
            }}
          >
            The requested page, vacancy, or document does not exist, has been removed, or is temporarily unavailable.
          </Typography>

          <Stack spacing={1.5} sx={{ flexDirection: { xs: 'column', sm: 'row' }, justifyContent: 'center' }}>
            <Button
              component={Link}
              href="/"
              variant="contained"
              startIcon={<HomeIcon />}
              sx={{
                bgcolor: '#018730',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                px: 3,
                py: 1.2,
                '&:hover': { bgcolor: '#005c21' },
              }}
            >
              Career Home
            </Button>
            <Button
              component={Link}
              href="/portal"
              variant="outlined"
              startIcon={<AssignmentIndIcon />}
              sx={{
                borderColor: '#CBD5E1',
                color: '#334155',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                px: 2.5,
                py: 1.2,
                '&:hover': { borderColor: '#018730', color: '#018730', bgcolor: 'rgba(1, 135, 48, 0.04)' },
              }}
            >
              Applicant Portal
            </Button>
            <Button
              component={Link}
              href="/admin/dashboard"
              variant="text"
              startIcon={<DashboardIcon />}
              sx={{
                color: '#64748B',
                fontWeight: 700,
                textTransform: 'none',
                borderRadius: 2,
                px: 2,
                py: 1.2,
                '&:hover': { color: '#018730', bgcolor: 'rgba(1, 135, 48, 0.04)' },
              }}
            >
              Admin Dashboard
            </Button>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
