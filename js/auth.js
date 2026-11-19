/**
 * Auth module for Entrena tu ser — Ebru/Marmoleado login screen
 * Handles: login, register, recovery forms; floating labels; validation; accessibility toggle
 */

(function() {
  'use strict';

  // ============================================================================
  // Form switching (login / register / recovery)
  // ============================================================================
  function toggleSocialProof(show) {
    const socialProof = document.querySelector('#screen-login .social-proof');
    if (socialProof) {
      socialProof.style.display = show ? 'flex' : 'none';
    }
  }

  window.mostrarRegistro = function() {
    const auth = document.getElementById('login-card-auth');
    const reg = document.getElementById('login-card-register');
    const rec = document.getElementById('login-card-recovery');
    if (auth) auth.classList.add('hidden');
    if (rec) rec.classList.add('hidden');
    if (reg) reg.classList.remove('hidden');
    toggleSocialProof(false); // Hide comments when showing register
    clearFormStatus();
  };

  window.mostrarLogin = function() {
    const auth = document.getElementById('login-card-auth');
    const reg = document.getElementById('login-card-register');
    const rec = document.getElementById('login-card-recovery');
    if (reg) reg.classList.add('hidden');
    if (rec) rec.classList.add('hidden');
    if (auth) auth.classList.remove('hidden');
    toggleSocialProof(true); // Show comments when showing login
    clearFormStatus();
  };

  window.mostrarRecuperacion = function() {
    const auth = document.getElementById('login-card-auth');
    const reg = document.getElementById('login-card-register');
    const rec = document.getElementById('login-card-recovery');
    if (auth) auth.classList.add('hidden');
    if (reg) reg.classList.add('hidden');
    if (rec) rec.classList.remove('hidden');
    toggleSocialProof(false); // Hide comments when showing recovery
    clearFormStatus();
  };

  // Also handle the "back to login" links in register/recovery
  const showLoginFromReg = document.getElementById('show-login');
  if (showLoginFromReg) {
    showLoginFromReg.addEventListener('click', (e) => { e.preventDefault(); window.mostrarLogin(); });
  }

  const showLoginFromRecovery = document.getElementById('show-login-from-recovery');
  if (showLoginFromRecovery) {
    showLoginFromRecovery.addEventListener('click', (e) => { e.preventDefault(); window.mostrarLogin(); });
  }

  const showRegister = document.getElementById('show-register');
  if (showRegister) {
    showRegister.addEventListener('click', (e) => { e.preventDefault(); window.mostrarRegistro(); });
  }

  function clearFormStatus() {
    document.querySelectorAll('#screen-login .form-status').forEach(el => {
      el.textContent = '';
      el.className = 'form-status';
    });
    document.querySelectorAll('#screen-login .bowl.error').forEach(el => el.classList.remove('error'));
  }

  // ============================================================================
  // Floating label behavior for .bowl inputs
  // ============================================================================
  function initFloatingLabels() {
    document.querySelectorAll('#screen-login .bowl-input').forEach(input => {
      const bowl = input.closest('.bowl');
      if (!bowl) return;

      const checkFilled = () => {
        bowl.classList.toggle('filled', input.value.length > 0);
      };

      input.addEventListener('input', checkFilled);
      input.addEventListener('blur', checkFilled);
      input.addEventListener('change', checkFilled);
      checkFilled();
    });
  }

  // ============================================================================
  // Form validation & submission
  // ============================================================================
  function setFormStatus(formId, message, isError = false) {
    const statusEl = document.getElementById(formId.replace('-form', '') + '-status');
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = 'form-status' + (isError ? ' form-status-error' : '');
  }

  function setSubmitting(button, submitting) {
    if (!button) return;
    button.classList.toggle('submitting', submitting);
    if (submitting) {
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  }

  async function handleSubmit(form, endpoint, successMessage, redirectScreen) {
    const formId = form.id;
    const submitBtn = form.querySelector('button[type="submit"]');
    const bowls = form.querySelectorAll('.bowl');

    // Validate
    let valid = true;
    bowls.forEach(bowl => {
      const input = bowl.querySelector('.bowl-input');
      if (input && !input.checkValidity()) {
        bowl.classList.add('error');
        valid = false;
      } else if (input) {
        bowl.classList.remove('error');
      }
    });

    // Password confirmation check for register
    if (formId === 'register-form') {
      const pwd = form.querySelector('#register-password');
      const pwdConfirm = form.querySelector('#register-password-confirmation');
      if (pwd && pwdConfirm && pwd.value !== pwdConfirm.value) {
        pwdConfirm.closest('.bowl').classList.add('error');
        setFormStatus(formId, 'Las contraseñas no coinciden', true);
        valid = false;
      }
    }

    if (!valid) return;

    setSubmitting(submitBtn, true);
    setFormStatus(formId, 'Procesando...', false);

    try {
      const formData = new FormData(form);
      const payload = {};
      formData.forEach((value, key) => { payload[key] = value; });

      const baseUrl = window.API_BASE_URL || 'http://localhost:5143';
      const response = await fetch(`${baseUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || (response.status === 401 ? 'Credenciales incorrectas' : 'Error del servidor'));
      }

      const data = await response.json();

      // On login/register success, store user and redirect
      if (endpoint === 'login' || endpoint === 'register') {
        localStorage.setItem('entrena-user', JSON.stringify(data));
        setFormStatus(formId, successMessage || '¡Bienvenido!', false);
        submitBtn.classList.remove('submitting');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="check" style="width:20px;height:20px;"></i>';
        submitBtn.style.background = 'var(--ebru-teal)';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
          submitBtn.innerHTML = '<span class="btn-text">Iniciar sesión</span>';
          submitBtn.style.background = '';
          if (typeof lucide !== 'undefined') lucide.createIcons();
          window.switchScreen(redirectScreen || 'screen-progress');
          window.dispatchEvent(new Event('user-authenticated'));
        }, 800);
      } else {
        // Recovery success
        setFormStatus(formId, successMessage || 'Si el correo existe, recibirás instrucciones', false);
        setSubmitting(submitBtn, false);
      }

    } catch (error) {
      setFormStatus(formId, error.message, true);
      setSubmitting(submitBtn, false);
    }
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(loginForm, 'login', '¡Accediendo...', 'screen-progress');
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(registerForm, 'register', '¡Cuenta creada!', 'screen-progress');
    });
  }

  // Recovery form
  const recoveryForm = document.getElementById('recovery-form');
  if (recoveryForm) {
    recoveryForm.addEventListener('submit', (e) => {
      e.preventDefault();
      handleSubmit(recoveryForm, 'recovery', 'Si el correo existe, recibirás instrucciones para restablecer tu contraseña');
    });
  }

  // ============================================================================
  // Initialize on DOM ready
  // ============================================================================
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initFloatingLabels);
  } else {
    initFloatingLabels();
  }

})();