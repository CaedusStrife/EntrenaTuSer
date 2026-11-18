(function () {
  let notificationTimer;

  function getNotificationRoot() {
    let root = document.getElementById('app-notifications');
    if (!root) {
      root = document.createElement('div');
      root.id = 'app-notifications';
      root.className = 'app-notifications';
      root.setAttribute('aria-live', 'polite');
      root.setAttribute('aria-atomic', 'true');
      document.body.appendChild(root);
    }
    return root;
  }

  window.showNotification = function (message, type = 'info') {
    const root = getNotificationRoot();
    root.innerHTML = '';

    const notification = document.createElement('div');
    notification.className = `app-notification app-notification-${type}`;
    notification.setAttribute('role', type === 'error' ? 'alert' : 'status');
    notification.innerHTML = `
      <div class="app-notification-content">
        <strong>${type === 'error' ? 'No se pudo completar' : type === 'success' ? 'Listo' : 'Aviso'}</strong>
        <span></span>
      </div>
      <button type="button" class="app-notification-close" aria-label="Cerrar notificación">×</button>
    `;
    notification.querySelector('span').textContent = message;
    notification.querySelector('button').addEventListener('click', () => notification.remove());
    root.appendChild(notification);

    window.clearTimeout(notificationTimer);
    notificationTimer = window.setTimeout(() => notification.remove(), 5000);
  };

  window.showConfirmDialog = function (message) {
    return new Promise((resolve) => {
      const overlay = document.createElement('div');
      overlay.className = 'app-confirm-overlay';
      overlay.innerHTML = `
        <section class="app-confirm-sheet" role="dialog" aria-modal="true" aria-labelledby="app-confirm-title">
          <header class="app-confirm-header">
            <h2 id="app-confirm-title">Confirmar acción</h2>
            <button type="button" class="app-confirm-close" aria-label="Cerrar">×</button>
          </header>
          <p class="app-confirm-message"></p>
          <div class="app-confirm-actions">
            <button type="button" class="app-confirm-cancel btn-droplet">Cancelar</button>
            <button type="button" class="app-confirm-accept btn-droplet">Continuar</button>
          </div>
        </section>
      `;
      overlay.querySelector('.app-confirm-message').textContent = message;

      const finish = (result) => {
        overlay.remove();
        resolve(result);
      };

      overlay.querySelector('.app-confirm-close').addEventListener('click', () => finish(false));
      overlay.querySelector('.app-confirm-cancel').addEventListener('click', () => finish(false));
      overlay.querySelector('.app-confirm-accept').addEventListener('click', () => finish(true));
      overlay.addEventListener('click', (event) => {
        if (event.target === overlay) finish(false);
      });
      document.body.appendChild(overlay);
      overlay.querySelector('.app-confirm-accept').focus();
    });
  };

  window.showWorkoutSummary = function (summary) {
    const overlay = document.createElement('div');
    overlay.className = 'app-summary-overlay';
    overlay.innerHTML = `
      <section class="app-summary-sheet" role="dialog" aria-modal="true" aria-labelledby="app-summary-title">
        <header class="app-summary-header">
          <div>
            <span class="app-summary-kicker">ENTRENAMIENTO COMPLETADO</span>
            <h2 id="app-summary-title"></h2>
          </div>
          <button type="button" class="app-summary-close" aria-label="Cerrar resumen">×</button>
        </header>
        <p class="app-summary-message">Buen trabajo. Este es el resumen de tu sesión.</p>
        <div class="app-summary-metrics">
          <div><strong class="summary-completed"></strong><span>Ejercicios</span></div>
          <div><strong class="summary-minutes"></strong><span>Minutos</span></div>
          <div><strong class="summary-points"></strong><span>Puntos</span></div>
        </div>
        <div class="app-summary-actions">
          <button type="button" class="btn-droplet app-summary-progress">Ver mi progreso</button>
          <button type="button" class="btn-droplet app-summary-dismiss">Cerrar</button>
        </div>
      </section>
    `;

    overlay.querySelector('#app-summary-title').textContent = summary.routineName;
    overlay.querySelector('.summary-completed').textContent = `${summary.completedCount}/${summary.totalCount}`;
    overlay.querySelector('.summary-minutes').textContent = summary.minutes;
    overlay.querySelector('.summary-points').textContent = summary.points;

    const close = () => overlay.remove();
    overlay.querySelector('.app-summary-close').addEventListener('click', close);
    overlay.querySelector('.app-summary-dismiss').addEventListener('click', close);
    overlay.querySelector('.app-summary-progress').addEventListener('click', () => {
      close();
      window.switchTab?.('screen-progress', document.querySelector('[onclick*="screen-progress"]'));
    });
    overlay.addEventListener('click', (event) => {
      if (event.target === overlay) close();
    });
    document.body.appendChild(overlay);
    overlay.querySelector('.app-summary-dismiss').focus();
  };
})();
