// progress.js - Updated for Hoja de Identidad topology

let progressChart;

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('entrena-user')); } catch { return null; }
}

async function loadProgress() {
  const user = getCurrentUser();
  if (!user) return;

  try {
    const response = await window.apiFetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/progress/${user.id}`);
    if (!response.ok) {
      throw new Error('No se pudo cargar tu progreso.');
    }
    const data = await response.json();
    const goal = await loadGoal(user.id);
    
    // Update hero stats
    updateHeroStats(data.summary);
    
    // Update primary metric cards (weekly)
    updateWeeklyMetrics(data.summary, data.weekly, data.weeklyExercises);
    
    // Update goal progress
    renderGoal(data.summary, data.weekly, data.weeklyExercises, goal);
    
    // Render chart using ProgressCharts module
    if (window.progressCharts) {
      const dates = [...Array(7)].map((_, index) => {
        const date = new Date();
        date.setDate(date.getDate() - (6 - index));
        return date.toISOString().slice(0, 10);
      });
      const chartData = dates.map((date) => data.weekly[date] || 0);
      window.progressCharts.updateChart(chartData);
      window.progressCharts.updateChartLabels();
    }
    
    // Render history (secondary accordion)
    renderHistory(data.history || []);
    
    // Render medals (secondary accordion)
    renderMedals(data.medals || []);
    
    // Render total stats (secondary accordion)
    renderTotalStats(data.summary);
    
    // Load calendar & streak
    loadCalendar(user.id);
  } catch (error) {
    console.error('Error loading progress:', error);
    showToast('Error al cargar el progreso', 'error');
  }
}

function updateHeroStats(summary) {
  // Update hero level and streak
  const levelEl = document.getElementById('hero-level');
  const streakEl = document.getElementById('streak-count');
  
  if (levelEl) levelEl.textContent = `Nivel ${summary.level}`;
  // Streak is loaded via loadCalendar
}

function updateWeeklyMetrics(summary, weekly, weeklyExercises) {
  // Calculate weekly totals
  const weeklyMinutes = Object.values(weekly || {}).reduce((total, minutes) => total + Number(minutes || 0), 0);
  const weeklyExerciseCount = Object.values(weeklyExercises || {}).reduce((total, count) => total + Number(count || 0), 0);
  const weeklyPoints = Math.round(weeklyMinutes * 2 + weeklyExerciseCount * 10); // Approximation
  
  const minutesEl = document.getElementById('progress-weekly-minutes');
  const exercisesEl = document.getElementById('progress-weekly-exercises');
  const pointsEl = document.getElementById('progress-weekly-points');
  const goalPercentEl = document.getElementById('progress-goal-percent-main');
  
  if (minutesEl) minutesEl.textContent = `${weeklyMinutes} min`;
  if (exercisesEl) exercisesEl.textContent = weeklyExerciseCount;
  if (pointsEl) pointsEl.textContent = `${weeklyPoints} pts`;
  // Goal percent updated in renderGoal
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
  const heroStreak = document.getElementById('streak-count');
  
  // Update streak badges
  if (streakCurrent) streakCurrent.querySelector('span').textContent = currentStreak || 0;
  if (streakLongest) streakLongest.querySelector('span').textContent = longestStreak || 0;
  if (heroStreak) heroStreak.textContent = currentStreak || 0;
  
  if (!container) return;
  
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
  
  // Update inline goal form
  const typeEl = document.getElementById('progress-goal-type');
  const targetEl = document.getElementById('progress-goal-target');
  const titleEl = document.getElementById('progress-goal-title');
  
  if (typeEl) typeEl.value = goal.type;
  if (targetEl) targetEl.value = goal.target;
  if (titleEl) titleEl.textContent = goal.type === 'minutes' ? 'Meta semanal de minutos' : 'Meta de ejercicios completados';
  
  // Update goal progress display (primary)
  const currentEl = document.getElementById('progress-goal-current');
  const percentEl = document.getElementById('progress-goal-percent');
  const barEl = document.getElementById('progress-goal-bar');
  const progressBarEl = barEl?.closest('[role="progressbar"]');
  const goalPercentMainEl = document.getElementById('progress-goal-percent-main');
  
  if (currentEl) currentEl.textContent = `${current} de ${goal.target}`;
  if (percentEl) percentEl.textContent = `${percentage}%`;
  if (goalPercentMainEl) goalPercentMainEl.textContent = `${percentage}%`;
  if (barEl) barEl.style.width = `${percentage}%`;
  if (progressBarEl) progressBarEl.setAttribute('aria-valuenow', String(percentage));
}

async function saveGoal(event) {
  event.preventDefault();
  const user = getCurrentUser();
  const type = document.getElementById('progress-goal-type').value;
  const target = Number(document.getElementById('progress-goal-target').value);
  if (!user || !['minutes', 'exercises'].includes(type) || !Number.isInteger(target) || target < 1) {
    showToast('Indica una meta válida antes de guardarla.', 'error');
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
    showToast('Meta semanal guardada correctamente.', 'success');
  } catch (error) {
    localStorage.setItem(`entrena-goal-${user.id}`, JSON.stringify(goal));
    showToast(`${error.message} Se conservará localmente en este dispositivo.`, 'error');
  }
}

function renderHistory(history) {
  const container = document.getElementById('progress-workout-history');
  const emptyEl = document.getElementById('history-empty-state');
  
  if (!container) return;
  
  if (!history.length) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  
  if (emptyEl) emptyEl.classList.add('hidden');
  
  container.innerHTML = history.map((item) => `
    <article class="history-item">
      <div class="history-item-icon">
        <i data-lucide="activity" aria-hidden="true"></i>
      </div>
      <div class="history-item-info">
        <strong class="history-item-title">${escapeProgressText(item.exercise)}</strong>
        <div class="history-item-meta">
          <span><i data-lucide="calendar" aria-hidden="true"></i> ${item.date}</span>
          <span><i data-lucide="clock" aria-hidden="true"></i> ${item.minutes} min</span>
        </div>
      </div>
      <span class="history-item-points">+${item.points} pts</span>
    </article>
  `).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderMedals(medals) {
  const container = document.getElementById('progress-medals-list');
  const badgeEl = document.getElementById('medal-count-badge');
  
  if (!container) return;
  
  // Count earned medals
  const earnedCount = medals.filter(m => m.earned).length;
  const totalCount = 18; // Catalog size
  if (badgeEl) badgeEl.textContent = earnedCount;
  
  if (!medals.length) {
    container.innerHTML = '';
    return;
  }
  
  container.innerHTML = medals.map((medal) => `
    <article class="medal-badge ${medal.earned ? 'earned' : 'locked'}" title="${escapeProgressText(medal.description)}">
      <div class="medal-icon">
        <i data-lucide="${medal.icon || 'star'}" aria-hidden="true"></i>
      </div>
      <span>${escapeProgressText(medal.name)}</span>
    </article>
  `).join('');
  
  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function renderTotalStats(summary) {
  const minutesEl = document.getElementById('progress-total-minutes');
  const exercisesEl = document.getElementById('progress-completed-exercises');
  const pointsEl = document.getElementById('progress-total-points');
  const levelEl = document.getElementById('progress-progress-level');
  
  if (minutesEl) minutesEl.textContent = `${summary.totalMinutes} min`;
  if (exercisesEl) exercisesEl.textContent = summary.completedExercises;
  if (pointsEl) pointsEl.textContent = `${summary.totalPoints} pts`;
  if (levelEl) levelEl.textContent = `Nivel ${summary.level}`;
}

function escapeProgressText(value) {
  const element = document.createElement('span');
  element.textContent = value || '';
  return element.innerHTML;
}

function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container') || createToastContainer();
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  toast.innerHTML = `
      <span>${message}</span>
      <button class="toast-close" aria-label="Cerrar">&times;</button>
  `;
  container.appendChild(toast);

  toast.querySelector('.toast-close').addEventListener('click', () => toast.remove());
  setTimeout(() => toast.remove(), 5000);
}

function createToastContainer() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  container.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:10000;display:flex;flex-direction:column;gap:8px;';
  document.body.appendChild(container);
  return container;
}

// Edit goal form toggle
function setupGoalEdit() {
  const editTrigger = document.getElementById('edit-goal-trigger');
  const goalForm = document.getElementById('progress-goal-form');
  const cancelBtn = document.getElementById('cancel-goal-edit');
  
  if (editTrigger && goalForm) {
    editTrigger.addEventListener('click', () => {
      goalForm.classList.remove('hidden');
      editTrigger.classList.add('hidden');
    });
  }
  
  if (cancelBtn && goalForm && editTrigger) {
    cancelBtn.addEventListener('click', () => {
      goalForm.classList.add('hidden');
      editTrigger.classList.remove('hidden');
    });
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('progress-goal-form')?.addEventListener('submit', saveGoal);
  setupGoalEdit();
  loadProgress();
});

// Export for global access
window.loadProgress = loadProgress;