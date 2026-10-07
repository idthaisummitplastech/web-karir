import * as React from 'react';
import type { Metadata } from 'next';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'System Maintenance — PT ITSP Career Portal',
  description: 'Sistem rekrutmen online PT Indonesia Thai Summit Plastech sedang dalam pemeliharaan berkala.',
};

export default function KarirMaintenancePage() {
  return (
    <MaintenanceNotice
      title="Recruitment System Under Maintenance"
      subtitle="Portal Karir PT Indonesia Thai Summit Plastech sedang melakukan pemeliharaan server berkala. Data dan progres lamaran yang sudah masuk tetap aman. Silakan kunjungi kembali beberapa saat lagi."
      isNotFound={false}
    />
  );
}
