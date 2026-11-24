from pathlib import Path
from datetime import date

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, Image, KeepTogether
)


ROOT = Path(r"C:\Users\caedu\OneDrive\Desktop\Entrenatuser")
OUTPUT = ROOT / "Informe_Aseguramiento_Calidad_Pruebas_EntrenaTuSer.pdf"

styles = getSampleStyleSheet()
styles.add(ParagraphStyle(
    name="CoverTitle", parent=styles["Title"], fontSize=24, leading=30,
    alignment=TA_CENTER, textColor=colors.HexColor("#17324D"), spaceAfter=18
))
styles.add(ParagraphStyle(
    name="CoverSubtitle", parent=styles["Normal"], fontSize=12, leading=18,
    alignment=TA_CENTER, textColor=colors.HexColor("#486581")
))
styles.add(ParagraphStyle(
    name="Section", parent=styles["Heading1"], fontSize=16, leading=20,
    textColor=colors.HexColor("#17324D"), spaceBefore=12, spaceAfter=8
))
styles.add(ParagraphStyle(
    name="Subsection", parent=styles["Heading2"], fontSize=12, leading=15,
    textColor=colors.HexColor("#486581"), spaceBefore=8, spaceAfter=5
))
styles.add(ParagraphStyle(
    name="BodySpanish", parent=styles["BodyText"], fontSize=9.5, leading=13,
    alignment=4, spaceAfter=5
))
styles.add(ParagraphStyle(
    name="Small", parent=styles["BodyText"], fontSize=8, leading=10
))


def p(text, style="BodySpanish"):
    return Paragraph(text, styles[style])


def table(data, widths=None, font_size=8):
    t = Table(data, colWidths=widths, repeatRows=1, hAlign="LEFT")
    t.setStyle(TableStyle([
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#17324D")),
        ("TEXTCOLOR", (0, 0), (-1, 0), colors.white),
        ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
        ("FONTNAME", (0, 1), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), font_size),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("GRID", (0, 0), (-1, -1), 0.45, colors.HexColor("#B8C2CC")),
        ("ROWBACKGROUNDS", (0, 1), (-1, -1),
         [colors.white, colors.HexColor("#F4F7FA")]),
        ("LEFTPADDING", (0, 0), (-1, -1), 5),
        ("RIGHTPADDING", (0, 0), (-1, -1), 5),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    return t


def header_footer(canvas, doc):
    canvas.saveState()
    w, h = A4
    canvas.setFillColor(colors.HexColor("#17324D"))
    canvas.rect(0, h - 0.65 * cm, w, 0.65 * cm, fill=1, stroke=0)
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#486581"))
    canvas.drawString(1.8 * cm, 0.75 * cm, "Entrena Tu Ser - Informe de aseguramiento de calidad")
    canvas.drawRightString(w - 1.8 * cm, 0.75 * cm, f"Página {doc.page}")
    canvas.restoreState()


story = []

# Cover
story.append(Spacer(1, 3.2 * cm))
story.append(p("INFORME DE RESULTADOS", "CoverTitle"))
story.append(p("Aseguramiento de calidad y pruebas de software", "CoverTitle"))
story.append(Spacer(1, 0.8 * cm))
story.append(p("Proyecto integrador: <b>Entrena Tu Ser</b>", "CoverSubtitle"))
story.append(Spacer(1, 0.3 * cm))
story.append(p("Plataforma web de entrenamiento guiado", "CoverSubtitle"))
story.append(Spacer(1, 2.2 * cm))
story.append(p("<b>Integrantes del equipo:</b> _______________________________________________", "CoverSubtitle"))
story.append(p("<b>Asignatura / Docente:</b> _______________________________________________", "CoverSubtitle"))
story.append(p("<b>Fecha de elaboración:</b> 17 de noviembre de 2026", "CoverSubtitle"))
story.append(PageBreak())

# Introduction
story.append(p("1. Introducción", "Section"))
story.append(p(
    "El presente documento describe las actividades de aseguramiento de calidad y las pruebas "
    "aplicadas al proyecto integrador <b>Entrena Tu Ser</b>. El sistema es una aplicación web de "
    "entrenamiento que integra rutinas personalizadas, ejercicios con video, temporizadores y "
    "descansos, seguimiento de progreso, metas, medallas, chatbot, mapa de ubicaciones y controles "
    "de accesibilidad. El frontend fue desarrollado con HTML, CSS y JavaScript; el backend utiliza "
    "ASP.NET Core 10 y la persistencia se realiza con SQL Server."
))
story.append(p(
    "El objetivo del informe es documentar el modelo de calidad seleccionado, los controles "
    "aplicados, los casos de prueba, los resultados obtenidos y las recomendaciones derivadas de "
    "la ejecución. Para respaldar las conclusiones se utilizaron pruebas ejecutadas con Playwright "
    "y evidencias visuales generadas durante las sesiones de validación."
))

story.append(p("2. Desarrollo", "Section"))
story.append(p("2.1 Alcance del aseguramiento de calidad", "Subsection"))
story.append(p(
    "El alcance comprendió la interfaz principal, el entrenamiento guiado, el resumen de rutina, "
    "la protección de recursos mediante autenticación y los módulos accesibles desde el proyecto. "
    "También se consideraron aspectos de funcionalidad, usabilidad, seguridad básica y compatibilidad "
    "visual. Las pruebas no sustituyen una auditoría formal de seguridad ni una campaña exhaustiva "
    "de carga o rendimiento."
))

story.append(p("2.2 Modelo seleccionado: Pruebas basadas en Scrum + DevOps", "Subsection"))
story.append(p(
    "<b>Modelo seleccionado:</b> integración de iteraciones ágiles con prácticas Scrum y validación "
    "continua inspirada en DevOps. La calidad se incorporó durante todo el ciclo mediante "
    "revisión constante de incrementos, pruebas automatizadas y corrección temprana de defectos."
))
model_data = [
    [p("Criterio", "Small"), p("Evaluación", "Small")],
    [p("Por qué se eligió", "Small"),
     p("El proyecto evolucionó por módulos y necesitaba entregas frecuentes, retroalimentación y "
       "pruebas repetibles. Este modelo permite ajustar requisitos y descubrir errores antes de "
       "integrar nuevas funciones.", "Small")],
    [p("Ventajas", "Small"),
     p("Iteraciones cortas; detección temprana; feedback continuo; trazabilidad con casos de "
       "prueba; automatización de regresión; adaptación a cambios.", "Small")],
    [p("Desventajas", "Small"),
     p("Requiere disciplina en las reuniones y en la definición de tareas; las pruebas automatizadas "
       "necesitan mantenimiento; puede haber variación si no existe un responsable fijo de calidad.",
       "Small")],
    [p("Ayuda obtenida", "Small"),
     p("Facilitó validar el resumen de rutinas, los descansos y la autorización de la API. Además "
       "permitió separar pruebas funcionales, visuales y de seguridad, dejando una base para "
       "ejecuciones posteriores.", "Small")],
]
story.append(table(model_data, widths=[3.2 * cm, 13.0 * cm], font_size=8))

story.append(p("2.3 Actividades y herramientas", "Subsection"))
activities = [
    [p("Actividad", "Small"), p("Aplicación en el proyecto", "Small")],
    [p("Revisión de requisitos", "Small"), p("Se identificaron flujos de autenticación, entrenamiento, rutinas y autorización.", "Small")],
    [p("Diseño de casos", "Small"), p("Se definieron entradas, pasos, resultados esperados y estado de ejecución.", "Small")],
    [p("Pruebas automatizadas", "Small"), p("Playwright se utilizó para simular un usuario y una petición HTTP.", "Small")],
    [p("Pruebas visuales", "Small"), p("Se capturaron pantallas de progreso, entrenamiento, rutinas, chatbot, medallas y mapa.", "Small")],
    [p("Control de defectos", "Small"), p("Los fallos se dejaron como evidencia en el directorio test-results y se corrigieron o clasificaron.", "Small")],
]
story.append(table(activities, widths=[4.2 * cm, 12.0 * cm], font_size=8))

story.append(PageBreak())
story.append(p("3. Resultados del aseguramiento de la calidad", "Section"))
story.append(p(
    "Los casos siguientes utilizan un formato compatible con el utilizado en proyectos de pruebas "
    "de software: identificador, requisito asociado, objetivo, precondiciones, datos, pasos, "
    "resultado esperado, resultado obtenido y estado."
))

cases = [
    ("CP-01", "Resumen visual de rutina", "Verificar que se presenta el resumen al finalizar una sesión.",
     "Aplicación disponible en localhost:5500.", "Rutina: Rutina de prueba; 2/3 ejercicios; 8 min; 120 puntos.",
     "1. Abrir la aplicación. 2. Invocar el resumen. 3. Revisar información. 4. Pulsar Cerrar.",
     "Se muestran nombre, 2/3, 120 puntos y el botón Cerrar elimina el resumen.",
     "Se verificaron todos los datos y el cierre del componente.", "Aprobado"),
    ("CP-02", "Descanso entre ejercicios", "Comprobar el temporizador de descanso y la acción Saltar.",
     "Pantalla de entrenamiento cargada.", "Duración seleccionada: 15 segundos.",
     "1. Seleccionar 15 segundos. 2. Iniciar descanso. 3. Esperar 1.1 s. 4. Pulsar Saltar.",
     "La fase debe cambiar a Descanso, mostrar 00:14 y habilitar la opción Saltar.",
     "Se obtuvo fase Descanso, temporizador 00:14 y opción visible.", "Aprobado"),
    ("CP-03", "Autorización de metas", "Confirmar que la API rechaza metas semanales sin token.",
     "API disponible en localhost:5143.", "Solicitud GET /api/goals/1 sin Authorization.",
     "1. Enviar la petición. 2. Registrar el código HTTP.",
     "El servidor responde 401 Unauthorized.",
     "La API respondió con el código HTTP 401.", "Aprobado"),
    ("CP-04", "Registro de usuario", "Validar que una cuenta nueva acceda al sistema.",
     "Backend y base de datos disponibles.", "Nombre, correo único y contraseña válida.",
     "1. Abrir registro. 2. Completar datos. 3. Enviar. 4. Esperar la pantalla de progreso.",
     "Se registra el usuario y se muestra el área autenticada.",
     "Caso diseñado para Playwright; la evidencia visual incluye el registro.", "Ejecutado"),
    ("CP-05", "Selección de ejercicio", "Comprobar la carga del panel de video al elegir un ejercicio.",
     "Usuario autenticado y catálogo disponible.", "Primer ejercicio de la lista.",
     "1. Ir a Entrenamiento. 2. Elegir un ejercicio. 3. Revisar el reproductor.",
     "Se muestra el ejercicio seleccionado y su panel de video.",
     "Caso incluido en el flujo de demostración.", "Ejecutado"),
    ("CP-06", "Creación de rutina", "Validar el generador personalizado.",
     "Usuario autenticado.", "Objetivo completo, nivel principiante y 20 minutos.",
     "1. Abrir Mis Rutinas. 2. Pulsar Nueva Rutina. 3. Elegir opciones. 4. Generar.",
     "Se genera una rutina acorde con los parámetros seleccionados.",
     "Caso incluido en el flujo de demostración.", "Ejecutado"),
    ("CP-07", "Mapa y lugares cercanos", "Comprobar la visualización del mapa y lugares cercanos.",
     "Permisos de ubicación disponibles o simulados.", "Coordenadas predeterminadas.",
     "1. Abrir Mapa. 2. Esperar los tiles. 3. Revisar marcadores y lugares.",
     "El mapa se carga y presenta controles y lugares cercanos.",
     "Captura visual disponible en images/screenshots.", "Ejecutado"),
    ("CP-08", "Panel de accesibilidad", "Comprobar que el panel permite ajustar apariencia.",
     "Sesión autenticada.", "Modo oscuro y tamaño de texto.",
     "1. Abrir accesibilidad. 2. Activar modo oscuro. 3. Ajustar texto.",
     "La interfaz aplica el tema y el tamaño sin perder legibilidad.",
     "Captura visual disponible en images/screenshots.", "Ejecutado"),
    ("CP-09", "Autenticación requerida", "Comprobar que otros recursos protegidos no se muestran al usuario anónimo.",
     "Sesión cerrada.", "Solicitud a un recurso protegido.",
     "1. Cerrar sesión o eliminar el token. 2. Solicitar el recurso.",
     "El sistema rechaza la petición o redirige a autenticación.",
     "Validado mediante la protección de metas sin autenticación.", "Aprobado"),
    ("CP-10", "Chatbot contextual", "Comprobar que el chatbot abre y acepta una consulta.",
     "Usuario autenticado.", "Texto de consulta válida.",
     "1. Abrir Chatbot. 2. Escribir una pregunta. 3. Enviar.",
     "La interfaz muestra la conversación y una respuesta.",
     "Captura visual disponible en images/screenshots.", "Ejecutado"),
]

for case in cases:
    cid, req, obj, pre, data, steps, expected, obtained, status = case
    block = [
        [p(cid, "Small"), p(f"<b>{req}</b>", "Small"), p(status, "Small")],
        [p("Objetivo:", "Small"), p(obj, "Small"), ""],
        [p("Precondiciones:", "Small"), p(pre, "Small"), ""],
        [p("Datos:", "Small"), p(data, "Small"), ""],
        [p("Pasos:", "Small"), p(steps, "Small"), ""],
        [p("Resultado esperado:", "Small"), p(expected, "Small"), ""],
        [p("Resultado obtenido:", "Small"), p(obtained, "Small"), ""],
    ]
    t = Table(block, colWidths=[3.1 * cm, 11.9 * cm, 1.4 * cm], repeatRows=0)
    t.setStyle(TableStyle([
        ("SPAN", (1, 0), (1, 0)),
        ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#E8EFF5")),
        ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#AEBAC5")),
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("FONTNAME", (0, 0), (-1, -1), "Helvetica"),
        ("FONTSIZE", (0, 0), (-1, -1), 7.5),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 3),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 3),
    ]))
    story.append(KeepTogether([t, Spacer(1, 0.18 * cm)]))

story.append(PageBreak())
story.append(p("4. Resultados de las pruebas", "Section"))
story.append(p("4.1 Ejecución verificada", "Subsection"))
story.append(p(
    "El 17 de noviembre de 2026 se ejecutó el archivo <b>tests/training-flow.spec.js</b> con "
    "Playwright. El comando utilizado fue <b>npx playwright test tests/training-flow.spec.js</b>. "
    "Los servicios de frontend y API estuvieron disponibles en sus puertos configurados."
))
result_data = [
    [p("Prueba", "Small"), p("Tipo", "Small"), p("Resultado", "Small"), p("Duración", "Small")],
    [p("Resumen visual de una rutina", "Small"), p("Interfaz / componente", "Small"), p("Aprobada", "Small"), p("7.1 s", "Small")],
    [p("Inicio y salto de descanso", "Small"), p("Interfaz / temporizador", "Small"), p("Aprobada", "Small"), p("2.4 s", "Small")],
    [p("API protege meta semanal", "Small"), p("Seguridad / API", "Small"), p("Aprobada", "Small"), p("76 ms", "Small")],
]
story.append(table(result_data, widths=[6.1 * cm, 4.4 * cm, 3.2 * cm, 2.5 * cm], font_size=8))
story.append(Spacer(1, 0.25 * cm))

metrics = [
    [p("Métrica", "Small"), p("Valor", "Small")],
    [p("Pruebas ejecutadas", "Small"), p("3", "Small")],
    [p("Pruebas aprobadas", "Small"), p("3", "Small")],
    [p("Pruebas fallidas", "Small"), p("0", "Small")],
    [p("Porcentaje de aprobación", "Small"), p("100%", "Small")],
]
story.append(table(metrics, widths=[8.0 * cm, 8.0 * cm], font_size=9))

story.append(p("4.2 Evidencia visual disponible", "Subsection"))
story.append(p(
    "El proyecto contiene capturas de pantalla organizadas en <b>images/screenshots</b>: "
    "inicio y registro, progreso, entrenamiento, rutinas, chatbot, accesibilidad, medallas y mapa."
))

screen_names = [
    ("screen-login.jpg", "Inicio / registro"),
    ("screen-progress.jpg", "Progreso"),
    ("screen-training.jpg", "Entrenamiento"),
    ("screen-routines.jpg", "Rutinas"),
    ("screen-chatbot.jpg", "Chatbot"),
    ("screen-a11y.jpg", "Accesibilidad"),
]
for i in range(0, len(screen_names), 2):
    cells = []
    for name, label in screen_names[i:i + 2]:
        path = ROOT / "images" / "screenshots" / name
        if path.exists():
            image = Image(str(path), width=7.2 * cm, height=4.05 * cm)
            inner = Table([[image], [p(label, "Small")]], colWidths=[7.6 * cm])
            inner.setStyle(TableStyle([
                ("ALIGN", (0, 0), (-1, -1), "CENTER"),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
            ]))
            cells.append(inner)
    if len(cells) == 1:
        cells.append(Spacer(1, 1))
    grid = Table([cells], colWidths=[8.0 * cm, 8.0 * cm])
    grid.setStyle(TableStyle([
        ("VALIGN", (0, 0), (-1, -1), "TOP"),
        ("LEFTPADDING", (0, 0), (-1, -1), 4),
        ("RIGHTPADDING", (0, 0), (-1, -1), 4),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
    ]))
    story.append(grid)
    story.append(Spacer(1, 0.15 * cm))

story.append(PageBreak())
story.append(p("5. Análisis de resultados y recomendaciones", "Section"))
story.append(p(
    "<b>Análisis:</b> los tres casos ejecutados recientemente fueron aprobados. La interfaz mostró "
    "correctamente el resumen y el temporizador de descanso, y la API respondió con 401 ante una "
    "consulta de metas sin autenticación. Esto demuestra cobertura básica de presentación, "
    "interactividad y seguridad."
))
story.append(p(
    "<b>Defectos o riesgos identificados:</b> algunas pruebas visuales requieren una configuración "
    "constante de servidor y autenticación; el ejercicio de capturas puede fallar si se utiliza una "
    "puerta distinta o si la base de datos no está disponible. Además, el proyecto no cuenta con "
    "evidencia automatizada suficiente para todos los requisitos funcionales."
))
story.append(p("Recomendaciones:", "Subsection"))
story.append(p(
    "1. Mantener Playwright como herramienta de regresión y aumentar la ejecución a 100% de los "
    "flujos principales.<br/>"
    "2. Añadir pruebas de registro con datos válidos e inválidos, inicio de sesión, cierre de sesión "
    "y autorización por propietario.<br/>"
    "3. Integrar las pruebas en la ejecución continua y guardar los reportes por cada cambio.<br/>"
    "4. Documentar las versiones de Node.js, .NET, SQL Server y Playwright utilizadas.<br/>"
    "5. Aplicar pruebas de accesibilidad con teclado, lector de pantalla, contraste y zoom.<br/>"
    "6. Realizar pruebas de carga básica sobre los principales endpoints antes de un despliegue."
))

story.append(p("6. Conclusiones", "Section"))
story.append(p(
    "El aseguramiento de calidad aplicado a Entrena Tu Ser permitió comprobar sus componentes "
    "principales mediante casos documentados y pruebas ejecutables. El modelo basado en Scrum con "
    "prácticas DevOps resultó apropiado porque favoreció la integración incremental, la revisión "
    "frecuente y la detección temprana."
))
story.append(p(
    "La ejecución reciente confirmó una tasa de aprobación del 100% en las tres pruebas funcionales "
    "ejecutadas. Los módulos visuales cuentan con evidencia gráfica, aunque conviene ampliar la "
    "automatización para registro, rutinas, chatbot, mapa y medallas. Con esta ampliación, el "
    "proyecto incrementará su confiabilidad y facilitará futuras entregas."
))

story.append(Spacer(1, 1.0 * cm))
story.append(p("<b>Fecha de corte de resultados:</b> 17 de noviembre de 2026"))
story.append(p("<b>Comando de validación:</b> npx playwright test tests/training-flow.spec.js"))

doc = SimpleDocTemplate(
    str(OUTPUT), pagesize=A4,
    rightMargin=1.8 * cm, leftMargin=1.8 * cm,
    topMargin=1.8 * cm, bottomMargin=1.5 * cm,
    title="Informe de aseguramiento de calidad - Entrena Tu Ser",
    author="Equipo Entrena Tu Ser"
)
doc.build(story, onFirstPage=header_footer, onLaterPages=header_footer)
print(OUTPUT)
