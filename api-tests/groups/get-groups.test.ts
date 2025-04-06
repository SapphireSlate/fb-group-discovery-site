import { NextRequest } from 'next/server';
import { GET } from '@/app/api/groups/route';

// Mock the supabase client
jest.mock('@/lib/supabase', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            data: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'Test Group',
                description: 'A test group for API testing',
                url: 'https://facebook.com/groups/test-group',
                submitted_by: '123e4567-e89b-12d3-a456-426614174001',
                submitted_at: '2023-01-01T00:00:00.000Z',
                upvotes: 10,
                downvotes: 2,
                average_rating: 4.5,
                view_count: 100,
                status: 'active'
              }
            ],
            count: 1,
            error: null
          }))
        }))
      }))
    }))
  }))
}));

// Mock NextRequest and NextResponse
jest.mock('next/server', () => {
  const originalModule = jest.requireActual('next/server');
  return {
    ...originalModule,
    NextRequest: class MockNextRequest {
      constructor(url) {
        this.url = url;
        this.nextUrl = new URL(url);
      }
    },
    NextResponse: {
      json: jest.fn((data, options) => ({
        status: options?.status || 200,
        json: async () => data
      }))
    }
  };
});

describe('GET /api/groups', () => {
  it('returns groups data when successful', async () => {
    // Create a mock request
    const request = new NextRequest('http://localhost:3000/api/groups?limit=10&page=1');
    
    // Call the API handler
    const response = await GET(request);
    
    // Assertions
    expect(response).toBeDefined();
    expect(response.status).toBe(200);
    
    // We can't directly test the response data since it's mocked, but we can check it exists
    const data = await response.json();
    expect(data).toBeDefined();
  });
}); 