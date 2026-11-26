/**
 * dashboard-chart.js
 * Weekly progress chart for the Dashboard screen — now fully on-brand via chartTheme.
 */

import { chartTheme } from './chart-theme.js';
import Chart from 'chart.js/auto';

document.addEventListener('DOMContentLoaded', () => {
    initWeeklyChart();
});

function initWeeklyChart() {
    const canvas = document.getElementById('weeklyChart');

    if (!canvas) return;

    const ctx = canvas.getContext('2d');

    // Brand gradient using chartTheme helper (top-to-bottom fade)
    const gradient = chartTheme.createVerticalGradient(ctx, 'primary', 300);

    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Minutos de Actividad',
                data: [45, 60, 25, 80, 55, 90, 40], // Sample data — replaced by progress.js at runtime
                backgroundColor: gradient,
                borderColor: chartTheme.colors.primary,
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false,
            }]
        },
        options: {
            ...chartTheme.defaults,
            plugins: {
                ...chartTheme.defaults.plugins,
                tooltip: {
                    ...chartTheme.defaults.plugins.tooltip,
                    callbacks: {
                        label: (context) => `${context.parsed.y} min`
                    }
                }
            },
            scales: {
                ...chartTheme.defaults.scales,
                y: {
                    ...chartTheme.defaults.scales.y,
                    ticks: {
                        ...chartTheme.defaults.scales.y.ticks,
                        callback: (value) => `${value} min`
                    }
                }
            },
            animation: {
                ...chartTheme.defaults.animation,
                duration: 1200, // Slightly faster for dashboard feel
            }
        }
    });
}