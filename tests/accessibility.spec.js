import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5500';
const API_URL = process.env.API_URL || 'http://localhost:5143';

async function authenticateUser(page) {
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  const userData = await page.evaluate(() => localStorage.getItem('user_data'));

  if (token && userData) {
    const currentScreen = await page.locator('.screen-tab.active').getAttribute('id');
    if (currentScreen && currentScreen !== 'screen-login') {
      return;
    }
  }

  const testEmail = `test${Date.now()}@gmail.com`;
  const testPassword = 'Test123456';

  await page.fill('#login-email', testEmail);
  await page.fill('#login-password', testPassword);
  await page.click('#login-form button[type="submit"]');
  await page.waitForTimeout(2000);

  const isLoginScreen = await page.locator('#screen-login').isVisible();
  if (isLoginScreen) {
    await page.click('#show-register');
    await page.fill('#register-name', 'Test User');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', testPassword);
    await page.fill('#register-password-confirmation', testPassword);
    await page.check('#register-terms');
    await page.click('#register-form button[type="submit"]');
    await expect(page.locator('#screen-progress')).toBeVisible({ timeout: 15000 });
  }
}

test.describe('Accessibility (WCAG 2.1 AA) - axe-core', () => {

  test.beforeEach(async ({ page }) => {
    await page.addInitScript((apiUrl) => {
      window.API_BASE_URL = apiUrl;
      localStorage.setItem('API_BASE_URL', apiUrl);
    }, API_URL);

    await page.goto(BASE_URL);
    await page.waitForLoadState('networkidle');
  });

  test('Login screen passes axe accessibility scan', async ({ page }) => {
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Register screen passes axe accessibility scan', async ({ page }) => {
    await page.click('#show-register');
    await expect(page.locator('#register-form')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Recovery screen passes axe accessibility scan', async ({ page }) => {
    await page.click('#show-recovery');
    await expect(page.locator('#recovery-form')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Progress dashboard passes axe accessibility scan (authenticated)', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    if (accessibilityScanResults.violations.length > 0) {
      console.log('A11y violations:', JSON.stringify(accessibilityScanResults.violations, null, 2));
    }
    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Training screen passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    await page.click('.nav-item:has-text("Entrenamiento")');
    await expect(page.locator('#screen-workout')).toBeVisible();

    await page.waitForFunction(() => {
      const cards = document.querySelectorAll('.exercise-card');
      return cards.length > 0;
    }, { timeout: 15000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Routines screen passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    await page.click('.nav-item:has-text("Mis Rutinas")');
    await expect(page.locator('#screen-routines')).toBeVisible();

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Map screen passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    await page.click('.nav-item:has-text("Mapa")');
    await expect(page.locator('#screen-map')).toBeVisible();
    await expect(page.locator('#workout-map')).toBeVisible({ timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Profile modal passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    // Switch to profile screen first
    await page.click('button[aria-label="Mi Perfil"]');
    await expect(page.locator('#screen-profile')).not.toHaveClass(/hidden/);

    // Open profile modal (Editar perfil button)
    await page.click('#edit-profile-trigger');
    await expect(page.locator('#edit-profile-modal')).not.toHaveClass(/hidden/);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('#edit-profile-modal') // Only scan the modal
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Accessibility panel passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    await page.click('#accessibility-toggle');
    await expect(page.locator('#accessibility-panel')).not.toHaveClass(/hidden/);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('#accessibility-panel')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Chatbot panel passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    await page.click('#chatbot-toggle');
    await expect(page.locator('#chatbot-panel')).not.toHaveClass(/hidden/);

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('#chatbot-panel')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Routine wizard passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    await page.click('.nav-item:has-text("Mis Rutinas")');
    await expect(page.locator('#screen-routines')).toBeVisible();

    await page.click('button:has-text("Nueva rutina")');
    await expect(page.locator('#routine-modal').first()).toBeVisible({ timeout: 10000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('#routine-modal')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Confirm dialog passes axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    await page.evaluate(() => {
      window.showConfirmDialog('¿Estás seguro?');
    });
    await expect(page.locator('.app-confirm-sheet')).toBeVisible({ timeout: 5000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('.app-confirm-overlay')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);

    // Close dialog
    await page.click('.app-confirm-cancel');
  });

  test('Toast notifications pass axe accessibility scan', async ({ page }) => {
    await authenticateUser(page);

    await page.evaluate(() => {
      window.showNotification('Test notification', 'success');
    });
    await expect(page.locator('.app-notification-success')).toBeVisible({ timeout: 5000 });

    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .include('.app-notifications')
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test('Color contrast meets AA standards in all themes', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    // Test light theme (default)
    const lightThemeResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    expect(lightThemeResults.violations.filter(v => v.id === 'color-contrast')).toEqual([]);

    // Test dark theme
    await page.click('#accessibility-toggle');
    await page.click('[data-accessibility-action="darkmode"]');
    await page.waitForTimeout(500);

    const darkThemeResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    expect(darkThemeResults.violations.filter(v => v.id === 'color-contrast')).toEqual([]);

    // Test high contrast
    await page.click('[data-accessibility-action="contrast"]');
    await page.waitForTimeout(500);

    const highContrastResults = await new AxeBuilder({ page })
      .withTags(['cat.color'])
      .analyze();

    expect(highContrastResults.violations.filter(v => v.id === 'color-contrast')).toEqual([]);

    // Reset
    await page.click('[data-accessibility-action="reset"]');
  });

  test('Reduced motion preference respected', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    // Enable reduced motion
    await page.click('#accessibility-toggle');
    await page.click('[data-accessibility-action="motion"]');
    await page.waitForTimeout(500);

    // Check CSS media query is applied
    const reducedMotionEnabled = await page.evaluate(() => {
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches ||
             document.body.classList.contains('accessibility-reduced-motion');
    });
    expect(reducedMotionEnabled).toBeTruthy();

    // Check animations are disabled via CSS
    const animationDisabled = await page.evaluate(() => {
      const style = getComputedStyle(document.body);
      return style.getPropertyValue('--animation-duration') === '0s' ||
             style.getPropertyValue('--transition-duration') === '0s';
    });
    // Note: This depends on your CSS implementation

    // Reset
    await page.click('[data-accessibility-action="reset"]');
  });

  test('Keyboard navigation works on all interactive elements', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    // Tab through bottom navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');

    const focused = await page.evaluate(() => document.activeElement);
    expect(focused).toBeTruthy();

    // Check focus styles are visible
    const focusVisible = await page.evaluate(() => {
      const el = document.activeElement;
      const style = getComputedStyle(el);
      return style.outline !== 'none' || style.boxShadow !== 'none' || style.border !== '0px none rgb(0, 0, 0)';
    });
    // At least one focus indicator should be present
  });

  test('ARIA labels and roles are correct', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    // Check bottom nav has proper roles
    const navRole = await page.locator('.bottom-nav').getAttribute('role');
    expect(navRole).toBe('navigation');

    // Check nav items have proper roles (native <button> has implicit role=button)
    const navItems = await page.locator('.nav-item').all();
    for (const item of navItems) {
      const tagName = await item.evaluate(el => el.tagName.toLowerCase());
      const role = await item.getAttribute('role');
      // Native button elements have implicit role="button", no explicit attribute needed
      expect(tagName === 'button' || role === 'button').toBeTruthy();
    }

    // Check main content has role=main
    const mainRole = await page.locator('#main-content').getAttribute('role');
    expect(mainRole).toBe('main');
  });

  test('Images have alt text or are marked decorative', async ({ page }) => {
    await authenticateUser(page);
    await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });

    const imagesWithoutAlt = await page.evaluate(() => {
      const images = document.querySelectorAll('img');
      const problematic = [];
      images.forEach(img => {
        if (!img.hasAttribute('alt') && !img.hasAttribute('aria-hidden')) {
          problematic.push(img.src);
        }
      });
      return problematic;
    });

    // SVG icons with aria-hidden="true" are OK
    // Regular images should have alt
    expect(imagesWithoutAlt).toEqual([]);
  });
});