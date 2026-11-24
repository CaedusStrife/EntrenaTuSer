// mapPlacesPanel.js

/**
 * Controls the Places Slide-up Panel in the Map screen.
 * Handles filter chips, place rendering, and panel expand/collapse.
 */
class MapPlacesPanel {
    constructor() {
        this.panel = document.getElementById('nearby-places-panel');
        this.handle = document.querySelector('.slideup-handle');
        this.placesGrid = document.getElementById('nearby-places');
        this.emptyState = document.getElementById('places-empty-state');
        this.filterChips = document.querySelectorAll('.filter-chip');
        
        this.currentFilter = 'all';
        this.placesData = [];
        this.isCollapsed = true;
        
        this.init();
    }

    init() {
        if (!this.panel) return;

        // Handle click to toggle panel
        this.handle.addEventListener('click', () => this.togglePanel());
        
        // Keyboard support
        this.handle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.togglePanel();
            }
        });

        // Filter chips
        this.filterChips.forEach(chip => {
            chip.addEventListener('click', () => this.setFilter(chip.dataset.filter));
        });

        // Close panel on ESC
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !this.isCollapsed) {
                this.collapse();
            }
        });
    }

    setFilter(filter) {
        this.currentFilter = filter;
        this.filterChips.forEach(chip => {
            const isActive = chip.dataset.filter === filter;
            chip.classList.toggle('active', isActive);
            chip.setAttribute('aria-pressed', String(isActive));
        });
        this.renderPlaces();
    }

    togglePanel() {
        if (this.isCollapsed) {
            this.expand();
        } else {
            this.collapse();
        }
    }

    expand() {
        this.panel.classList.remove('collapsed');
        this.handle.setAttribute('aria-label', 'Colapsar panel de zonas verdes');
        this.isCollapsed = false;
        this.handle.querySelector('i').style.transform = 'rotate(180deg)';
    }

    collapse() {
        this.panel.classList.add('collapsed');
        this.handle.setAttribute('aria-label', 'Expandir panel de zonas verdes');
        this.isCollapsed = true;
        this.handle.querySelector('i').style.transform = 'rotate(0deg)';
    }

    loadPlaces(places) {
        this.placesData = places;
        this.renderPlaces();
    }

    renderPlaces() {
        if (!this.placesGrid) return;

        // Filter places
        let filtered = this.placesData;
        if (this.currentFilter !== 'all') {
            filtered = this.placesData.filter(place => place.type === this.currentFilter);
        }

        if (filtered.length === 0) {
            this.placesGrid.innerHTML = '';
            if (this.emptyState) this.emptyState.classList.remove('hidden');
            return;
        }

        if (this.emptyState) this.emptyState.classList.add('hidden');

        this.placesGrid.innerHTML = filtered.map(place => this.createPlaceCard(place)).join('');

        // Add click handlers for place cards
        this.placesGrid.querySelectorAll('.place-card').forEach(card => {
            card.addEventListener('click', () => {
                // TODO: Navigate to place on map
                console.log('Place clicked:', card.dataset.placeId);
            });
        });

        // Add click handlers for navigate buttons
        this.placesGrid.querySelectorAll('.navigate-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.stopPropagation();
                const placeId = btn.dataset.placeId;
                this.navigateToPlace(placeId);
            });
        });
    }

    createPlaceCard(place) {
        const typeLabels = {
            park: 'Parque',
            track: 'Pista',
            gym: 'Gimnasio'
        };

        const typeIcons = {
            park: 'trees',
            track: 'activity',
            gym: 'dumbbell'
        };

        return `
            <article class="place-card" data-place-id="${place.id}">
                <header class="place-card-header">
                    <h4 class="place-card-name">${this.escapeHtml(place.name)}</h4>
                    <span class="place-card-type">${typeLabels[place.type] || place.type}</span>
                </header>
                <div class="place-card-distance">
                    <i data-lucide="navigation-2" aria-hidden="true"></i>
                    ${place.distance} km
                </div>
                <div class="place-card-actions">
                    <button type="button" class="btn-droplet navigate-btn" data-place-id="${place.id}" aria-label="Navegar a ${this.escapeHtml(place.name)}">
                        <i data-lucide="navigation" aria-hidden="true"></i> Ir
                    </button>
                </div>
            </article>
        `;
    }

    navigateToPlace(placeId) {
        const place = this.placesData.find(p => p.id === placeId);
        if (!place) return;

        // TODO: Integrate with map.js to center map on this place
        console.log('Navigate to place:', place);
        if (typeof window.centerMapOnPlace === 'function') {
            window.centerMapOnPlace(place.lat, place.lng);
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    window.mapPlacesPanel = new MapPlacesPanel();
});

// Export for manual initialization
window.initMapPlacesPanel = () => {
    window.mapPlacesPanel = new MapPlacesPanel();
};