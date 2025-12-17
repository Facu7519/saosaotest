import { Game } from '../state/gameState.js';
import { baseItems } from '../data/items.js';
import { talentDatabase } from '../data/skills.js';
import { genUid, showNotification } from '../utils/helpers.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { renderEquipment } from '../ui/inventory.js';
import { openModal } from '../ui/modals.js';

export function calculateEffectiveStats() {
    const p = Game.player;
    let eqAtk = 0, eqDef = 0, eqHp = 0, eqMp = 0;
    let eqCrit = 0, eqEva = 0;

    for (const slot in p.equipment) {
        const it = p.equipment[slot];
        if (it && it.stats) {
            eqAtk += it.stats.attack || 0;
            eqDef += it.stats.defense || 0;
            eqHp += it.stats.hp || 0;
            eqMp += it.stats.mp || 0;
            eqCrit += it.stats.crit || 0; 
            eqEva += it.stats.evasion || 0;
        }
    }

    let talentAtkPct = 0, talentDefPct = 0, talentHpPct = 0, talentMpCostRed = 0;
    let talentCritDmg = 0, talentCritChance = 0, talentEva = 0, talentExpBonus = 0;
    let talentMpRegen = 0, talentMpOnKill = 0, talentHpOnKill = 0, talentStatusResist = 0;
    let talentPotionEff = 0;

    if (p.equippedTalents) {
        p.equippedTalents.forEach(tId => {
            const tData = talentDatabase[tId];
            if (tData && tData.stats) {
                if (tData.stats.attackPct) talentAtkPct += tData.stats.attackPct;
                if (tData.stats.defensePct) talentDefPct += tData.stats.defensePct;
                if (tData.stats.hpPct) talentHpPct += tData.stats.hpPct;
                if (tData.stats.mpCostReduction) talentMpCostRed += tData.stats.mpCostReduction;
                if (tData.stats.critDamage) talentCritDmg += tData.stats.critDamage;
                if (tData.stats.critChance) talentCritChance += tData.stats.critChance;
                if (tData.stats.evasion) talentEva += tData.stats.evasion;
                if (tData.stats.expBonus) talentExpBonus += tData.stats.expBonus;
                if (tData.stats.mpRegen) talentMpRegen += tData.stats.mpRegen;
                if (tData.stats.mpOnKill) talentMpOnKill += tData.stats.mpOnKill;
                if (tData.stats.hpOnKill) talentHpOnKill += tData.stats.hpOnKill;
                if (tData.stats.statusResist) talentStatusResist += tData.stats.statusResist;
                if (tData.stats.potionEfficiency) talentPotionEff += tData.stats.potionEfficiency;
            }
        });
    }

    const rawMaxHp = p.baseMaxHp + eqHp;
    const rawMaxMp = p.baseMaxMp + eqMp;
    const rawAtk = p.baseAttack + eqAtk;
    const rawDef = p.baseDefense + eqDef;

    p.maxHp = Math.floor(rawMaxHp * (1 + talentHpPct));
    p.maxMp = Math.floor(rawMaxMp); 
    p.effectiveAttack = Math.floor(rawAtk * (1 + talentAtkPct));
    p.effectiveDefense = Math.floor(rawDef * (1 + talentDefPct));
    p.effectiveCrit = Math.min(0.75, p.baseCritChance + eqCrit + talentCritChance + (p.level * 0.002)); 
    p.effectiveEvasion = Math.min(0.60, p.baseEvasion + eqEva + talentEva + (p.level * 0.001)); 
    p.effectiveCritDamage = p.baseCritDamage + talentCritDmg;
    p.mpCostReduction = talentMpCostRed;
    p.expBonus = talentExpBonus;
    p.mpRegen = talentMpRegen;
    p.mpOnKill = talentMpOnKill;
    p.hpOnKill = talentHpOnKill;
    p.statusResist = talentStatusResist; 
    p.potionEfficiency = 1 + talentPotionEff; 

    if (p.hp > p.maxHp) p.hp = p.maxHp;
    if (p.mp > p.maxMp) p.mp = p.maxMp;
}

export function gainExp(amount) {
    if (Game.player.hp <= 0) return;
    const bonus = Game.player.expBonus || 0;
    const totalExp = Math.floor(amount * (1 + bonus));
    Game.player.currentExp += totalExp;
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
    p.skillPoints = (p.skillPoints || 0) + 3;

    calculateEffectiveStats();
    p.hp = p.maxHp;
    p.mp = p.maxMp;
    showNotification(`¡LEVEL UP! Nivel ${p.level}. +3 SP.`, "success", 6000);
    updatePlayerHUD();
}

export function addItemToInventory(itemData, quantity = 1) {
    const base = baseItems[itemData.id];
    if(!base) return;
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
        showNotification(`⛔ Req: LV ${base.levelReq || 1} | Tu: ${Game.player.level}`, "error");
        return;
    }
    let slot = base.slot;
    if (slot === 'weapon' && Game.player.unlockedSkills['dual_wield']) {
        if (Game.player.equipment.weapon) {
            if (Game.player.equipment.shield) unequipItem('shield');
            if (!Game.player.equipment.weapon2) slot = 'weapon2';
            else unequipItem('weapon');
        }
    }
    if (slot === 'shield' && Game.player.equipment.weapon2) unequipItem('weapon2');
    if (Game.player.equipment[slot]) unequipItem(slot);
    Game.player.equipment[slot] = Game.player.inventory.splice(idx, 1)[0];
    showNotification(`⚔️ Equipado: ${base.name}`, "success");
    calculateEffectiveStats();
    updatePlayerHUD();
    renderEquipment(slot);
}

export function unequipItem(slot) {
    const item = Game.player.equipment[slot];
    if (!item) return;
    Game.player.equipment[slot] = null;
    Game.player.inventory.push(item);
    calculateEffectiveStats();
    updatePlayerHUD();
}

export function useConsumable(item, index) {
    const base = baseItems[item.id] || item;
    let used = false;
    const multiplier = Game.player.potionEfficiency || 1;
    if (base.effect.hp && Game.player.hp < Game.player.maxHp) {
        Game.player.hp = Math.min(Game.player.hp + Math.floor(base.effect.hp * multiplier), Game.player.maxHp);
        used = true;
    }
    if (base.effect.mp && Game.player.mp < Game.player.maxMp) {
        Game.player.mp = Math.min(Game.player.mp + Math.floor(base.effect.mp * multiplier), Game.player.maxMp);
        used = true;
    }
    if (used) {
        item.count--;
        if (item.count <= 0) Game.player.inventory.splice(index, 1);
        showNotification(`🧪 Usado: ${base.name}`, "success");
        updatePlayerHUD();
        return true;
    }
    return false;
}

export function rollTalent() {
    if (Game.player.skillPoints < 5) {
        showNotification("Necesitas 5 SP.", "error");
        return null;
    }
    Game.player.skillPoints -= 5;
    const rand = Math.random() * 100;
    let tier = rand > 97 ? 'Transcendent' : rand > 85 ? 'Ascendant' : rand > 55 ? 'Awakened' : 'Latent';
    const pool = Object.entries(talentDatabase).filter(([id, t]) => t.tier === tier);
    const [id, data] = pool[Math.floor(Math.random() * pool.length)];
    if (!Game.player.unlockedTalents) Game.player.unlockedTalents = [];
    if (Game.player.unlockedTalents.includes(id)) {
        Game.player.skillPoints += 2;
        return { result: 'duplicate', talent: data, refund: 2 };
    }
    Game.player.unlockedTalents.push(id);
    return { result: 'new', talent: data, id: id };
}