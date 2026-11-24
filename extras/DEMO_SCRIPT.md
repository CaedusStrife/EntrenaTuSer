# Script de Demostración - Entrena Tu Ser
**Duración estimada:** 6-8 minutos
**Resolución:** 1920x1080 (Full HD)
**Formato:** MP4 (H.264)

---

## ESCENA 1: Presentación y Registro (0:00 - 1:00)

### Acción
1. Abrir http://localhost:5500
2. Mostrar pantalla de login con diseño Ebru/marmoleado
3. Click "¿No tienes cuenta? Crear una"
4. Completar formulario:
   - Nombre: "Estudiante Demo"
   - Email: "demo@entrenatuser.com"
   - Contraseña: "Demo123456"
   - Confirmar: "Demo123456"
5. Click "Registrarse e Ingresar"
6. Mostrar transición suave a dashboard

### Narración
> "Entrena Tu Ser es una plataforma web de entrenamiento autoguiado. El registro es inmediato: sin validaciones externas, sin esperas. Al crear la cuenta, recibimos un token JWT que autentica todas las peticiones posteriores."

---

## ESCENA 2: Dashboard y Metas (1:00 - 2:00)

### Acción
1. Mostrar dashboard con 5 tarjetas: Minutos, Nivel, Medallas, Puntos, Ejercicios
2. Mostrar gráfica semanal (Chart.js)
3. Click en tarjeta "Metas" o scroll a sección metas
4. Cambiar meta: "Minutos semanales" → 150 min
5. Cambiar a "Ejercicios semanales" → 5 ejercicios
6. Mostrar persistencia (recargar página, meta se mantiene)

### Narración
> "El dashboard muestra progreso en tiempo real: minutos totales, nivel actual, medallas desbloqueadas, puntos y ejercicios completados. La gráfica semanal se actualiza automáticamente. Las metas semanales son persistentes: se guardan en base de datos y sobreviven a recargas."

---

## ESCENA 3: Rutina Personalizada (2:00 - 3:00)

### Acción
1. Click "Entrenamiento" en sidebar
2. Mostrar lista de ejercicios por categorías (desplegables)
3. Click "Crear rutina personalizada" (botón +)
4. Completar:
   - Objetivo: "Fuerza"
   - Nivel: "Principiante"
   - Tiempo: "20 minutos"
   - Zona: "Cuerpo completo"
   - Días: "3"
5. Click "Generar rutina"
4. Mostrar rutina generada con ejercicios, series, reps, descanso
5. Click "Guardar rutina"
6. Volver a "Mis Rutinas" y mostrar la nueva rutina en la lista

### Narración
> "El generador de rutinas personalizadas usa objetivo, nivel, tiempo disponible y zona corporal para crear una rutina equilibrada. Cada ejercicio incluye series, repeticiones y tiempo de descanso calculados automáticamente. La rutina se guarda en base de datos y queda disponible en 'Mis Rutinas'."

---

## ESCENA 4: Entrenamiento Guiado (3:00 - 5:00) ⭐ ESCENA CLAVE

### Acción
1. En "Mis Rutinas", click "Iniciar" en la rutina creada
2. Mostrar panel de entrenamiento:
   - Header: "Ejercicio 1 de 6"
   - Barra de progreso
   - Lista ejercicios a la izquierda
   - Video demostrativo a la derecha (loop)
   - Timer central (cuenta regresiva)
   - Controles: Pausar, Siguiente, Anterior, Finalizar
3. Iniciar primer ejercicio:
   - Timer cuenta regresiva
   - Video reproduciendo en loop
4. Al terminar: click "Siguiente"
5. Mostrar **descanso configurable** (30s):
   - Contador de descanso
   - Botón "Saltar descanso"
   - Pausa desactivada durante descanso
6. Completar 2-3 ejercicios
7. Click "Finalizar rutina"
8. **Mostrar resumen visual**:
   - Ejercicios completados / Total
   - Minutos entrenados
   - Puntos ganados
   - Medallas desbloqueadas (si aplica)

### Narración
> "El entrenamiento guiado es el corazón de la app. Cada ejercicio tiene video demostrativo en bucle, timer con cuenta regresiva y navegación completa. Entre ejercicios hay descansos configurables (0, 15, 30, 60 segundos) con contador y opción de saltar. Al finalizar, el resumen visual muestra logros inmediatos: ejercicios, minutos, puntos y medallas."

---

## ESCENA 5: Progreso y Medallas (5:00 - 6:00)

### Acción
1. Volver a "Progreso" en sidebar
2. Mostrar tarjetas actualizadas (minutos, ejercicios, puntos subieron)
3. Mostrar gráfica semanal con nuevo dato
4. Scroll a "Medallas" - mostrar nuevas desbloqueadas
5. Click en medalla → mostrar detalle (nombre, descripción, fecha)

### Narración
> "El progreso se actualiza en tiempo real. Cada ejercicio completado suma minutos, puntos y acerca a las metas. Las medallas se desbloquean automáticamente: primer entrenamiento, racha de 3 días, 10 ejercicios, 100 minutos, rutina completa, meta alcanzada, zonas variadas."

---

## ESCENA 6: Chatbot Contextual (6:00 - 7:00)

### Acción
1. Click icono chatbot (flotante abajo derecha)
2. Escribir: "Hazme una rutina para principiantes de 15 minutos"
3. Mostrar respuesta con rutina sugerida
4. Click "Guardar esta rutina"
5. Escribir: "¿Qué debo entrenar hoy según mi progreso?"
6. Mostrar respuesta contextualizada (usa nivel, metas, historial)

### Narración
> "El chatbot no es genérico: consulta tu progreso real (nivel, minutos, ejercicios, puntos, metas) y sugiere rutinas adaptadas. Puede guardar sus sugerencias directamente en tus rutinas. Responde a lenguaje natural: 'tengo poco tiempo', 'cambia este ejercicio', 'hazlo más sencillo'."

---

## ESCENA 7: Accesibilidad y Seguridad (7:00 - 7:30)

### Acción
1. Click icono accesibilidad (flotante)
2. Mostrar: A+/A- (tamaño texto), Alto contraste, Reducir movimiento, Reset
3. Probar Tab navigation (mostrar focus visible)
4. Mostrar skip link "Saltar al contenido principal" (Tab al inicio)
5. Cerrar sesión → mostrar login
6. Intentar acceder a /api/progress/1 sin token → 401
7. Login → token JWT → acceso concedido

### Narración
> "Accesibilidad WCAG 2.1 AA: navegación por teclado completa, focus visible, skip links, texto ajustable, alto contraste, reducir animaciones, modo oscuro. Seguridad: JWT con ownership validation (403 si token de otro usuario), CORS restrictivo, contraseñas PBKDF2, sin datos sensibles en frontend."

---

## ESCENA 8: Cierre (7:30 - 8:00)

### Acción
1. Mostrar arquitectura: Frontend (HTML/CSS/JS) ↔ API (ASP.NET Core 10) ↔ SQL Server
2. Mostrar README.md en editor
3. Mostrar tests Playwright pasando (3/3)
4. Pantalla final: "Entrena Tu Ser - Proyecto 10/10"

### Narración
> "Arquitectura limpia: frontend estático sin build step, API .NET 10 con JWT, SQL Server local. Tests automatizados con Playwright. Documentación completa en README. Entrena Tu Ser: entrena donde quieras, progresa cada día."

---

## CHECKLIST TÉCNICO GRABACIÓN

- [ ] Resolución 1920x1080
- [ ] Navegador en pantalla completa (F11)
- [ ] Zoom 100% (Ctrl+0)
- [ ] Ocultar barra de favoritos (Ctrl+Shift+B)
- [ ] API corriendo en :5143
- [ ] Frontend en :5500
- [ ] Usuario demo limpio (borrar localStorage antes)
- [ ] Grabador: OBS Studio / Xbox Game Bar / Playwright video
- [ ] Audio: micrófono claro, sin ruido fondo
- [ ] Duración total: 6-8 min