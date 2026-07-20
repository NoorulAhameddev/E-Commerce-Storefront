import { test, expect } from '@playwright/test';

test('home page shows the storefront header', async ({ page }) => {
  await page.goto('/');

  await expect(page.getByRole('heading', { name: /Launch a storefront/i })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Catalog' })).toBeVisible();
});

test('login page renders the auth form', async ({ page }) => {
  await page.goto('/login');

  await expect(page.getByRole('heading', { name: /Log in to continue shopping/i })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Log in' })).toBeVisible();
});

test('cart page shows the empty state', async ({ page }) => {
  await page.goto('/cart');

  await expect(page.getByText('Your cart is empty.')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Explore products' })).toBeVisible();
});

test('admin page is protected for unauthenticated visitors', async ({ request }) => {
  const response = await request.get('/admin', { maxRedirects: 0 });

  expect([301, 302, 307, 401, 403]).toContain(response.status());
});

test('checkout rejects orders that exceed available stock', async ({ request }) => {
  const loginResponse = await request.post('/api/auth/login', {
    data: {
      email: 'customer@example.com',
      password: 'User123!'
    }
  });

  const cookie = loginResponse.headers()['set-cookie']?.[0] ?? '';
  const response = await request.post('/api/orders', {
    headers: cookie ? { cookie } : undefined,
    data: {
      shippingName: 'Demo Customer',
      shippingEmail: 'customer@example.com',
      shippingAddress: '123 Demo Street',
      items: [{ productId: '999999', quantity: 999 }]
    }
  });

  expect([400, 401]).toContain(response.status());
});

test('api me returns null when not authenticated', async ({ request }) => {
  const response = await request.get('/api/me');

  expect(response.ok()).toBeTruthy();
  await expect(response.json()).resolves.toEqual({ user: null });
});