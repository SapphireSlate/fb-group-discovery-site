import React from 'react';
import { render, screen } from '@testing-library/react';

jest.mock('next/navigation', () => ({
  redirect: jest.fn(),
}));

jest.mock('@/lib/auth', () => ({
  requireAdmin: jest.fn().mockResolvedValue({ id: 'auth-1' }),
}));

jest.mock('@/lib/report-queries', () => ({
  getReportCounts: jest.fn().mockResolvedValue({ pending: 1, in_review: 2, resolved: 3, dismissed: 4, total: 10 }),
  getReports: jest.fn().mockResolvedValue({ reports: [], count: 0 }),
}));

describe('Admin Reports Page', () => {
  it('renders counts', async () => {
    const Page = (await import('@/app/admin/reports/page')).default as any;
    const ui = await Page({ searchParams: Promise.resolve({}) });
    render(ui as React.ReactElement);
    expect(await screen.findByText(/Report Management/)).toBeInTheDocument();
  });
});


