/**
 * Profile page functionality
 * Handles: profile info, password change, accessibility preferences sync, account deletion
 * Compatible with Hoja de Identidad topology (Accordions, Modals, Avatar Editor)
 * @module profile
 */

// Use window.API_BASE_URL set by api-config.js

// Export apiRequest globally for other modules
/**
 * Makes an authenticated API request to the backend.
 * @global
 * @function apiRequest
 * @param {string} endpoint - The API endpoint (e.g., '/api/user/profile').
 * @param {RequestInit} [options={}] - Fetch options (method, body, headers).
 * @returns {Promise<Object|null>} The parsed JSON response, or null on 401.
 * @throws {Error} On non-OK responses.
 */
window.apiRequest = async function apiRequest(endpoint, options = {}) {
  const token = localStorage.getItem('auth_token');
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers,
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const response = await fetch(`${window.API_BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (response.status === 401) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    window.location.href = '/';
    return null;
  }

  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'Error en la solicitud' }));
    throw new Error(error.message || `Error ${response.status}`);
  }

  return response.json();
};

// Apply preferences to UI - delegates to accessibility.js for single source of truth
/**
 * Applies accessibility preferences to the UI.
 * Delegates to accessibility.js for single source of truth.
 * @param {Object} prefs - User preferences from profile API.
 * @param {boolean} prefs.highContrast - High contrast mode.
 * @param {boolean} prefs.reducedMotion - Reduced motion mode.
 * @param {boolean} prefs.grayscale - Grayscale mode.
 * @param {string} prefs.theme - 'light' or 'dark'.
 * @param {string} prefs.fontSize - 'small', 'normal', 'large', or 'xlarge'.
 */
function applyPreferencesToUI(prefs) {
  // Convert profile.js format to accessibility.js format
  const accessibilityPrefs = {
    contrast: prefs.highContrast,
    motion: prefs.reducedMotion,
    grayscale: prefs.grayscale,
    darkmode: prefs.theme === 'dark',
    fontSize: prefs.fontSize,
  };

  // Use accessibility.js function if available, otherwise fallback to local implementation
  if (typeof window.applyAccessibilityPreferences === 'function') {
    window.applyAccessibilityPreferences(accessibilityPrefs);
  } else {
    // Fallback local implementation
    const body = document.body;
    body.classList.toggle('accessibility-high-contrast', accessibilityPrefs.contrast);
    body.classList.toggle('accessibility-reduced-motion', accessibilityPrefs.motion);
    body.classList.toggle('accessibility-grayscale', accessibilityPrefs.grayscale);
    body.classList.toggle('dark-theme', accessibilityPrefs.darkmode);
    body.classList.toggle('accessibility-small-text', accessibilityPrefs.fontSize === 'small');
    body.classList.toggle('accessibility-large-text', accessibilityPrefs.fontSize === 'large');
    body.classList.toggle('accessibility-xlarge-text', accessibilityPrefs.fontSize === 'xlarge');
    body.classList.remove('accessibility-normal-text');

    localStorage.setItem('entrena-accessibility', JSON.stringify(accessibilityPrefs));
  }
}

// Update user display in header/sidebar
/**
 * Updates the user display in header/sidebar.
 * @param {Object} profile - User profile data.
 * @param {string} profile.fullName - User's full name.
 * @param {Object} profile.avatar - Avatar data.
 * @param {string} profile.avatar.color - Avatar background color.
 * @param {string} profile.avatar.initials - Avatar initials.
 */
function updateUserDisplay(profile) {
  const userNameEl = document.getElementById('user-name');
  const userInitialsEl = document.getElementById('user-initials');
  const userAvatarEl = document.getElementById('user-avatar');

  if (userNameEl) userNameEl.textContent = profile.fullName || 'Usuario';
  if (userInitialsEl && profile.avatar?.initials)
    userInitialsEl.textContent = profile.avatar.initials;
  if (userAvatarEl && profile.avatar?.color)
    userAvatarEl.style.backgroundColor = profile.avatar.color;
}

// Update hero identity display (Profile screen)
/**
 * Updates the hero identity display on the profile screen.
 * @param {Object} profile - User profile data.
 * @param {string} profile.fullName - User's full name.
 * @param {string} profile.email - User's email.
 * @param {Object} profile.avatar - Avatar data.
 * @param {string} profile.avatar.color - Avatar background color.
 * @param {string} profile.avatar.initials - Avatar initials.
 */
function updateHeroDisplay(profile) {
  const nameEl = document.getElementById('profile-display-name');
  const emailEl = document.getElementById('profile-display-email');
  const avatarEl = document.getElementById('profile-avatar-3d');

  if (nameEl) nameEl.textContent = profile.fullName || 'Usuario';
  if (emailEl) emailEl.textContent = profile.email || '';
  if (avatarEl && profile.avatar?.color) {
    /**
     * Adjusts a color's brightness.
     * @param {string} color - Hex color string (e.g., '#4adecd').
     * @param {number} amount - Amount to adjust (-255 to 255).
     * @returns {string} Adjusted hex color.
     */
    const adjustColor = (color, amount) => {
      const hex = color.replace('#', '');
      const num = parseInt(hex, 16);
      const r = Math.max(0, Math.min(255, (num >> 16) + amount));
      const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
      const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
      return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
    };
    avatarEl.style.background = `linear-gradient(135deg, ${profile.avatar.color}, ${adjustColor(profile.avatar.color, -30)})`;
    avatarEl.textContent =
      profile.avatar.initials ||
      profile.fullName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 3);
  }
}

// Load profile data from API
/**
 * Loads the user profile from the API and updates all displays.
 */
async function loadProfile() {
  try {
    const profile = await window.apiRequest('/api/user/profile');
    if (!profile) return;

    // Update hero identity display
    updateHeroDisplay(profile);

    // Initialize hero avatar editor (on-demand)
    if (typeof window.initHeroAvatarEditor === 'function') {
      window.initHeroAvatarEditor();
    }

    // Fill edit profile modal
    document.getElementById('edit-fullname').value = profile.fullName || '';
    document.getElementById('edit-email').value = profile.email || '';
    document.getElementById('edit-avatar-color').value = profile.avatar?.color || '#4adecd';
    document.getElementById('edit-avatar-initials').value = profile.avatar?.initials || '';

    // Fill accessibility preferences
    if (profile.preferences) {
      document.getElementById('pref-high-contrast').checked = profile.preferences.highContrast;
      document.getElementById('pref-reduced-motion').checked = profile.preferences.reducedMotion;
      document.getElementById('pref-grayscale').checked = profile.preferences.grayscale;
      document.getElementById('pref-dark-mode').checked = profile.preferences.theme === 'dark';
      document.getElementById('pref-font-size').value = profile.preferences.fontSize;

      // Apply preferences to UI immediately via accessibility.js
      applyPreferencesToUI(profile.preferences);
    }

    // Update user data in localStorage
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    userData.fullName = profile.fullName;
    userData.email = profile.email;
    userData.avatar = profile.avatar;
    localStorage.setItem('user_data', JSON.stringify(userData));

    updateUserDisplay(profile);

    // Update display info in profile screen
    document.getElementById('profile-info-name').textContent = profile.fullName || '—';
    document.getElementById('profile-info-email').textContent = profile.email || '—';
    document.getElementById('profile-info-avatar').textContent = profile.avatar?.initials || '—';
  } catch (error) {
    console.error('Error loading profile:', error);
    showToast('Error al cargar el perfil', 'error');
  }
}

// Save profile info (name, email, avatar) - called from edit profile modal
/**
 * Saves profile changes from the edit profile modal.
 * @param {Event} event - Form submit event.
 */
async function saveProfile(event) {
  event.preventDefault();
  const btn = document.getElementById('profile-save-btn');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader" class="spin" aria-hidden="true"></i> Guardando...';
  btn.disabled = true;

  try {
    const fullName = document.getElementById('edit-fullname').value.trim();
    const email = document.getElementById('edit-email').value.trim();
    const avatarColor = document.getElementById('edit-avatar-color').value;
    const avatarInitials = document
      .getElementById('edit-avatar-initials')
      .value.trim()
      .toUpperCase();

    await window.apiRequest('/api/user/profile', {
      method: 'PUT',
      body: JSON.stringify({
        FullName: fullName,
        Email: email,
        AvatarColor: avatarColor,
        AvatarInitials: avatarInitials,
        PhotoUrl: null,
      }),
    });

    // Update localStorage
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    userData.fullName = fullName;
    userData.email = email;
    userData.avatar = { color: avatarColor, initials: avatarInitials };
    localStorage.setItem('user_data', JSON.stringify(userData));

    // Update displays
    updateUserDisplay({
      fullName,
      email,
      avatar: { color: avatarColor, initials: avatarInitials },
    });
    updateHeroDisplay({
      fullName,
      email,
      avatar: { color: avatarColor, initials: avatarInitials },
    });

    showToast('Perfil actualizado correctamente', 'success');

    // Close modal
    window.closeEditProfileModal?.();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// Change password - called from change password modal
/**
 * Changes the user's password.
 * @param {Event} event - Form submit event.
 */
async function changePassword(event) {
  event.preventDefault();
  const currentPassword = document.getElementById('cp-current').value;
  const newPassword = document.getElementById('cp-new').value;
  const confirmPassword = document.getElementById('cp-confirm').value;

  if (!currentPassword || !newPassword) {
    showToast('Contraseña actual y nueva son obligatorias', 'error');
    return;
  }

  if (newPassword.length < 8) {
    showToast('La nueva contraseña debe tener al menos 8 caracteres', 'error');
    return;
  }

  if (newPassword !== confirmPassword) {
    showToast('Las contraseñas no coinciden', 'error');
    return;
  }

  const btn = event.target.querySelector('button[type="submit"]');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader" class="spin" aria-hidden="true"></i> Cambiando...';
  btn.disabled = true;

  try {
    await window.apiRequest('/api/user/password', {
      method: 'PUT',
      body: JSON.stringify({
        CurrentPassword: currentPassword,
        NewPassword: newPassword,
      }),
    });

    // Clear password fields
    document.getElementById('cp-current').value = '';
    document.getElementById('cp-new').value = '';
    document.getElementById('cp-confirm').value = '';

    showToast('Contraseña cambiada correctamente', 'success');
    window.closeChangePasswordModal?.();
  } catch (error) {
    showToast(error.message, 'error');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// Save accessibility preferences to backend
/**
 * Saves accessibility preferences to the backend and applies them.
 */
async function savePreferences() {
  const prefs = {
    Theme: document.getElementById('pref-dark-mode').checked ? 'dark' : 'light',
    FontSize: document.getElementById('pref-font-size').value,
    HighContrast: document.getElementById('pref-high-contrast').checked,
    ReducedMotion: document.getElementById('pref-reduced-motion').checked,
    Grayscale: document.getElementById('pref-grayscale').checked,
  };

  try {
    await window.apiRequest('/api/user/preferences', {
      method: 'PUT',
      body: JSON.stringify(prefs),
    });

    // Apply to UI immediately via accessibility.js
    const accessibilityPrefs = {
      contrast: prefs.HighContrast,
      motion: prefs.ReducedMotion,
      grayscale: prefs.Grayscale,
      darkmode: prefs.Theme === 'dark',
      fontSize: prefs.FontSize,
    };

    if (typeof window.applyAccessibilityPreferences === 'function') {
      window.applyAccessibilityPreferences(accessibilityPrefs);
    }
    if (typeof window.saveAccessibilityPreferences === 'function') {
      window.saveAccessibilityPreferences(accessibilityPrefs);
    }

    showToast('Preferencias guardadas y sincronizadas', 'success');
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Confirm and delete account - uses the new modal with "ELIMINAR" confirmation
/**
 * Opens the delete account confirmation modal.
 */
async function confirmDeleteAccount() {
  const modal = document.getElementById('delete-account-modal');
  if (modal) modal.classList.remove('hidden');

  // Focus the confirmation input
  setTimeout(() => {
    const input = document.getElementById('delete-confirm-text');
    if (input) input.focus();
  }, 100);
}

// Execute account deletion after confirmation
/**
 * Executes account deletion after user confirmation.
 */
async function executeDeleteAccount() {
  const confirmText = document.getElementById('delete-confirm-text').value.trim();
  if (confirmText !== 'ELIMINAR') {
    const errorEl = document.getElementById('delete-error');
    errorEl.textContent = 'Debes escribir "ELIMINAR" exactamente';
    errorEl.classList.remove('hidden');
    return;
  }

  const password = prompt('Escribe tu contraseña para confirmar la eliminación definitiva:');
  if (!password) return;

  const btn = document.getElementById('delete-account-confirm');
  const originalText = btn.innerHTML;
  btn.innerHTML = '<i data-lucide="loader" class="spin" aria-hidden="true"></i> Eliminando...';
  btn.disabled = true;

  try {
    await window.apiRequest('/api/user/delete', {
      method: 'POST',
      body: JSON.stringify({ Password: password }),
    });

    // Clear local data
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user_data');
    localStorage.removeItem('entrena-accessibility');

    showToast('Cuenta eliminada permanentemente', 'success');
    setTimeout(() => (window.location.href = '/'), 1500);
  } catch (error) {
    const errorEl = document.getElementById('delete-error');
    errorEl.textContent = error.message;
    errorEl.classList.remove('hidden');
  } finally {
    btn.innerHTML = originalText;
    btn.disabled = false;
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }
}

// Close delete account modal
/**
 * Closes the delete account confirmation modal and resets form.
 */
function closeDeleteAccountModal() {
  const modal = document.getElementById('delete-account-modal');
  if (modal) {
    modal.classList.add('hidden');
    document.getElementById('delete-confirm-text').value = '';
    document.getElementById('delete-error').classList.add('hidden');
    document.getElementById('delete-account-confirm').disabled = true;
  }
}

// Enable/disable delete confirm button based on input
/**
 * Sets up the delete confirmation input to enable/disable the confirm button.
 */
function setupDeleteConfirmation() {
  const input = document.getElementById('delete-confirm-text');
  const btn = document.getElementById('delete-account-confirm');
  if (input && btn) {
    input.addEventListener('input', () => {
      btn.disabled = input.value.trim() !== 'ELIMINAR';
    });
  }
}

// Close edit profile modal
/**
 * Closes the edit profile modal.
 */
function closeEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (modal) modal.classList.add('hidden');
}

// Close change password modal
/**
 * Closes the change password modal.
 */
function closeChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  if (modal) modal.classList.add('hidden');
}

// Open edit profile modal
/**
 * Opens the edit profile modal and pre-fills with current user data.
 */
function openEditProfileModal() {
  const modal = document.getElementById('edit-profile-modal');
  if (!modal) return;

  // Load current profile data into form
  const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
  document.getElementById('edit-fullname').value = userData.fullName || '';
  document.getElementById('edit-email').value = userData.email || '';
  document.getElementById('edit-avatar-color').value = userData.avatar?.color || '#4adecd';
  document.getElementById('edit-avatar-initials').value = userData.avatar?.initials || '';

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('edit-fullname').focus();
}

// Open change password modal
/**
 * Opens the change password modal and clears the form.
 */
function openChangePasswordModal() {
  const modal = document.getElementById('change-password-modal');
  if (!modal) return;

  // Clear form
  document.getElementById('cp-current').value = '';
  document.getElementById('cp-new').value = '';
  document.getElementById('cp-confirm').value = '';

  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('cp-current').focus();
}

// Export modal open functions
window.openEditProfileModal = openEditProfileModal;
window.openChangePasswordModal = openChangePasswordModal;

// Show toast notification
/**
 * Shows a toast notification.
 * @param {string} message - The message to display.
 * @param {string} [type='info'] - The toast type: 'info', 'success', 'error'.
 */
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
        <span>${message}</span>
        <button class="toast-close" aria-label="Cerrar">&times;</button>
    `;
  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), 5000);
}

/**
 * Creates the toast container if it doesn't exist.
 * @returns {HTMLElement} The toast container element.
 */
function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText =
    'position:fixed;bottom:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;';
  document.body.appendChild(container);
  return container;
}

// Initialize profile page when shown
/**
 * Initializes the profile page - loads data and sets up event listeners.
 */
function initProfilePage() {
  // Load profile data
  loadProfile();

  // Edit profile modal form
  const editProfileForm = document.getElementById('edit-profile-form');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', saveProfile);
  }

  // Change password modal form
  const changePasswordForm = document.getElementById('change-password-form');
  if (changePasswordForm) {
    changePasswordForm.addEventListener('submit', changePassword);
  }

  // Accessibility preferences (auto-save on change) - sync with accessibility.js
  const prefElements = document.querySelectorAll('[data-pref]');
  prefElements.forEach(el => {
    el.addEventListener('change', async () => {
      await savePreferences();
      // Also trigger accessibility.js update
      if (typeof window.applyAccessibilityPreferences === 'function') {
        const prefs = {
          contrast: document.getElementById('pref-high-contrast').checked,
          motion: document.getElementById('pref-reduced-motion').checked,
          grayscale: document.getElementById('pref-grayscale').checked,
          darkmode: document.getElementById('pref-dark-mode').checked,
          fontSize: document.getElementById('pref-font-size').value,
        };
        window.applyAccessibilityPreferences(prefs);
      }
      // Show save status
      const statusEl = document.getElementById('pref-save-status');
      if (statusEl) {
        statusEl.classList.remove('hidden');
        setTimeout(() => statusEl.classList.add('hidden'), 2000);
      }
    });
  });

  // Delete confirmation input
  setupDeleteConfirmation();

  // Modal close buttons
  document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', () => {
      btn.closest('.modal-overlay')?.classList.add('hidden');
      document.body.style.overflow = '';
    });
  });

  // Close modals on overlay click
  document.querySelectorAll('.modal-overlay').forEach(overlay => {
    overlay.addEventListener('click', e => {
      if (e.target === overlay) {
        overlay.classList.add('hidden');
        document.body.style.overflow = '';
      }
    });
  });

  // Close modals on Escape key
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      document.querySelectorAll('.modal-overlay:not(.hidden)').forEach(modal => {
        modal.classList.add('hidden');
        document.body.style.overflow = '';
      });
    }
  });

  // Edit profile trigger button (in hero)
  const editTrigger = document.getElementById('edit-profile-trigger');
  if (editTrigger) {
    editTrigger.addEventListener('click', openEditProfileModal);
  }

  // Initialize lucide icons
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Load profile when profile screen is shown (Hoja de Identidad pattern)
/**
 * Sets up a MutationObserver to detect when the profile screen becomes active.
 */
function setupProfileScreenListener() {
  const profileScreen = document.getElementById('screen-profile');
  if (!profileScreen) return;

  // Use MutationObserver to detect when screen becomes active
  const observer = new MutationObserver(mutations => {
    mutations.forEach(mutation => {
      if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
        const target = mutation.target;
        if (target.classList.contains('active') && target.id === 'screen-profile') {
          initProfilePage();
        }
      }
    });
  });

  observer.observe(profileScreen, { attributes: true, attributeFilter: ['class'] });

  // Also check initial state
  if (profileScreen.classList.contains('active')) {
    initProfilePage();
  }
}

// Initialize on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', setupProfileScreenListener);
} else {
  setupProfileScreenListener();
}

// Export for global access
window.initProfilePage = initProfilePage;
window.confirmDeleteAccount = confirmDeleteAccount;
window.executeDeleteAccount = executeDeleteAccount;
window.closeDeleteAccountModal = closeDeleteAccountModal;
window.closeEditProfileModal = closeEditProfileModal;
window.closeChangePasswordModal = closeChangePasswordModal;
window.saveProfile = saveProfile;
window.changePassword = changePassword;
window.savePreferences = savePreferences;
window.showToast = showToast;
