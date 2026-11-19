let workoutMap;
let userMarker;
let placesLayer;
let placesRequest;
let searchTimer;

const PLACE_RADIUS_METERS = 2000;
const PARK_CACHE = new Map();
const PARK_CACHE_TTL = 10 * 60 * 1000;

function formatCoordinates(latitude, longitude) {
  return `${latitude.toFixed(6)}, ${longitude.toFixed(6)}`;
}

function updateLocation(latitude, longitude) {
  const status = document.getElementById('location-status');
  status.textContent = `Tu ubicación seleccionada: ${formatCoordinates(latitude, longitude)}`;
  clearTimeout(searchTimer);
  searchTimer = window.setTimeout(() => findNearbyExercisePlaces(latitude, longitude), 250);
}

function getPlaceCoordinates(place) {
  if (Array.isArray(place.coordinates)
    && place.coordinates.length === 2
    && Number.isFinite(place.coordinates[0])
    && Number.isFinite(place.coordinates[1])) {
    return place.coordinates;
  }

  if (typeof place.lat === 'number' && typeof place.lon === 'number') {
    return [place.lat, place.lon];
  }

  if (place.center && typeof place.center.lat === 'number' && typeof place.center.lon === 'number') {
    return [place.center.lat, place.center.lon];
  }

  return null;
}

function getPlaceDetails(place) {
  const tags = place.tags || {};
  const isPark = tags.leisure === 'park';
  if (isPark) return { type: 'Zona verde', color: '#16a34a' };
  return { type: 'Zona verde', color: '#16a34a' };
}

function createPlaceIcon(color) {
  return L.divIcon({
    className: 'public-park-marker',
    html: `<div class="park-pin" style="--park-color:${color}">
      <svg viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 22s8-8.1 8-14A8 8 0 1 0 4 8c0 5.9 8 14 8 14Z"/>
        <path class="tree" d="m12 5.8-3.1 4h1.8l-2.5 3.2h3v2h1.6v-2h3l-2.5-3.2h1.8L12 5.8Z"/>
      </svg>
    </div>`,
    iconSize: [38, 46],
    iconAnchor: [19, 46],
    tooltipAnchor: [0, -42],
    popupAnchor: [0, -42]
  });
}

function clearPlaceResults() {
  const container = document.getElementById('nearby-places');
  if (container) container.innerHTML = '';
}

function escapeHtml(value) {
  const element = document.createElement('div');
  element.textContent = value;
  return element.innerHTML;
}

function renderPlaceResults(places, latitude, longitude) {
  const container = document.getElementById('nearby-places');
  if (!container) return;

  if (!places.length) {
    container.innerHTML = '<p class="places-empty">No encontramos zonas verdes cercanas marcadas en el mapa.</p>';
    return;
  }

  container.innerHTML = places.map((place) => {
    const coordinates = getPlaceCoordinates(place);
    const details = getPlaceDetails(place);
    const distance = Math.round(workoutMap.distance([latitude, longitude], coordinates));
    const name = escapeHtml(place.tags?.name || details.type);
    const directions = `https://www.openstreetmap.org/directions?engine=fossgis_osrm_car&route=${latitude}%2C${longitude}%3B${coordinates[0]}%2C${coordinates[1]}`;

    return `
      <article class="nearby-place">
        <span class="place-dot" style="background:${details.color}"></span>
        <div>
          <strong>${name}</strong>
          <span>${details.type} · ${distance < 1000 ? `${distance} m` : `${(distance / 1000).toFixed(1)} km`}</span>
        </div>
        <a href="${directions}" target="_blank" rel="noopener" aria-label="Cómo llegar a ${name}">
          Cómo llegar
        </a>
      </article>`;
  }).join('');
}

function deduplicatePlaces(places) {
  const seen = new Set();

  return places.filter((place) => {
    const key = `${place.tags?.name || ''}-${place.coordinates[0].toFixed(5)},${place.coordinates[1].toFixed(5)}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function addParkMarkers(places) {
  if (placesLayer) placesLayer.remove();
  placesLayer = L.layerGroup().addTo(workoutMap);

  places.forEach((place) => {
    const details = getPlaceDetails(place);
    const name = place.tags?.name || details.type;
    const description = place.tags?.operator || place.tags?.description || 'Parque público cercano';

    L.marker(place.coordinates, { icon: createPlaceIcon(details.color) })
      .bindPopup(`<strong>${escapeHtml(name)}</strong><br>${escapeHtml(details.type)}<br>${escapeHtml(description)}`)
      .bindTooltip(escapeHtml(name), { direction: 'top', offset: [0, -38] })
      .addTo(placesLayer);
  });
}

async function findNearbyExercisePlaces(latitude, longitude) {
  if (!workoutMap || !window.L) return;

  const status = document.getElementById('location-status');
  const container = document.getElementById('nearby-places');
  if (container) container.innerHTML = '<p class="places-loading">Buscando parques públicos...</p>';

  if (placesRequest) placesRequest.abort();
  const request = new AbortController();
  placesRequest = request;
  const searchTimeout = window.setTimeout(() => request.abort(), 20000);

  const cacheKey = `${latitude.toFixed(3)},${longitude.toFixed(3)}`;
  const cached = PARK_CACHE.get(cacheKey);

  if (cached && Date.now() - cached.createdAt < PARK_CACHE_TTL) {
    renderPlaceResults(cached.places, latitude, longitude);
    status.textContent = `Se encontraron ${cached.places.length} zonas verdes cercanas a tu ubicación.`;
    addParkMarkers(cached.places);
    return;
  }

  const latDelta = PLACE_RADIUS_METERS / 111000;
  const lonDelta = PLACE_RADIUS_METERS / (111000 * Math.max(Math.cos(latitude * Math.PI / 180), 0.1));
  const viewbox = [
    longitude - lonDelta,
    latitude + latDelta,
    longitude + lonDelta,
    latitude - latDelta
  ].join(',');
  const searchParams = new URLSearchParams({
    format: 'jsonv2',
    q: 'park',
    bounded: '1',
    limit: '30',
    addressdetails: '1',
    'accept-language': 'es',
    viewbox
  });

  status.textContent = `Buscando zonas verdes cerca de ${formatCoordinates(latitude, longitude)}...`;

  const endpoint = `https://nominatim.openstreetmap.org/search?${searchParams}`;

  try {
    const response = await fetch(endpoint, {
      method: 'GET',
      headers: { 'Accept-Language': 'es' },
      signal: request.signal
    });

    if (!response.ok) throw new Error(`Nominatim respondió con ${response.status}`);
    const results = await response.json();
    const places = deduplicatePlaces(results
      .filter((place) => place.lat && place.lon && place.display_name)
      .map((place) => ({
        ...place,
        tags: {
          leisure: 'park',
          name: place.name || place.display_name.split(',')[0]
        },
        coordinates: [Number(place.lat), Number(place.lon)]
      }))
      .filter((place) => {
        const tags = place.tags || {};
        return place.coordinates
          && tags.leisure === 'park';
      })
      .sort((a, b) => {
        const distanceA = workoutMap.distance([latitude, longitude], a.coordinates);
        const distanceB = workoutMap.distance([latitude, longitude], b.coordinates);
        return distanceA - distanceB;
      })
      .slice(0, 30));

    PARK_CACHE.set(cacheKey, { createdAt: Date.now(), places });

    addParkMarkers(places);

    renderPlaceResults(places, latitude, longitude);
    status.textContent = `Se encontraron ${places.length} zonas verdes cercanas a tu ubicación.`;
  } catch (error) {
    if (error.name === 'AbortError') return;
    const cached = PARK_CACHE.get(cacheKey);
    if (cached) {
      renderPlaceResults(cached.places, latitude, longitude);
      addParkMarkers(cached.places);
      status.textContent = `Se encontraron ${cached.places.length} zonas verdes cercanas a tu ubicación.`;
      return;
    }
  } finally {
    window.clearTimeout(searchTimeout);
    if (placesRequest === request) placesRequest = null;
  }
}

function initializeMap() {
  if (workoutMap || !window.L) return;

  workoutMap = L.map('workout-map').setView([20.6736, -103.344], 13);

  // Tiles de OpenTopoMap sobre datos de OpenStreetMap. No requieren API key.
  // El servidor público de tile.openstreetmap.org bloquea apps en producción
  // y CARTO exige key desde 2026.
  L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
    maxZoom: 17,
    subdomains: 'abc',
    attribution: 'Map data: &copy; OpenStreetMap contributors, SRTM | Map style: &copy; OpenTopoMap (CC-BY-SA)'
  }).addTo(workoutMap);

  placesLayer = L.layerGroup().addTo(workoutMap);

  workoutMap.on('click', (event) => {
    const { lat, lng } = event.latlng;

    if (userMarker) {
      userMarker.setLatLng(event.latlng);
    } else {
      userMarker = L.marker(event.latlng, { draggable: true }).addTo(workoutMap);
      userMarker.on('dragend', () => {
        const position = userMarker.getLatLng();
        updateLocation(position.lat, position.lng);
      });
    }

    updateLocation(lat, lng);
  });
}

function locateUser() {
  const status = document.getElementById('location-status');

  // La ubicación del navegador permite centrar el mapa donde está la persona.
  if (!navigator.geolocation) {
    status.textContent = 'La geolocalización no está disponible en este navegador.';
    return;
  }

  status.textContent = 'Solicitando tu ubicación...';

  navigator.geolocation.getCurrentPosition((position) => {
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;
    const coordinates = [latitude, longitude];

    initializeMap();
    workoutMap.setView(coordinates, 16);

    if (userMarker) {
      userMarker.setLatLng(coordinates);
    } else {
      userMarker = L.marker(coordinates, { draggable: true }).addTo(workoutMap);
      userMarker.on('dragend', () => {
        const selectedPosition = userMarker.getLatLng();
        updateLocation(selectedPosition.lat, selectedPosition.lng);
      });
    }

    updateLocation(latitude, longitude);
  }, (error) => {
    const messages = {
      1: 'No se concedieron permisos para acceder a tu ubicación.',
      2: 'No fue posible determinar tu ubicación.',
      3: 'La solicitud de ubicación tardó demasiado.'
    };

    status.textContent = messages[error.code] || 'No fue posible obtener tu ubicación.';
  }, {
    enableHighAccuracy: true,
    timeout: 10000,
    maximumAge: 60000
  });
}

// Initialize map controls when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  const locateButton = document.getElementById('locate-button');
  if (locateButton) {
    locateButton.addEventListener('click', locateUser);
  }

  const zoomInButton = document.getElementById('zoom-in-btn');
  if (zoomInButton) {
    zoomInButton.addEventListener('click', () => {
      if (workoutMap) {
        workoutMap.zoomIn();
      }
    });
  }

  const zoomOutButton = document.getElementById('zoom-out-btn');
  if (zoomOutButton) {
    zoomOutButton.addEventListener('click', () => {
      if (workoutMap) {
        workoutMap.zoomOut();
      }
    });
  }
});

function refreshWorkoutMap() {
  initializeMap();

  if (workoutMap) {
    window.requestAnimationFrame(() => workoutMap.invalidateSize());
  }
}

// Initialize map on load
refreshWorkoutMap();
