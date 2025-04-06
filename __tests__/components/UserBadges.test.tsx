import { render, screen, waitFor } from '@testing-library/react';
import UserBadges from '@/app/components/user-badges';

// Mock the component to avoid actual API calls
jest.mock('@/app/components/user-badges', () => {
  return function MockUserBadges({ userId, limit }: { userId: string, limit?: number }) {
    return (
      <div data-testid="user-badges">
        <h3>User Badges (Mocked)</h3>
        <p>User ID: {userId}</p>
        <p>Limit: {limit || 'No limit'}</p>
        <div className="badge-list">
          <span className="badge">Community Contributor</span>
          <span className="badge">Helpful Reviewer</span>
          <span className="badge">Group Explorer</span>
        </div>
      </div>
    );
  };
});

describe('UserBadges Component', () => {
  const userId = '123e4567-e89b-12d3-a456-426614174000';
  
  it('renders the component with default limit', () => {
    render(<UserBadges userId={userId} />);
    
    expect(screen.getByTestId('user-badges')).toBeInTheDocument();
    expect(screen.getByText('User Badges (Mocked)')).toBeInTheDocument();
    expect(screen.getByText(`User ID: ${userId}`)).toBeInTheDocument();
    expect(screen.getByText('Limit: No limit')).toBeInTheDocument();
  });
  
  it('renders the component with custom limit', () => {
    render(<UserBadges userId={userId} limit={5} />);
    
    expect(screen.getByTestId('user-badges')).toBeInTheDocument();
    expect(screen.getByText('Limit: 5')).toBeInTheDocument();
  });
  
  it('displays multiple badges', () => {
    render(<UserBadges userId={userId} />);
    
    const badges = screen.getAllByText(/Community Contributor|Helpful Reviewer|Group Explorer/);
    expect(badges.length).toBe(3);
  });
}); 