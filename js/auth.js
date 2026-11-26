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
    document.getElementById('login-card-register')?.classList.add('hidden');
    document.getElementById('login-card-recovery')?.classList.add('hidden');
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
    document.getElementById('login-card-auth')?.classList.add('hidden');
    document.getElementById('login-card-register')?.classList.add('hidden');
    document.getElementById('login-card-recovery')?.classList.remove('hidden');
    toggleSocialProof(false);
    clearFormStatus();
  };

  /**
   * Shows the reset password form with pre-filled email and token.
   * @global
   * @function mostrarResetPassword
   * @param {string} email - The user's email.
   * @param {string} token - The reset token.
   */
  window.mostrarResetPassword = function (email, token) {
    hideAllAuthCards();
    const resetCard = document.getElementById('login-card-reset');
    if (resetCard) {
      resetCard.classList.remove('hidden');
      document.getElementById('reset-email').value = email || '';
      document.getElementById('reset-token').value = token || '';
      document.getElementById('reset-code').value = token || ''; // Show token in code field for UX
      toggleSocialProof(false);
      clearFormStatus();
    }
  };

  // Initialize form switch links
  function initFormSwitchLinks() {
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
  // Form submission handlers
  // ============================================================================

  /**
   * Handles form submission for login, register, recovery, reset.
   * @param {HTMLFormElement} form - The form element.
   * @param {string} endpoint - The API endpoint.
   * @param {Function} onSuccess - Callback on successful submission.
   * @param {Object} [options] - Additional options.
   * @param {boolean} [options.validatePasswordConfirmation=false] - Whether to validate password confirmation.
   */
  function handleFormSubmit(form, endpoint, onSuccess, options = {}) {
    const { validatePasswordConfirmation = false } = options;
    const formId = form.id;

    form.addEventListener('submit', e => {
      e.preventDefault();

      const statusEl = document.getElementById(`${formId.replace('-form', '')}-status`);
      const submitBtn = form.querySelector('button[type="submit"]');
      const bowls = form.querySelectorAll('.bowl');

      // Validate required fields
      let hasError = false;
      bowls.forEach(bowl => {
        const input = bowl.querySelector('.bowl-input');
        if (input && input.required && !input.value.trim()) {
          bowl.classList.add('error');
          hasError = true;
        } else if (input) {
          bowl.classList.remove('error');
        }
      });

      // Validate password confirmation if needed
      if (validatePasswordConfirmation) {
        const pwd = form.querySelector('#register-password');
        const pwdConfirm = form.querySelector('#register-password-confirmation');
        if (pwd && pwdConfirm && pwd.value !== pwdConfirm.value) {
          if (pwdConfirm.closest('.bowl')) {
            pwdConfirm.closest('.bowl').classList.add('error');
          }
          hasError = true;
        }
      }

      // Validate terms checkbox
      if (formId === 'register-form') {
        const termsCheckbox = form.querySelector('#register-terms');
        if (termsCheckbox && !termsCheckbox.checked) {
          hasError = true;
        }
      }

      if (hasError) {
        if (statusEl) {
          statusEl.textContent = 'Por favor, completa todos los campos requeridos.';
          statusEl.className = 'form-status form-status-error';
        }
        return;
      }

      if (statusEl) {
        statusEl.textContent = formId === 'login-form' ? 'Iniciando sesión...' : 'Procesando...';
        statusEl.className = 'form-status';
      }
      if (submitBtn) submitBtn.disabled = true;

      const formData = new FormData(form);
      const payload = Object.fromEntries(formData.entries());

      // Remove confirmation fields from payload
      delete payload.passwordConfirmation;

      fetch(`${window.API_BASE_URL || 'http://localhost:5143'}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
        .then(async response => {
          const responseText = await response.text();
          let result = {};
          try {
            result = responseText ? JSON.parse(responseText) : {};
          } catch {
            throw new Error('El servidor devolvió una respuesta no válida. Comprueba que la API esté actualizada.');
          }

          if (!response.ok) throw new Error(result.message || 'Error en la solicitud.');

          if (statusEl) {
            statusEl.textContent = formId === 'login-form' ? '¡Bienvenido! Redirigiendo...' : '¡Cuenta creada! Iniciando sesión...';
            statusEl.className = 'form-status form-status-success';
          }

          onSuccess(result, form, formId);
        })
        .catch(error => {
          if (statusEl) {
            statusEl.textContent = error.message;
            statusEl.className = 'form-status form-status-error';
          }
        })
        .finally(() => {
          if (submitBtn) submitBtn.disabled = false;
        });
    });
  }

  // ============================================================================
  // Login form
  // ============================================================================
  function initLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
      handleFormSubmit(loginForm, '/api/auth/login', (result, form) => {
        localStorage.setItem('entrena-user', JSON.stringify(result));
        localStorage.setItem('auth_token', result.token);
        form.reset();
        setTimeout(() => {
          window.switchScreen('screen-progress');
          window.dispatchEvent(new Event('user-authenticated'));
        }, 500);
      });
    }
  }

  // ============================================================================
  // Register form
  // ============================================================================
  function initRegisterForm() {
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
      handleFormSubmit(registerForm, '/api/auth/register', (result, form) => {
        localStorage.setItem('entrena-user', JSON.stringify(result));
        localStorage.setItem('auth_token', result.token);
        form.reset();
        setTimeout(() => {
          window.switchScreen('screen-progress');
          window.dispatchEvent(new Event('user-authenticated'));
        }, 500);
      }, { validatePasswordConfirmation: true });
    }
  }

  // ============================================================================
  // Recovery form
  // ============================================================================
  function initRecoveryForm() {
    const recoveryForm = document.getElementById('recovery-form');
    if (recoveryForm) {
      handleFormSubmit(recoveryForm, '/api/auth/forgot-password', (result) => {
        if (result && result.token) {
          window.mostrarResetPassword(result.email, result.token);
        }
      });
    }
  }

  // ============================================================================
  // Reset password form
  // ============================================================================
  function initResetForm() {
    const resetForm = document.getElementById('reset-form');
    if (resetForm) {
      handleFormSubmit(resetForm, '/api/auth/reset-password', (result) => {
        if (result && result.token) {
          localStorage.setItem('entrena-user', JSON.stringify(result));
          localStorage.setItem('auth_token', result.token);
          setTimeout(() => {
            window.switchScreen('screen-progress');
            window.dispatchEvent(new Event('user-authenticated'));
          }, 500);
        }
      });
    }
  }

  // ============================================================================
  // "Forgot password" link in login form
  // ============================================================================
  function initForgotPasswordLink() {
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
    </ul>
    <h4>5. Seguridad</h4>
    <p>Usamos medidas técnicas y organizativas apropiadas para proteger tus datos. Sin embargo, ninguna transmisión por Internet es 100% segura.</p>
    <h4>6. Retención</h4>
    <p>Conservamos tus datos mientras tu cuenta esté activa o según lo requiera la ley. Puedes solicitar la eliminación en cualquier momento.</p>
    <h4>7. Contacto</h4>
    <p>Para ejercer tus derechos: <a href="mailto:privacidad@entrenatuser.es">privacidad@entrenatuser.es</a></p>
  `;

  const legalCookies = `
    <h3>Política de Cookies</h3>
    <p>Última actualización: 24 de noviembre de 2026</p>
    <h4>1. ¿Qué son las cookies?</h4>
    <p>Las cookies son pequeños archivos de texto que se almacenan en tu dispositivo cuando visitas un sitio web.</p>
    <h4>2. Tipos de cookies que usamos</h4>
    <ul>
      <li><strong>Esenciales:</strong> Necesarias para el funcionamiento (sesión, autenticación, seguridad). No se pueden desactivar.</li>
      <li><strong>Preferencias:</strong> Guardan tus ajustes (tema, idioma, accesibilidad).</li>
      <li><strong>Analíticas:</strong> Nos ayudan a entender cómo usas la plataforma (anónimas).</li>
    </ul>
    <h4>3. Gestión de cookies</h4>
    <p>Puedes configurar tu navegador para bloquear o alertar sobre cookies, pero algunas funciones podrían no funcionar.</p>
    <h4>4. Cookies de terceros</h4>
    <p>No usamos cookies de publicidad de terceros.</p>
  `;

  const legalContact = `
    <h3>Contacto</h3>
    <p>Si tienes preguntas, sugerencias o necesitas ayuda:</p>
    <ul>
      <li>Email: <a href="mailto:soporte@entrenatuser.es">soporte@entrenatuser.es</a></li>
      <li>Privacidad: <a href="mailto:privacidad@entrenatuser.es">privacidad@entrenatuser.es</a></li>
    </ul>
    <p>Responderemos lo antes posible.</p>
  `;

  const legalContentMap = {
    terms: legalTerms,
    privacy: legalPrivacy,
    cookies: legalCookies,
    contact: legalContact,
  };

  /**
   * Opens a legal modal with the specified content.
   * @param {string} type - The type of legal content ('terms', 'privacy', 'cookies', 'contact').
   */
  function openLegalModal(type) {
    const modal = document.getElementById('legal-modal');
    const title = document.getElementById('legal-modal-title');
    const content = document.getElementById('legal-modal-content');
    if (!modal || !title || !content) return;

    const titles = {
      terms: 'Términos y Condiciones',
      privacy: 'Política de Privacidad',
      cookies: 'Política de Cookies',
      contact: 'Contacto',
    };

    title.textContent = titles[type] || 'Información legal';
    content.innerHTML = legalContentMap[type] || '';
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
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

  // Initialize legal modal handlers
  function initLegalModal() {
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
      } else if (href === '#' && link.textContent.includes('cookies')) {
        e.preventDefault();
        openLegalModal('cookies');
      } else if (href === '#' && link.textContent.includes('contacto')) {
        e.preventDefault();
        openLegalModal('contact');
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
  }

  // ============================================================================
  // Initialize all auth functionality on DOM ready
  // ============================================================================
  function initAuth() {
    initFormSwitchLinks();
    initFloatingLabels();
    initLoginForm();
    initRegisterForm();
    initRecoveryForm();
    initResetForm();
    initForgotPasswordLink();
    initLegalModal();
    // Initialize lucide icons
    if (typeof lucide !== 'undefined') lucide.createIcons();
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAuth);
  } else {
    initAuth();
  }
})();