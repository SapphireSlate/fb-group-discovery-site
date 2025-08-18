/**
 * Basic admin access tests (server logic mocked)
 */
import { requireAdmin } from '@/lib/auth';

jest.mock('@/lib/supabase', () => ({
  createServerClient: jest.fn().mockResolvedValue({
    auth: {
      getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'auth-1' } } } }),
      getUser: jest.fn().mockResolvedValue({ data: { user: { id: 'auth-1', email: 'admin@example.com' } }, error: null }),
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { is_admin: true } }) }) })
    }),
  }),
}));

// Mock redirect so it doesn't affect tests
jest.mock('next/navigation', () => ({ redirect: jest.fn() }));

describe('requireAdmin', () => {
  it('allows admin users', async () => {
    const result = await requireAdmin();
    expect(result).toBeTruthy();
  });
});


