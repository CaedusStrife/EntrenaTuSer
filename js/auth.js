/**
 * Auth module for Entrena tu ser — Ebru/Marmoleado login screen
 * Handles: login, register, recovery, reset forms; floating labels; validation; accessibility toggle
 * @module auth
 */

(function () {
  'use strict';

  // ============================================================================
  // Allowed email domains
  // ============================================================================
  /**
   * List of allowed email domains for registration and login.
   * @type {string[]}
   * @constant
   */
  const ALLOWED_DOMAINS = [
    'gmail.com',
    'outlook.com',
    'hotmail.com',
    'icloud.com',
    'live.com',
    'yahoo.com',
    'yahoo.es',
    'yahoo.com.mx',
    'outlook.es',
    'hotmail.es',
  ];

  /**
   * Checks if an email domain is in the allowed list.
   * @param {string} email - The email address to validate.
   * @returns {boolean} True if the domain is allowed, false otherwise.
   */
  function isAllowedDomain(email) {
    if (!email) return false;
    const domain = email.split('@')[1]?.toLowerCase();
    return ALLOWED_DOMAINS.includes(domain);
  }

  // ============================================================================
  // Form switching (login / register / recovery / reset)
  // ============================================================================
  /**
   * Toggles the visibility of the social proof section on the login screen.
   * @param {boolean} show - Whether to show the social proof section.
   */
  function toggleSocialProof(show) {
    const socialProof = document.querySelector('#screen-login .social-proof');
    if (socialProof) {
      socialProof.style.display = show ? 'flex' : 'none';
    }
  }

  /**
   * Hides all authentication cards (login, register, recovery, reset).
   */
  function hideAllAuthCards() {
    document.getElementById('login-card-auth')?.classList.add('hidden');
    document.getElementById('login-card-register')?.classList.add('hidden');
    document.getElementById('login-card-recovery')?.classList.add('hidden');
    document.getElementById('login-card-reset')?.classList.add('hidden');
  }

  /**
   * Shows the registration form and hides other auth forms.
   * @global
   * @function mostrarRegistro
   */
  window.mostrarRegistro = function () {
    hideAllAuthCards();
    document.getElementById('login-card-register')?.classList.remove('hidden');
    toggleSocialProof(false);
    clearFormStatus();
  };

  /**
   * Shows the login form and hides other auth forms.
   * @global
   * @function mostrarLogin
   */
  window.mostrarLogin = function () {
    hideAllAuthCards();
    document.getElementById('login-card-auth')?.classList.remove('hidden');
    toggleSocialProof(true);
    clearFormStatus();
  };

  /**
   * Shows the password recovery form and hides other auth forms.
   * @global
   * @function mostrarRecuperacion
   */
  window.mostrarRecuperacion = function () {
    hideAllAuthCards();
    document.getElementById('login-card-recovery')?.classList.remove('hidden');
    toggleSocialProof(false);
    clearFormStatus();
  };

  /**
   * Shows the password reset form with pre-filled email and token.
   * @global
   * @function mostrarReset
   * @param {string} email - The user's email address.
   * @param {string} token - The password reset token.
   */
  window.mostrarReset = function (email, token) {
    hideAllAuthCards();
    const resetCard = document.getElementById('login-card-reset');
    if (resetCard) {
      resetCard.classList.remove('hidden');
      // Pre-fill email and token
      document.getElementById('reset-email').value = email || '';
      document.getElementById('reset-token').value = token || '';
      document.getElementById('reset-code').value = token || ''; // Show token in code field for UX
    }
    toggleSocialProof(false);
    clearFormStatus();
  };

  // Also handle the "back to login" links in register/recovery/reset
  const showLoginFromReg = document.getElementById('show-login');
  if (showLoginFromReg) {
    showLoginFromReg.addEventListener('click', e => {
      e.preventDefault();
      window.mostrarLogin();
    });
  }

  const showLoginFromRecovery = document.getElementById('show-login-from-recovery');
  if (showLoginFromRecovery) {
    showLoginFromRecovery.addEventListener('click', e => {
      e.preventDefault();
      window.mostrarLogin();
    });
  }

  const showLoginFromReset = document.getElementById('show-login-from-reset');
  if (showLoginFromReset) {
    showLoginFromReset.addEventListener('click', e => {
      e.preventDefault();
      window.mostrarLogin();
    });
  }

  const showRegister = document.getElementById('show-register');
  if (showRegister) {
    showRegister.addEventListener('click', e => {
      e.preventDefault();
      window.mostrarRegistro();
    });
  }

  const showRecovery = document.getElementById('show-recovery');
  if (showRecovery) {
    showRecovery.addEventListener('click', e => {
      e.preventDefault();
      window.mostrarRecuperacion();
    });
  }

  /**
   * Clears all form status messages and error states.
   */
  function clearFormStatus() {
    document.querySelectorAll('#screen-login .form-status').forEach(el => {
      el.textContent = '';
      el.className = 'form-status';
    });
    document
      .querySelectorAll('#screen-login .bowl.error')
      .forEach(el => el.classList.remove('error'));
  }

  // ============================================================================
  // Floating label behavior for .bowl inputs
  // ============================================================================
  /**
   * Initializes floating label behavior for all bowl inputs on the login screen.
   */
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
  /**
   * Sets the status message for a form.
   * @param {string} formId - The ID of the form.
   * @param {string} message - The message to display.
   * @param {boolean} isError - Whether the message is an error.
   */
  function setFormStatus(formId, message, isError = false) {
    const statusEl = document.getElementById(`${formId.replace('-form', '')}-status`);
    if (!statusEl) return;
    statusEl.textContent = message;
    statusEl.className = `form-status${isError ? ' form-status-error' : ''}`;
  }

  /**
   * Sets the submitting state of a button.
   * @param {HTMLButtonElement} button - The button element.
   * @param {boolean} submitting - Whether the form is submitting.
   */
  function setSubmitting(button, submitting) {
    if (!button) return;
    button.classList.toggle('submitting', submitting);
    if (submitting) {
      button.disabled = true;
    } else {
      button.disabled = false;
    }
  }

  /**
   * Validates that an email domain is allowed.
   * @param {string} formId - The ID of the form.
   * @param {string} email - The email address to validate.
   * @returns {boolean} True if the domain is allowed, false otherwise.
   */
  function validateEmailDomain(formId, email) {
    if (!isAllowedDomain(email)) {
      const input = document.getElementById(
        formId === 'register-form' ? 'register-email' : 'login-email'
      );
      const bowl = input?.closest('.bowl');
      if (bowl) bowl.classList.add('error');
      setFormStatus(
        formId,
        'El dominio de tu correo no está permitido. Usa Gmail, Outlook, Hotmail, iCloud, Live o Yahoo.',
        true
      );
      return false;
    }
    return true;
  }

  /**
   * Handles form submission for auth forms.
   * @param {HTMLFormElement} form - The form element.
   * @param {string} endpoint - The API endpoint to call.
   * @param {string} successMessage - Message to show on success.
   * @param {string} redirectScreen - Screen to redirect to after success.
   */
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

      // Terms checkbox validation
      const termsCheckbox = form.querySelector('#register-terms');
      if (termsCheckbox && !termsCheckbox.checked) {
        termsCheckbox.closest('.bowl').classList.add('error');
        setFormStatus(formId, 'Debes aceptar los términos y condiciones', true);
        valid = false;
      }

      // Email domain validation
      const emailInput = form.querySelector('#register-email');
      if (emailInput && !validateEmailDomain(formId, emailInput.value)) {
        valid = false;
      }
    }

    // Email domain validation for login
    if (formId === 'login-form') {
      const emailInput = form.querySelector('#login-email');
      if (emailInput && !validateEmailDomain(formId, emailInput.value)) {
        valid = false;
      }
    }

    // Password confirmation check for reset
    if (formId === 'reset-form') {
      const pwd = form.querySelector('#reset-password');
      const pwdConfirm = form.querySelector('#reset-password-confirmation');
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
      formData.forEach((value, key) => {
        payload[key] = value;
      });

      // For reset form, send email, token (as code), and newPassword
      if (formId === 'reset-form') {
        payload.token = payload.code;
        delete payload.code;
        delete payload.newPasswordConfirmation;
      }

      const baseUrl = window.API_BASE_URL || 'http://localhost:5143';
      const response = await fetch(`${baseUrl}/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        credentials: 'include',
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(
          err.message ||
            (response.status === 401 ? 'Credenciales incorrectas' : 'Error del servidor')
        );
      }

      const data = await response.json();

      // On login/register success, store user and redirect
      if (endpoint === 'login' || endpoint === 'register') {
        // Store JWT token and user data
        if (data.token) localStorage.setItem('auth_token', data.token);
        const userName = data.fullName || data.nombre_completo || data.name || 'Usuario';
        localStorage.setItem(
          'user_data',
          JSON.stringify({
            id: data.id,
            fullName: userName,
            email: data.email,
            avatar: data.avatar || {
              color: '#4adecd',
              initials: userName
                .split(' ')
                .map(n => n[0])
                .join('')
                .toUpperCase()
                .slice(0, 3),
            },
          })
        );
        localStorage.setItem('entrena-user', JSON.stringify(data)); // Legacy compatibility

        setFormStatus(formId, successMessage || '¡Bienvenido!', false);
        submitBtn.classList.remove('submitting');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i data-lucide="check" style="width:20px;height:20px;"></i>';
        submitBtn.style.background = 'var(--pigment-teal)';
        if (typeof lucide !== 'undefined') lucide.createIcons();

        setTimeout(() => {
          submitBtn.innerHTML = '<span class="btn-text">Iniciar sesión</span>';
          submitBtn.style.background = '';
          if (typeof lucide !== 'undefined') lucide.createIcons();
          window.switchScreen(redirectScreen || 'screen-progress');
          window.dispatchEvent(new Event('user-authenticated'));
        }, 800);
      } else if (endpoint === 'recovery') {
        // Recovery success - show reset screen with token (for dev: token is logged to console)
        setFormStatus(formId, 'Se ha enviado un código de recuperación a tu correo.', false);
        setSubmitting(submitBtn, false);

        // For development: show reset screen immediately with the token
        // In production, this would be via email link with token in URL
        const email = payload.email;
        // Check if API returned devToken (dev mode only)
        const devToken = data.devToken;
        if (devToken) {
          setTimeout(() => {
            window.mostrarReset(email, devToken);
          }, 1500);
        }
      } else if (endpoint === 'reset-password') {
        // Reset password success
        setFormStatus(
          formId,
          successMessage ||
            'Contraseña restablecida correctamente. Redirigiendo al inicio de sesión...',
          false
        );
        setSubmitting(submitBtn, false);

        setTimeout(() => {
          window.mostrarLogin();
        }, 1500);
      }
    } catch (error) {
      setFormStatus(formId, error.message, true);
      setSubmitting(submitBtn, false);
    }
  }

  // Login form
  const loginForm = document.getElementById('login-form');
  if (loginForm) {
    loginForm.addEventListener('submit', e => {
      e.preventDefault();
      handleSubmit(loginForm, 'login', '¡Accediendo...', 'screen-progress');
    });
  }

  // Register form
  const registerForm = document.getElementById('register-form');
  if (registerForm) {
    registerForm.addEventListener('submit', e => {
      e.preventDefault();
      handleSubmit(registerForm, 'register', '¡Cuenta creada!', 'screen-progress');
    });
  }

  // Recovery form
  const recoveryForm = document.getElementById('recovery-form');
  if (recoveryForm) {
    recoveryForm.addEventListener('submit', e => {
      e.preventDefault();
      handleSubmit(
        recoveryForm,
        'recovery',
        'Si el correo existe, recibirás instrucciones para restablecer tu contraseña'
      );
    });
  }

  // Reset form
  const resetForm = document.getElementById('reset-form');
  if (resetForm) {
    resetForm.addEventListener('submit', e => {
      e.preventDefault();
      handleSubmit(resetForm, 'reset-password', 'Contraseña restablecida correctamente');
    });
  }

  // ============================================================================
  // "Forgot password" link in login form
  // ============================================================================
  const showRecoveryLink = document.getElementById('show-recovery');
  if (!showRecoveryLink) {
    // Add "Forgot password" link to login form if not present
    const loginFormEl = document.getElementById('login-form');
    if (loginFormEl) {
      const statusEl = document.getElementById('login-status');
      if (statusEl && statusEl.nextElementSibling) {
        const forgotLink = document.createElement('a');
        forgotLink.href = '#';
        forgotLink.className = 'login-link washi-tape';
        forgotLink.id = 'show-recovery';
        forgotLink.textContent = '¿Olvidaste tu contraseña?';
        forgotLink.style.display = 'block';
        forgotLink.style.marginTop = 'var(--space-sm)';
        statusEl.insertAdjacentElement('afterend', forgotLink);

        forgotLink.addEventListener('click', e => {
          e.preventDefault();
          window.mostrarRecuperacion();
        });
      }
    }
  }

  // ============================================================================
  // Legal Modal (Terms & Privacy)
  // ============================================================================
  const legalTerms = `
    <h3>Términos y Condiciones</h3>
    <p>Última actualización: 24 de noviembre de 2026</p>
    <h4>1. Aceptación de los términos</h4>
    <p>Al acceder y usar Entrena Tu Ser, aceptas cumplir con estos términos y condiciones. Si no estás de acuerdo, no uses la plataforma.</p>
    <h4>2. Uso de la plataforma</h4>
    <p>Entrena Tu Ser es una plataforma de fitness personal. El contenido es solo para fines educativos e informativos. No sustituye asesoramiento médico profesional.</p>
    <h4>3. Cuenta de usuario</h4>
    <p>Eres responsable de mantener la confidencialidad de tu cuenta y contraseña. Debes notificarnos inmediatamente de cualquier uso no autorizado.</p>
    <h4>4. Privacidad</h4>
    <p>Tu información personal se maneja según nuestra Política de Privacidad. Al usar la plataforma, consientes la recopilación y uso de datos como se describe ahí.</p>
    <h4>5. Propiedad intelectual</h4>
    <p>Todo el contenido, marcas, diseños y código son propiedad de Entrena Tu Ser o sus licenciantes. No puedes reproducir, distribuir o crear obras derivadas sin permiso.</p>
    <h4>6. Limitación de responsabilidad</h4>
    <p>La plataforma se proporciona "tal cual". No garantizamos disponibilidad ininterrumpida, libre de errores o resultados específicos.</p>
    <h4>7. Modificaciones</h4>
    <p>Podemos modificar estos términos en cualquier momento. Los cambios entran en vigor al publicarse. Tu uso continuado implica aceptación.</p>
    <h4>8. Ley aplicable</h4>
    <p>Estos términos se rigen por las leyes de España. Cualquier disputa se resolverá en los juzgados competentes.</p>
  `;

  const legalPrivacy = `
    <h3>Política de Privacidad</h3>
    <p>Última actualización: 24 de noviembre de 2026</p>
    <h4>1. Datos que recopilamos</h4>
    <ul>
      <li>Datos de registro: nombre, email, contraseña (hasheada)</li>
      <li>Datos de actividad: entrenamientos, rutinas, progreso, métricas</li>
      <li>Preferencias: tema, tamaño de texto, accesibilidad</li>
      <li>Datos técnicos: IP, dispositivo, navegador (para seguridad y analítica)</li>
    </ul>
    <h4>2. Uso de los datos</h4>
    <ul>
      <li>Proveer y mejorar el servicio de fitness</li>
      <li>Personalizar tu experiencia (avatar, rutinas recomendadas)</li>
      <li>Comunicaciones: recordatorios, actualizaciones, seguridad</li>
      <li>Analítica anónima para mejorar la plataforma</li>
    </ul>
    <h4>3. Compartir datos</h4>
    <p>No vendemos tus datos. Solo compartimos con:</p>
    <ul>
      <li>Proveedores de infraestructura (hosting, base de datos) bajo contrato</li>
      <li>Autoridades legales si es requerido por ley</li>
    </ul>
    <h4>4. Tus derechos</h4>
    <ul>
      <li>Acceder, rectificar o eliminar tus datos</li>
      <li>Exportar tus datos (portabilidad)</li>
      <li>Retirar consentimiento en cualquier momento</li>
      <li>Oponerte al procesamiento</li>
    </ul>
    <p>Ejercita tus derechos en: perfil → configuración → eliminar cuenta, o contactando a privacidad@entrenatuser.com</p>
    <h4>5. Retención</h4>
    <p>Mantenemos tus datos mientras tu cuenta esté activa. Tras eliminación, se anonimizan o borran en 30 días salvo obligación legal.</p>
    <h4>6. Seguridad</h4>
    <p>Usamos encriptación (TLS/HTTPS), hashing de contraseñas (PBKDF2), JWT para sesiones, y medidas técnicas/organizativas apropiadas.</p>
    <h4>7. Menores de edad</h4>
    <p>La plataforma no está dirigida a menores de 16 años. No recopilamos datos de menores intencionadamente.</p>
    <h4>8. Cambios</h4>
    <p>Publicaremos cambios en esta página. Uso continuado implica aceptación.</p>
  `;

  /**
   * Opens the legal modal (Terms or Privacy).
   * @param {string} type - The type of legal content to show: 'terms' or 'privacy'.
   */
  function openLegalModal(type) {
    const modal = document.getElementById('legal-modal');
    const title = document.getElementById('legal-modal-title');
    const content = document.getElementById('legal-modal-content');

    if (!modal || !title || !content) return;

    if (type === 'privacy') {
      title.textContent = 'Política de Privacidad';
      content.innerHTML = legalPrivacy;
    } else {
      title.textContent = 'Términos y Condiciones';
      content.innerHTML = legalTerms;
    }

    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';

    // Focus trap
    const closeBtn = modal.querySelector('.modal-close, #legal-modal-close');
    if (closeBtn) closeBtn.focus();
  }

  /**
   * Closes the legal modal.
   */
  function closeLegalModal() {
    const modal = document.getElementById('legal-modal');
    if (!modal) return;
    modal.classList.add('hidden');
    document.body.style.overflow = '';
  }

  // Event delegation for legal links
  document.addEventListener('click', e => {
    const link = e.target.closest('a.washi-tape');
    if (!link) return;

    const href = link.getAttribute('href');
    if (href === '#' && link.textContent.includes('términos')) {
      e.preventDefault();
      openLegalModal('terms');
    } else if (href === '#' && link.textContent.includes('privacidad')) {
      e.preventDefault();
      openLegalModal('privacy');
    }
  });

  // Close modal handlers
  const legalModal = document.getElementById('legal-modal');
  if (legalModal) {
    legalModal.querySelectorAll('.modal-close, #legal-modal-close').forEach(btn => {
      btn.addEventListener('click', closeLegalModal);
    });
    // Close on backdrop click
    legalModal.addEventListener('click', e => {
      if (e.target === legalModal) closeLegalModal();
    });
    // Close on Escape key
    document.addEventListener('keydown', e => {
      if (e.key === 'Escape' && !legalModal.classList.contains('hidden')) {
        closeLegalModal();
      }
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
