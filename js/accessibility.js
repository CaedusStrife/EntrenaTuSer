const accessibilityToggle = document.getElementById('accessibility-toggle');
const accessibilityPanel = document.getElementById('accessibility-panel');
const accessibilityClose = document.getElementById('accessibility-close');
const accessibilityStorageKey = 'entrena-accessibility';

function getAccessibilityPreferences() {
  try {
    return JSON.parse(localStorage.getItem(accessibilityStorageKey)) || {};
  } catch {
    return {};
  }
}

function saveAccessibilityPreferences(preferences) {
  localStorage.setItem(accessibilityStorageKey, JSON.stringify(preferences));
}

function applyAccessibilityPreferences(preferences) {
  const fontSize = preferences.fontSize || 'normal';
  document.body.classList.toggle('accessibility-large-text', fontSize === 'large');
  document.body.classList.toggle('accessibility-small-text', fontSize === 'small');
  document.body.classList.toggle('accessibility-high-contrast', Boolean(preferences.contrast));
  document.body.classList.toggle('accessibility-reduced-motion', Boolean(preferences.motion));
  document.body.classList.toggle('dark-theme', Boolean(preferences.darkmode));

  document.querySelector('[data-accessibility-action="contrast"]')?.setAttribute(
    'aria-pressed', String(Boolean(preferences.contrast)));
  document.querySelector('[data-accessibility-action="motion"]')?.setAttribute(
    'aria-pressed', String(Boolean(preferences.motion)));
  document.querySelector('[data-accessibility-action="darkmode"]')?.setAttribute(
    'aria-pressed', String(Boolean(preferences.darkmode)));
  
  // Update icon for darkmode
  const darkmodeBtn = document.querySelector('[data-accessibility-action="darkmode"]');
  if (darkmodeBtn) {
    const icon = darkmodeBtn.querySelector('i[data-lucide]');
    if (icon) {
      icon.setAttribute('data-lucide', preferences.darkmode ? 'sun' : 'moon');
      if (typeof lucide !== 'undefined') lucide.createIcons();
    }
  }
}

function setAccessibilityOpen(isOpen) {
  accessibilityPanel.classList.toggle('active', isOpen);
  accessibilityToggle.setAttribute('aria-expanded', String(isOpen));
  if (isOpen) accessibilityClose.focus();
}

function updateFontSize(action) {
  const preferences = getAccessibilityPreferences();
  const current = preferences.fontSize || 'normal';
  const next = action === 'reset'
    ? 'normal'
    : action === 'increase'
      ? 'large'
      : 'small';
  preferences.fontSize = current === next && action !== 'reset' ? 'normal' : next;
  saveAccessibilityPreferences(preferences);
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
  button.addEventListener('click', () => {
    const action = button.dataset.accessibilityAction;
    if (action === 'reset') {
      localStorage.removeItem(accessibilityStorageKey);
      applyAccessibilityPreferences({});
      return;
    }

    const preferences = getAccessibilityPreferences();
    preferences[action] = !preferences[action];
    saveAccessibilityPreferences(preferences);
    applyAccessibilityPreferences(preferences);
  });
});

applyAccessibilityPreferences(getAccessibilityPreferences());
