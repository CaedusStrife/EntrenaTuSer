const registerForm = document.getElementById('register-form');

if (registerForm) {
  registerForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const status = document.getElementById('register-status');
    const submitButton = registerForm.querySelector('button[type="submit"]');
    const formData = new FormData(registerForm);
    if (formData.get('password') !== formData.get('passwordConfirmation')) {
      status.textContent = 'Las contraseñas no coinciden.';
      status.className = 'form-status form-status-error';
      return;
    }

    status.textContent = 'Creando tu cuenta...';
    status.className = 'form-status';
    submitButton.disabled = true;

    try {
      const response = await fetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fullName: formData.get('fullName'),
          email: formData.get('email'),
          password: formData.get('password')
        })
      });
      const responseText = await response.text();
      let result = {};
      try {
        result = responseText ? JSON.parse(responseText) : {};
      } catch {
        throw new Error('El servidor devolvió una respuesta no válida. Comprueba que la API esté actualizada.');
      }

      if (!response.ok) throw new Error(result.message || 'No se pudo crear la cuenta.');

      localStorage.setItem('entrena-user', JSON.stringify(result));
      status.textContent = 'Cuenta creada correctamente. Iniciando sesión...';
      status.classList.add('form-status-success');
      registerForm.reset();
      window.setTimeout(() => {
              switchScreen('screen-progress');
        window.dispatchEvent(new Event('user-authenticated'));
      }, 500);
    } catch (error) {
      status.textContent = error.message;
      status.classList.add('form-status-error');
    } finally {
      submitButton.disabled = false;
    }
  });
}
