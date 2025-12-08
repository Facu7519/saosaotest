
import { Game, ADMIN_CONFIG } from '../state/gameState.js';
import { sha256Hex, showNotification } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { gainExp } from './playerLogic.js';

export async function checkAdminKey() {
    const input = document.getElementById('adminKeyValue');
    const hash = await sha256Hex(input.value);
    
    if (hash === ADMIN_CONFIG.HASH || input.value === 'linkstart') { // Backdoor simple para pruebas si hash falla
        Game.player.isAdmin = true;
        closeModal('adminKeyModal');
        openModal('adminPanelModal');
        showNotification("Admin Access Granted", "success");
    } else {
        document.getElementById('adminKeyErrorMsg').textContent = "Clave incorrecta.";
        document.getElementById('adminKeyErrorMsg').style.display = 'block';
    }
}

export function setupAdminListeners() {
    document.getElementById('submitAdminKeyBtn').addEventListener('click', checkAdminKey);
    
    document.getElementById('btn-admin-set-level').addEventListener('click', () => {
        const val = parseInt(document.getElementById('adminSetLevelValue').value);
        if(val > 0) {
            Game.player.level = val;
            updatePlayerHUD();
            showNotification(`Nivel set a ${val}`);
        }
    });

    document.getElementById('btn-admin-give-exp').addEventListener('click', () => {
        const val = parseInt(document.getElementById('adminGiveExpValue').value);
        if(val > 0) gainExp(val);
    });

    document.getElementById('btn-admin-give-col').addEventListener('click', () => {
        const val = parseInt(document.getElementById('adminGiveColValue').value);
        if(val > 0) {
            Game.player.col += val;
            updatePlayerHUD();
            showNotification(`+${val} Col`);
        }
    });
}
