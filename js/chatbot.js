const chatbot = document.getElementById('chatbot');
const chatbotToggle = document.getElementById('chatbot-toggle');
const chatbotPanel = document.getElementById('chatbot-panel');
const chatbotClose = document.getElementById('chatbot-close');
const chatbotForm = document.getElementById('chatbot-form');
const chatbotInput = document.getElementById('chatbot-input');
const chatbotMessages = document.getElementById('chatbot-messages');
const chatbotSend = chatbotForm.querySelector('button[type="submit"]');
const conversation = [];
let chatbotProfile = null;

function setChatbotOpen(isOpen) {
  chatbotPanel.classList.toggle('active', isOpen);
  chatbotToggle.setAttribute('aria-expanded', String(isOpen));

  if (isOpen) {
    chatbotInput.focus();
  }
}

function addMessage(text, type) {
  const lastMessage = chatbotMessages.lastElementChild;
  if (
    type === 'bot-message' &&
    lastMessage &&
    !lastMessage.classList.contains('loading-message') &&
    lastMessage.textContent.trim() === text.trim()
  ) {
    return lastMessage;
  }

  const message = document.createElement('div');
  message.className = `chat-message ${type}`;
  message.textContent = text;
  chatbotMessages.appendChild(message);
  chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
  return message;
}

function normalizeText(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

async function loadChatbotProfile() {
  const user = getChatbotUser();
  if (!user) {
    chatbotProfile = null;
    return null;
  }

  try {
    const response = await window.apiFetch(`${window.API_BASE_URL || 'http://localhost:5143'}/api/progress/${user.id}`);
    if (!response.ok) {
      chatbotProfile = null;
      return null;
    }
    const data = await response.json();
    const storedGoal = JSON.parse(localStorage.getItem(`entrena-goal-${user.id}`) || 'null');
    chatbotProfile = { summary: data.summary, goal: storedGoal };
    return chatbotProfile;
  } catch {
    chatbotProfile = null;
    return null;
  }
}

function getChatbotUser() {
  try {
    return JSON.parse(localStorage.getItem('entrena-user'));
  } catch {
    return null;
  }
}

function getPersonalizedGuidance() {
  if (!chatbotProfile?.summary) return '';
  const summary = chatbotProfile.summary;
  const levelNumber = Number(summary.level) || 1;
  const level = levelNumber <= 1
    ? 'principiante'
    : levelNumber <= 3 ? 'intermedio' : 'avanzado';
  const goal = chatbotProfile.goal?.type === 'exercises'
    ? `Tu meta actual es completar ${chatbotProfile.goal.target} ejercicios.`
    : chatbotProfile.goal?.type === 'minutes'
      ? `Tu meta actual es acumular ${chatbotProfile.goal.target} minutos.`
      : '';
  const progress = `Has acumulado ${summary.totalMinutes || 0} minutos, ${summary.completedExercises || 0} ejercicios y ${summary.totalPoints || 0} puntos.`;
  return `\n\nNivel recomendado: ${level}. ${goal} ${progress}`.trim();
}

function routineReply(text) {
  const normalizedText = normalizeText(text);
  const previousRoutines = conversation.filter(
    (message) => message.role === 'assistant' && message.content.startsWith('Rutina')
  ).length;

  if (normalizedText.includes('pierna') || normalizedText.includes('piernas')) {
    const legRoutines = [
      `Rutina de pierna:
1. Sentadillas - 3 series x 12 reps
2. Extensión de cadera - 3 series x 12 reps
3. Elevación de talones - 3 series x 15 reps

Descansa 60 segundos entre series y mantén un ritmo controlado.`,
      `Rutina alternativa de pierna:
1. Sentadillas - 4 series x 10 reps
2. Elevación de talones - 4 series x 15 reps
3. Estiramiento de cuádriceps - 3 series x 20 reps

Haz los movimientos sin rebotes y ajusta las repeticiones a tu nivel.`
    ];
    return legRoutines[previousRoutines % legRoutines.length] + getPersonalizedGuidance();
  }

  if (normalizedText.includes('abdomen') || normalizedText.includes('core')) {
    return `Rutina de abdomen:
1. Plancha abdominal - 3 series x 20 reps
2. Sentadillas - 3 series x 10 reps
3. Extensión de cadera - 3 series x 12 reps

Mantén el abdomen activo y detente si aparece dolor lumbar.${getPersonalizedGuidance()}`;
  }

  if (
    normalizedText.includes('brazo') ||
    normalizedText.includes('tren superior') ||
    normalizedText.includes('parte superior')
  ) {
    return `Rutina de tren superior:
1. Flexiones de pared - 3 series x 10 reps
2. Círculos de brazos - 3 series x 12 reps
3. Elevación de hombros - 3 series x 12 reps

Mantén los hombros relajados y controla cada movimiento.${getPersonalizedGuidance()}`;
  }

  const fullBodyRoutines = [
    `Rutina de cuerpo completo:
1. Sentadillas - 3 series x 12 reps
2. Flexiones de pared - 3 series x 10 reps
3. Plancha abdominal - 3 series x 20 reps

Ajusta el volumen según tu nivel y detente si aparece dolor.`,
    `Rutina alternativa de cuerpo completo:
1. Extensión de cadera - 3 series x 12 reps
2. Círculos de brazos - 3 series x 15 reps
3. Elevación de talones - 3 series x 15 reps

Descansa 60 segundos entre series y realiza cada movimiento de forma controlada.`
  ];
  return fullBodyRoutines[previousRoutines % fullBodyRoutines.length] + getPersonalizedGuidance();
}

function fallbackReply(message) {
  const text = normalizeText(message);

  if (text.includes('hola') || text.includes('buenos dias') || text.includes('buenas tardes')) {
    return 'Hola, soy tu asistente. Puedo ayudarte con rutinas, calentamientos, hábitos saludables y ejercicios seguros.';
  }

  if (text.includes('calent') || text.includes('estira')) {
    return 'Antes de entrenar, realiza 5 minutos de movilidad: círculos con hombros, rotaciones suaves de cadera y sentadillas sin peso. Párate si aparece dolor.';
  }

  if (text.includes('rutina') || text.includes('ejercicio') || text.includes('otra') || text.includes('diferente')) {
    return routineReply(message);
  }

  if (text.includes('hoy') || text.includes('progreso') || text.includes('recomiendas')) {
    const guidance = getPersonalizedGuidance();
    return guidance
      ? `Según tu progreso, te recomiendo una rutina de cuerpo completo de intensidad moderada. Completa los ejercicios con técnica controlada y deja un día de recuperación si sientes fatiga.${guidance}`
      : 'Te recomiendo una rutina de cuerpo completo de intensidad moderada. Completa los ejercicios con técnica controlada y deja un día de recuperación si sientes fatiga.';
  }

  if (text.includes('dolor') || text.includes('lesion')) {
    return 'Detén el ejercicio ante dolor intenso o agudo. Si persiste, consulta a un profesional médico o de rehabilitación antes de continuar.';
  }

  if (text.includes('habito') || text.includes('agua') || text.includes('sueno') || text.includes('descanso')) {
    return 'Comienza con hábitos pequeños y constantes: establece horarios para dormir, hidratarte y realizar actividad física. Procura descansar adecuadamente y registra tu progreso.';
  }

  return 'Puedo ayudarte con rutinas, calentamientos, hábitos saludables y ejecución de ejercicios. También recomiendo consultar a un profesional para objetivos médicos o lesiones específicas.';
}

function cleanReply(reply) {
  const paragraphs = reply
    .split(/\n+/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
  const uniqueParagraphs = [];

  paragraphs.forEach((paragraph) => {
    if (!uniqueParagraphs.includes(paragraph)) {
      uniqueParagraphs.push(paragraph);
    }
  });

  return uniqueParagraphs.join('\n\n');
}

async function askAI(message) {
  // Modo local: usar solo respuestas de fallback sin API externa
  return fallbackReply(message);
}

chatbotToggle.addEventListener('click', () => {
  setChatbotOpen(!chatbotPanel.classList.contains('active'));
});

chatbotClose.addEventListener('click', () => setChatbotOpen(false));
window.addEventListener('user-authenticated', () => loadChatbotProfile());

chatbotForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const message = chatbotInput.value.trim();
  if (!message) return;

  // Quitar el saludo inicial cuando comienza la conversación para que
  // la respuesta del asistente quede visible y no parezca repetida.
  if (conversation.length === 0) {
    const welcomeMessage = chatbotMessages.querySelector('.bot-message:not(.loading-message)');
    if (welcomeMessage) welcomeMessage.remove();
  }

  addMessage(message, 'user-message');
  conversation.push({ role: 'user', content: message });
  chatbotInput.value = '';
  chatbotSend.disabled = true;

  const loadingMessage = addMessage('Pensando...', 'bot-message loading-message');

  try {
    await loadChatbotProfile();
    const reply = await askAI(message);
    loadingMessage.remove();
    const msgEl = addMessage(reply, 'bot-message');
    conversation.push({ role: 'assistant', content: reply });

    // Detectar si la respuesta contiene una rutina y mostrar botón para guardarla
    if (window.routinesModule?.showSaveRoutineButton) {
      try {
        await window.routinesModule.showSaveRoutineButton(reply, msgEl);
      } catch (error) {
        console.error('Error al preparar la rutina del chatbot:', error);
      }
    }
  } catch (error) {
    console.error('Error al consultar el chatbot:', error);
    loadingMessage.remove();
    addMessage(fallbackReply(message), 'bot-message');
  } finally {
    chatbotSend.disabled = false;
    chatbotInput.focus();
  }
});
