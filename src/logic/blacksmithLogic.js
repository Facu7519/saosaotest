
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

// Material Requirements per Level Range
const UPGRADE_MATS = {
    low: { id: 'iron_ore', name: 'Mena de Hierro' },    // Lv 1-3
    mid: { id: 'silver_ingot', name: 'Lingote Plata' }, // Lv 4-6
    high: { id: 'blue_crystal', name: 'Cristal Azul' }, // Lv 7-9
    max: { id: 'divine_fragment', name: 'Fragmento Divino' } // Lv 10
};

export function renderBlacksmithRecipes() {
    const grid = document.getElementById('forge-recipes-grid');
    if(!grid) return;
    grid.innerHTML = '';
    
    const floorRecipes = floorData[Game.player.currentFloor]?.blacksmithRecipes || [];
    
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
    const btn = document.getElementById('confirm-upgrade-btn');
    const preview = document.getElementById('upgrade-preview');

    if (level >= MAX_ITEM_LEVEL) {
        preview.innerHTML = `<div style="text-align:center;"><h4>${baseItems[item.id].name}</h4><p class="maxed">NIVEL MÁXIMO ALCANZADO</p></div>`;
        btn.disabled = true;
        document.getElementById('upgrade-cost').textContent = "-";
        return;
    }

    // Determine Stats
    const baseStats = baseItems[item.id].stats || {};
    const currentPercent = UPGRADE_PERCENT_STEPS[Math.min(level-1, UPGRADE_PERCENT_STEPS.length-1)] || 0;
    const nextPercent = UPGRADE_PERCENT_STEPS[Math.min(level, UPGRADE_PERCENT_STEPS.length-1)];
    
    let statsHtml = '';
    ['attack','defense','hp','mp'].forEach(stat => {
        if(baseStats[stat]) {
            const baseVal = baseStats[stat];
            const currBonus = Math.floor(baseVal * (currentPercent/100));
            const nextBonus = Math.floor(baseVal * (nextPercent/100));
            const currentTotal = baseVal + currBonus; // Logic assumption: item.stats syncs with this
            const predicted = baseVal + nextBonus;
            
            statsHtml += `
                <div class="stat-row">
                    <span class="stat-name">${stat.toUpperCase()}</span>
                    <span class="stat-calc">${currentTotal} <i class="fas fa-arrow-right"></i> <span class="new-val">${predicted}</span></span>
                </div>`;
        }
    });

    // Cost & Risk Calculation
    const colCost = Math.floor(100 * level * 1.5);
    let successRate = 100;
    let matReq = { ...UPGRADE_MATS.low, qty: 1 };

    if (level >= 3 && level < 6) { 
        successRate = 80; 
        matReq = { ...UPGRADE_MATS.mid, qty: 1 };
    } else if (level >= 6 && level < 9) { 
        successRate = 60; 
        matReq = { ...UPGRADE_MATS.high, qty: 2 };
    } else if (level >= 9) { 
        successRate = 40; 
        matReq = { ...UPGRADE_MATS.max, qty: 1 };
    }

    // Check Materials
    const totalMatOwned = Game.player.inventory.reduce((acc, i) => i.id === matReq.id ? acc + (i.count||1) : acc, 0);
    const hasMats = totalMatOwned >= matReq.qty;
    const hasCol = Game.player.col >= colCost;

    preview.innerHTML = `
        <div style="text-align:center; margin-bottom:10px;">
            <span style="font-size:2rem;">${baseItems[item.id].icon}</span>
            <h4>${baseItems[item.id].name} (+${level} -> +${level+1})</h4>
        </div>
        <div class="upgrade-stats-list">
            ${statsHtml}
        </div>
        <div style="margin-top:15px; border-top:1px solid #333; padding-top:10px;">
            <div style="display:flex; justify-content:space-between; margin-bottom:5px;">
                <span>Éxito:</span> <span style="color:${successRate < 100 ? '#ffcc00' : '#00ff00'}">${successRate}%</span>
            </div>
            <div style="display:flex; justify-content:space-between;">
                <span>Material:</span> 
                <span class="${hasMats ? 'ok' : 'missing'}">${matReq.name} x${matReq.qty} (${totalMatOwned})</span>
            </div>
        </div>
    `;
    
    document.getElementById('upgrade-cost').textContent = colCost;
    btn.textContent = `Mejorar (${colCost} Col)`;
    btn.disabled = !(hasCol && hasMats);
    
    // Add risk warning to btn text if low chance
    if (successRate < 100) {
        btn.classList.add('risky');
    } else {
        btn.classList.remove('risky');
    }
    
    btn.onclick = () => confirmUpgrade(item, colCost, nextPercent, successRate, matReq);
}

function confirmUpgrade(item, cost, percent, successRate, matReq) {
    if (Game.player.col < cost) return;
    
    // Consume Materials
    let remaining = matReq.qty;
    for (let i = Game.player.inventory.length - 1; i >= 0; i--) {
        const invItem = Game.player.inventory[i];
        if (invItem.id === matReq.id) {
            const avail = invItem.count || 1;
            const take = Math.min(avail, remaining);
            invItem.count = avail - take;
            remaining -= take;
            if (invItem.count <= 0) Game.player.inventory.splice(i, 1);
            if (remaining <= 0) break;
        }
    }

    Game.player.col -= cost;

    // RNG Roll
    if (Math.random() * 100 < successRate) {
        // Success
        item.level = (item.level || 1) + 1;
        const baseStats = baseItems[item.id].stats || {};
        ['attack','defense','hp','mp'].forEach(stat => {
            if (baseStats[stat]) {
                const increase = Math.floor(baseStats[stat] * (percent/100));
                item.stats[stat] = baseStats[stat] + increase;
            }
        });
        showNotification("¡Mejora Exitosa! " + baseItems[item.id].name, "success");
        
        // --- VISUAL ANIMATION LOGIC ---
        // Find the selected card in the DOM to animate it
        const cards = document.querySelectorAll('#upgrade-equipment-list .item-card');
        cards.forEach(card => {
            if(card.classList.contains('selected')) {
                card.classList.add('upgrade-success');
                // Update text immediately for visual feedback before full render
                const levelSpan = card.querySelector('.level');
                if(levelSpan) levelSpan.textContent = `Lv.${item.level}`;
            }
        });
        
        // Re-select item logic to update preview immediately
        selectUpgradeItem(item, document.querySelector('.item-card.selected') || document.createElement('div'));

        // Update Stats & HUD IMMEDIATELY so the player feels the power up
        calculateEffectiveStats();
        updatePlayerHUD();

        // Delay LIST re-render so animation plays
        setTimeout(() => {
            renderInventory(); 
            renderEquipment();
            renderUpgradeEquipmentList(); 
        }, 800);

    } else {
        // Failure
        showNotification("La mejora falló...", "error");
        
        // Consequence Logic
        if (item.level > 6) {
            item.level -= 1; // De-level
            // Re-calc stats for lower level
            const prevPercent = UPGRADE_PERCENT_STEPS[Math.min(item.level-1, UPGRADE_PERCENT_STEPS.length-1)] || 0;
            const baseStats = baseItems[item.id].stats || {};
            ['attack','defense','hp','mp'].forEach(stat => {
                if (baseStats[stat]) {
                    const increase = Math.floor(baseStats[stat] * (prevPercent/100));
                    item.stats[stat] = baseStats[stat] + increase;
                }
            });
            showNotification("¡El nivel del objeto disminuyó!", "error");
        } else {
            showNotification("Materiales perdidos, pero el objeto está a salvo.", "default");
        }
        // Failure updates immediately
        calculateEffectiveStats();
        updatePlayerHUD();
        renderInventory(); 
        renderEquipment();
        renderUpgradeEquipmentList(); 
    }
}
