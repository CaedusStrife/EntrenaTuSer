const { test, expect } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = path.join(__dirname, '..', 'images', 'screenshots');
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
}

// Helper to enable dark mode
async function enableDarkMode(page) {
  await page.evaluate(() => {
    localStorage.setItem('theme', 'dark');
    document.documentElement.setAttribute('data-theme', 'dark');
  });
  await page.waitForTimeout(500);
}

// Helper to register and login a test user
async function authenticateUser(page) {
  // Check if already logged in (app-layout visible)
  const appLayout = page.locator('#app-layout');
  if (await appLayout.isVisible({ timeout: 2000 })) {
    console.log('Already authenticated');
    return;
  }

  // Register a new test user
  const testEmail = `test_${Date.now()}@example.com`;
  const testPassword = 'TestPass123!';
  const testName = 'Test User';

  console.log('Registering test user:', testEmail);

  // Click "Registrarse" link
  const showRegister = page.locator('#show-register, a:has-text("Registrarse"), button:has-text("Registrarse")').first();
  if (await showRegister.isVisible({ timeout: 3000 })) {
    await showRegister.click();
    await page.waitForTimeout(500);
  }

  // Fill registration form
  await page.fill('#register-name', testName);
  await page.fill('#register-email', testEmail);
  await page.fill('#register-password', testPassword);
  await page.fill('#register-password-confirmation', testPassword);

  // Submit registration
  await page.click('#register-form button[type="submit"]');
  
  // Wait for either app-layout to appear OR for error message
  try {
    await page.waitForSelector('#app-layout:not(.hidden)', { timeout: 15000 });
    console.log('User authenticated successfully - app-layout visible');
  } catch (e) {
    // Check for error message
    const errorMsg = await page.locator('#register-status.form-status-error').textContent().catch(() => '');
    console.log('Registration may have failed:', errorMsg);
    // Try login instead
    await page.click('#show-login');
    await page.waitForTimeout(500);
    await page.fill('#login-email', testEmail);
    await page.fill('#login-password', testPassword);
    await page.click('#login-form button[type="submit"]');
    await page.waitForSelector('#app-layout:not(.hidden)', { timeout: 10000 });
    console.log('User authenticated via login');
  }
  await page.waitForTimeout(1000);
}

// Helper to navigate to a tab by calling the app's switchTab() directly
async function navigateToTab(page, tabId) {
  await page.evaluate((id) => {
    const btn = document.querySelector(`.sidebar-menu .nav-btn[onclick*="${id}"]`);
    if (typeof window.switchTab === 'function') {
      window.switchTab(id, btn || undefined);
    } else {
      document.querySelectorAll('.screen-tab.paper-sheet').forEach(s => s.classList.add('hidden'));
      const target = document.getElementById(id);
      if (target) target.classList.remove('hidden');
    }
  }, tabId);
  await page.waitForTimeout(1500);
  return true;
}

test.describe('Screenshots for presentation page (Dark Mode, Authenticated)', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('http://localhost:5500/Entrenatuser/index.html', { waitUntil: 'domcontentloaded' });
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await enableDarkMode(page);
    await authenticateUser(page);
  });

  test('Login/Register screen (before auth)', async ({ page }) => {
    // Logout first to capture login screen
    await page.evaluate(() => localStorage.removeItem('entrena-user'));
    await page.reload();
    await page.waitForLoadState('domcontentloaded');
    await page.waitForTimeout(1000);
    await enableDarkMode(page);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-login.jpg'), fullPage: true, quality: 85 });
  });

  test('Dashboard/Progress screen', async ({ page }) => {
    await navigateToTab(page, 'screen-progress');
    await page.waitForTimeout(2000); // Wait for charts to render
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-progress.jpg'), fullPage: true, quality: 85 });
  });

  test('Training screen', async ({ page }) => {
    await navigateToTab(page, 'screen-workout');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-training.jpg'), fullPage: true, quality: 85 });
  });

  test('Routines screen', async ({ page }) => {
    await navigateToTab(page, 'screen-routines');
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-routines.jpg'), fullPage: true, quality: 85 });
  });

  test('Chatbot screen', async ({ page }) => {
    await page.evaluate(() => {
      const toggle = document.getElementById('chatbot-toggle');
      if (toggle) toggle.click();
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-chatbot.jpg'), fullPage: true, quality: 85 });
  });

  test('Accessibility panel', async ({ page }) => {
    await page.evaluate(() => {
      const toggle = document.getElementById('accessibility-toggle');
      if (toggle) toggle.click();
    });
    await page.waitForTimeout(800);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-a11y.jpg'), fullPage: true, quality: 85 });
  });

  test('Medals screen', async ({ page }) => {
    await navigateToTab(page, 'screen-progress');
    await page.evaluate(() => {
      const target = document.getElementById('progress-medals-list');
      if (target) target.scrollIntoView({ block: 'center' });
    });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-medals.jpg'), fullPage: true, quality: 85 });
  });

  test('Map screen', async ({ page }) => {
    await navigateToTab(page, 'screen-map');
    await page.waitForTimeout(4000); // Wait for map tiles
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'screen-map.jpg'), fullPage: true, quality: 85 });
  });
});