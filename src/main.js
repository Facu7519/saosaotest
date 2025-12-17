
import { Game } from './state/gameState.js';
import { updatePlayerHUD } from './ui/hud.js';
import { openModal, setupModalListeners, closeModal } from './ui/modals.js';
import { initCombat, combatAction } from './logic/combatLogic.js';
import { renderWikiContent, renderPlayerStats } from './ui/renderers.js'; 
import { showNotification } from './utils/helpers.js';
import { calculateEffectiveStats } from './logic/playerLogic.js';
import { initSkillsUI, renderSkillsGrid } from './ui/skillsUI.js';
import { setupChatbot } from './logic/chatbotLogic.js';

window.Game = Game;

function initGame() {
    console.log("Inicializando núcleo de Aincrad...");
    
    // Cargar partida guardada
    const saved = localStorage.getItem('sao_save');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(Game.player, data);
            calculateEffectiveStats();
        } catch (e) {
            console.error("Fallo al cargar datos:", e);
        }
    }

    // Nombre del jugador
    if (!Game.player.name) {
        setTimeout(() => openModal('nameEntryModal'), 500);
    }

    // Inicializar UI
    updatePlayerHUD();
    renderWikiContent();
    setupEventListeners();
    initSkillsUI();
    setupChatbot();
    
    // Manejo de música con fallback
    const audio = document.getElementById('background-music');
    if (audio) {
        audio.volume = 0.2;
        audio.onerror = () => console.warn("Audio theme no encontrado (404). El juego continuará en silencio.");
    }
}

function setupEventListeners() {
    // Inicializar listeners de modales (Cerrar/Esc/Click fuera)
    setupModalListeners();
    
    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if(el) {
            el.onclick = (e) => {
                e.preventDefault();
                fn();
            };
        } else {
            console.warn(`Elemento no encontrado: ${id}`);
        }
    };

    // Binds de los botones principales
    bind('combat-btn', () => initCombat(false));
    bind('boss-combat-btn', () => initCombat(true));
    bind('inventory-btn', () => openModal('inventoryModal'));
    bind('train-skill-btn', () => {
        openModal('skillsModal');
        renderSkillsGrid();
    });
    bind('player-stats-btn', () => {
        // Asumiendo que existe una función para renderizar stats en renderers.js o similar
        openModal('infoModal'); // Usar modal genérico si el de stats no existe
    });
    
    bind('music-toggle-btn', () => {
        const audio = document.getElementById('background-music');
        if (audio) {
            if (audio.paused) {
                audio.play().catch(() => showNotification("Haz clic en cualquier parte para activar audio", "default"));
            } else {
                audio.pause();
            }
        }
    });

    bind('submitPlayerNameBtn', () => {
        const val = document.getElementById('playerNameInput').value.trim();
        if (val) {
            Game.player.name = val;
            closeModal('nameEntryModal');
            updatePlayerHUD();
            showNotification(`Bienvenido, ${val}. Link Start!`, 'success');
        } else {
            showNotification("Debes ingresar un nombre válido", "error");
        }
    });

    bind('save-game-btn', () => {
        localStorage.setItem('sao_save', JSON.stringify(Game.player));
        showNotification("Datos sincronizados con el servidor Cardinal.", "success");
    });

    bind('new-game-btn', () => {
        if(confirm("¿Seguro que quieres borrar tu partida? Esta acción es irreversible.")) {
            localStorage.removeItem('sao_save');
            location.reload();
        }
    });

    bind('combat-action-attack', () => combatAction('attack'));
    
    // Toggle Header
    bind('toggle-header-btn', () => {
        const header = document.querySelector('header');
        header.classList.toggle('hidden');
    });
}

document.addEventListener('DOMContentLoaded', initGame);
