/**
 * Demo Recording Script - Entrena Tu Ser
 * Ejecuta: npx playwright test tests/demo-record.spec.js --headed
 * Genera video en test-results/
 * 
 * Video demostrativo COMPLETO (~4-5 min) mostrando TODAS las secciones y funciones.
 * Visita EXPLÍCITAMENTE las 4 pestañas principales: Progreso, Entrenamiento, Mis Rutinas, Mapa.
 */
const { test, expect } = require('@playwright/test');

const BASE_URL = 'http://localhost:5500';
const API_URL = 'http://localhost:5143';

test.describe.configure({ retries: 0 });

test('Demo completa: TODAS las secciones y funciones de Entrena Tu Ser', async ({ page, context }) => {
    test.setTimeout(300000); // 5 minutos
  
  // Forzar modo oscuro para el video
  await page.emulateMedia({ colorScheme: 'dark' });
  
  // ============================================================
    // ESCENA 1: Login/Registro - Diseño Ebru animado + Validaciones + JWT
  // ============================================================
  await page.goto(BASE_URL);
  await page.waitForLoadState('networkidle');
  await expect(page.locator('#screen-login')).toBeVisible();
    await page.waitForTimeout(2000); // Ver animaciones Ebru (burbujas, trails, rings)
  
    // Probar validación: submit vacío
    await page.click('#login-form button[type="submit"]');
    await page.waitForTimeout(1000); // Ver errores de validación en campos
  
    // Click "Crear una" - transición suave a registro
  await page.click('#show-register');
    await page.waitForTimeout(800);
  
    // Llenar formulario registro con validación en vivo (floating labels)
  const testEmail = `demo${Date.now()}@entrenatuser.com`;
  await page.fill('#register-name', 'Estudiante Demo');
    await page.waitForTimeout(300);
  await page.fill('#register-email', testEmail);
    await page.waitForTimeout(300);
  await page.fill('#register-password', 'Demo123456');
    await page.waitForTimeout(300);
    await page.fill('#register-password-confirmation', 'Demo123456');
    await page.waitForTimeout(500);
  
    // Registrar - esperar respuesta API + animación éxito (checkmark verde)
  await page.click('#register-form button[type="submit"]');
  
    // Esperar transición a progress
  await page.waitForFunction(() => {
    const progress = document.getElementById('screen-progress');
      return progress && !progress.classList.contains('hidden');
  }, { timeout: 15000 });
  await expect(page.locator('#screen-progress')).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(2000);
  
  // ============================================================
    // ESCENA 2: PESTAÑA PROGRESO - Dashboard completo (Métricas, Gráficas, Avatar 3D, Metas, Historial, Medallas)
  // ============================================================
    console.log('📊 ESCENA 2: Pestaña PROGRESO');
  await expect(page.locator('.metric-printed-card').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500); // Ver 4 tarjetas métricas: Minutos, Nivel, Medallas, Puntos
  
    // Scroll suave hacia abajo para ver gráfica semanal + avatar 3D
  await page.evaluate(() => window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' }));
    await page.waitForTimeout(1500);
  
    // Ver formulario de metas semanales
    const goalForm = page.locator('#goal-form, form:has(#goal-minutes)').first();
    if (await goalForm.isVisible({ timeout: 1500 })) {
      await page.waitForTimeout(800);
    }
  
    // Ver historial de entrenamientos (lista)
    const historyItems = page.locator('.printed-list .history-item, .history-item');
    if (await historyItems.first().isVisible({ timeout: 1500 })) {
      await page.waitForTimeout(1000);
    }
  
    // Ver medallas (lista con lock/unlock)
    const medalItems = page.locator('.printed-list .medal-item, .medal-item');
    if (await medalItems.first().isVisible({ timeout: 1500 })) {
      await page.waitForTimeout(1000);
    }
  
    // Scroll arriba
    await page.evaluate(() => window.scrollTo({ top: 0, behavior: 'smooth' }));
    await page.waitForTimeout(800);
  
  // ============================================================
    // ESCENA 3: PESTAÑA ENTRENAMIENTO - Lista ejercicios, Categorías desplegables, Panel video
  // ============================================================
    console.log('🏋️ ESCENA 3: Pestaña ENTRENAMIENTO');
    await navigateToTab(page, 'Entrenamiento');
    await page.waitForTimeout(1500);
  
    // Ver lista de ejercicios cargada
    await expect(page.locator('.exercise-printed-card, .exercise-card, .exercise-printed-list > *').first()).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1000);
  
    // Abrir TODAS las categorías desplegables (<details>/<summary>)
    const summaries = page.locator('details.exercise-category summary, .exercise-category summary, details summary');
    const count = await summaries.count();
    for (let i = 0; i < Math.min(count, 3); i++) { // Limitar a 3 para velocidad
      const s = summaries.nth(i);
      if (await s.isVisible({ timeout: 800 })) {
        await s.click();
        await page.waitForTimeout(500);
    }
  }
    await page.waitForTimeout(500);
  
    // Seleccionar primer ejercicio -> ver panel video a la DERECHA (responsive)
  const firstExercise = page.locator('.exercise-printed-card, .exercise-card, button[onclick*="selectExercise"]').first();
    if (await firstExercise.isVisible({ timeout: 2000 })) {
    await firstExercise.click();
      await page.waitForTimeout(1500);
    
      // Ver video panel con controles
      const videoPanel = page.locator('#selected-exercise-panel, .video-printed-frame').first();
      if (await videoPanel.isVisible({ timeout: 1500 })) {
        await page.waitForTimeout(1500);
      
        // Ver video (loop + playsinline)
        const video = page.locator('#exercise-video, .printed-video').first();
        if (await video.isVisible({ timeout: 800 })) {
          await page.waitForTimeout(1000);
        }
      
        // Cerrar video
        const closeVideo = page.locator('.video-close-button, button[onclick*="closeSelectedExercise"]').first();
        if (await closeVideo.isVisible({ timeout: 800 })) {
          await closeVideo.click();
          await page.waitForTimeout(300);
        }
    }
  }
  
  // ============================================================
    // ESCENA 4: PESTAÑA MIS RUTINAS - CRUD completo + Generador personalizado
  // ============================================================
    console.log('📋 ESCENA 4: Pestaña MIS RUTINAS');
    await navigateToTab(page, 'Mis Rutinas');
    await page.waitForTimeout(2000);
  
    // Ver lista de rutinas guardadas O estado vacío
    const routinesList = page.locator('#routines-list').first();
    await expect(routinesList).toBeVisible({ timeout: 10000 });
    await page.waitForTimeout(1500);
  
    // Verificar si hay rutinas o estado vacío (no fallar si no hay)
    const hasRoutines = await page.locator('.routine-printed-card').first().isVisible({ timeout: 1000 }).catch(() => false);
    const hasEmptyState = await page.locator('.routines-empty-printed').first().isVisible({ timeout: 1000 }).catch(() => false);
  
    if (hasEmptyState) {
      console.log('  → Estado vacío detectado: "No hay rutinas aún"');
    } else if (hasRoutines) {
      console.log('  → Rutinas guardadas detectadas');
    }
    await page.waitForTimeout(1000);
  
    // Abrir modal "Nueva Rutina"
  const newRoutineBtn = page.locator('button:has-text("Nueva Rutina"), button[onclick*="openRoutineModal"]').first();
    if (await newRoutineBtn.isVisible({ timeout: 2000 })) {
    await newRoutineBtn.click();
      await page.waitForTimeout(800);
    
      // Ver formulario generador personalizado (Objetivo, Nivel, Tiempo, Zona, Días)
      await page.waitForTimeout(500);
    
      // Seleccionar opciones del generador (solo 3 campos: goal, level, time)
      await page.selectOption('#personalization-goal', 'full').catch(()=>{});
      await page.waitForTimeout(200);
      await page.selectOption('#personalization-level', 'beginner').catch(()=>{});
      await page.waitForTimeout(200);
      await page.selectOption('#personalization-time', '20').catch(()=>{});
      await page.waitForTimeout(300);
    
      // Click "Generar rutina" - ver ejercicios generados dinámicamente
      const genBtn = page.locator('.routine-generate-button, button[onclick*="generatePersonalizedRoutine"]').first();
      if (await genBtn.isVisible({ timeout: 1500 })) {
        await genBtn.click();
        await page.waitForTimeout(2000); // Ver lista de ejercicios generados
    }
    
      // Cerrar modal
    const closeModal = page.locator('.routine-modal-close, button[onclick*="closeRoutineModal"]').first();
      if (await closeModal.isVisible({ timeout: 800 })) {
      await closeModal.click();
        await page.waitForTimeout(300);
    }
  }
  
  // ============================================================
    // ESCENA 5: PESTAÑA MAPA Y UBICACIÓN - Leaflet + Marcadores + Lugares cercanos
  // ============================================================
    console.log('🗺️ ESCENA 5: Pestaña MAPA Y UBICACIÓN');
    await navigateToTab(page, 'Mapa y Ubicación');
    await page.waitForTimeout(2500); // Tiempo para carga de tiles Leaflet
  
    // Ver controles de mapa (localizar, zoom)
    const locateBtn = page.locator('#locate-button, button[aria-label*="ubicación"]').first();
    if (await locateBtn.isVisible({ timeout: 2000 })) {
      await page.waitForTimeout(500);
    }
  
    // Ver lugares cercanos (parques, gimnasios)
    const places = page.locator('#nearby-places, .places-printed-grid').first();
    if (await places.isVisible({ timeout: 2000 })) {
      await page.waitForTimeout(1000);
    }
  
    // ============================================================
    // ESCENA 6: ENTRENAMIENTO GUIADO - Timer, Video, Descansos, Navegación completa ⭐
    // ============================================================
    console.log('⏱️ ESCENA 6: ENTRENAMIENTO GUIADO');
    await navigateToTab(page, 'Entrenamiento');
    await page.waitForTimeout(1000);
  
    // Iniciar rutina (buscar botón en primera rutina disponible)
  const startBtn = page.locator('button:has-text("Iniciar"), button[onclick*="startRoutine"]').first();
    if (await startBtn.isVisible({ timeout: 2000 })) {
    await startBtn.click();
      await page.waitForTimeout(1500);
    
      // Panel entrenamiento visible - MOSTRAR TODOS LOS CONTROLES
      await page.waitForTimeout(1000);
    
      // 1. Timer + indicador "Ejercicio X de Y" + barra progreso
      const timer = page.locator('#training-timer, .training-timer').first();
      if (await timer.isVisible({ timeout: 1500 })) {
        await page.waitForTimeout(2000); // Ver cuenta regresiva
      }
    
      // 2. Video del ejercicio (loop + playsinline, pausa al completar)
      const video = page.locator('#exercise-video, .printed-video').first();
      if (await video.isVisible({ timeout: 1500 })) {
        await page.waitForTimeout(1500);
      }
    
      // 3. Configuración descanso (dropdown 0/15/30/60s)
      const restSelect = page.locator('#training-rest').first();
      if (await restSelect.isVisible({ timeout: 1500 })) {
        await restSelect.selectOption('15');
        await page.waitForTimeout(300);
        await restSelect.selectOption('30');
        await page.waitForTimeout(300);
        await restSelect.selectOption('0');
        await page.waitForTimeout(300);
      }
    
      // 4. Botón Pausar/Continuar
      const pauseBtn = page.locator('#training-pause, button[onclick*="toggleTrainingTimer"]').first();
      if (await pauseBtn.isVisible({ timeout: 1500 })) {
        await pauseBtn.click();
        await page.waitForTimeout(600);
        await pauseBtn.click();
        await page.waitForTimeout(600);
      }
    
      // 5. Botón Siguiente ejercicio
      const nextBtn = page.locator('#training-next, button[onclick*="selectNextExercise"]').first();
      if (await nextBtn.isVisible({ timeout: 1500 })) {
        await nextBtn.click();
        await page.waitForTimeout(1500);
      
        // 6. Panel descanso (si aparece con contador)
        const restPanel = page.locator('#training-rest-panel, .training-rest, [class*="rest"]').first();
        if (await restPanel.isVisible({ timeout: 2000 })) {
          await page.waitForTimeout(1500);
          const skipBtn = page.locator('#training-rest-skip, button[onclick*="skipRest"]').first();
          if (await skipBtn.isVisible({ timeout: 800 })) {
            await skipBtn.click();
            await page.waitForTimeout(300);
          }
      }
    }
    
      // 7. Botón Anterior
      const prevBtn = page.locator('#training-previous, button[onclick*="selectPreviousExercise"]').first();
      if (await prevBtn.isVisible({ timeout: 1500 })) {
        await prevBtn.click();
        await page.waitForTimeout(800);
      }
    
      // 8. Botón Finalizar
      const finishBtn = page.locator('button:has-text("Finalizar"), button[onclick*="finishTraining"], button[onclick*="completeRoutine"]').first();
      if (await finishBtn.isVisible({ timeout: 1500 })) {
        await finishBtn.click();
        await page.waitForTimeout(1500);
      }
  }
  
  // ============================================================
    // ESCENA 7: RESUMEN VISUAL Fin de Rutina - Stats + Guardar
  // ============================================================
    console.log('📈 ESCENA 7: RESUMEN VISUAL');
  const summary = page.locator('.app-summary-sheet, #workout-summary, [class*="summary"]').first();
    if (await summary.isVisible({ timeout: 3000 })) {
      await page.waitForTimeout(2500); // Ver: tiempo total, ejercicios, puntos, XP, nivel
    
      // Ver botón "Guardar rutina" si aparece
      const saveBtn = page.locator('button:has-text("Guardar"), button[onclick*="saveRoutine"]').first();
      if (await saveBtn.isVisible({ timeout: 1500 })) {
        await page.waitForTimeout(500);
      }
    
    const closeBtn = page.locator('button:has-text("Cerrar"), button[onclick*="closeSummary"], .app-summary-close').first();
      if (await closeBtn.isVisible({ timeout: 800 })) {
      await closeBtn.click();
        await page.waitForTimeout(300);
    }
  }
  
  // ============================================================
    // ESCENA 8: CHATBOT CONTEXTUAL - Preguntas inteligentes usando progreso/historial/metas
  // ============================================================
    console.log('🤖 ESCENA 8: CHATBOT CONTEXTUAL');
    await navigateToTab(page, 'Progreso');
    await page.waitForTimeout(300);
  
  const chatbotToggle = page.locator('#chatbot-toggle, button[aria-label*="chatbot"], button[aria-label*="asistente"]').first();
    if (await chatbotToggle.isVisible({ timeout: 2000 })) {
    await chatbotToggle.click();
      await page.waitForTimeout(300);
    
    const chatInput = page.locator('#chatbot-input, input[placeholder*="mensaje"], input[placeholder*="Escribe"]').first();
      if (await chatInput.isVisible({ timeout: 1500 })) {
        // Pregunta 1: Generar rutina personalizada
      await chatInput.fill('Hazme una rutina para principiantes de 15 minutos');
      await chatInput.press('Enter');
        await page.waitForTimeout(3000); // Ver respuesta con ejercicios
      
        // Pregunta 2: Recomendación según progreso
      await chatInput.fill('¿Qué debo entrenar hoy según mi progreso?');
      await chatInput.press('Enter');
        await page.waitForTimeout(3000);
      
        // Pregunta 3: Instrucción de ejercicio
        await chatInput.fill('¿Cómo se hace una sentadilla correctamente?');
        await chatInput.press('Enter');
        await page.waitForTimeout(3000);
    }
    
    const chatClose = page.locator('#chatbot-close, button[aria-label*="Cerrar chatbot"]').first();
      if (await chatClose.isVisible({ timeout: 1500 })) {
      await chatClose.click();
        await page.waitForTimeout(300);
    }
  }
  
  // ============================================================
    // ESCENA 9: ACCESIBILIDAD WCAG 2.1 AA - TODAS las opciones funcionales
  // ============================================================
    console.log('♿ ESCENA 9: ACCESIBILIDAD');
    await navigateToTab(page, 'Progreso');
    await page.waitForTimeout(300);
  
  const a11yToggle = page.locator('#accessibility-toggle, button[aria-label*="accesibilidad"]').first();
    if (await a11yToggle.isVisible({ timeout: 2000 })) {
    await a11yToggle.click();
      await page.waitForTimeout(300);
    
      // A+ (aumentar tamaño) x2
    const increaseBtn = page.locator('button[data-font-action="increase"]').first();
      if (await increaseBtn.isVisible({ timeout: 800 })) {
        await increaseBtn.click(); await page.waitForTimeout(200);
        await increaseBtn.click(); await page.waitForTimeout(200);
      }
      // A- (reducir)
      const decreaseBtn = page.locator('button[data-font-action="decrease"]').first();
      if (await decreaseBtn.isVisible({ timeout: 800 })) {
        await decreaseBtn.click(); await page.waitForTimeout(200);
    }
      // Reset tamaño
    const resetFontBtn = page.locator('button[data-font-action="reset"]').first();
      if (await resetFontBtn.isVisible({ timeout: 800 })) {
        await resetFontBtn.click(); await page.waitForTimeout(200);
    }
    
      // Modo Oscuro (toggle con icono 🌙→☀️)
    const darkmodeBtn = page.locator('button[data-accessibility-action="darkmode"]').first();
      if (await darkmodeBtn.isVisible({ timeout: 800 })) {
        await darkmodeBtn.click(); await page.waitForTimeout(800); // Ver cambio tema completo
        await darkmodeBtn.click(); await page.waitForTimeout(400); // Volver a claro
    }
    
    // Alto contraste
    const contrastBtn = page.locator('button[data-accessibility-action="contrast"]').first();
      if (await contrastBtn.isVisible({ timeout: 800 })) {
        await contrastBtn.click(); await page.waitForTimeout(600);
        await contrastBtn.click(); await page.waitForTimeout(200);
    }
    
    // Reducir movimiento
    const motionBtn = page.locator('button[data-accessibility-action="motion"]').first();
      if (await motionBtn.isVisible({ timeout: 800 })) {
        await motionBtn.click(); await page.waitForTimeout(600);
        await motionBtn.click(); await page.waitForTimeout(200);
    }
    
    // Reset todo
    const resetBtn = page.locator('button[data-accessibility-action="reset"]').first();
      if (await resetBtn.isVisible({ timeout: 800 })) {
        await resetBtn.click(); await page.waitForTimeout(200);
    }
    
    const a11yClose = page.locator('#accessibility-close, button[aria-label*="Cerrar accesibilidad"]').first();
      if (await a11yClose.isVisible({ timeout: 800 })) {
        await a11yClose.click(); await page.waitForTimeout(200);
    }
  }
  
  // ============================================================
    // ESCENA 10: NOTIFICACIONES - Toast (success/error/info) + Confirm Sheet
  // ============================================================
    console.log('🔔 ESCENA 10: NOTIFICACIONES');
    await page.evaluate(() => window.showToast?.('¡Entrenamiento completado! +50 XP', 'success', 3000));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.showToast?.('Error de conexión. Reintentando...', 'error', 3000));
    await page.waitForTimeout(1200);
    await page.evaluate(() => window.showToast?.('Nueva medalla desbloqueada: Primer Paso', 'info', 3000));
    await page.waitForTimeout(1200);
  
    // Confirm sheet (accesible, sin alert())
    await page.evaluate(() => window.showConfirm?.('¿Seguro que quieres salir?', 'Tu progreso no se guardará.', ()=>{}, ()=>{}));
    await page.waitForTimeout(1200);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(300);
  
    // ============================================================
    // ESCENA 11: LOGOUT + Retorno a Login Ebru (PANTALLA FINAL)
    // ============================================================
    console.log('🚪 ESCENA 11: LOGOUT');
    await navigateToTab(page, 'Progreso');
    await page.waitForTimeout(300);
  
  await page.evaluate(() => {
      const btns = document.querySelectorAll('.logout-btn, .nav-btn');
      btns.forEach(btn => {
        if (btn.textContent.includes('Cerrar sesión')) btn.click();
      });
  });
    await page.waitForTimeout(800);
    await expect(page.locator('#screen-login')).toBeVisible();
  
  // ============================================================
    // FIN: Esperar 5 segundos mostrando la última pantalla (Login Ebru animado)
  // ============================================================
    console.log('✅ FIN: Mostrando pantalla final 5 segundos');
    await page.waitForTimeout(5000);
});

// Helper: Navegar a una pestaña via sidebar (robusto con JS)
async function navigateToTab(page, tabText) {
    await page.evaluate((text) => {
      // Abrir sidebar
      const toggle = document.querySelector('.sidebar-toggle');
      if (toggle) toggle.click();
    
      // Click en nav-btn via setTimeout para dar tiempo a la animación
      setTimeout(() => {
        const btns = document.querySelectorAll('.nav-btn');
        btns.forEach(btn => {
          if (btn.textContent.includes(text)) btn.click();
        });
      }, 400);
    }, tabText);
  
    await page.waitForTimeout(1000); // Esperar navegación y render
}

test('API Health Check', async ({ request }) => {
  const response = await request.get(`${API_URL}/api/exercises`);
  expect(response.ok()).toBeTruthy();
  const data = await response.json();
  expect(Array.isArray(data)).toBeTruthy();
  expect(data.length).toBeGreaterThan(0);
});