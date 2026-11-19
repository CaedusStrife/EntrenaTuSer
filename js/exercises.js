const exerciseList = document.getElementById('exercise-list');
const selectedExercisePanel = document.getElementById('selected-exercise-panel');
const selectedExerciseTitle = document.getElementById('selected-exercise-title');
const selectedExerciseDescription = document.getElementById('selected-exercise-description');
const exerciseVideo = document.getElementById('exercise-video');
const getYoutubeIframe = () => document.getElementById('exercise-youtube');
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

window.onYouTubeIframeAPIReady = function () {
  if (!getYoutubeIframe() || !window.YT?.Player) return;
  youtubePlayer = new YT.Player('exercise-youtube', {
    events: {
      onReady: () => {
        youtubePlayerReady = true;
        if (pendingYoutubeId) {
          youtubePlayer.cueVideoById(pendingYoutubeId);
          pendingYoutubeId = null;
        }
      },
      onStateChange: (event) => {
        if (event.data === YT.PlayerState.PLAYING) beginTrainingTimer();
        else if (event.data === YT.PlayerState.PAUSED || event.data === YT.PlayerState.ENDED) pauseTrainingTimer();
      }
    }
  });
};

if (exerciseVideo) {
  exerciseVideo.addEventListener('play', () => beginTrainingTimer());
  exerciseVideo.addEventListener('pause', () => pauseTrainingTimer());
}

function renderExercises(exercises, routineExerciseIds = null, routineExercises = null) {
  if (!exerciseList) return;

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
    
    // Primero: calentamiento antes que todo
    if (catA === 'warmup' && catB !== 'warmup') return -1;
    if (catA !== 'warmup' && catB === 'warmup') return 1;
    
    // Si ambos son calentamiento o ambos no lo son, ordenar por orden de la rutina
    const orderA = orderMap.get(a.id) ?? 999;
    const orderB = orderMap.get(b.id) ?? 999;
    return orderA - orderB;
  });

  const sections = [
    {
      title: 'Calentamiento',
      description: 'Prepara tu cuerpo con movimientos suaves y controlados.',
      exercises: exercisesToRender.filter((exercise) => getExerciseCategory(exercise) === 'warmup')
    },
    {
      title: 'Ejercicios principales',
      description: 'Realiza estos ejercicios para activar y fortalecer tu cuerpo.',
      exercises: exercisesToRender.filter((exercise) => getExerciseCategory(exercise) === 'main')
    },
    {
      title: 'Estiramiento y recuperación',
      description: 'Finaliza la rutina relajando los músculos.',
      exercises: exercisesToRender.filter((exercise) => getExerciseCategory(exercise) === 'recovery')
    }
  ].filter((section) => section.exercises.length > 0);

  const exerciseCount = document.getElementById('exercise-count');
  if (exerciseCount) exerciseCount.textContent = `${exercisesToRender.length} EJERCICIOS`;
  window.trainingExercises = exercisesToRender;

  let exerciseNumber = 0;
  exerciseList.innerHTML = sections.map((section) => `
    <details class="exercise-category-section">
      <summary class="exercise-category-header-printed">
        <h4>${section.title}</h4>
        <span class="exercise-category-count">${section.exercises.length} ${section.exercises.length === 1 ? 'ejercicio' : 'ejercicios'}</span>
      </summary>
      <div class="exercise-category-cards">
        ${section.exercises.map((exercise) => {
          exerciseNumber += 1;
          return `
            <button class="exercise-printed-card" type="button" data-exercise-id="${exercise.id}">
              <span class="exercise-printed-number">${String(exerciseNumber).padStart(2, '0')}</span>
              <div class="exercise-printed-content">
                <strong>${escapeExerciseText(exercise.name)}</strong>
                <div class="exercise-printed-meta">
                  <span class="exercise-category-tag">${section.title}</span>
                  <span>${Math.ceil(exercise.durationSeconds / 60)} min</span>
                </div>
              </div>
            </button>
          `;
        }).join('')}
      </div>
    </details>
  `).join('');

  exerciseList.querySelectorAll('.exercise-printed-card').forEach((card) => {
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
  document.querySelector('.printed-form')?.classList.add('exercise-selected-layout');
  const categorySection = selectedCard.closest('.exercise-category-section');
  if (categorySection) categorySection.open = true;
  exerciseList.querySelectorAll('.exercise-printed-card').forEach((card) => card.classList.remove('selected'));
  selectedCard.classList.add('selected');
  selectedExerciseTitle.textContent = `Video: ${exercise.name}`;
  selectedExerciseDescription.textContent = `${exercise.description}. Observa la postura y repite el ejercicio con movimientos controlados.`;
  selectedExercisePanel.classList.remove('hidden');
  exerciseVideo.loop = true;

  // Preferir el video de YouTube del ejercicio si existe; si no, usar video_url de la API
  const youtubeId = window.EXERCISE_YOUTUBE_VIDEOS?.[exercise.id];
  const youtubeIframe = getYoutubeIframe();
  if (youtubeId && youtubeIframe) {
    exerciseVideo.pause();
    exerciseVideo.removeAttribute('src');
    exerciseVideo.load();
    exerciseVideo.classList.add('hidden');
    youtubeIframe.classList.remove('hidden');
    if (youtubePlayerReady && youtubePlayer?.cueVideoById) {
      youtubePlayer.cueVideoById(youtubeId);
    } else {
      pendingYoutubeId = youtubeId;
      youtubeIframe.src = `https://www.youtube.com/embed/${youtubeId}?rel=0&enablejsapi=1`;
    }
  } else {
    if (youtubeIframe) {
      if (youtubePlayerReady && youtubePlayer?.stopVideo) {
        youtubePlayer.stopVideo();
      }
      youtubeIframe.classList.add('hidden');
    }
    exerciseVideo.classList.remove('hidden');
    if (exercise.videoUrl) {
      // Use absolute URL for video (prepend API base URL if relative)
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
  selectedExercisePanel.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

function closeSelectedExercise() {
  stopTrainingTimer();
  stopTrainingRest();
  exerciseVideo.pause();
  exerciseVideo.removeAttribute('src');
  exerciseVideo.load();
  const youtubeIframe = getYoutubeIframe();
  if (youtubeIframe) {
    if (youtubePlayerReady && youtubePlayer?.stopVideo) {
      youtubePlayer.stopVideo();
    }
    youtubeIframe.classList.add('hidden');
  }
  exerciseVideo.classList.remove('hidden');
  selectedExercisePanel.classList.add('hidden');
  document.querySelector('.printed-form')?.classList.remove('exercise-selected-layout');
  exerciseList.querySelectorAll('.exercise-printed-card').forEach((card) => card.classList.remove('selected'));
  window.selectedExercise = null;
  if (trainingControls) trainingControls.classList.add('hidden');
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
      showNotification('Tiempo completado. Puedes marcar el ejercicio como terminado.', 'success');
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

function startTrainingRest() {
  const restSeconds = Number(trainingRestSelect?.value || 0);
  if (!Number.isInteger(restSeconds) || restSeconds <= 0) return;

  stopTrainingTimer();
  stopTrainingRest();
  trainingRestSecondsRemaining = restSeconds;
  trainingRestSkipButton?.classList.remove('hidden');
  trainingPhase.textContent = 'Descanso';
  trainingPauseButton.disabled = true;
  updateTrainingRestUI();
  trainingRestTimerId = window.setInterval(() => {
    trainingRestSecondsRemaining -= 1;
    updateTrainingRestUI();
    if (trainingRestSecondsRemaining <= 0) {
      stopTrainingRest();
      trainingPauseButton.disabled = false;
      trainingPhase.textContent = 'Listo para el siguiente ejercicio';
      trainingTimer.textContent = '00:00';
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
      return exercises;
    } catch (error) {
      if (attempt === 4) {
        exerciseList.innerHTML = `<p class="exercise-error">No se pudieron cargar los ejercicios. Comprueba que la API esté iniciada en ${apiBaseUrl} y recarga la página.</p>`;
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
