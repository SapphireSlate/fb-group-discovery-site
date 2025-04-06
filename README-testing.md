# Testing Documentation

This document outlines the testing strategy and implementation for the Facebook Group Discovery Site.

## Overview

The project implements a comprehensive testing strategy with different levels of tests:

1. **Unit Testing**: Testing individual components, functions, and modules in isolation
2. **Integration Testing**: Testing interactions between different parts of the application
3. **End-to-End Testing**: Testing complete user flows and scenarios
4. **Performance Testing**: Evaluating the application's speed and responsiveness

## Testing Tools

### Unit and Integration Testing

- **Jest**: JavaScript testing framework
- **React Testing Library**: For testing React components
- **Supertest**: For testing API endpoints

### End-to-End Testing

- **Playwright**: For browser automation and E2E testing
- **MSW (Mock Service Worker)**: For mocking API responses in tests

### Performance Testing

- **Lighthouse**: For performance metrics
- **k6**: For load testing (future implementation)

## Test Structure

```
└── Project Root
    ├── __tests__/                  # Unit and component tests
    │   ├── components/             # React component tests
    │   ├── lib/                    # Utility function tests
    │   └── hooks/                  # Custom hook tests
    ├── api-tests/                  # API integration tests
    │   ├── auth/                   # Authentication API tests
    │   ├── groups/                 # Groups API tests
    │   └── users/                  # Users API tests
    ├── e2e/                        # End-to-end tests
    │   ├── auth/                   # Authentication E2E tests
    │   ├── groups/                 # Groups E2E tests 
    │   ├── search/                 # Search functionality E2E tests
    │   └── fixtures/               # Test fixtures and mock data
    ├── jest.config.js              # Jest configuration for unit tests
    ├── jest.api.config.js          # Jest configuration for API tests
    ├── jest.setup.js               # Jest setup for unit tests
    ├── jest.api.setup.js           # Jest setup for API tests
    └── playwright.config.ts        # Playwright configuration
```

## Running Tests

### Unit and Component Tests

```bash
# Run all unit and component tests
npm test

# Run tests in watch mode during development
npm run test:watch

# Run with coverage report
npm run test:ci
```

### API Tests

```bash
# Run API integration tests
npm run test:api
```

### End-to-End Tests

```bash
# Run E2E tests
npm run test:e2e
```

## Testing Guidelines

### Component Testing

1. Test the component's rendering and behavior in isolation
2. Mock external dependencies and API calls
3. Test both default and edge cases
4. Focus on user interactions rather than implementation details

Example:

```tsx
import { render, screen, fireEvent } from '@testing-library/react';
import Button from '@/components/ui/button';

describe('Button Component', () => {
  it('renders correctly', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick handler when clicked', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Testing

1. Test all API endpoints with various input combinations
2. Test successful responses and error handling
3. Mock database calls and external services
4. Validate response structure, status codes, and content

Example:

```tsx
import { createRequest } from 'node-mocks-http';
import { GET } from '@/app/api/groups/route';

describe('GET /api/groups', () => {
  it('returns a list of groups', async () => {
    const req = createRequest({
      method: 'GET',
      url: '/api/groups?limit=10',
    });
    
    const res = await GET(req);
    const data = await res.json();
    
    expect(res.status).toBe(200);
    expect(data.data.length).toBeLessThanOrEqual(10);
  });
});
```

### E2E Testing

1. Test complete user flows from start to finish
2. Cover critical business paths and user journeys
3. Test across different browsers and screen sizes
4. Include accessibility checks

Example:

```tsx
import { test, expect } from '@playwright/test';

test('user can submit a new group', async ({ page }) => {
  // Log in
  await page.goto('/login');
  await page.fill('[data-testid="email-input"]', 'test@example.com');
  await page.fill('[data-testid="password-input"]', 'password123');
  await page.click('[data-testid="login-button"]');
  
  // Navigate to submit form
  await page.click('[data-testid="submit-group-button"]');
  
  // Fill out form
  await page.fill('[data-testid="group-name"]', 'Test Group');
  await page.fill('[data-testid="group-url"]', 'https://facebook.com/groups/test');
  await page.fill('[data-testid="group-description"]', 'A test group');
  await page.selectOption('[data-testid="category-select"]', 'Technology');
  
  // Submit form
  await page.click('[data-testid="submit-button"]');
  
  // Check for success message
  await expect(page.locator('[data-testid="success-message"]')).toBeVisible();
});
```

## Continuous Integration

The testing pipeline is integrated with our CI/CD workflow:

1. All pull requests trigger unit and integration tests
2. E2E tests run on staging environment after successful deployment
3. Performance tests run nightly on the staging environment

## Test Coverage

The project aims for the following test coverage metrics:

- Unit tests: 80% coverage of components and utility functions
- Integration tests: All API endpoints covered with happy path and error cases
- E2E tests: All critical user journeys covered

## Mocking Strategy

### Database Mocking

Database interactions are mocked to avoid test flakiness and ensure deterministic results:

```tsx
// Mock Supabase
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      single: jest.fn().mockResolvedValue({
        data: { /* mock data */ },
        error: null
      })
    })
  }))
}));
```

### API Mocking for E2E Tests

For E2E tests, we use fixtures to provide consistent data:

```tsx
// In playwright.config.ts
use: {
  baseURL: 'http://localhost:3000',
  storageState: 'e2e/fixtures/authenticated-state.json',
}
```

## Resources

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library Documentation](https://testing-library.com/docs/react-testing-library/intro)
- [Playwright Documentation](https://playwright.dev/docs/intro)
- [Supertest Documentation](https://github.com/visionmedia/supertest) 