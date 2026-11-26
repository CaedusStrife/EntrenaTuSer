// Cache DOM elements - will be populated after DOM is ready
let exerciseList = null;
let selectedExercisePanel = null;
let selectedExerciseTitle = null;
let selectedExerciseDescription = null;
let exerciseVideo = null;
let getYoutubeWrapper = () => document.getElementById('exercise-youtube-wrapper');
let getYoutubePlayerEl = () => document.getElementById('exercise-youtube-player');
let trainingControls = null;
let trainingProgressLabel = null;
let trainingTimer = null;
let trainingPhase = null;
let trainingProgressBar = null;
let trainingProgressTrack = null;
let trainingPauseButton = null;
let trainingPreviousButton = null;
let trainingNextButton = null;
let trainingRestSelect = null;
let trainingRestSkipButton = null;

const apiBaseUrl = window.API_BASE_URL || 'http://localhost:5143';
const exercisesEndpoint = `${apiBaseUrl}/api/exercises`;
let trainingTimerId = null;
let trainingSecondsRemaining = 0;
let trainingIsPaused = false;
let trainingTimerStarted = false;
let trainingRestTimerId = null;
let trainingRestSecondsRemaining = 0;
let trainingSession = null;
let youtubePlayer = null;
let youtubePlayerReady = false;
let pendingYoutubeId = null;

function handleYoutubeStateChange(event) {
  if (event.data === YT.PlayerState.PLAYING) beginTrainingTimer();
  else if (event.data === YT.PlayerState.PAUSED) pauseTrainingTimer();
  else if (event.data === YT.PlayerState.ENDED) {
    if (youtubePlayer?.seekTo && youtubePlayer?.playVideo) {
      youtubePlayer.seekTo(0, true);
      youtubePlayer.playVideo();
    }
  }
}

function ensureYoutubePlayer(youtubeId) {
  const playerEl = getYoutubePlayerEl();
  if (!window.YT?.Player || !playerEl) return false;
  if (youtubePlayer) {
    if (youtubePlayerReady) {
      youtubePlayer.cueVideoById(youtubeId);
    } else {
      pendingYoutubeId = youtubeId;
    }
    return true;
  }
  youtubePlayer = new YT.Player(playerEl, {
    videoId: youtubeId,
    playerVars: { rel: 0 },
    events: {
      onReady: () => {
        youtubePlayerReady = true;
        if (pendingYoutubeId) {
          youtubePlayer.cueVideoById(pendingYoutubeId);
          pendingYoutubeId = null;
        }
      },
      onStateChange: handleYoutubeStateChange
    }
  });
  return true;
}

window.onYouTubeIframeAPIReady = function () {
  if (pendingYoutubeId) {
    const id = pendingYoutubeId;
    pendingYoutubeId = null;
    ensureYoutubePlayer(id);
  }
};

// Initialize exercises module after DOM is ready
function initExercises() {
  exerciseList = document.getElementById('exercise-list');
  selectedExercisePanel = document.getElementById('selected-exercise-panel');
  selectedExerciseTitle = document.getElementById('selected-exercise-title');
  selectedExerciseDescription = document.getElementById('selected-exercise-description');
  exerciseVideo = document.getElementById('exercise-video');
  trainingControls = document.getElementById('training-controls');
  trainingProgressLabel = document.getElementById('training-progress-label');
  trainingTimer = document.getElementById('training-timer');
  trainingPhase = document.getElementById('training-phase');
  trainingProgressBar = document.getElementById('training-progress-bar');
  trainingProgressTrack = document.querySelector('.training-progress-track');
  trainingPauseButton = document.getElementById('training-pause');
  trainingPreviousButton = document.getElementById('training-previous');
  trainingNextButton = document.getElementById('training-next');
  trainingRestSelect = document.getElementById('training-rest');
  trainingRestSkipButton = document.getElementById('training-rest-skip');

  if (exerciseVideo) {
    exerciseVideo.addEventListener('play', () => beginTrainingTimer());
    exerciseVideo.addEventListener('pause', () => pauseTrainingTimer());
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initExercises);
} else {
  initExercises();
}

function renderExercises(exercises, routineExerciseIds = null, routineExercises = null) {
  const listEl = document.getElementById('exercise-list');
  const emptyEl = document.getElementById('exercise-empty-state');
  const loadingEl = listEl?.querySelector('.skeleton');
  
  if (!listEl) return;

  // Clear loading skeletons
  if (loadingEl) loadingEl.remove();
  listEl.querySelectorAll('.skeleton').forEach(el => el.remove());

  // Si se proporciona routineExerciseIds, filtrar solo esos ejercicios
  let exercisesToRender = exercises;
  if (routineExerciseIds && routineExerciseIds.length > 0) {
    exercisesToRender = exercises.filter(ex => routineExerciseIds.includes(ex.id));
  }

  const getExerciseCategory = (exercise) => {
    const name = exercise.name.toLowerCase();
    if (['estiramiento', 'extensión de cadera', 'elevación de talones'].some((term) => name.includes(term))) {
      return 'recovery';
    }
    if (['cuello', 'hombros', 'torsión', 'alcance de brazos', 'inclinación lateral'].some((term) => name.includes(term))) {
      return 'warmup';
    }
    return 'main';
  };

  // Si se proporciona routineExercises con orden, crear mapa de orden
  const orderMap = new Map();
  if (routineExercises && routineExercises.length > 0) {
    routineExercises.forEach(re => orderMap.set(re.exerciseId, re.order));
  }

  // Ordenar: primero calentamiento (warmup), luego principal, luego recuperación
  const categoryOrder = { warmup: 0, main: 1, recovery: 2 };
  exercisesToRender.sort((a, b) => {
    const catA = getExerciseCategory(a);
    const catB = getExerciseCategory(b);
    const orderA = categoryOrder[catA] ?? 999;
    const orderB = categoryOrder[catB] ?? 999;
    if (orderA !== orderB) return orderA - orderB;
    
    const routineOrderA = orderMap.get(a.id) ?? 999;
    const routineOrderB = orderMap.get(b.id) ?? 999;
    return routineOrderA - routineOrderB;
  });

  const exerciseCount = document.getElementById('exercise-count');
  if (exerciseCount) exerciseCount.textContent = `${exercisesToRender.length} EJERCICIOS`;
  window.trainingExercises = exercisesToRender;

  // Empty state
  if (exercisesToRender.length === 0) {
    listEl.innerHTML = '';
    if (emptyEl) emptyEl.classList.remove('hidden');
    return;
  }
  if (emptyEl) emptyEl.classList.add('hidden');

  // Group exercises by category
  const categories = {
    warmup: { label: 'Calentamiento', icon: 'sunrise', color: 'var(--color-amber)' },
    main: { label: 'Principal', icon: 'dumbbell', color: 'var(--color-sage)' },
    recovery: { label: 'Recuperación', icon: 'leaf', color: 'var(--color-sienna)' }
  };

  // Build categorized HTML
  let exerciseNumber = 0;
  let html = '';
  
  Object.entries(categories).forEach(([catKey, catInfo]) => {
    const catExercises = exercisesToRender.filter(ex => getExerciseCategory(ex) === catKey);
    if (catExercises.length === 0) return;
    
    html += `
      <section class="exercise-category-section" data-category="${catKey}">
        <header class="exercise-category-header">
          <div class="exercise-category-icon" style="color: ${catInfo.color};">
            <i data-lucide="${catInfo.icon}" aria-hidden="true"></i>
          </div>
          <h2 class="exercise-category-title">${catInfo.label}</h2>
          <span class="exercise-category-count">${catExercises.length} ejercicios</span>
          <div class="exercise-category-toggle" aria-label="Expandir/Colapsar">
            <i data-lucide="chevron-down" aria-hidden="true"></i>
          </div>
        </header>
        <div class="exercise-category-grid" role="list">
    `;
    
    catExercises.forEach((exercise) => {
      exerciseNumber += 1;
      html += `
        <article class="exercise-card" data-exercise-id="${exercise.id}" data-category="${catKey}" role="listitem">
          <header class="exercise-card-header">
            <span class="exercise-card-number">${String(exerciseNumber).padStart(2, '0')}</span>
            <span class="exercise-card-category">${catInfo.label}</span>
          </header>
          <h3>${escapeExerciseText(exercise.name)}</h3>
          <div class="exercise-card-meta">
            <span><i data-lucide="clock" aria-hidden="true"></i> ${Math.ceil(exercise.durationSeconds / 60)} min</span>
            ${exercise.points ? `<span><i data-lucide="star" aria-hidden="true"></i> ${exercise.points} pts</span>` : ''}
          </div>
        </article>
      `;
    });
    
    html += `
        </div>
      </section>
    `;
  });
  
  listEl.innerHTML = html;

  // Initialize lucide icons for new cards
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Add click handlers for exercise cards
  listEl.querySelectorAll('.exercise-card').forEach((card) => {
    const exercise = exercisesToRender.find((item) => String(item.id) === card.dataset.exerciseId);
    card.addEventListener('click', () => selectExercise(exercise, card));
  });

  // Add click handlers for category headers (collapsible)
  listEl.querySelectorAll('.exercise-category-header').forEach((header) => {
    header.addEventListener('click', (e) => {
      // Don't toggle if clicking on the toggle icon itself (event bubbles)
      const section = header.closest('.exercise-category-section');
      if (section) {
        section.classList.toggle('open');
      }
    });
  });

  // Open first category by default
  const firstSection = listEl.querySelector('.exercise-category-section');
  if (firstSection) firstSection.classList.add('open');
}

// Exponer globalmente para que pueda ser llamada desde routines.js
window.renderExercises = renderExercises;

// Initialize workout screen buttons (called once on module load)
function initWorkoutButtons() {
  const changeRoutineBtn = document.getElementById('workout-change-routine');
  if (changeRoutineBtn && !changeRoutineBtn.dataset.handlerAttached) {
    changeRoutineBtn.addEventListener('click', () => {
      if (typeof window.openRoutineModal === 'function') {
        window.openRoutineModal();
      }
    });
    changeRoutineBtn.dataset.handlerAttached = 'true';
  }
}

// Run on DOM ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorkoutButtons);
} else {
  initWorkoutButtons();
}

function escapeExerciseText(value) {
  const element = document.createElement('span');
  element.textContent = value;
  return element.innerHTML;
}

function selectExercise(exercise, selectedCard) {
  if (!trainingSession) {
    trainingSession = {
      routineId: window.activeRoutineId || null,
      routineName: window.activeRoutineName || 'Entrenamiento libre',
      startedAt: Date.now(),
      completedIds: new Set(),
      minutes: 0,
      points: 0
    };
  }
  window.selectedExercise = exercise;
  const exerciseIndex = window.trainingExercises.findIndex((item) => item.id === exercise.id);
  window.trainingExerciseIndex = exerciseIndex >= 0 ? exerciseIndex : 0;

  // New Hoja de Identidad state management - use .active class for workout-state
  const selectionState = document.getElementById('exercise-selection-state');
  const activeState = document.getElementById('exercise-active-state');
  
  if (selectionState) {
    selectionState.classList.remove('active');
    selectionState.classList.add('hidden');
  }
  if (activeState) {
    activeState.classList.remove('hidden');
    activeState.classList.add('active');
  }

  // Update selected card
  document.querySelectorAll('.exercise-card').forEach((card) => card.classList.remove('selected'));
  selectedCard.classList.add('selected');

  // Update video panel
  const videoTitle = document.getElementById('selected-exercise-title');
  const videoDesc = document.getElementById('selected-exercise-description');
  if (videoTitle) videoTitle.textContent = `Video: ${exercise.name}`;
  if (videoDesc) videoDesc.textContent = `${exercise.description}. Observa la postura y repite el ejercicio con movimientos controlados.`;

  // Show video panel
  const panel = document.getElementById('selected-exercise-panel');
  if (panel) panel.classList.remove('hidden');
  exerciseVideo.loop = true;

  // Preferir el video de YouTube del ejercicio si existe; si no, usar video_url de la API
  const youtubeId = window.EXERCISE_YOUTUBE_VIDEOS?.[exercise.id];
  const youtubeWrapper = getYoutubeWrapper();
  if (youtubeId && youtubeWrapper) {
    exerciseVideo.pause();
    exerciseVideo.removeAttribute('src');
    exerciseVideo.load();
    exerciseVideo.classList.add('hidden');
    youtubeWrapper.classList.remove('hidden');
    youtubeWrapper.style.display = ''; // Remove inline display:none
    if (!ensureYoutubePlayer(youtubeId)) {
      pendingYoutubeId = youtubeId;
    }
  } else {
    if (youtubeWrapper) {
      if (youtubePlayerReady && youtubePlayer?.stopVideo) {
        youtubePlayer.stopVideo();
      }
      youtubeWrapper.classList.add('hidden');
      youtubeWrapper.style.display = 'none';
    }
    exerciseVideo.classList.remove('hidden');
    if (exercise.videoUrl) {
      const videoUrl = exercise.videoUrl.startsWith('http')
        ? exercise.videoUrl
        : `${window.API_BASE_URL || 'http://localhost:5143'}${exercise.videoUrl}`;
      exerciseVideo.src = videoUrl;
      exerciseVideo.poster = 'images/video-entrenamiento.svg';
    } else {
      exerciseVideo.removeAttribute('src');
      exerciseVideo.poster = 'images/video-entrenamiento.svg';
    }
    exerciseVideo.currentTime = 0;
    exerciseVideo.load();
  }
  startTrainingTimer(exercise);
  
  // Update routine badge in hero
  const badge = document.getElementById('workout-routine-badge');
  if (badge && window.activeRoutineName) {
    badge.textContent = window.activeRoutineName;
    badge.classList.remove('hidden');
  }
  
  if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeSelectedExercise() {
  stopTrainingTimer();
  stopTrainingRest();
  exerciseVideo.pause();
  exerciseVideo.removeAttribute('src');
  exerciseVideo.load();
  const youtubeWrapper = getYoutubeWrapper();
  if (youtubeWrapper) {
    if (youtubePlayerReady && youtubePlayer?.stopVideo) {
      youtubePlayer.stopVideo();
    }
    youtubeWrapper.classList.add('hidden');
    youtubeWrapper.style.display = 'none';
  }
  exerciseVideo.classList.remove('hidden');
  
  // Hide active state, show selection state - use .active class for workout-state
  const activeState = document.getElementById('exercise-active-state');
  const selectionState = document.getElementById('exercise-selection-state');
  const panel = document.getElementById('selected-exercise-panel');
  
  if (panel) panel.classList.add('hidden');
  if (activeState) {
    activeState.classList.remove('active');
    activeState.classList.add('hidden');
  }
  if (selectionState) {
    selectionState.classList.remove('hidden');
    selectionState.classList.add('active');
  }
  
  document.querySelectorAll('.exercise-card').forEach((card) => card.classList.remove('selected'));
  window.selectedExercise = null;
  
  const controls = document.getElementById('training-controls');
  if (controls) controls.classList.add('hidden');
  
  // Hide rest overlay
  const restOverlay = document.getElementById('training-rest-overlay');
  if (restOverlay) restOverlay.classList.add('hidden');
  
  // Hide routine badge
  const badge = document.getElementById('workout-routine-badge');
  if (badge) badge.classList.add('hidden');
}

function startTrainingTimer(exercise) {
  stopTrainingTimer();
  trainingPauseButton.disabled = false;
  if (!trainingControls || !exercise) return;
  trainingControls.classList.remove('hidden');
  trainingSecondsRemaining = Math.max(1, Number(exercise.durationSeconds) || 1);
  trainingIsPaused = false;
  trainingTimerStarted = false;
  updateTrainingTimerUI(exercise);
  trainingPhase.textContent = 'Reproduce el video para comenzar';
}

function beginTrainingTimer() {
  const exercise = window.selectedExercise;
  if (!exercise || trainingSecondsRemaining <= 0) return;
  if (trainingTimerStarted) {
    trainingIsPaused = false;
    updateTrainingTimerUI(exercise);
    return;
  }
  trainingTimerStarted = true;
  trainingIsPaused = false;
  updateTrainingTimerUI(exercise);
  trainingTimerId = window.setInterval(() => {
    if (trainingIsPaused) return;
    trainingSecondsRemaining -= 1;
    updateTrainingTimerUI(exercise);
    if (trainingSecondsRemaining <= 0) {
      stopTrainingTimer();
      trainingPhase.textContent = 'Tiempo completado';
      trainingPauseButton.textContent = 'Repetir';
      if (!trainingSession?.completedIds.has(exercise.id)) {
        completeSelectedExercise();
      }
    }
  }, 1000);
}

function pauseTrainingTimer() {
  if (!trainingTimerStarted || trainingSecondsRemaining <= 0) return;
  trainingIsPaused = true;
  if (window.selectedExercise) updateTrainingTimerUI(window.selectedExercise);
}

function stopTrainingTimer() {
  if (trainingTimerId !== null) {
    window.clearInterval(trainingTimerId);
    trainingTimerId = null;
  }
}

function stopTrainingRest() {
  if (trainingRestTimerId !== null) {
    window.clearInterval(trainingRestTimerId);
    trainingRestTimerId = null;
  }
  trainingRestSecondsRemaining = 0;
  trainingRestSkipButton?.classList.add('hidden');
}

function startTrainingRest(nextExercise = null) {
  const restSeconds = Number(trainingRestSelect?.value || 0);
  if (!Number.isInteger(restSeconds) || restSeconds <= 0) {
    // No rest configured, move directly to next exercise
    if (nextExercise) {
      selectExerciseByIndex(window.trainingExerciseIndex + 1);
    }
    return;
  }

  stopTrainingTimer();
  stopTrainingRest();
  trainingRestSecondsRemaining = restSeconds;
  trainingRestSkipButton?.classList.remove('hidden');
  trainingPhase.textContent = 'Descanso';
  trainingPauseButton.disabled = true;
  updateTrainingRestUI();
  
  // Show rest overlay (new Hoja de Identidad UI)
  const restOverlay = document.getElementById('training-rest-overlay');
  const restCountdown = document.getElementById('rest-countdown');
  const restNextName = document.getElementById('rest-next-name');
  
  if (restOverlay) restOverlay.classList.remove('hidden');
  if (restCountdown) restCountdown.textContent = `${String(Math.floor(restSeconds/60)).padStart(2,'0')}:${String(restSeconds%60).padStart(2,'0')}`;
  if (restNextName && nextExercise) restNextName.textContent = nextExercise.name;
  
  trainingRestTimerId = window.setInterval(() => {
    trainingRestSecondsRemaining -= 1;
    updateTrainingRestUI();
    if (restCountdown) restCountdown.textContent = `${String(Math.floor(trainingRestSecondsRemaining/60)).padStart(2,'0')}:${String(trainingRestSecondsRemaining%60).padStart(2,'0')}`;
    
    if (trainingRestSecondsRemaining <= 0) {
      stopTrainingRest();
      trainingPauseButton.disabled = false;
      trainingPhase.textContent = 'Listo para el siguiente ejercicio';
      trainingTimer.textContent = '00:00';
      if (restOverlay) restOverlay.classList.add('hidden');
      if (nextExercise) {
        selectExerciseByIndex(window.trainingExerciseIndex + 1);
      }
    }
  }, 1000);
}

function updateTrainingRestUI() {
  const minutes = Math.floor(trainingRestSecondsRemaining / 60);
  const seconds = trainingRestSecondsRemaining % 60;
  trainingTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  trainingProgressBar.style.width = '0%';
  trainingProgressTrack.setAttribute('aria-valuenow', '0');
}

function skipTrainingRest() {
  if (trainingRestTimerId === null) return;
  stopTrainingRest();
  trainingPauseButton.disabled = false;
  trainingPhase.textContent = 'Listo para el siguiente ejercicio';
  trainingTimer.textContent = '00:00';
  
  // Hide rest overlay
  const restOverlay = document.getElementById('training-rest-overlay');
  if (restOverlay) restOverlay.classList.add('hidden');
  
  // Move to next exercise
  selectExerciseByIndex(window.trainingExerciseIndex + 1);
}

function updateTrainingTimerUI(exercise) {
  const totalSeconds = Math.max(1, Number(exercise.durationSeconds) || 1);
  const elapsed = Math.max(0, totalSeconds - trainingSecondsRemaining);
  const percentage = Math.min(100, Math.round((elapsed / totalSeconds) * 100));
  const minutes = Math.floor(trainingSecondsRemaining / 60);
  const seconds = trainingSecondsRemaining % 60;
  trainingTimer.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  trainingProgressBar.style.width = `${percentage}%`;
  trainingProgressTrack.setAttribute('aria-valuenow', String(percentage));
  trainingProgressLabel.textContent = `Ejercicio ${(window.trainingExerciseIndex || 0) + 1} de ${window.trainingExercises.length}`;
  trainingPhase.textContent = !trainingTimerStarted ? 'Reproduce el video para comenzar' : (trainingIsPaused ? 'Pausado' : 'En progreso');
  trainingPauseButton.textContent = trainingIsPaused ? 'Continuar' : 'Pausar';
  trainingPreviousButton.disabled = window.trainingExerciseIndex <= 0;
  trainingNextButton.disabled = window.trainingExerciseIndex >= window.trainingExercises.length - 1;
}

function toggleTrainingTimer() {
  if (!window.selectedExercise) return;
  if (trainingSecondsRemaining <= 0) {
    startTrainingTimer(window.selectedExercise);
    return;
  }
  if (!trainingTimerStarted) {
    showNotification('Reproduce el video para iniciar el contador.', 'info');
    return;
  }
  trainingIsPaused = !trainingIsPaused;
  updateTrainingTimerUI(window.selectedExercise);
}

function selectExerciseByIndex(index) {
  const exercise = window.trainingExercises[index];
  if (!exercise) return;
  const card = exerciseList.querySelector(`[data-exercise-id="${exercise.id}"]`);
  if (card) card.click();
}

function selectPreviousExercise() {
  selectExerciseByIndex(window.trainingExerciseIndex - 1);
}

function selectNextExercise() {
  selectExerciseByIndex(window.trainingExerciseIndex + 1);
}

function finishTraining() {
  const session = trainingSession;
  const completedCount = session?.completedIds.size || 0;
  const totalCount = window.trainingExercises?.length || 0;
  const durationMinutes = session
    ? Math.max(1, Math.round((Date.now() - session.startedAt) / 60000))
    : 0;
  
  // Stop all timers
  stopTrainingTimer();
  stopTrainingRest();
  
  // Hide rest overlay
  const restOverlay = document.getElementById('training-rest-overlay');
  if (restOverlay) restOverlay.classList.add('hidden');
  
  closeSelectedExercise();
  if (session && completedCount > 0) {
    if (window.showWorkoutSummary) {
      window.showWorkoutSummary({
        routineName: session.routineName,
        completedCount,
        totalCount,
        minutes: durationMinutes,
        points: session.points
      });
    } else {
      showNotification(`${session.routineName} finalizada.`, 'success');
    }
  } else {
    showNotification('Entrenamiento finalizado sin ejercicios completados.', 'info');
  }
  trainingSession = null;
  window.activeRoutineId = null;
  window.activeRoutineName = null;
}

window.resetTrainingSession = () => {
  trainingSession = null;
};

async function completeSelectedExercise() {
  const user = getCurrentUser();
  const exercise = window.selectedExercise;
  if (!user || !exercise) {
    showNotification('Inicia sesión y selecciona un ejercicio.', 'error');
    return;
  }
  if (trainingSession?.completedIds.has(exercise.id)) {
    showNotification('Este ejercicio ya fue registrado en la sesión actual.', 'info');
    return;
  }

  try {
    const response = await window.apiFetch(`${window.API_BASE_URL}/api/progress/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: user.id,
        exerciseId: exercise.id,
        durationSeconds: exercise.durationSeconds,
        routineId: window.activeRoutineId || null
      })
    });
    const result = await response.json().catch(() => ({}));
    if (!response.ok) {
      throw new Error(result.message || 'No se pudo guardar el ejercicio completado.');
    }

    exerciseVideo.pause();
    if (youtubePlayerReady && youtubePlayer?.stopVideo) {
      youtubePlayer.stopVideo();
    }
    stopTrainingTimer();
    trainingPhase.textContent = 'Ejercicio completado';
    if (trainingSession && !trainingSession.completedIds.has(exercise.id)) {
      trainingSession.completedIds.add(exercise.id);
      trainingSession.minutes += Number(result.minutes || 0);
      trainingSession.points += Number(result.points || 0);
    }
    await loadProgress();
    const completedCount = trainingSession?.completedIds.size || 1;
    showNotification(`Ejercicio completado (${completedCount}/${window.trainingExercises.length}). Sumaste ${result.minutes} minuto(s) y ${result.points} puntos.`, 'success');
    startTrainingRest();
  } catch (error) {
    showNotification(error.message, 'error');
  }
}

// Expose globally for inline onclick handlers
window.completeSelectedExercise = completeSelectedExercise;
window.selectPreviousExercise = selectPreviousExercise;
window.selectNextExercise = selectNextExercise;
window.toggleTrainingTimer = toggleTrainingTimer;
window.finishTraining = finishTraining;
window.closeSelectedExercise = closeSelectedExercise;

// Load exercises when DOM is ready
async function loadExercises() {
  if (!exerciseList) return;

  for (let attempt = 0; attempt < 5; attempt += 1) {
    try {
      const response = await fetch(exercisesEndpoint);
      if (!response.ok) throw new Error(`La API respondió con ${response.status}.`);
      const exercises = await response.json();
      if (!Array.isArray(exercises)) throw new Error('La respuesta de la API no es válida.');
      // Guardar en variable global para acceso posterior
      window.allExercises = exercises;
      renderExercises(exercises);
      
      // Initialize workout state machine
      if (window.workoutStateMachine) {
        window.workoutStateMachine.initialize(exercises);
      }
      
      return exercises;
    } catch (error) {
      if (attempt === 4) {
        if (exerciseList) {
          exerciseList.innerHTML = `<p class="exercise-error">No se pudieron cargar los ejercicios. Comprueba que la API esté iniciada en ${apiBaseUrl} y recarga la página.</p>`;
        }
        if (window.workoutStateMachine) {
          window.workoutStateMachine.initialize([]);
        }
        return [];
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1000));
    }
  }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', loadExercises);
} else {
  loadExercises();
}
