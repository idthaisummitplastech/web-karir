import type { Metadata } from 'next';
import './globals.css';
import ThemeRegistry from '@/lib/ThemeRegistry';

export const metadata: Metadata = {
  title: {
    default: 'Portal Karir & Rekrutmen — PT Indonesia Thai Summit Plastech',
    template: '%s | Karir PT ITSP',
  },
  description: 'Sistem Penerimaan Karyawan Resmi & Portal Karir Terpadu PT Indonesia Thai Summit Plastech (Thai Summit Group).',
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16 32x32 48x48', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-icon.png', sizes: '180x180', type: 'image/png' }],
    shortcut: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <head>
        {/* Enterprise React DOM Safety Patch & Auto-Translation Init */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              // 1. Prevent React removeChild / insertBefore crashes from translation DOM mutations
              if (typeof window !== 'undefined' && typeof Node === 'function' && Node.prototype) {
                var origRemoveChild = Node.prototype.removeChild;
                Node.prototype.removeChild = function(child) {
                  if (child.parentNode !== this) {
                    if (console && console.warn) console.warn('Protected removeChild mismatch', this, child);
                    return child;
                  }
                  return origRemoveChild.apply(this, arguments);
                };

                var origInsertBefore = Node.prototype.insertBefore;
                Node.prototype.insertBefore = function(newNode, refNode) {
                  if (refNode && refNode.parentNode !== this) {
                    if (console && console.warn) console.warn('Protected insertBefore mismatch', this, refNode);
                    return newNode;
                  }
                  return origInsertBefore.apply(this, arguments);
                };
              }

              // 2. Default to English auto-translation on load
              try {
                var saved = localStorage.getItem('itsp_language');
                var target = saved === 'id' ? '/id/id' : '/id/en';
                document.cookie = 'googtrans=' + target + '; path=/;';
                if (window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1') {
                  document.cookie = 'googtrans=' + target + '; path=/; domain=' + window.location.hostname + ';';
                }
              } catch(e) {}
            `,
          }}
        />
      </head>
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
