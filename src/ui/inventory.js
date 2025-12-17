
import { Game } from '../state/gameState.js';
import { baseItems } from '../data/items.js';
import { useConsumable, equipItemByUid, unequipItem } from '../logic/playerLogic.js';
import { showNotification, genUid } from '../utils/helpers.js';

// Local State for Inventory UI
let currentFilter = 'all'; // all, equip, consumable, material
let currentSort = 'rarity'; // rarity, name, level, quantity

const rarityWeights = {
    'Mythic': 4,
    'Epic': 3,
    'Rare': 2,
    'Common': 1,
    undefined: 0
};

export function renderInventory() {
    const container = document.getElementById('inventory-grid-display');
    if (!container) return;
    
    // 1. Render Controls (if not already there, or refresh them)
    // We clear the container first to rebuild the view
    container.innerHTML = '';
    container.appendChild(createInventoryControls());

    // 2. Create Grid Container
    const grid = document.createElement('div');
    grid.className = 'inventory-grid';
    container.appendChild(grid);

    // 3. Process Items (Group Stackables + Flatten)
    let displayItems = processInventoryList();

    // 4. Filter
    displayItems = displayItems.filter(item => {
        const base = baseItems[item.id] || item;
        const type = base.type;
        if (currentFilter === 'all') return true;
        if (currentFilter === 'equip') return ['weapon', 'shield', 'armor', 'accessory'].includes(type);
        if (currentFilter === 'consumable') return type === 'consumable';
        if (currentFilter === 'material') return type === 'material';
        return true;
    });

    // 5. Sort
    displayItems.sort((a, b) => {
        const baseA = baseItems[a.id] || a;
        const baseB = baseItems[b.id] || b;

        if (currentSort === 'rarity') {
            const rA = rarityWeights[baseA.rarity] || 0;
            const rB = rarityWeights[baseB.rarity] || 0;
            if (rA !== rB) return rB - rA; // High rarity first
        }
        if (currentSort === 'level') {
            const lA = a.level || baseA.levelReq || 0;
            const lB = b.level || baseB.levelReq || 0;
            if (lA !== lB) return lB - lA; // High level first
        }
        if (currentSort === 'quantity') {
            const cA = a.count || 1;
            const cB = b.count || 1;
            if (cA !== cB) return cB - cA;
        }
        // Default / Tie-breaker: Name
        return baseA.name.localeCompare(baseB.name);
    });

    // 6. Render Cards
    if (displayItems.length === 0) {
        grid.innerHTML = '<div style="width:100%; text-align:center; padding:20px; color:#666;">Inventario vacío o sin resultados.</div>';
        return;
    }

    displayItems.forEach(item => {
        const base = baseItems[item.id] || item;
        const isStackable = base.type === 'consumable' || base.type === 'material';
        
        const el = isStackable 
            ? createStackableCard(base, item.count)
            : createEquipmentCard(base, item);

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
            if (!stackables[item.id]) {
                stackables[item.id] = { ...item, count: 0 };
            }
            stackables[item.id].count += (item.count || 1);
        } else {
            // Ensure UID for equipment
            if (!item.uid) item.uid = genUid();
            equipment.push(item);
        }
    });

    return [...Object.values(stackables), ...equipment];
}

function createInventoryControls() {
    const bar = document.createElement('div');
    bar.className = 'inv-controls';

    // Filters
    const filterGroup = document.createElement('div');
    filterGroup.className = 'inv-filter-group';
    
    const filters = [
        { id: 'all', label: 'Todo' },
        { id: 'equip', label: 'Equipo' },
        { id: 'consumable', label: 'Pociones' },
        { id: 'material', label: 'Materiales' }
    ];

    filters.forEach(f => {
        const btn = document.createElement('button');
        btn.className = `inv-filter-btn ${currentFilter === f.id ? 'active' : ''}`;
        btn.textContent = f.label;
        btn.onclick = () => { currentFilter = f.id; renderInventory(); };
        filterGroup.appendChild(btn);
    });

    // Sort
    const sortSelect = document.createElement('select');
    sortSelect.className = 'inv-sort-select';
    sortSelect.innerHTML = `
        <option value="rarity" ${currentSort === 'rarity' ? 'selected' : ''}>Rareza</option>
        <option value="level" ${currentSort === 'level' ? 'selected' : ''}>Nivel</option>
        <option value="quantity" ${currentSort === 'quantity' ? 'selected' : ''}>Cantidad</option>
        <option value="name" ${currentSort === 'name' ? 'selected' : ''}>Nombre</option>
    `;
    sortSelect.onchange = (e) => { currentSort = e.target.value; renderInventory(); };

    bar.appendChild(filterGroup);
    bar.appendChild(sortSelect);
    return bar;
}

function createStackableCard(base, count) {
    const div = document.createElement('div');
    const rarity = base.rarity || 'Common';
    
    div.className = `inventory-item stackable rarity-${rarity.toLowerCase()}`;
    div.setAttribute('data-rarity', rarity); 

    div.innerHTML = `
        <div class="item-icon">${base.icon}</div>
        <div class="item-meta">
            <span class="item-name-small">${base.name}</span>
        </div>
        <div class="item-count">x${count}</div>
    `;
    return div;
}

function createEquipmentCard(base, item) {
    const div = document.createElement('div');
    const rarity = base.rarity || 'Common';
    const level = item.level || 1;
    
    // Stats Preview
    let statPreview = '';
    if (item.stats || base.stats) {
        const s = item.stats || base.stats;
        if(s.attack) statPreview = `⚔️ ${s.attack}`;
        else if(s.defense) statPreview = `🛡️ ${s.defense}`;
        else if(s.hp) statPreview = `❤️ ${s.hp}`;
    }

    div.className = `inventory-item equipment rarity-${rarity.toLowerCase()}`;
    div.setAttribute('data-rarity', rarity); 

    div.innerHTML = `
        <div class="equip-level-badge">Lv.${level}</div>
        <div class="item-icon large">${base.icon}</div>
        <div class="item-name">${base.name}</div>
        <div class="item-stats-preview">${statPreview}</div>
    `;
    return div;
}

function handleItemClick(base, item) {
    if (base.type === 'consumable') {
        // For stackables, we need to find the actual instance in the real array
        // Since we grouped them for display, we just find the first available one in inventory
        const idx = Game.player.inventory.findIndex(it => it.id === item.id);
        if (idx !== -1) {
            const success = useConsumable(Game.player.inventory[idx], idx);
            if(success) renderInventory();
        }
    } else if (['weapon','shield','armor','accessory'].includes(base.type)) {
        equipItemByUid(item.uid);
        renderInventory(); 
        // Logic handles renderEquipment call now to support animation
    } else {
        showNotification(`${base.name}: ${base.description || 'Sin descripción.'}`);
    }
}

export function renderEquipment(highlightSlot = null) {
    const slotsContainer = document.querySelector('.equipment-slots');
    
    const slotsToRender = [
        { key: 'weapon', label: 'Mano Derecha' },
        { key: 'shield', label: 'Mano Izquierda' },
        { key: 'armor', label: 'Torso' },
        { key: 'accessory', label: 'Accesorio' }
    ];

    const hasDualWield = Game.player.unlockedSkills['dual_wield'];
    
    slotsContainer.innerHTML = '';

    if (hasDualWield) {
        slotsToRender.splice(1, 0, { key: 'weapon2', label: 'Mano Izquierda (Dual)', special: true });
    }

    slotsToRender.forEach(slotDef => {
        const el = document.createElement('div');
        el.id = `equip-${slotDef.key}`;
        el.className = 'equipment-slot sao-electric-hover';
        if (slotDef.special) el.classList.add('dual-wield-slot');

        // Apply visual animation if this slot was just equipped
        if (highlightSlot && slotDef.key === highlightSlot) {
            el.classList.add('equip-anim');
        }

        const item = Game.player.equipment[slotDef.key];

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
                unequipItem(slotDef.key);
                renderInventory(); 
                renderEquipment(); 
            };
        } else {
            el.classList.add('empty');
            el.innerHTML = `
                <div class="slot-placeholder">∅</div>
                <span class="slot-label">${slotDef.label}</span>
            `;
            el.onclick = null;
        }
        slotsContainer.appendChild(el);
    });
}
