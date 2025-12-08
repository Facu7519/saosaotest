
import { Game } from '../state/gameState.js';
import { baseItems } from '../data/items.js';
import { useConsumable, equipItemByUid, unequipItem } from '../logic/playerLogic.js';
import { showNotification, genUid } from '../utils/helpers.js';

export function renderInventory() {
    const grid = document.getElementById('inventory-grid-display');
    if(!grid) return;
    grid.innerHTML = '';

    const stackables = {};
    const nonStack = [];

    Game.player.inventory.forEach((item, index) => {
        const base = baseItems[item.id] || item;
        if (base.type === 'consumable' || base.type === 'material') {
            if (!stackables[item.id]) stackables[item.id] = { item: item, count: 0 };
            stackables[item.id].count += item.count || 1;
        } else {
            // Ensure UID
            if(!item.uid) item.uid = genUid();
            nonStack.push({ item, index });
        }
    });

    // Render Stackables
    Object.values(stackables).forEach(s => {
        const item = s.item;
        const base = baseItems[item.id] || item;
        const el = createItemCard(base, s.count);
        el.onclick = () => {
            if (base.type === 'consumable') {
                const idx = Game.player.inventory.findIndex(it => it.id === item.id);
                if (idx !== -1) useConsumable(Game.player.inventory[idx], idx);
            } else {
                showNotification(`${base.name}: Material. Tienes ${s.count}.`);
            }
        };
        grid.appendChild(el);
    });

    // Render Non-Stackables
    nonStack.forEach(({ item }) => {
        const base = baseItems[item.id] || item;
        const el = createItemCard(base, 1, item.level, item.stats);
        el.onclick = () => {
             if (['weapon','shield','armor','accessory'].includes(base.type)) {
                equipItemByUid(item.uid);
            }
        };
        grid.appendChild(el);
    });
}

function createItemCard(base, count, level, stats) {
    const div = document.createElement('div');
    div.className = `inventory-item rarity-${(base.rarity || 'Common').toLowerCase()}`;
    div.innerHTML = `
        <span class="item-icon">${base.icon}</span>
        <span class="item-name">${base.name}</span>
        ${level ? `<div style="font-size:0.8rem">LV ${level}</div>` : ''}
        ${count > 1 ? `<span class="item-count">x${count}</span>` : ''}
    `;
    return div;
}

export function renderEquipment() {
    ['weapon', 'shield', 'armor', 'accessory'].forEach(slot => {
        const el = document.getElementById(`equip-${slot}`);
        const item = Game.player.equipment[slot];
        if (item) {
            const base = baseItems[item.id] || item;
            el.innerHTML = `<span class="item-icon">${base.icon}</span><span class="item-name">${base.name}</span>`;
            el.className = `equipment-slot has-item rarity-${(base.rarity || 'Common').toLowerCase()}`;
            el.onclick = () => unequipItem(slot);
        } else {
            el.innerHTML = `<span>${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>`;
            el.className = 'equipment-slot';
            el.onclick = null;
        }
    });
}
