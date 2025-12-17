
import { Game } from '../state/gameState.js';
import { baseItems } from '../data/items.js';
import { useConsumable, equipItemByUid, unequipItem } from '../logic/playerLogic.js';
import { showNotification, genUid } from '../utils/helpers.js';

let currentFilter = 'all';
let currentSort = 'rarity';

const rarityWeights = { 'Mythic': 4, 'Epic': 3, 'Rare': 2, 'Common': 1, undefined: 0 };

export function renderInventory() {
    const container = document.getElementById('inventory-grid-display');
    if (!container) return;
    
    container.innerHTML = '';
    container.appendChild(createInventoryControls());

    const grid = document.createElement('div');
    grid.className = 'inventory-grid';
    container.appendChild(grid);

    let displayItems = processInventoryList();

    displayItems = displayItems.filter(item => {
        const base = baseItems[item.id] || item;
        const type = base.type;
        if (currentFilter === 'all') return true;
        if (currentFilter === 'equip') return ['weapon', 'shield', 'armor', 'accessory'].includes(type);
        if (currentFilter === 'consumable') return type === 'consumable';
        if (currentFilter === 'material') return type === 'material';
        return true;
    });

    displayItems.sort((a, b) => {
        const baseA = baseItems[a.id] || a;
        const baseB = baseItems[b.id] || b;
        if (currentSort === 'rarity') {
            const rA = rarityWeights[baseA.rarity] || 0;
            const rB = rarityWeights[baseB.rarity] || 0;
            if (rA !== rB) return rB - rA;
        }
        return baseA.name.localeCompare(baseB.name);
    });

    displayItems.forEach(item => {
        const base = baseItems[item.id] || item;
        const isStackable = base.type === 'consumable' || base.type === 'material';
        const el = isStackable ? createStackableCard(base, item.count) : createEquipmentCard(base, item);
        el.onclick = () => handleItemClick(base, item);
        grid.appendChild(el);
    });
}

function processInventoryList() {
    const stackables = {};
    const equipment = [];
    Game.player.inventory.forEach((item) => {
        const base = baseItems[item.id] || item;
        if (base.type === 'consumable' || base.type === 'material') {
            if (!stackables[item.id]) stackables[item.id] = { ...item, count: 0 };
            stackables[item.id].count += (item.count || 1);
        } else {
            if (!item.uid) item.uid = genUid();
            equipment.push(item);
        }
    });
    return [...Object.values(stackables), ...equipment];
}

function createInventoryControls() {
    const bar = document.createElement('div');
    bar.className = 'inv-controls';
    const filterGroup = document.createElement('div');
    filterGroup.className = 'inv-filter-group';
    ['all', 'equip', 'consumable', 'material'].forEach(id => {
        const btn = document.createElement('button');
        btn.className = `inv-filter-btn ${currentFilter === id ? 'active' : ''}`;
        btn.textContent = id.charAt(0).toUpperCase() + id.slice(1);
        btn.onclick = () => { currentFilter = id; renderInventory(); };
        filterGroup.appendChild(btn);
    });
    bar.appendChild(filterGroup);
    return bar;
}

function createStackableCard(base, count) {
    const div = document.createElement('div');
    div.className = `inventory-item stackable rarity-${(base.rarity || 'Common').toLowerCase()}`;
    div.innerHTML = `
        <div class="item-icon">${base.icon}</div>
        <div class="item-meta"><span class="item-name-small">${base.name}</span></div>
        <div class="item-count">x${count}</div>
    `;
    return div;
}

function createEquipmentCard(base, item) {
    const div = document.createElement('div');
    const rarity = base.rarity || 'Common';
    div.className = `inventory-item equipment rarity-${rarity.toLowerCase()}`;
    div.innerHTML = `
        <div class="equip-level-badge">Lv.${item.level || 1}</div>
        <div class="item-icon large">${base.icon}</div>
        <div class="item-name">${base.name}</div>
    `;
    return div;
}

function handleItemClick(base, item) {
    if (base.type === 'consumable') {
        const idx = Game.player.inventory.findIndex(it => it.id === item.id);
        if (idx !== -1) {
            const success = useConsumable(Game.player.inventory[idx], idx);
            if(success) renderInventory();
        }
    } else if (['weapon','shield','armor','accessory'].includes(base.type)) {
        equipItemByUid(item.uid);
        renderInventory(); 
    }
}

export function renderEquipment(highlightSlot = null) {
    const slotsContainer = document.querySelector('.equipment-slots');
    if (!slotsContainer) return;

    const slotsToRender = [
        { key: 'weapon', label: 'Mano Derecha' },
        { key: 'shield', label: 'Mano Izquierda' },
        { key: 'armor', label: 'Torso' },
        { key: 'accessory', label: 'Accesorio' }
    ];

    if (Game.player.unlockedSkills['dual_wield']) {
        slotsToRender.splice(1, 1, { key: 'weapon2', label: 'Dual Wield' });
    }

    slotsContainer.innerHTML = '';
    slotsToRender.forEach(slotDef => {
        const el = document.createElement('div');
        el.className = 'equipment-slot sao-electric-hover';
        if (highlightSlot === slotDef.key) el.classList.add('equip-anim');

        const item = Game.player.equipment[slotDef.key];
        if (item) {
            const base = baseItems[item.id] || item;
            el.classList.add('has-item', `rarity-${(base.rarity || 'Common').toLowerCase()}`);
            el.innerHTML = `
                <div class="slot-icon">${base.icon}</div>
                <div class="slot-info">
                    <span class="slot-name">${base.name}</span>
                    <span class="slot-sub">LV ${item.level || 1}</span>
                </div>
            `;
            el.onclick = () => { unequipItem(slotDef.key); renderInventory(); renderEquipment(); };
        } else {
            el.classList.add('empty');
            el.innerHTML = `<div class="slot-placeholder">∅</div><span class="slot-label">${slotDef.label}</span>`;
        }
        slotsContainer.appendChild(el);
    });
}
