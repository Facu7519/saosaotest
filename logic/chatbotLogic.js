
import { GoogleGenAI } from "@google/genai";
import { Game } from "../state/gameState.js";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export function initChatbot() {
    const toggle = document.getElementById('yui-chat-toggle');
    const container = document.getElementById('yui-chat-container');
    const close = document.getElementById('close-chat');
    const send = document.getElementById('send-btn');
    const input = document.getElementById('user-input');
    const messages = document.getElementById('chat-messages');

    if (!toggle || !container) return;

    toggle.onclick = () => container.classList.toggle('hidden');
    close.onclick = () => container.classList.add('hidden');

    async function handleChat() {
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';

        const thinkingDiv = appendMessage('yui', 'Consultando con Cardinal...', true);

        try {
            const playerContext = `Jugador: ${Game.player.name}, Nivel: ${Game.player.level}, Piso: ${Game.player.currentFloor}.`;
            
            // Lógica de selección de modelo
            const isLoreQuestion = text.toLowerCase().includes('quien es') || text.toLowerCase().includes('historia');
            
            let response;
            if (isLoreQuestion) {
                // Flash con búsqueda para datos rápidos y lore
                response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: text,
                    config: {
                        tools: [{ googleSearch: {} }],
                        systemInstruction: `Eres Yui de SAO. Sé breve. Contexto: ${playerContext}`
                    }
                });
            } else {
                // Pro con Thinking para estrategias complejas
                response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: text,
                    config: {
                        thinkingConfig: { thinkingBudget: 32768 },
                        systemInstruction: `Eres Yui, una IA de soporte MHCP. Eres amable y llamas al usuario 'Papá' o 'Mamá'. Ayuda con estrategias del juego. Contexto: ${playerContext}`
                    }
                });
            }

            thinkingDiv.remove();
            appendMessage('yui', response.text);

            // Renderizar fuentes si existen
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                const sources = chunks.filter(c => c.web).map(c => c.web);
                if (sources.length > 0) {
                    const linksDiv = document.createElement('div');
                    linksDiv.className = 'sources-list';
                    linksDiv.innerHTML = '<small>Fuentes: </small>' + sources.map(s => `<a href="${s.uri}" target="_blank">${s.title || 'Link'}</a>`).join(', ');
                    messages.appendChild(linksDiv);
                }
            }

        } catch (error) {
            thinkingDiv.textContent = "Error de conexión con el servidor central.";
            console.error(error);
        }
        messages.scrollTop = messages.scrollHeight;
    }

    send.onclick = handleChat;
    input.onkeypress = (e) => e.key === 'Enter' && handleChat();

    function appendMessage(sender, text, isThinking = false) {
        const div = document.createElement('div');
        div.className = `message ${sender} ${isThinking ? 'thinking-text' : ''}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }
}
