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
            estimatedTime: 30,
            exercises: [] // Array of { exerciseId: string, order: number }
        };
        
        // DOM Elements
        this.wizardForm = document.getElementById('routine-wizard-form');
        this.wizardSteps = document.querySelectorAll('.wizard-step');
        this.wizardPanels = document.querySelectorAll('.wizard-panel');
        this.wizardPrev = document.getElementById('wizard-prev');
        this.wizardNext = document.getElementById('wizard-next');
        this.wizardSubmit = document.getElementById('wizard-submit');
        
        this.setupEventListeners();
    }

    setupEventListeners() {
        this.wizardForm.addEventListener('submit', this.handleFormSubmit.bind(this));
        this.wizardPrev.addEventListener('click', () => this.nextStep(-1));
        this.wizardNext.addEventListener('click', () => this.nextStep(1));
        
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
        document.getElementById('routine-name').value = this.routineData.name;
        document.getElementById('routine-description').value = this.routineData.description;
        document.getElementById('routine-goal').value = this.routineData.goal;
        document.getElementById('routine-level').value = this.routineData.level;
        document.getElementById('routine-estimated-time').value = this.routineData.estimatedTime;
        
        // Update Step 3 summary
        document.getElementById('summary-name').textContent = this.routineData.name;
        document.getElementById('summary-goal').textContent = this.routineData.goal;
        document.getElementById('summary-level').textContent = this.routineData.level;
        document.getElementById('summary-time').textContent = this.routineData.estimatedTime;
        document.getElementById('summary-exercise-count').textContent = this.routineData.exercises.length;
        
        // Update exercise list in Step 3
        const listEl = document.getElementById('summary-exercises-list');
        listEl.innerHTML = this.routineData.exercises.map(ex => `<li>${ex.exerciseId}</li>`).join('');
        
        // Update exercise selector list (requires integration with exercise data)
        // TODO: Re-render exercise selector list based on global exercise data
    }

    goToStep(step) {
        if (step < 1 || step > this.maxSteps) return;
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

        this.wizardPrev.disabled = this.currentStep === 1;
        this.wizardNext.disabled = this.currentStep === this.maxSteps;
        this.wizardSubmit.classList.toggle('hidden', this.currentStep !== this.maxSteps);
    }

    nextStep(direction) {
        if (this.validateCurrentStep()) {
            this.goToStep(this.currentStep + direction);
        } else {
            alert('Por favor, completa los campos obligatorios antes de avanzar.');
        }
    }

    validateCurrentStep() {
        // Simple validation check for Step 1
        if (this.currentStep === 1) {
            const name = document.getElementById('routine-name').value.trim();
            const goal = document.getElementById('routine-goal').value;
            const level = document.getElementById('routine-level').value;
            const time = parseInt(document.getElementById('routine-estimated-time').value);
            
            return name.length > 2 && goal !== '' && level !== '' && time >= 5;
        }
        // Step 2 validation (check for exercises)
        if (this.currentStep === 2) {
            const selectedCount = document.getElementById('selected-count').textContent.match(/\d+/);
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
        document.getElementById('routine-modal').classList.add('hidden');
        // Cleanup state
        this.routineData = { id: null, name: '', description: '', goal: 'strength', level: 'intermediate', estimatedTime: 30, exercises: [] };
        this.currentStep = 1;
        this.updateUI();
    }
}

// Global instance initialization (to be called when modal is shown)
window.routineWizard = new RoutineWizard();

// Export for global access
window.openRoutineModal = () => {
    document.getElementById('routine-modal').classList.remove('hidden');
    window.routineWizard.goToStep(1);
};
window.closeRoutineModal = () => {
    window.routineWizard.closeModal();
};
// Export functions for navigation.js/UI to call
window.routineWizardPrev = () => window.routineWizard.nextStep(-1);
window.routineWizardNext = () => window.routineWizard.nextStep(1);