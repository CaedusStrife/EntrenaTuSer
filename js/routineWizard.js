// routineWizard.js

/**
 * Manages the multi-step creation/editing of a routine using the Hoja de Identidad wizard flow.
 * Orchestrates interactions between form inputs, exercise search, and state persistence.
 */
class RoutineWizard {
    constructor() {
        this.currentStep = 1;
        this.maxSteps = 3;
        this.routineData = {
            id: null,
            name: '',
            description: '',
            goal: 'strength',
            level: 'intermediate',
            duration: 30,
            frequency: 3,
            exercises: [] // Array of { exerciseId: string, order: number }
        };
        
        // DOM Elements - populated on init()
        this.wizardForm = null;
        this.wizardSteps = null;
        this.wizardPanels = null;
        this.wizardPrev = null;
        this.wizardNext = null;
        this.wizardSubmit = null;
        this.initialized = false;
    }

    init() {
        if (this.initialized) return;
        
        // DOM Elements - only available when modal is open
        this.wizardForm = document.getElementById('routine-wizard-form');
        this.wizardSteps = document.querySelectorAll('.wizard-step');
        this.wizardPanels = document.querySelectorAll('.wizard-panel');
        this.wizardPrev = document.getElementById('wizard-prev');
        this.wizardNext = document.getElementById('wizard-next');
        this.wizardSubmit = document.getElementById('wizard-submit');
        
        // Null checks - elements only exist when modal is rendered
        if (!this.wizardForm) return;
        
        this.setupEventListeners();
        this.initialized = true;
    }

    setupEventListeners() {
        this.wizardForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        
        if (this.wizardPrev) {
            this.wizardPrev.addEventListener('click', () => this.nextStep(-1));
        }
        if (this.wizardNext) {
            this.wizardNext.addEventListener('click', () => this.nextStep(1));
        }
        
        // Event delegation for exercise search/selection (must be implemented in exercises.js/map.js integration)
        // TODO: Connect selector filters to exercise selection logic
    }

    async loadRoutine(routineId) {
        // TODO: API call to fetch routine data by ID
        // Simulating fetch
        console.log(`Loading routine ID: ${routineId}`);
        this.routineData.id = routineId;
        // Placeholder data
        this.routineData.name = 'Rutina de Fuerza';
        this.routineData.description = 'Rutina enfocada en fuerza general.';
        this.routineData.goal = 'strength';
        this.routineData.level = 'intermediate';
        this.routineData.estimatedTime = 30;
        this.routineData.exercises = [{ exerciseId: 'ex1', order: 1 }, { exerciseId: 'ex2', order: 2 }];
        
        this.updateUI();
        this.goToStep(1);
    }

    updateUI() {
        // Update Step 1 fields
        const nameEl = document.getElementById('routine-name');
        if (nameEl) nameEl.value = this.routineData.name;
        const descEl = document.getElementById('routine-description');
        if (descEl) descEl.value = this.routineData.description;
        const goalEl = document.getElementById('routine-goal');
        if (goalEl) goalEl.value = this.routineData.goal;
        const levelEl = document.getElementById('routine-level');
        if (levelEl) levelEl.value = this.routineData.level;
        const durationEl = document.getElementById('routine-duration');
        if (durationEl) durationEl.value = this.routineData.duration;
        const frequencyEl = document.getElementById('routine-frequency');
        if (frequencyEl) frequencyEl.value = this.routineData.frequency;
        
        // Update Step 3 summary
        const summaryName = document.getElementById('summary-name');
        if (summaryName) summaryName.textContent = this.routineData.name;
        const summaryDesc = document.getElementById('summary-description');
        if (summaryDesc) summaryDesc.textContent = this.routineData.description || '—';
        const summaryGoal = document.getElementById('summary-goal');
        if (summaryGoal) summaryGoal.textContent = this.routineData.goal;
        const summaryLevel = document.getElementById('summary-level');
        if (summaryLevel) summaryLevel.textContent = this.routineData.level;
        const summaryTime = document.getElementById('summary-time');
        if (summaryTime) summaryTime.textContent = `${this.routineData.duration} min`;
        const summaryFreq = document.getElementById('summary-frequency');
        if (summaryFreq) summaryFreq.textContent = `${this.routineData.frequency} días`;
        const summaryCount = document.getElementById('summary-exercise-count');
        if (summaryCount) summaryCount.textContent = `${this.routineData.exercises.length} ejercicio${this.routineData.exercises.length !== 1 ? 's' : ''}`;
        
        // Update exercise list in Step 3
        const listEl = document.getElementById('summary-exercises-list');
        if (listEl) {
            if (this.routineData.exercises.length === 0) {
                listEl.innerHTML = '<li class="review-empty">No hay ejercicios seleccionados</li>';
            } else {
                listEl.innerHTML = this.routineData.exercises.map((ex, i) => `<li>${i + 1}. ${ex.exerciseId}</li>`).join('');
            }
        }
        
        // Update selected count in Step 2 (for validation)
        const selectedCountEl = document.getElementById('selected-count');
        if (selectedCountEl) selectedCountEl.textContent = `${this.routineData.exercises.length} seleccionado${this.routineData.exercises.length !== 1 ? 's' : ''}`;
        
        // Update exercise selector list (requires integration with exercise data)
        // TODO: Re-render exercise selector list based on global exercise data
    }

    goToStep(step) {
        if (step < 1 || step > this.maxSteps) return;
        this.init(); // Initialize DOM elements on first use
        if (!this.wizardForm) return; // Modal not rendered yet
        this.currentStep = step;
        this.updateUI();
        this.updateWizardVisibility();
    }

    updateWizardVisibility() {
        this.wizardSteps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === this.currentStep);
            step.classList.toggle('completed', index + 1 < this.currentStep);
        });
        this.wizardPanels.forEach((panel, index) => {
            panel.classList.toggle('active', index + 1 === this.currentStep);
        });

        // Update Ebru progress trail (data-step on wizard-progress)
        const wizardProgress = document.querySelector('.wizard-progress');
        if (wizardProgress) {
            wizardProgress.setAttribute('data-step', this.currentStep);
        }

        // Trigger trail drop animations for the current step
        this.animateTrailDrops();

        this.wizardPrev.disabled = this.currentStep === 1;
        this.wizardNext.disabled = this.currentStep === this.maxSteps;
        this.wizardSubmit.classList.toggle('hidden', this.currentStep !== this.maxSteps);
    }

    animateTrailDrops() {
        const wizardProgress = document.querySelector('.wizard-progress');
        if (!wizardProgress) return;
        
        const trailDrops = wizardProgress.querySelectorAll('.trail-drop');
        trailDrops.forEach((drop, index) => {
            // Only show drops up to current step
            if (index + 1 <= this.currentStep) {
                // Force reflow before adding class to trigger transition
                drop.offsetHeight;
                drop.classList.add('show');
                // Only the current step's drop gets the pulse animation
                drop.classList.toggle('active-drop', index + 1 === this.currentStep);
            } else {
                drop.classList.remove('show', 'active-drop');
            }
        });
    }

    nextStep(direction) {
        // Only validate when moving forward (direction > 0)
        // Going backwards should not require validation
        if (direction > 0 && !this.validateCurrentStep()) {
            alert('Por favor, completa los campos obligatorios antes de avanzar.');
            return;
        }
        this.goToStep(this.currentStep + direction);
    }

    validateCurrentStep() {
        // Simple validation check for Step 1
        if (this.currentStep === 1) {
            const nameEl = document.getElementById('routine-name');
            if (!nameEl) return false;
            
            const name = nameEl.value.trim();
            
            return name.length > 2;
        }
        // Step 2 validation (check for exercises)
        if (this.currentStep === 2) {
            const selectedCountEl = document.getElementById('selected-count');
            if (!selectedCountEl) return false;
            const selectedCount = selectedCountEl.textContent.match(/\d+/);
            return selectedCount && parseInt(selectedCount[0]) > 0;
        }
        // Step 3 validation (final review check)
        if (this.currentStep === 3) {
            return this.routineData.exercises.length > 0;
        }
        return true;
    }

    handleFormSubmit(event) {
        event.preventDefault();
        if (this.currentStep === 3) {
            console.log('Routine saved successfully:', this.routineData);
            // TODO: API call to save routine
            alert('Rutina guardada exitosamente (Simulado).');
            this.closeModal();
        }
    }

    closeModal() {
        document.getElementById('routine-modal')?.classList.add('hidden');
        // Cleanup state
        this.routineData = { id: null, name: '', description: '', goal: 'strength', level: 'intermediate', estimatedTime: 30, exercises: [] };
        this.currentStep = 1;
        // Don't call updateUI() here - modal is hidden, elements not accessible
    }
}

// Initialize routine wizard when DOM is ready
function initRoutineWizard() {
  window.routineWizard = new RoutineWizard();

  // Note: openRoutineModal is defined in routines.js and handles exercise loading
  // We only export the wizard navigation functions here
  window.closeRoutineModal = () => {
    window.routineWizard.closeModal();
  };
  // Export functions for navigation.js/UI to call
  window.routineWizardPrev = () => window.routineWizard.nextStep(-1);
  window.routineWizardNext = () => window.routineWizard.nextStep(1);
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initRoutineWizard);
} else {
  initRoutineWizard();
}