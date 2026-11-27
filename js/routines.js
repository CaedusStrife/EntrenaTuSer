// routines.js - Updated for Hoja de Identidad topology (Wizard Modal)

// Use window.API_BASE_URL set by api-config.js, fallback to localhost
const API_BASE = window.API_BASE_URL || 'http://localhost:5143';

let allExercises = [];
let currentRoutineId = null;

/* ==================== API CALLS ==================== */

async function fetchUserRoutines(userId) {
  const res = await window.apiFetch(`${API_BASE}/api/routines/user/${userId}`);
  if (!res.ok) throw new Error('No se pudieron cargar las rutinas');
  return res.json();
}

async function fetchRoutineDetail(routineId) {
  const res = await window.apiFetch(`${API_BASE}/api/routines/${routineId}`);
  if (!res.ok) throw new Error('No se pudo cargar la rutina');
  return res.json();
}

async function createRoutine(data) {
  const res = await window.apiFetch(`${API_BASE}/api/routines`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudo crear la rutina');
  }
  return res.json();
}

async function updateRoutine(routineId, data) {
  const res = await window.apiFetch(`${API_BASE}/api/routines/${routineId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.message || 'No se pudo actualizar la rutina');
  }
  return res.json();
}

async function deleteRoutine(routineId) {
  const res = await window.apiFetch(`${API_BASE}/api/routines/${routineId}`, {
    method: 'DELETE'
  });
  if (!res.ok) throw new Error('No se pudo eliminar la rutina');
  return res.json();
}

async function duplicateRoutine(routineId) {
  const res = await window.apiFetch(`${API_BASE}/api/routines/${routineId}/duplicate`, {
    method: 'POST'
  });
  if (!res.ok) throw new Error('No se pudo duplicar la rutina');
  return res.json();
}

/* ==================== UI: LISTAR RUTINAS ==================== */

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('entrena-user')); } catch { return null; }
}

async function loadRoutines() {
  const user = getCurrentUser();
  if (!user) return;

  const container = document.getElementById('routines-list');
  const emptyEl = document.getElementById('routines-empty-state');
  if (!container) return;

  // Show loading skeletons
  container.innerHTML = `
    <div class="skeleton skeleton-card" aria-hidden="true"></div>
    <div class="skeleton skeleton-card" aria-hidden="true"></div>
    <div class="skeleton skeleton-card" aria-hidden="true"></div>
  `;
  if (emptyEl) emptyEl.classList.add('hidden');

  try {
    const routines = await fetchUserRoutines(user.id);
    renderRoutinesList(routines, user.id);
  } catch (error) {
    container.innerHTML = '';
    if (emptyEl) {
      emptyEl.classList.remove('hidden');
      emptyEl.querySelector('p').textContent = error.message;
    }
  }
}

function renderRoutinesList(routines, userId) {
  const container = document.getElementById('routines-list');
  const emptyEl = document.getElementById('routines-empty-state');
  if (!container) return;

  if (!routines.length) {
    container.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }

  if (emptyEl) emptyEl.classList.add('hidden');

  container.innerHTML = routines.map(r => `
    <article class="routine-card" data-routine-id="${r.id}" role="listitem">
      <header class="routine-card-header">
        <h3 class="routine-card-title">${escapeHtml(r.name)}</h3>
        <div class="routine-card-menu">
          <button type="button" class="routine-menu-btn" aria-label="Opciones de rutina" aria-expanded="false" aria-haspopup="true">
            <i data-lucide="more-vertical" aria-hidden="true"></i>
          </button>
          <div class="routine-menu-dropdown" role="menu">
            <button type="button" class="routine-menu-edit" role="menuitem" onclick="editRoutine(${r.id})" aria-label="Editar rutina">
              <i data-lucide="edit-2" aria-hidden="true"></i> Editar
            </button>
            <button type="button" class="routine-menu-duplicate" role="menuitem" onclick="duplicateRoutineAction(${r.id})" aria-label="Duplicar rutina">
              <i data-lucide="copy" aria-hidden="true"></i> Duplicar
            </button>
            <button type="button" class="routine-menu-start" role="menuitem" onclick="startRoutine(${r.id})" aria-label="Iniciar rutina">
              <i data-lucide="play" aria-hidden="true"></i> Iniciar
            </button>
            <button type="button" class="routine-menu-delete danger" role="menuitem" onclick="confirmDeleteRoutine(${r.id})" aria-label="Eliminar rutina">
              <i data-lucide="trash-2" aria-hidden="true"></i> Eliminar
            </button>
          </div>
        </div>
      </header>
      <div class="routine-card-body">
        ${r.description ? `<p class="routine-card-description">${escapeHtml(r.description)}</p>` : ''}
        <div class="routine-card-meta">
          <span><i data-lucide="clock" aria-hidden="true"></i> ${calculateTotalMinutes(r)} min</span>
          <span><i data-lucide="check-circle" aria-hidden="true"></i> ${countExercises(r)} ejercicios</span>
          <span><i data-lucide="calendar" aria-hidden="true"></i> ${formatDate(r.createdAt)}</span>
          <span><i data-lucide="target" aria-hidden="true"></i> ${getTypeLabel(r)}</span>
        </div>
        <div class="routine-card-progress">
          <div class="routine-card-progress-label">
            <span>Progreso</span>
            <span>0%</span>
          </div>
          <div class="routine-card-progress-track">
            <span class="routine-card-progress-bar" style="width: 0%"></span>
          </div>
        </div>
        <div class="routine-card-actions">
          <button type="button" class="btn-droplet" onclick="startRoutine(${r.id})" aria-label="Iniciar ${escapeHtml(r.name)}">
            <i data-lucide="play" aria-hidden="true"></i> Iniciar
          </button>
          <button type="button" class="btn-droplet btn-secondary" onclick="editRoutine(${r.id})" aria-label="Editar ${escapeHtml(r.name)}">
            <i data-lucide="edit-2" aria-hidden="true"></i> Editar
          </button>
        </div>
      </div>
    </article>
  `).join('');

  // Initialize dropdown menus
  initializeRoutineDropdowns();
  
  if (window.lucide) lucide.createIcons();
}

function initializeRoutineDropdowns() {
  document.querySelectorAll('.routine-menu-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const dropdown = btn.nextElementSibling;
      const isExpanded = btn.getAttribute('aria-expanded') === 'true';
      
      // Close all other dropdowns
      document.querySelectorAll('.routine-menu-btn[aria-expanded="true"]').forEach(otherBtn => {
        if (otherBtn !== btn) {
          otherBtn.setAttribute('aria-expanded', 'false');
          otherBtn.nextElementSibling?.classList.remove('visible');
        }
      });
      
      btn.setAttribute('aria-expanded', String(!isExpanded));
      dropdown?.classList.toggle('visible', !isExpanded);
    });
  });
  
  // Close dropdowns when clicking outside
  document.addEventListener('click', () => {
    document.querySelectorAll('.routine-menu-btn[aria-expanded="true"]').forEach(btn => {
      btn.setAttribute('aria-expanded', 'false');
      btn.nextElementSibling?.classList.remove('visible');
    });
  });
}

function getDifficultyLabel(routine) {
  const totalExercises = countExercises(routine);
  if (totalExercises <= 3) return 'Principiante';
  if (totalExercises <= 6) return 'Intermedio';
  return 'Avanzado';
}

function getTypeLabel(routine) {
  return 'Personalizada';
}

function countExercises(routine) {
  return routine.exerciseCount ?? routine.exercises?.length ?? 0;
}

function calculateTotalMinutes(routine) {
  if (routine.totalDurationSeconds != null) {
    return Math.ceil(routine.totalDurationSeconds / 60);
  }
  if (!routine.exercises) return 0;
  return Math.ceil(routine.exercises.reduce(
    (sum, ex) => sum + ((ex.durationSeconds || 0) * (ex.series || 1)),
    0
  ) / 60);
}

function formatDate(dateStr) {
  const date = new Date(dateStr);
  return date.toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

/* ==================== WIZARD MODAL INTEGRATION ==================== */

// The wizard is managed by routineWizard.js
// This file provides data loading and action handlers

async function loadExercisesForWizard() {
  try {
    const res = await fetch(`${API_BASE}/api/exercises`);
    allExercises = await res.json();
    window.allExercises = allExercises; // Also set on window for safety
    return allExercises;
  } catch {
    allExercises = [];
    window.allExercises = [];
    return [];
  }
}

// Helper to get correct element IDs based on which modal is open
function getWizardElements() {
  const isWizard = document.getElementById('routine-modal') && !document.getElementById('routine-modal').classList.contains('hidden');
  return {
    container: isWizard ? document.getElementById('wizard-exercise-list') : document.getElementById('exercise-selector-list'),
    searchInput: isWizard ? document.getElementById('wizard-exercise-search') : document.getElementById('exercise-search'),
    selectedList: isWizard ? document.getElementById('wizard-selected-exercises') : document.getElementById('selected-exercises-list'),
    countEl: document.getElementById('selected-count'),
    filterChips: isWizard ? document.querySelectorAll('#routine-modal .filter-chip') : document.querySelectorAll('#routine-modal-legacy .filter-chip')
  };
}

function renderExerciseSelector(filter = 'all', search = '') {
  const { container, searchInput, selectedList, countEl } = getWizardElements();
  if (!container) return;

  let filtered = allExercises;
  if (filter !== 'all') {
    filtered = filtered.filter(ex => {
      const name = ex.name.toLowerCase();
      if (filter === 'strength') return ['sentadilla', 'zancada', 'fuerza', 'flexion', 'lagartija', 'puente', 'plancha', 'abdominal', 'crunch', 'escalador'].some(t => name.includes(t));
      if (filter === 'cardio') return ['cardio', 'correr', 'saltar', 'burpee', 'mountain climber'].some(t => name.includes(t));
      if (filter === 'mobility') return ['estiramiento', 'movilidad', 'cuello', 'hombro', 'torsion', 'alcance', 'inclinacion'].some(t => name.includes(t));
      if (filter === 'core') return ['plancha', 'abdominal', 'crunch', 'escalador', 'torsion'].some(t => name.includes(t));
      return true;
    });
  }
  
  if (search) {
    filtered = filtered.filter(ex => ex.name.toLowerCase().includes(search.toLowerCase()));
  }

  // Get currently selected exercise IDs
  const selectedIds = new Set();
  const items = selectedList ? selectedList.querySelectorAll('.selected-exercise-item') : [];
  items.forEach(item => {
    const id = item.dataset.exerciseId;
    if (id) selectedIds.add(id);
  });

  container.innerHTML = filtered.map((exercise) => {
    const isSelected = selectedIds.has(exercise.id);
    const category = getExerciseCategory(exercise);
    return `
      <article class="exercise-selector-item ${isSelected ? 'selected' : ''}" data-exercise-id="${exercise.id}">
        <div class="exercise-selector-item-info">
          <span class="exercise-selector-item-name">${escapeHtml(exercise.name)}</span>
          <span class="exercise-selector-item-category">${category}</span>
        </div>
        <button type="button" class="exercise-selector-item-add" onclick="toggleExerciseSelection('${exercise.id}')" aria-label="${isSelected ? 'Quitar' : 'Añadir'} ${escapeHtml(exercise.name)}" aria-pressed="${isSelected}">
          <i data-lucide="${isSelected ? 'check' : 'plus'}" aria-hidden="true"></i>
        </button>
      </article>
    `;
  }).join('');

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function getExerciseCategory(exercise) {
  const name = exercise.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (['plancha', 'abdominal', 'crunch', 'escalador', 'torsion'].some(term => name.includes(term))) return 'Core';
  if (['estiramiento', 'movilidad', 'cuello', 'hombro', 'torsion', 'alcance', 'inclinacion'].some(term => name.includes(term))) return 'Movilidad';
  if (['sentadilla', 'zancada', 'fuerza', 'flexion', 'lagartija', 'puente'].some(term => name.includes(term))) return 'Fuerza';
  return 'Cardio';
}

function toggleExerciseSelection(exerciseId) {
  const exercises = allExercises || window.allExercises || [];
  const exercise = exercises.find(ex => String(ex.id) === String(exerciseId));
  if (!exercise) return;

  const { selectedList, countEl, filterChips, searchInput } = getWizardElements();
  if (!selectedList) return;

  const emptyEl = selectedList.querySelector('.wizard-selected-empty') || selectedList.querySelector('.empty-selected');
  if (emptyEl) emptyEl.remove();

  const existingItem = selectedList.querySelector(`[data-exercise-id="${exerciseId}"]`);
  
  if (existingItem) {
    // Remove
    existingItem.remove();
  } else {
    // Add
    const item = document.createElement('li');
    item.className = 'selected-exercise-item';
    item.dataset.exerciseId = exerciseId;
    item.draggable = true;
    item.innerHTML = `
      <span class="drag-handle" aria-label="Reordenar"><i data-lucide="grip-vertical" aria-hidden="true"></i></span>
      <div class="selected-exercise-info">
        <span class="selected-exercise-name">${escapeHtml(exercise.name)}</span>
        <span class="selected-exercise-category">${getExerciseCategory(exercise)}</span>
      </div>
      <button type="button" class="selected-exercise-remove" onclick="toggleExerciseSelection('${exerciseId}')" aria-label="Quitar ${escapeHtml(exercise.name)}">
        <i data-lucide="x" aria-hidden="true"></i>
      </button>
    `;
    selectedList.appendChild(item);
    
    // Add drag and drop handlers
    addDragHandlers(item);
  }

  // Update count
  const count = selectedList.querySelectorAll('.selected-exercise-item').length;
  if (countEl) countEl.textContent = count;

  // Re-render selector to update button states
  const currentFilter = filterChips?.length > 0 ? 
    (document.querySelector('.filter-chip.active')?.dataset.category || 'all') : 
    'all';
  const currentSearch = searchInput?.value || '';
  renderExerciseSelector(currentFilter, currentSearch);

  if (typeof lucide !== 'undefined') lucide.createIcons();
}

function addDragHandlers(item) {
  item.addEventListener('dragstart', (e) => {
    item.classList.add('dragging');
    e.dataTransfer.effectAllowed = 'move';
  });
  
  item.addEventListener('dragend', () => {
    item.classList.remove('dragging');
    document.querySelectorAll('.selected-exercise-item.drag-over').forEach(el => el.classList.remove('drag-over'));
  });
  
  item.addEventListener('dragover', (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    const afterElement = getDragAfterElement(item.parentElement, e.clientY);
    const draggable = document.querySelector('.dragging');
    if (afterElement == null) {
      item.parentElement.appendChild(draggable);
    } else {
      item.parentElement.insertBefore(draggable, afterElement);
    }
    item.classList.add('drag-over');
  });
  
  item.addEventListener('dragleave', () => {
    item.classList.remove('drag-over');
  });
  
  item.addEventListener('drop', (e) => {
    e.preventDefault();
    item.classList.remove('drag-over');
  });
}

function getDragAfterElement(container, y) {
  const draggableElements = [...container.querySelectorAll('.selected-exercise-item:not(.dragging)')];
  return draggableElements.reduce((closest, child) => {
    const box = child.getBoundingClientRect();
    const offset = y - box.top - box.height / 2;
    if (offset < 0 && offset > closest.offset) {
      return { offset: offset, element: child };
    } else {
      return closest;
    }
  }, { offset: Number.NEGATIVE_INFINITY }).element;
}

// Called from wizard when loading routine for edit
async function loadRoutineForWizard(routineId) {
  try {
    const data = await fetchRoutineDetail(routineId);
    return {
      id: data.routine.id,
      name: data.routine.name,
      description: data.routine.description || '',
      goal: data.routine.goal || 'strength',
      level: data.routine.level || 'intermediate',
      estimatedTime: data.routine.estimatedTime || calculateTotalMinutes(data.routine),
      exercises: (data.exercises || []).map(ex => ({ exerciseId: ex.exerciseId, order: ex.order }))
    };
  } catch (error) {
    showToast('Error cargando rutina: ' + error.message, 'error');
    return null;
  }
}

// Called from wizard when saving
async function saveRoutineFromWizard(routineData) {
  const user = getCurrentUser();
  if (!user) {
    showToast('Inicia sesión primero.', 'error');
    return false;
  }

  const exerciseIds = routineData.exercises.map(e => e.exerciseId);
  const series = routineData.exercises.map(e => e.series || 3);
  const reps = routineData.exercises.map(e => e.reps || 10);
  const restSeconds = routineData.exercises.map(e => e.restSeconds || 60);

  const data = {
    userId: user.id,
    name: routineData.name,
    description: routineData.description,
    exerciseIds,
    series,
    reps,
    restSeconds
  };

  try {
    if (routineData.id) {
      await updateRoutine(routineData.id, data);
    } else {
      await createRoutine(data);
    }
    return true;
  } catch (error) {
    showToast(error.message, 'error');
    return false;
  }
}

/* ==================== ACCIONES: VER, INICIAR, DUPLICAR, ELIMINAR ==================== */

async function startRoutine(routineId) {
  try {
    const data = await fetchRoutineDetail(routineId);
    window.resetTrainingSession?.();
    window.activeRoutineId = routineId;
    window.activeRoutineName = data.routine.name;
    
    const routineExerciseIds = data.exercises.map(ex => ex.exerciseId);
    const routineExercises = data.exercises.map(ex => ({ exerciseId: ex.exerciseId, order: ex.order }));
    
    // Switch to workout screen and initialize with routine exercises
    const workoutBtn = document.querySelector('.sidebar-menu .nav-btn[onclick*="screen-workout"]');
    if (workoutBtn) {
      window.switchTab('screen-workout', workoutBtn);
    } else {
      // Direct state machine initialization
      if (window.workoutStateMachine && window.allExercises) {
        window.workoutStateMachine.initialize(window.allExercises, routineExerciseIds, routineExercises);
      }
    }
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function editRoutine(routineId) {
  // Load routine data and open wizard in edit mode
  const routineData = await loadRoutineForWizard(routineId);
  if (routineData) {
    window.routineWizard.loadRoutine(routineData);
    document.getElementById('routine-modal').classList.remove('hidden');
  }
}

async function duplicateRoutineAction(routineId) {
  try {
    const newRoutine = await duplicateRoutine(routineId);
    showToast('Rutina duplicada correctamente', 'success');
    await loadRoutines();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

async function confirmDeleteRoutine(routineId) {
  if (!confirm('¿Estás seguro de que quieres eliminar esta rutina? Esta acción no se puede deshacer.')) return;
  
  try {
    await deleteRoutine(routineId);
    showToast('Rutina eliminada', 'success');
    await loadRoutines();
  } catch (error) {
    showToast(error.message, 'error');
  }
}

// Export for global access
window.loadRoutines = loadRoutines;
window.openRoutineModal = () => {
  // Reset wizard for new routine
  window.routineWizard.routineData = { id: null, name: '', description: '', goal: 'strength', level: 'intermediate', duration: 30, frequency: 3, exercises: [] };
  window.routineWizard.goToStep(1);
  document.getElementById('routine-modal').classList.remove('hidden');
  
  // Load exercises for selector
  loadExercisesForWizard().then(() => {
    renderExerciseSelector();
  });
};
window.closeRoutineModal = () => {
  document.getElementById('routine-modal').classList.add('hidden');
  // Cleanup
  window.routineWizard.routineData = { id: null, name: '', description: '', goal: 'strength', level: 'intermediate', duration: 30, frequency: 3, exercises: [] };
  window.routineWizard.currentStep = 1;
  window.routineWizard.updateUI();
};
window.startRoutine = startRoutine;
window.editRoutine = editRoutine;
window.duplicateRoutineAction = duplicateRoutineAction;
window.confirmDeleteRoutine = confirmDeleteRoutine;
window.loadExercisesForWizard = loadExercisesForWizard;
window.renderExerciseSelector = renderExerciseSelector;
window.toggleExerciseSelection = toggleExerciseSelection;

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  // Setup filter chips for both modals
  document.querySelectorAll('#routine-modal .filter-chip, #routine-modal-legacy .filter-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      const isWizard = chip.closest('#routine-modal') && !document.getElementById('routine-modal').classList.contains('hidden');
      const selector = isWizard ? '#routine-modal .filter-chip' : '#routine-modal-legacy .filter-chip';
      document.querySelectorAll(selector).forEach(c => {
        c.classList.remove('active');
        c.setAttribute('aria-pressed', 'false');
      });
      chip.classList.add('active');
      chip.setAttribute('aria-pressed', 'true');
      const filter = chip.dataset.category;
      const searchInput = isWizard ? document.getElementById('wizard-exercise-search') : document.getElementById('exercise-search');
      const search = searchInput?.value || '';
      renderExerciseSelector(filter, search);
    });
  });
  
  // Setup search for both modals
  const searchInputs = document.querySelectorAll('#wizard-exercise-search, #exercise-search');
  searchInputs.forEach(searchInput => {
    let searchTimeout;
    searchInput.addEventListener('input', () => {
      clearTimeout(searchTimeout);
      searchTimeout = setTimeout(() => {
        const isWizard = searchInput.id === 'wizard-exercise-search';
        const filter = isWizard 
          ? document.querySelector('#routine-modal .filter-chip.active')?.dataset.category || 'all'
          : document.querySelector('#routine-modal-legacy .filter-chip.active')?.dataset.category || 'all';
        renderExerciseSelector(filter, searchInput.value);
      }, 300);
    });
  });
});