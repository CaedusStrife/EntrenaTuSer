# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

HTML/CSS/JS vanilla (static files, no build step). Served via nginx (docker-compose.yml present). No framework; lucide icons, Leaflet, Chart.js, Three.js loaded via CDN.

## Users

**Primario:** Personas que entrenan en casa o en gimnasio, de nivel principiante a intermedio, que buscan rutinas guiadas, seguimiento visual de progreso y motivación continua sin depender de un entrenador presencial.

**Secundario (futuro):** Entrenadores personales que quieran asignar rutinas y supervisar adherencia de sus clientes.

Situación típica: usuario abre la app antes/durante/después de su sesión, elige o sigue una rutina, ve la demo en video, registra completado, revisa métricas semanales y conversa con el asistente IA para ajustes o dudas.

## Product Purpose

Una plataforma web de entrenamiento autoguiado que combina:
- **Rutinas estructuradas** con videos demostrativos
- **Seguimiento visual** (métricas, gráficas, nivel, medallas)
- **Avatar 3D personalizable** que evoluciona con el progreso del usuario
- **Asistente conversacional IA** ("Asistente Entrena") para consejos, dudas y generación de rutinas
- **Mapa interactivo** para descubrir zonas verdes y entrenar al aire libre
- **Comunidad social** integrada (comentarios reales de Facebook/X) como refuerzo de motivación

Éxito = adherencia semanal sostenida, progreso visible en métricas y avatar, y uso recurrente del asistente IA.

## Positioning

La **única app de fitness web gratuita** que une **avatar 3D evolutivo + asistente IA conversacional nativo** en una sola interfaz sin instalación, sin suscripción y con stack ligero (HTML/CSS/JS) que carga en segundos en cualquier dispositivo. Las apps competidoras separan tracking, video, comunidad e IA en productos distintos o requieren app nativa + cuenta premium.

## Operating Context

- **Entorno:** Navegador web (desktop y móvil), sin instalación. Funciona offline parcial (Service Worker no implementado aún).
- **Sesión típica:** 15–45 min. Login → Dashboard (métricas) → Entrenamiento (video + completar) → Rutinas/Mapa/Chat según necesidad.
- **Rituales:** Revisar gráfica semanal los domingos, consultar al asistente IA antes de entrenar, explorar mapa para salir a correr/caminar.
- **Datos:** Autenticación simple (email/password), progreso guardado en localStorage/backend (api/), avatar configurado por usuario.
- **Accesibilidad:** Widget nativo (tamaño texto, alto contraste, reducir movimiento), modo oscuro, etiquetas ARIA, foco visible.

## Capabilities and Constraints

**Funcionalidad confirmada:**
- Auth: login, registro, recuperación de contraseña
- Dashboard: 5 tarjetas de métricas (minutos, nivel, medallas, puntos, ejercicios), gráfica semanal (Chart.js), avatar 3D (Three.js + GLTF), historial, medallas
- Entrenamiento: lista de ejercicios por categoría, video demostrativo, marcar completado
- Rutinas: CRUD completo (crear, editar, eliminar, duplicar), añadir ejercicios con series/reps/descanso
- Mapa: Leaflet + OpenStreetMap, geolocalización, marcadores de parques, lugares cercanos
- Chatbot: interfaz completa, streaming simulado, guardar rutinas sugeridas
- Accesibilidad: panel con 4 ajustes (texto ±, contraste, movimiento, reset)
- Temas: claro/oscuro persistente en localStorage
- Social: feeds de comentarios Facebook y X (simulados/embebidos)

**Constraints técnicos:**
- Sin build step ni bundler; ES modules no usados (scripts globales)
- CDN para librerías externas (riesgo de disponibilidad/versión)
- Backend en `api/` (PHP aparente) + `init-db/` (SQL), docker-compose para despliegue
- No tests automatizados visibles
- No Service Worker / PWA aún
- Three.js r128 (versión antigua, 2021)

**Undecided / abierto:**
- Persistencia real: localStorage vs API vs híbrido
- Autenticación: JWT, sessions, Firebase, Supabase, custom
- Sincronización multi-dispositivo
- Internacionalización (solo ES ahora)
- Analytics / telemetría

## Brand Commitments

- **Nombre:** "Entrena tu ser" (marca denominativa, sin logotipo gráfico separado; usa ícono `activity` de Lucide como marca visual)
- **Voz:** Cercana, motivadora, experta pero accesible, en español (tú), sin jerga innecesaria
- **Paleta actual:** Naranja `#ff6b35` (primaria/acción), Teal `#00c8b3` / `#009688` (secundaria/éxito), gradientes en tarjetas. Modo oscuro: slate `#0f172a` / `#1e293b`
- **Tipografía:** Sistema (`Segoe UI`, system-ui, -apple-system, sans-serif) — sin fuente de marca propia
- **Iconografía:** Lucide (outline, 24px base)
- **Tono visual:** Limpio, funcional, con acentos de color cálido (naranja) para energía y teal para calma/progreso

## Evidence on Hand

- **Código completo:** `index.html` (SPA multi-pantalla), `css/styless.css` (~770 líneas), `js/` (13 módulos)
- **Assets referenciados:** `images/video-entrenamiento.jpg` (poster video), `videos/ejercicio-demostrativo.mp4` (demo), modelos 3D `.gltf` (avatar) — **no verificados en disco**
- **Backend:** `api/`, `init-db/`, `docker-compose.yml`, `nginx.conf`
- **Datos de prueba:** Ejercicios hardcodeados en `exercises.js`, medallas en `progress.js`
- **Ausencias a no fabricar:** Testimonios reales, casos de estudio, métricas de retención, usuarios beta, press, certificaciones

## Product Principles

1. **Cero fricción para empezar:** Abrir, registrar (o demo), entrenar. Sin onboarding largo, sin paywall, sin app store.
2. **Progreso visible, siempre:** Métricas, gráfica, avatar, medallas — el usuario ve su avance en cada pantalla.
3. **IA como compañero, no reemplazo:** El asistente sugiere, explica, motiva; el usuario decide y ejecuta.
4. **Entrenar donde quieras:** En casa (video), en el gym (rutinas), al aire libre (mapa). La app se adapta al lugar, no al revés.
5. **Accesibilidad por defecto, no parche:** Contraste, tamaño, movimiento, tema — ajustables en vivo sin recargar.

## Accessibility & Inclusion

- **Estándar objetivo:** WCAG 2.1 AA
- **Necesidades conocidas:** Tamaño de texto ajustable (3 niveles), alto contraste forzado, reducir animaciones/transiciones, modo oscuro nativo, navegación por teclado completa, etiquetas ARIA en componentes dinámicos (modales, tabs, feeds, chatbot)
- **Gap actual:** Falta auditoría formal; foco visible en algunos botones (`.nav-btn`, `.exercise-card`) podría reforzarse; landmarks de sección principales presentes pero no exhaustivos