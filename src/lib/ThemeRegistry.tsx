'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { LanguageProvider } from './LanguageContext';
import AutoTranslatorInit from '@/components/AutoTranslatorInit';

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  return (
    <AppRouterCacheProvider>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <LanguageProvider>
          <AutoTranslatorInit />
          {children}
        </LanguageProvider>
      </ThemeProvider>
    </AppRouterCacheProvider>
  );
}
