// Profile page functionality
// Handles: profile info, password change, accessibility preferences sync, account deletion
// Compatible with Hoja de Identidad topology (Accordions, Modals, Avatar Editor)

// Use window.API_BASE_URL set by api-config.js, fallback to localhost
const API_BASE = window.API_BASE_URL || 'http://localhost:5143';

// Export apiRequest globally for other modules
window.apiRequest = async function apiRequest(endpoint, options = {}) {
    const token = localStorage.getItem('auth_token');
    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
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

// Apply preferences to UI (sync with accessibility.js)
function applyPreferencesToUI(prefs) {
    const body = document.body;
    body.classList.toggle('accessibility-high-contrast', prefs.highContrast);
    body.classList.toggle('accessibility-reduced-motion', prefs.reducedMotion);
    body.classList.toggle('accessibility-grayscale', prefs.grayscale);
    body.classList.toggle('dark-theme', prefs.theme === 'dark');
    body.classList.toggle('accessibility-small-text', prefs.fontSize === 'small');
    body.classList.toggle('accessibility-large-text', prefs.fontSize === 'large');
    body.classList.toggle('accessibility-xlarge-text', prefs.fontSize === 'xlarge');
    body.classList.remove('accessibility-normal-text');

    // Update accessibility panel buttons (legacy)
    document.querySelector('[data-accessibility-action="contrast"]')?.setAttribute('aria-pressed', String(prefs.highContrast));
    document.querySelector('[data-accessibility-action="motion"]')?.setAttribute('aria-pressed', String(prefs.reducedMotion));
    document.querySelector('[data-accessibility-action="grayscale"]')?.setAttribute('aria-pressed', String(prefs.grayscale));
    document.querySelector('[data-accessibility-action="darkmode"]')?.setAttribute('aria-pressed', String(prefs.theme === 'dark'));

    // Update new toggle switches
    document.getElementById('pref-high-contrast')?.setAttribute('aria-pressed', String(prefs.highContrast));
    document.getElementById('pref-reduced-motion')?.setAttribute('aria-pressed', String(prefs.reducedMotion));
    document.getElementById('pref-grayscale')?.setAttribute('aria-pressed', String(prefs.grayscale));
    document.getElementById('pref-dark-mode')?.setAttribute('aria-pressed', String(prefs.theme === 'dark'));

    // Update icons for legacy buttons
    const darkmodeBtn = document.querySelector('[data-accessibility-action="darkmode"]');
    if (darkmodeBtn) {
        const icon = darkmodeBtn.querySelector('i[data-lucide]');
        if (icon) {
            icon.setAttribute('data-lucide', prefs.theme === 'dark' ? 'sun' : 'moon');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }
    const grayscaleBtn = document.querySelector('[data-accessibility-action="grayscale"]');
    if (grayscaleBtn) {
        const icon = grayscaleBtn.querySelector('i[data-lucide]');
        if (icon) {
            icon.setAttribute('data-lucide', prefs.grayscale ? 'circle' : 'circle-slash');
            if (typeof lucide !== 'undefined') lucide.createIcons();
        }
    }

    // Save to localStorage for immediate use
    localStorage.setItem('entrena-accessibility', JSON.stringify({
        contrast: prefs.highContrast,
        motion: prefs.reducedMotion,
        grayscale: prefs.grayscale,
        darkmode: prefs.theme === 'dark',
        fontSize: prefs.fontSize
    }));
}

// Update user display in header/sidebar
function updateUserDisplay(profile) {
    const userNameEl = document.getElementById('user-name');
    const userInitialsEl = document.getElementById('user-initials');
    const userAvatarEl = document.getElementById('user-avatar');

    if (userNameEl) userNameEl.textContent = profile.fullName || 'Usuario';
    if (userInitialsEl && profile.avatar?.initials) userInitialsEl.textContent = profile.avatar.initials;
    if (userAvatarEl && profile.avatar?.color) userAvatarEl.style.backgroundColor = profile.avatar.color;
}

// Update hero identity display (Profile screen)
function updateHeroDisplay(profile) {
    const nameEl = document.getElementById('profile-display-name');
    const emailEl = document.getElementById('profile-display-email');
    const avatarEl = document.getElementById('profile-avatar-3d');

    if (nameEl) nameEl.textContent = profile.fullName || 'Usuario';
    if (emailEl) nameEl.textContent = profile.email || '';
    if (avatarEl && profile.avatar?.color) {
        const adjustColor = (color, amount) => {
            const hex = color.replace('#', '');
            const num = parseInt(hex, 16);
            const r = Math.max(0, Math.min(255, (num >> 16) + amount));
            const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00FF) + amount));
            const b = Math.max(0, Math.min(255, (num & 0x0000FF) + amount));
            return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1);
        };
        avatarEl.style.background = `linear-gradient(135deg, ${profile.avatar.color}, ${adjustColor(profile.avatar.color, -30)})`;
        avatarEl.textContent = profile.avatar.initials || profile.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 3);
    }
}

// Load profile data from API
async function loadProfile() {
    try {
        const profile = await window.apiRequest('/api/user/profile');
        if (!profile) return;

        // Update hero identity display
        updateHeroDisplay(profile);

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

            // Apply preferences to UI immediately
            applyPreferencesToUI(profile.preferences);
        }

        // Update user data in localStorage
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        userData.fullName = profile.fullName;
        userData.email = profile.email;
        userData.avatar = profile.avatar;
        localStorage.setItem('user_data', JSON.stringify(userData));

        updateUserDisplay(profile);
    } catch (error) {
        console.error('Error loading profile:', error);
        showToast('Error al cargar el perfil', 'error');
    }
}

// Save profile info (name, email, avatar) - called from edit profile modal
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
        const avatarInitials = document.getElementById('edit-avatar-initials').value.trim().toUpperCase();

        await window.apiRequest('/api/user/profile', {
            method: 'PUT',
            body: JSON.stringify({
                FullName: fullName,
                Email: email,
                AvatarColor: avatarColor,
                AvatarInitials: avatarInitials,
                PhotoUrl: null
            })
        });

        // Update localStorage
        const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
        userData.fullName = fullName;
        userData.email = email;
        userData.avatar = { color: avatarColor, initials: avatarInitials };
        localStorage.setItem('user_data', JSON.stringify(userData));

        // Update displays
        updateUserDisplay({ fullName, email, avatar: { color: avatarColor, initials: avatarInitials } });
        updateHeroDisplay({ fullName, email, avatar: { color: avatarColor, initials: avatarInitials } });
        
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
                NewPassword: newPassword
            })
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
async function savePreferences() {
    const prefs = {
        Theme: document.getElementById('pref-dark-mode').checked ? 'dark' : 'light',
        FontSize: document.getElementById('pref-font-size').value,
        HighContrast: document.getElementById('pref-high-contrast').checked,
        ReducedMotion: document.getElementById('pref-reduced-motion').checked,
        Grayscale: document.getElementById('pref-grayscale').checked
    };

    try {
        await window.apiRequest('/api/user/preferences', {
            method: 'PUT',
            body: JSON.stringify(prefs)
        });

        // Apply to UI immediately
        applyPreferencesToUI(prefs);
        showToast('Preferencias guardadas y sincronizadas', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    }
}

// Confirm and delete account - uses the new modal with "ELIMINAR" confirmation
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
            body: JSON.stringify({ Password: password })
        });

        // Clear local data
        localStorage.removeItem('auth_token');
        localStorage.removeItem('user_data');
        localStorage.removeItem('entrena-accessibility');

        showToast('Cuenta eliminada permanentemente', 'success');
        setTimeout(() => window.location.href = '/', 1500);
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
function closeEditProfileModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (modal) modal.classList.add('hidden');
}

// Close change password modal
function closeChangePasswordModal() {
    const modal = document.getElementById('change-password-modal');
    if (modal) modal.classList.add('hidden');
}

// Show toast notification
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

function createToastContainer() {
    const container = document.createElement('div');
    container.id = 'toast-container';
    container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;';
    document.body.appendChild(container);
    return container;
}

// Initialize profile page when shown
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

    // Accessibility form (auto-save on change)
    const accessibilityForm = document.getElementById('accessibility-form');
    if (accessibilityForm) {
        accessibilityForm.querySelectorAll('[data-pref]').forEach(el => {
            el.addEventListener('change', savePreferences);
        });
    }

    // Delete confirmation input
    setupDeleteConfirmation();

    // Modal close buttons
    document.querySelectorAll('.modal-close').forEach(btn => {
        btn.addEventListener('click', () => {
            btn.closest('.modal-overlay')?.classList.add('hidden');
        });
    });

    // Close modals on overlay click
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) overlay.classList.add('hidden');
        });
    });

    // Initialize lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
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