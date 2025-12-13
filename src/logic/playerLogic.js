
import { Game } from '../state/gameState.js';
import { baseItems } from '../data/items.js';
import { genUid, showNotification } from '../utils/helpers.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { skillData, passiveSkillData } from '../data/skills.js';

export function calculateEffectiveStats() {
    const p = Game.player;
    let eqAtk = 0, eqDef = 0, eqHp = 0, eqMp = 0;

    for (const slot in p.equipment) {
        const it = p.equipment[slot];
        if (it && it.stats) {
            eqAtk += it.stats.attack || 0;
            eqDef += it.stats.defense || 0;
            eqHp += it.stats.hp || 0;
            eqMp += it.stats.mp || 0;
        }
    }
    p.effectiveAttack = p.baseAttack + eqAtk;
    p.effectiveDefense = p.baseDefense + eqDef;
    
    const oldMaxHp = p.maxHp;
    const oldMaxMp = p.maxMp;
    p.maxHp = p.baseMaxHp + eqHp;
    p.maxMp = p.baseMaxMp + eqMp;

    if (p.hp > p.maxHp) p.hp = p.maxHp;
    else if (p.maxHp > oldMaxHp && p.hp > 0) p.hp = Math.min(p.hp + (p.maxHp - oldMaxHp), p.maxHp);
    
    if (p.mp > p.maxMp) p.mp = p.maxMp;
    else if (p.maxMp > oldMaxMp) p.mp = Math.min(p.mp + (p.maxMp - oldMaxMp), p.maxMp);
}

export function trainPlayer() {
    const cost = 50 * Game.player.level;
    if (Game.player.col >= cost) {
        Game.player.col -= cost;
        Game.player.baseAttack += 1;
        const defGain = Math.random() < 0.4 ? 2 : (Math.random() < 0.7 ? 1 : 0);
        Game.player.baseDefense += defGain;
        Game.player.baseMaxHp += 5;
        Game.player.baseMaxMp += 2;
        
        Game.player.hp = Math.min(Game.player.hp + 5, Game.player.maxHp);
        Game.player.mp = Math.min(Game.player.mp + 2, Game.player.maxMp);
        
        calculateEffectiveStats();
        updatePlayerHUD();
        showNotification(`¡Entrenamiento completo! (+ATK, +HP, +MP, +${defGain} DEF)`, "success");
        return true;
    } else {
        showNotification(`Necesitas ${cost} Col para entrenar.`, "error");
        return false;
    }
}

export function gainExp(amount) {
    if (Game.player.hp <= 0) return;
    Game.player.currentExp += amount;
    showNotification(`+${amount} EXP`, "success");
    while (Game.player.currentExp >= Game.player.neededExp) {
        levelUp();
    }
    updatePlayerHUD();
}

export function levelUp() {
    const p = Game.player;
    p.level++;
    p.currentExp = Math.max(0, p.currentExp - p.neededExp);
    p.neededExp = Math.floor(p.neededExp * 1.35 + 80);
    p.baseMaxHp += Math.floor(20 + p.level * 1.5);
    p.baseMaxMp += Math.floor(8 + p.level * 0.8);
    p.col += 100 * p.level;
    p.baseAttack += Math.floor(2 + p.level * 0.2);
    p.baseDefense += Math.floor(1 + p.level * 0.15);
    
    // Heal on level up
    calculateEffectiveStats();
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    
    showNotification(`¡LEVEL UP! Nivel ${p.level} alcanzado.`, "success", 6000);
    
    // Unlock Active Skills
    Object.entries(skillData).forEach(([id, data]) => {
        if (data.levelReq === p.level && !p.skills.find(s => s.id === id)) {
            p.skills.push({ id, ...data });
            showNotification(`Nueva habilidad: ${data.name}`, "success");
        }
    });

    // Unlock Passive Skills
    Object.entries(passiveSkillData).forEach(([id, data]) => {
        if (data.levelReq === p.level && !p.passiveSkills.find(s => s.id === id)) {
            p.passiveSkills.push({ id, ...data });
            showNotification(`Nueva pasiva: ${data.name}`, "success");
        }
    });
    
    updatePlayerHUD();
}

export function addItemToInventory(itemData, quantity = 1) {
    const base = baseItems[itemData.id];
    if(!base) {
        console.warn(`Item ID not found: ${itemData.id}`);
        return;
    }
    
    const stackable = base.type === 'consumable' || base.type === 'material';
    
    if (stackable) {
        const existing = Game.player.inventory.find(i => i.id === itemData.id);
        if (existing) existing.count = (existing.count || 0) + quantity;
        else Game.player.inventory.push({ ...base, ...itemData, count: quantity });
    } else {
        for(let i=0; i<quantity; i++) {
            const inst = { ...base, ...itemData, uid: genUid(), count: 1 };
            inst.stats = inst.stats ? JSON.parse(JSON.stringify(inst.stats)) : (base.stats ? JSON.parse(JSON.stringify(base.stats)) : {});
            Game.player.inventory.push(inst);
        }
    }
}

export function equipItemByUid(uid) {
    const idx = Game.player.inventory.findIndex(i => i.uid === uid);
    if (idx === -1) return;
    const item = Game.player.inventory[idx];
    const base = baseItems[item.id] || item;
    
    if (Game.player.level < (base.levelReq || 1)) {
        showNotification("Nivel insuficiente.", "error");
        return;
    }

    const slot = base.slot;
    if (Game.player.equipment[slot]) {
        unequipItem(slot); 
    }

    Game.player.equipment[slot] = Game.player.inventory.splice(idx, 1)[0];
    showNotification(`${base.name} equipado.`, "success");
    calculateEffectiveStats();
    updatePlayerHUD();
}

export function unequipItem(slot) {
    const item = Game.player.equipment[slot];
    if (!item) return;
    Game.player.equipment[slot] = null;
    Game.player.inventory.push(item);
    showNotification("Item desequipado.", "default");
    calculateEffectiveStats();
    updatePlayerHUD();
}

export function useConsumable(item, index) {
    const base = baseItems[item.id] || item;
    if (base.effect.hp) Game.player.hp = Math.min(Game.player.hp + base.effect.hp, Game.player.maxHp);
    if (base.effect.mp) Game.player.mp = Math.min(Game.player.mp + base.effect.mp, Game.player.maxMp);
    
    item.count--;
    if (item.count <= 0) Game.player.inventory.splice(index, 1);
    
    showNotification(`Usado ${base.name}`, "success");
    updatePlayerHUD();
}
