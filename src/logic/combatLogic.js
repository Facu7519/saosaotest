
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
    
    const activeView = document.getElementById('combat-active-view');
    const resultView = document.getElementById('combat-results-view');
    
    activeView.style.display = 'block';
    activeView.classList.remove('fade-out-active');
    resultView.style.display = 'none';
    resultView.classList.remove('fade-in-result');
    document.querySelector('#combatModal .modal-content').classList.remove('combat-victory', 'combat-defeat', 'shake-modal');

    const enemy = JSON.parse(JSON.stringify(mobTemplate));
    enemy.currentHp = enemy.hp;
    enemy.activeStatusEffects = [];
    
    if (isBoss) {
        enemy.phase = 1;
        enemy.turnCounter = 0;
        enemy.isEnraged = false;
    }

    Game.currentCombat = {
        active: true,
        enemy: enemy,
        isBoss: isBoss,
        playerTurn: true,
        turnCount: 1,
        drops: [] 
    };
    
    Game.player.attackComboCount = 0;
    
    document.getElementById('combat-log-display').innerHTML = '';
    document.getElementById('combat-skills-list-container').style.display = 'none';
    document.getElementById('combat-potions-list-container').style.display = 'none';
    
    updateCombatUI();
    openModal('combatModal');
    
    if(isBoss) {
        addCombatLog(`👹 PRECAUCIÓN: ¡Jefe de Piso ${enemy.name}!`, 'system-message');
        triggerSkillAnimation('anim-starburst', 1, true); 
    } else {
        addCombatLog(`⚔️ ¡Combate iniciado contra ${enemy.name}!`, 'system-message');
    }
}

export function showCombatOptions(type) {
    if (!Game.currentCombat.active || !Game.currentCombat.playerTurn) return;

    const skillContainer = document.getElementById('combat-skills-list-container');
    const potionContainer = document.getElementById('combat-potions-list-container');
    
    const isSkillsVisible = skillContainer.style.display === 'flex';
    const isPotionsVisible = potionContainer.style.display === 'flex';

    skillContainer.style.display = 'none';
    potionContainer.style.display = 'none';

    if (type === 'skills') {
        if (isSkillsVisible) return; 
        skillContainer.innerHTML = '';
        const equippedIds = Game.player.equippedSkills || [];
        const skills = Object.entries(Game.player.unlockedSkills)
            .filter(([id, level]) => equippedIds.includes(id))
            .map(([id, level]) => ({ id, level, ...skillDatabase[id] }))
            .filter(s => s.type === 'active');
        
        if (skills.length === 0) {
            skillContainer.innerHTML = '<p style="width:100%; text-align:center;">No tienes habilidades equipadas.</p>';
        } else {
            skills.forEach(skill => {
                let currentMpCost = skill.mpCost + (skill.mpGrowth * (skill.level - 1));
                if (Game.player.mpCostReduction) {
                    currentMpCost = Math.floor(currentMpCost * (1 - Game.player.mpCostReduction));
                }
                currentMpCost = Math.max(1, currentMpCost);

                const btn = document.createElement('button');
                btn.className = 'combat-sub-btn'; 
                btn.innerHTML = `<span class="icon">${skill.icon}</span> ${skill.name} <span class="cost">${currentMpCost} MP</span>`;
                const canUse = Game.player.mp >= currentMpCost;
                btn.disabled = !canUse;
                btn.onclick = () => performSkill(skill, currentMpCost);
                skillContainer.appendChild(btn);
            });
        }
        skillContainer.style.display = 'flex';
    } else if (type === 'potions') {
        if (isPotionsVisible) return;
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

function calculateHit(sourceAtk, targetDef, critChance, dodgeChance, critDamageMultiplier = 1.5) {
    if (Math.random() < dodgeChance) {
        return { damage: 0, isCrit: false, isMiss: true };
    }
    const raw = Math.max(1, sourceAtk - targetDef);
    let damage = Math.floor(raw * (0.9 + Math.random() * 0.2)); 
    let isCrit = false;
    if (Math.random() < critChance) {
        isCrit = true;
        damage = Math.floor(damage * critDamageMultiplier);
    }
    return { damage, isCrit, isMiss: false };
}

function performSkill(skill, cost) {
    if (Game.player.mp < cost) return;
    Game.player.mp -= cost;
    
    const levelFactor = (skill.growthPct * (skill.level - 1));
    const totalMultiplier = skill.baseDamagePct + levelFactor;
    
    let passiveAtkBonus = 1;
    if (Game.player.unlockedSkills['fighting_spirit']) {
        const lvl = Game.player.unlockedSkills['fighting_spirit'];
        const data = skillDatabase['fighting_spirit'];
        passiveAtkBonus += (data.baseEffect + (data.growthEffect * (lvl - 1)));
    }

    const skillAtkPower = Game.player.effectiveAttack * passiveAtkBonus * totalMultiplier;
    const hitResult = calculateHit(
        skillAtkPower, 
        Game.currentCombat.enemy.defense, 
        Game.player.effectiveCrit + 0.1, 
        0.02,
        Game.player.effectiveCritDamage
    );
    
    document.getElementById('combat-skills-list-container').style.display = 'none';

    // Trigger dynamic multi-hit animation
    triggerSkillAnimation(skill.animClass, skill.hits);

    setTimeout(() => {
        let msg = `✨ ${skill.name}`;
        if (hitResult.isCrit) msg += " (CRIT!)";
        addCombatLog(msg, 'player-action');
        dealDamageResult(hitResult, Game.currentCombat.enemy, 'player', skill.hits);
        if (Game.currentCombat.enemy.currentHp > 0) endTurn();
    }, 150 * Math.min(skill.hits, 8)); // Delay result slightly based on animation length
}

function performPotion(item) {
    const idx = Game.player.inventory.findIndex(i => i.id === item.id);
    if (idx !== -1) {
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
        const hitResult = calculateHit(
            Game.player.effectiveAttack, 
            Game.currentCombat.enemy.defense || 0,
            Game.player.effectiveCrit,
            0.05,
            Game.player.effectiveCritDamage
        );
        triggerSkillAnimation('anim-slash-normal', 1);
        setTimeout(() => {
            addCombatLog(`🗡️ Atacas a ${Game.currentCombat.enemy.name}.`, 'player-action');
            dealDamageResult(hitResult, Game.currentCombat.enemy, 'player');
            if (Game.currentCombat.enemy.currentHp > 0) endTurn();
        }, 300);
    } else if (actionType === 'flee') {
        endCombat(false, true);
    }
}

function dealDamageResult(hitResult, target, source, hits = 1) {
    const isPlayerTarget = (source === 'enemy');
    const displayEl = isPlayerTarget ? document.getElementById('combat-player-display') : document.getElementById('combat-enemy-display');

    if (hitResult.isMiss) {
        showFloatingText("MISS", displayEl, { type: 'miss' });
        addCombatLog(isPlayerTarget ? "¡Esquivaste el ataque!" : "¡El enemigo esquivó!", "system-message");
        return;
    }

    const amount = hitResult.damage;
    if (isPlayerTarget) {
        Game.player.hp = Math.max(0, Game.player.hp - amount);
        Game.player.attackComboCount = 0;
        displayEl.classList.add('damage-flash');
        setTimeout(()=>displayEl.classList.remove('damage-flash'), 200);
    } else {
        target.currentHp = Math.max(0, target.currentHp - amount);
        Game.player.attackComboCount += hits;
        displayEl.classList.add('damage-flash');
        setTimeout(()=>displayEl.classList.remove('damage-flash'), 200);
    }
    
    updateComboDisplay();
    updateCombatUI();

    if (hitResult.isCrit) {
        showFloatingText(`CRIT! -${amount}`, displayEl, { type: 'crit', large: true, shaky: true });
        if (!isPlayerTarget) document.body.classList.add('screen-shake');
        setTimeout(()=> document.body.classList.remove('screen-shake'), 450);
    } else {
        showFloatingText(`-${amount}`, displayEl, { type: 'damage', shaky: amount > 50 });
    }

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
    if (isPlayer) {
        if (Game.player.unlockedSkills['battle_healing']) {
            const lvl = Game.player.unlockedSkills['battle_healing'];
            const data = skillDatabase['battle_healing'];
            const heal = data.baseEffect + (data.growthEffect * (lvl - 1));
            if (Game.player.hp < Game.player.maxHp) {
                 Game.player.hp = Math.min(Game.player.maxHp, Game.player.hp + heal);
                 showFloatingText(`+${Math.floor(heal)}`, document.getElementById('combat-player-display'), { type: 'heal' });
            }
        }
        if (Game.player.mpRegen && Game.player.mpRegen > 0) {
            if (Game.player.mp < Game.player.maxMp) {
                Game.player.mp = Math.min(Game.player.maxMp, Game.player.mp + Game.player.mpRegen);
            }
        }
    }
}

function endTurn() {
    Game.currentCombat.playerTurn = false;
    processStatusEffects(Game.player, true);
    updateCombatUI();
    if (Game.player.hp <= 0) { endCombat(false); return; }
    setTimeout(() => { if(Game.currentCombat.active) enemyTurn(); }, 1500);
}

function enemyTurn() {
    if(!Game.currentCombat.active) return;
    const enemy = Game.currentCombat.enemy;
    const isBoss = Game.currentCombat.isBoss;
    Game.currentCombat.turnCount++;

    if (isBoss) {
        executeBossAI(enemy);
    } else {
        const enemyCrit = 0.05;
        const hitResult = calculateHit(enemy.attack, Game.player.effectiveDefense, enemyCrit, Game.player.effectiveEvasion);
        addCombatLog(`${enemy.name} ataca!`, 'enemy-action');
        dealDamageResult(hitResult, Game.player, 'enemy');
    }
    if(Game.player.hp > 0) {
        Game.currentCombat.playerTurn = true;
        updateCombatUI();
    }
}

function executeBossAI(boss) {
    boss.turnCounter = (boss.turnCounter || 0) + 1;
    const hpPercent = boss.currentHp / boss.hp;
    const displayEl = document.getElementById('combat-enemy-display');

    if (hpPercent < 0.5 && !boss.isEnraged) {
        boss.isEnraged = true;
        boss.phase = 2;
        addCombatLog(`⚠️ ¡${boss.name} ENTRA EN FASE 2: ENFURECIDO!`, 'system-message');
        addCombatLog(`${boss.name} ruge y su ataque aumenta.`, 'enemy-action');
        showFloatingText("¡ENRAGE!", displayEl, { color: '#ff0000', large: true, shaky: true });
        displayEl.classList.add('damage-flash');
        boss.attack = Math.floor(boss.attack * 1.3);
        const healAmt = Math.floor(boss.hp * 0.1);
        boss.currentHp = Math.min(boss.hp, boss.currentHp + healAmt);
        showFloatingText(`+${healAmt}`, displayEl, { type: 'heal' });
        boss.turnCounter = 0; 
    }

    const hasSkills = boss.skills && boss.skills.length > 0;
    const specialSkill = hasSkills ? boss.skills[0] : null;
    const ultimateSkill = (hasSkills && boss.skills.length > 1) ? boss.skills[1] : null;
    let action = 'attack';
    let selectedSkill = null;

    if (boss.isEnraged && ultimateSkill && (boss.turnCounter % 5 === 0)) {
        action = 'ultimate';
        selectedSkill = ultimateSkill;
    } else if (specialSkill && (boss.turnCounter % 3 === 0)) {
        action = 'special';
        selectedSkill = specialSkill;
    }

    if (action === 'ultimate') {
        addCombatLog(`⛔ ¡${boss.name} prepara su ataque definitivo!`, 'system-message');
        setTimeout(() => {
            triggerSkillAnimation('anim-starburst', 1);
            performEnemySkill(boss, selectedSkill, 2.0);
        }, 400);
    } else if (action === 'special') {
        performEnemySkill(boss, selectedSkill, 1.0);
    } else {
        const enemyCrit = 0.10 + (boss.isEnraged ? 0.1 : 0);
        const hitResult = calculateHit(boss.attack, Game.player.effectiveDefense, enemyCrit, Game.player.effectiveEvasion);
        addCombatLog(`${boss.name} ataca ferozmente.`, 'enemy-action');
        dealDamageResult(hitResult, Game.player, 'enemy');
    }
}

function performEnemySkill(boss, skill, extraMultiplier = 1.0) {
    addCombatLog(`${boss.name} usa 【${skill.name}】!`, 'enemy-action');
    if (skill.statusEffect) {
        const resistChance = Game.player.statusResist || 0;
        const difficulty = boss.isEnraged ? 0.2 : 0;
        if (Math.random() > (resistChance - difficulty)) {
            addCombatLog(`💥 ¡Sufres ${skill.statusEffect.type}!`, 'enemy-action');
        } else {
            addCombatLog(`🛡️ ¡Resististe ${skill.statusEffect.type}!`, 'system-message');
            showFloatingText("RESIST", document.getElementById('combat-player-display'), { color: '#fff' });
        }
    }
    const multiplier = (skill.damageMultiplier || 1.5) * extraMultiplier;
    const dmg = Math.floor(boss.attack * multiplier);
    triggerSkillAnimation('anim-slash-sonic', 1);
    const hitResult = { damage: dmg, isCrit: false, isMiss: false };
    setTimeout(() => { dealDamageResult(hitResult, Game.player, 'enemy'); }, 300);
}

function updateCombatUI() {
    const p = Game.player;
    const e = Game.currentCombat.enemy;
    if(!e) return;
    document.getElementById('combat-player-hp-current').textContent = Math.floor(p.hp);
    document.getElementById('combat-player-hp-max').textContent = p.maxHp;
    document.getElementById('combat-player-hp-bar').style.width = `${Math.max(0, (p.hp/p.maxHp)*100)}%`;
    document.getElementById('combat-enemy-hp-current').textContent = Math.floor(e.currentHp);
    document.getElementById('combat-enemy-hp-max').textContent = e.hp;
    document.getElementById('combat-enemy-hp-bar-fill').style.width = `${Math.max(0, (e.currentHp/e.hp)*100)}%`;

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

/**
 * Enhanced Visual Animation System
 * Spawns multiple elements for multi-hit skills with staggered delays.
 */
function triggerSkillAnimation(animClass, hits = 1, isIntro = false) {
    const layer = document.getElementById('combat-animation-layer');
    const enemyEl = document.getElementById('combat-enemy-display');
    const modalContent = document.querySelector('#combatModal .modal-content');
    if (!layer || !enemyEl) return;
    
    const rect = enemyEl.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Use a loop to spawn multiple animation elements based on hit count
    const actualHits = isIntro ? 1 : Math.min(hits, 16); 
    const staggerDelay = hits > 4 ? 60 : 100;

    for (let i = 0; i < actualHits; i++) {
        setTimeout(() => {
            const animEl = document.createElement('div');
            animEl.className = `skill-anim ${animClass}`;
            
            // Random offset for multi-hits to make it look "wild"
            const offsetX = (Math.random() - 0.5) * (rect.width * 0.6);
            const offsetY = (Math.random() - 0.5) * (rect.height * 0.6);
            const rotation = Math.random() * 360;

            animEl.style.left = `${centerX + offsetX}px`;
            animEl.style.top = `${centerY + offsetY}px`;
            animEl.style.transform = `translate(-50%, -50%) rotate(${rotation}deg)`;
            
            layer.appendChild(animEl);
            
            // Shake effect on each hit
            enemyEl.classList.remove('shake-violent');
            void enemyEl.offsetWidth; // trigger reflow
            enemyEl.classList.add('shake-violent');

            if (hits > 5 || isIntro) {
                modalContent.classList.remove('shake-modal');
                void modalContent.offsetWidth;
                modalContent.classList.add('shake-modal');
            }

            // Cleanup
            setTimeout(() => {
                if(animEl.parentNode) layer.removeChild(animEl);
            }, 1000);

        }, i * staggerDelay);
    }
}

function endCombat(win, fled){
     Game.currentCombat.active = false;
     const modalContent = document.querySelector('#combatModal .modal-content');
     const activeView = document.getElementById('combat-active-view');
     if (fled) {
         showNotification("Huiste.", "default");
         closeModal('combatModal');
         return;
     }
     modalContent.classList.add(win ? 'combat-victory' : 'combat-defeat');
     activeView.classList.add('fade-out-active');
     if (win) {
         const enemy = Game.currentCombat.enemy;
         if (Game.player.hpOnKill) Game.player.hp = Math.min(Game.player.maxHp, Game.player.hp + Game.player.hpOnKill);
         if (Game.player.mpOnKill) Game.player.mp = Math.min(Game.player.maxMp, Game.player.mp + Game.player.mpOnKill);
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
         if (Game.currentCombat.isBoss) {
             const nextFloor = Game.player.currentFloor + 1;
             if (floorData[nextFloor]) {
                 if (!Game.player.unlockedFloors.includes(nextFloor)) {
                     Game.player.unlockedFloors.push(nextFloor);
                     floorData[nextFloor].unlocked = true;
                     showNotification(`¡Piso ${nextFloor} Desbloqueado!`, 'success', 8000);
                 }
             }
         }
         setTimeout(() => {
             modalContent.classList.remove('combat-victory', 'combat-defeat');
             renderEndScreen(true, enemy);
         }, 600);
     } else {
         Game.player.hp = Math.floor(Game.player.maxHp * 0.1);
         setTimeout(() => {
             modalContent.classList.remove('combat-victory', 'combat-defeat');
             renderEndScreen(false, Game.currentCombat.enemy);
         }, 600);
     }
}

function renderEndScreen(win, enemy) {
    const activeView = document.getElementById('combat-active-view');
    const resultView = document.getElementById('combat-results-view');
    activeView.style.display = 'none';
    resultView.innerHTML = '';
    resultView.style.display = 'block';
    resultView.classList.add('fade-in-result'); 
    const drops = Game.currentCombat.drops || [];
    let dropHtml = drops.length > 0 ? drops.map(id => {
        const base = baseItems[id];
        if (!base) return `<div class="loot-item">📦 ${id}</div>`;
        const rarity = base.rarity || 'Common';
        return `<div class="loot-card rarity-${rarity.toLowerCase()}"><div class="loot-icon">${base.icon}</div><div class="loot-name">${base.name}</div></div>`;
    }).join('') : '<div class="loot-empty">Sin objetos obtenidos</div>';

    resultView.innerHTML = `
        <div class="result-card ${win ? 'victory' : 'defeat'}">
            <h2 class="result-title">${win ? '¡VICTORIA!' : 'DERROTA...'}</h2>
            <div class="result-stats-container">
                <div class="result-row"><span class="label">Enemigo</span><span class="value">${enemy.name}</span></div>
                ${win ? `
                <div class="result-row"><span class="label">Experiencia</span><span class="value exp">+${enemy.exp} EXP</span></div>
                <div class="result-row"><span class="label">Col (Dinero)</span><span class="value col">+${enemy.col} Col</span></div>
                <div class="result-drops"><h3>Botín</h3><div class="drops-grid">${dropHtml}</div></div>
                ` : `<div class="result-row"><span class="value" style="color:#bbb">Has sido revivido en el pueblo más cercano.</span></div>`}
            </div>
            <button class="action-btn large-btn" onclick="document.getElementById('combatModal').style.display='none'">Continuar Aventura</button>
        </div>
    `;
}
