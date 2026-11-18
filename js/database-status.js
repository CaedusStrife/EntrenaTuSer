async function checkDatabaseStatus() {
  const status = document.getElementById('database-status');
  if (!status) return;

  const icon = status.querySelector('i');
  const text = status.querySelector('span') || status;

  // Estado inicial: verificando
  status.className = 'database-status database-checking';
  if (icon) icon.setAttribute('data-lucide', 'database');
  if (text !== status) text.textContent = 'Verificando conexión...';
  else status.innerHTML = '<i data-lucide="database" aria-hidden="true"></i><span>Verificando conexión...</span>';

  try {
    const response = await fetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/database/status`);
    if (!response.ok) throw new Error('API no disponible');

    const connection = await response.json();
    status.className = 'database-status database-connected';
    status.innerHTML = `<i data-lucide="database" aria-hidden="true"></i><span>SQL Server conectado: ${connection.database}</span>`;
    if (window.lucide) window.lucide.createIcons();
  } catch {
    status.className = 'database-status database-error';
    status.innerHTML = `<i data-lucide="alert-circle" aria-hidden="true"></i><span>API o BD no disponible. Algunas funciones no funcionarán.</span>`;
    if (window.lucide) window.lucide.createIcons();
    
    // Mostrar toast de error
    if (window.showToast) {
      window.showToast('No se pudo conectar con la API/BD. Verifica que el servidor esté corriendo.', 'error', 5000);
    }
  }
}

// Verificar al cargar y cada 30 segundos
checkDatabaseStatus();
setInterval(checkDatabaseStatus, 30000);

// Exportar para uso manual
window.checkDatabaseStatus = checkDatabaseStatus;
