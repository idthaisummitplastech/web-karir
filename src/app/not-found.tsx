import * as React from 'react';
import type { Metadata } from 'next';
import MaintenanceNotice from '@/components/MaintenanceNotice';

export const metadata: Metadata = {
  title: 'Page Under Maintenance — PT ITSP Career Portal',
  description: 'The page or vacancy you are looking for is under maintenance or system update.',
};

export default function KarirNotFound() {
  return (
    <MaintenanceNotice
      title="Page / Vacancy Under Update"
      subtitle="The link you are trying to access is being prepared by the PT Indonesia Thai Summit Plastech Recruitment team. Please return to Career Home or check your application status in the Applicant Portal."
      isNotFound={true}
    />
  );
}
