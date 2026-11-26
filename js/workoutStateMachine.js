// workoutStateMachine.js

/**
 * Manages the state and flow of a single workout session.
 * Wraps and orchestrates the existing exercises.js logic.
 * v2 - DOMContentLoaded fix
 */
class WorkoutStateMachine {
    constructor() {
        this.state = 'IDLE'; // IDLE, SELECTION, ACTIVE, RESTING, FINISHED
        this.currentExercise = null;
        this.currentExerciseIndex = 0;
        this.totalExercises = [];
        this.routineExercises = [];
        this.session = window.trainingSession || null;
    }

    initialize(exercises, routineIds = null, routineExercises = null) {
        this.totalExercises = exercises;
        this.routineExercises = routineExercises || [];
        this.currentExerciseIndex = routineExercises && routineIds ? routineExercises.findIndex(re => re.exerciseId === routineIds[0]) : 0;
        
        if (this.totalExercises.length > 0) {
            this.state = 'SELECTION';
            // Delegates to existing renderExercises (global from exercises.js)
            if (window.renderExercises) window.renderExercises(exercises, routineIds, routineExercises);
            console.log('WorkoutStateMachine initialized in SELECTION state.');
        } else {
            this.state = 'IDLE';
        }
    }

    startSession(exercise) {
        if (this.state !== 'SELECTION' && this.state !== 'IDLE') return;
        
        this.currentExercise = exercise;
        this.currentExerciseIndex = this.totalExercises.findIndex(e => e.id === exercise.id);
        if (this.currentExerciseIndex === -1) this.currentExerciseIndex = 0;
        
        this.state = 'ACTIVE';
        window.selectedExercise = exercise;
        
        // Delegate UI updates to existing functions
        const card = document.querySelector('.exercise-printed-card[data-exercise-id="' + exercise.id + '"]');
        if (window.selectExercise && card) window.selectExercise(exercise, card);
        if (window.startTrainingTimer) window.startTrainingTimer(exercise);
        
        console.log('Workout session started in ACTIVE state.');
    }

    moveToNext() {
        const nextIndex = this.currentExerciseIndex + 1;
        if (nextIndex < this.totalExercises.length) {
            this.currentExerciseIndex = nextIndex;
            const nextExercise = this.totalExercises[nextIndex];
            this.state = 'RESTING';
            if (window.startTrainingRest) window.startTrainingRest(nextExercise);
        } else {
            this.state = 'FINISHED';
            this.completeSession();
        }
    }

    moveToPrevious() {
        if (this.currentExerciseIndex > 0) {
            this.currentExerciseIndex--;
            const prevExercise = this.totalExercises[this.currentExerciseIndex];
            this.state = 'ACTIVE';
            const card = document.querySelector('.exercise-printed-card[data-exercise-id="' + prevExercise.id + '"]');
            if (window.selectExercise && card) window.selectExercise(prevExercise, card);
            if (window.startTrainingTimer) window.startTrainingTimer(prevExercise);
        }
    }

    completeCurrent() {
        if (this.state === 'ACTIVE' && this.currentExercise) {
            this.session.completedIds.add(this.currentExercise.id);
            this.session.minutes += this.currentExercise.durationSeconds / 60;
            this.session.points += this.currentExercise.points || 0;
            
            if (window.completeSelectedExercise) window.completeSelectedExercise();
            this.moveToNext();
        }
    }

    async completeSession() {
        const finalData = {
            ...this.session,
            sessionEnd: Date.now()
        };
        console.log('Workout Session Finalizada:', finalData);
        // TODO: API call to save session data
        
        this.state = 'IDLE';
        if (window.stopTrainingTimer) window.stopTrainingTimer();
        if (window.stopTrainingRest) window.stopTrainingRest();
        if (window.closeSelectedExercise) window.closeSelectedExercise();
        
        // UI feedback
        const phaseEl = document.getElementById('training-phase');
        const timerEl = document.getElementById('training-timer');
        const controlsEl = document.getElementById('training-controls');
        const panelEl = document.getElementById('selected-exercise-panel');
        
        if (phaseEl) phaseEl.textContent = '¡Entrenamiento finalizado!';
        if (timerEl) timerEl.textContent = '00:00';
        if (controlsEl) controlsEl.classList.add('hidden');
        if (panelEl) panelEl.classList.add('hidden');
        document.querySelector('.printed-form')?.classList.remove('exercise-selected-layout');
    }

    getState() { return this.state; }
    getCurrentExercise() { return this.currentExercise; }
}

// Initialize when DOM is ready
function initWorkoutStateMachine() {
  window.workoutStateMachine = new WorkoutStateMachine();
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initWorkoutStateMachine);
} else {
  initWorkoutStateMachine();
}