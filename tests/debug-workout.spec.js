import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5500';
const API_URL = process.env.API_URL || 'http://localhost:5143';

test('Debug workout screen', async ({ page }) => {
  const consoleMessages = [];
  page.on('console', msg => consoleMessages.push(`${msg.type()}: ${msg.text()}`));
  page.on('pageerror', err => consoleMessages.push(`PAGE ERROR: ${err.message}`));

  await page.addInitScript((apiUrl) => {
    window.API_BASE_URL = apiUrl;
    localStorage.setItem('API_BASE_URL', apiUrl);
  }, API_URL);

  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');

  // Register and login
  const testEmail = `test${Date.now()}@example.com`;
  await page.click('#show-register');
  await page.fill('#register-name', 'Test User');
  await page.fill('#register-email', testEmail);
  await page.fill('#register-password', 'Test123456');
  await page.fill('#register-password-confirmation', 'Test123456');
  await page.click('#register-form button[type="submit"]');
  await page.waitForTimeout(3000);

  console.log('=== After registration ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Navigate to workout
  await page.click('.nav-item:has-text("Entrenamiento")');
  await page.waitForTimeout(3000);

  console.log('=== After clicking workout tab ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Check screen state
  const screens = await page.locator('.screen-tab').evaluateAll(els => els.map(el => ({
    id: el.id,
    classes: el.className,
    hidden: el.classList.contains('hidden')
  })));
  console.log('Screens:', JSON.stringify(screens, null, 2));

  // Check exercise list content
  const exerciseList = await page.locator('#exercise-list');
  const content = await exerciseList.innerHTML();
  console.log('Exercise list content:', content.substring(0, 500));

  // Check if API is called
  await page.waitForTimeout(5000);
  console.log('=== After 5s wait ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Check for exercise cards
  const cards = await page.locator('.exercise-card').count();
  console.log('Exercise cards count:', cards);

  // Check network for /api/exercises calls
  const exerciseListFinal = await page.locator('#exercise-list').innerHTML();
  console.log('Final exercise list:', exerciseListFinal.substring(0, 1000));

  // Check window.allExercises
  const allExercises = await page.evaluate(() => window.allExercises);
  console.log('window.allExercises:', allExercises ? allExercises.length : 'undefined');

  // Check window.exercisesLoadedPromise
  const promiseState = await page.evaluate(() => window.exercisesLoadedPromise);
  console.log('exercisesLoadedPromise state:', promiseState);
});