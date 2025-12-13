
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
                if (idx !== -1) {
                    useConsumable(Game.player.inventory[idx], idx);
                    renderInventory(); // Real-time update
                }
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
                renderInventory(); // Real-time update
                renderEquipment(); // Real-time update
            }
        };
        grid.appendChild(el);
    });
}

function createItemCard(base, count, level, stats) {
    const div = document.createElement('div');
    const rarity = base.rarity || 'Common';
    const lowerRarity = rarity.toLowerCase();
    
    div.className = `inventory-item sao-electric-hover rarity-${lowerRarity}`;
    div.setAttribute('data-rarity', rarity); 

    const rarityColorMap = {
        'Common': '#b0c4de',
        'Rare': '#87ceeb',
        'Epic': '#b19cd9',
        'Mythic': '#ff4d4d'
    };
    const color = rarityColorMap[rarity] || '#b0c4de';

    div.innerHTML = `
        <div class="item-icon">${base.icon}</div>
        <div class="item-name" style="color: ${color}">${base.name}</div>
        ${level ? `<div style="font-size:0.7rem; color:#aaa;">LV ${level}</div>` : ''}
        ${count > 1 ? `<span class="item-count">${count}</span>` : ''}
    `;
    return div;
}

export function renderEquipment() {
    ['weapon', 'shield', 'armor', 'accessory'].forEach(slot => {
        const el = document.getElementById(`equip-${slot}`);
        const item = Game.player.equipment[slot];
        
        el.className = 'equipment-slot sao-electric-hover';
        el.innerHTML = ''; // Clear previous

        if (item) {
            const base = baseItems[item.id] || item;
            const rarity = base.rarity || 'Common';
            const color = rarity === 'Mythic' ? '#ff4d4d' : (rarity === 'Epic' ? '#b19cd9' : (rarity === 'Rare' ? '#87ceeb' : '#fff'));
            
            el.classList.add('has-item');
            el.classList.add(`rarity-${rarity.toLowerCase()}`);
            
            el.innerHTML = `
                <div class="slot-icon">${base.icon}</div>
                <div class="slot-info">
                    <span class="slot-name" style="color:${color}">${base.name}</span>
                    <span class="slot-sub">LV ${item.level || 1} • ${rarity}</span>
                </div>
            `;
            
            el.onclick = () => {
                unequipItem(slot);
                renderInventory(); // Real-time update
                renderEquipment(); // Real-time update
            };
        } else {
            el.classList.add('empty');
            el.innerHTML = `
                <div class="slot-placeholder">∅</div>
                <span class="slot-label">${slot}</span>
            `;
            el.onclick = null;
        }
    });
}
