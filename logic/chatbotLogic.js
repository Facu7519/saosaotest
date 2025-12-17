
import { GoogleGenAI } from "@google/genai";
import { Game } from "../state/gameState.js";

export function initChatbot() {
    const toggle = document.getElementById('yui-chat-toggle');
    const container = document.getElementById('yui-chat-container');
    const close = document.getElementById('close-chat');
    const send = document.getElementById('send-btn');
    const input = document.getElementById('user-input');
    const messages = document.getElementById('chat-messages');

    toggle.onclick = () => container.classList.toggle('hidden');
    close.onclick = () => container.classList.add('hidden');

    async function handleChat() {
        const text = input.value.trim();
        if (!text) return;

        appendMessage('user', text);
        input.value = '';

        const thinkingMsg = appendMessage('yui', 'Analizando datos de Cardinal...', true);

        try {
            const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
            
            // Si la pregunta parece sobre datos actuales o generales, usamos Flash con Search
            // Si es compleja sobre el sistema, usamos Pro con Thinking
            const isComplex = text.length > 50 || text.includes('como') || text.includes('por qué');
            
            let response;
            if (isComplex) {
                response = await ai.models.generateContent({
                    model: 'gemini-3-pro-preview',
                    contents: text,
                    config: {
                        systemInstruction: `Eres Yui, el MHCP-001 de SAO. Eres la hija virtual de Kirito y Asuna. 
                        Tu tono es dulce, protector y servicial. Respondes dudas del juego Aincrad Chronicles.
                        Estado del jugador actual: ${Game.player.name}, LV ${Game.player.level}, Piso ${Game.player.currentFloor}.`,
                        thinkingConfig: { thinkingBudget: 32768 }
                    }
                });
            } else {
                response = await ai.models.generateContent({
                    model: 'gemini-3-flash-preview',
                    contents: text,
                    config: {
                        tools: [{ googleSearch: {} }],
                        systemInstruction: "Eres Yui de SAO. Responde de forma breve y amable."
                    }
                });
            }

            thinkingMsg.remove();
            appendMessage('yui', response.text);

            // Mostrar fuentes si usó Google Search
            const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
            if (chunks) {
                const sources = chunks.map(c => c.web?.uri).filter(Boolean);
                if (sources.length > 0) {
                    const links = document.createElement('div');
                    links.className = 'chat-sources';
                    links.innerHTML = '<small>Fuentes: </small>' + sources.map(s => `<a href="${s}" target="_blank">Enlace</a>`).join(', ');
                    messages.appendChild(links);
                }
            }

        } catch (error) {
            thinkingMsg.textContent = "Error de sincronización con Cardinal.";
            console.error(error);
        }
        messages.scrollTop = messages.scrollHeight;
    }

    send.onclick = handleChat;
    input.onkeypress = (e) => e.key === 'Enter' && handleChat();

    function appendMessage(sender, text, isThinking = false) {
        const div = document.createElement('div');
        div.className = `message ${sender}`;
        div.textContent = text;
        messages.appendChild(div);
        messages.scrollTop = messages.scrollHeight;
        return div;
    }
}
