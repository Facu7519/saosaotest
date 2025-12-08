
import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { calculateEffectiveStats } from '../logic/playerLogic.js';
import { statusEffects } from '../data/skills.js';

export function updatePlayerHUD() {
    const player = Game.player;
    calculateEffectiveStats();

    // Text Elements
    document.getElementById('sao-player-name-display').textContent = player.name || "Jugador";
    document.getElementById('player-level').textContent = player.level;
    document.getElementById('current-floor').textContent = player.currentFloor;
    document.getElementById('floor-name').textContent = floorData[player.currentFloor]?.name || "Desconocido";
    document.getElementById('player-col').textContent = player.col;
    const trainCost = document.getElementById('train-cost-display');
    if(trainCost) trainCost.textContent = 50 * player.level;

    // Stats
    document.getElementById('player-hp-current').textContent = player.hp;
    document.getElementById('player-hp-max').textContent = player.maxHp;
    document.getElementById('player-mp-current').textContent = player.mp;
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
            const iconSpan = document.createElement('span');
            iconSpan.className = 'status-effect-icon';
            iconSpan.textContent = effectData.icon;
            iconSpan.title = `${effectData.name}: ${effect.duration} turnos`;
            iconSpan.style.color = effectData.color;
            displayElement.appendChild(iconSpan);
        }
    });
}
