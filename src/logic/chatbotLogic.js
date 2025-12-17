
import { GoogleGenAI } from "@google/genai";
import { Game } from "../state/gameState.js";

export async function sendMessageToYui(userMessage) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    // Obtener API Key de forma segura
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    // Añadir Mensaje del Usuario
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userMessage;
    chatContainer.appendChild(userDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // Indicador de "Pensando" (Thinking)
    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message ai thinking';
    thinkingDiv.innerHTML = '<i class="fas fa-microchip fa-spin"></i> Yui está analizando el núcleo de Aincrad...';
    chatContainer.appendChild(thinkingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const playerContext = `
            Contexto del Jugador Actual:
            - Nombre: ${Game.player.name || 'Desconocido'}
            - Nivel: ${Game.player.level}
            - Piso Actual: ${Game.player.currentFloor}
            - HP: ${Game.player.hp}/${Game.player.maxHp}
            - Col: ${Game.player.col}
            - Equipo: ${JSON.stringify(Game.player.equipment)}
        `;

        // Llamada a la API con Thinking Budget máximo
        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: userMessage,
            config: {
                systemInstruction: `Eres Yui, una IA de soporte (Mental Health Counseling Program - MHCP) dentro del mundo de Sword Art Online. 
                Eres amable, inteligente y siempre llamas al usuario de forma respetuosa. 
                Conoces el lore de SAO, los 100 pisos de Aincrad y las mecánicas del juego. 
                ${playerContext}`,
                thinkingConfig: {
                    thinkingBudget: 32768
                }
            },
        });

        // Eliminar indicador de carga
        chatContainer.removeChild(thinkingDiv);

        // Añadir respuesta de la IA
        const aiDiv = document.createElement('div');
        aiDiv.className = 'message ai';
        aiDiv.textContent = response.text;
        chatContainer.appendChild(aiDiv);
        chatContainer.scrollTop = chatContainer.scrollHeight;

    } catch (error) {
        console.error("Yui Error:", error);
        if (thinkingDiv.parentNode) chatContainer.removeChild(thinkingDiv);
        
        const errDiv = document.createElement('div');
        errDiv.className = 'message ai system';
        errDiv.style.color = '#ff6b6b';
        errDiv.textContent = "Lo siento, mi conexión con el servidor central de Cardinal se ha interrumpido.";
        chatContainer.appendChild(errDiv);
    }
}

export function setupChatbot() {
    const toggleBtn = document.getElementById('chat-toggle-btn');
    const closeBtn = document.getElementById('close-chat-btn');
    const chatContainer = document.getElementById('ai-chatbot-container');
    const sendBtn = document.getElementById('send-chat-btn');
    const chatInput = document.getElementById('chat-input');

    if (!toggleBtn || !chatContainer) return;

    toggleBtn.onclick = () => {
        chatContainer.classList.toggle('active');
        if (chatContainer.classList.contains('active')) chatInput.focus();
    };

    closeBtn.onclick = () => chatContainer.classList.remove('active');

    const handleSend = () => {
        const msg = chatInput.value.trim();
        if (msg) {
            sendMessageToYui(msg);
            chatInput.value = '';
        }
    };

    sendBtn.onclick = handleSend;
    chatInput.onkeypress = (e) => {
        if (e.key === 'Enter') handleSend();
    };
}
