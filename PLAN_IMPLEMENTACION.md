# Plan de Implementación - Entrena Tu Ser (Solo Web)

Basado en la propuesta académica, enfocado **solo en plataforma web** (ignora móvil y avatar guía).

---

## 📊 Estado Actual vs. Propuesta

| Módulo | Implementado | Falta |
|--------|--------------|-------|
| Auth (login/register/profile) | ✅ Completo | — |
| Rutinas CRUD | ✅ Completo | — |
| Ejercicios catálogo | ✅ Completo | — |
| Progreso básico | ✅ Completo | Barra sesión + mensajes |
| Gamificación básica | ✅ Puntos, niveles | Medallas condiciones, notificaciones |
| API Backend | ✅ Completa | Endpoints progreso sesión |
| Dashboard web | ✅ Básico | Gráficas, historial avanzado |

---

## 🎯 FASE 1: Entrenamiento Core (Sprint 1-2) — **ALTA PRIORIDAD**

### 1.1 Barra de Progreso de Sesión (`screen-workout`)
- **Frontend**: Componente visual con:
  - % avance (ejercicios completados / total)
  - Ejercicio actual: "Ejercicio 3 de 6"
  - Nombre ejercicio actual
  - Tiempo restante del ejercicio
- **Estados**: Listo → En progreso → Pausa → Descanso → Completado
- **Integración**: Conectar con `exercises.js` + `routines.js`

### 1.2 Mensajes de Retroalimentación (Toast/Inline)
- **Triggers**: Inicio rutina, cambio ejercicio, fin ejercicio, fin rutina, logro desbloqueado
- **Textos**: "Prepárate para comenzar", "Siguiente ejercicio: [nombre]", "Ejercicio completado", "¡Rutina finalizada!", "🏆 Nueva medalla: [nombre]"
- **UI**: Toast no intrusivo + indicador en barra progreso

### 1.3 Temporizador por Ejercicio
- **Controles**: Iniciar / Pausar / Reanudar / Saltar descanso / Finalizar
- **Configuración**: Descanso entre ejercicios (0/15/30/60 seg) — ya existe en HTML
- **Auto-avance**: Al terminar ejercicio → descanso → siguiente ejercicio
- **Persistencia**: Guardar estado en `sessionStorage` para recargas

### 1.4 API Endpoints Necesarios (Backend)
```
POST /api/sessions/start          # Iniciar sesión entrenamiento
POST /api/sessions/{id}/exercise  # Completar ejercicio individual
POST /api/sessions/{id}/complete  # Finalizar sesión completa
GET  /api/sessions/{id}/progress  # Progreso tiempo real
```

---

## 🎮 FASE 2: Gamificación Completa (Sprint 3) — **MEDIA PRIORIDAD**

### 2.1 Medallas con Condiciones Verificables
| Medalla | Condición | Backend Check |
|---------|-----------|---------------|
| **Primera Rutina** | Completar 1 sesión | `COUNT(sesiones) >= 1` |
| **Constancia 3 días** | 3 días seguidos con ≥1 sesión | Query fechas consecutivas |
| **Activado** | 150 min acumulados | `minutos_totales >= 150` |
| **Nivel 5** | Alcanzar nivel 5 | `nivel >= 5` |
| **Rachas** | 7, 14, 30 días | Streak calculation |

### 2.2 Sistema de Niveles Progresivo
- **Fórmula**: `nivel = 1 + (puntos_totales / 500)` — ya existe en backend
- **Frontend**: Barra XP visual, próximo nivel, puntos necesarios

### 2.3 Notificaciones Visuales de Logros
- **Modal/Toast** al desbloquear: icono, nombre, descripción
- **Persistencia**: Mostrar en perfil + dashboard
- **Animación**: Confetti sutil o pulse en icono medalla

---

## 📈 FASE 3: Dashboard Web Avanzado (Sprint 4) — **MEDIA PRIORIDAD**

### 3.1 Gráficas de Progreso (Chart.js ya incluido)
- **Semanal**: Minutos/día (últimos 7 días) — ya existe
- **Mensual**: Actividad por semana
- **Por tipo**: Fuerza vs Cardio vs Movilidad
- **Racha visual**: Calendario tipo GitHub (heatmap 90 días)

### 3.2 Historial Detallado con Filtros
- **Filtros**: Por fecha, tipo rutina, duración
- **Paginación**: Carga infinita o paginada
- **Exportar**: CSV/PDF (opcional)

### 3.3 Configuración Metas Semanales
- **UI**: Modal existente en `screen-profile` → conectar con API
- **Tipos**: Minutos semanales / Ejercicios completados
- **Visual**: Barra progreso meta en dashboard

---

## 🔧 FASE 4: Pulido y Calidad (Sprint 5) — **BAJA PRIORIDAD**

### 4.1 Recuperación Contraseña (Backend + Frontend)
- **Endpoint**: `POST /api/auth/forgot-password` + `PUT /api/auth/reset-password`
- **Email**: Token temporal (simulado en dev)

### 4.2 Accesibilidad y Tests
- **WCAG AA**: Verificar contraste (ya sage green #8da399 ✅)
- **Teclado**: Navegación completa sin ratón
- **Screen reader**: ARIA labels en barra progreso, toasts
- **E2E Tests**: Playwright - flujo login → rutina → completar → dashboard

### 4.3 Performance
- **Lazy load**: Componentes no críticos
- **Cache**: Service worker para assets estáticos
- **Bundle**: Verificar tamaño JS/CSS

---

## 📦 Entregables por Sprint

| Sprint | Entregable | Archivos Clave |
|--------|------------|----------------|
| 1 | Barra progreso + mensajes + timer | `js/exercises.js`, `js/routines.js`, `css/styless.css` |
| 2 | Medallas condiciones + niveles + notifs | `js/progress.js`, `api/Program.cs`, `css/styless.css` |
| 3 | Gráficas + historial + metas | `js/progress.js`, `js/dashboard-chart.js`, `css/styless.css` |
| 4 | Recuperación pass + a11y + tests | `js/auth.js`, `api/Program.cs`, `tests/*.spec.js` |

---

## 🎨 Diseño - Vital Balance (Sage Green #8da399)

**Variables CSS ya actualizadas:**
```css
--pigment-orange: #8da399;  /* Sage Green - accent principal */
--ebru-orange: var(--pigment-orange);
--paper: #faf8f5;
--ink: #2d2a26;
```

**Componentes nuevos usan:**
- Botones: `background: var(--ebru-orange); color: white;`
- Barras progreso: `background: linear-gradient(90deg, var(--ebru-teal), var(--ebru-orange));`
- Toasts/Alertas: Borde `var(--ebru-orange)`, icono mismo color
- Medallas: Gradiente sage + teal

---

## ✅ Criterios de Aceptación (Definition of Done)

- [ ] Usuario completa rutina completa web: selecciona → ejecuta → ve progreso → finaliza → ve resultados en dashboard
- [ ] Medallas se desbloquean automáticamente y notifican
- [ ] Gráficas reflejan datos reales de API
- [ ] Tests E2E pasan en CI
- [ ] WCAG AA contrast en todos los nuevos componentes
- [ ] Dark mode funcional en nuevas vistas

---

## 📝 Notas Técnicas

- **Backend**: ASP.NET Core 10 + SQL Server — agregar endpoints en `Program.cs`
- **Frontend**: Vanilla JS modular (`js/*.js`) — mantener patrón actual
- **Estilos**: `css/styless.css` — usar variables `--ebru-*` exclusivamente
- **Auth**: JWT en localStorage — `window.apiFetch` ya maneja headers
- **Base datos**: Migraciones en `init-db/` — nuevas tablas si necesarias

---

**Prioridad inmediata**: **Fase 1.1-1.3** (Barra progreso + Mensajes + Timer) — habilita el flujo completo de entrenamiento web.