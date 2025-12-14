import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { statusEffects } from '../data/skills.js';

export function updatePlayerHUD() {
    const player = Game.player;
    // Note: calculateEffectiveStats() should be called by the logic modifying the stats 
    // BEFORE calling updatePlayerHUD to avoid circular dependencies.

    // Text Elements
    const nameEl = document.getElementById('sao-player-name-display');
    if (nameEl) nameEl.textContent = player.name || "Jugador";
    
    document.getElementById('player-level').textContent = player.level;
    document.getElementById('current-floor').textContent = player.currentFloor;
    document.getElementById('floor-name').textContent = floorData[player.currentFloor]?.name || "Desconocido";
    document.getElementById('player-col').textContent = player.col;
    const trainCost = document.getElementById('train-cost-display');
    if(trainCost) trainCost.textContent = 50 * player.level;

    // Stats
    document.getElementById('player-hp-current').textContent = Math.floor(player.hp);
    document.getElementById('player-hp-max').textContent = player.maxHp;
    document.getElementById('player-mp-current').textContent = Math.floor(player.mp);
    document.getElementById('player-mp-max').textContent = player.maxMp;
    document.getElementById('current-exp').textContent = player.currentExp;
    document.getElementById('needed-exp').textContent = player.neededExp;

    // HP Bar Logic
    const hpBar = document.getElementById('sao-hp-bar');
    const safeMaxHp = Math.max(1, player.maxHp);
    const hpPercent = (player.hp / safeMaxHp) * 100;
    
    hpBar.style.width = `${Math.max(0, Math.min(100, hpPercent))}%`;
    hpBar.className = 'sao-hp-bar-fill'; 
    if (hpPercent < 25) {
        hpBar.classList.add('critical'); 
    } else if (hpPercent < 50) {
        hpBar.classList.add('low');      
    }

    document.getElementById('mp-bar-fill').style.width = `${(player.mp / Math.max(1, player.maxMp)) * 100}%`;
    document.getElementById('exp-bar-fill').style.width = `${(player.currentExp / Math.max(1, player.neededExp)) * 100}%`;

    const displayElement = document.getElementById('player-status-effects-display');
    displayElement.innerHTML = '';
    player.activeStatusEffects.forEach(effect => {
        const effectData = statusEffects[effect.type];
        if (effectData) {
            const iconSpan = document.createElement('div');
            iconSpan.className = 'status-effect-badge';
            iconSpan.setAttribute('data-tooltip', `${effectData.name}: ${effect.duration}s`);
            iconSpan.textContent = effectData.icon;
            iconSpan.style.borderColor = effectData.color || '#fff';
            displayElement.appendChild(iconSpan);
        }
    });
}