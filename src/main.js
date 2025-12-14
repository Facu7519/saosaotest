import { Game } from './state/gameState.js';
import { updatePlayerHUD } from './ui/hud.js';
import { openModal, setupModalListeners, closeModal } from './ui/modals.js';
import { initCombat, combatAction, showCombatOptions } from './logic/combatLogic.js';
import { renderWikiContent, renderPlayerStats } from './ui/renderers.js'; 
import { setupAdminListeners } from './logic/adminLogic.js';
import { showNotification } from './utils/helpers.js';
import { addItemToInventory, calculateEffectiveStats, trainPlayer } from './logic/playerLogic.js';
import { floorData } from './data/floors.js';
import { renderUpgradeEquipmentList } from './logic/blacksmithLogic.js';
import { initSkillsUI, renderSkillsGrid } from './ui/skillsUI.js';
import { skillDatabase } from './data/skills.js';

window.Game = Game;

// Auto-Save Interval Reference
let autoSaveInterval;

function initGame() {
    console.log("Inicializando juego...");
    createParticles();
    
    // Attempt to load save
    const saved = localStorage.getItem('sao_save');
    if (saved) {
        try {
            const data = JSON.parse(saved);
            Object.assign(Game.player, data);
            
            // Backwards compatibility for new Skill System
            if (!Game.player.unlockedSkills) {
                 Game.player.unlockedSkills = { 'sonic_leap': 1 };
                 Game.player.skillPoints = Game.player.level * 2; // Retroactive SP
            }
            
            // Compatibility: Initialize equippedSkills if missing
            if (!Game.player.equippedSkills) {
                // Auto-equip all currently unlocked active skills (up to 4)
                Game.player.equippedSkills = Object.keys(Game.player.unlockedSkills).filter(id => {
                    return skillDatabase[id] && skillDatabase[id].type === 'active';
                }).slice(0, 4);
            }

            // Compatibility for Dual Wield
            if (!Game.player.equipment.weapon2) Game.player.equipment.weapon2 = null;

            calculateEffectiveStats();
            Game.player.unlockedFloors.forEach(f => {
                if(floorData[f]) floorData[f].unlocked = true;
            });

            if (!Game.player.name) {
                openModal('nameEntryModal');
            } else {
                showNotification("Juego cargado correctamente.", "success");
            }
        } catch (e) {
            console.error("Error cargando partida:", e);
            localStorage.removeItem('sao_save'); // Corrupt save cleanup
            openModal('nameEntryModal');
        }
    } else {
        if(Game.player.inventory.length === 0) {
            addItemToInventory({ id: 'healing_potion_s' }, 5);
            addItemToInventory({ id: 'basic_sword' }, 1);
        }
        openModal('nameEntryModal');
    }

    updatePlayerHUD();
    renderWikiContent();
    setupEventListeners();
    initSkillsUI(); // Initialize Skill Tabs
    
    startAutoSave();
}

function startAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(() => {
        if (Game.player.name && !Game.currentCombat.active) {
            saveGame(true); 
        }
    }, 60000); 
}

function saveGame(silent = false) {
    try {
        localStorage.setItem('sao_save', JSON.stringify(Game.player));
        if (!silent) showNotification("Partida guardada.", "success");
    } catch (e) {
        console.error("Save failed", e);
    }
}

function createParticles() {
    const container = document.getElementById('particles');
    if (!container) return;
    container.innerHTML = '';
    const symbols = ['⚔️', '🛡️', '💎', '✨', '🌐', '🌀', '🗝️'];
    for(let i=0; i<25; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        p.textContent = symbols[Math.floor(Math.random()*symbols.length)];
        p.style.left = Math.random()*100 + 'vw';
        p.style.fontSize = (Math.random() * 1.5 + 0.5) + 'rem';
        p.style.animationDuration = (15 + Math.random()*25) + 's';
        p.style.animationDelay = (Math.random()*10) + 's';
        container.appendChild(p);
    }
}

function setupEventListeners() {
    setupModalListeners();
    const bind = (id, fn) => {
        const el = document.getElementById(id);
        if(el) el.addEventListener('click', fn);
    };

    bind('toggle-header-btn', () => {
        document.querySelector('header').classList.toggle('hidden');
        document.getElementById('toggle-header-btn').classList.toggle('header-hidden');
    });

    bind('music-toggle-btn', () => {
        const audio = document.getElementById('background-music');
        const btn = document.getElementById('music-toggle-btn');
        
        if (audio.paused) {
            const playPromise = audio.play();
            if (playPromise !== undefined) {
                playPromise.then(_ => {
                    btn.textContent = "🔊 Pausar Música";
                    btn.style.color = "#00ffff"; // Active color
                    btn.style.borderColor = "#00ffff";
                }).catch(error => {
                    console.warn("Autoplay prevented:", error);
                    showNotification("Interacción requerida para audio.", "error");
                });
            }
        } else {
            audio.pause();
            btn.textContent = "🔇 Activar Música";
            btn.style.color = "#87ceeb"; // Inactive/default color
            btn.style.borderColor = "#87ceeb";
        }
    });

    bind('combat-btn', () => initCombat(false));
    bind('boss-combat-btn', () => initCombat(true));
    bind('inventory-btn', () => openModal('inventoryModal'));
    bind('shop-btn', () => openModal('shopModal'));
    bind('blacksmith-btn', () => openModal('blacksmithMainModal'));
    bind('player-stats-btn', () => {
        renderPlayerStats(); 
        openModal('playerStatsModal');
    });
    bind('admin-access-btn', () => openModal('adminKeyModal'));
    
    bind('btn-open-forge', () => openModal('blacksmithForgeModal'));
    bind('btn-open-upgrade', () => {
        openModal('blacksmithUpgradeModal');
        renderUpgradeEquipmentList();
    });

    // Replaced "Entrenar" with Skills Menu
    bind('train-skill-btn', () => {
        openModal('skillsModal');
        renderSkillsGrid();
    });

    // Combat Bindings
    bind('combat-action-attack', () => combatAction('attack'));
    bind('combat-action-flee', () => combatAction('flee'));
    bind('combat-action-skills', () => showCombatOptions('skills'));
    bind('combat-action-potions', () => showCombatOptions('potions'));
    
    bind('floor-navigate-btn', () => {
        const grid = document.getElementById('floor-select-grid');
        grid.innerHTML = '';
        const floorsToShow = Object.keys(floorData).map(Number).sort((a,b)=>a-b);
        floorsToShow.forEach(fNum => {
            const floorInfo = floorData[fNum];
            const isUnlocked = Game.player.unlockedFloors.includes(fNum);
            const btn = document.createElement('button');
            btn.className = 'floor-button'; 
            btn.disabled = !isUnlocked;
            btn.innerHTML = `<div class="floor-num">${fNum}</div><div class="floor-name">${isUnlocked ? floorInfo.name : '???'}</div>`;
            if (isUnlocked) {
                btn.onclick = () => {
                    Game.player.currentFloor = fNum;
                    updatePlayerHUD();
                    closeModal('floorNavigationModal');
                    showNotification(`Viajaste al Piso ${fNum}`);
                    saveGame(true);
                };
            }
            grid.appendChild(btn);
        });
        openModal('floorNavigationModal');
    });

    bind('save-game-btn', () => saveGame(false));
    bind('load-game-btn', () => { 
        if(confirm("¿Recargar la partida? Se perderán los cambios no guardados.")) location.reload();
    });
    bind('new-game-btn', () => {
        if(confirm("¿Reiniciar TODO? Se borrará tu progreso.")) {
            localStorage.removeItem('sao_save');
            location.reload();
        }
    });
    bind('submitPlayerNameBtn', () => {
        const name = document.getElementById('playerNameInput').value.trim();
        if(name) {
            Game.player.name = name;
            closeModal('nameEntryModal');
            updatePlayerHUD();
            saveGame(true);
        }
    });
    
    setupAdminListeners();
}

document.addEventListener('DOMContentLoaded', initGame);