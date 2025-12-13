
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
            // Deep merge logic simplified for this scope, relying on Object.assign for top level
            Object.assign(Game.player, data);
            
            // Re-calculate stats to ensure integrity
            calculateEffectiveStats();
            
            // Restore unlocked floors visuals/state
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
        // New Game Defaults
        if(Game.player.inventory.length === 0) {
            addItemToInventory({ id: 'healing_potion_s' }, 5);
            addItemToInventory({ id: 'basic_sword' }, 1);
        }
        openModal('nameEntryModal');
    }

    updatePlayerHUD();
    renderWikiContent();
    setupEventListeners();
    
    // Start Auto-Save Loop (Every 60 seconds)
    startAutoSave();
}

function startAutoSave() {
    if (autoSaveInterval) clearInterval(autoSaveInterval);
    autoSaveInterval = setInterval(() => {
        if (Game.player.name && !Game.currentCombat.active) {
            saveGame(true); // Silent save
        }
    }, 60000); 
}

function saveGame(silent = false) {
    try {
        localStorage.setItem('sao_save', JSON.stringify(Game.player));
        if (!silent) showNotification("Partida guardada.", "success");
        else console.log("Auto-save complete.");
    } catch (e) {
        console.error("Save failed", e);
        if (!silent) showNotification("Error al guardar.", "error");
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

    bind('train-skill-btn', () => {
        openModal('trainingModal');
        const trainGrid = document.getElementById('training-grid-display');
        if (trainGrid) {
            trainGrid.innerHTML = ''; 
            const cost = 50 * Game.player.level;
            
            const opt = document.createElement('div');
            opt.className = 'training-option'; 
            opt.innerHTML = `
                <span class="item-icon">💪</span>
                <span class="item-name">Entrenamiento Físico</span>
                <span class="training-stats-gain">Mejora ATK/HP/MP</span>
                <span class="item-price">Costo: ${cost} Col</span>
            `;
            opt.onclick = () => {
                if(trainPlayer()) saveGame(true); // Save after training
            };
            trainGrid.appendChild(opt);
            
            document.getElementById('training-player-col').textContent = Game.player.col;
            document.getElementById('training-stats-preview').innerHTML = `
                <li>ATK: +1</li>
                <li>DEF: +0-2</li>
                <li>HP: +5</li>
                <li>MP: +2</li>
                <li>Costo: ${cost} Col</li>
            `;
        }
    });

    // Combat Bindings
    bind('combat-action-attack', () => combatAction('attack'));
    bind('combat-action-flee', () => combatAction('flee'));
    bind('combat-action-skills', () => showCombatOptions('skills'));
    bind('combat-action-potions', () => showCombatOptions('potions'));
    
    // Floor Nav - Show floor list based on floorData
    bind('floor-navigate-btn', () => {
        const grid = document.getElementById('floor-select-grid');
        grid.innerHTML = '';
        
        // Show floors defined in data + any unlocked ones that might not have data yet (logic safety)
        const floorsToShow = Object.keys(floorData).map(Number).sort((a,b)=>a-b);
        
        floorsToShow.forEach(fNum => {
            const floorInfo = floorData[fNum];
            const isUnlocked = Game.player.unlockedFloors.includes(fNum);
            
            const btn = document.createElement('button');
            btn.className = 'floor-button'; 
            btn.disabled = !isUnlocked;
            
            btn.innerHTML = `
                <span class="floor-name">Piso ${fNum}</span>
                <span class="floor-description">${isUnlocked ? floorInfo.name : '???'}</span>
            `;
            
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
        if(confirm("¿Recargar la partida? Se perderán los cambios no guardados.")) {
            location.reload();
        }
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
