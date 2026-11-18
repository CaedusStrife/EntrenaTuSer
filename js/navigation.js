function switchScreen(screenId) {
  const loginScreen = document.getElementById('screen-login');
  const appLayout = document.getElementById('app-layout');
  if (screenId === 'screen-login') {
    localStorage.removeItem('entrena-user');
    loginScreen.classList.remove('hidden');
    appLayout.classList.add('hidden');
    // Resetear a formulario de login
    if (typeof window.mostrarLogin === 'function') window.mostrarLogin();
    return;
  }
  loginScreen.classList.add('hidden');
  appLayout.classList.remove('hidden');
  // Activar pestaña de Progreso por defecto al entrar a la app
  if (screenId === 'screen-progress') {
    const progressTab = document.getElementById('screen-progress');
    const progressBtn = document.querySelector('.sidebar-menu .nav-btn[onclick*="screen-progress"]');
    if (progressTab) {
      // Ocultar todas las pestañas primero
      document.querySelectorAll('.screen-tab.paper-sheet').forEach(sheet => {
        sheet.classList.add('hidden');
        sheet.classList.remove('sheet-enter');
      });
      // Mostrar progreso
      progressTab.classList.remove('hidden');
      void progressTab.offsetWidth;
      progressTab.classList.add('sheet-enter');
      if (progressBtn) progressBtn.classList.add('active');
    }
  }
}

function mostrarRegistro() {
  document.getElementById('login-card-auth').classList.add('hidden');
  document.getElementById('login-card-register').classList.remove('hidden');
}

function mostrarLogin() {
  document.getElementById('login-card-register').classList.add('hidden');
  document.getElementById('login-card-recovery')?.classList.add('hidden');
  document.getElementById('login-card-auth').classList.remove('hidden');
}

function mostrarRecuperacion() {
  document.getElementById('login-card-auth').classList.add('hidden');
  document.getElementById('login-card-register').classList.add('hidden');
  document.getElementById('login-card-recovery').classList.remove('hidden');
}

function switchTab(tabId, btnElement) {
  console.log('switchTab called with tabId:', tabId);
  
  const sheets = document.querySelectorAll('.screen-tab.paper-sheet');
  sheets.forEach(sheet => {
    sheet.classList.add('hidden');
    sheet.classList.remove('sheet-enter');
  });
  document.querySelectorAll('.sidebar-menu .nav-btn').forEach((btn) => btn.classList.remove('active'));
  const activeSheet = document.getElementById(tabId);
  if (activeSheet) {
    activeSheet.classList.remove('hidden');
    // Trigger reflow for animation
    void activeSheet.offsetWidth;
    activeSheet.classList.add('sheet-enter');
  }
  if (btnElement) btnElement.classList.add('active');
  
  // Si se navega manualmente a la pestaña de entrenamiento (sin callback), mostrar todos los ejercicios
  if (tabId === 'screen-workout' && window.renderExercises && window.allExercises) {
    console.log('switchTab: Rendering all exercises (manual navigation)');
    window.renderExercises(window.allExercises);
  }
  
  if (tabId === 'screen-map' && typeof refreshWorkoutMap === 'function') refreshWorkoutMap();
  
  if (tabId === 'screen-progress' && typeof loadProgress === 'function') loadProgress();
}

document.addEventListener('DOMContentLoaded', () => {
  // Always show login screen first - no auto-login
  // User must explicitly log in each session
  const loginScreen = document.getElementById('screen-login');
  const appLayout = document.getElementById('app-layout');
  if (loginScreen && appLayout) {
    loginScreen.classList.remove('hidden');
    appLayout.classList.add('hidden');
  }

  const menuToggle = document.getElementById('mobile-menu-toggle');
  const navigation = document.getElementById('mobile-navigation');
  const sidebar = document.getElementById('sidebar');
  const sidebarOverlay = document.getElementById('sidebar-overlay');
  
  if (!menuToggle || !navigation || !sidebar || !sidebarOverlay) return;

  function toggleSidebar() {
    const isOpen = sidebar.classList.toggle('open');
    sidebarOverlay.classList.toggle('visible', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Cerrar navegación' : 'Abrir navegación');
    menuToggle.innerHTML = `<i data-lucide="${isOpen ? 'x' : 'menu'}"></i>`;
    
    // Also update all sidebar toggle buttons in headers
    document.querySelectorAll('.sidebar-toggle').forEach(btn => {
      btn.setAttribute('aria-expanded', String(isOpen));
      btn.setAttribute('aria-label', isOpen ? 'Cerrar navegación' : 'Abrir navegación');
      btn.innerHTML = `<i data-lucide="${isOpen ? 'x' : 'menu'}"></i>`;
    });
    
    if (window.lucide) lucide.createIcons();
  }

  menuToggle.addEventListener('click', toggleSidebar);
  
  // Add event listeners to all sidebar toggle buttons in headers
  document.querySelectorAll('.sidebar-toggle').forEach(btn => {
    btn.addEventListener('click', toggleSidebar);
  });
  
  // Close sidebar when clicking overlay
  sidebarOverlay.addEventListener('click', () => {
    if (sidebar.classList.contains('open')) {
      toggleSidebar();
    }
  });

  navigation.querySelectorAll('.nav-btn').forEach((button) => {
    button.addEventListener('click', () => {
      // Close sidebar on all screen sizes after navigation
      if (sidebar.classList.contains('open')) {
        toggleSidebar();
      }
    });
  });
});
