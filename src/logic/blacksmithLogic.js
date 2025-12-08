
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
    
    Object.entries(blacksmithRecipes).forEach(([key, recipe]) => {
        if (!floorRecipes.includes(key)) return;
        
        const base = baseItems[recipe.itemId];
        const el = document.createElement('div');
        el.className = `blacksmith-item rarity-${(base.rarity || 'Common').toLowerCase()}`;
        el.setAttribute('data-rarity', base.rarity || 'Common');
        
        el.innerHTML = `
            <span class="item-icon">${base.icon}</span>
            <span class="item-name">${base.name}</span>
            <span class="item-materials">${Object.keys(recipe.materials).map(k => `${k} x${recipe.materials[k]}`).join(', ')}</span>
            <span class="item-price">${recipe.cost} Col</span>
        `;
        el.onclick = () => forgeItem(key);
        grid.appendChild(el);
    });
}

function forgeItem(recipeKey) {
    const recipe = blacksmithRecipes[recipeKey];
    if (Game.player.col < recipe.cost) {
        showNotification("Col insuficiente.", "error");
        return;
    }
    
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        const owned = Game.player.inventory.find(i => i.id === matId)?.count || 0;
        if (owned < qty) {
            showNotification("Materiales insuficientes.", "error");
            return;
        }
    }
    
    Game.player.col -= recipe.cost;
    for (const [matId, qty] of Object.entries(recipe.materials)) {
        const item = Game.player.inventory.find(i => i.id === matId);
        item.count -= qty;
        if (item.count <= 0) {
            Game.player.inventory = Game.player.inventory.filter(i => i !== item);
        }
    }
    
    if (Math.random() < recipe.chance) {
        addItemToInventory({ id: recipe.itemId }, 1);
        showNotification("¡Éxito!", "success");
    } else {
        showNotification("Falló la forja...", "error");
    }
    updatePlayerHUD();
    renderBlacksmithRecipes();
}

export function renderUpgradeEquipmentList() {
    const list = document.getElementById('upgrade-equipment-list');
    if (!list) return;
    list.innerHTML = '';
    selectedUpgradeUid = null;
    document.getElementById('confirm-upgrade-btn').disabled = true;
    document.getElementById('upgrade-preview').innerHTML = "Selecciona un equipo.";

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

    allItems.forEach(({item, source}) => {
        const base = baseItems[item.id] || item;
        const rarity = base.rarity || 'Common';
        
        const el = document.createElement('div');
        el.className = `inventory-item rarity-${rarity.toLowerCase()}`;
        el.setAttribute('data-rarity', rarity);
        
        const rarityColorMap = {'Common': '#b0c4de', 'Rare': '#87ceeb', 'Epic': '#b19cd9', 'Mythic': '#ff4d4d'};
        const color = rarityColorMap[rarity] || '#b0c4de';

        el.innerHTML = `
            <span class="item-icon">${base.icon}</span>
            <span class="item-name" style="color:${color}">${base.name}</span>
            <span class="item-rarity-text" style="color:${color}">${rarity}</span>
            <span style="font-size:0.8em; color:#fff;">LV ${item.level || 1}</span>
        `;
        el.onclick = () => selectUpgradeItem(item, el);
        list.appendChild(el);
    });
}

function selectUpgradeItem(item, element) {
    document.querySelectorAll('#upgrade-equipment-list .inventory-item').forEach(e => e.style.borderColor = '');
    element.style.borderColor = '#00ffff';
    selectedUpgradeUid = item.uid;

    const level = item.level || 1;
    const cost = Math.floor(100 * level * 1.5);
    const btn = document.getElementById('confirm-upgrade-btn');
    const preview = document.getElementById('upgrade-preview');

    if (level >= MAX_ITEM_LEVEL) {
        preview.innerHTML = `<p>Nivel Máximo Alcanzado.</p>`;
        btn.disabled = true;
        document.getElementById('upgrade-cost').textContent = "-";
        return;
    }

    const baseStats = baseItems[item.id].stats || {};
    const nextPercent = UPGRADE_PERCENT_STEPS[Math.min(level, UPGRADE_PERCENT_STEPS.length-1)];
    
    let statsHtml = '';
    ['attack','defense'].forEach(stat => {
        if(item.stats[stat] || baseStats[stat]) {
            const current = item.stats[stat] || 0;
            const baseVal = baseStats[stat] || 0;
            const increase = Math.floor(baseVal * (nextPercent/100));
            statsHtml += `<li>${stat.toUpperCase()}: ${current} → ${current + increase}</li>`;
        }
    });

    preview.innerHTML = `
        <h4>${baseItems[item.id].name}</h4>
        <p>Nivel: ${level} → ${level+1}</p>
        <ul>${statsHtml}</ul>
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
            item.stats[stat] = (item.stats[stat] || baseStats[stat]) + increase;
        }
    });

    showNotification("¡Equipo mejorado!", "success");
    calculateEffectiveStats();
    updatePlayerHUD();
    renderInventory(); 
    renderEquipment();
    renderUpgradeEquipmentList(); 
}
