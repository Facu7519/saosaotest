
import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { statusEffects } from '../data/skills.js';

export function updatePlayerHUD() {
    const player = Game.player;
    if (!player) return;

    // Helper ultra-defensivo para actualizar texto
    const updateText = (id, text) => {
        const el = document.getElementById(id);
        if (el) el.textContent = text;
    };

    updateText('sao-player-name-display', player.name || "Jugador");
    updateText('player-level', player.level);
    updateText('current-floor', player.currentFloor);
    updateText('floor-name', floorData[player.currentFloor]?.name || "Desconocido");
    updateText('player-col', player.col);

    updateText('player-hp-current', Math.floor(player.hp));
    updateText('player-hp-max', player.maxHp);
    updateText('player-mp-current', Math.floor(player.mp));
    updateText('player-mp-max', player.maxMp);
    updateText('current-exp', player.currentExp);
    updateText('needed-exp', player.neededExp);

    // Barras de progreso con seguridad
    const safeUpdateWidth = (id, percent) => {
        const el = document.getElementById(id);
        if (el) el.style.width = `${Math.max(0, Math.min(100, percent))}%`;
    };

    const hpPercent = (player.hp / Math.max(1, player.maxHp)) * 100;
    const hpBar = document.getElementById('sao-hp-bar');
    if (hpBar) {
        hpBar.style.width = `${hpPercent}%`;
        hpBar.className = 'sao-hp-bar-fill'; 
        if (hpPercent < 25) hpBar.classList.add('critical'); 
        else if (hpPercent < 50) hpBar.classList.add('low');      
    }

    safeUpdateWidth('mp-bar-fill', (player.mp / Math.max(1, player.maxMp)) * 100);
    safeUpdateWidth('exp-bar-fill', (player.currentExp / Math.max(1, player.neededExp)) * 100);

    // Estados alterados
    const displayElement = document.getElementById('player-status-effects-display');
    if (displayElement) {
        displayElement.innerHTML = '';
        if (player.activeStatusEffects) {
            player.activeStatusEffects.forEach(effect => {
                const effectData = statusEffects[effect.type];
                if (effectData) {
                    const iconSpan = document.createElement('div');
                    iconSpan.className = 'status-effect-badge';
                    iconSpan.textContent = effectData.icon;
                    iconSpan.style.borderColor = effectData.color || '#fff';
                    displayElement.appendChild(iconSpan);
                }
            });
        }
    }
}
