'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Flag } from 'lucide-react';
import { ReportGroupModal } from '@/app/components/report-group-modal';

interface ReportButtonClientProps {
  groupId: string;
  groupName: string;
  userId: string;
}

export default function ReportButtonClient({ groupId, groupName, userId }: ReportButtonClientProps) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const openModal = () => setIsModalOpen(true);
  const closeModal = () => setIsModalOpen(false);

  return (
    <>
      <Button 
        variant="outline" 
        size="sm" 
        className="w-full"
        onClick={openModal}
      >
        <Flag className="h-4 w-4 mr-2" />
        Report Group
      </Button>

      <ReportGroupModal
        groupId={groupId}
        groupName={groupName}
        userId={userId}
        isOpen={isModalOpen}
        onClose={closeModal}
      />
    </>
  );
} 