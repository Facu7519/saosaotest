
import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { showNotification, showFloatingText, playSfx } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { gainExp, addItemToInventory, useConsumable } from './playerLogic.js';

export function initCombat(isBossFight) {
    if (Game.player.hp <= 0) {
        showNotification("Estás derrotado.", "error");
        return;
    }
    const floor = floorData[Game.player.currentFloor];
    if (!floor) {
        showNotification("Error de datos de piso.", "error");
        return;
    }

    const listContainer = document.getElementById('mobListContainer');
    listContainer.innerHTML = '';
    document.getElementById('mobSelectionMessage').textContent = '';
    
    // Use data from floors.js directly
    let mobs = [];
    if (isBossFight) {
        if (floor.boss) mobs.push({...floor.boss, type: 'boss'});
    } else {
        if (floor.monsters) mobs = floor.monsters.map(m => ({...m, type: 'monster'}));
    }
    
    if(mobs.length === 0) {
        document.getElementById('mobSelectionMessage').textContent = isBossFight ? "No hay jefe en este piso." : "No hay enemigos disponibles.";
    } else {
        mobs.forEach(mob => {
            const el = document.createElement('div');
            el.className = 'mob-card';
            if(mob.type === 'boss') el.classList.add('selected'); 
            
            const nameColor = mob.type === 'boss' ? 'var(--sao-red-alert)' : 'var(--sao-cyan-hud)';
            
            el.innerHTML = `
                <div class="mob-card-icon">${mob.icon || '👾'}</div>
                <div class="mob-card-name" style="color:${nameColor}">${mob.name}</div>
                <div class="mob-card-info">❤️ ${mob.hp} | ⚔️ ${mob.attack}</div>
                <div class="mob-card-info">EXP: ${mob.exp} | Col: ${mob.col}</div>
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
    
    // UI Reset
    document.getElementById('combat-log-display').innerHTML = '';
    document.getElementById('combat-skills-list-container').style.display = 'none';
    document.getElementById('combat-potions-list-container').style.display = 'none';
    
    updateCombatUI();
    openModal('combatModal');
    
    addCombatLog(`¡Combate iniciado contra ${enemy.name}!`, 'system-message');
}

export function showCombatOptions(type) {
    if (!Game.currentCombat.active || !Game.currentCombat.playerTurn) return;

    const skillContainer = document.getElementById('combat-skills-list-container');
    const potionContainer = document.getElementById('combat-potions-list-container');
    
    skillContainer.style.display = 'none';
    potionContainer.style.display = 'none';

    if (type === 'skills') {
        skillContainer.innerHTML = '';
        const skills = Game.player.skills.filter(s => Game.player.level >= (s.levelReq || 0));
        
        if (skills.length === 0) {
            skillContainer.innerHTML = '<p>No tienes habilidades activas.</p>';
        } else {
            skills.forEach(skill => {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = `${skill.name} (${skill.mpCost} MP)`;
                btn.disabled = Game.player.mp < skill.mpCost;
                btn.onclick = () => performSkill(skill);
                skillContainer.appendChild(btn);
            });
        }
        skillContainer.style.display = 'flex';
    } 
    
    if (type === 'potions') {
        potionContainer.innerHTML = '';
        const potions = Game.player.inventory.filter(i => (i.type === 'consumable' && (i.effect.hp || i.effect.mp)));
        
        if (potions.length === 0) {
            potionContainer.innerHTML = '<p>No tienes pociones.</p>';
        } else {
            potions.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'action-btn';
                btn.textContent = `${item.name} (x${item.count})`;
                btn.onclick = () => performPotion(item);
                potionContainer.appendChild(btn);
            });
        }
        potionContainer.style.display = 'flex';
    }
}

function performSkill(skill) {
    if (Game.player.mp < skill.mpCost) return;
    
    Game.player.mp -= skill.mpCost;
    
    const damageMult = skill.damageMultiplier || 1;
    const rawDmg = Math.max(1, (Game.player.effectiveAttack * damageMult) - Game.currentCombat.enemy.defense);
    const damage = Math.floor(rawDmg);
    
    addCombatLog(`Usas ${skill.name}!`, 'player-action');
    dealDamage(damage, Game.currentCombat.enemy, 'player');
    
    if (Game.currentCombat.enemy.currentHp > 0) endTurn();
}

function performPotion(item) {
    // Find index in actual inventory
    const idx = Game.player.inventory.findIndex(i => i.id === item.id);
    if (idx !== -1) {
        useConsumable(Game.player.inventory[idx], idx); // This handles HP/MP restore
        addCombatLog(`Usaste ${item.name}.`, 'player-action');
        endTurn();
    }
}

export function combatAction(actionType) {
    if(!Game.currentCombat.active || !Game.currentCombat.playerTurn) return;
    
    const player = Game.player;
    const enemy = Game.currentCombat.enemy;
    
    if (actionType === 'attack') {
        const rawDmg = Math.max(1, player.effectiveAttack - (enemy.defense || 0));
        const damage = Math.floor(rawDmg * (0.9 + Math.random() * 0.2));
        
        addCombatLog(`Atacas a ${enemy.name}.`, 'player-action');
        dealDamage(damage, enemy, 'player');
        
        if (enemy.currentHp > 0) {
            endTurn();
        }
    } else if (actionType === 'flee') {
        if (Math.random() > (Game.currentCombat.isBoss ? 0.9 : 0.4)) {
            endCombat(false, true); 
        } else {
            addCombatLog("¡Fallo al huir!", 'enemy-action');
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
    
    // Screen Shake on heavy hit
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

    const msg = isPlayerTarget 
        ? `${Game.currentCombat.enemy.name} te inflige ${amount} de daño.` 
        : `Infliges ${amount} de daño a ${target.name}.`;
        
    addCombatLog(msg, isPlayerTarget ? 'enemy-action' : 'player-action');
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
    document.getElementById('combat-skills-list-container').style.display = 'none';
    document.getElementById('combat-potions-list-container').style.display = 'none';
    updateCombatUI();
    
    setTimeout(() => {
        if(Game.currentCombat.active) enemyTurn();
    }, 1000);
}

function enemyTurn() {
    if(!Game.currentCombat.active) return;
    const enemy = Game.currentCombat.enemy;
    const player = Game.player;
    
    // Simple Enemy AI: 20% chance to use skill if defined, else attack
    let damage = 0;
    let attackName = "ataque";
    
    if (enemy.skills && enemy.skills.length > 0 && Math.random() < 0.25) {
        const skill = enemy.skills[0]; // pick first
        attackName = skill.name;
        const mult = skill.damageMultiplier || 1.2;
        damage = Math.floor(Math.max(1, (enemy.attack * mult) - player.effectiveDefense));
    } else {
        damage = Math.floor(Math.max(1, enemy.attack - player.effectiveDefense));
    }
    
    addCombatLog(`${enemy.name} usa ${attackName}!`, 'enemy-action');
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
            showNotification("Lograste huir.", "default");
        } else if (win) {
            const enemy = Game.currentCombat.enemy;
            showNotification(`¡Victoria! Ganaste ${enemy.exp} EXP y ${enemy.col} Col.`, "success");
            gainExp(enemy.exp);
            Game.player.col += enemy.col;
            
            // Drops
            if(enemy.drops) {
                Object.entries(enemy.drops).forEach(([id, chance]) => {
                    if(Math.random() < chance) {
                        addItemToInventory({id}, 1);
                        showNotification(`Obtenido: ${id}`, "success");
                        addCombatLog(`Drop: ${id}`, 'system-message');
                    }
                });
            }

            // Floor Progression
            if (Game.currentCombat.isBoss) {
                const current = Game.player.currentFloor;
                if (!Game.player.unlockedFloors.includes(current + 1) && floorData[current + 1]) {
                    Game.player.unlockedFloors.push(current + 1);
                    floorData[current + 1].unlocked = true;
                    showNotification(`¡Piso ${current + 1} Desbloqueado!`, 'success', 8000);
                }
            }

        } else {
            showNotification("Has sido derrotado...", "error");
            Game.player.hp = Math.floor(Game.player.maxHp * 0.1); 
        }
        updatePlayerHUD();
    }, 2000);
}

function updateCombatUI() {
    const p = Game.player;
    const e = Game.currentCombat.enemy;
    if(!e) return;
    
    // Player
    document.getElementById('combat-player-hp-current').textContent = p.hp;
    document.getElementById('combat-player-hp-max').textContent = p.maxHp;
    const pHpPct = (p.hp / p.maxHp) * 100;
    const pHpBar = document.getElementById('combat-player-hp-bar');
    pHpBar.style.width = `${Math.max(0, pHpPct)}%`;
    pHpBar.className = 'combat-hp-bar-fill';
    if(pHpPct < 25) pHpBar.classList.add('critical');
    else if(pHpPct < 50) pHpBar.classList.add('low');
    
    // Enemy
    document.getElementById('combat-enemy-hp-current').textContent = e.currentHp;
    document.getElementById('combat-enemy-hp-max').textContent = e.hp;
    const eHpPct = (e.currentHp / e.hp) * 100;
    const eHpBar = document.getElementById('combat-enemy-hp-bar-fill');
    eHpBar.style.width = `${Math.max(0, eHpPct)}%`;
    eHpBar.className = 'combat-hp-bar-fill';
    if(eHpPct < 25) eHpBar.classList.add('critical');
    else if(eHpPct < 50) eHpBar.classList.add('low');
    
    document.getElementById('combat-enemy-name').textContent = e.name;
    document.getElementById('combat-enemy-icon').textContent = e.icon;
    
    // Turn indicators
    if(Game.currentCombat.playerTurn) {
        document.getElementById('combat-player-display').classList.add('active-turn');
        document.getElementById('combat-enemy-display').classList.remove('active-turn');
    } else {
        document.getElementById('combat-player-display').classList.remove('active-turn');
        document.getElementById('combat-enemy-display').classList.add('active-turn');
    }
}

function addCombatLog(msg, type = 'default') {
    const log = document.getElementById('combat-log-display');
    const p = document.createElement('p');
    p.textContent = msg;
    p.className = type;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}
