
import { Game } from '../state/gameState.js';
import { renderInventory, renderEquipment } from './inventory.js';
import { renderShop } from './shop.js';
import { renderBlacksmithRecipes } from '../logic/blacksmithLogic.js';
import { renderPlayerStats } from './renderers.js';
import { updatePlayerHUD } from './hud.js';

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Close others except specific ones
    document.querySelectorAll('.modal').forEach(m => {
        if (m.id !== modalId && m.id !== 'infoModal' && !(m.id === 'combatModal' && Game.currentCombat.active)) {
            m.style.display = 'none';
        }
    });

    modal.style.display = 'block';

    // Refresh contents based on modal type
    if (modalId === 'inventoryModal') { renderInventory(); renderEquipment(); }
    if (modalId === 'shopModal') renderShop();
    if (modalId === 'blacksmithModal' || modalId === 'blacksmithForgeModal') renderBlacksmithRecipes();
    if (modalId === 'playerStatsModal') renderPlayerStats();
    if (modalId === 'nameEntryModal') document.getElementById('playerNameInput').focus();
    if (modalId === 'adminKeyModal') {
        document.getElementById('adminKeyValue').value = '';
        document.getElementById('adminKeyErrorMsg').style.display = 'none';
        document.getElementById('adminKeyValue').focus();
    }
}

export function closeModal(modalId) {
    if (modalId === 'nameEntryModal' && !Game.player.name) {
        // Prevent closing if name not set
        return; 
    }
    const modal = document.getElementById(modalId);
    if (modal) modal.style.display = 'none';
    
    if (modalId === 'infoModal') document.getElementById('modal-body-content').innerHTML = '';
}

export function setupModalListeners() {
    // Click on X buttons
    document.querySelectorAll('.close-modal-btn').forEach(btn => {
        btn.addEventListener('click', () => closeModal(btn.dataset.target));
    });

    // Click outside modal
    window.addEventListener('click', (event) => {
        if (event.target.classList.contains('modal')) {
            if (event.target.id === 'combatModal' && Game.currentCombat.active) return;
            if (event.target.id === 'nameEntryModal' && !Game.player.name) return;
            closeModal(event.target.id);
        }
    });

    // Escape key
    document.addEventListener('keydown', (event) => {
        if (event.key === "Escape") {
            const openModals = Array.from(document.querySelectorAll('.modal')).filter(m => m.style.display === 'block');
            if (openModals.length > 0) {
                const topModal = openModals[openModals.length - 1];
                if (topModal.id === 'combatModal' && Game.currentCombat.active) return;
                if (topModal.id === 'nameEntryModal' && !Game.player.name) return;
                closeModal(topModal.id);
            }
        }
    });
}
