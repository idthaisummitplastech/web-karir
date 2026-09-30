import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Ruang Ujian Online | PT Indonesia Thai Summit Plastech',
  other: {
    google: 'notranslate',
  },
};

export default function TestLayout({ children }: { children: React.ReactNode }) {
  return (
    <div translate="no" className="notranslate" style={{ minHeight: '100vh' }}>
      {children}
    </div>
  );
}
