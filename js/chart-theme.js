/**
 * chart-theme.js
 * Single source of truth for Chart.js styling — reads from CSS custom properties
 * so charts always stay in sync with the Vital Balance design system.
 *
 * Usage:
 *   import { chartTheme } from './chart-theme.js';
 *   // then use chartTheme.colors.primary, chartTheme.fonts.body, etc.
 */

// Helper to read a CSS custom property from :root
function cssVar(name) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

// Cache resolved values (CSS vars are resolved at runtime, so this runs on import)
export const chartTheme = {
  colors: {
    // Primary brand colors
    primary: cssVar('--pigment-sage'),           // #3d5a4a (light) / #7db89d (dark)
    primaryLight: cssVar('--pigment-sage-light'), // #8da399 / #a8d4bd
    secondary: cssVar('--pigment-sienna'),        // #a67c52
    accent: cssVar('--pigment-amber'),            // #d4c5b9

    // UI / Neutral
    paper: cssVar('--paper'),                     // #fcfaf7 / #1a1c1a
    water: cssVar('--water'),                     // #eef2f0 / #252826
    fiber: cssVar('--fiber'),                     // #e8e3db / #3a3d3a
    ink: cssVar('--ink'),                         // #4a4a4a / #f0efe9
    inkMuted: cssVar('--ink-muted'),              // #5c5a56 / #c8c4be
    inkLight: cssVar('--ink-light'),              // #7a7670 / #a8a49c

    // Semantic
    error: cssVar('--error'),                     // #c0392b
    success: cssVar('--success'),                 // #2d8a4f
    focusRing: cssVar('--focus-ring'),            // rgba(61,90,74,0.4) / rgba(125,184,157,0.5)

    // Chart-specific derived
    grid: cssVar('--fiber'),                      // subtle grid lines
    tooltipBg: 'rgba(74, 74, 74, 0.9)',          // dark tooltip (works both themes)
    tooltipText: '#ffffff',
  },

  fonts: {
    body: cssVar('--font-body'),                  // 'Outfit', sans-serif
    display: cssVar('--font-display'),            // 'Playfair Display', serif
  },

  // Chart.js defaults that can be spread into chart configs
  defaults: {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index',
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        backgroundColor: 'rgba(74, 74, 74, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        padding: 12,
        cornerRadius: 8,
        displayColors: false,
        titleFont: { family: "'Outfit', sans-serif", weight: '600' },
        bodyFont: { family: "'Outfit', sans-serif" },
      },
    },
    scales: {
      x: {
        grid: { display: false, drawBorder: false },
        ticks: {
          color: 'var(--ink-muted)',
          font: { family: "'Outfit', sans-serif", size: 12 },
        },
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(232, 227, 219, 0.3)', // var(--fiber) with opacity
          drawBorder: false,
        },
        ticks: {
          color: 'var(--ink-muted)',
          font: { family: "'Outfit', sans-serif", size: 11 },
          stepSize: 10,
          callback: (value) => `${value} min`,
        },
      },
    },
    animation: {
      duration: 800,
      easing: 'easeOutQuart',
    },
  },

  // Metric-type color mappings (for progressCharts.js multi-metric support)
  metricColors: {
    minutes: {
      bg: 'rgba(61, 90, 74, 0.8)',      // var(--pigment-sage) with alpha
      border: 'rgba(61, 90, 74, 1)',    // var(--pigment-sage)
      hoverBg: 'rgba(61, 90, 74, 1)',
      hoverBorder: 'rgba(141, 163, 153, 1)', // var(--pigment-sage-light)
    },
    exercises: {
      bg: 'rgba(166, 124, 82, 0.8)',    // var(--pigment-sienna) with alpha
      border: 'rgba(166, 124, 82, 1)',  // var(--pigment-sienna)
      hoverBg: 'rgba(166, 124, 82, 1)',
      hoverBorder: 'rgba(212, 197, 185, 1)', // var(--pigment-amber)
    },
    points: {
      bg: 'rgba(212, 197, 185, 0.8)',   // var(--pigment-amber) with alpha
      border: 'rgba(212, 197, 185, 1)', // var(--pigment-amber)
      hoverBg: 'rgba(212, 197, 185, 1)',
      hoverBorder: 'rgba(141, 163, 153, 1)',
    },
  },

  // Gradient helper for bar charts (top-to-bottom fade)
  createVerticalGradient(ctx, colorKey = 'primary', height = 300) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height);
    const base = this.colors[colorKey] || this.colors.primary;
    // Parse rgb/rgba to add alpha stops
    const rgb = base.match(/\d+/g);
    if (rgb && rgb.length >= 3) {
      gradient.addColorStop(0, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.8)`);
      gradient.addColorStop(1, `rgba(${rgb[0]}, ${rgb[1]}, ${rgb[2]}, 0.1)`);
    } else {
      // Fallback for hex or named colors
      gradient.addColorStop(0, base.replace(')', ', 0.8)').replace('rgb', 'rgba'));
      gradient.addColorStop(1, base.replace(')', ', 0.1)').replace('rgb', 'rgba'));
    }
    return gradient;
  },
};

// Also attach to window for non-module scripts that need it (fallback)
if (typeof window !== 'undefined') {
  window.chartTheme = chartTheme;
}