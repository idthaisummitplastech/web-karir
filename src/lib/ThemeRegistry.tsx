'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { LanguageProvider } from './LanguageContext';
import AutoTranslatorInit from '@/components/AutoTranslatorInit';

// Enterprise React DOM Safety Patch & Auto-Translation Init
if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
  const origRemoveChild = Node.prototype.removeChild;
  Node.prototype.removeChild = function <T extends Node>(child: T): T {
    if (child.parentNode !== this) {
      if (child.parentNode && this.contains(child)) {
        return child.parentNode.removeChild(child) as T;
      }
      return child;
    }
    return origRemoveChild.call(this, child) as T;
  };

  const origInsertBefore = Node.prototype.insertBefore;
  Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
    if (refNode && refNode.parentNode !== this) {
      if (refNode.parentNode && this.contains(refNode)) {
        return refNode.parentNode.insertBefore(newNode, refNode) as T;
      }
      return origInsertBefore.call(this, newNode, null) as T;
    }
    return origInsertBefore.call(this, newNode, refNode) as T;
  };

  try {
    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/portal/test')) {
      const saved = localStorage.getItem('itsp_language');
      const target = saved === 'id' ? '/id/id' : '/id/en';
      document.cookie = `googtrans=${target}; path=/;`;
      if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
        document.cookie = `googtrans=${target}; path=/; domain=${window.location.hostname};`;
      }
    }
  } catch {}
}

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
