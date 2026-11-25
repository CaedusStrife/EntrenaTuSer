// Entry point for Vite build
// Import styles first so Vite includes them in the bundle
import '../css/styless.css';

// Import api-config first to set window.API_BASE_URL before other modules
import './api-config.js';

// Import all application modules
import './notifications.js';
import './navigation.js';
import './auth.js';
import './chatbot.js';
import './accessibility.js';
import './routines.js';
import './map.js';
import './exercise-videos.js';
import './exercises.js';
import './progress.js';
import './social-comments.js';
import './profile.js';
import './accordionController.js';
import './heroAvatarEditor.js';
import './workoutStateMachine.js';
import './routineWizard.js';
import './mapPlacesPanel.js';
import './progressCharts.js';
import './database-status.js';
import './registration.js';

// Initialize Lucide icons
import { createIcons } from 'lucide';
createIcons();

// Legal modals functions
function openLegalModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
    const closeBtn = modal.querySelector('.legal-modal-close');
    if (closeBtn) closeBtn.focus();
  }
}

function closeLegalModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }
}

// Close on Escape key
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    document.querySelectorAll('.legal-modal-overlay:not(.hidden)').forEach(modal => {
      closeLegalModal(modal.id);
    });
  }
});

// Close on overlay click
document.querySelectorAll('.legal-modal-overlay').forEach(overlay => {
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      closeLegalModal(overlay.id);
    }
  });
});

// Footer link handlers
document.addEventListener('DOMContentLoaded', () => {
  const termsLink = document.getElementById('footer-terms');
  const privacyLink = document.getElementById('footer-privacy');
  const cookiesLink = document.getElementById('footer-cookies');
  const contactLink = document.getElementById('footer-contact');

  if (termsLink) termsLink.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('terms-modal'); });
  if (privacyLink) privacyLink.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('privacy-modal'); });
  if (cookiesLink) cookiesLink.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('cookies-modal'); });
  if (contactLink) contactLink.addEventListener('click', (e) => { e.preventDefault(); openLegalModal('contact-modal'); });
});