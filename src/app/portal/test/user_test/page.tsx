'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Box, CircularProgress } from '@mui/material';

export default function UserTestRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/portal/test/user-test');
  }, [router]);

  return (
    <Box sx={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <CircularProgress sx={{ color: '#018730' }} />
    </Box>
  );
}
