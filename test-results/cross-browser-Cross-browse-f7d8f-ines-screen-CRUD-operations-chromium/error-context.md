# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: cross-browser.spec.js >> Cross-browser Compatibility Tests >> Routines screen CRUD operations
- Location: tests\cross-browser.spec.js:113:3

# Error details

```
Error: page.click: Target page, context or browser has been closed
Call log:
  - waiting for locator('button:has-text("Crear rutina")')

```

# Test source

```ts
  33  |   test('Registration form works', async ({ page }) => {
  34  |       await page.click('#show-register');
  35  |     await expect(page.locator('#register-form')).toBeVisible();
  36  |     
  37  |     const testEmail = `test${Date.now()}@example.com`;
  38  |     await page.fill('#register-name', 'Test User');
  39  |     await page.fill('#register-email', testEmail);
  40  |     await page.fill('#register-password', 'Test123456');
  41  |       await page.fill('#register-password-confirmation', 'Test123456');
  42  |     
  43  |       await page.click('#register-form button[type="submit"]');
  44  |     
  45  |     // Should redirect to progress screen after successful registration
  46  |     await expect(page.locator('#screen-progress')).toBeVisible({ timeout: 10000 });
  47  |   });
  48  | 
  49  |   test('Progress dashboard loads with metrics', async ({ page }) => {
  50  |     // First authenticate
  51  |     await authenticateUser(page);
  52  |     
  53  |       // Wait for app layout to be visible
  54  |       await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
  55  |     
  56  |       // Open sidebar menu if needed (mobile menu toggle)
  57  |       const mobileMenuToggle = page.locator('#mobile-menu-toggle');
  58  |       if (await mobileMenuToggle.isVisible()) {
  59  |         await mobileMenuToggle.click();
  60  |         await expect(page.locator('.sidebar-menu')).toBeVisible();
  61  |       }
  62  |     
  63  |       // Navigate to progress - handle mobile sidebar if needed
  64  |       const progressBtn = page.locator('.nav-btn:has-text("Progreso")');
  65  |       await expect(progressBtn).toBeVisible({ timeout: 10000 });
  66  |       await progressBtn.click();
  67  |     await expect(page.locator('#screen-progress')).toBeVisible();
  68  |     
  69  |     // Check metric cards
  70  |     await expect(page.locator('#progress-total-minutes')).toBeVisible();
  71  |     await expect(page.locator('#progress-progress-level')).toBeVisible();
  72  |     await expect(page.locator('#progress-medal-count')).toBeVisible();
  73  |     await expect(page.locator('#progress-total-points')).toBeVisible();
  74  |     await expect(page.locator('#progress-completed-exercises')).toBeVisible();
  75  |   });
  76  | 
  77  |   test('Training screen loads exercises', async ({ page }) => {
  78  |     await authenticateUser(page);
  79  |     
  80  |       // Wait for app layout to be visible
  81  |       await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
  82  |     
  83  |       // Open sidebar menu if needed (mobile menu toggle)
  84  |       const mobileMenuToggle = page.locator('#mobile-menu-toggle');
  85  |       if (await mobileMenuToggle.isVisible()) {
  86  |         await mobileMenuToggle.click();
  87  |         await expect(page.locator('.sidebar-menu')).toBeVisible();
  88  |       }
  89  |     
  90  |       await page.click('.nav-btn:has-text("Entrenamiento")');
  91  |     await expect(page.locator('#screen-workout')).toBeVisible();
  92  |     
  93  |       // Wait for exercises to load (they load asynchronously)
  94  |       await page.waitForFunction(() => {
  95  |         const cards = document.querySelectorAll('.exercise-printed-card');
  96  |         return cards.length > 0;
  97  |       }, { timeout: 15000 });
  98  |     
  99  |       // Check exercise categories (using actual class names)
  100 |       await expect(page.locator('.exercise-category-section').first()).toBeVisible();
  101 |     
  102 |       // Open the first category section if it's a details element
  103 |       await page.evaluate(() => {
  104 |         const section = document.querySelector('.exercise-category-section');
  105 |         if (section && section.tagName === 'DETAILS') {
  106 |           section.open = true;
  107 |         }
  108 |       });
  109 |     
  110 |       await expect(page.locator('.exercise-printed-card').first()).toBeVisible();
  111 |   });
  112 | 
  113 |   test('Routines screen CRUD operations', async ({ page }) => {
  114 |     await authenticateUser(page);
  115 |     
  116 |       // Wait for app layout to be visible
  117 |       await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
  118 |     
  119 |       // Open sidebar menu if needed (mobile menu toggle)
  120 |       const mobileMenuToggle = page.locator('#mobile-menu-toggle');
  121 |       if (await mobileMenuToggle.isVisible()) {
  122 |         await mobileMenuToggle.click();
  123 |         await expect(page.locator('.sidebar-menu')).toBeVisible();
  124 |       }
  125 |     
  126 |       await page.click('.nav-btn:has-text("Mis Rutinas")');
  127 |     await expect(page.locator('#screen-routines')).toBeVisible();
  128 |     
  129 |     // Check create routine button
  130 |       await expect(page.locator('button:has-text("Nueva Rutina")')).toBeVisible();
  131 |     
  132 |     // Open create modal
> 133 |       await page.click('button:has-text("Crear rutina")');
      |                  ^ Error: page.click: Target page, context or browser has been closed
  134 |       await expect(page.locator('#routine-modal')).toBeVisible({ timeout: 10000 });
  135 |     
  136 |     // Fill routine form
  137 |     await page.fill('#routine-name', 'Test Routine Cross-Browser');
  138 |     await page.fill('#routine-description', 'Created during cross-browser test');
  139 |     
  140 |     // Generate routine
  141 |         await page.selectOption('#personalization-goal', 'fuerza');
  142 |         await page.selectOption('#personalization-level', 'principiante');
  143 |         await page.selectOption('#personalization-time', '20');
  144 |     await page.click('#generate-routine-btn');
  145 |     
  146 |     // Wait for exercises to be generated
  147 |       await expect(page.locator('.routine-modal-exercise-item').first()).toBeVisible({ timeout: 10000 });
  148 |     
  149 |     // Save routine
  150 |         await page.click('#routine-form button[type="submit"]');
  151 |     
  152 |     // Verify routine appears in list
  153 |       await expect(page.locator('.routine-printed-card').first()).toBeVisible({ timeout: 10000 });
  154 |   });
  155 | 
  156 |   test('Chatbot opens and responds', async ({ page }) => {
  157 |     await authenticateUser(page);
  158 |     
  159 |     // Open chatbot
  160 |     await page.click('#chatbot-toggle');
  161 |     await expect(page.locator('#chatbot-panel')).toHaveClass(/active/);
  162 |     
  163 |     // Send a message
  164 |     await page.fill('#chatbot-input', 'Hola, ¿qué rutina me recomiendas?');
  165 |     await page.click('#chatbot-form button[type="submit"]');
  166 |     
  167 |     // Wait for bot response
  168 |     await expect(page.locator('.bot-message').last()).toBeVisible({ timeout: 10000 });
  169 |   });
  170 | 
  171 |   test('Accessibility panel works', async ({ page }) => {
  172 |     await authenticateUser(page);
  173 |     
  174 |     // Open accessibility panel
  175 |     await page.click('#accessibility-toggle');
  176 |     await expect(page.locator('#accessibility-panel')).toHaveClass(/active/);
  177 |     
  178 |     // Test dark mode toggle
  179 |     await page.click('[data-accessibility-action="darkmode"]');
  180 |     await expect(page.locator('body')).toHaveClass(/dark-theme/);
  181 |     
  182 |     // Test high contrast
  183 |     await page.click('[data-accessibility-action="contrast"]');
  184 |     await expect(page.locator('body')).toHaveClass(/accessibility-high-contrast/);
  185 |     
  186 |     // Test reduced motion
  187 |     await page.click('[data-accessibility-action="motion"]');
  188 |     await expect(page.locator('body')).toHaveClass(/accessibility-reduced-motion/);
  189 |     
  190 |     // Test font size increase
  191 |     await page.click('[data-font-action="increase"]');
  192 |     await expect(page.locator('body')).toHaveClass(/accessibility-large-text/);
  193 |     
  194 |     // Reset
  195 |     await page.click('[data-accessibility-action="reset"]');
  196 |     await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
  197 |     await expect(page.locator('body')).not.toHaveClass(/accessibility-high-contrast/);
  198 |     await expect(page.locator('body')).not.toHaveClass(/accessibility-reduced-motion/);
  199 |     await expect(page.locator('body')).not.toHaveClass(/accessibility-large-text/);
  200 |   });
  201 | 
  202 |   test('Map screen loads', async ({ page }) => {
  203 |     await authenticateUser(page);
  204 |     
  205 |       // Wait for app layout to be visible
  206 |       await expect(page.locator('#app-layout')).toBeVisible({ timeout: 10000 });
  207 |     
  208 |       // Open sidebar menu if needed (mobile menu toggle)
  209 |       const mobileMenuToggle = page.locator('#mobile-menu-toggle');
  210 |       if (await mobileMenuToggle.isVisible()) {
  211 |         await mobileMenuToggle.click();
  212 |         await expect(page.locator('.sidebar-menu')).toBeVisible();
  213 |       }
  214 |     
  215 |       await page.click('.nav-btn:has-text("Mapa y Ubicación")');
  216 |     await expect(page.locator('#screen-map')).toBeVisible();
  217 |     
  218 |       // Check map container (id is workout-map)
  219 |       await expect(page.locator('#workout-map')).toBeVisible({ timeout: 10000 });
  220 |     
  221 |       // Check nearby places grid (it may be empty initially, just check it exists)
  222 |       await expect(page.locator('.places-printed-grid')).toBeAttached();
  223 |   });
  224 | 
  225 |   test('Training guided flow - timer and rest', async ({ page }) => {
  226 |     await authenticateUser(page);
  227 |     
  228 |     // First create a routine if needed
  229 |     await page.click('[data-screen="routines"]');
  230 |     await page.waitForTimeout(500);
  231 |     
  232 |     // Check if there's a routine to start, if not create one
  233 |     const routineCards = page.locator('.routine-printed-card');
```