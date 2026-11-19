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

function updateFontSize(action) {
  const preferences = getAccessibilityPreferences();
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
