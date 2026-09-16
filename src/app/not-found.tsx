import * as React from 'react';
import type { Metadata } from 'next';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'Halaman Dalam Pemeliharaan — Portal Karir PT ITSP',
  description: 'Halaman atau lowongan yang Anda tuju sedang dalam pemeliharaan atau proses pembaruan sistem.',
};

export default function KarirNotFound() {
  return (
    <MaintenanceNotice
      title="Halaman / Lowongan Sedang Dalam Pembaruan"
      subtitle="Tautan yang Anda tuju saat ini sedang dipersiapkan oleh tim Rekrutmen PT Indonesia Thai Summit Plastech. Silakan kembali ke Beranda Karir atau cek status lamaran Anda di Portal Pelamar."
      isNotFound={true}
    />
  );
}
