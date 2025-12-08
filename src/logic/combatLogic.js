
import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { showNotification, showFloatingText, playSfx } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { gainExp, addItemToInventory } from './playerLogic.js';

export function initCombat(isBossFight) {
    if (Game.player.hp <= 0) {
        showNotification("Estás derrotado.", "error");
        return;
    }
    const floor = floorData[Game.player.currentFloor];
    const listContainer = document.getElementById('mobListContainer');
    listContainer.innerHTML = '';
    document.getElementById('mobSelectionMessage').textContent = '';
    
    const mobs = isBossFight ? (floor.boss ? [{...floor.boss, type:'boss'}] : []) : floor.monsters || [];
    
    if(mobs.length === 0) {
        document.getElementById('mobSelectionMessage').textContent = "No hay enemigos disponibles.";
    } else {
        mobs.forEach(mob => {
            const el = document.createElement('div');
            el.className = 'mob-card';
            if(mob.type === 'boss') el.classList.add('selected'); 
            
            el.innerHTML = `
                <div class="mob-card-icon">${mob.icon || '👾'}</div>
                <div class="mob-card-name" style="color:${mob.type === 'boss' ? '#ff6347' : '#00ffff'}">${mob.name}</div>
                <div class="mob-card-info">❤️ ${mob.hp} | ⚔️ ${mob.attack}</div>
                <div class="mob-card-info">EXP: ${mob.exp}</div>
            `;
            el.onclick = () => startCombat(mob, isBossFight);
            listContainer.appendChild(el);
        });
    }
    openModal('mobSelectionModal');
}

function startCombat(mobTemplate, isBoss) {
    closeModal('mobSelectionModal');
    
    const enemy = JSON.parse(JSON.stringify(mobTemplate));
    enemy.currentHp = enemy.hp;
    enemy.activeStatusEffects = [];
    
    Game.currentCombat = {
        active: true,
        enemy: enemy,
        isBoss: isBoss,
        playerTurn: true,
        turnCount: 0
    };
    
    Game.player.activeStatusEffects = [];
    Game.player.attackComboCount = 0;
    
    updateCombatUI();
    openModal('combatModal');
    
    // Initial Log
    const log = document.getElementById('combat-log-display');
    log.innerHTML = ''; 
    addCombatLog(`Combate iniciado contra ${enemy.name}!`);
}

export function combatAction(actionType) {
    if(!Game.currentCombat.active || !Game.currentCombat.playerTurn) return;
    
    const player = Game.player;
    const enemy = Game.currentCombat.enemy;
    
    if (actionType === 'attack') {
        const rawDmg = Math.max(1, player.effectiveAttack - enemy.defense);
        const damage = Math.floor(rawDmg * (0.9 + Math.random() * 0.2));
        
        dealDamage(damage, enemy, 'player');
        
        if (enemy.currentHp > 0) {
            endTurn();
        }
    } else if (actionType === 'flee') {
        if (Math.random() > (Game.currentCombat.isBoss ? 0.9 : 0.4)) {
            endCombat(false, true); 
        } else {
            addCombatLog("¡Fallo al huir!");
            endTurn();
        }
    }
}

function dealDamage(amount, target, source) {
    const isPlayerTarget = (source === 'enemy');
    
    if (isPlayerTarget) {
        Game.player.hp = Math.max(0, Game.player.hp - amount);
    } else {
        target.currentHp = Math.max(0, target.currentHp - amount);
    }
    
    const displayEl = isPlayerTarget ? document.getElementById('combat-player-display') : document.getElementById('combat-enemy-display');
    const modalContent = document.querySelector('#combatModal .modal-content');

    // Visual Flair: Flash
    displayEl.classList.add('damage-flash');
    setTimeout(() => displayEl.classList.remove('damage-flash'), 200);
    
    // Visual Flair: Screen Shake on heavy hit
    const maxHp = isPlayerTarget ? Game.player.maxHp : target.hp;
    if (amount > maxHp * 0.1) {
        modalContent.classList.add('screen-shake');
        setTimeout(() => modalContent.classList.remove('screen-shake'), 450);
    }

    // Dynamic Floating Text
    showFloatingText(`-${amount}`, displayEl, { 
        type: 'damage', 
        shaky: amount > maxHp * 0.15,
        large: amount > maxHp * 0.2
    });

    addCombatLog(`${source === 'player' ? 'Atacas' : target.name + ' ataca'} por ${amount} daño.`);
    playSfx('hit'); 
    
    updateCombatUI();
    
    if (isPlayerTarget && Game.player.hp <= 0) {
        endCombat(false);
    } else if (!isPlayerTarget && target.currentHp <= 0) {
        endCombat(true);
    }
}

function endTurn() {
    Game.currentCombat.playerTurn = false;
    updateCombatUI();
    
    setTimeout(() => {
        if(Game.currentCombat.active) enemyTurn();
    }, 1000);
}

function enemyTurn() {
    if(!Game.currentCombat.active) return;
    const enemy = Game.currentCombat.enemy;
    const player = Game.player;
    
    const rawDmg = Math.max(1, enemy.attack - player.effectiveDefense);
    const damage = Math.floor(rawDmg * (0.8 + Math.random() * 0.4));
    
    dealDamage(damage, player, 'enemy');
    
    if(Game.player.hp > 0) {
        Game.currentCombat.playerTurn = true;
        updateCombatUI();
    }
}

function endCombat(win, fled = false) {
    Game.currentCombat.active = false;
    
    const modalContent = document.querySelector('#combatModal .modal-content');
    if(win) modalContent.classList.add('combat-victory');
    else if(!fled) modalContent.classList.add('combat-defeat');
    
    setTimeout(() => {
        modalContent.classList.remove('combat-victory', 'combat-defeat');
        closeModal('combatModal');
        
        if (fled) {
            showNotification("Escapaste.", "default");
        } else if (win) {
            const enemy = Game.currentCombat.enemy;
            showNotification(`¡Victoria! Ganaste ${enemy.exp} EXP y ${enemy.col} Col.`, "success");
            gainExp(enemy.exp);
            Game.player.col += enemy.col;
            
            if(enemy.drops) {
                Object.entries(enemy.drops).forEach(([id, chance]) => {
                    if(Math.random() < chance) {
                        addItemToInventory({id}, 1);
                        showNotification(`Drop: ${id}`, "success");
                    }
                });
            }
        } else {
            showNotification("Has sido derrotado...", "error");
            Game.player.hp = Math.floor(Game.player.maxHp * 0.1); 
        }
        updatePlayerHUD();
    }, 1500);
}

function updateCombatUI() {
    const p = Game.player;
    const e = Game.currentCombat.enemy;
    if(!e) return;
    
    document.getElementById('combat-player-hp-current').textContent = p.hp;
    document.getElementById('combat-player-hp-max').textContent = p.maxHp;
    const pHpPct = (p.hp / p.maxHp) * 100;
    const pHpBar = document.getElementById('combat-player-hp-bar');
    pHpBar.style.width = `${pHpPct}%`;
    pHpBar.className = 'combat-hp-bar-fill';
    if(pHpPct < 25) pHpBar.classList.add('critical');
    else if(pHpPct < 50) pHpBar.classList.add('low');
    
    document.getElementById('combat-enemy-hp-current').textContent = e.currentHp;
    document.getElementById('combat-enemy-hp-max').textContent = e.hp;
    const eHpPct = (e.currentHp / e.hp) * 100;
    const eHpBar = document.getElementById('combat-enemy-hp-bar-fill');
    eHpBar.style.width = `${eHpPct}%`;
    eHpBar.className = 'combat-hp-bar-fill';
    if(eHpPct < 25) eHpBar.classList.add('critical');
    else if(eHpPct < 50) eHpBar.classList.add('low');
    
    document.getElementById('combat-enemy-name').textContent = e.name;
    document.getElementById('combat-enemy-icon').textContent = e.icon;
    
    if(Game.currentCombat.playerTurn) {
        document.getElementById('combat-player-display').classList.add('active-turn');
        document.getElementById('combat-enemy-display').classList.remove('active-turn');
    } else {
        document.getElementById('combat-player-display').classList.remove('active-turn');
        document.getElementById('combat-enemy-display').classList.add('active-turn');
    }
}

function addCombatLog(msg) {
    const log = document.getElementById('combat-log-display');
    const p = document.createElement('p');
    p.textContent = msg;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}
