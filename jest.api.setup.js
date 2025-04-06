// API Test Setup
import 'isomorphic-fetch';
import dotenv from 'dotenv';

// Load environment variables from .env.test if present, otherwise from .env.local
dotenv.config({ path: '.env.test' });
dotenv.config({ path: '.env.local' });

// Mock fetch globally
global.fetch = jest.fn(() =>
  Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(''),
    status: 200,
    ok: true,
  })
);

// Mock NextRequest and NextResponse
jest.mock('next/server', () => ({
  NextRequest: class {
    constructor(url) {
      this.url = url;
      this.nextUrl = new URL(url);
    }
  },
  NextResponse: {
    json: jest.fn((data, options = {}) => ({
      status: options.status || 200,
      json: async () => data,
    })),
  },
}));

// Mock Supabase client
jest.mock('@/lib/supabase/server', () => ({
  createServerClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn(() => Promise.resolve({ data: { session: null }, error: null })),
      getUser: jest.fn(() => Promise.resolve({ data: { user: null }, error: null })),
    },
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          data: [],
          error: null,
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            data: [],
            count: 0,
            error: null,
          })),
          limit: jest.fn(() => ({
            data: [],
            error: null,
          })),
        })),
      })),
    })),
  })),
}));

// Mock cookies
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => ({
    get: jest.fn(() => ({ value: 'test-cookie' })),
  })),
}));

// Mock Route Handler Client
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createRouteHandlerClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn(() => ({
        eq: jest.fn(() => ({
          range: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [
                {
                  id: '1',
                  name: 'Test Group',
                  description: 'Test description',
                  url: 'https://facebook.com/groups/test',
                  category_id: '1',
                  submitted_by: '1',
                  submitted_at: new Date().toISOString(),
                  status: 'approved',
                  upvotes: 10,
                  downvotes: 2,
                  average_rating: 4.5,
                },
              ],
              error: null,
            })),
          })),
        })),
        order: jest.fn(() => ({
          range: jest.fn(() => ({
            limit: jest.fn(() => ({
              data: [
                {
                  id: '1',
                  name: 'Test Group',
                  description: 'Test description',
                  url: 'https://facebook.com/groups/test',
                  category_id: '1',
                  submitted_by: '1',
                  submitted_at: new Date().toISOString(),
                  status: 'approved',
                  upvotes: 10,
                  downvotes: 2,
                  average_rating: 4.5,
                },
              ],
              error: null,
            })),
          })),
        })),
      })),
      count: jest.fn(() => ({ 
        data: { count: 1 }, 
        error: null 
      })),
    })),
  })),
}));

// Mock security functions
jest.mock('@/lib/security', () => ({
  applyApiSecurity: jest.fn(() => null),
  createInternalServerErrorResponse: jest.fn(() => ({ status: 500, body: { error: 'Internal Server Error' } })),
  createUnauthorizedResponse: jest.fn(() => ({ status: 401, body: { error: 'Unauthorized' } })),
  verifyRecaptcha: jest.fn(() => Promise.resolve({ success: true })),
}));

// Mock validation
jest.mock('@/lib/validation', () => ({
  groupSubmissionSchema: {
    parse: jest.fn((data) => data),
  },
  validateGroupSubmissionWithCaptcha: jest.fn(() => ({ success: true })),
}));

// Global timeout (useful for API tests that might take longer than the default 5000ms)
jest.setTimeout(15000);

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
});

// Clean up after each test
afterEach(() => {
  jest.clearAllMocks();
}); 