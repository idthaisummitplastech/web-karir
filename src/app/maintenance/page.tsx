import * as React from 'react';
import type { Metadata } from 'next';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'System Maintenance — PT ITSP Career Portal',
  description: 'PT Indonesia Thai Summit Plastech online recruitment system is under scheduled maintenance.',
};

export default function KarirMaintenancePage() {
  return (
    <MaintenanceNotice
      title="Recruitment System Under Maintenance"
      subtitle="PT Indonesia Thai Summit Plastech Career Portal is undergoing scheduled server maintenance. Submitted data and application progress remain safe. Please visit again shortly."
      isNotFound={false}
    />
  );
}
