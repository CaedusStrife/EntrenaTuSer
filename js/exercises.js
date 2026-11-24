const exerciseList = document.getElementById('exercise-list');
const selectedExercisePanel = document.getElementById('selected-exercise-panel');
const selectedExerciseTitle = document.getElementById('selected-exercise-title');
const selectedExerciseDescription = document.getElementById('selected-exercise-description');
const exerciseVideo = document.getElementById('exercise-video');
const getYoutubeContainer = () => document.getElementById('exercise-youtube');
const trainingControls = document.getElementById('training-controls');
const trainingProgressLabel = document.getElementById('training-progress-label');
const trainingTimer = document.getElementById('training-timer');
const trainingPhase = document.getElementById('training-phase');
const trainingProgressBar = document.getElementById('training-progress-bar');
const trainingProgressTrack = document.querySelector('.training-progress-track');
const trainingPauseButton = document.getElementById('training-pause');
const trainingPreviousButton = document.getElementById('training-previous');
const trainingNextButton = document.getElementById('training-next');
const trainingRestSelect = document.getElementById('training-rest');
const trainingRestSkipButton = document.getElementById('training-rest-skip');
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
  if (!window.YT?.Player || !getYoutubeContainer()) return false;
  if (youtubePlayer) {
    if (youtubePlayerReady) {
      youtubePlayer.cueVideoById(youtubeId);
    } else {
      pendingYoutubeId = youtubeId;
    }
    return true;
  }
  youtubePlayer = new YT.Player('exercise-youtube', {
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

if (exerciseVideo) {
  exerciseVideo.addEventListener('play', () => beginTrainingTimer());
  exerciseVideo.addEventListener('pause', () => pauseTrainingTimer());
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

  // Ordenar: primero calentamiento (warmup), luego por orden de la rutina
  exercisesToRender.sort((a, b) => {
    const catA = getExerciseCategory(a);
    const catB = getExerciseCategory(b);
    
    if (catA === 'warmup' && catB !== 'warmup') return -1;
    if (catA !== 'warmup' && catB === 'warmup') return 1;
    
    const orderA = orderMap.get(a.id) ?? 999;
    const orderB = orderMap.get(b.id) ?? 999;
    return orderA - orderB;
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

  // Render as flat grid of exercise-card (new Hoja de Identidad structure)
  let exerciseNumber = 0;
  listEl.innerHTML = exercisesToRender.map((exercise) => {
    exerciseNumber += 1;
    const category = getExerciseCategory(exercise);
    const categoryLabels = { warmup: 'Calentamiento', main: 'Principal', recovery: 'Recuperación' };
    return `
      <article class="exercise-card" data-exercise-id="${exercise.id}" data-category="${category}">
        <header class="exercise-card-header">
          <span class="exercise-card-number">${String(exerciseNumber).padStart(2, '0')}</span>
          <span class="exercise-card-category">${categoryLabels[category]}</span>
        </header>
        <h3>${escapeExerciseText(exercise.name)}</h3>
        <div class="exercise-card-meta">
          <span><i data-lucide="clock" aria-hidden="true"></i> ${Math.ceil(exercise.durationSeconds / 60)} min</span>
          ${exercise.points ? `<span><i data-lucide="star" aria-hidden="true"></i> ${exercise.points} pts</span>` : ''}
        </div>
      </article>
    `;
  }).join('');

  // Initialize lucide icons for new cards
  if (typeof lucide !== 'undefined') lucide.createIcons();

  // Add click handlers
  listEl.querySelectorAll('.exercise-card').forEach((card) => {
    const exercise = exercisesToRender.find((item) => String(item.id) === card.dataset.exerciseId);
    card.addEventListener('click', () => selectExercise(exercise, card));
  });
}

// Exponer globalmente para que pueda ser llamada desde routines.js
window.renderExercises = renderExercises;

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
  const youtubeContainer = getYoutubeContainer();
  if (youtubeId && youtubeContainer) {
    exerciseVideo.pause();
    exerciseVideo.removeAttribute('src');
    exerciseVideo.load();
    exerciseVideo.classList.add('hidden');
    youtubeContainer.classList.remove('hidden');
    if (!ensureYoutubePlayer(youtubeId)) {
      pendingYoutubeId = youtubeId;
    }
  } else {
    if (youtubeContainer) {
      if (youtubePlayerReady && youtubePlayer?.stopVideo) {
        youtubePlayer.stopVideo();
      }
      youtubeContainer.classList.add('hidden');
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
  const youtubeContainer = getYoutubeContainer();
  if (youtubeContainer) {
    if (youtubePlayerReady && youtubePlayer?.stopVideo) {
      youtubePlayer.stopVideo();
    }
    youtubeContainer.classList.add('hidden');
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

// Promise that resolves when exercises are loaded
window.exercisesLoadedPromise = (async function() {
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
        exerciseList.innerHTML = `<p class="exercise-error">No se pudieron cargar los ejercicios. Comprueba que la API esté iniciada en ${apiBaseUrl} y recarga la página.</p>`;
        if (window.workoutStateMachine) {
          window.workoutStateMachine.initialize([]);
        }
        return [];
      }

      await new Promise((resolve) => window.setTimeout(resolve, 1000));
    }
  }
})();

async function loadExercises() {
  return window.exercisesLoadedPromise;
}

// Iniciar carga de ejercicios al cargar el módulo
loadExercises();
