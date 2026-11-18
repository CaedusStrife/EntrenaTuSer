let progressChart;

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('entrena-user')); } catch { return null; }
}

async function loadProgress() {
  const user = getCurrentUser();
  if (!user) return;

  const response = await window.apiFetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/progress/${user.id}`);
  if (!response.ok) {
    throw new Error('No se pudo cargar tu progreso.');
  }
  const data = await response.json();
  const goal = await loadGoal(user.id);
  document.getElementById('progress-total-minutes').textContent = `${data.summary.totalMinutes} min`;
    document.getElementById('progress-progress-level').textContent = `Nivel ${data.summary.level}`;
    document.getElementById('progress-medal-count').textContent = `${data.summary.medals} medallas`;
    document.getElementById('progress-total-points').textContent = `${data.summary.totalPoints} pts`;
    document.getElementById('progress-completed-exercises').textContent = data.summary.completedExercises;
    renderGoal(data.summary, data.weekly, data.weeklyExercises, goal);
  renderProgressChart(data.weekly);
  renderHistory(data.history || []);
  renderMedals(data.medals || []);
  
  // Load calendar & streak
  loadCalendar(user.id);
}

async function loadCalendar(userId) {
  try {
    const response = await window.apiFetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/progress/${userId}/calendar`);
    if (!response.ok) return;
    const data = await response.json();
    renderCalendar(data.calendar, data.currentStreak, data.longestStreak);
  } catch {
    // Silently fail - calendar is optional enhancement
  }
}

function renderCalendar(calendar, currentStreak, longestStreak) {
  const container = document.getElementById('progress-calendar');
  const streakCurrent = document.getElementById('streak-current');
  const streakLongest = document.getElementById('streak-longest');
  
  if (!container) return;
  
  // Update streak badges
  if (streakCurrent) streakCurrent.querySelector('span').textContent = currentStreak || 0;
  if (streakLongest) streakLongest.querySelector('span').textContent = longestStreak || 0;
  
  // Generate last 90 days
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  let html = '';
  for (let i = 89; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    const dayData = calendar[dateStr];
    
    const isToday = i === 0;
    const isEmpty = !dayData;
    
    let classes = 'calendar-day';
    let content = '';
    
    if (isEmpty) {
      classes += ' empty';
      content = '<span class="day-number">' + date.getDate() + '</span>';
    } else {
      classes += dayData.sessions > 1 ? ' has-session multiple' : ' has-session';
      if (isToday) classes += ' today';
      content = '<span class="day-number">' + date.getDate() + '</span><span class="session-count">' + dayData.sessions + '</span>';
    }
    
    html += '<div class="' + classes + '" title="' + dateStr + (dayData ? ' · ' + dayData.sessions + ' sesiones, ' + dayData.minutes + ' min' : '') + '">' + content + '</div>';
  }
  
  container.innerHTML = html;
}

function getStoredGoal(userId) {
  try {
    const stored = JSON.parse(localStorage.getItem(`entrena-goal-${userId}`));
    if (stored && ['minutes', 'exercises'].includes(stored.type) && Number(stored.target) > 0) {
      return { type: stored.type, target: Number(stored.target) };
    }
  } catch {
    // Use the default goal when local storage contains invalid data.
  }
  return { type: 'minutes', target: 150 };
}

async function loadGoal(userId) {
  const fallback = getStoredGoal(userId);
  try {
    const response = await window.apiFetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/goals/${userId}`);
    if (!response.ok) return fallback;
    const goal = await response.json();
    if (!['minutes', 'exercises'].includes(goal.type) || Number(goal.target) < 1) return fallback;
    const normalized = { type: goal.type, target: Number(goal.target) };
    localStorage.setItem(`entrena-goal-${userId}`, JSON.stringify(normalized));
    return normalized;
  } catch {
    return fallback;
  }
}

function renderGoal(summary, weekly, weeklyExercises, goal) {
  const user = getCurrentUser();
  if (!user) return;
  const current = goal.type === 'minutes'
    ? Object.values(weekly || {}).reduce((total, minutes) => total + Number(minutes || 0), 0)
    : Object.values(weeklyExercises || {}).reduce((total, exercises) => total + Number(exercises || 0), 0);
  const percentage = Math.min(100, Math.round((current / goal.target) * 100));
  document.getElementById('progress-goal-type').value = goal.type;
  document.getElementById('progress-goal-target').value = goal.target;
  document.getElementById('progress-goal-title').textContent = goal.type === 'minutes'
    ? 'Meta semanal de minutos'
    : 'Meta de ejercicios completados';
  document.getElementById('progress-goal-current').textContent = `${current} de ${goal.target}`;
  document.getElementById('progress-goal-percent').textContent = `${percentage}%`;
  const bar = document.getElementById('progress-goal-bar');
  const progressBar = bar.closest('[role="progressbar"]');
  bar.style.width = `${percentage}%`;
  progressBar.setAttribute('aria-valuenow', String(percentage));
}

async function saveGoal(event) {
  event.preventDefault();
  const user = getCurrentUser();
  const type = document.getElementById('progress-goal-type').value;
  const target = Number(document.getElementById('progress-goal-target').value);
  if (!user || !['minutes', 'exercises'].includes(type) || !Number.isInteger(target) || target < 1) {
    showNotification('Indica una meta válida antes de guardarla.', 'error');
    return;
  }
  const goal = { type, target };
  try {
    const response = await window.apiFetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/goals`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: user.id, type, target })
    });
    if (!response.ok) throw new Error('No se pudo guardar la meta en la API.');
    localStorage.setItem(`entrena-goal-${user.id}`, JSON.stringify(goal));
    await loadProgress();
    showNotification('Meta semanal guardada correctamente.', 'success');
  } catch (error) {
    localStorage.setItem(`entrena-goal-${user.id}`, JSON.stringify(goal));
    showNotification(`${error.message} Se conservará localmente en este dispositivo.`, 'error');
  }
}

function renderHistory(history) {
  const container = document.getElementById('progress-workout-history');
  if (!container) return;
  if (!history.length) {
    container.innerHTML = '<p class="empty-state">Todavía no hay entrenamientos registrados.</p>';
    return;
  }
  container.innerHTML = history.map((item) => `
    <article class="history-item">
      <div>
        <strong>${escapeProgressText(item.exercise)}</strong>
        <span>${item.date} · ${item.minutes} min</span>
      </div>
      <b>+${item.points} pts</b>
    </article>
  `).join('');
}

function renderMedals(medals) {
  const container = document.getElementById('progress-medals-list');
  if (!container) return;
  if (!medals.length) {
    container.innerHTML = '<p class="empty-state">Completa ejercicios para obtener medallas.</p>';
    return;
  }
  container.innerHTML = medals.map((medal) => `
    <article class="medal-item">
      <span class="medal-icon">★</span>
      <div>
        <strong>${escapeProgressText(medal.name)}</strong>
        <span>${escapeProgressText(medal.description)} · ${medal.earnedAt}</span>
      </div>
    </article>
  `).join('');
}

function escapeProgressText(value) {
  const element = document.createElement('span');
  element.textContent = value || '';
  return element.innerHTML;
}

function renderProgressChart(weekly) {
  const canvas = document.getElementById('progress-weeklyChart');
  if (!canvas || typeof Chart === 'undefined') return;
  if (progressChart) progressChart.destroy();
  const existingChart = Chart.getChart(canvas);
  if (existingChart) existingChart.destroy();
  const dates = [...Array(7)].map((_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - index));
    return date.toISOString().slice(0, 10);
  });
  progressChart = new Chart(canvas, {
    type: 'bar',
    data: { labels: dates.map((date) => date.slice(5)), datasets: [{
      label: 'Minutos de actividad',
      data: dates.map((date) => weekly[date] || 0),
      backgroundColor: '#ff7e21',
      borderRadius: 10
    }] },
    options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } },
      scales: { y: { beginAtZero: true, ticks: { callback: (value) => `${value} min` } } } }
  });
}

window.addEventListener('user-authenticated', loadProgress);
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('progress-goal-form')?.addEventListener('submit', saveGoal);
  loadProgress();
});
