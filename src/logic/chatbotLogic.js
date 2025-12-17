
import { GoogleGenAI } from "@google/genai";
import { Game } from "../state/gameState.js";

export async function sendMessageToYui(userMessage) {
    const chatContainer = document.getElementById('chat-messages');
    if (!chatContainer) return;

    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    
    const userDiv = document.createElement('div');
    userDiv.className = 'message user';
    userDiv.textContent = userMessage;
    chatContainer.appendChild(userDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    const thinkingDiv = document.createElement('div');
    thinkingDiv.className = 'message ai thinking';
    thinkingDiv.innerHTML = '<i class="fas fa-brain fa-spin"></i> Yui está analizando el sistema Cardinal...';
    chatContainer.appendChild(thinkingDiv);
    chatContainer.scrollTop = chatContainer.scrollHeight;

    try {
        const playerContext = `
            Avatar: ${Game.player.name || 'Invitado'}
            Nivel: ${Game.player.level}
            Piso: ${Game.player.currentFloor}
            Estado: HP ${Game.player.hp}/${Game.player.maxHp}, MP ${Game.player.mp}/${Game.player.maxMp}
        `;

        const response = await ai.models.generateContent({
            model: 'gemini-3-pro-preview',
            contents: userMessage,
            config: {
                systemInstruction: `Eres Yui, una IA de soporte emocional y técnica en Sword Art Online. 
                Eres amable y llamas al usuario 'Papá', 'Mamá' o 'Usuario' con respeto. 
                Tu objetivo es ayudar con el lore de Aincrad y mecánicas. 
                Datos del usuario: ${playerContext}`,
                thinkingConfig: {
                    thinkingBudget: 32768
                }
            },
        });

        if (thinkingDiv.parentNode) chatContainer.removeChild(thinkingDiv);

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
        errDiv.textContent = "Error de sincronización con el servidor central.";
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

    toggleBtn.onclick = () => chatContainer.classList.toggle('active');
    closeBtn.onclick = () => chatContainer.classList.remove('active');

    const handleSend = () => {
        const msg = chatInput.value.trim();
        if (msg) {
            sendMessageToYui(msg);
            chatInput.value = '';
        }
    };

    if (sendBtn) sendBtn.onclick = handleSend;
    if (chatInput) chatInput.onkeypress = (e) => { if (e.key === 'Enter') handleSend(); };
}
