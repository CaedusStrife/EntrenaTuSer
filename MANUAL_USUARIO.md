# Manual de Usuario - Entrena Tu Ser

Guía paso a paso para usar la plataforma de entrenamiento.

---

## 1. Primer acceso y registro

### 1.1 Abrir la aplicación
1. Asegúrate de tener la API corriendo en `http://localhost:5143`
2. Abre el frontend en `http://localhost:5500`
3. Verás la pantalla de **Login** con diseño Ebru animado (burbujas, estelas, anillos)

### 1.2 Crear cuenta
1. Haz clic en **"Crear una"** (debajo del botón "Iniciar sesión")
2. Completa el formulario:
   - **Nombre**: Tu nombre completo
   - **Correo**: Email válido (será tu usuario)
   - **Contraseña**: Mínimo 8 caracteres
   - **Confirmar contraseña**: Igual que la anterior
3. Haz clic en **"Registrarse"**
4. Verás animación de éxito (checkmark verde) y pasarás al **Dashboard de Progreso**

> **Nota**: El sistema usa JWT. Tu token se guarda en el navegador y se envía automáticamente en cada petición.

---

## 2. Dashboard de Progreso (Pestaña principal)

Al iniciar sesión llegas a **Progreso**. Aquí ves tu estado global:

### 2.1 Tarjetas de métricas (4 tarjetas)
| Tarjeta | Qué muestra |
|---------|-------------|
| **Minutos** | Total de minutos entrenados |
| **Nivel** | Nivel actual (basado en puntos) |
| **Medallas** | Cantidad de medallas desbloqueadas |
| **Puntos** | XP total acumulado |

### 2.2 Gráfica semanal + Avatar 3D
- **Gráfica de barras**: Minutos por día (Lun-Dom)
- **Avatar 3D**: Modelo animado que reacciona a tu nivel

### 2.3 Metas semanales
- Campo **Minutos objetivo/semana** + botón **Guardar meta**
- Barra de progreso semanal en tiempo real
- Se persiste en base de datos y localStorage

### 2.4 Historial de entrenamientos
Lista cronológica con:
- Fecha y hora
- Rutina realizada
- Duración
- Puntos ganados

### 2.5 Medallas
Lista de todas las medallas:
- **Desbloqueadas**: Color completo + fecha
- **Bloqueadas**: Gris + descripción de cómo obtenerla

**Medallas disponibles:**
1. 🥇 **Primer Paso** - Primer entrenamiento completado
2. 🔥 **Trío Activo** - 3 días consecutivos
3. 📅 **Constancia** - 7 días entrenando
4. ⭐ **Mil Puntos** - 1000 XP acumulados
5. 🏆 **Nivel 3** - Alcanzar nivel 3
6. 💪 **Rutina Completa** - Terminar una rutina guiada
7. 🎯 **Meta Alcanzada** - Cumplir meta semanal

---

## 3. Entrenamiento (Pestaña)

### 3.1 Lista de ejercicios
- Ejercicios agrupados en **categorías desplegables** (Calentamiento, Principal, Recuperación)
- Haz clic en ▶ para expandir/colapsar cada categoría
- Cada tarjeta muestra: nombre, dificultad, duración, tipo

### 3.2 Panel de video (lado derecho)
1. Haz clic en cualquier ejercicio → se abre panel **Video Guía** a la derecha
2. Video en **loop** + **playsinline** (móvil)
3. Botón **Cerrar** para volver a la lista

### 3.3 Entrenamiento libre
- Botón **"Completar ejercicio"** bajo el video
- Suma puntos y registra en historial

---

## 4. Entrenamiento Guiado (Rutinas)

### 4.1 Iniciar una rutina
1. Ve a **Mis Rutinas**
2. Crea una rutina nueva o usa una guardada
3. Haz clic en **"Iniciar"** en la tarjeta de la rutina

### 4.2 Panel de entrenamiento guiado
Controles visibles:
| Control | Función |
|---------|---------|
| **Timer** | Cuenta regresiva del ejercicio actual |
| **Ejercicio X de Y** | Indicador de posición en la rutina |
| **Barra de progreso** | Progreso global de la rutina |
| **Video** | Guía visual del ejercicio actual |
| **Descanso** | Dropdown: 0 / 15 / 30 / 60 segundos |
| **Pausar/Continuar** | Detiene/reanuda timer |
| **Anterior** | Vuelve al ejercicio previo |
| **Siguiente** | Avanza al siguiente ejercicio |
| **Finalizar** | Termina la rutina antes de tiempo |

### 4.3 Descansos entre ejercicios
- Al hacer **Siguiente**, aparece panel de descanso con contador
- Botón **"Saltar descanso"** para continuar inmediato
- Configurable por rutina (0/15/30/60s)

### 4.4 Resumen visual al finalizar
Al completar la rutina ves:
- Tiempo total
- Ejercicios completados
- Puntos ganados
- XP y nivel
- Botón **"Guardar esta rutina"** (opcional)

---

## 5. Mis Rutinas (Pestaña)

### 5.1 Ver rutinas guardadas
- Lista en tarjetas con: nombre, objetivo, nivel, tiempo, días/semana
- Botones: **Iniciar**, **Editar**, **Eliminar**

### 5.2 Crear rutina personalizada
1. Botón **"Nueva Rutina"**
2. **Generador personalizado** (fieldset superior):
   - **Objetivo**: Cuerpo completo / Fuerza / Core / Movilidad
   - **Nivel**: Principiante / Intermedio / Avanzado
   - **Tiempo**: 10 / 20 / 30 minutos
3. Botón **"Generar rutina"** → lista ejercicios sugeridos
4. Completa nombre y descripción
5. **Guardar rutina**

### 5.3 Editar / Duplicar / Eliminar
- **Editar**: Modifica nombre, descripción, ejercicios
- **Duplicar**: Copia rutina existente para variarla
- **Eliminar**: Confirmación accesible (sin `alert()`)

---

## 6. Mapa y Ubicación (Pestaña)

### 6.1 Mapa interactivo (Leaflet)
- Marcadores: 🟢 Rutinas / 🔵 Entrenamientos / 🟣 Personalizados
- Controles: **Mi ubicación** (GPS), **Zoom +/–**

### 6.2 Lugares cercanos
- Grid de tarjetas: Parques, Gimnasios, Pistas
- Cada tarjeta: nombre, distancia, tipo, botón "Ver en mapa"

---

## 7. Chatbot Asistente (Flotante, botón 💬)

### 7.1 Abrir/cerrar
- Botón flotante inferior derecho (icono mensaje)
- Panel lateral con historial de conversación

### 7.2 Qué puedes preguntar
| Tipo | Ejemplos |
|------|----------|
| **Generar rutina** | "Hazme una rutina para principiantes de 15 min" |
| **Recomendación diaria** | "¿Qué debo entrenar hoy según mi progreso?" |
| **Instrucción ejercicio** | "¿Cómo se hace una sentadilla correctamente?" |
| **Adaptar rutina** | "Cambia las sentadillas por zancadas" |
| **Simplificar** | "Haz la rutina más sencilla" |
| **Poco tiempo** | "Tengo solo 10 minutos" |

> El chatbot usa tu **nivel, historial, metas y rutinas guardadas** para responder contextualizado.

---

## 8. Accesibilidad (Botón ♿, panel lateral)

### 8.1 Tamaño de texto
- **A+** Aumentar (hasta 2x)
- **A-** Reducir
- **A** Restablecer

### 8.2 Temas visuales
- **Modo Oscuro** 🌙/☀️ (persistente en localStorage)
- **Alto Contraste** (WCAG AAA)
- **Reducir Animaciones** (desactiva transiciones, Ebru, avatar 3D)

### 8.3 Reset total
- Botón **"Restablecer opciones"** vuelve a valores por defecto

### 8.4 Navegación por teclado
- **Tab** / **Shift+Tab**: Navegar elementos enfocables
- **Enter** / **Espacio**: Activar botones/links
- **Escape**: Cerrar modales, paneles, confirm sheets
- **Skip link**: "Saltar al contenido principal" (primer Tab)

---

## 9. Notificaciones (Sistema interno, sin alert())

### 9.1 Toasts (esquina superior derecha)
- **Verde (success)**: Acciones completadas ("Entrenamiento guardado +50 XP")
- **Rojo (error)**: Fallos de red/API ("Error de conexión. Reintentando...")
- **Azul (info)**: Medallas, avisos ("Nueva medalla: Primer Paso")
- Auto-desaparecen a los 3-5 segundos

### 9.2 Confirm Sheets (modales accesibles)
- Reemplazan `confirm()` nativo
- Título + mensaje + botones **Confirmar** / **Cancelar**
- Cerrar con **Escape** o click fuera
- Focus trap dentro del modal

---

## 10. Cerrar sesión

1. Abre sidebar (☰)
2. Botón **"Cerrar sesión"** (rojo, abajo)
3. Vuelve a **Login Ebru** con animaciones

---

## 11. Atajos y consejos rápidos

| Acción | Método |
|--------|--------|
| Cambiar pestaña | Sidebar (☰) → click en nombre |
| Ver video ejercicio | Click en tarjeta ejercicio (Entrenamiento) |
| Iniciar rutina guiada | Mis Rutinas → Iniciar |
| Preguntar al chatbot | Botón 💬 → escribir → Enter |
| Activar modo oscuro | ♿ → Modo Oscuro |
| Ver medallas | Pestaña Progreso → scroll abajo |
| Cambiar meta semanal | Progreso → campo minutos → Guardar |

---

## 12. Solución de problemas

| Problema | Solución |
|----------|----------|
| "No se pudieron cargar los ejercicios" | Verifica API en `http://localhost:5143/api/exercises` |
| Error 401 / 403 | Cierra sesión y vuelve a entrar (token expirado o ajeno) |
| Video no reproduce | Formato MP4/WebM requerido; verifica `video_url` en BD |
| Mapa no carga | Conexión a internet requerida (tiles OpenStreetMap) |
| Animaciones lentas | ♿ → Reducir Animaciones |

---

## 13. Requisitos técnicos (para desarrolladores)

Ver [README.md](README.md) para:
- Instalación y configuración BD
- Ejecución API + Frontend
- Endpoints API documentados
- Pruebas E2E con Playwright
- Estructura de carpetas
- Diagramas Mermaid (arquitectura + ER)