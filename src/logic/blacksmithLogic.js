import { Game } from '../state/gameState.js';
import { blacksmithRecipes, baseItems } from '../data/items.js';
import { floorData } from '../data/floors.js';
import { showNotification } from '../utils/helpers.js';
import { addItemToInventory, calculateEffectiveStats } from './playerLogic.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { renderInventory, renderEquipment } from '../ui/inventory.js';

let selectedUpgradeUid = null;
const MAX_ITEM_LEVEL = 10;
const UPGRADE_PERCENT_STEPS = [0, 10, 15, 18, 22, 26, 30, 35, 40, 50];

export function renderBlacksmithRecipes() {
    const grid = document.getElementById('forge-recipes-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    const floorRecipes = floorData[Game.player.currentFloor]?.blacksmithRecipes || [];
    
    // Create sections if needed, for now just flat list but stylized
    Object.entries(blacksmithRecipes).forEach(([key, recipe]) => {
        if (!floorRecipes.includes(key)) return;
        
        const base = baseItems[recipe.itemId];
        const el = document.createElement('div');
        el.className = `recipe-card`; 
        
        // Material checking for UI coloring
        let canCraft = true;
        let matHtml = '<div class="recipe-materials">';
        
        for (const [matId, qty] of Object.entries(recipe.materials)) {
            const matBase = baseItems[matId];
            const totalOwned = Game.player.inventory.reduce((acc, item) => {
                return item.id === matId ? acc + (item.count || 1) : acc;
            }, 0);
            
            const hasEnough = totalOwned >= qty;
            if(!hasEnough) canCraft = false;
            
            matHtml += `
                <div class="recipe-mat ${hasEnough ? 'ok' : 'missing'}" title="${matBase.name}">
                    <span>${matBase.icon}</span> ${totalOwned}/${qty}
                </div>
            `;
        }
        matHtml += '</div>';

        const canAfford = Game.player.col >= recipe.cost;
        
        el.innerHTML = `
            <div class="recipe-header">
                <span class="item-icon large">${base.icon}</span>
                <div class="recipe-info">
                    <span class="item-name rarity-${(base.rarity || 'common').toLowerCase()}">${base.name}</span>
                    <span class="item-type">${base.type}</span>
                </div>
            </div>
            ${matHtml}
            <div class="recipe-footer">
                <span class="cost ${canAfford ? 'ok' : 'missing'}">${recipe.cost} Col</span>
                <button class="action-btn small-btn" ${(!canCraft || !canAfford) ? 'disabled' : ''}>Forjar (${Math.floor(recipe.chance*100)}%)</button>
            </div>
        `;
        
        const btn = el.querySelector('button');
        if(btn) btn.onclick = () => forgeItem(key);
        
        grid.appendChild(el);
    });
}

function forgeItem(recipeKey) {
    const recipe = blacksmithRecipes[recipeKey];
    if (Game.player.col < recipe.cost) {
        showNotification("Col insuficiente.", "error");
        return;
    }
    
    // Double check logic before consuming
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        const totalOwned = Game.player.inventory.reduce((acc, item) => item.id === matId ? acc + (item.count || 1) : acc, 0);
        if (totalOwned < qty) {
            showNotification(`Faltan materiales.`, "error");
            return;
        }
    }
    
    // Consume Cost
    Game.player.col -= recipe.cost;
    
    // Consume Materials
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        let remaining = qty;
        for (let i = Game.player.inventory.length - 1; i >= 0; i--) {
            const item = Game.player.inventory[i];
            if (item.id === matId) {
                const available = item.count || 1;
                const take = Math.min(available, remaining);
                item.count = available - take;
                remaining -= take;
                if (item.count <= 0) Game.player.inventory.splice(i, 1);
                if (remaining <= 0) break;
            }
        }
    }
    
    if (Math.random() < recipe.chance) {
        addItemToInventory({ id: recipe.itemId }, 1);
        showNotification(`¡Éxito! Forjado ${baseItems[recipe.itemId].name}.`, "success");
    } else {
        showNotification("La forja falló... Los materiales se rompieron.", "error");
    }
    
    updatePlayerHUD();
    renderBlacksmithRecipes(); // Refresh UI
    renderInventory();
}

export function renderUpgradeEquipmentList() {
    const list = document.getElementById('upgrade-equipment-list');
    if (!list) return;
    list.innerHTML = '';
    selectedUpgradeUid = null;
    document.getElementById('confirm-upgrade-btn').disabled = true;
    document.getElementById('upgrade-preview').innerHTML = "<p style='text-align:center; margin-top:20px; color:#777;'>Selecciona un equipo de la izquierda.</p>";

    const allItems = [];
    Object.values(Game.player.equipment).forEach(item => {
        if(item) allItems.push({item, source: 'equip'});
    });
    Game.player.inventory.forEach(item => {
        const base = baseItems[item.id] || item;
        if(['weapon','shield','armor','accessory'].includes(base.type)) {
            allItems.push({item, source: 'inv'});
        }
    });

    if (allItems.length === 0) {
        list.innerHTML = "<p>No tienes equipo para mejorar.</p>";
        return;
    }

    allItems.forEach(({item, source}) => {
        const base = baseItems[item.id] || item;
        const rarity = base.rarity || 'Common';
        const level = item.level || 1;
        
        const el = document.createElement('div');
        el.className = `item-card rarity-${rarity.toLowerCase()}`;
        
        el.innerHTML = `
            <div class="item-icon">${base.icon}</div>
            <div class="item-details-mini">
                <span class="name">${base.name}</span>
                <span class="level">Lv.${level}</span>
            </div>
            ${source === 'equip' ? '<span class="equipped-badge">E</span>' : ''}
        `;
        el.onclick = () => selectUpgradeItem(item, el);
        list.appendChild(el);
    });
}

function selectUpgradeItem(item, element) {
    document.querySelectorAll('#upgrade-equipment-list .item-card').forEach(e => e.classList.remove('selected'));
    element.classList.add('selected');
    selectedUpgradeUid = item.uid;

    const level = item.level || 1;
    const cost = Math.floor(100 * level * 1.5);
    const btn = document.getElementById('confirm-upgrade-btn');
    const preview = document.getElementById('upgrade-preview');

    if (level >= MAX_ITEM_LEVEL) {
        preview.innerHTML = `<div style="text-align:center;"><h4>${baseItems[item.id].name}</h4><p class="maxed">NIVEL MÁXIMO ALCANZADO</p></div>`;
        btn.disabled = true;
        document.getElementById('upgrade-cost').textContent = "-";
        return;
    }

    const baseStats = baseItems[item.id].stats || {};
    const currentPercent = UPGRADE_PERCENT_STEPS[Math.min(level-1, UPGRADE_PERCENT_STEPS.length-1)] || 0;
    const nextPercent = UPGRADE_PERCENT_STEPS[Math.min(level, UPGRADE_PERCENT_STEPS.length-1)];
    
    let statsHtml = '';
    ['attack','defense','hp','mp'].forEach(stat => {
        if(baseStats[stat]) {
            const baseVal = baseStats[stat];
            // Current bonus
            const currBonus = Math.floor(baseVal * (currentPercent/100));
            // Next bonus
            const nextBonus = Math.floor(baseVal * (nextPercent/100));
            
            const currentTotal = (item.stats && item.stats[stat]) ? item.stats[stat] : (baseVal + currBonus);
            // Logic fix: Item stats in state already include bonuses? 
            // Usually we store modified stats. Let's assume item.stats holds current total.
            
            // To predict next, subtract old bonus, add new bonus
            // But simplified: base + newBonus
            const predicted = baseVal + nextBonus;
            
            statsHtml += `
                <div class="stat-row">
                    <span class="stat-name">${stat.toUpperCase()}</span>
                    <span class="stat-calc">${currentTotal} <i class="fas fa-arrow-right"></i> <span class="new-val">${predicted}</span></span>
                </div>`;
        }
    });

    preview.innerHTML = `
        <div style="text-align:center; margin-bottom:10px;">
            <span style="font-size:2rem;">${baseItems[item.id].icon}</span>
            <h4>${baseItems[item.id].name}</h4>
            <p>Subir a Nivel ${level+1}</p>
        </div>
        <div class="upgrade-stats-list">
            ${statsHtml}
        </div>
    `;
    
    document.getElementById('upgrade-cost').textContent = cost;
    btn.disabled = Game.player.col < cost;
    
    btn.onclick = () => confirmUpgrade(item, cost, nextPercent);
}

function confirmUpgrade(item, cost, percent) {
    if (Game.player.col < cost) return;
    
    Game.player.col -= cost;
    item.level = (item.level || 1) + 1;
    
    const baseStats = baseItems[item.id].stats || {};
    ['attack','defense','hp','mp'].forEach(stat => {
        if (baseStats[stat]) {
            const increase = Math.floor(baseStats[stat] * (percent/100));
            item.stats[stat] = baseStats[stat] + increase;
        }
    });

    showNotification("¡Equipo mejorado!", "success");
    playSfx('anvil'); // Conceptual
    calculateEffectiveStats();
    updatePlayerHUD();
    renderInventory(); 
    renderEquipment();
    renderUpgradeEquipmentList(); // Refresh list to update Level text
}