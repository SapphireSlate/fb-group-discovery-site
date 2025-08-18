/**
 * Monetization API tests: ensure admin-only endpoints guard properly
 */

jest.mock('@/lib/supabase', () => ({
  createServerClient: jest.fn().mockResolvedValue({
    auth: { getSession: jest.fn().mockResolvedValue({ data: { session: { user: { id: 'auth-1' } } } }) },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({ eq: jest.fn().mockReturnValue({ single: jest.fn().mockResolvedValue({ data: { is_admin: true, id: 'u1' } }) }) }),
      insert: jest.fn().mockResolvedValue({}),
      order: jest.fn().mockReturnValue({ select: jest.fn() }),
    }),
  }),
}));

describe('Ads Admin API', () => {
  it('POST creates ad when admin', async () => {
    const mod = await import('@/app/api/ads/admin/route');
    const req = new Request('http://localhost/api/ads/admin', { method: 'POST', body: JSON.stringify({ slot: 'top_banner', creative_type: 'image', creative_url: 'https://x', target_url: 'https://y' }) });
    const res = await mod.POST(req as any);
    expect(res.status).toBe(200);
  });
});


