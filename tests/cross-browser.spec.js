import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5500';
const API_URL = process.env.API_URL || 'http://localhost:5143';

test.describe('Cross-browser Compatibility Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Override API_BASE_URL to use local API for testing
    await page.addInitScript((apiUrl) => {
      window.API_BASE_URL = apiUrl;
      localStorage.setItem('API_BASE_URL', apiUrl);
    }, API_URL);
    
    await page.goto(BASE_URL);
    // Wait for the app to load
    await page.waitForLoadState('networkidle');
  });

  test('Login screen renders correctly across browsers', async ({ page }) => {
    // Check main login elements are visible
    await expect(page.locator('#screen-login')).toBeVisible();
    await expect(page.locator('#login-email')).toBeVisible();
    await expect(page.locator('#login-password')).toBeVisible();
      await expect(page.locator('#login-form button[type="submit"]')).toBeVisible();
      await expect(page.locator('#show-register')).toBeVisible();
    
    // Check Ebru animation elements exist
    await expect(page.locator('.pigment-drop').first()).toBeAttached();
    await expect(page.locator('.comb-trail').first()).toBeAttached();
  });

  test('Registration form works', async ({ page }) => {
      await page.click('#show-register');
    await expect(page.locator('#register-form')).toBeVisible();
    
    const testEmail = `test${Date.now()}@example.com`;
    await page.fill('#register-name', 'Test User');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', 'Test123456');
      await page.fill('#register-password-confirmation', 'Test123456');
    
      await page.click('#register-form button[type="submit"]');
    
    // Should redirect to progress screen after successful registration
    await expect(page.locator('#screen-progress')).toBeVisible({ timeout: 10000 });
  });

  test('Progress dashboard loads with metrics', async ({ page }) => {
    // First authenticate
    await authenticateUser(page);
    
      // Wait for app layout to be visible
      await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
    
      // Open sidebar menu if needed (mobile menu toggle)
      const mobileMenuToggle = page.locator('#mobile-menu-toggle');
      if (await mobileMenuToggle.isVisible()) {
        await mobileMenuToggle.click();
        await expect(page.locator('.sidebar-menu')).toBeVisible();
      }
    
      // Navigate to progress - handle mobile sidebar if needed
      const progressBtn = page.locator('.nav-btn:has-text("Progreso")');
      await expect(progressBtn).toBeVisible({ timeout: 10000 });
      await progressBtn.click();
    await expect(page.locator('#screen-progress')).toBeVisible();
    
    // Check primary metric cards (Hoja de Identidad: always visible)
    await expect(page.locator('#progress-weekly-minutes')).toBeVisible();
    await expect(page.locator('#progress-weekly-exercises')).toBeVisible();
    await expect(page.locator('#progress-weekly-points')).toBeVisible();
    await expect(page.locator('#progress-goal-percent-main')).toBeVisible();
    
    // Check hero stats
    await expect(page.locator('#hero-level')).toBeVisible();
    await expect(page.locator('#streak-count')).toBeVisible();
  });

  test('Training screen loads exercises', async ({ page }) => {
    await authenticateUser(page);
    
      // Wait for app layout to be visible
      await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
    
      // Open sidebar menu if needed (mobile menu toggle)
      const mobileMenuToggle = page.locator('#mobile-menu-toggle');
      if (await mobileMenuToggle.isVisible()) {
        await mobileMenuToggle.click();
        await expect(page.locator('.sidebar-menu')).toBeVisible();
      }
    
      await page.click('.nav-btn:has-text("Entrenamiento")');
    await expect(page.locator('#screen-workout')).toBeVisible();
    
      // Wait for exercises to load (they load asynchronously)
      await page.waitForFunction(() => {
        const cards = document.querySelectorAll('.exercise-card');
        return cards.length > 0;
      }, { timeout: 15000 });
    
      // Check exercise cards are rendered (Hoja de Identidad: flat grid)
      await expect(page.locator('.exercise-card').first()).toBeVisible();
    
      // Check hero identity shows workout title
      await expect(page.locator('#workout-title')).toBeVisible();
  });

  test('Routines screen CRUD operations', async ({ page }) => {
    await authenticateUser(page);
    
      // Wait for app layout to be visible
      await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
    
      // Open sidebar menu if needed (mobile menu toggle)
      const mobileMenuToggle = page.locator('#mobile-menu-toggle');
      if (await mobileMenuToggle.isVisible()) {
        await mobileMenuToggle.click();
        await expect(page.locator('.sidebar-menu')).toBeVisible();
      }
    
      await page.click('.nav-btn:has-text("Mis Rutinas")');
    await expect(page.locator('#screen-routines')).toBeVisible();
    
    // Check create routine button (Hoja de Identidad: hero actions)
      await expect(page.locator('button:has-text("Nueva rutina")')).toBeVisible();
    
    // Open create modal (wizard)
      await page.click('button:has-text("Nueva rutina")');
      await expect(page.locator('#routine-modal')).toBeVisible({ timeout: 10000 });
    
    // Step 1: Fill basic info
    await page.fill('#routine-name', 'Test Routine Cross-Browser');
    await page.fill('#routine-description', 'Created during cross-browser test');
    await page.selectOption('#routine-goal', 'strength');
    await page.selectOption('#routine-level', 'intermediate');
    await page.fill('#routine-estimated-time', '30');
    
    // Go to step 2
    await page.click('#wizard-next');
    await expect(page.locator('#wizard-step-2')).toBeVisible();
    
    // Step 2: Select exercises
    // Wait for exercise selector to load
    await page.waitForFunction(() => {
      const items = document.querySelectorAll('.exercise-selector-item');
      return items.length > 0;
    }, { timeout: 10000 });
    
    // Select first 3 exercises
    const exerciseItems = page.locator('.exercise-selector-item');
    const count = await exerciseItems.count();
    for (let i = 0; i < Math.min(3, count); i++) {
      await exerciseItems.nth(i).click();
    }
    
    // Go to step 3
    await page.click('#wizard-next');
    await expect(page.locator('#wizard-step-3')).toBeVisible();
    
    // Step 3: Review and save
    await page.click('#wizard-submit');
    
    // Verify routine appears in list (Hoja de Identidad: routine-card)
    await expect(page.locator('.routine-card').first()).toBeVisible({ timeout: 10000 });
  });

  test('Chatbot opens and responds', async ({ page }) => {
    await authenticateUser(page);
    
    // Open chatbot
    await page.click('#chatbot-toggle');
    await expect(page.locator('#chatbot-panel')).toHaveClass(/active/);
    
    // Send a message
    await page.fill('#chatbot-input', 'Hola, ¿qué rutina me recomiendas?');
    await page.click('#chatbot-form button[type="submit"]');
    
    // Wait for bot response
    await expect(page.locator('.bot-message').last()).toBeVisible({ timeout: 10000 });
  });

  test('Accessibility panel works', async ({ page }) => {
    await authenticateUser(page);
    
    // Open accessibility panel
    await page.click('#accessibility-toggle');
    await expect(page.locator('#accessibility-panel')).toHaveClass(/active/);
    
    // Test dark mode toggle
    await page.click('[data-accessibility-action="darkmode"]');
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    
    // Test high contrast
    await page.click('[data-accessibility-action="contrast"]');
    await expect(page.locator('body')).toHaveClass(/accessibility-high-contrast/);
    
    // Test reduced motion
    await page.click('[data-accessibility-action="motion"]');
    await expect(page.locator('body')).toHaveClass(/accessibility-reduced-motion/);
    
    // Test font size increase
    await page.click('[data-font-action="increase"]');
    await expect(page.locator('body')).toHaveClass(/accessibility-large-text/);
    
    // Reset
    await page.click('[data-accessibility-action="reset"]');
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
    await expect(page.locator('body')).not.toHaveClass(/accessibility-high-contrast/);
    await expect(page.locator('body')).not.toHaveClass(/accessibility-reduced-motion/);
    await expect(page.locator('body')).not.toHaveClass(/accessibility-large-text/);
  });

  test('Map screen loads', async ({ page }) => {
    await authenticateUser(page);
    
      // Wait for app layout to be visible
      await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
    
      // Open sidebar menu if needed (mobile menu toggle)
      const mobileMenuToggle = page.locator('#mobile-menu-toggle');
      if (await mobileMenuToggle.isVisible()) {
        await mobileMenuToggle.click();
        await expect(page.locator('.sidebar-menu')).toBeVisible();
      }
    
      await page.click('.nav-btn:has-text("Mapa y Ubicación")');
    await expect(page.locator('#screen-map')).toBeVisible();
    
      // Check map container (id is workout-map)
      await expect(page.locator('#workout-map')).toBeVisible({ timeout: 10000 });
    
      // Check nearby places grid (it may be empty initially, just check it exists)
      await expect(page.locator('.places-printed-grid')).toBeAttached();
  });

  test('Training guided flow - timer and rest', async ({ page }) => {
    await authenticateUser(page);
    
    // First create a routine if needed
    await page.click('[data-screen="routines"]');
    await page.waitForTimeout(500);
    
    // Check if there's a routine to start, if not create one
    const routineCards = page.locator('.routine-printed-card');
    const count = await routineCards.count();
    
    if (count === 0) {
      await page.click('#create-routine-btn');
      await page.fill('#routine-name', 'Test Routine for Training');
        await page.selectOption('#personalization-goal', 'cuerpo-completo');
        await page.selectOption('#personalization-level', 'principiante');
        await page.selectOption('#personalization-time', '10');
      await page.click('#generate-routine-btn');
      await expect(page.locator('.routine-exercise-item').first()).toBeVisible({ timeout: 5000 });
        await page.click('#routine-form button[type="submit"]');
      await expect(page.locator('.routine-printed-card').first()).toBeVisible({ timeout: 5000 });
    }
    
      // Start training - click the "Iniciar" button on the first routine card
      await page.click('.routine-printed-card button:has-text("Iniciar")');
      await expect(page.locator('#training-controls')).toBeVisible({ timeout: 10000 });
    
    // Check training elements
    await expect(page.locator('#training-timer')).toBeVisible();
    await expect(page.locator('#training-phase')).toBeVisible();
      await expect(page.locator('#training-progress-bar')).toBeVisible();
      await expect(page.locator('#training-progress-label')).toBeVisible();
    
    // Test rest functionality
    await page.selectOption('#training-rest', '15');
    await page.evaluate(() => window.startTrainingRest());
    await page.waitForTimeout(1100);
    
    const phase = await page.locator('#training-phase').textContent();
    expect(phase).toContain('Descanso');
    
    // Skip rest
    await page.click('#training-rest-skip');
  });

  test('Responsive layout adapts to viewport', async ({ page }) => {
    await authenticateUser(page);
    
      // Wait for app layout to be visible
      await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
    
      // Open sidebar menu if needed (mobile menu toggle)
      const mobileMenuToggle = page.locator('#mobile-menu-toggle');
      if (await mobileMenuToggle.isVisible()) {
        await mobileMenuToggle.click();
        await expect(page.locator('.sidebar-menu')).toBeVisible();
      }
    
    // Check sidebar navigation works
    await expect(page.locator('.sidebar')).toBeVisible();
      await expect(page.locator('.nav-btn:has-text("Progreso")')).toBeVisible();
      await expect(page.locator('.nav-btn:has-text("Entrenamiento")')).toBeVisible();
      await expect(page.locator('.nav-btn:has-text("Mis Rutinas")')).toBeVisible();
      await expect(page.locator('.nav-btn:has-text("Mapa y Ubicación")')).toBeVisible();
    
    // Check main content area
    await expect(page.locator('main')).toBeVisible();
  });

  test('Keyboard navigation works', async ({ page }) => {
    await authenticateUser(page);
    
    // Tab through main navigation
    await page.keyboard.press('Tab');
    await page.keyboard.press('Tab');
    
    // Check focus is visible on first focusable element
    const focused = await page.evaluate(() => document.activeElement.tagName);
    expect(['BUTTON', 'A', 'INPUT', 'SELECT']).toContain(focused);
    
    // Escape should close modals/panels
    await page.click('#chatbot-toggle');
    await expect(page.locator('#chatbot-panel')).toHaveClass(/active/);
    await page.keyboard.press('Escape');
    await expect(page.locator('#chatbot-panel')).not.toHaveClass(/active/);
  });

  test('Toast notifications appear', async ({ page }) => {
    await authenticateUser(page);
    
    // Trigger a toast by trying to save empty routine
    await page.click('[data-screen="routines"]');
    await page.click('#create-routine-btn');
    await page.click('#save-routine-btn'); // Should show error toast
    
    await expect(page.locator('.toast-error')).toBeVisible({ timeout: 5000 });
  });

  test('Confirm sheet is accessible', async ({ page }) => {
    await authenticateUser(page);
    
    // Try to delete a routine (should show confirm sheet)
    await page.click('[data-screen="routines"]');
    const routineCards = page.locator('.routine-printed-card');
    const count = await routineCards.count();
    
    if (count > 0) {
        // Click the delete button (trash icon button)
        await routineCards.first().locator('button:has(i[data-lucide="trash-2"])').click();
        await expect(page.locator('.confirm-sheet')).toBeVisible({ timeout: 5000 });
      
      // Test Escape closes it
      await page.keyboard.press('Escape');
      await expect(page.locator('.confirm-sheet')).not.toBeVisible();
    }
  });
});

// Helper function to authenticate a test user
async function authenticateUser(page) {
  // Check if already authenticated
  const token = await page.evaluate(() => localStorage.getItem('auth_token'));
  const userData = await page.evaluate(() => localStorage.getItem('user_data'));
  
  if (token && userData) {
    // Verify token is still valid by checking if we're on a protected screen
    const currentScreen = await page.locator('.screen.active').getAttribute('id');
    if (currentScreen && currentScreen !== 'screen-login') {
      return; // Already authenticated
    }
  }
  
  // Register a new test user
  const testEmail = `test${Date.now()}@example.com`;
  const testPassword = 'Test123456';
  
  await page.fill('#login-email', testEmail);
  await page.fill('#login-password', testPassword);
  
  // Try login first (in case user exists)
  await page.click('#login-form button[type="submit"]');
  await page.waitForTimeout(2000);
  
  // If login failed, register
  const isLoginScreen = await page.locator('#screen-login').isVisible();
  if (isLoginScreen) {
    await page.click('#show-register');
    await page.fill('#register-name', 'Test User');
    await page.fill('#register-email', testEmail);
    await page.fill('#register-password', testPassword);
    await page.fill('#register-password-confirmation', testPassword);
    await page.click('#register-form button[type="submit"]');
    await expect(page.locator('#screen-progress')).toBeVisible({ timeout: 10000 });
  }
}