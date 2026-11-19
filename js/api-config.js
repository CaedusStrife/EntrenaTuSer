// Modo local: API siempre en localhost:5143
window.API_BASE_URL = window.API_BASE_URL || 'https://api-entrenatuse-bge9a6g4cyatcpf4.westus3-01.azurewebsites.net';

window.apiFetch = function (url, options = {}) {
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('entrena-user'));
  } catch {
    user = null;
  }

  const headers = new Headers(options.headers || {});
  if (user?.token) headers.set('Authorization', `Bearer ${user.token}`);
  return fetch(url, { ...options, headers });
};

console.log('API_BASE_URL:', window.API_BASE_URL);