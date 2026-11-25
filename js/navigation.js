/**
 * Switches between the login screen and the main app layout.
 * @param {string} screenId - The screen ID ('screen-login' or 'screen-progress').
 */
function switchScreen(screenId) {
  console.log('[navigation] switchScreen called:', screenId);
  const loginScreen = document.getElementById('screen-login');
  const appLayout = document.getElementById('app-layout');
  if (screenId === 'screen-login') {
    localStorage.removeItem('entrena-user');
    loginScreen.classList.remove('hidden');
    appLayout.classList.add('hidden');
    // Reset to login form
    if (typeof window.mostrarLogin === 'function') window.mostrarLogin();
    return;
  }
  loginScreen.classList.add('hidden');
  appLayout.classList.remove('hidden');
  // Activate Progress tab by default when entering the app
  if (screenId === 'screen-progress') {
    const progressTab = document.getElementById('screen-progress');
    const progressBtn = document.querySelector('.bottom-nav .nav-item[onclick*="screen-progress"]');
    if (progressTab) {
      // Hide all tabs first
      document.querySelectorAll('.screen-tab').forEach(sheet => {
        sheet.classList.add('hidden');
        sheet.classList.remove('sheet-enter');
        sheet.classList.remove('active');
      });
      // Show progress tab
      progressTab.classList.remove('hidden');
      progressTab.classList.add('active');
      void progressTab.offsetWidth;
      progressTab.classList.add('sheet-enter');
      if (progressBtn) progressBtn.classList.add('active');
    }
  }

  // Auto-load profile when entering app (if authenticated)
  if (localStorage.getItem('auth_token') && typeof initProfilePage === 'function') {
    // Small delay to ensure DOM is ready
    setTimeout(() => initProfilePage(), 100);
  }
}

/**
 * Shows the registration form in the login screen.
 */
function mostrarRegistro() {
  document.getElementById('login-card-auth').classList.add('hidden');
  document.getElementById('login-card-register').classList.remove('hidden');
}

/**
 * Shows the login form in the login screen.
 */
function mostrarLogin() {
  document.getElementById('login-card-register').classList.add('hidden');
  document.getElementById('login-card-recovery')?.classList.add('hidden');
  document.getElementById('login-card-auth').classList.remove('hidden');
}

/**
 * Shows the password recovery form in the login screen.
 */
function mostrarRecuperacion() {
  document.getElementById('login-card-auth').classList.add('hidden');
  document.getElementById('login-card-register').classList.add('hidden');
  document.getElementById('login-card-recovery').classList.remove('hidden');
}

/**
 * Navigates to the home screen (progress tab).
 */
function goHome() {
  const progressBtn = document.querySelector('.sidebar-menu .nav-btn[onclick*="screen-progress"]');
  switchTab('screen-progress', progressBtn);
  const sidebar = document.getElementById('sidebar');
  if (sidebar && sidebar.classList.contains('open')) {
    document.getElementById('mobile-menu-toggle')?.click();
  }
}

/**
 * Switches the active tab in the main app layout.
 * @param {string} tabId - The ID of the tab/screen to activate.
 * @param {HTMLElement} [btnElement] - The button element that triggered the switch (optional).
 */
function switchTab(tabId, btnElement) {
  console.log('switchTab called with tabId:', tabId);

  const sheets = document.querySelectorAll('.screen-tab');
  sheets.forEach(sheet => {
    sheet.classList.add('hidden');
    sheet.classList.remove('sheet-enter');
    sheet.classList.remove('active');
  });
  document.querySelectorAll('.bottom-nav .nav-item').forEach(btn => btn.classList.remove('active'));
  const activeSheet = document.getElementById(tabId);
  if (activeSheet) {
    activeSheet.classList.remove('hidden');
    activeSheet.classList.add('active');
    // Trigger reflow for animation
    void activeSheet.offsetWidth;
    activeSheet.classList.add('sheet-enter');
  }
  if (btnElement) btnElement.classList.add('active');

  // Initialize screen-specific components
  if (tabId === 'screen-workout') {
    if (window.renderExercises && window.allExercises) {
      console.log('switchTab: Rendering all exercises (manual navigation)');
      // If a routine is already active (has routineExercises), preserve it
      const routineIds = window.activeRoutineId
        ? window.workoutStateMachine?.routineExercises?.map(re => re.exerciseId)
        : null;
      const routineExercises = window.workoutStateMachine?.routineExercises || [];
      window.renderExercises(window.allExercises, routineIds, routineExercises);
      // Initialize workout state machine
      if (window.workoutStateMachine) {
        window.workoutStateMachine.initialize(window.allExercises, routineIds, routineExercises);
      }
    }
  }

  if (tabId === 'screen-map' && typeof refreshWorkoutMap === 'function') refreshWorkoutMap();

  if (tabId === 'screen-progress' && typeof loadProgress === 'function') loadProgress();

  if (tabId === 'screen-routines' && typeof loadRoutines === 'function') loadRoutines();

  if (tabId === 'screen-profile' && typeof initProfilePage === 'function') initProfilePage();

  // Re-initialize lucide icons for new content
  if (typeof lucide !== 'undefined') lucide.createIcons();
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

  // Initialize bottom navigation
  const bottomNav = document.querySelector('.bottom-nav');
  if (bottomNav) {
    bottomNav.querySelectorAll('.nav-item').forEach(button => {
      button.addEventListener('click', () => {
        // The onclick in HTML handles the switchTab call
      });
    });
  }

  // Initialize lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
});

// Export to window for global access (used by auth.js)
window.switchScreen = switchScreen;
window.switchTab = switchTab;
