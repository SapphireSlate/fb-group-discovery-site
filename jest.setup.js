import '@testing-library/jest-dom';

// Optional: configure or set up a testing framework before each test.
// If you delete this file, remove `setupFilesAfterEnv` from `jest.config.js`

import '@testing-library/jest-dom';
import 'isomorphic-fetch';

// Mock Supabase
jest.mock('@supabase/auth-helpers-nextjs', () => ({
  createServerComponentClient: jest.fn(() => ({
    auth: {
      getSession: jest.fn().mockResolvedValue({
        data: { session: null }
      })
    },
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      neq: jest.fn().mockReturnThis(),
      gt: jest.fn().mockReturnThis(),
      lt: jest.fn().mockReturnThis(),
      lte: jest.fn().mockReturnThis(),
      gte: jest.fn().mockReturnThis(),
      is: jest.fn().mockReturnThis(),
      in: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: null,
        error: null
      }),
      then: jest.fn().mockResolvedValue({
        data: [],
        error: null
      })
    })
  })),
  createMiddlewareClient: jest.fn()
}));

// Mock Next.js routing
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(() => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  })),
  useSearchParams: jest.fn(() => new URLSearchParams()),
  usePathname: jest.fn(() => ''),
  notFound: jest.fn(),
  redirect: jest.fn(),
}));

// Mock window.matchMedia
global.matchMedia = global.matchMedia || function() {
  return {
    matches: false,
    addListener: jest.fn(),
    removeListener: jest.fn(),
  };
};

// Clear all mocks between tests
beforeEach(() => {
  jest.clearAllMocks();
}); 
// Mock next/headers cookies API for server-side code in tests
jest.mock('next/headers', () => ({
  cookies: jest.fn(() => {
    const store = new Map();
    return {
      get: (name) => {
        const value = store.get(name);
        return value !== undefined ? { name, value } : undefined;
      },
      set: ({ name, value }) => { store.set(name, value); },
    };
  }),
}));
// Polyfill Response.json for node test envs
try {
  // @ts-ignore
  if (typeof Response !== 'undefined' && typeof Response.json !== 'function') {
    // @ts-ignore
    Response.json = (data, init) => new Response(JSON.stringify(data), {
      headers: { 'content-type': 'application/json' },
      ...(init || {}),
    });
  }
} catch {}