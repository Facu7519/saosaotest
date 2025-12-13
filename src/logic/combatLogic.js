
import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { skillDatabase, statusEffects } from '../data/skills.js';
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
    const listContainer = document.getElementById('mobListContainer');
    listContainer.innerHTML = '';
    
    let mobs = [];
    if (isBossFight) {
        if (floor.boss) mobs.push({...floor.boss, type: 'boss'});
    } else {
        if (floor.monsters) mobs = floor.monsters.map(m => ({...m, type: 'monster'}));
    }
    
    if(mobs.length === 0) {
        document.getElementById('mobSelectionMessage').textContent = "No hay enemigos disponibles.";
    } else {
        mobs.forEach(mob => {
            const el = document.createElement('div');
            el.className = 'mob-card';
            if(mob.type === 'boss') el.classList.add('selected'); 
            el.innerHTML = `
                <div class="mob-card-icon">${mob.icon || '👾'}</div>
                <div class="mob-card-name">${mob.name}</div>
                <div class="mob-card-info">❤️ ${mob.hp} | ⚔️ ${mob.attack}</div>
            `;
            el.onclick = () => startCombat(mob, isBossFight);
            listContainer.appendChild(el);
        });
    }
    openModal('mobSelectionModal');
}

function startCombat(mobTemplate, isBoss) {
    closeModal('mobSelectionModal');
    
    document.getElementById('combat-active-view').style.display = 'block';
    document.getElementById('combat-results-view').style.display = 'none';

    const enemy = JSON.parse(JSON.stringify(mobTemplate));
    enemy.currentHp = enemy.hp;
    enemy.activeStatusEffects = [];
    
    Game.currentCombat = {
        active: true,
        enemy: enemy,
        isBoss: isBoss,
        playerTurn: true,
        turnCount: 0,
        drops: [] // Reset drops
    };
    
    Game.player.attackComboCount = 0;
    
    document.getElementById('combat-log-display').innerHTML = '';
    document.getElementById('combat-skills-list-container').style.display = 'none';
    document.getElementById('combat-potions-list-container').style.display = 'none';
    
    updateCombatUI();
    openModal('combatModal');
    addCombatLog(`⚔️ ¡Combate iniciado contra ${enemy.name}!`, 'system-message');
}

export function showCombatOptions(type) {
    if (!Game.currentCombat.active || !Game.currentCombat.playerTurn) return;

    const skillContainer = document.getElementById('combat-skills-list-container');
    const potionContainer = document.getElementById('combat-potions-list-container');
    
    // Toggle logic
    const isSkillsVisible = skillContainer.style.display === 'flex';
    const isPotionsVisible = potionContainer.style.display === 'flex';

    skillContainer.style.display = 'none';
    potionContainer.style.display = 'none';

    if (type === 'skills') {
        if (isSkillsVisible) return; // Toggle Off

        skillContainer.innerHTML = '';
        const skills = Object.entries(Game.player.unlockedSkills)
            .map(([id, level]) => ({ id, level, ...skillDatabase[id] }))
            .filter(s => s.type === 'active');
        
        if (skills.length === 0) {
            skillContainer.innerHTML = '<p style="width:100%; text-align:center;">No tienes habilidades activas.</p>';
        } else {
            skills.forEach(skill => {
                const currentMpCost = skill.mpCost + (skill.mpGrowth * (skill.level - 1));
                const btn = document.createElement('button');
                btn.className = 'combat-sub-btn'; // Updated Class
                btn.innerHTML = `<span class="icon">${skill.icon}</span> ${skill.name} <span class="cost">${currentMpCost} MP</span>`;
                
                const canUse = Game.player.mp >= currentMpCost;
                btn.disabled = !canUse;
                
                btn.onclick = () => performSkill(skill);
                skillContainer.appendChild(btn);
            });
        }
        skillContainer.style.display = 'flex';
    } else if (type === 'potions') {
        if (isPotionsVisible) return; // Toggle Off

        potionContainer.innerHTML = '';
        const potions = Game.player.inventory.filter(i => (i.type === 'consumable' && (i.effect.hp || i.effect.mp)));
        
        if (potions.length === 0) {
             potionContainer.innerHTML = '<p style="width:100%; text-align:center;">No tienes pociones.</p>';
        } else {
            potions.forEach(item => {
                const btn = document.createElement('button');
                btn.className = 'combat-sub-btn potion';
                btn.innerHTML = `<span class="icon">${item.icon}</span> ${item.name} <span class="cost">x${item.count}</span>`;
                btn.onclick = () => performPotion(item);
                potionContainer.appendChild(btn);
            });
        }
        potionContainer.style.display = 'flex';
    }
}

function performSkill(skill) {
    const currentMpCost = skill.mpCost + (skill.mpGrowth * (skill.level - 1));
    if (Game.player.mp < currentMpCost) return;
    Game.player.mp -= currentMpCost;
    
    const levelFactor = (skill.growthPct * (skill.level - 1));
    const totalMultiplier = skill.baseDamagePct + levelFactor;
    
    let passiveAtkBonus = 1;
    if (Game.player.unlockedSkills['fighting_spirit']) {
        const lvl = Game.player.unlockedSkills['fighting_spirit'];
        const data = skillDatabase['fighting_spirit'];
        passiveAtkBonus += (data.baseEffect + (data.growthEffect * (lvl - 1)));
    }

    const rawDmg = Math.max(1, (Game.player.effectiveAttack * passiveAtkBonus * totalMultiplier) - Game.currentCombat.enemy.defense);
    const damage = Math.floor(rawDmg);
    
    // Hide menus
    document.getElementById('combat-skills-list-container').style.display = 'none';

    triggerSkillAnimation(skill.animClass, skill.hits);

    setTimeout(() => {
        addCombatLog(`✨ ${skill.name}! (${skill.hits} golpes)`, 'player-action');
        dealDamage(damage, Game.currentCombat.enemy, 'player', skill.hits);
        if (Game.currentCombat.enemy.currentHp > 0) endTurn();
    }, 600);
}

function triggerSkillAnimation(animClass, hits = 1) {
    const layer = document.getElementById('combat-animation-layer');
    const enemyEl = document.getElementById('combat-enemy-display');
    if (!layer || !enemyEl) return;
    
    const rect = enemyEl.getBoundingClientRect();
    const animEl = document.createElement('div');
    animEl.className = `skill-anim ${animClass}`;
    animEl.style.left = `${rect.left + rect.width/2}px`;
    animEl.style.top = `${rect.top + rect.height/2}px`;
    
    layer.appendChild(animEl);
    enemyEl.classList.add('shake-violent');
    
    setTimeout(() => {
        if(animEl.parentNode) layer.removeChild(animEl);
        enemyEl.classList.remove('shake-violent');
    }, 1000);
}

function performPotion(item) {
    const idx = Game.player.inventory.findIndex(i => i.id === item.id);
    if (idx !== -1) {
        // Visual feedback on player
        const playerEl = document.getElementById('combat-player-display');
        playerEl.classList.add('heal-flash');
        
        showFloatingText("Heal!", playerEl, { type: 'heal' });

        useConsumable(Game.player.inventory[idx], idx);
        addCombatLog(`🧪 Usaste ${item.name}.`, 'player-action');
        
        document.getElementById('combat-potions-list-container').style.display = 'none';
        
        setTimeout(() => {
            playerEl.classList.remove('heal-flash');
            endTurn();
        }, 500);
    }
}

export function combatAction(actionType) {
    if(!Game.currentCombat.active || !Game.currentCombat.playerTurn) return;
    
    if (actionType === 'attack') {
        const rawDmg = Math.max(1, Game.player.effectiveAttack - (Game.currentCombat.enemy.defense || 0));
        const damage = Math.floor(rawDmg * (0.9 + Math.random() * 0.2));
        
        triggerSkillAnimation('anim-slash-normal', 1);
        
        setTimeout(() => {
            addCombatLog(`🗡️ Atacas a ${Game.currentCombat.enemy.name}.`, 'player-action');
            dealDamage(damage, Game.currentCombat.enemy, 'player');
            if (Game.currentCombat.enemy.currentHp > 0) endTurn();
        }, 300);
    } else if (actionType === 'flee') {
        endCombat(false, true);
    }
}

function dealDamage(amount, target, source, hits = 1) {
    const isPlayerTarget = (source === 'enemy');
    
    if (isPlayerTarget) {
        Game.player.hp = Math.max(0, Game.player.hp - amount);
        Game.player.attackComboCount = 0;
        document.getElementById('combat-player-display').classList.add('damage-flash');
        setTimeout(()=>document.getElementById('combat-player-display').classList.remove('damage-flash'), 200);
    } else {
        target.currentHp = Math.max(0, target.currentHp - amount);
        Game.player.attackComboCount += hits;
        document.getElementById('combat-enemy-display').classList.add('damage-flash');
        setTimeout(()=>document.getElementById('combat-enemy-display').classList.remove('damage-flash'), 200);
    }
    
    updateComboDisplay();
    updateCombatUI();

    const displayEl = isPlayerTarget ? document.getElementById('combat-player-display') : document.getElementById('combat-enemy-display');
    showFloatingText(`-${amount}`, displayEl, { 
        type: 'damage', 
        shaky: amount > 50,
        large: amount > 100
    });

    if (isPlayerTarget && Game.player.hp <= 0) endCombat(false);
    else if (!isPlayerTarget && target.currentHp <= 0) endCombat(true);
}

function updateComboDisplay() {
    const el = document.getElementById('combat-combo-display');
    const count = Game.player.attackComboCount;
    if (count > 1) {
        el.textContent = `${count} HITS!`;
        el.classList.remove('hidden');
        el.style.animation = 'none';
        el.offsetHeight; 
        el.style.animation = 'comboPulse 0.3s ease-out';
    } else {
        el.classList.add('hidden');
    }
}

function processStatusEffects(entity, isPlayer) {
    if (isPlayer && Game.player.unlockedSkills['battle_healing']) {
        const lvl = Game.player.unlockedSkills['battle_healing'];
        const data = skillDatabase['battle_healing'];
        const heal = data.baseEffect + (data.growthEffect * (lvl - 1));
        if (Game.player.hp < Game.player.maxHp) {
             Game.player.hp = Math.min(Game.player.maxHp, Game.player.hp + heal);
             showFloatingText(`+${Math.floor(heal)}`, document.getElementById('combat-player-display'), { type: 'heal' });
        }
    }
}

function endTurn() {
    Game.currentCombat.playerTurn = false;
    processStatusEffects(Game.player, true);
    updateCombatUI();

    if (Game.player.hp <= 0) { endCombat(false); return; }
    
    setTimeout(() => { if(Game.currentCombat.active) enemyTurn(); }, 1200);
}

function enemyTurn() {
    if(!Game.currentCombat.active) return;
    const enemy = Game.currentCombat.enemy;
    const damage = Math.floor(Math.max(1, enemy.attack - Game.player.effectiveDefense));
    
    addCombatLog(`${enemy.name} ataca!`, 'enemy-action');
    dealDamage(damage, Game.player, 'enemy');
    
    if(Game.player.hp > 0) {
        Game.currentCombat.playerTurn = true;
        updateCombatUI();
    }
}

function updateCombatUI() {
    const p = Game.player;
    const e = Game.currentCombat.enemy;
    if(!e) return;
    
    document.getElementById('combat-player-hp-current').textContent = Math.floor(p.hp);
    document.getElementById('combat-player-hp-max').textContent = p.maxHp;
    const pHpBar = document.getElementById('combat-player-hp-bar');
    pHpBar.style.width = `${Math.max(0, (p.hp/p.maxHp)*100)}%`;
    
    document.getElementById('combat-enemy-hp-current').textContent = Math.floor(e.currentHp);
    document.getElementById('combat-enemy-hp-max').textContent = e.hp;
    const eHpBar = document.getElementById('combat-enemy-hp-bar-fill');
    eHpBar.style.width = `${Math.max(0, (e.currentHp/e.hp)*100)}%`;

    if(Game.currentCombat.playerTurn) {
        document.getElementById('combat-player-display').classList.add('active-turn');
        document.getElementById('combat-enemy-display').classList.remove('active-turn');
        document.querySelector('.combat-actions').classList.remove('disabled-actions');
    } else {
        document.getElementById('combat-player-display').classList.remove('active-turn');
        document.getElementById('combat-enemy-display').classList.add('active-turn');
        document.querySelector('.combat-actions').classList.add('disabled-actions');
    }
}

function addCombatLog(msg, type) {
    const log = document.getElementById('combat-log-display');
    const p = document.createElement('p');
    p.textContent = msg;
    p.className = type;
    log.appendChild(p);
    log.scrollTop = log.scrollHeight;
}

function endCombat(win, fled){
     Game.currentCombat.active = false;
     const modalContent = document.querySelector('#combatModal .modal-content');
     
     if (fled) {
         showNotification("Huiste.", "default");
         closeModal('combatModal');
         return;
     }

     if (win) {
         const enemy = Game.currentCombat.enemy;
         modalContent.classList.add('combat-victory');
         
         // Process Drops
         const earnedDrops = [];
         if (enemy.drops) {
             Object.entries(enemy.drops).forEach(([itemId, chance]) => {
                 if (Math.random() < chance) {
                     addItemToInventory({ id: itemId }, 1);
                     earnedDrops.push(itemId);
                 }
             });
         }
         
         Game.currentCombat.drops = earnedDrops;
         gainExp(enemy.exp);
         Game.player.col += enemy.col;

         setTimeout(() => {
             modalContent.classList.remove('combat-victory');
             renderEndScreen(true, enemy);
         }, 1200);
     } else {
         modalContent.classList.add('combat-defeat');
         Game.player.hp = Math.floor(Game.player.maxHp * 0.1);
         setTimeout(() => {
             modalContent.classList.remove('combat-defeat');
             renderEndScreen(false, Game.currentCombat.enemy);
         }, 1200);
     }
}

function renderEndScreen(win, enemy) {
    const activeView = document.getElementById('combat-active-view');
    const resultView = document.getElementById('combat-results-view');
    activeView.style.display = 'none';
    resultView.style.display = 'block';
    
    // Clear previous results
    resultView.innerHTML = '';

    const drops = Game.currentCombat.drops || [];
    let dropHtml = '';
    if (drops.length > 0) {
        dropHtml = drops.map(id => {
            // Simple mapping or importing items would be circular, simple text for now or passed from main
            return `<div class="loot-item">📦 ${id}</div>`;
        }).join('');
    } else {
        dropHtml = '<div class="loot-empty">Sin objetos obtenidos</div>';
    }

    resultView.innerHTML = `
        <div class="result-card ${win ? 'victory' : 'defeat'}">
            <h2 class="result-title">${win ? '¡VICTORIA!' : 'DERROTA...'}</h2>
            
            <div class="result-stats-container">
                <div class="result-row">
                    <span class="label">Enemigo</span>
                    <span class="value">${enemy.name}</span>
                </div>
                ${win ? `
                <div class="result-row">
                    <span class="label">Experiencia</span>
                    <span class="value exp">+${enemy.exp} EXP</span>
                </div>
                <div class="result-row">
                    <span class="label">Col (Dinero)</span>
                    <span class="value col">+${enemy.col} Col</span>
                </div>
                <div class="result-drops">
                    <h3>Botín</h3>
                    <div class="drops-grid">${dropHtml}</div>
                </div>
                ` : `
                <div class="result-row">
                    <span class="value" style="color:#bbb">Has sido revivido en el pueblo más cercano.</span>
                </div>
                `}
            </div>

            <button class="action-btn large-btn" onclick="document.getElementById('combatModal').style.display='none'">Continuar Aventura</button>
        </div>
    `;
}
