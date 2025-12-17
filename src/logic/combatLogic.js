
import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { skillDatabase, statusEffects } from '../data/skills.js';
import { baseItems } from '../data/items.js';
import { showNotification, showFloatingText, playSfx } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { gainExp, addItemToInventory, useConsumable } from './playerLogic.js';

export function initCombat(isBossFight) {
    if (Game.player.hp <= 0) {
        showNotification("No puedes luchar si estás derrotado.", "error");
        return;
    }
    const floor = floorData[Game.player.currentFloor];
    const listContainer = document.getElementById('mobListContainer');
    if (!listContainer) return;
    
    listContainer.innerHTML = '';
    
    let mobs = [];
    if (isBossFight) {
        if (floor.boss) mobs.push({...floor.boss, type: 'boss'});
    } else {
        if (floor.monsters) mobs = floor.monsters.map(m => ({...m, type: 'monster'}));
    }
    
    if(mobs.length === 0) {
        showNotification("No hay enemigos en este piso.", "default");
        return;
    }

    mobs.forEach(mob => {
        const el = document.createElement('div');
        el.className = 'mob-card';
        el.innerHTML = `
            <div class="mob-card-icon">${mob.icon || '👾'}</div>
            <div class="mob-card-name">${mob.name}</div>
            <div class="mob-card-info">❤️ HP: ${mob.hp} | ⚔️ ATK: ${mob.attack}</div>
        `;
        el.onclick = () => startCombat(mob, isBossFight);
        listContainer.appendChild(el);
    });
    
    openModal('mobSelectionModal');
}

function startCombat(mobTemplate, isBoss) {
    closeModal('mobSelectionModal');
    
    const activeView = document.getElementById('combat-active-view');
    const resultView = document.getElementById('combat-results-view');
    if (!activeView || !resultView) return;
    
    activeView.style.display = 'block';
    resultView.style.display = 'none';

    const enemy = JSON.parse(JSON.stringify(mobTemplate));
    enemy.currentHp = enemy.hp;
    enemy.activeStatusEffects = [];
    
    Game.currentCombat = {
        active: true,
        enemy: enemy,
        isBoss: isBoss,
        playerTurn: true,
        turnCount: 1,
        drops: []
    };
    
    // Reset UI
    const log = document.getElementById('combat-log-display');
    if (log) log.innerHTML = '';
    
    updateCombatUI();
    openModal('combatModal');
}

export function updateCombatUI() {
    const p = Game.player;
    const e = Game.currentCombat.enemy;
    if(!e) return;

    const updateText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val;
    };

    updateText('combat-player-hp-current', Math.floor(p.hp));
    updateText('combat-player-hp-max', p.maxHp);
    updateText('combat-enemy-hp-current', Math.floor(e.currentHp));
    updateText('combat-enemy-hp-max', e.hp);

    const pBar = document.getElementById('combat-player-hp-bar');
    if (pBar) pBar.style.width = `${Math.max(0, (p.hp/p.maxHp)*100)}%`;
    
    const eBar = document.getElementById('combat-enemy-hp-bar-fill');
    if (eBar) eBar.style.width = `${Math.max(0, (e.currentHp/e.hp)*100)}%`;

    const playerDisp = document.getElementById('combat-player-display');
    const enemyDisp = document.getElementById('combat-enemy-display');
    
    if (Game.currentCombat.playerTurn) {
        if (playerDisp) playerDisp.classList.add('active-turn');
        if (enemyDisp) enemyDisp.classList.remove('active-turn');
    } else {
        if (playerDisp) playerDisp.classList.remove('active-turn');
        if (enemyDisp) enemyDisp.classList.add('active-turn');
    }
}

export function combatAction(actionType) {
    if(!Game.currentCombat.active || !Game.currentCombat.playerTurn) return;
    
    if (actionType === 'attack') {
        const damage = Math.max(1, Game.player.effectiveAttack - (Game.currentCombat.enemy.defense || 0));
        Game.currentCombat.enemy.currentHp -= damage;
        addCombatLog(`🗡️ Atacas a ${Game.currentCombat.enemy.name} causando ${damage} de daño.`, 'player-action');
        
        if (Game.currentCombat.enemy.currentHp <= 0) {
            endCombat(true);
        } else {
            endTurn();
        }
    }
}

function addCombatLog(msg, type) {
    const log = document.getElementById('combat-log-display');
    if (log) {
        const p = document.createElement('p');
        p.textContent = msg;
        p.className = type;
        log.appendChild(p);
        log.scrollTop = log.scrollHeight;
    }
}

function endTurn() {
    Game.currentCombat.playerTurn = false;
    updateCombatUI();
    setTimeout(enemyTurn, 1000);
}

function enemyTurn() {
    if (!Game.currentCombat.active) return;
    const enemy = Game.currentCombat.enemy;
    const damage = Math.max(1, enemy.attack - Game.player.effectiveDefense);
    Game.player.hp -= damage;
    addCombatLog(`👾 ${enemy.name} te ataca causando ${damage} de daño.`, 'enemy-action');
    
    if (Game.player.hp <= 0) {
        endCombat(false);
    } else {
        Game.currentCombat.playerTurn = true;
        updateCombatUI();
    }
}

function endCombat(win) {
    Game.currentCombat.active = false;
    if (win) {
        showNotification("¡Victoria!", "success");
        gainExp(Game.currentCombat.enemy.exp);
        Game.player.col += Game.currentCombat.enemy.col;
    } else {
        showNotification("Has sido derrotado...", "error");
        Game.player.hp = Math.floor(Game.player.maxHp * 0.1);
    }
    updatePlayerHUD();
    closeModal('combatModal');
}
