# Plan estructurado para cumplir con los documentos

## Alcance ajustado

No se tomarán en cuenta los siguientes puntos de la propuesta:

1. Aplicación móvil.
2. Detección de movimientos mediante cámara.
3. Avatar como guía animada durante los ejercicios.

El avatar 3D podrá mantenerse como elemento visual del dashboard.

En el perfil se incluirá personalización común:

- Nombre completo.
- Correo electrónico.
- Foto, iniciales o color de perfil.
- Cambio de contraseña.
- Tema claro u oscuro.
- Tamaño de texto.
- Alto contraste.
- Reducción de movimiento.
- Preferencias básicas de entrenamiento.

## Fase 1: Corregir la base técnica

### 1.1 Ajustar la base de datos

- Agregar `usuario_id` y `creada_en` a `rutinas`.
- Agregar `tiempo_descanso_seg` a `rutina_ejercicios`.
- Agregar campos de perfil y preferencias de usuario.
- Agregar las siete medallas requeridas.
- Verificar claves foráneas, restricciones e índices.
- Comprobar que una instalación nueva funcione sin modificaciones manuales.

### 1.2 Revisar la API

- Implementar consulta y actualización del perfil.
- Implementar cambio de contraseña.
- Implementar actualización de preferencias.
- Validar la propiedad de rutinas, progreso e historial.
- Estandarizar respuestas `400`, `401`, `403` y `404`.
- Documentar todos los endpoints.

## Fase 2: Completar el perfil del usuario

Crear una sección **Mi perfil** con:

- Nombre completo.
- Correo electrónico.
- Foto, iniciales o color de perfil.
- Cambio de contraseña.
- Tema claro u oscuro.
- Tamaño de texto.
- Alto contraste y reducción de movimiento.
- Preferencias de entrenamiento.
- Botón para cerrar sesión.
- Opción para eliminar la cuenta, si se requiere.

Las preferencias deberán guardarse asociadas al usuario, no únicamente en
`localStorage`.

## Fase 3: Completar rutinas y entrenamiento

El usuario deberá poder:

- Crear una rutina.
- Editarla.
- Consultarla.
- Duplicarla.
- Eliminarla.
- Agregar ejercicios, orden, series, repeticiones y descanso.
- Iniciar una rutina.
- Pausar y continuar.
- Saltar descansos.
- Finalizar una rutina.
- Ver el ejercicio actual, el total de ejercicios, el tiempo restante y el porcentaje de avance.
- Registrar correctamente la sesión.

El sistema deberá distinguir entre:

- Rutina iniciada.
- Rutina completada.
- Rutina cancelada o interrumpida.

## Fase 4: Mejorar progreso y gamificación

Implementar y validar las siete medallas:

1. Primer paso.
2. Trío activo.
3. Constancia.
4. Mil puntos.
5. Nivel 3.
6. Rutina completa.
7. Meta alcanzada.

Cada medalla deberá tener:

- Condición verificable.
- Registro en la base de datos.
- Fecha de obtención.
- Estado bloqueado o desbloqueado.
- Notificación visual.

También se deberá verificar que:

- Los puntos solo se otorguen por actividades registradas.
- El nivel dependa de reglas documentadas.
- Las metas actualicen su progreso correctamente.
- El historial muestre fecha, rutina, duración y puntos.

## Fase 5: Mejorar el avatar y la presentación visual

Como el avatar no será una guía durante los ejercicios, se documentará que su
función es:

- Representar al usuario en el dashboard.
- Mostrar visualmente su progreso.
- Cambiar según el nivel, si aplica.
- Mantener una presentación coherente y accesible.

Opcionalmente, se podrán agregar cambios estéticos sencillos:

- Color.
- Accesorio.
- Estilo visual.
- Estado visual según el nivel.

No se deberá afirmar que el avatar analiza o demuestra movimientos.

## Fase 6: Definir correctamente el chatbot

El chatbot deberá documentarse como un **asistente local basado en reglas**, no
como una IA externa.

Deberá poder:

- Recomendar rutinas.
- Utilizar el nivel, las metas y el progreso.
- Dar instrucciones básicas.
- Recomendar calentamientos y descansos.
- Advertir que no sustituye a un profesional.
- Permitir guardar rutinas sugeridas.

La documentación no deberá afirmar que existe streaming o inteligencia
artificial externa si no está implementada.

## Fase 7: Accesibilidad y usabilidad

Validar:

- Navegación con teclado.
- Foco visible.
- Uso correcto de `Escape`.
- Compatibilidad con lectores de pantalla.
- Etiquetas ARIA.
- Contraste suficiente.
- Tamaños de texto.
- Reducción de animaciones.
- Diseño responsive para computadora, tableta y móvil web.
- Mensajes claros de éxito y error.

También se deberá realizar una auditoría manual WCAG 2.1 AA y registrar los
resultados.

## Fase 8: Seguridad

Validar:

- Contraseñas almacenadas mediante hash.
- JWT con expiración.
- Protección de endpoints privados.
- Validación de propiedad por usuario.
- Ausencia de claves y contraseñas en el repositorio.
- Validación de entradas.
- Protección contra el acceso a rutinas e historiales ajenos.
- Configuración segura para producción.
- HTTPS en el despliegue.

## Fase 9: Pruebas

### Pruebas funcionales

- Registro.
- Inicio de sesión.
- Perfil.
- Cambio de contraseña.
- CRUD de rutinas.
- Entrenamiento.
- Historial.
- Metas.
- Medallas.
- Chatbot.
- Accesibilidad.

### Pruebas de integración

- Comunicación entre frontend y API.
- Comunicación entre API y SQL Server.
- Registro de una sesión y consulta posterior.
- Actualización de puntos, niveles y medallas.

### Pruebas de seguridad

- Endpoint sin token.
- Token inválido.
- Acceso a datos de otro usuario.
- Modificación de rutinas de otro usuario.

### Pruebas de compatibilidad

- Chrome.
- Edge.
- Firefox.
- Vista móvil web.
- Tableta.
- Escritorio.

## Fase 10: Actualizar la documentación

Actualizar:

- `README.md`
- `PRODUCT.md`
- `MANUAL_USUARIO.md`
- `INFORME_CALIDAD_Y_PRUEBAS.md`

La documentación deberá indicar explícitamente:

- Que el proyecto es una plataforma web.
- Que la aplicación móvil está fuera del alcance.
- Que la detección por cámara está fuera del alcance.
- Que el avatar no guía movimientos.
- Que el perfil cuenta con personalización común.
- Que el chatbot funciona mediante respuestas locales.
- Qué requisitos están implementados.
- Qué funcionalidades quedan como mejoras futuras.

## Orden recomendado de ejecución

1. Corregir el esquema de la base de datos.
2. Completar la API del perfil.
3. Crear la pantalla de perfil.
4. Corregir rutinas y estados de entrenamiento.
5. Completar medallas y metas.
6. Validar progreso e historial.
7. Terminar accesibilidad y seguridad.
8. Ampliar las pruebas.
9. Actualizar la documentación.
10. Ejecutar una demostración final de todos los criterios.

## Resultado esperado

Una plataforma web completa, coherente con el alcance ajustado, con los
requisitos aplicables de la propuesta implementados, documentados y
comprobados mediante pruebas.
