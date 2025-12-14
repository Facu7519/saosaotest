import { Game, ADMIN_CONFIG } from '../state/gameState.js';
import { sha256Hex, showNotification } from '../utils/helpers.js';
import { openModal, closeModal } from '../ui/modals.js';
import { updatePlayerHUD } from '../ui/hud.js';
import { gainExp, levelUp, addItemToInventory, calculateEffectiveStats } from './playerLogic.js';
import { baseItems } from '../data/items.js';
import { floorData } from '../data/floors.js';

export async function checkAdminKey() {
    // If already admin (saved in state), skip check
    if (Game.player.isAdmin) {
        openAdminPanel();
        return;
    }

    const input = document.getElementById('adminKeyValue');
    const hash = await sha256Hex(input.value);
    
    if (hash === ADMIN_CONFIG.HASH || input.value === 'linkstart') { 
        Game.player.isAdmin = true;
        closeModal('adminKeyModal');
        openAdminPanel();
        showNotification("Admin Access Unlocked Forever", "success");
        // Trigger save to persist status
        localStorage.setItem('sao_save', JSON.stringify(Game.player));
    } else {
        document.getElementById('adminKeyErrorMsg').textContent = "Clave incorrecta.";
        document.getElementById('adminKeyErrorMsg').style.display = 'block';
    }
}

function openAdminPanel() {
    renderAdminItemDashboard();
    renderAdminFloorManager();
    openModal('adminPanelModal');
}

// --- Item Dashboard ---
let currentAdminTab = 'weapon';

function renderAdminItemDashboard() {
    const tabsContainer = document.getElementById('admin-item-tabs');
    const gridContainer = document.getElementById('admin-items-dashboard');
    
    // Get Categories
    const categories = ['weapon', 'armor', 'shield', 'accessory', 'consumable', 'material'];
    
    // Render Tabs
    tabsContainer.innerHTML = '';
    categories.forEach(cat => {
        const btn = document.createElement('div');
        btn.className = `admin-tab ${currentAdminTab === cat ? 'active' : ''}`;
        btn.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
        btn.onclick = () => {
            currentAdminTab = cat;
            renderAdminItemDashboard();
        };
        tabsContainer.appendChild(btn);
    });

    // Render Items
    gridContainer.innerHTML = '';
    Object.entries(baseItems).forEach(([id, item]) => {
        if (item.type !== currentAdminTab) return;
        
        const card = document.createElement('div');
        card.className = 'admin-item-btn';
        card.title = item.name;
        card.innerHTML = `<span>${item.icon}</span><div style="font-size:0.6em;text-align:center;overflow:hidden;height:2em;">${item.name}</div>`;
        card.onclick = () => {
            addItemToInventory({ id: id }, 1);
            showNotification(`+1 ${item.name}`, 'success');
        };
        gridContainer.appendChild(card);
    });
}

// --- Floor Manager ---
function renderAdminFloorManager() {
    const container = document.getElementById('admin-floors-grid');
    container.innerHTML = '';
    
    Object.keys(floorData).forEach(floorNum => {
        const f = parseInt(floorNum);
        const isUnlocked = Game.player.unlockedFloors.includes(f);
        
        const btn = document.createElement('button');
        btn.className = `admin-floor-btn ${isUnlocked ? 'unlocked' : ''}`;
        btn.textContent = `Piso ${f} ${isUnlocked ? '🔓' : '🔒'}`;
        
        btn.onclick = () => {
            if (isUnlocked) {
                // Lock logic (prevent locking current floor if on it)
                if (Game.player.currentFloor == f) {
                    showNotification("No puedes bloquear el piso actual.", "error");
                    return;
                }
                Game.player.unlockedFloors = Game.player.unlockedFloors.filter(x => x !== f);
                floorData[f].unlocked = false;
                btn.classList.remove('unlocked');
                btn.textContent = `Piso ${f} 🔒`;
            } else {
                // Unlock logic
                Game.player.unlockedFloors.push(f);
                floorData[f].unlocked = true;
                btn.classList.add('unlocked');
                btn.textContent = `Piso ${f} 🔓`;
            }
            Game.player.unlockedFloors.sort((a,b) => a-b);
        };
        
        container.appendChild(btn);
    });
}

export function setupAdminListeners() {
    // If admin access button clicked
    document.getElementById('admin-access-btn').addEventListener('click', () => {
        if(Game.player.isAdmin) openAdminPanel();
        else openModal('adminKeyModal');
    });

    document.getElementById('submitAdminKeyBtn').addEventListener('click', checkAdminKey);
    
    document.getElementById('btn-admin-set-level').addEventListener('click', () => {
        const val = parseInt(document.getElementById('adminSetLevelValue').value);
        if(val > 0) {
            Game.player.level = val;
            calculateEffectiveStats();
            updatePlayerHUD();
            showNotification(`Nivel set a ${val}`);
        }
    });

    document.getElementById('btn-admin-heal-all').addEventListener('click', () => {
        Game.player.hp = Game.player.maxHp;
        Game.player.mp = Game.player.maxMp;
        updatePlayerHUD();
        showNotification("HP/MP Restaurados");
    });

    document.getElementById('btn-admin-god-mode').addEventListener('click', () => {
        Game.player.hp = 99999;
        Game.player.maxHp = 99999;
        Game.player.baseAttack = 9999;
        calculateEffectiveStats();
        updatePlayerHUD();
        showNotification("GOD MODE ACTIVATED");
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