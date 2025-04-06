import { test, expect } from '@playwright/test';

test.describe('Group Directory Page', () => {
  test('should navigate to the discover page', async ({ page }) => {
    // Navigate to the homepage
    await page.goto('/');
    
    // Click on the "Discover" link in the navigation
    await page.click('text=Discover');
    
    // Check that the URL has changed to the discover page
    await expect(page).toHaveURL(/.*\/discover/);
    
    // Verify that the page title is present
    await expect(page.locator('h1:has-text("Discover Groups")')).toBeVisible();
  });
  
  test('should filter groups by category', async ({ page }) => {
    // Navigate directly to the discover page
    await page.goto('/discover');
    
    // Wait for the page to load
    await page.waitForSelector('[data-testid="category-filter"]');
    
    // Click to open the category dropdown
    await page.click('[data-testid="category-filter"]');
    
    // Select a category
    await page.click('text=Technology');
    
    // Wait for the page to update with filtered results
    await page.waitForTimeout(500);
    
    // Check URL contains the category parameter
    await expect(page).toHaveURL(/.*category=.*/);
    
    // Verify that at least one group card is displayed
    await expect(page.locator('[data-testid="group-card"]')).toBeVisible();
  });
  
  test('should search for groups', async ({ page }) => {
    // Navigate to the discover page
    await page.goto('/discover');
    
    // Type a search query
    await page.fill('[data-testid="search-input"]', 'programming');
    
    // Click the search button
    await page.click('[data-testid="search-button"]');
    
    // Wait for search results to load
    await page.waitForTimeout(500);
    
    // Check URL contains the search parameter
    await expect(page).toHaveURL(/.*q=programming.*/);
    
    // Verify search results containing the term (case insensitive)
    const resultsText = await page.locator('body').textContent();
    expect(resultsText.toLowerCase()).toContain('programming');
  });
  
  test('should view group details', async ({ page }) => {
    // Navigate to the discover page
    await page.goto('/discover');
    
    // Wait for the page to load with group cards
    await page.waitForSelector('[data-testid="group-card"]');
    
    // Click on the first group card
    await page.locator('[data-testid="group-card"]').first().click();
    
    // Wait for the group details page to load
    await page.waitForSelector('[data-testid="group-details"]');
    
    // Verify the group details are displayed
    await expect(page.locator('[data-testid="group-name"]')).toBeVisible();
    await expect(page.locator('[data-testid="group-description"]')).toBeVisible();
  });
}); 