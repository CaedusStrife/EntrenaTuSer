# EntrenaTuSer

A fitness tracking web application with a distinctive Ebru/Marmoleado design system.

## Features

- **Authentication**: Login, registration, password recovery/reset with email domain validation
- **Profile Management**: Hero identity, avatar editor, accessibility preferences
- **Workout Routines**: Multi-step wizard for routine creation/editing
- **Exercise Library**: Video-guided exercises with YouTube integration
- **Progress Tracking**: Weekly metrics, calendar heatmap, goals, medals
- **Workout State Machine**: Manages workout session flow
- **Map Integration**: Find nearby exercise locations
- **Chatbot**: AI-assisted workout guidance
- **Accessibility**: High contrast, reduced motion, dark mode, font scaling

## Tech Stack

- Vanilla HTML/CSS/JS (ES Modules)
- Chart.js for progress visualization
- Leaflet for maps
- Lucide icons
- ESLint + Prettier for code quality
- JSDoc for documentation

## Development

```bash
# Install dependencies
npm install

# Lint code
npm run lint

# Format code
npm run format

# Generate documentation
npm run docs

# Run tests
npm test
```

## Design System

The app uses a custom Ebru/Marmoleado design system with:
- CSS variables for theming
- Paper-sheet and bath background patterns
- Pigment-teal accent color
- Marbled-print decorative elements