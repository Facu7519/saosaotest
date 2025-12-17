import { Game } from '../state/gameState.js';
import { renderInventory, renderEquipment } from './inventory.js';
import { renderShop } from './shop.js';
import { renderBlacksmithRecipes } from '../logic/blacksmithLogic.js';
import { renderPlayerStats } from './renderers.js';
import { updatePlayerHUD } from './hud.js';

export function openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    // Close others immediately (no animation) to keep it snappy when switching context
    document.querySelectorAll('.modal').forEach(m => {
        if (m.id !== modalId && m.id !== 'infoModal' && !(m.id === 'combatModal' && Game.currentCombat.active)) {
            m.style.display = 'none';
            m.classList.remove('opening', 'closing'); // Clean state
        }
    });

    modal.style.display = 'block';
    modal.classList.remove('closing');
    modal.classList.add('opening'); // Triggers opening animation in CSS if needed

    // Refresh contents based on modal type
    if (modalId === 'inventoryModal') { renderInventory(); renderEquipment(); }
    if (modalId === 'shopModal') renderShop();
    if (modalId === 'blacksmithModal' || modalId === 'blacksmithMainModal') { /* Main menu, static */ }
    if (modalId === 'blacksmithForgeModal') renderBlacksmithRecipes();
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
    if (!modal) return;

    if (modal.style.display === 'none') return;

    // Add closing class to trigger CSS animation
    modal.classList.remove('opening');
    modal.classList.add('closing');

    // Wait for animation to finish
    modal.addEventListener('animationend', () => {
        if (modal.classList.contains('closing')) {
            modal.style.display = 'none';
            modal.classList.remove('closing');
        }
        
        if (modalId === 'infoModal') document.getElementById('modal-body-content').innerHTML = '';
    }, { once: true });
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
            // Find top-most visible modal that isn't closing
            const openModals = Array.from(document.querySelectorAll('.modal'))
                .filter(m => m.style.display === 'block' && !m.classList.contains('closing'));
            
            if (openModals.length > 0) {
                const topModal = openModals[openModals.length - 1];
                if (topModal.id === 'combatModal' && Game.currentCombat.active) return;
                if (topModal.id === 'nameEntryModal' && !Game.player.name) return;
                closeModal(topModal.id);
            }
        }
    });
}