Add-Type -AssemblyName 'Microsoft.Office.Interop.Word'
$word = New-Object -ComObject Word.Application
$word.Visible = $false
$doc = $word.Documents.Add()

function Add-H($text, $level) {
    $p = $doc.Paragraphs.Add()
    $p.Range.Text = $text
    $p.Style = $doc.Styles.Item("Heading $level")
}

function Add-P($text) {
    $p = $doc.Paragraphs.Add()
    $p.Range.Text = $text
}

function Add-B($text) {
    $p = $doc.Paragraphs.Add()
    $p.Range.Text = $text
    $p.Range.ListFormat.ApplyBulletDefault()
}

# Title
$p = $doc.Paragraphs.Add()
$p.Range.Text = "Entrena Tu Ser - Discurso de Presentacion (5 minutos)"
$p.Style = $doc.Styles.Item("Title")

$p = $doc.Paragraphs.Add()
$p.Range.Text = "Para audiencia no tecnica"
$p.Style = $doc.Styles.Item("Subtitle")

# Section 1
Add-H "1. INTRODUCCION (30 segundos)" 1
Add-P "Buenos dias/tardes. Mi nombre es [Tu Nombre] y hoy les quiero presentar Entrena Tu Ser, una aplicacion web disenada para que cualquier persona, sin importar su experiencia, pueda entrenar de forma guiada, segura y motivadora desde su casa o el gimnasio."
Add-P ""
Add-P "El problema: Mucha gente quiere ponerse en forma pero no sabe por donde empezar. Los videos de YouTube son genericos, las apps caras son confusas, y contratar un entrenador personal no esta al alcance de todos. Ademas, es facil perder la motivacion despues de la primera semana."
Add-P "La solucion: Entrena Tu Ser es como tener un entrenador personal en tu bolsillo. Te crea rutinas personalizadas segun tu objetivo, nivel, tiempo disponible y zona corporal que quieras trabajar. Te guia ejercicio por ejercicio con videos, temporizadores y descansos. Y te mantiene motivado con metas, progreso visual y medallas por logros."

# Section 2
Add-H "2. PARA QUIEN ES ESTA APLICACION? (30 segundos)" 1
Add-B "Principiantes que nunca han entrenado y no saben que ejercicios hacer"
Add-B "Personas con poco tiempo que necesitan rutinas eficientes de 20-30 minutos"
Add-B "Quienes entrenan en casa sin equipamiento profesional"
Add-B "Personas que pierden la motivacion y necesitan seguimiento visual de su progreso"
Add-B "Cualquiera que quiera una guia clara, sin jerga tecnica, paso a paso"

# Section 3
Add-H "3. FUNCIONALIDADES PRINCIPALES (2 minutos)" 1

Add-H "A. Rutinas Personalizadas - Tu plan a medida" 2
Add-P "Respondes 5 preguntas simples: Cual es tu objetivo? (fuerza, resistencia, perdida de peso, mantenimiento). Cual es tu nivel? (principiante, intermedio, avanzado). Cuanto tiempo tienes? (15, 30, 45, 60 minutos). Que zona quieres trabajar? (piernas, pecho, espalda, brazos, core, cuerpo completo). Cuantos dias a la semana? La app genera automaticamente una rutina equilibrada con ejercicios adecuados para ti. No necesitas saber nada de anatomia ni programacion de entrenamientos."

Add-H "B. Entrenamiento Guiado - Tu entrenador en pantalla" 2
Add-P "Cuando empiezas una rutina, la app te muestra:"
Add-B "El nombre del ejercicio y un video demostrativo en bucle (se repite automaticamente)"
Add-B "Un temporizador grande que cuenta los segundos de cada ejercicio"
Add-B "Botones claros: Pausar, Siguiente, Anterior, Finalizar"
Add-B 'Un indicador: "Ejercicio 3 de 8" para que siempre sepas donde vas'
Add-B "Una barra de progreso que se llena a medida que avanzas"
Add-B "Descansos configurables entre ejercicios (0, 15, 30, 60 segundos) con contador y opcion de Saltar descanso"

Add-H "C. Seguimiento de Progreso - Ve tus resultados" 2
Add-B "Graficas semanales: minutos entrenados, ejercicios completados, puntos ganados"
Add-B 'Metas semanales que tu defines (ej: "entrenar 3 veces esta semana")'
Add-B "Calendario visual de 90 dias: cada dia que entrenas se marca en verde"
Add-B "Rachas: cuantos dias consecutivos has entrenado (tu racha actual y tu record historico)"
Add-B "Resumen al final de cada rutina: tiempo total, ejercicios hechos, calorias estimadas, puntos ganados"

Add-H "D. Gamificacion - Diviertete mientras entrenas" 2
Add-P "La app te otorga medallas automaticas por hitos reales:"
Add-B "Primer Paso - tu primer entrenamiento completado"
Add-B "Trio Activo - 3 dias seguidos entrenando"
Add-B "Constancia - 7 dias seguidos"
Add-B "Mil Puntos - acumular 1000 puntos"
Add-B "Nivel 3 - alcanzar el nivel 3 de experiencia"
Add-B "Y mas: por completar rutinas, alcanzar metas, entrenar diferentes zonas corporales"
Add-P "Cada medalla muestra su nombre, icono, descripcion y la fecha exacta en que la desbloqueaste. Las medallas que aun no tienes se ven bloqueadas con su requisito para que sepas como conseguirlas."

Add-H "E. Chatbot Inteligente - Pregunta lo que quieras" 2
Add-P "No es un bot generico. Conoce tu nivel, tu historial, tus metas y tus rutinas guardadas. Puedes escribirle cosas como:"
Add-B "Hazme una rutina para principiantes de 20 minutos"
Add-B "Tengo dolor de rodilla, cambia las sentadillas"
Add-B "Como se hace correctamente el plank?"
Add-B "Que debo entrenar hoy segun mi historial?"
Add-B "Quiero una rutina mas sencilla"
Add-P "Y te responde con recomendaciones personalizadas, no respuestas copiadas de internet."

Add-H "F. Mapa de Gimnasios - Encuentra donde entrenar" 2
Add-P "Si prefieres ir a un gimnasio, la app te muestra un mapa interactivo con gimnasios cercanos a tu ubicacion, con informacion de cada uno."

# Section 4
Add-H "4. DISENADO PARA TODOS - ACCESIBILIDAD (30 segundos)" 1
Add-P "Esta aplicacion cumple con estandares internacionales de accesibilidad (WCAG 2.1 nivel AA):"
Add-B "Navegacion completa con teclado (sin necesidad de raton)"
Add-B "Contraste alto opcional para personas con baja vision"
Add-B "Tamano de texto ajustable (A+, A-, Reset)"
Add-B "Modo oscuro para reducir fatiga visual"
Add-B "Reduccion de animaciones para personas sensibles al movimiento"
Add-B "Etiquetas para lectores de pantalla (personas ciegas)"
Add-B 'Enlace "Saltar al contenido principal" para ir directo a lo importante'
Add-B "Notificaciones suaves (toasts) en lugar de ventanas emergentes molestas"

# Section 5
Add-H "5. SEGURIDAD Y PRIVACIDAD (30 segundos)" 1
Add-B "Tus datos viajan encriptados (HTTPS)"
Add-B "Contrasenas guardadas de forma segura (hash + salt, nunca en texto plano)"
Add-B "Autenticacion con tokens JWT: tu sesion dura 8 horas, luego vuelves a entrar"
Add-B "Solo TU ves TUS datos: la app verifica que cada peticion pertenezca al usuario logueado"
Add-B "Base de datos local SQL Server: tus datos no van a la nube de terceros"
Add-B "Indicador en tiempo real del estado de la base de datos y la API"

# Section 6
Add-H "6. DEMOSTRACION RAPIDA - LO QUE VERAN EN EL VIDEO (1 minuto)" 1
Add-P "El video grabado muestra el flujo completo de un usuario real:"
Add-B "1. Registro e inicio de sesion (30 seg)"
Add-B "2. Dashboard de progreso con graficas, metas y calendario de 90 dias con racha (45 seg)"
Add-B "3. Panel de entrenamiento con video, temporizador y navegacion (45 seg)"
Add-B "4. Seccion Mis Rutinas - crea una rutina personalizada desde cero (60 seg)"
Add-B "5. Mapa de gimnasios interactivo (30 seg)"
Add-B "6. Entrenamiento guiado completo: ejercicio 1 a 8 con descansos (90 seg)"
Add-B "7. Resumen visual final de la rutina (30 seg)"
Add-B "8. Chatbot respondiendo preguntas contextuales (45 seg)"
Add-B "9. Panel de accesibilidad: modo oscuro, tamano texto, alto contraste (30 seg)"
Add-B "10. Notificaciones suaves y confirmaciones (15 seg)"
Add-B "11. Cierre de sesion y pantalla final (5 seg)"
Add-P ""
Add-P "Duracion total del video: ~1 minuto 50 segundos (version acelerada para demo). En uso real, una rutina completa toma 20-40 minutos."

# Section 7
Add-H "7. BAJO EL CAPO - TECNOLOGIA (30 segundos)" 1
Add-P "Para los curiosos, la app esta construida con tecnologias modernas y robustas:"
Add-B "Frontend: HTML, CSS y JavaScript puro (sin frameworks pesados, carga instantanea)"
Add-B "Backend: ASP.NET Core 10 (Microsoft), C# - alto rendimiento y seguridad empresarial"
Add-B "Base de datos: SQL Server - estandar de la industria, confiable y escalable"
Add-B "Autenticacion: JWT (JSON Web Tokens) - estandar abierto usado por Google, Microsoft, Amazon"
Add-B "Tests automatizados: Playwright - simulan usuarios reales para detectar errores antes de que ustedes los vean"
Add-B "Documentacion completa: README tecnico, manual de usuario, presentacion, diagramas de arquitectura y base de datos"

# Section 8
Add-H "8. ESTADO ACTUAL Y PROXIMOS PASOS (30 segundos)" 1
Add-P "COMPLETADO (100% del plan original):"
Add-B "9 fases implementadas: estabilizacion, entrenamiento interactivo, rutinas personalizadas, metas y progreso, medallas, chatbot, accesibilidad, seguridad, documentacion"
Add-B "Video demo grabado y tests automatizados pasando"
Add-B "Manual de usuario (13 secciones) y presentacion (10 diapositivas) listos"
Add-P ""
Add-P "PROXIMAS MEJORAS OPCIONALES:"
Add-B "Capturas de pantalla en el manual de usuario"
Add-B "Exportar presentacion a PowerPoint/PDF"
Add-B 'Pantalla amigable "Servidor no disponible" con boton de reintento'
Add-B "Notificaciones push (recordatorios de entrenamiento)"
Add-B "Modo offline para entrenar sin internet"
Add-B "Compartir logros en redes sociales"

# Section 9
Add-H "9. CIERRE (30 segundos)" 1
Add-P "Entrena Tu Ser no es solo otra app de fitness. Es una herramienta pensada desde la empatia: para la persona que se intimida en el gimnasio, para quien tiene 20 minutos entre el trabajo y la cena, para quien lo ha intentado mil veces y se rinde a la semana."
Add-P ""
Add-P "Combina tres cosas que rara vez van juntas: ciencia del entrenamiento (rutinas equilibradas), psicologia conductual (gamificacion, rachas, metas) y tecnologia accesible (funciona en cualquier navegador, para cualquier persona)."
Add-P ""
Add-P "Gracias por su tiempo. Estoy a su disposicion para preguntas, para mostrarles la app en vivo, o para enviarles el video demo, el manual de usuario o la presentacion completa."

# Page break for notes
$doc.Content.InsertBreak([Microsoft.Office.Interop.Word.WdBreakType]::wdPageBreak)
Add-H "NOTAS PARA EL PRESENTADOR" 1
Add-P ""

Add-H "Tiempos sugeridos por seccion:" 2
Add-B "1. Introduccion: 30 seg"
Add-B "2. Publico objetivo: 30 seg"
Add-B "3. Funcionalidades: 2 min"
Add-B "4. Accesibilidad: 30 seg"
Add-B "5. Seguridad: 30 seg"
Add-B "6. Demo: 1 min"
Add-B "7. Tecnologia: 30 seg"
Add-B "8. Estado/Proximos: 30 seg"
Add-B "9. Cierre: 30 seg"
Add-B "TOTAL: ~5 minutos"

Add-P ""
Add-H "Consejos de entrega:" 2
Add-B "Habla lento y claro, evita jerga tecnica"
Add-B 'Usa analogias: "es como tener un entrenador en el bolsillo", "el calendario es como el de GitHub pero para tu cuerpo"'
Add-B "Si hay pantalla, muestra el video demo en la seccion 6"
Add-B 'Enfatiza "disenado para NO programadores" en accesibilidad'
Add-B 'Prepara respuestas para: "Cuanto cuesta?", "Esta en iOS/Android?", "Necesito internet?", "Venden mis datos?"'

Add-P ""
Add-H "Preguntas frecuentes anticipadas:" 2
Add-B "P: Cuanto cuesta? R: Es un proyecto academico/demo, gratuito. En produccion seria freemium."
Add-B "P: Esta en la App Store/Play Store? R: Es una Progressive Web App (PWA), funciona en el navegador del movil como si fuera app nativa, se puede instalar desde el menu del navegador."
Add-B "P: Necesito internet siempre? R: Actualmente si (para videos y base de datos). Modo offline planeado."
Add-B "P: Venden mis datos? R: No. Base de datos local, sin terceros, sin analytics de tracking."
Add-B "P: Puedo usarlo en mi gimnasio? R: Si, el mapa te muestra gimnasios cercanos y la rutina funciona en cualquier lugar."

# Save
$savePath = "C:\Users\caedu\OneDrive\Desktop\Entrenatuser\PRESENTACION_5_MINUTOS.docx"
$doc.SaveAs($savePath)
$doc.Close()
$word.Quit()
Write-Host "Documento creado exitosamente en: $savePath"