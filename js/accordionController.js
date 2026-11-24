// accordionController.js

/**
 * Controls the behavior of all accordion components across the app.
 * Handles keyboard navigation, ARIA attributes, and smooth animations.
 */
class AccordionController {
    constructor() {
        this.accordions = document.querySelectorAll('details.accordion-item');
        this.init();
    }

    init() {
        this.accordions.forEach(accordion => {
            const summary = accordion.querySelector('.accordion-header');
            const content = accordion.querySelector('.accordion-content');
            const icon = accordion.querySelector('.accordion-icon');

            // Initialize ARIA attributes
            summary.setAttribute('role', 'button');
            summary.setAttribute('aria-expanded', String(accordion.open));
            
            if (content) {
                content.setAttribute('role', 'region');
                content.setAttribute('aria-hidden', String(!accordion.open));
            }

            // Keyboard support
            summary.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.toggle(accordion);
                }
            });

            // Click handler
            summary.addEventListener('click', (e) => {
                // Allow default <details> toggle, then sync state
                setTimeout(() => this.syncState(accordion), 0);
            });

            // Sync state on toggle
            accordion.addEventListener('toggle', () => this.syncState(accordion));
        });
    }

    syncState(accordion) {
        const summary = accordion.querySelector('.accordion-header');
        const content = accordion.querySelector('.accordion-content');
        const icon = accordion.querySelector('.accordion-icon');
        const isOpen = accordion.open;

        summary.setAttribute('aria-expanded', String(isOpen));
        
        if (content) {
            content.setAttribute('aria-hidden', String(!isOpen));
            
            // Animate max-height for smooth transition
            if (isOpen) {
                content.style.maxHeight = content.scrollHeight + 'px';
            } else {
                content.style.maxHeight = '0';
            }
        }

        if (icon) {
            icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    toggle(accordion) {
        accordion.open = !accordion.open;
        this.syncState(accordion);
    }

    // Static method to close all accordions (useful for responsive behavior)
    static closeAll() {
        document.querySelectorAll('details.accordion-item[open]').forEach(acc => {
            acc.open = false;
        });
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.accordionController = new AccordionController();
});

// Export for manual initialization if needed
window.initAccordions = () => {
    window.accordionController = new AccordionController();
};