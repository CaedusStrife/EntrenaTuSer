/**
 * Lógica para la visualización de estadísticas en el Dashboard
 * Utiliza Chart.js para renderizar el progreso semanal
 */

document.addEventListener('DOMContentLoaded', () => {
    initWeeklyChart();
});

function initWeeklyChart() {
    const ctx = document.getElementById('weeklyChart');
    
    if (!ctx) return;

    // Colores temáticos
    const orangeColor = '#FF7E21';
    const tealColor = '#2D9CDB';

    // Crear un gradiente para las barras
    const canvasCtx = ctx.getContext('2d');
    const gradient = canvasCtx.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(255, 126, 33, 0.8)'); // Naranja vibrante
    gradient.addColorStop(1, 'rgba(255, 126, 33, 0.1)'); // Transparente

    // Chart.js transforma los datos de actividad en una gráfica que se puede ver fácilmente.
    new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'],
            datasets: [{
                label: 'Minutos de Actividad',
                data: [45, 60, 25, 80, 55, 90, 40], // Datos de ejemplo
                backgroundColor: gradient,
                borderColor: orangeColor,
                borderWidth: 2,
                borderRadius: 10,
                borderSkipped: false,
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: {
                    display: false // Ocultamos la leyenda para un look más limpio
                },
                tooltip: {
                    backgroundColor: '#1a202c',
                    titleColor: '#fff',
                    bodyColor: '#fff',
                    padding: 12,
                    cornerRadius: 8,
                    displayColors: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: {
                        color: 'rgba(255, 255, 255, 0.05)',
                        drawBorder: false
                    },
                    ticks: {
                        color: '#828282',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        },
                        callback: function(value) {
                            return value + ' min';
                        }
                    }
                },
                x: {
                    grid: {
                        display: false,
                        drawBorder: false
                    },
                    ticks: {
                        color: '#828282',
                        font: {
                            family: "'Inter', sans-serif",
                            size: 12
                        }
                    }
                }
            },
            animation: {
                duration: 2000,
                easing: 'easeOutQuart'
            }
        }
    });
}
