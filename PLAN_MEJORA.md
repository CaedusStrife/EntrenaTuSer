# Plan de Mejora - EntrenaTuSer

> **Fecha de creación:** 25/11/2026  
> **Estado:** En progreso  
> **Repositorio:** https://github.com/CaedusStrife/EntrenaTuSer  
> **Deploy:** Auto via GitHub Actions (push a `main`)

---

## 📋 Resumen Ejecutivo

| Componente | URL | Estado |
|------------|-----|--------|
| **Frontend (PWA)** | https://ambitious-ground-0e3dfc61e.3.azurestaticapps.net/ | ✅ Deploy OK / ⚠️ Bugs JS |
| **API Backend** | https://api-entrenatuse-bge9a6g4cyatcpf4.westus3-01.azurewebsites.net | ✅ Deploy OK / ❌ 500 en endpoints user |

---

## 🎯 FASE 1: Crítico - Bloqueadores (1-2 días)

### 1.1 Fixear URL de API en Frontend
- [x] **Localizar** archivo de configuración (`js/api-config.js` o similar)
- [x] **Cambiar** URL hardcodeada → ya estaba correcta en `js/api-config.js` (`api-entrenatuse-bge9a6g4cyatcpf4.westus3-01.azurewebsites.net`)
- [ ] **Mejor:** Usar variable de entorno `VITE_API_URL` en `vite.config.js` (pendiente)
- [x] **Verificar** en consola que ya no hay `ERR_NAME_NOT_RESOLVED` (build OK)

### 1.2 Implementar `completeSelectedExercise`
- [x] **Localizar** dónde se llama (inline `onclick` en `index.html` y `js/workoutStateMachine.js`)
- [x] **Crear** función global en `js/exercises.js` (ya existía, línea 528)
- [x] **Exponer** en `window.completeSelectedExercise` (agregado)
- [x] **Conectar** con API `POST /api/progress/complete` (endpoint existente)
- [ ] **Probar** flujo: Entrenamiento → Seleccionar ejercicio → "Completar ejercicio" (pendiente deploy)

### 1.3 Null Checks en Event Listeners
- [x] **Archivo:** `js/accessibility.js` - agregados null checks en líneas 191-195
- [x] **Archivo:** `js/chatbot.js` - agregados null checks en líneas 211-224
- [x] **Fix:** Verificar existencia antes de `addEventListener`
- [x] **Verificar** que error `TypeError: Cannot read properties of null` desaparece (build OK)

### 1.4 Fixear API 500 en `/user/profile` y `/user/preferences`
- [ ] **Revisar logs** en Azure Portal → App Service → Log stream
- [ ] **Causas probables:**
  - Connection string BD incorrecta en `appsettings.Production.json`
  - Migraciones pendientes (`dotnet ef database update`)
  - Middleware de auth roto (JWT validation)
- [ ] **Fixear** y redeploy (push a main)

---

## 🟠 FASE 2: Alta - Calidad y Observabilidad (2-3 días)

### 2.1 Health Checks en API
- [x] Agregar en `Program.cs` - endpoints `/health` y `/api/health` con verificación de BD
- [x] Verificar `GET /health` y `GET /api/health` devuelven 200 (pendiente deploy)

### 2.2 Configurar CORS Correctamente
- [x] En `Program.cs` - política `FrontendPolicy` con origen de producción `https://ambitious-ground-0e3dfc61e.3.azurestaticapps.net`
- [x] Configurable via `Cors:AllowedOrigins` en appsettings
- [ ] Verificar sin errores CORS en Network tab (pendiente deploy)

### 2.3 Variables de Entorno Centralizadas
- [ ] **GitHub Secrets / Azure App Settings:**
  - `VITE_API_URL` = URL real de la API
  - `FRONTEND_URL` = URL de Static Web App
- [ ] **Frontend:** `vite.config.js` usar `import.meta.env.VITE_API_URL`
- [ ] **API:** `appsettings.Production.json` para connection strings

### 2.4 Logging + Application Insights
- [ ] `builder.Logging.AddApplicationInsights();`
- [ ] `builder.Services.AddApplicationInsightsTelemetry();`
- [ ] Configurar `APPINSIGHTS_INSTRUMENTATIONKEY` en Azure

---

## 🟡 FASE 3: Media - UX y Funcionalidades (3-5 días)

### 3.1 Video Player en Entrenamiento
- [ ] Integrar `<video>` con MP4s de `media/videos/`
- [ ] Controles: play/pause, velocidad (0.5x/1x/1.5x/2x), fullscreen
- [ ] Tracking: tiempo visto → enviar a API al completar

### 3.2 Flujo Completo "Completar Ejercicio"
- [ ] UI: Modal con video + timer + botón "Completar"
- [ ] API: `POST /api/workouts/complete` con `{ exerciseId, duration, userId }`
- [ ] Actualizar dashboard en tiempo real (SignalR o polling)

### 3.3 Notificaciones Toast
- [ ] Reemplazar status bar por toast (librería ligera o custom)
- [ ] Tipos: success, error, warning, info
- [ ] Auto-dismiss 3-5s, action buttons opcionales

### 3.4 Validación Formularios Mejorada
- [ ] Cliente: validación en tiempo real + mensajes en español
- [ ] Servidor: DataAnnotations + FluentValidation
- [ ] Password strength meter en registro

### 3.5 Tests E2E (Playwright)
- [ ] `tests/auth-flow.spec.js` - Registro → Login → Dashboard
- [ ] `tests/workout-flow.spec.js` - Seleccionar → Video → Completar
- [ ] `tests/api-health.spec.js` - Health checks + CORS
- [ ] CI: Ejecutar en PRs (workflow `test.yml`)

---

## 🟢 FASE 4: Baja - Pulido y Escalabilidad (1-2 semanas)

### 4.1 PWA Completo
- [ ] `manifest.webmanifest` con shortcuts, screenshots, categories
- [ ] Offline fallback page (`offline.html`)
- [ ] Push notifications (VAPID keys en `workbox-config.cjs`)

### 4.2 Internacionalización (i18n)
- [ ] Español (default) + Inglés
- [ ] `i18next` o similar
- [ ] Selector de idioma en perfil

### 4.3 Métricas de Negocio
- [ ] Eventos custom: `exercise_completed`, `routine_created`, `milestone_reached`
- [ ] Dashboard en Application Insights / Grafana

### 4.4 CI/CD Mejoras
- [ ] Staging environment (deploy PRs a recursos `*-dev`)
- [ ] Preview URLs en comentarios de PR
- [ ] Rollback automático si health check falla post-deploy

### 4.5 Seguridad
- [ ] Rate limiting en `/api/auth/*` (ASP.NET Core RateLimiting)
- [ ] CSP headers (`Content-Security-Policy`)
- [ ] Dependency scanning (Dependabot + `npm audit`)
- [ ] Penetration test básico (OWASP ZAP)

---

## ⚡ QUICK WINS (Hoy - 30 min c/u)

| # | Acción | Archivo | Verificación |
|---|--------|---------|--------------|
| 1 | Fix API URL | `js/api-config.js` / `vite.config.js` | Sin `ERR_NAME_NOT_RESOLVED` en consola |
| 2 | Health check API | `api/Program.cs` | `GET /health` → 200 OK |
| 3 | `completeSelectedExercise` | `js/workoutStateMachine.js` | Botón "Completar" funciona |
| 4 | Null checks | `js/accessibility.js` | Sin `TypeError: null` en consola |
| 5 | CORS | `api/Program.cs` | Sin errores CORS en Network tab |

---

## 📊 Métricas de Éxito Post-Fix

| Métrica | Target Actual | Target Objetivo |
|---------|---------------|-----------------|
| Errores JS en consola | ~5 | **0** |
| API health check | 404 | **200 OK < 200ms** |
| Login → Dashboard | Fallo (API) | **< 3s end-to-end** |
| Completar ejercicio | `ReferenceError` | **Funciona 100%** |
| Carga perfil | 500 | **< 1s, sin 500** |
| Lighthouse Performance | ~60 | **> 90** |
| Lighthouse Accessibility | ~85 | **100** |

---

## 📝 Log de Cambios

| Fecha | Fase | Tarea | Commit | Estado |
|-------|------|-------|--------|--------|
| 25/11/2026 | - | Organización proyecto + limpieza | `cdaedaa` | ✅ Done |
| 25/11/2026 | 1.1 | Fix API URL en frontend | - | ✅ Done (ya correcta) |
| 25/11/2026 | 1.2 | Implementar completeSelectedExercise | - | ✅ Done (expuesta en window) |
| 25/11/2026 | 1.3 | Null checks event listeners | - | ✅ Done (accessibility.js, chatbot.js) |
| 25/11/2026 | 2.1 | Health Checks en API | - | ✅ Done (endpoints /health, /api/health) |
| 25/11/2026 | 2.2 | Configurar CORS producción | - | ✅ Done (FrontendPolicy) |
| 25/11/2026 | 1.4 | Fix API 500 user endpoints | - | ⏳ Pendiente (revisar logs Azure) |

---

## 🔗 Referencias Rápidas

- **Repo:** https://github.com/CaedusStrife/EntrenaTuSer
- **Actions:** https://github.com/CaedusStrife/EntrenaTuSer/actions
- **Azure Portal:** https://portal.azure.com
- **Static Web App:** `EntrenaTuSer` (rg-entrenatuser-prod2, West US 2)
- **App Service API:** `api-entrenatuse-bge9a6g4cyatcpf4` (rg-entrenatuser-prod2, West US 3)
- **SQL Server:** `entrenatuser-server-202` → `EntrenaTuSer` DB

---

> **Nota:** Marcar con `[x]` al completar cada tarea. Actualizar este archivo tras cada commit significativo.