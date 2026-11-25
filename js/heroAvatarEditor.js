// heroAvatarEditor.js

/**
 * Handles the live-edit avatar functionality in the Profile Hero Identity.
 * Supports color picker, initials input, and inline save without full form submit.
 * @class
 */
class HeroAvatarEditor {
  /**
   * Creates a new HeroAvatarEditor instance.
   */
  constructor() {
    this.editor = document.getElementById('profile-avatar-editor');
    this.avatarEl = document.getElementById('profile-avatar-3d');
    this.colorInput = document.getElementById('edit-avatar-color');
    this.initialsInput = document.getElementById('edit-avatar-initials');
    this.saveBtn = document.querySelector('#edit-profile-form .btn-droplet');

    this.currentColor = '#4adecd';
    this.currentInitials = '';

    this.init();
  }

  /**
   * Initializes the avatar editor with event listeners and current avatar data.
   */
  init() {
    if (!this.editor) return;

    // Load current avatar data from localStorage
    this.loadCurrentAvatar();

    // Event listeners
    this.editor.addEventListener('click', () => this.openEditModal());
    this.editor.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.openEditModal();
      }
    });

    // Color picker live update
    if (this.colorInput) {
      this.colorInput.addEventListener('input', e => {
        this.currentColor = e.target.value;
        this.updateAvatarDisplay();
      });
    }

    // Initials live update
    if (this.initialsInput) {
      this.initialsInput.addEventListener('input', e => {
        this.currentInitials = e.target.value.toUpperCase().slice(0, 3);
        this.updateAvatarDisplay();
      });
    }

    // Form submit for avatar changes
    const form = document.getElementById('edit-profile-form');
    if (form) {
      form.addEventListener('submit', this.handleSave.bind(this));
    }

    // Close modal handling
    document.getElementById('edit-profile-modal')?.addEventListener('click', e => {
      if (e.target.id === 'edit-profile-modal') this.closeEditModal();
    });
  }

  /**
   * Loads the current avatar from localStorage and updates the display.
   */
  loadCurrentAvatar() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    this.currentColor = userData.avatar?.color || '#4adecd';
    this.currentInitials = userData.avatar?.initials || '';

    if (this.colorInput) this.colorInput.value = this.currentColor;
    if (this.initialsInput) this.initialsInput.value = this.currentInitials;

    this.updateAvatarDisplay();
  }

  /**
   * Opens the edit profile modal with current user data.
   */
  openEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;

    // Prefill form with current user data
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    document.getElementById('edit-fullname').value = userData.fullName || '';
    document.getElementById('edit-email').value = userData.email || '';
    document.getElementById('edit-avatar-color').value = this.currentColor;
    document.getElementById('edit-avatar-initials').value = this.currentInitials;

    modal.classList.remove('hidden');
    document.getElementById('edit-fullname').focus();

    // Trap focus
    this.trapFocus(modal);
  }

  /**
   * Closes the edit profile modal.
   */
  closeEditModal() {
    const modal = document.getElementById('edit-profile-modal');
    if (!modal) return;
    modal.classList.add('hidden');
  }

  /**
   * Traps focus within the modal for accessibility.
   * @param {HTMLElement} modal - The modal element.
   */
  trapFocus(modal) {
    const focusableElements = modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
    );
    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

    firstElement?.focus();

    modal.addEventListener('keydown', e => {
      if (e.key !== 'Tab') return;
      if (e.shiftKey) {
        if (document.activeElement === firstElement) {
          e.preventDefault();
          lastElement?.focus();
        }
      } else {
        if (document.activeElement === lastElement) {
          e.preventDefault();
          firstElement?.focus();
        }
      }
    });
  }

  /**
   * Updates the avatar display with current color and initials.
   */
  updateAvatarDisplay() {
    if (!this.avatarEl) return;

    // Update the 3D avatar display (or 2D fallback)
    this.avatarEl.style.background = `linear-gradient(135deg, ${this.currentColor}, ${this.adjustColor(this.currentColor, -30)})`;
    this.avatarEl.textContent = this.currentInitials || this.getInitialsFromName();
    this.avatarEl.style.fontSize = this.currentInitials
      ? 'clamp(24px, 4vw, 36px)'
      : 'clamp(18px, 3vw, 28px)';
  }

  /**
   * Gets initials from the user's full name.
   * @returns {string} The initials (up to 3 characters).
   */
  getInitialsFromName() {
    const userData = JSON.parse(localStorage.getItem('user_data') || '{}');
    const name = userData.fullName || '';
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 3);
  }

  /**
   * Adjusts a color's brightness.
   * @param {string} color - Hex color string (e.g., '#4adecd').
   * @param {number} amount - Amount to adjust (-255 to 255).
   * @returns {string} Adjusted hex color.
   */
  adjustColor(color, amount) {
    // Simple color brightness adjustment
    const hex = color.replace('#', '');
    const num = parseInt(hex, 16);
    const r = Math.max(0, Math.min(255, (num >> 16) + amount));
    const g = Math.max(0, Math.min(255, ((num >> 8) & 0x00ff) + amount));
    const b = Math.max(0, Math.min(255, (num & 0x0000ff) + amount));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  }

  /**
   * Handles form save for avatar changes.
   * @param {Event} event - Form submit event.
   */
  async handleSave(event) {
    event.preventDefault();

    const btn = event.target.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = '<i data-lucide="loader" class="spin" aria-hidden="true"></i> Guardando...';
    btn.disabled = true;

    try {
      const fullName = document.getElementById('edit-fullname').value.trim();
      const email = document.getElementById('edit-email').value.trim();
      const avatarColor = this.currentColor;
      const avatarInitials = this.currentInitials;

      // API call
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

      // Update header/sidebar display
      this.updateHeaderDisplay(userData);

      // Update hero display
      this.updateHeroDisplay(userData);

      this.closeEditModal();
      window.showToast('Perfil actualizado correctamente', 'success');
    } catch (error) {
      window.showToast(error.message, 'error');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }

  /**
   * Updates the header/sidebar user display.
   * @param {Object} userData - User data object.
   * @param {string} userData.fullName - User's full name.
   * @param {Object} userData.avatar - Avatar data.
   * @param {string} userData.avatar.color - Avatar color.
   * @param {string} userData.avatar.initials - Avatar initials.
   */
  updateHeaderDisplay(userData) {
    const nameEl = document.getElementById('user-name');
    const initialsEl = document.getElementById('user-initials');
    const avatarEl = document.getElementById('user-avatar');

    if (nameEl) nameEl.textContent = userData.fullName || 'Usuario';
    if (initialsEl && userData.avatar?.initials) initialsEl.textContent = userData.avatar.initials;
    if (avatarEl && userData.avatar?.color) avatarEl.style.backgroundColor = userData.avatar.color;
  }

  /**
   * Updates the hero display on the profile screen.
   * @param {Object} userData - User data object.
   * @param {string} userData.fullName - User's full name.
   * @param {string} userData.email - User's email.
   * @param {Object} userData.avatar - Avatar data.
   * @param {string} userData.avatar.color - Avatar color.
   * @param {string} userData.avatar.initials - Avatar initials.
   */
  updateHeroDisplay(userData) {
    const nameEl = document.getElementById('profile-display-name');
    const emailEl = document.getElementById('profile-display-email');
    const avatarEl = document.getElementById('profile-avatar-3d');

    if (nameEl) nameEl.textContent = userData.fullName || 'Usuario';
    if (emailEl) emailEl.textContent = userData.email || '';
    if (avatarEl && userData.avatar?.color) {
      avatarEl.style.background = `linear-gradient(135deg, ${userData.avatar.color}, ${this.adjustColor(userData.avatar.color, -30)})`;
      avatarEl.textContent = userData.avatar.initials || this.getInitialsFromName();
    }
  }
}

// Export for manual initialization (on-demand when profile screen is shown)
/**
 * Initializes the HeroAvatarEditor and stores it on window.
 * @global
 * @function initHeroAvatarEditor
 */
window.initHeroAvatarEditor = () => {
  window.heroAvatarEditor = new HeroAvatarEditor();
};

/**
 * Destroys the HeroAvatarEditor instance.
 * @global
 * @function destroyHeroAvatarEditor
 */
window.destroyHeroAvatarEditor = () => {
  if (window.heroAvatarEditor) {
    // Remove event listeners if needed
    window.heroAvatarEditor = null;
  }
};
