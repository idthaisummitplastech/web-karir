import type { Metadata } from 'next';
import './globals.css';
import ThemeRegistry from '@/lib/ThemeRegistry';

export const metadata: Metadata = {
  title: {
    default: 'Portal Karir & Rekrutmen — PT Indonesia Thai Summit Plastech',
    template: '%s | Karir PT ITSP',
  },
  description: 'Sistem Penerimaan Karyawan Resmi & Portal Karir Terpadu PT Indonesia Thai Summit Plastech (Thai Summit Group).',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
