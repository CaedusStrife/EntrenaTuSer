import { test, expect } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:5500';
const API_URL = process.env.API_URL || 'http://localhost:5143';

test('Debug routines screen', async ({ page }) => {
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

  // Navigate to routines
  await page.click('.nav-item:has-text("Mis Rutinas")');
  await page.waitForTimeout(2000);

  console.log('=== After clicking routines tab ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Check screen state
  const screens = await page.locator('.screen-tab').evaluateAll(els => els.map(el => ({
    id: el.id,
    classes: el.className,
    hidden: el.classList.contains('hidden')
  })));
  console.log('Screens:', JSON.stringify(screens, null, 2));

  // Check if openRoutineModal exists
  const openRoutineModalExists = await page.evaluate(() => typeof window.openRoutineModal);
  console.log('openRoutineModal type:', openRoutineModalExists);

  // Click create routine button
  await page.click('button:has-text("Nueva rutina")');
  await page.waitForTimeout(2000);

  console.log('=== After clicking Nueva rutina ===');
  consoleMessages.forEach(m => console.log(m));
  consoleMessages.length = 0;

  // Check modal state
  const modal = await page.locator('#routine-modal');
  const modalClasses = await modal.getAttribute('class');
  console.log('Modal classes:', modalClasses);

  // Check if routineWizard exists
  const routineWizardExists = await page.evaluate(() => typeof window.routineWizard);
  console.log('routineWizard type:', routineWizardExists);

  // Try calling openRoutineModal directly
  await page.evaluate(() => window.openRoutineModal());
  await page.waitForTimeout(1000);

  const modalClasses2 = await modal.getAttribute('class');
  console.log('Modal classes after direct call:', modalClasses2);

  // Check if toggleExerciseSelection is available
  const hasToggle = await page.evaluate(() => typeof window.toggleExerciseSelection);
  console.log('toggleExerciseSelection type:', hasToggle);

  // Check if renderExerciseSelector is available
  const hasRender = await page.evaluate(() => typeof window.renderExerciseSelector);
  console.log('renderExerciseSelector type:', hasRender);

  // Fill step 1
  await page.fill('#routine-name', 'Test Routine');
  await page.selectOption('#routine-goal', 'strength');
  await page.selectOption('#routine-level', 'intermediate');
  await page.fill('#routine-estimated-time', '30');
  await page.waitForTimeout(500);

  // Go to step 2
  await page.click('#wizard-next');
  await page.waitForTimeout(1000);

  const step2Panel = await page.locator('.wizard-panel[data-panel="2"]').getAttribute('class');
  console.log('Step 2 panel classes:', step2Panel);

  // Wait for exercises to load
  await page.waitForFunction(() => {
    const items = document.querySelectorAll('.exercise-selector-item-add');
    return items.length > 0;
  }, { timeout: 10000 });

  // Try clicking an add button
  const addButtons = await page.locator('.exercise-selector-item-add');
  const addCount = await addButtons.count();
  console.log('Add buttons count:', addCount);

  if (addCount > 0) {
    // Check the onclick handler
    const onclick = await addButtons.first().getAttribute('onclick');
    console.log('First button onclick:', onclick);

    // Check if allExercises is populated
    const exercisesLoaded = await page.evaluate(() => {
      return window.allExercises ? window.allExercises.length : 'undefined';
    });
    console.log('allExercises length:', exercisesLoaded);

    // Get ALL exercise IDs from allExercises
    const allExIds = await page.evaluate(() => {
      return window.allExercises ? window.allExercises.map(e => e.id) : [];
    });
    console.log('All exercise IDs:', allExIds);

    // Call the function directly in the browser with the first actual ID
    const firstEx = allExIds[0];
    const result = await page.evaluate((id) => {
      window.toggleExerciseSelection(id);
      const countEl = document.getElementById('selected-count');
      return countEl ? countEl.textContent : 'no element';
    }, firstEx);
    console.log('Selected count after direct call:', result);

    // Check the selected exercises list
    const listContent = await page.locator('#selected-exercises-list').innerHTML();
    console.log('Selected list HTML:', listContent);
  }
});