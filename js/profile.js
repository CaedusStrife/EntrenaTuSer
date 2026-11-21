// Profile page functionality
// Handles: profile info, password change, accessibility preferences sync, account deletion

// Use window.API_BASE_URL set by api-config.js, fallback to localhost
const API_BASE = window.API_BASE_URL || 'http://localhost:5143';

async function apiRequest(endpoint, options = {}) {
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
        // Token expired or invalid
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
}

// Load profile data from API
async function loadProfile() {
    try {
        const profile = await apiRequest('/api/user/profile');
        if (!profile) return;

        // Fill form fields
        document.getElementById('profile-fullname').value = profile.fullName || '';
        document.getElementById('profile-email').value = profile.email || '';
        document.getElementById('profile-avatar-color').value = profile.avatar?.color || '#4adecd';
        document.getElementById('profile-avatar-initials').value = profile.avatar?.initials || '';

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
    body.classList.remove('accessibility-normal-text'); // Ensure normal is removed

    // Update accessibility panel buttons
    document.querySelector('[data-accessibility-action="contrast"]')?.setAttribute('aria-pressed', String(prefs.highContrast));
    document.querySelector('[data-accessibility-action="motion"]')?.setAttribute('aria-pressed', String(prefs.reducedMotion));
    document.querySelector('[data-accessibility-action="grayscale"]')?.setAttribute('aria-pressed', String(prefs.grayscale));
    document.querySelector('[data-accessibility-action="darkmode"]')?.setAttribute('aria-pressed', String(prefs.theme === 'dark'));

    // Update icons
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

// Save profile info (name, email, avatar)
async function saveProfile(event) {
    event.preventDefault();
    const btn = document.getElementById('profile-save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="spin" aria-hidden="true"></i> Guardando...';
    btn.disabled = true;

    try {
        const fullName = document.getElementById('profile-fullname').value.trim();
        const email = document.getElementById('profile-email').value.trim();
        const avatarColor = document.getElementById('profile-avatar-color').value;
        const avatarInitials = document.getElementById('profile-avatar-initials').value.trim().toUpperCase();

        await apiRequest('/api/user/profile', {
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

        updateUserDisplay({ fullName, email, avatar: { color: avatarColor, initials: avatarInitials } });
        showToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
        showToast(error.message, 'error');
    } finally {
        btn.innerHTML = originalText;
        btn.disabled = false;
        if (typeof lucide !== 'undefined') lucide.createIcons();
    }
}

// Change password
async function changePassword(event) {
    event.preventDefault();
    const currentPassword = document.getElementById('profile-current-password').value;
    const newPassword = document.getElementById('profile-new-password').value;
    const confirmPassword = document.getElementById('profile-confirm-password').value;

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

    const btn = event.target.querySelector('button[type="submit"]') || document.getElementById('profile-save-btn');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="spin" aria-hidden="true"></i> Cambiando...';
    btn.disabled = true;

    try {
        await apiRequest('/api/user/password', {
            method: 'PUT',
            body: JSON.stringify({
                CurrentPassword: currentPassword,
                NewPassword: newPassword
            })
        });

        // Clear password fields
        document.getElementById('profile-current-password').value = '';
        document.getElementById('profile-new-password').value = '';
        document.getElementById('profile-confirm-password').value = '';

        showToast('Contraseña cambiada correctamente', 'success');
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
        await apiRequest('/api/user/preferences', {
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

// Confirm and delete account
async function confirmDeleteAccount() {
    const confirmed = confirm('¿Estás seguro de que quieres eliminar tu cuenta? Esta acción es irreversible y se perderán todos tus datos (rutinas, progreso, medallas, historial).');
    if (!confirmed) return;

    const password = prompt('Escribe tu contraseña para confirmar la eliminación de la cuenta:');
    if (!password) return;

    try {
        await apiRequest('/api/user/delete', {
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
        showToast(error.message, 'error');
    }
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
    const profileForm = document.getElementById('profile-form');
    if (!profileForm) return;

    // Load profile data
    loadProfile();

    // Profile form submit (name, email, avatar)
    profileForm.addEventListener('submit', saveProfile);

    // Password change form (separate handling)
    const passwordInputs = document.querySelectorAll('#profile-current-password, #profile-new-password, #profile-confirm-password');
    passwordInputs.forEach(input => {
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') changePassword(e);
        });
    });

    // Preference checkboxes/select - auto-save on change
    document.querySelectorAll('[data-pref]').forEach(el => {
        el.addEventListener('change', savePreferences);
    });

    // Initialize lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

// Export for global access
window.initProfilePage = initProfilePage;
window.confirmDeleteAccount = confirmDeleteAccount;
window.changePassword = changePassword;