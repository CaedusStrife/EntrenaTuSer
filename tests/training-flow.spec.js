const { test, expect } = require('@playwright/test');

test('muestra el resumen visual de una rutina', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => {
    window.showWorkoutSummary({
      routineName: 'Rutina de prueba',
      completedCount: 2,
      totalCount: 3,
      minutes: 8,
      points: 120
    });
  });

  const summary = page.locator('.app-summary-sheet');
  await expect(summary).toBeVisible();
  await expect(summary).toContainText('Rutina de prueba');
  await expect(summary).toContainText('2/3');
  await expect(summary).toContainText('120');

  await summary.getByRole('button', { name: 'Cerrar', exact: true }).click();
  await expect(summary).toHaveCount(0);
});

test('permite iniciar y saltar un descanso entre ejercicios', async ({ page }) => {
  await page.goto('/');
  const result = await page.evaluate(async () => {
    const select = document.getElementById('training-rest');
    select.value = '15';
    window.startTrainingRest();
    await new Promise((resolve) => setTimeout(resolve, 1100));
    const state = {
      phase: document.getElementById('training-phase').textContent,
      timer: document.getElementById('training-timer').textContent,
      skipVisible: !document.getElementById('training-rest-skip').classList.contains('hidden')
    };
    window.skipTrainingRest();
    return state;
  });

  expect(result.phase).toBe('Descanso');
  expect(result.timer).toBe('00:14');
  expect(result.skipVisible).toBe(true);
});

test('la API protege la meta semanal sin autenticación', async ({ request }) => {
  const response = await request.get('http://localhost:5143/api/goals/1');
  expect(response.status()).toBe(401);
});
