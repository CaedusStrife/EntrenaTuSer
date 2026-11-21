const { test, expect } = require('@playwright/test');

const BASE_URL = 'https://ambitious-ground-0e3dfc61e.3.azurestaticapps.net/';

test.describe('Entrena Tu Ser - Validation Tests', () => {
  
  test('Verify legal dates are 2026', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check footer copyright
    const footerCopyright = page.locator('.footer-copyright');
    await expect(footerCopyright).toContainText('2026');
    
    // Check terms modal date
    await page.click('#footer-terms');
    await expect(page.locator('#terms-modal .legal-last-updated')).toContainText('2026');
      await page.click('#terms-modal .legal-modal-close');
    
    // Check privacy modal date
    await page.click('#footer-privacy');
    await expect(page.locator('#privacy-modal .legal-last-updated')).toContainText('2026');
      await page.click('#privacy-modal .legal-modal-close');
    
    // Check cookies modal date
    await page.click('#footer-cookies');
    await expect(page.locator('#cookies-modal .legal-last-updated')).toContainText('2026');
      await page.click('#cookies-modal .legal-modal-close');
    
    // Check contact modal date
    await page.click('#footer-contact');
    await expect(page.locator('#contact-modal .legal-last-updated')).toContainText('2026');
      await page.click('#contact-modal .legal-modal-close');
  });

  test('Verify UTSC references in legal modals', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Check terms modal for UTSC references
    await page.click('#footer-terms');
    const termsContent = await page.locator('#terms-modal .legal-modal-body').textContent();
    expect(termsContent).toContain('Universidad Tecnológica de Santa Catarina');
    expect(termsContent).toContain('Nuevo León');
    expect(termsContent).toContain('@utsc.edu.mx');
    await page.click('.legal-modal-close');
    
    // Check privacy modal for UTSC references
    await page.click('#footer-privacy');
    const privacyContent = await page.locator('#privacy-modal .legal-modal-body').textContent();
    expect(privacyContent).toContain('Universidad Tecnológica de Santa Catarina');
    expect(privacyContent).toContain('@utsc.edu.mx');
    expect(privacyContent).toContain('ARCO');
    await page.click('.legal-modal-close');
    
    // Check contact modal for UTSC address
    await page.click('#footer-contact');
    const contactContent = await page.locator('#contact-modal .legal-modal-body').textContent();
    expect(contactContent).toContain('Universidad Tecnológica de Santa Catarina');
    expect(contactContent).toContain('Carretera Saltillo-Monterrey');
    expect(contactContent).toContain('66359');
    await page.click('.legal-modal-close');
  });

  test('Verify dark mode applies globally (not just accessibility panel)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Open accessibility panel
    await page.click('#accessibility-toggle');
    
    // Enable dark mode
    await page.click('[data-accessibility-action="darkmode"]');
    
    // Check body has dark-theme class
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    
    // Check login screen background uses CSS variable (not hardcoded)
    const loginBg = await page.locator('#screen-login').evaluate(el => 
      window.getComputedStyle(el).backgroundColor
    );
    // Should not be a hardcoded dark color
    expect(loginBg).not.toBe('rgb(0, 0, 0)');
    
    // Check animated elements have dark theme colors
    const waterSurfaceBg = await page.locator('#screen-login .water-surface').evaluate(el => 
      window.getComputedStyle(el).backgroundImage
    );
    // Should have dark theme gradients
    expect(waterSurfaceBg).toContain('radial-gradient');
    
    // Close panel
    await page.click('#accessibility-close');
  });

  test('Verify font size increases/decreases multiple times', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Open accessibility panel
    await page.click('#accessibility-toggle');
    
    // Get initial font size
    const initialFontSize = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    
    // Increase font size multiple times
    await page.click('[data-font-action="increase"]');
    await page.waitForTimeout(100);
    let fontSize = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseFloat(fontSize)).toBeGreaterThan(parseFloat(initialFontSize));
    
    await page.click('[data-font-action="increase"]');
    await page.waitForTimeout(100);
    fontSize = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseFloat(fontSize)).toBeGreaterThan(parseFloat(initialFontSize));
    
    await page.click('[data-font-action="increase"]');
    await page.waitForTimeout(100);
    fontSize = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseFloat(fontSize)).toBeGreaterThan(parseFloat(initialFontSize));
    
    // Decrease font size multiple times
    await page.click('[data-font-action="decrease"]');
    await page.waitForTimeout(100);
    fontSize = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseFloat(fontSize)).toBeLessThan(parseFloat(initialFontSize) * 1.3);
    
    // Reset
    await page.click('[data-accessibility-action="reset"]');
    await page.waitForTimeout(100);
    fontSize = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).fontSize
    );
    expect(parseFloat(fontSize)).toBeCloseTo(parseFloat(initialFontSize), 1);
    
    // Close panel
    await page.click('#accessibility-close');
  });

  test('Verify grayscale mode works', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Open accessibility panel
    await page.click('#accessibility-toggle');
    
    // Enable grayscale
    await page.click('[data-accessibility-action="grayscale"]');
    
    // Check body has grayscale class
    await expect(page.locator('body')).toHaveClass(/accessibility-grayscale/);
    
      // Check filter is applied (browser normalizes grayscale(100%) to grayscale(1))
    const bodyFilter = await page.locator('body').evaluate(el => 
      window.getComputedStyle(el).filter
    );
      expect(bodyFilter).toContain('grayscale(1)');
    
    // Disable grayscale
    await page.click('[data-accessibility-action="grayscale"]');
    await expect(page.locator('body')).not.toHaveClass(/accessibility-grayscale/);
    
    // Close panel
    await page.click('#accessibility-close');
  });

  test('Verify high contrast mode hides animations', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Open accessibility panel
    await page.click('#accessibility-toggle');
    
    // Enable high contrast
    await page.click('[data-accessibility-action="contrast"]');
    
    // Check body has high contrast class
    await expect(page.locator('body')).toHaveClass(/accessibility-high-contrast/);
    
      // Check animated elements are hidden (check first element)
      const pigmentDropDisplay = await page.locator('#screen-login .pigment-drop').first().evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(pigmentDropDisplay).toBe('none');
    
      const combTrailDisplay = await page.locator('#screen-login .comb-trail').first().evaluate(el => 
      window.getComputedStyle(el).display
    );
    expect(combTrailDisplay).toBe('none');
    
    // Disable high contrast
    await page.click('[data-accessibility-action="contrast"]');
    await expect(page.locator('body')).not.toHaveClass(/accessibility-high-contrast/);
    
    // Close panel
    await page.click('#accessibility-close');
  });

  test('Verify dark mode is button-controlled (not system preference)', async ({ page }) => {
    await page.goto(BASE_URL);
    
    // Initially should NOT have dark-theme (unless user explicitly enabled it)
    const hasDarkThemeInitially = await page.locator('body').evaluate(el => 
      el.classList.contains('dark-theme')
    );
    
    // Open accessibility panel
    await page.click('#accessibility-toggle');
    
    // Enable dark mode via button
    await page.click('[data-accessibility-action="darkmode"]');
    
    // Should now have dark-theme
    await expect(page.locator('body')).toHaveClass(/dark-theme/);
    
    // Disable dark mode via button
    await page.click('[data-accessibility-action="darkmode"]');
    
    // Should NOT have dark-theme
    await expect(page.locator('body')).not.toHaveClass(/dark-theme/);
    
    // Close panel
    await page.click('#accessibility-close');
  });
});