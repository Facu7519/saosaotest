
import { Game } from '../state/gameState.js';
import { floorData } from '../data/floors.js';
import { baseItems } from '../data/items.js';
import { showNotification } from '../utils/helpers.js';
import { updatePlayerHUD } from './hud.js';
import { renderInventory } from './inventory.js';
import { addItemToInventory } from '../logic/playerLogic.js';

export function renderShop() {
    const grid = document.getElementById('shop-grid-display');
    if(!grid) return;
    grid.innerHTML = '';
    
    document.getElementById('shop-floor-number').textContent = Game.player.currentFloor;
    document.getElementById('shop-player-col').textContent = Game.player.col;

    const items = floorData[Game.player.currentFloor]?.shopItems || [];
    
    if (items.length === 0) {
        grid.innerHTML = "<p>No hay artículos.</p>";
        return;
    }

    items.forEach(shopEntry => {
        const base = baseItems[shopEntry.id];
        if(!base) return;
        const el = document.createElement('div');
        el.className = `shop-item rarity-${(base.rarity || 'Common').toLowerCase()}`;
        el.setAttribute('data-rarity', base.rarity || 'Common');
        el.innerHTML = `
            <span class="item-icon">${base.icon}</span>
            <span class="item-name">${base.name}</span>
            <span class="item-price">${shopEntry.price} Col</span>
        `;
        el.onclick = () => buyItem(shopEntry.id, shopEntry.price, base);
        grid.appendChild(el);
    });
}

function buyItem(id, price, base) {
    if (Game.player.col >= price) {
        if (base.levelReq && Game.player.level < base.levelReq) {
            showNotification(`Nivel requerido: ${base.levelReq}`, 'error');
            return;
        }
        Game.player.col -= price;
        addItemToInventory({ id: id }, 1);
        showNotification(`Comprado ${base.name}`, 'success');
        updatePlayerHUD();
        renderShop();
        renderInventory();
    } else {
        showNotification("No tienes suficiente Col.", "error");
    }
}
