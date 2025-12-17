import { Game } from '../state/gameState.js';
import { renderInventory, renderEquipment } from './inventory.js';
import { renderShop } from './shop.js';
import { renderBlacksmithRecipes } from '../logic/blacksmithLogic.js';
import { renderPlayerStats } from './renderers.js';
import { updatePlayerHUD } from './hud.js';

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    document.querySelectorAll('.modal').forEach(m => {
        if (m.id !== modalId && m.id !== 'infoModal' && !(m.id === 'combatModal' && Game.currentCombat.active)) {
            m.style.display = 'none';
            m.classList.remove('opening', 'closing');
        }
    });

    modal.style.display = 'block';
    modal.classList.remove('closing');
    modal.classList.add('opening');

    if (modalId === 'inventoryModal') { renderInventory(); renderEquipment(); }
    if (modalId === 'shopModal') renderShop();
    if (modalId === 'blacksmithForgeModal') renderBlacksmithRecipes();
    if (modalId === 'playerStatsModal') renderPlayerStats();
    if (modalId === 'nameEntryModal') {
        const input = document.getElementById('playerNameInput');
        if (input) input.focus();
    }
}

export function closeModal(modalId) {
    if (modalId === 'nameEntryModal' && !Game.player.name) return;
    const modal = document.getElementById(modalId);
    if (!modal) return;
    if (modal.style.display === 'none') return;

    modal.classList.remove('opening');
    modal.classList.add('closing');

    modal.addEventListener('animationend', () => {
        if (modal.classList.contains('closing')) {
            modal.style.display = 'none';
            modal.classList.remove('closing');
        }
        if (modalId === 'infoModal') {
            const body = document.getElementById('modal-body-content');
            if (body) body.innerHTML = '';
        }
    }, { once: true });
}

export function setupModalListeners() {
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const target = (btn as HTMLElement).dataset.target;
            if (target) closeModal(target);
        });
    });

    window.addEventListener('click', (event) => {
        const target = event.target as HTMLElement;
        if (target.classList.contains('modal')) {
            if (target.id === 'combatModal' && Game.currentCombat.active) return;
            if (target.id === 'nameEntryModal' && !Game.player.name) return;
            closeModal(target.id);
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            const openModals = Array.from(document.querySelectorAll('.modal'))
                .filter(m => (m as HTMLElement).style.display === 'block' && !m.classList.contains('closing'));
            if (openModals.length > 0) {
                const topModal = openModals[openModals.length - 1];
                if (topModal.id === 'combatModal' && Game.currentCombat.active) return;
                if (topModal.id === 'nameEntryModal' && !Game.player.name) return;
                closeModal(topModal.id);
            }
        }
    });
}