
import { Game } from './state/gameState.js';
import { updatePlayerHUD } from './ui/hud.js';
import { openModal, setupModalListeners, closeModal } from './ui/modals.js';
import { initCombat } from './logic/combatLogic.js';
import { renderWikiContent } from './ui/renderers.js'; 
import { calculateEffectiveStats } from './logic/playerLogic.js';
import { initChatbot } from './logic/chatbotLogic.js';

function init() {
    // Cargar datos
    const saved = localStorage.getItem('sao_save');
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

    // Toggle de Modos (Juego vs Wiki)
    const toggleBtn = document.getElementById('view-mode-toggle');
    const gameContainer = document.getElementById('game-view-container');
    const wikiContainer = document.getElementById('wiki-view-container');
    const yuiBtn = document.getElementById('yui-chat-toggle');

    toggleBtn?.addEventListener('click', () => {
        const isGame = document.body.classList.contains('mode-game');
        if (isGame) {
            document.body.classList.replace('mode-game', 'mode-wiki');
            gameContainer!.style.display = 'none';
            wikiContainer!.style.display = 'block';
            yuiBtn!.classList.remove('hidden');
            toggleBtn.textContent = '🎮 Cambiar a Juego';
        } else {
            document.body.classList.replace('mode-wiki', 'mode-game');
            gameContainer!.style.display = 'block';
            wikiContainer!.style.display = 'none';
            yuiBtn!.classList.add('hidden');
            toggleBtn.textContent = '🌐 Cambiar a Wiki';
        }
    });

    document.getElementById('submitPlayerNameBtn')?.addEventListener('click', () => {
        const name = (document.getElementById('playerNameInput') as HTMLInputElement).value.trim();
        if (name) {
            Game.player.name = name;
            closeModal('nameEntryModal');
            updatePlayerHUD();
            localStorage.setItem('sao_save', JSON.stringify(Game.player));
        }
    });

    document.getElementById('combat-btn')?.addEventListener('click', () => initCombat(false));
    document.getElementById('inventory-btn')?.addEventListener('click', () => openModal('inventoryModal'));
    document.getElementById('save-game-btn')?.addEventListener('click', () => {
        localStorage.setItem('sao_save', JSON.stringify(Game.player));
        alert('Progreso guardado en Cardinal.');
    });
}

document.addEventListener('DOMContentLoaded', init);
