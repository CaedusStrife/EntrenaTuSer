// progressCharts.js

/**
 * Manages Chart.js integration for the Progress screen.
 * Handles weekly chart rendering, updates, and responsive behavior.
 * Now fully on-brand via chartTheme.
 */

import { chartTheme } from './chart-theme.js';
import Chart from 'chart.js/auto';

class ProgressCharts {
    constructor() {
        this.weeklyChart = null;
        this.canvas = document.getElementById('progress-weeklyChart');
        this.currentMetricType = 'minutes';

        this.init();
    }

    init() {
        if (!this.canvas || typeof Chart === 'undefined') {
            console.warn('ProgressCharts: Canvas not found or Chart.js not loaded');
            return;
        }

        this.setupChart();
        this.updateChartLabels(); // Set initial labels
    }

    setupChart() {
        const ctx = this.canvas.getContext('2d');

        this.weeklyChart = new Chart(ctx, {
            type: 'bar',
            data: {
                labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
                datasets: [{
                    label: 'Minutos',
                    data: [0, 0, 0, 0, 0, 0, 0],
                    backgroundColor: chartTheme.metricColors.minutes.bg,
                    borderColor: chartTheme.metricColors.minutes.border,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: chartTheme.metricColors.minutes.hoverBg,
                    hoverBorderColor: chartTheme.metricColors.minutes.hoverBorder,
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
                }
            }
        });
    }

    /**
     * Update chart with new weekly data
     * @param {number[]} weeklyData - Array of 7 numbers representing minutes per day
     */
    updateChart(weeklyData) {
        if (!this.weeklyChart) return;

        // Ensure we have exactly 7 data points
        const data = Array.isArray(weeklyData) ? weeklyData.slice(0, 7) : [0, 0, 0, 0, 0, 0, 0];
        while (data.length < 7) data.push(0);

        this.weeklyChart.data.datasets[0].data = data;
        this.weeklyChart.update('active');
    }

    /**
     * Update chart for different metric types (minutes, exercises, points)
     * @param {string} type - 'minutes' | 'exercises' | 'points'
     * @param {number[]} data - Weekly data array
     */
    updateChartByType(type, data) {
        const colors = chartTheme.metricColors[type] || chartTheme.metricColors.minutes;

        if (this.weeklyChart) {
            this.weeklyChart.data.datasets[0].backgroundColor = colors.bg;
            this.weeklyChart.data.datasets[0].borderColor = colors.border;
            this.weeklyChart.data.datasets[0].hoverBackgroundColor = colors.hoverBg;
            this.weeklyChart.data.datasets[0].hoverBorderColor = colors.hoverBorder;
            this.weeklyChart.data.datasets[0].label = type.charAt(0).toUpperCase() + type.slice(1);
            this.currentMetricType = type;
            this.updateChart(data);
        }
    }

    /**
     * Update chart labels based on current week dates
     */
    updateChartLabels() {
        const today = new Date();
        const dayOfWeek = today.getDay(); // 0 = Sunday
        const labels = [];

        // Get Monday of this week
        const monday = new Date(today);
        monday.setDate(today.getDate() - ((dayOfWeek + 6) % 7));

        for (let i = 0; i < 7; i++) {
            const date = new Date(monday);
            date.setDate(monday.getDate() + i);
            labels.push(date.toLocaleDateString('es-ES', { weekday: 'short' }));
        }

        if (this.weeklyChart) {
            this.weeklyChart.data.labels = labels;
            this.weeklyChart.update();
        }
    }

    /**
     * Destroy chart instance
     */
    destroy() {
        if (this.weeklyChart) {
            this.weeklyChart.destroy();
            this.weeklyChart = null;
        }
    }
}

// Initialize on DOM ready
function initProgressCharts() {
  window.progressCharts = new ProgressCharts();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initProgressCharts);
} else {
  initProgressCharts();
}

// Export for manual initialization
window.initProgressCharts = initProgressCharts;