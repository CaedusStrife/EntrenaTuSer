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

/* ==================== UI: LISTAR RUTINAS ==================== */

function getCurrentUser() {
  try { return JSON.parse(localStorage.getItem('entrena-user')); } catch { return null; }
}

async function loadRoutines() {
  const user = getCurrentUser();
  if (!user) return;

  const container = document.getElementById('routines-list');
  if (!container) return;

  container.innerHTML = '<p class="exercise-loading">Cargando rutinas...</p>';

  try {
    const routines = await fetchUserRoutines(user.id);
    renderRoutinesList(routines, user.id);
  } catch (error) {
    container.innerHTML = `<p class="exercise-error">${error.message}</p>`;
  }
}

function renderRoutinesList(routines, userId) {
  const container = document.getElementById('routines-list');
  if (!container) return;

  if (!routines.length) {
    container.innerHTML = `
      <div class="routines-empty-printed">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 11l3 3L22 4"></path><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path></svg>
        <h3>No hay rutinas aún</h3>
        <p>Crea tu primera rutina o pide una al asistente.</p>
        <button class="btn-droplet" onclick="openRoutineModal()"><i data-lucide="plus"></i> Crear rutina</button>
      </div>
    `;
    if (window.lucide) lucide.createIcons();
    return;
  }

  container.innerHTML = routines.map(r => `
    <article class="routine-printed-card" data-routine-id="${r.id}">
      <div class="routine-printed-header">
        <div class="routine-printed-icon">
          <i data-lucide="list-todo"></i>
        </div>
        <div class="routine-printed-meta">
          <span class="routine-printed-difficulty">${getDifficultyLabel(r)}</span>
          <span class="routine-printed-type">${getTypeLabel(r)}</span>
        </div>
      </div>
      <h3 class="routine-printed-title">${escapeHtml(r.name)}</h3>
      ${r.description ? `<p class="routine-printed-description">${escapeHtml(r.description)}</p>` : ''}
      <div class="routine-printed-stats">
        <span class="routine-printed-stat">
          <i data-lucide="clock"></i>
          <span>${calculateTotalMinutes(r)} min</span>
        </span>
        <span class="routine-printed-stat">
          <i data-lucide="check-circle"></i>
          <span>${countExercises(r)} ejercicios</span>
        </span>
        <span class="routine-printed-stat">
          <i data-lucide="calendar"></i>
          <span>${formatDate(r.createdAt)}</span>
        </span>
      </div>
      <div class="routine-printed-actions" style="display:flex;gap:8px;margin-top:16px;padding-top:12px;border-top:1px dashed var(--fiber);">
        <button class="btn-droplet" style="flex:1;min-width:0;" onclick="viewRoutine(${r.id})">
          <i data-lucide="eye"></i> Ver
        </button>
        <button class="btn-droplet" style="flex:1;min-width:0;background:transparent;border-color:var(--fiber);color:var(--ink-muted);" onclick="editRoutine(${r.id})">
          <i data-lucide="edit"></i> Editar
        </button>
        <button class="btn-droplet" style="flex:1;min-width:0;" onclick="startRoutine(${r.id})">
          <i data-lucide="play"></i> Iniciar
        </button>
        <button class="btn-droplet" style="flex:1;min-width:0;background:rgba(255,107,53,0.1);border-color:rgba(255,107,53,0.3);color:var(--pigment-orange);" onclick="confirmDeleteRoutine(${r.id})">
          <i data-lucide="trash-2"></i>
        </button>
      </div>
    </article>
  `).join('');

  if (window.lucide) lucide.createIcons();
}

function getDifficultyLabel(routine) {
  const totalExercises = countExercises(routine);
  if (totalExercises <= 3) return 'Principiante';
  if (totalExercises <= 6) return 'Intermedio';
  return 'Avanzado';
}

function getTypeLabel(routine) {
  // Could be enhanced based on routine properties
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

/* ==================== MODAL CREAR/EDITAR ==================== */

async function openRoutineModal(routineId = null, readOnly = false) {
  currentRoutineId = routineId;
  const modal = document.getElementById('routine-modal');
  const title = document.getElementById('routine-modal-title');
  const form = document.getElementById('routine-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const cancelBtn = form.querySelector('.routine-modal-actions button[type="button"]');
  const personalization = document.getElementById('routine-personalization');

  form.reset();
  document.getElementById('routine-id').value = routineId || '';

  if (readOnly) {
    title.textContent = 'Ver Rutina';
    submitBtn.style.display = 'none';
    cancelBtn.textContent = 'Cerrar';
    personalization.style.display = 'none';
  } else {
    title.textContent = routineId ? 'Editar Rutina' : 'Nueva Rutina';
    submitBtn.style.display = 'inline-flex';
    cancelBtn.textContent = 'Cancelar';
    personalization.style.display = routineId ? 'none' : 'block';
  }

  // Cargar ejercicios disponibles
  await loadExercisesForModal();

  if (routineId) {
    await loadRoutineForEdit(routineId);

    if (readOnly) {
      // Poner todos los campos en solo lectura
      document.getElementById('routine-name').readOnly = true;
      document.getElementById('routine-description').readOnly = true;

      document.querySelectorAll('#routine-exercises select, #routine-exercises input').forEach(el => {
        el.disabled = true;
      });

      // Ocultar botón "Añadir ejercicio"
      const addBtn = document.querySelector('.routine-modal-add-exercise');
      if (addBtn) addBtn.style.display = 'none';
    } else {
      document.getElementById('routine-name').readOnly = false;
      document.getElementById('routine-description').readOnly = false;
      document.querySelectorAll('#routine-exercises select, #routine-exercises input').forEach(el => {
        el.disabled = false;
      });
      const addBtn = document.querySelector('.routine-modal-add-exercise');
      if (addBtn) addBtn.style.display = 'inline-flex';
    }
  } else {
    // Nueva rutina - una fila vacía
    addRoutineExerciseRow();
    document.getElementById('routine-name').readOnly = false;
    document.getElementById('routine-description').readOnly = false;
    document.querySelectorAll('#routine-exercises select, #routine-exercises input').forEach(el => {
      el.disabled = false;
    });
    const addBtn = document.querySelector('.routine-modal-add-exercise');
    if (addBtn) addBtn.style.display = 'inline-flex';
  }

  // Show modal with animation
  modal.classList.add('active');
  // Trigger reflow for animation
  void modal.offsetWidth;
  if (!readOnly) document.getElementById('routine-name').focus();
  if (window.lucide) lucide.createIcons();
}

function getPersonalizationCategory(exercise) {
  const name = exercise.name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (['plancha', 'abdominal', 'crunch', 'escalador', 'torsion'].some(term => name.includes(term))) return 'core';
  if (['estiramiento', 'movilidad', 'cuello', 'hombro', 'torsion', 'alcance', 'inclinacion'].some(term => name.includes(term))) return 'mobility';
  if (['sentadilla', 'zancada', 'fuerza', 'flexion', 'lagartija', 'puente'].some(term => name.includes(term))) return 'strength';
  return 'full';
}

function generatePersonalizedRoutine() {
  if (!allExercises.length) {
    showNotification('No hay ejercicios disponibles para generar la rutina.', 'error');
    return;
  }

  const goal = document.getElementById('personalization-goal').value;
  const level = document.getElementById('personalization-level').value;
  const timeMinutes = Number(document.getElementById('personalization-time').value);
  const levelLimit = { beginner: 60, intermediate: 120, advanced: Number.POSITIVE_INFINITY }[level];
  const maxExercises = { beginner: 4, intermediate: 6, advanced: 8 }[level];
  const budgetSeconds = timeMinutes * 60;

  const candidates = [...allExercises]
    .map((exercise) => {
      const category = getPersonalizationCategory(exercise);
      const duration = Number(exercise.durationSeconds) || 60;
      const goalScore = goal === 'full' || category === goal ? 2 : 0;
      const levelScore = duration <= levelLimit ? 1 : 0;
      return { exercise, duration, score: goalScore + levelScore };
    })
    .sort((a, b) => b.score - a.score || a.duration - b.duration);

  const selected = [];
  let totalSeconds = 0;
  for (const candidate of candidates) {
    if (selected.length >= maxExercises) break;
    if (selected.some(item => item.exercise.id === candidate.exercise.id)) continue;
    if (totalSeconds + candidate.duration > budgetSeconds && selected.length > 0) continue;
    selected.push(candidate);
    totalSeconds += candidate.duration;
  }

  if (!selected.length) {
    showNotification('No hay suficientes ejercicios para ese tiempo disponible.', 'error');
    return;
  }

  document.getElementById('routine-name').value = `Rutina ${goal === 'full' ? 'cuerpo completo' : goal === 'strength' ? 'de fuerza' : goal === 'core' ? 'de core' : 'de movilidad'}`;
  document.getElementById('routine-description').value = `${level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedio' : 'Avanzado'} · ${timeMinutes} minutos`;
  const container = document.getElementById('routine-exercises');
  container.innerHTML = '';
  selected.forEach(({ exercise }) => addRoutineExerciseRow({ exerciseId: exercise.id }));
  showNotification(`Rutina generada con ${selected.length} ejercicios.`, 'success');
}

function closeRoutineModal() {
  const modal = document.getElementById('routine-modal');
  modal.classList.remove('active');

  // Resetear estados de solo lectura
  document.getElementById('routine-name').readOnly = false;
  document.getElementById('routine-description').readOnly = false;
  document.querySelectorAll('#routine-exercises select, #routine-exercises input').forEach(el => {
    el.disabled = false;
  });
  const addBtn = document.querySelector('.routine-modal-add-exercise');
  if (addBtn) addBtn.style.display = 'inline-flex';
  const personalization = document.getElementById('routine-personalization');
  if (personalization) personalization.style.display = 'block';

  const form = document.getElementById('routine-form');
  const submitBtn = form.querySelector('button[type="submit"]');
  const cancelBtn = form.querySelector('.routine-modal-actions button[type="button"]');
  submitBtn.style.display = 'inline-flex';
  cancelBtn.textContent = 'Cancelar';

  currentRoutineId = null;
}

async function loadExercisesForModal() {
  try {
    const res = await fetch(`${API_BASE}/api/exercises`);
    allExercises = await res.json();
  } catch {
    allExercises = [];
  }
}

function addRoutineExerciseRow(exercise = null) {
  const container = document.getElementById('routine-exercises');
  const index = container.children.length + 1;

  const options = allExercises.map(e => `<option value="${e.id}">${escapeHtml(e.name)} (${Math.ceil(e.durationSeconds/60)} min)</option>`).join('');

  const row = document.createElement('div');
  row.className = 'routine-modal-exercise-item';
  row.innerHTML = `
    <div class="routine-modal-exercise-info">
      <span class="routine-modal-exercise-number">${String(index).padStart(2, '0')}</span>
      <div class="routine-modal-exercise-fields">
        <select name="exerciseId" required>
          <option value="">-- Selecciona ejercicio --</option>
          ${options}
        </select>
        <div class="exercise-field-group">
          <label class="field-label">Series</label>
          <input type="number" name="series" value="${exercise?.series || 3}" min="1" max="10" placeholder="3">
        </div>
        <div class="exercise-field-group">
          <label class="field-label">Reps</label>
          <input type="number" name="reps" value="${exercise?.reps || 10}" min="1" max="50" placeholder="10">
        </div>
        <div class="exercise-field-group">
          <label class="field-label">Descanso (s)</label>
          <input type="number" name="rest" value="${exercise?.restSeconds || 60}" min="0" max="300" placeholder="60">
        </div>
      </div>
    </div>
    <button type="button" class="routine-modal-exercise-remove" onclick="this.closest('.routine-modal-exercise-item').remove(); updateExerciseNumbers();" aria-label="Eliminar ejercicio">
      <i data-lucide="trash-2"></i>
    </button>
    <button type="button" class="routine-modal-add-exercise-inline" onclick="addRoutineExerciseRow()" aria-label="Agregar otro ejercicio">
      <i data-lucide="plus"></i> Agregar otro ejercicio
    </button>
  `;

  if (exercise) {
    row.querySelector('select').value = exercise.exerciseId;
  }

  container.appendChild(row);
  updateExerciseNumbers();
  if (window.lucide) lucide.createIcons();
}

function updateExerciseNumbers() {
  const items = document.querySelectorAll('#routine-exercises .routine-modal-exercise-item');
  items.forEach((item, index) => {
    const numberEl = item.querySelector('.routine-modal-exercise-number');
    if (numberEl) {
      numberEl.textContent = String(index + 1).padStart(2, '0');
    }
  });
}

async function loadRoutineForEdit(routineId) {
  try {
    const data = await fetchRoutineDetail(routineId);
    document.getElementById('routine-name').value = data.routine.name;
    document.getElementById('routine-description').value = data.routine.description || '';

    const container = document.getElementById('routine-exercises');
    container.innerHTML = '';

    data.exercises.forEach((ex, idx) => {
      addRoutineExerciseRow({
        exerciseId: ex.exerciseId,
        series: ex.series,
        reps: ex.reps,
        restSeconds: ex.restSeconds
      });
    });
  } catch (error) {
    showNotification('Error cargando rutina: ' + error.message, 'error');
  }
}

/* ==================== GUARDAR RUTINA ==================== */

document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('routine-form');
  if (form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const user = getCurrentUser();
      if (!user) {
        showNotification('Inicia sesión primero.', 'error');
        return;
      }

      const formData = new FormData(form);
      const exerciseItems = document.querySelectorAll('#routine-exercises .routine-modal-exercise-item');

      const exerciseIds = [];
      const series = [];
      const reps = [];
      const restSeconds = [];

      exerciseItems.forEach(item => {
        const select = item.querySelector('select[name="exerciseId"]');
        if (select.value) {
          exerciseIds.push(parseInt(select.value));
          series.push(parseInt(item.querySelector('input[name="series"]').value) || 3);
          reps.push(parseInt(item.querySelector('input[name="reps"]').value) || 10);
          restSeconds.push(parseInt(item.querySelector('input[name="rest"]').value) || 60);
        }
      });

      if (exerciseIds.length === 0) {
        showNotification('Añade al menos un ejercicio.', 'error');
        return;
      }

      const data = {
        userId: user.id,
        name: formData.get('name').trim(),
        description: formData.get('description')?.trim() || null,
        exerciseIds,
        series,
        reps,
        restSeconds
      };

      const submitBtn = form.querySelector('button[type="submit"]');
      submitBtn.disabled = true;
      submitBtn.textContent = 'Guardando...';

      try {
        if (currentRoutineId) {
          await updateRoutine(currentRoutineId, data);
        } else {
          await createRoutine(data);
        }
        closeRoutineModal();
        await loadRoutines();
      } catch (error) {
        showNotification(error.message, 'error');
      } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Guardar rutina';
      }
    });
  }
});

/* ==================== ACCIONES: VER, INICIAR, ELIMINAR ==================== */

async function viewRoutine(routineId) {
  // Abre el modal en modo solo lectura
  await openRoutineModal(routineId, true);
}

async function startRoutine(routineId) {
  try {
    const data = await fetchRoutineDetail(routineId);
    window.resetTrainingSession?.();
    window.activeRoutineId = routineId;
    window.activeRoutineName = data.routine.name;
    
    // Obtener los IDs de ejercicios de la rutina Y su orden
    const routineExercises = data.exercises.map(ex => ({
      exerciseId: ex.exerciseId,
      order: ex.order
    }));
    const routineExerciseIds = routineExercises.map(ex => ex.exerciseId);
    console.log('startRoutine: routineExercises =', routineExercises);
    
    // Esperar a que los ejercicios estén cargados
    console.log('startRoutine: Waiting for exercises to load...');
    await window.exercisesLoadedPromise;
    console.log('startRoutine: Exercises loaded, window.allExercises =', window.allExercises ? window.allExercises.length : 'undefined');
    
    // Cambiar a pestaña de entrenamiento
    console.log('startRoutine: Calling switchTab');
    switchTab('screen-workout', document.querySelector('[onclick*="screen-workout"]'));
    
    // Filtrar y renderizar solo los ejercicios de la rutina directamente
    // (después de switchTab para que el DOM esté listo)
    if (window.renderExercises && window.allExercises) {
      console.log('startRoutine: Calling renderExercises with filter:', routineExerciseIds);
      window.renderExercises(window.allExercises, routineExerciseIds, routineExercises);
      console.log('startRoutine: renderExercises called successfully');
    } else {
      console.error('startRoutine: Missing renderExercises or allExercises');
    }
    
    // Preseleccionar el primer ejercicio de la rutina y hacer scroll al video
    if (data.exercises.length > 0) {
      const firstEx = data.exercises[0];
      console.log('startRoutine: Selecting first exercise:', firstEx.exerciseId);
      
      // Esperar un poco para que el DOM se actualice
      await new Promise(resolve => setTimeout(resolve, 100));
      
      const card = document.querySelector(`[data-exercise-id="${firstEx.exerciseId}"]`);
      if (card) {
        card.click();
        console.log('startRoutine: First exercise card clicked');
        
        // Hacer scroll al panel de video seleccionado
        const selectedPanel = document.getElementById('selected-exercise-panel');
        if (selectedPanel) {
          selectedPanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
          console.log('startRoutine: Scrolled to video panel');
        }
      } else {
        console.warn('startRoutine: First exercise card not found in DOM');
      }
    }
    
  } catch (error) {
    console.error('Error starting routine:', error);
    showNotification('Error al iniciar la rutina: ' + error.message, 'error');
  }
}

function editRoutine(routineId) {
  openRoutineModal(routineId);
}

async function confirmDeleteRoutine(routineId) {
  if (await showConfirmDialog('¿Eliminar esta rutina? No se puede deshacer.')) {
    deleteRoutine(routineId)
      .then(() => loadRoutines())
      .catch(e => showNotification(e.message, 'error'));
  }
}

/* ==================== CHATBOT: GUARDAR RUTINA DESDE IA ==================== */

// Detecta si un mensaje del bot contiene una rutina estructurada
function extractRoutineFromMessage(text) {
  // Busca patrones como: "1. Sentadillas - 3 series x 12 reps"
  const lines = text.split('\n').map(l => l.trim()).filter(Boolean);
  const exercises = [];
  let routineName = 'Rutina del Asistente';
  let description = 'Generada por el asistente IA';

  // Intenta extraer nombre si dice "Rutina: X" o similar
  const nameMatch = text.match(/rutina\s*:?\s*([^\n]+)/i);
  if (nameMatch) routineName = nameMatch[1].trim();

  const exerciseRegex = /(\d+)[\.)\s]+([^-\n]+?)\s*-\s*(\d+)\s*series?\s*[xX×]\s*(\d+)\s*reps?/i;
  const simpleRegex = /(\d+)[\.)\s]+([^\n]+)/;

  lines.forEach(line => {
    const match = line.match(exerciseRegex);
    if (match) {
      exercises.push({
        name: match[2].trim(),
        series: parseInt(match[3]),
        reps: parseInt(match[4]),
        rest: 60
      });
    }
  });

  if (exercises.length === 0) {
    // Intenta formato simple: "1. Sentadillas 3x12"
    lines.forEach(line => {
      const match = line.match(/(\d+)[\.)\s]+([^\d]+)(\d+)\s*[xX×]\s*(\d+)/);
      if (match) {
        exercises.push({
          name: match[2].trim(),
          series: parseInt(match[3]),
          reps: parseInt(match[4]),
          rest: 60
        });
      }
    });
  }

  return exercises.length > 0 ? { name: routineName, description, exercises } : null;
}

// Intenta hacer match con ejercicios de la BD
async function matchExercisesToDB(exercises) {
  if (!allExercises.length) {
    await loadExercisesForModal();
  }
  return exercises.map(ex => {
    const match = allExercises.find(e =>
      e.name.toLowerCase().includes(ex.name.toLowerCase()) ||
      ex.name.toLowerCase().includes(e.name.toLowerCase())
    );
    return {
      ...ex,
      exerciseId: match?.id,
      matched: !!match
    };
  });
}

// Muestra botón "Guardar rutina" en el chat
async function showSaveRoutineButton(messageText, messageElement = null) {
  const routineData = extractRoutineFromMessage(messageText);
  if (!routineData) return;

  const matched = await matchExercisesToDB(routineData.exercises);
  const validExercises = matched.filter(e => e.matched);

  if (validExercises.length === 0) return;

  const messagesContainer = document.getElementById('chatbot-messages');
  const lastBotMsg = messageElement || messagesContainer.querySelector('.bot-message:last-of-type:not(.loading-message)');
  if (!lastBotMsg || lastBotMsg.querySelector('.save-routine-btn')) return;

  const btn = document.createElement('button');
  btn.className = 'save-routine-btn btn btn-sm btn-primary';
  btn.style.marginTop = '8px';
  btn.innerHTML = `<i data-lucide="save"></i> Guardar esta rutina`;
  btn.onclick = () => saveRoutineFromChat(routineData.name, routineData.description, validExercises);
  lastBotMsg.appendChild(btn);
  if (window.lucide) lucide.createIcons();
}

async function saveRoutineFromChat(name, description, exercises) {
  const user = getCurrentUser();
  if (!user) {
    showNotification('Inicia sesión para guardar rutinas.', 'error');
    return;
  }

  const exerciseIds = exercises.map(e => e.exerciseId);
  const series = exercises.map(e => e.series);
  const reps = exercises.map(e => e.reps);
  const rest = exercises.map(e => e.rest);

  try {
    await createRoutine({
      userId: user.id,
      name,
      description,
      exerciseIds,
      series,
      reps,
      restSeconds: rest
    });
    showNotification('¡Rutina guardada! La encontrarás en "Mis Rutinas".', 'success');
    await loadRoutines();
  } catch (error) {
    showNotification('Error guardando: ' + error.message, 'error');
  }
}

/* ==================== EXPORTAR PARA CHATBOT ==================== */

window.routinesModule = {
  loadRoutines,
  openRoutineModal,
  closeRoutineModal,
  showSaveRoutineButton
};

// Cargar rutinas al autenticar
window.addEventListener('user-authenticated', loadRoutines);
document.addEventListener('DOMContentLoaded', () => {
  const user = getCurrentUser();
  if (user) loadRoutines();
});