import type { Metadata } from 'next';
import './globals.css';
import ThemeRegistry from '@/lib/ThemeRegistry';

export const metadata: Metadata = {
  title: {
    default: 'Career Portal & Recruitment — PT Indonesia Thai Summit Plastech',
    template: '%s | PT ITSP Careers',
  },
  description: 'Official Recruitment System & Integrated Career Portal PT Indonesia Thai Summit Plastech (Thai Summit Group).',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
  other: {
    google: 'notranslate',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="notranslate" translate="no">
      <head>
        <meta name="google" content="notranslate" />
      </head>
      <body className="notranslate" translate="no">
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
