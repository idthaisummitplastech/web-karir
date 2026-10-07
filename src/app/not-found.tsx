import * as React from 'react';
import type { Metadata } from 'next';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'Page Under Maintenance — PT ITSP Career Portal',
  description: 'Halaman atau lowongan yang Anda tuju sedang dalam pemeliharaan atau proses pembaruan sistem.',
};

export default function KarirNotFound() {
  return (
    <MaintenanceNotice
      title="Page / Vacancy Under Update"
      subtitle="Tautan yang Anda tuju saat ini sedang dipersiapkan oleh tim Rekrutmen PT Indonesia Thai Summit Plastech. Silakan kembali ke Career Home atau cek status lamaran Anda di Applicant Portal."
      isNotFound={true}
    />
  );
}
