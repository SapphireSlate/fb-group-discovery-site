import VerificationList from './VerificationList';

export const metadata = {
  title: 'Group Verification Dashboard',
  description: 'Verify, reject, flag, or review group submissions',
};

export default function GroupVerificationPage() {
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Group Verification Dashboard</h1>
      <VerificationList initialTab="pending" />
    </div>
  );
} 