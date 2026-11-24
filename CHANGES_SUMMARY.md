# EntrenaTuSer - Hoja de Identidad Redesign - Changes Summary

**Date:** 2026-11-24
**Status:** In Progress - Integration Testing Phase

---

## Overview
Complete redesign of EntrenaTuSer web app using "Hoja de Identidad" UX direction across all 5 main screens:
- Workout (Entrenamiento)
- Map (Mapa y Ubicación)
- Progress (Mi Progreso)
- Routines (Mis Rutinas)
- Profile (Perfil)

### Design Direction: Hoja de Identidad
Structure per screen:
1. **Hero Identity** - Anchor (brand/logo/title + key meta)
2. **Primary** - Always visible (task-oriented content)
3. **Secondary** - Collapsible (accordions/drawers for details)
4. **Danger Zone** - Isolated (destructive actions)

---

## Files Created

### CSS
- **`css/styless.css`** - Extended with 1000+ lines of new utilities:
  - `.hero-identity` (variants: .compact, .large)
  - `.accordion-item` / `.accordion-header` / `.accordion-content` / `.accordion-icon`
  - `.danger-zone`
  - `.toggle-switch`
  - `.metric-card-compact`
  - `.skeleton` loaders
  - `.drawer-panel` (slide-up from right)
  - `.places-slideup-panel` (bottom slide-up for map)
  - `.video-printed-frame`, `.training-controls`, `.rest-overlay`
  - `.exercise-card`, `.place-card`, `.routine-card`, `.medal-badge`, `.stat-item`
  - `.chart-printed-frame`, `.progress-goals-printed`
  - `.modal-overlay`, `.modal-sheet`, `.wizard-*` components
  - `.hero-avatar-editor` with edit overlay
  - Responsive breakpoints (mobile <768px, desktop ≥768px)
  - Dark theme overrides (`body.dark-theme`)
  - High contrast overrides (`body.accessibility-high-contrast`)
  - Reduced motion (`@media (prefers-reduced-motion: reduce)`)

### JavaScript Modules (New)
| File | Purpose |
|------|---------|
| `js/accordionController.js` | Native `<details>` accordion management, ARIA, keyboard |
| `js/heroAvatarEditor.js` | Live-edit avatar (color picker, initials, inline save) |
| `js/workoutStateMachine.js` | State machine: IDLE → SELECTION → ACTIVE → RESTING → FINISHED |
| `js/routineWizard.js` | 3-step modal wizard (Basics → Exercises → Review) |
| `js/mapPlacesPanel.js` | Map places slide-up panel with filter chips |
| `js/progressCharts.js` | Chart.js wrapper for weekly progress bar chart |

### HTML
- **`extras/index.html`** - Completely restructured all 5 `screen-tab` sections with Hoja de Identidad topology
- **`index.html`** - Copied to root for server

### JavaScript (Updated)
| File | Key Changes |
|------|-------------|
| `js/profile.js` | Rewritten for new modal structure (edit profile, change password, accessibility toggles, delete account with "ELIMINAR" confirmation) |
| `js/navigation.js` | Updated `switchTab()` to initialize `workoutStateMachine` on workout screen |
| `js/exercises.js` | New `.exercise-card` grid, state transitions (selection/active), rest overlay integration |
| `js/map.js` | Slide-up panel integration, hero locate button, `centerMapOnPlace()` global |
| `js/progress.js` | Metric cards, accordion integration, chart module integration, calendar/streak |
| `js/routines.js` | Wizard modal integration, drag-drop exercise selection, `.routine-card` grid |

---

## Files Modified for Testing

### Test Updates (`tests/cross-browser.spec.js`)
- **Progress test** - Updated selectors to new metric card IDs (`#progress-weekly-minutes`, `#hero-level`, `#streak-count`)
- **Training test** - Updated to wait for `.exercise-card`, check `#workout-title`
- **Routines test** - Updated for wizard flow (step 1→2→3), `.routine-card` verification
- **Map test** - Updated to check `.places-printed-grid`

---

## Current Test Status

### ✅ Passing
- Login screen renders correctly
- Registration form works
- Progress dashboard loads with metrics (6.5s)

### ❌ Failing / Need Investigation
- **Training screen loads exercises** - `.exercise-card` present in DOM but reported as "hidden" (likely CSS `.workout-state` visibility issue)
- **Routines screen CRUD operations** - Not yet tested
- **Map screen loads** - Not yet tested
- **Accessibility panel** - Not yet tested

---

## Key Integration Points Needing Verification

1. **Workout State Machine ↔ exercises.js** - State transitions (selection/active/rest/finish)
2. **Routine Wizard ↔ routines.js** - Exercise selector population, drag-drop, data flow
3. **Map Places Panel ↔ map.js** - Place data transformation, filter chips, map centering
4. **Progress Charts ↔ progress.js** - Chart.js initialization, data updates
5. **Avatar Editor ↔ profile.js** - Live preview, save to API, localStorage sync
5. **Accordion Controller** - All accordions across screens initialized

---

## Server/API Status
- **API** (`dotnet run` on port 5143) - ✅ Running, database connected (18 exercises, 11 medals)
- **Frontend** (`serve -l 5500`) - Runs via Playwright webServer
- **Database** - SQL Server LocalDB, schema initialized

---

## Next Steps

1. **Fix Training screen visibility** - Debug `.workout-state.active` CSS vs `.hidden` class conflict
2. **Run full test suite** - All 13 cross-browser tests across chromium/firefox/webkit/mobile
3. **Verify responsive breakpoints** - Mobile (<768px), Tablet, Desktop
4. **Accessibility audit** - Keyboard nav, ARIA, high contrast, reduced motion
5. **Cross-component state sync** - Ensure workout state persists tab switches

---

## Commands Reference

```bash
# Start API
cd api && dotnet run --launch-profile http

# Run specific test
cd .. && npx playwright test tests/cross-browser.spec.js --project=chromium -g "Progress dashboard"

# Run all cross-browser tests
npx playwright test tests/cross-browser.spec.js --project=chromium

# View report
npx playwright show-report playwright-report
```

---

## Architecture Notes

### Ebru Design System Variables (Preserved)
```css
:root {
  --paper: #fdfbf7;
  --water: #e8f4f3;
  --pigment-teal: #0d9488;
  --pigment-amber: #f59e0b;
  --ink: #1a1a2e;
  --ink-muted: #6b7280;
  --fiber: #e5e7eb;
  --lift-shadow: rgba(0,0,0,0.08);
}
```

### Authentication Flow
- Token stored in `localStorage.auth_token`
- User data in `localStorage.user_data`
- API base URL: `window.API_BASE_URL || 'http://localhost:5143'`

### State Management Pattern
- Global singletons on `window` (e.g., `window.workoutStateMachine`, `window.routineWizard`)
- Event-driven via `window.dispatchEvent(new Event('user-authenticated'))`
- localStorage for persistence across sessions