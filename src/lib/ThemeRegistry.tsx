'use client';

import * as React from 'react';
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import { LanguageProvider } from './LanguageContext';
import AutoTranslatorInit from '@/components/AutoTranslatorInit';

// Enterprise React DOM Safety Patch — applied once on client, inside component lifecycle
// Auto-Translation cookie sync is handled in LanguageContext + AutoTranslatorInit.
function applyDomSafetyPatch() {
  if (typeof window === 'undefined' || typeof Node !== 'function' || !Node.prototype) return;
  try {
    const proto: any = Node.prototype as any;
    if (proto.__itspPatched) return;
    proto.__itspPatched = true;

    const origRemoveChild = Node.prototype.removeChild;
    Node.prototype.removeChild = function <T extends Node>(child: T): T {
      try {
        if (child.parentNode !== this) {
          if (child.parentNode && (this as any).contains?.(child)) {
            return (child.parentNode as any).removeChild(child) as T;
          }
          return child;
        }
        return (origRemoveChild as any).call(this, child) as T;
      } catch {
        return child;
      }
    };

    const origInsertBefore = Node.prototype.insertBefore;
    Node.prototype.insertBefore = function <T extends Node>(newNode: T, refNode: Node | null): T {
      try {
        if (refNode && (refNode as any).parentNode !== this) {
          if ((refNode as any).parentNode && (this as any).contains?.(refNode)) {
            return (refNode.parentNode as any).insertBefore(newNode, refNode) as T;
          }
          return (origInsertBefore as any).call(this, newNode, null) as T;
        }
        return (origInsertBefore as any).call(this, newNode, refNode) as T;
      } catch {
        return (origInsertBefore as any).call(this, newNode, refNode) as T;
      }
    };
  } catch {}
}

export default function ThemeRegistry({ children }: { children: React.ReactNode }) {
  React.useEffect(() => {
    applyDomSafetyPatch();
  }, []);

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
