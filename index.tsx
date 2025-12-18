
import { Game } from './state/gameState.js';
import { updatePlayerHUD } from './ui/hud.js';
import { openModal, setupModalListeners, closeModal } from './ui/modals.js';
import { initCombat } from './logic/combatLogic.js';
import { renderWikiContent } from './ui/renderers.js'; 
import { calculateEffectiveStats } from './logic/playerLogic.js';
import { initChatbot } from './logic/chatbotLogic.js';
import { showNotification } from './utils/helpers.js';

async function init() {
    console.log("Sistema Cardinal: Iniciando...");
    
    // Cargar datos
    const saved = localStorage.getItem('sao_save_modular');
    if (saved) {
        Object.assign(Game.player, JSON.parse(saved));
    }

    if (!Game.player.name) {
        openModal('nameEntryModal');
    }

    calculateEffectiveStats();
    updatePlayerHUD();
    renderWikiContent();
    setupEventListeners();
    initChatbot();
}

function setupEventListeners() {
    setupModalListeners();

    // Gestor de Vistas
    const toggleBtn = document.getElementById('view-mode-toggle');
    const viewGame = document.getElementById('view-game');
    const viewWiki = document.getElementById('view-wiki');
    const yuiBtn = document.getElementById('yui-chat-toggle');

    toggleBtn?.addEventListener('click', () => {
        const isGame = document.body.classList.contains('mode-game');
        if (isGame) {
            document.body.classList.replace('mode-game', 'mode-wiki');
            viewGame!.style.display = 'none';
            viewWiki!.style.display = 'block';
            yuiBtn!.classList.remove('hidden');
            toggleBtn.textContent = '🎮 Modo Juego';
            showNotification("Cargando base de datos Cardinal...", "default");
        } else {
            document.body.classList.replace('mode-wiki', 'mode-game');
            viewGame!.style.display = 'block';
            viewWiki!.style.display = 'none';
            yuiBtn!.classList.add('hidden');
            toggleBtn.textContent = '🌐 Modo Wiki';
        }
    });

    document.getElementById('submitPlayerNameBtn')?.addEventListener('click', () => {
        const input = document.getElementById('playerNameInput') as HTMLInputElement;
        const name = input.value.trim();
        if (name.length >= 3) {
            Game.player.name = name;
            closeModal('nameEntryModal');
            updatePlayerHUD();
            localStorage.setItem('sao_save_modular', JSON.stringify(Game.player));
            showNotification(`Bienvenido, ${name}. Link Start!`, "success");
        }
    });

    document.getElementById('combat-btn')?.addEventListener('click', () => initCombat(false));
    document.getElementById('inventory-btn')?.addEventListener('click', () => openModal('inventoryModal'));
    document.getElementById('save-game-btn')?.addEventListener('click', () => {
        localStorage.setItem('sao_save_modular', JSON.stringify(Game.player));
        showNotification("Progreso guardado localmente.", "success");
    });
}

document.addEventListener('DOMContentLoaded', init);
