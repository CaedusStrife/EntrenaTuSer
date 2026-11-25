# Carpeta de Capturas para el Manual de Usuario

Esta carpeta debe contener las capturas de pantalla reales de la aplicación para reemplazar los placeholders en `MANUAL_USUARIO.html`.

## Lista de capturas necesarias (26 archivos)

| Archivo | Descripción | Sección del Manual |
|---------|-------------|-------------------|
| `01-registro.png` | Pantalla de Registro — Formulario completo con campos | 2.1 |
| `02-login.png` | Pantalla de Login — Formulario de inicio de sesión | 2.2 |
| `03-recuperacion.png` | Flujo de Recuperación — Pantalla de solicitud + nueva contraseña | 2.3 |
| `04-navegacion.png` | Barra de Navegación — 5 pestañas inferiores | 3 |
| `05-metricas.png` | Métricas Semanales — 4 tarjetas (minutos, ejercicios, puntos, meta) | 4.1 |
| `06-grafico.png` | Gráfico Semanal — Barras por día (Lun-Dom) | 4.2 |
| `07-meta.png` | Meta Semanal — Panel con barra de progreso y botón Editar | 4.3 |
| `08-historial.png` | Historial — Lista de entrenamientos con detalles | 4.4 |
| `09-medallas.png` | Medallas — Grid 18 medallas (coloreadas/grises) | 4.5 |
| `10-estadisticas.png` | Estadísticas Totales — Grid vitalicio | 4.6 |
| `11-seleccion.png` | Selección Ejercicios — Tarjetas con filtros/buscador | 5.1 |
| `12-detalles.png` | Detalles Ejercicio — Panel lateral (músculos, descripción, consejos) | 5.2 |
| `13-entrenamiento.png` | Entrenamiento Activo — Video, temporizador, controles, barra | 5.4 |
| `14-descanso.png` | Pantalla Descanso — Cuenta regresiva, siguiente ejercicio, botón Saltar | 5.5 |
| `15-rutinas.png` | Mis Rutinas — Grid tarjetas con botones acción | 6.1 |
| `16-wizard1.png` | Wizard Paso 1 — Datos básicos (nombre, objetivo, nivel, tiempo) | 6.2 |
| `17-wizard2.png` | Wizard Paso 2 — Selector izquierdo + lista seleccionados derecha | 6.2 |
| `18-wizard3.png` | Wizard Paso 3 — Resumen completo con lista y tiempo total | 6.2 |
| `19-mapa.png` | Mapa — Centrado en ubicación, marcadores, panel lateral | 7.1 |
| `20-lugares.png` | Panel Lugares — Lista tarjetas con distancia y botón Ver en mapa | 7.2 |
| `21-avatar.png` | Avatar 3D — Avatar interactivo + modal edición | 8.1 |
| `22-info.png` | Info Personal — Modo lectura con botón Editar | 8.2 |
| `23-accesibilidad.png` | Preferencias Accesibilidad — Toggles + selector tamaño | 8.4 |
| `24-eliminar.png` | Eliminar Cuenta — Modal rojo con campo ELIMINAR | 8.5 |
| `25-chatbot.png` | Chatbot — Panel lateral con conversación ejemplo | 9 |
| `26-panel-accesibilidad.png` | Panel Accesibilidad Rápida — 7 botones de acceso rápido | 10 |

---

## Instrucciones para tomar las capturas

### Opción A: Navegador (recomendado)
1. Abre `index.html` en tu navegador (servidor local o archivo directo)
2. Navega a cada pantalla
3. Usa la herramienta de captura del SO:
   - **Windows:** `Win + Shift + S` → Selecciona área → Guarda
   - **Mac:** `Cmd + Shift + 4` → Selecciona área
   - **Linux:** `PrtSc` o herramienta de capturas del DE
4. Renombra y guarda en esta carpeta

### Opción B: DevTools (para capturas full-page)
1. Abre DevTools (`F12`)
2. `Ctrl/Cmd + Shift + P` → "Capture full size screenshot"
3. Recorta si necesario

### Resolución recomendada
- **Ancho:** 1200–1600 px (se escalará al 100% del contenedor)
- **Formato:** PNG (mejor para UI con texto)
- **Nombrado:** Exactamente como la tabla arriba (01-registro.png, etc.)

---

## Verificación

Después de colocar todas las imágenes:
1. Abre `MANUAL_USUARIO.html` en el navegador
2. Verifica que no aparecen los placeholders grises
3. Si alguna imagen no carga, revisa:
   - Nombre exacto del archivo (case-sensitive en Linux)
   - Ruta: `images/manual/XX-nombre.png`
   - Extensión `.png`

---

## Placeholders actuales

El HTML usa `onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';"` para mostrar un placeholder gris con texto descriptivo cuando la imagen no existe. Al agregar la imagen real, el placeholder se oculta automáticamente.