// progressCharts.js

/**
 * Manages Chart.js integration for the Progress screen.
 * Handles weekly chart rendering, updates, and responsive behavior.
 */
class ProgressCharts {
    constructor() {
        this.weeklyChart = null;
        this.canvas = document.getElementById('progress-weeklyChart');
        this.chartColors = {
            primary: 'rgba(74, 222, 205, 0.8)',
            primaryBorder: 'rgba(74, 222, 205, 1)',
            background: 'rgba(74, 222, 205, 0.1)',
            grid: 'rgba(0, 0, 0, 0.05)'
        };
        
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
                    backgroundColor: this.chartColors.primary,
                    borderColor: this.chartColors.primaryBorder,
                    borderWidth: 2,
                    borderRadius: 8,
                    borderSkipped: false,
                    hoverBackgroundColor: this.chartColors.primaryBorder,
                    hoverBorderColor: this.chartColors.primary
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                interaction: {
                    intersect: false,
                    mode: 'index'
                },
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        backgroundColor: 'rgba(0, 0, 0, 0.8)',
                        titleColor: '#fff',
                        bodyColor: '#fff',
                        padding: 12,
                        cornerRadius: 8,
                        displayColors: false,
                        callbacks: {
                            label: (context) => {
                                const minutes = context.parsed.y;
                                return `${minutes} min`;
                            }
                        }
                    }
                },
                scales: {
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: 'var(--ink-muted)',
                            font: { size: 12 }
                        }
                    },
                    y: {
                        beginAtZero: true,
                        grid: {
                            color: this.chartColors.grid,
                            drawBorder: false
                        },
                        ticks: {
                            color: 'var(--ink-muted)',
                            font: { size: 11 },
                            stepSize: 10,
                            callback: (value) => `${value} min`
                        }
                    }
                },
                animation: {
                    duration: 800,
                    easing: 'easeOutQuart'
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
        const colors = {
            minutes: { bg: 'rgba(74, 222, 205, 0.8)', border: 'rgba(74, 222, 205, 1)' },
            exercises: { bg: 'rgba(245, 158, 11, 0.8)', border: 'rgba(245, 158, 11, 1)' },
            points: { bg: 'rgba(59, 130, 246, 0.8)', border: 'rgba(59, 130, 246, 1)' }
        };

        const color = colors[type] || colors.minutes;

        if (this.weeklyChart) {
            this.weeklyChart.data.datasets[0].backgroundColor = color.bg;
            this.weeklyChart.data.datasets[0].borderColor = color.border;
            this.weeklyChart.data.datasets[0].label = type.charAt(0).toUpperCase() + type.slice(1);
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
document.addEventListener('DOMContentLoaded', () => {
    window.progressCharts = new ProgressCharts();
});

// Export for manual initialization
window.initProgressCharts = () => {
    window.progressCharts = new ProgressCharts();
};