
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
            if(!item.uid) item.uid = genUid();
            nonStack.push({ item, index });
        }
    });

    Object.values(stackables).forEach(s => {
        const item = s.item;
        const base = baseItems[item.id] || item;
        const el = createItemCard(base, s.count, null, null);
        el.onclick = () => {
            if (base.type === 'consumable') {
                const idx = Game.player.inventory.findIndex(it => it.id === item.id);
                if (idx !== -1) useConsumable(Game.player.inventory[idx], idx);
            } else {
                showNotification(`${base.name}: Material de forja. Tienes ${s.count}.`);
            }
        };
        grid.appendChild(el);
    });

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
    const rarity = base.rarity || 'Common';
    const lowerRarity = rarity.toLowerCase();
    
    div.className = `inventory-item rarity-${lowerRarity}`;
    div.setAttribute('data-rarity', rarity); 

    let detailsHtml = '';
    
    if (stats) {
        const s = stats;
        const parts = [];
        if(s.attack) parts.push(`ATK:${s.attack}`);
        if(s.defense) parts.push(`DEF:${s.defense}`);
        if(s.hp) parts.push(`HP:${s.hp}`);
        if(s.mp) parts.push(`MP:${s.mp}`);
        detailsHtml += `<span class="item-details">${parts.join(' ')}</span>`;
    } else if (base.description) {
        detailsHtml += `<span class="item-details" style="font-style:italic;">${base.description}</span>`;
    }

    if (base.levelReq) {
        detailsHtml += `<span class="item-level-req">Req. LV: ${base.levelReq}</span>`;
    }

    const rarityColorMap = {
        'Common': '#b0c4de',
        'Rare': '#87ceeb',
        'Epic': '#b19cd9',
        'Mythic': '#ff4d4d'
    };
    const color = rarityColorMap[rarity] || '#b0c4de';

    div.innerHTML = `
        <span class="item-icon">${base.icon}</span>
        <span class="item-name" style="color: ${color}">${base.name}</span>
        <span class="item-rarity-text" style="color: ${color}">${rarity}</span>
        ${level ? `<div style="font-size:0.8rem; color:#fff; margin-top:2px;">LV ${level}</div>` : ''}
        ${detailsHtml}
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
            const rarity = base.rarity || 'Common';
            const color = rarity === 'Mythic' ? '#ff4d4d' : (rarity === 'Epic' ? '#b19cd9' : (rarity === 'Rare' ? '#87ceeb' : '#b0c4de'));
            
            el.innerHTML = `
                <span class="item-icon">${base.icon}</span>
                <span class="item-name" style="color:${color}">${base.name}</span>
                <span style="font-size:0.8em; color:#ddd">LV ${item.level || 1}</span>
            `;
            el.className = `equipment-slot has-item rarity-${rarity.toLowerCase()}`;
            el.onclick = () => unequipItem(slot);
        } else {
            el.innerHTML = `<span>${slot.charAt(0).toUpperCase() + slot.slice(1)}</span>`;
            el.className = 'equipment-slot';
            el.onclick = null;
        }
    });
}
