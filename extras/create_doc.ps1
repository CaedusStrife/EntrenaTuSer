Add-Type -AssemblyName 'Microsoft.Office.Interop.Word'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()

# Helper functions
function Add-Heading($text, $level) {
    $para = $doc.Paragraphs.Add()
    $para.Range.Text = $text
    $para.Style = $doc.Styles.Item("Heading $level")
}

function Add-Paragraph($text) {
    $para = $doc.Paragraphs.Add()
    $para.Range.Text = $text
}

function Add-Bullet($text) {
    $para = $doc.Paragraphs.Add()
    $para.Range.Text = $text
    $para.Range.ListFormat.ApplyBulletDefault()
}

# Title
$para = $doc.Paragraphs.Add()
$para.Range.Text = "Entrena Tu Ser - Discurso de Presentación (5 minutos)"
$para.Style = $doc.Styles.Item("Title")

$para = $doc.Paragraphs.Add()
$para.Range.Text = "Para audiencia no técnica"
$para.Style = $doc.Styles.Item("Subtitle")

# Section 1
Add-Heading "1. INTRODUCCIÓN (30 segundos)" 1
Add-Paragraph "Buenos días/tardes. Mi nombre es [Tu Nombre] y hoy les quiero presentar 'Entrena Tu Ser', una aplicación web diseñada para que cualquier persona, sin importar su experiencia, pueda entrenar de forma guiada, segura y motivadora desde su casa o el gimnasio."
Add-Paragraph ""
Add-Paragraph "El problema: Mucha gente quiere ponerse en forma pero no sabe por dónde empezar. Los videos de YouTube son genéricos, las apps caras son confusas, y contratar un entrenador personal no está al alcance de todos. Además, es fácil perder la motivación después de la primera semana."
Add-Paragraph "La solución: Entrena Tu Ser es como tener un entrenador personal en tu bolsillo. Te crea rutinas personalizadas según tu objetivo, nivel, tiempo disponible y zona corporal que quieras trabajar. Te guía ejercicio por ejercicio con videos, temporizadores y descansos. Y te mantiene motivado con metas, progreso visual y medallas por logros."

# Section 2
Add-Heading "2. ¿PARA QUIÉN ES ESTA APLICACIÓN? (30 segundos)" 1
Add-Bullet "Principiantes que nunca han entrenado y no saben qué ejercicios hacer"
Add-Bullet "Personas con poco tiempo que necesitan rutinas eficientes de 20-30 minutos"
Add-Bullet "Quienes entrenan en casa sin equipamiento profesional"
Add-Bullet "Personas que pierden la motivación y necesitan seguimiento visual de su progreso"
Add-Bullet "Cualquiera que quiera una guía clara, sin jerga técnica, paso a paso"

# Section 3
Add-Heading "3. FUNCIONALIDADES PRINCIPALES (2 minutos)" 1

Add-Heading "A. Rutinas Personalizadas - Tu plan a medida" 2
Add-Paragraph "Respondes 5 preguntas simples: ¿Cuál es tu objetivo? (fuerza, resistencia, pérdida de peso, mantenimiento). ¿Cuál es tu nivel? (principiante, intermedio, avanzado). ¿Cuánto tiempo tienes? (15, 30, 45, 60 minutos). ¿Qué zona quieres trabajar? (piernas, pecho, espalda, brazos, core, cuerpo completo). ¿Cuántos días a la semana? La app genera automáticamente una rutina equilibrada con ejercicios adecuados para ti. No necesitas saber nada de anatomía ni programación de entrenamientos."

Add-Heading "B. Entrenamiento Guiado - Tu entrenador en pantalla" 2
Add-Paragraph "Cuando empiezas una rutina, la app te muestra:"
Add-Bullet "El nombre del ejercicio y un video demostrativo en bucle (se repite automáticamente)"
Add-Bullet "Un temporizador grande que cuenta los segundos de cada ejercicio"
Add-Bullet "Botones claros: Pausar, Siguiente, Anterior, Finalizar"
Add-Bullet 'Un indicador: "Ejercicio 3 de 8" para que siempre sepas dónde vas'
Add-Bullet "Una barra de progreso que se llena a medida que avanzas"
Add-Bullet "Descansos configurables entre ejercicios (0, 15, 30, 60 segundos) con contador y opción de Saltar descanso"

Add-Heading "C. Seguimiento de Progreso - Ve tus resultados" 2
Add-Bullet "Gráficas semanales: minutos entrenados, ejercicios completados, puntos ganados"
Add-Bullet 'Metas semanales que tú defines (ej: "entrenar 3 veces esta semana")'
Add-Bullet "Calendario visual de 90 días: cada día que entrenas se marca en verde"
Add-Bullet "Rachas: cuántos días consecutivos has entrenado (tu racha actual y tu récord histórico)"
Add-Bullet "Resumen al final de cada rutina: tiempo total, ejercicios hechos, calorías estimadas, puntos ganados"

Add-Heading "D. Gamificación - Diviértete mientras entrenas" 2
Add-Paragraph "La app te otorga medallas automáticas por hitos reales:"
Add-Bullet "Primer Paso - tu primer entrenamiento completado"
Add-Bullet "Trío Activo - 3 días seguidos entrenando"
Add-Bullet "Constancia - 7 días seguidos"
Add-Bullet "Mil Puntos - acumular 1000 puntos"
Add-Bullet "Nivel 3 - alcanzar el nivel 3 de experiencia"
Add-Bullet "Y más: por completar rutinas, alcanzar metas, entrenar diferentes zonas corporales"
Add-Paragraph "Cada medalla muestra su nombre, icono, descripción y la fecha exacta en que la desbloqueaste. Las medallas que aún no tienes se ven bloqueadas con su requisito para que sepas cómo conseguirlas."

Add-Heading "E. Chatbot Inteligente - Pregunta lo que quieras" 2
Add-Paragraph "No es un bot genérico. Conoce tu nivel, tu historial, tus metas y tus rutinas guardadas. Puedes escribirle cosas como:"
Add-Bullet "Hazme una rutina para principiantes de 20 minutos"
Add-Bullet "Tengo dolor de rodilla, cambia las sentadillas"
Add-Bullet "¿Cómo se hace correctamente el plank?"
Add-Bullet "¿Qué debo entrenar hoy según mi historial?"
Add-Bullet "Quiero una rutina más sencilla"
Add-Paragraph "Y te responde con recomendaciones personalizadas, no respuestas copiadas de internet."

Add-Heading "F. Mapa de Gimnasios - Encuentra dónde entrenar" 2
Add-Paragraph "Si prefieres ir a un gimnasio, la app te muestra un mapa interactivo con gimnasios cercanos a tu ubicación, con información de cada uno."

# Section 4
Add-Heading "4. DISEÑADO PARA TODOS - ACCESIBILIDAD (30 segundos)" 1
Add-Paragraph "Esta aplicación cumple con estándares internacionales de accesibilidad (WCAG 2.1 nivel AA):"
Add-Bullet "Navegación completa con teclado (sin necesidad de ratón)"
Add-Bullet "Contraste alto opcional para personas con baja visión"
Add-Bullet "Tamaño de texto ajustable (A+, A-, Reset)"
Add-Bullet "Modo oscuro para reducir fatiga visual"
Add-Bullet "Reducción de animaciones para personas sensibles al movimiento"
Add-Bullet "Etiquetas para lectores de pantalla (personas ciegas)"
Add-Bullet 'Enlace "Saltar al contenido principal" para ir directo a lo importante'
Add-Bullet "Notificaciones suaves (toasts) en lugar de ventanas emergentes molestas"

# Section 5
Add-Heading "5. SEGURIDAD Y PRIVACIDAD (30 segundos)" 1
Add-Bullet "Tus datos viajan encriptados (HTTPS)"
Add-Bullet "Contraseñas guardadas de forma segura (hash + salt, nunca en texto plano)"
Add-Bullet "Autenticación con tokens JWT: tu sesión dura 8 horas, luego vuelves a entrar"
Add-Bullet "Solo TÚ ves TUS datos: la app verifica que cada petición pertenezca al usuario logueado"
Add-Bullet "Base de datos local SQL Server: tus datos no van a la nube de terceros"
Add-Bullet "Indicador en tiempo real del estado de la base de datos y la API"

# Section 6
Add-Heading "6. DEMOSTRACIÓN RÁPIDA - LO QUE VERÁN EN EL VIDEO (1 minuto)" 1
Add-Paragraph "El video grabado muestra el flujo completo de un usuario real:"
Add-Bullet "1. Registro e inicio de sesión (30 seg)"
Add-Bullet "2. Dashboard de progreso con gráficas, metas y calendario de 90 días con racha (45 seg)"
Add-Bullet "3. Panel de entrenamiento con video, temporizador y navegación (45 seg)"
Add-Bullet "4. Sección Mis Rutinas - crea una rutina personalizada desde cero (60 seg)"
Add-Bullet "5. Mapa de gimnasios interactivo (30 seg)"
Add-Bullet "6. Entrenamiento guiado completo: ejercicio 1 a 8 con descansos (90 seg)"
Add-Bullet "7. Resumen visual final de la rutina (30 seg)"
Add-Bullet "8. Chatbot respondiendo preguntas contextuales (45 seg)"
Add-Bullet "9. Panel de accesibilidad: modo oscuro, tamaño texto, alto contraste (30 seg)"
Add-Bullet "10. Notificaciones suaves y confirmaciones (15 seg)"
Add-Bullet "11. Cierre de sesión y pantalla final (5 seg)"
Add-Paragraph ""
Add-Paragraph "Duración total del video: ~1 minuto 50 segundos (versión acelerada para demo). En uso real, una rutina completa toma 20-40 minutos."

# Section 7
Add-Heading "7. BAJO EL CAPÓ - TECNOLOGÍA (30 segundos)" 1
Add-Paragraph "Para los curiosos, la app está construida con tecnologías modernas y robustas:"
Add-Bullet "Frontend: HTML, CSS y JavaScript puro (sin frameworks pesados, carga instantánea)"
Add-Bullet "Backend: ASP.NET Core 10 (Microsoft), C# - alto rendimiento y seguridad empresarial"
Add-Bullet "Base de datos: SQL Server - estándar de la industria, confiable y escalable"
Add-Bullet "Autenticación: JWT (JSON Web Tokens) - estándar abierto usado por Google, Microsoft, Amazon"
Add-Bullet "Tests automatizados: Playwright - simulan usuarios reales para detectar errores antes de que ustedes los vean"
Add-Bullet "Documentación completa: README técnico, manual de usuario, presentación, diagramas de arquitectura y base de datos"

# Section 8
Add-Heading "8. ESTADO ACTUAL Y PRÓXIMOS PASOS (30 segundos)" 1
Add-Paragraph "COMPLETADO (100% del plan original):"
Add-Bullet "9 fases implementadas: estabilización, entrenamiento interactivo, rutinas personalizadas, metas y progreso, medallas, chatbot, accesibilidad, seguridad, documentación"
Add-Bullet "Video demo grabado y tests automatizados pasando"
Add-Bullet "Manual de usuario (13 secciones) y presentación (10 diapositivas) listos"
Add-Paragraph ""
Add-Paragraph "PRÓXIMAS MEJORAS OPCIONALES:"
Add-Bullet "Capturas de pantalla en el manual de usuario"
Add-Bullet "Exportar presentación a PowerPoint/PDF"
Add-Bullet 'Pantalla amigable "Servidor no disponible" con botón de reintento'
Add-Bullet "Notificaciones push (recordatorios de entrenamiento)"
Add-Bullet "Modo offline para entrenar sin internet"
Add-Bullet "Compartir logros en redes sociales"

# Section 9
Add-Heading "9. CIERRE (30 segundos)" 1
Add-Paragraph "Entrena Tu Ser no es solo otra app de fitness. Es una herramienta pensada desde la empatía: para la persona que se intimida en el gimnasio, para quien tiene 20 minutos entre el trabajo y la cena, para quien lo ha intentado mil veces y se rinde a la semana."
Add-Paragraph ""
Add-Paragraph "Combina tres cosas que rara vez van juntas: ciencia del entrenamiento (rutinas equilibradas), psicología conductual (gamificación, rachas, metas) y tecnología accesible (funciona en cualquier navegador, para cualquier persona)."
Add-Paragraph ""
Add-Paragraph "Gracias por su tiempo. Estoy a su disposición para preguntas, para mostrarles la app en vivo, o para enviarles el video demo, el manual de usuario o la presentación completa."

# Page break for notes
$doc.Content.InsertBreak([Microsoft.Office.Interop.Word.WdBreakType]::wdPageBreak)
Add-Heading "NOTAS PARA EL PRESENTADOR" 1
Add-Paragraph ""

Add-Heading "Tiempos sugeridos por sección:" 2
Add-Bullet "1. Introducción: 30 seg"
Add-Bullet "2. Público objetivo: 30 seg"
Add-Bullet "3. Funcionalidades: 2 min"
Add-Bullet "4. Accesibilidad: 30 seg"
Add-Bullet "5. Seguridad: 30 seg"
Add-Bullet "6. Demo: 1 min"
Add-Bullet "7. Tecnología: 30 seg"
Add-Bullet "8. Estado/Próximos: 30 seg"
Add-Bullet "9. Cierre: 30 seg"
Add-Bullet "TOTAL: ~5 minutos"

Add-Paragraph ""
Add-Heading "Consejos de entrega:" 2
Add-Bullet "Habla lento y claro, evita jerga técnica"
Add-Bullet 'Usa analogías: "es como tener un entrenador en el bolsillo", "el calendario es como el de GitHub pero para tu cuerpo"'
Add-Bullet "Si hay pantalla, muestra el video demo en la sección 6"
Add-Bullet 'Enfatiza "diseñado para NO programadores" en accesibilidad'
Add-Bullet 'Prepara respuestas para: "¿Cuánto cuesta?", "¿Está en iOS/Android?", "¿Necesito internet?", "¿Venden mis datos?"'

Add-Paragraph ""
Add-Heading "Preguntas frecuentes anticipadas:" 2
Add-Bullet "P: ¿Cuánto cuesta? R: Es un proyecto académico/demo, gratuito. En producción sería freemium."
Add-Bullet "P: ¿Está en la App Store/Play Store? R: Es una Progressive Web App (PWA), funciona en el navegador del móvil como si fuera app nativa, se puede instalar desde el menú del navegador."
Add-Bullet "P: ¿Necesito internet siempre? R: Actualmente sí (para videos y base de datos). Modo offline planeado."
Add-Bullet "P: ¿Venden mis datos? R: No. Base de datos local, sin terceros, sin analytics de tracking."
Add-Bullet "P: ¿Puedo usarlo en mi gimnasio? R: Sí, el mapa te muestra gimnasios cercanos y la rutina funciona en cualquier lugar."

# Save
$savePath = "C:\Users\caedu\OneDrive\Desktop\Entrenatuser\PRESENTACION_5_MINUTOS.docx"
$doc.SaveAs($savePath)
$doc.Close()
$word.Quit()
Write-Host "Documento creado exitosamente en: $savePath"