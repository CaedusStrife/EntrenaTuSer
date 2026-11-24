const accessibilityToggle = document.getElementById('accessibility-toggle');
const accessibilityPanel = document.getElementById('accessibility-panel');
const accessibilityClose = document.getElementById('accessibility-close');
const accessibilityStorageKey = 'entrena-accessibility';
// Use window.API_BASE_URL set by api-config.js, fallback to localhost
const API_BASE = window.API_BASE_URL || 'http://localhost:5143';

// Check if user is logged in
function isLoggedIn() {
  return !!localStorage.getItem('auth_token');
}

// Get auth token
function getAuthToken() {
  return localStorage.getItem('auth_token');
}

// Load preferences from backend (if logged in) or localStorage
async function loadAccessibilityPreferences() {
  if (isLoggedIn()) {
    try {
      const response = await fetch(`${API_BASE}/api/user/preferences`, {
        headers: { 'Authorization': `Bearer ${getAuthToken()}` }
      });
      if (response.ok) {
        const prefs = await response.json();
        // Convert backend format to frontend format
        return {
            contrast: prefs.highContrast,
            motion: prefs.reducedMotion,
            grayscale: prefs.grayscale,
            darkmode: prefs.theme === 'dark',
            fontSize: prefs.fontSize
        };
      }
    } catch (e) {
      console.warn('Failed to load preferences from backend:', e);
    }
  }
  // Fallback to localStorage
  return getLocalPreferences();
}

function getLocalPreferences() {
  try {
    return JSON.parse(localStorage.getItem(accessibilityStorageKey)) || {};
  } catch {
    return {};
  }
}

// Save preferences to both localStorage and backend (if logged in)
async function saveAccessibilityPreferences(preferences) {
  localStorage.setItem(accessibilityStorageKey, JSON.stringify(preferences));
  
  if (isLoggedIn()) {
    try {
      await fetch(`${API_BASE}/api/user/preferences`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${getAuthToken()}`
        },
        body: JSON.stringify({
            Theme: preferences.darkmode ? 'dark' : 'light',
            FontSize: preferences.fontSize,
            HighContrast: preferences.contrast,
            ReducedMotion: preferences.motion,
            Grayscale: preferences.grayscale
        })
      });
    } catch (e) {
      console.warn('Failed to sync preferences to backend:', e);
    }
  }
}

function applyAccessibilityPreferences(preferences) {
  const fontSize = preferences.fontSize || 'normal';
  document.body.classList.toggle('accessibility-large-text', fontSize === 'large');
  document.body.classList.toggle('accessibility-small-text', fontSize === 'small');
  document.body.classList.toggle('accessibility-xlarge-text', fontSize === 'xlarge');
  document.body.classList.toggle('accessibility-high-contrast', Boolean(preferences.contrast));
  document.body.classList.toggle('accessibility-reduced-motion', Boolean(preferences.motion));
  document.body.classList.toggle('dark-theme', Boolean(preferences.darkmode));
  document.body.classList.toggle('accessibility-grayscale', Boolean(preferences.grayscale));

  document.querySelector('[data-accessibility-action="contrast"]')?.setAttribute(
    'aria-pressed', String(Boolean(preferences.contrast)));
  document.querySelector('[data-accessibility-action="motion"]')?.setAttribute(
    'aria-pressed', String(Boolean(preferences.motion)));
  document.querySelector('[data-accessibility-action="darkmode"]')?.setAttribute(
    'aria-pressed', String(Boolean(preferences.darkmode)));
  document.querySelector('[data-accessibility-action="grayscale"]')?.setAttribute(
    'aria-pressed', String(Boolean(preferences.grayscale)));
  
  // Update icon for darkmode
  const darkmodeBtn = document.querySelector('[data-accessibility-action="darkmode"]');
  if (darkmodeBtn) {
    const icon = darkmodeBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', preferences.darkmode ? 'sun' : 'moon');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
  
  // Update icon for grayscale
  const grayscaleBtn = document.querySelector('[data-accessibility-action="grayscale"]');
  if (grayscaleBtn) {
    const icon = grayscaleBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', preferences.grayscale ? 'circle' : 'circle-slash');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}

function setAccessibilityOpen(isOpen) {
  accessibilityPanel.classList.toggle('active', isOpen);
  accessibilityToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) accessibilityClose.focus();
}

async function updateFontSize(action) {
  const preferences = getLocalPreferences();
  const current = preferences.fontSize || 'normal';
  
  // Define font size levels for more granular control
  const fontSizes = ['small', 'normal', 'large', 'xlarge'];
  const currentIndex = fontSizes.indexOf(current);
  
  let nextIndex;
  if (action === 'reset') {
    nextIndex = 1; // 'normal'
  } else if (action === 'increase') {
    nextIndex = Math.min(currentIndex + 1, fontSizes.length - 1);
  } else if (action === 'decrease') {
    nextIndex = Math.max(currentIndex - 1, 0);
  } else {
    nextIndex = currentIndex;
  }
  
  preferences.fontSize = fontSizes[nextIndex];
  await saveAccessibilityPreferences(preferences);
  applyAccessibilityPreferences(preferences);
}

accessibilityToggle.addEventListener('click', () => {
  setAccessibilityOpen(!accessibilityPanel.classList.contains('active'));
});

accessibilityClose.addEventListener('click', () => setAccessibilityOpen(false));

document.querySelectorAll('[data-font-action]').forEach((button) => {
  button.addEventListener('click', () => updateFontSize(button.dataset.fontAction));
});

document.querySelectorAll('[data-accessibility-action]').forEach((button) => {
  button.addEventListener('click', async () => {
    const action = button.dataset.accessibilityAction;
    if (action === 'reset') {
      localStorage.removeItem(accessibilityStorageKey);
      if (isLoggedIn()) {
        // Reset backend preferences to defaults
        await fetch(`${API_BASE}/api/user/preferences`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${getAuthToken()}`
          },
          body: JSON.stringify({
            Theme: 'light',
            FontSize: 'normal',
            HighContrast: false,
            ReducedMotion: false,
            Grayscale: false
          })
        });
      }
      applyAccessibilityPreferences({});
      return;
    }

    const preferences = getLocalPreferences();
    preferences[action] = !preferences[action];
    await saveAccessibilityPreferences(preferences);
    applyAccessibilityPreferences(preferences);
  });
});

// Initialize: load preferences (from backend if logged in, else localStorage)
loadAccessibilityPreferences().then(applyAccessibilityPreferences);

// Listen for login/logout events to reload preferences
window.addEventListener('user-authenticated', () => {
  loadAccessibilityPreferences().then(applyAccessibilityPreferences);
});

window.addEventListener('storage', (e) => {
  if (e.key === 'auth_token' && !e.newValue) {
    // User logged out - reload from localStorage
    applyAccessibilityPreferences(getLocalPreferences());
  }
});
