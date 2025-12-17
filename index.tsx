import { Game } from './state/gameState.js';
import { updatePlayerHUD } from './ui/hud.js';
import { openModal, setupModalListeners, closeModal } from './ui/modals.js';
import { initCombat, combatAction } from './logic/combatLogic.js';
import { renderWikiContent } from './ui/renderers.js'; 
import { showNotification } from './utils/helpers.js';
import { calculateEffectiveStats } from './logic/playerLogic.js';
import { initSkillsUI, renderSkillsGrid } from './ui/skillsUI.js';
import { setupChatbot } from './logic/chatbotLogic.js';

// Global access for debugging or specific events
(window as any).Game = Game;

async function initGame() {
    console.log("Inicializando núcleo de Aincrad Chronicles...");
    
    // 1. Cargar datos guardados
    const saved = localStorage.getItem('sao_save');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(Game.player, data);
            console.log("Datos del jugador restaurados:", Game.player.name);
        } catch (e) {
            console.error("Fallo al cargar datos guardados:", e);
        }
    }

    // 2. Inicializar stats y HUD
    calculateEffectiveStats();
    updatePlayerHUD();
    renderWikiContent();
    setupEventListeners();
    initSkillsUI();
    setupChatbot();

    // 3. Chequeo Crítico de Nombre
    if (!Game.player.name || Game.player.name.trim() === "") {
        console.log("Nuevo jugador detectado. Abriendo Link Start...");
        document.body.classList.add('needs-name');
        openModal('nameEntryModal');
    } else {
        document.body.classList.remove('needs-name');
        showNotification(`Bienvenido de nuevo, ${Game.player.name}.`, 'default');
    }
    
    // Audio Init
    const audio = document.getElementById('background-music') as HTMLAudioElement;
    if (audio) {
        audio.volume = 0.2;
    }
}

function setupEventListeners() {
    setupModalListeners();
    
    const bind = (id: string, fn: Function) => {
        const el = document.getElementById(id);
        if(el) el.onclick = (e) => { e.preventDefault(); fn(); };
    };

    bind('combat-btn', () => initCombat(false));
    bind('boss-combat-btn', () => initCombat(true));
    bind('inventory-btn', () => openModal('inventoryModal'));
    bind('train-skill-btn', () => {
        openModal('skillsModal');
        renderSkillsGrid();
    });
    bind('player-stats-btn', () => openModal('playerStatsModal'));
    
    bind('music-toggle-btn', () => {
        const audio = document.getElementById('background-music') as HTMLAudioElement;
        if (audio) {
            if (audio.paused) {
                audio.play().catch(() => showNotification("Haz clic en la pantalla para activar sonido.", "default"));
            } else {
                audio.pause();
            }
        }
    });

    bind('submitPlayerNameBtn', () => {
        const input = document.getElementById('playerNameInput') as HTMLInputElement;
        const val = input.value.trim();
        if (val && val.length >= 3) {
            Game.player.name = val;
            document.body.classList.remove('needs-name');
            closeModal('nameEntryModal');
            calculateEffectiveStats();
            updatePlayerHUD();
            showNotification(`¡Bienvenido, ${val}! Sincronización completa.`, 'success');
            localStorage.setItem('sao_save', JSON.stringify(Game.player));
        } else {
            showNotification("El nombre debe tener al menos 3 caracteres.", "error");
        }
    });

    bind('save-game-btn', () => {
        localStorage.setItem('sao_save', JSON.stringify(Game.player));
        showNotification("Datos guardados en el sistema Cardinal.", "success");
    });

    bind('new-game-btn', () => {
        if(confirm("¿Seguro que quieres borrar tu partida? Esta acción es irreversible.")) {
            localStorage.removeItem('sao_save');
            location.reload();
        }
    });

    bind('combat-action-attack', () => combatAction('attack'));
    
    bind('toggle-header-btn', () => {
        const header = document.querySelector('header');
        header?.classList.toggle('hidden');
    });
}

document.addEventListener('DOMContentLoaded', initGame);