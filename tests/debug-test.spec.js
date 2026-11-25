import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5500';
const API_URL = process.env.API_URL || 'http://localhost:5143';

test('Debug registration flow', async ({ page }) => {
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => consoleMessages.push(`PAGE ERROR: ${err.message}`));

  // Intercept network responses
  page.on('response', response => {
    if (response.url().includes('/api/auth/register') && response.status() >= 400) {
      response.json().then(body => {
        console.log('=== REGISTER API ERROR ===');
        console.log('Status:', response.status());
        console.log('Body:', JSON.stringify(body, null, 2));
      }).catch(() => {
        response.text().then(text => {
          console.log('=== REGISTER API ERROR (text) ===');
          console.log('Status:', response.status());
          console.log('Body:', text);
        });
      });
    }
  });

  await page.addInitScript((apiUrl) => {
    window.API_BASE_URL = apiUrl;
    localStorage.setItem('API_BASE_URL', apiUrl);
  }, API_URL);

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  console.log('=== Initial page loaded ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Click register
  await page.click('#show-register');
  await page.waitForTimeout(500);
  console.log('=== After clicking register ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Fill form
  const testEmail = `test${Date.now()}@example.com`;
  await page.fill('#register-name', 'Test User');
  await page.fill('#register-email', testEmail);
  await page.fill('#register-password', 'Test123456');
  await page.fill('#register-password-confirmation', 'Test123456');

  // Submit
  await page.click('#register-form button[type="submit"]');

  // Wait and collect console messages
  await page.waitForTimeout(5000);
  console.log('=== After registration submit (5s) ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Check where we are
  const currentUrl = page.url();
  const screens = await page.locator('.screen-tab').evaluateAll(els => els.map(el => ({ id: el.id, classes: el.className, hidden: el.classList.contains('hidden') })));
  console.log('Current URL:', currentUrl);
  console.log('Screens:', JSON.stringify(screens, null, 2));

  // Check localStorage
  const localStorageData = await page.evaluate(() => {
    const data = {};
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      data[key] = localStorage.getItem(key);
    }
    return data;
  });
  console.log('localStorage:', JSON.stringify(localStorageData, null, 2));

  // Wait more
  await page.waitForTimeout(5000);
  console.log('=== After 10s total ===');
  consoleMessages.forEach(m => console.log(m));
});