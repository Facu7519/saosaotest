
import { Game } from '../state/gameState.js';
import { skillDatabase, talentDatabase } from '../data/skills.js';
import { showNotification } from '../utils/helpers.js';
import { rollTalent, calculateEffectiveStats } from '../logic/playerLogic.js';
import { updatePlayerHUD } from './hud.js';

let currentCategory = 'sword_skills';
const MAX_SKILL_EQUIPPED = 4;
const MAX_TALENT_EQUIPPED = 3;

export function initSkillsUI() {
    // Tab Listeners
    document.querySelectorAll('.skill-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            if (btn.classList.contains('active')) return;

            document.querySelectorAll('.skill-tab').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            
            const newCategory = e.target.dataset.cat;
            const grid = document.getElementById('skills-grid-display');
            
            // Transition Logic
            grid.classList.add('fade-out-grid');
            
            setTimeout(() => {
                currentCategory = newCategory;
                if (currentCategory === 'talents') {
                    renderTalentsUI();
                } else {
                    renderSkillsGrid();
                }
                grid.classList.remove('fade-out-grid');
                grid.classList.add('fade-in-grid');
                
                setTimeout(() => {
                    grid.classList.remove('fade-in-grid');
                }, 300);
            }, 200); 
        });
    });
}

// --- STANDARD SKILLS ---
export function renderSkillsGrid() {
    const grid = document.getElementById('skills-grid-display');
    const spDisplay = document.getElementById('player-sp-display');
    if (!grid) return;

    grid.innerHTML = '';
    // Reset standard grid class if it was changed by talents view
    grid.className = 'skills-grid';
    
    spDisplay.textContent = Game.player.skillPoints;

    if(!Game.player.equippedSkills) Game.player.equippedSkills = [];
    const equippedCount = Game.player.equippedSkills.length;

    Object.entries(skillDatabase).forEach(([id, data]) => {
        if (data.category !== currentCategory) return;

        const currentLevel = Game.player.unlockedSkills[id] || 0;
        const isUnlocked = currentLevel > 0;
        const canUnlock = !isUnlocked && checkRequirements(id);
        const isEquipped = Game.player.equippedSkills.includes(id);
        
        // Cost Calc
        const nextLevel = currentLevel + 1;
        const spCost = (data.cost || 1) + (currentLevel * 1);
        const isMaxed = currentLevel >= data.maxLevel;
        const canAfford = Game.player.skillPoints >= spCost;
        const unlockCost = data.cost || 1;
        const canAffordUnlock = Game.player.skillPoints >= unlockCost;

        const card = document.createElement('div');
        card.className = `skill-card ${isUnlocked ? 'unlocked' : 'locked'} ${canUnlock ? 'purchasable' : ''} ${isEquipped ? 'equipped' : ''}`;
        
        if (isUnlocked && !isMaxed && canAfford) card.classList.add('can-upgrade');
        else if (canUnlock && canAffordUnlock) card.classList.add('affordable-unlock');

        // Buttons
        let actionBtns = '';
        if (isMaxed) {
            actionBtns += `<button class="skill-btn maxed" disabled>MAX</button>`;
        } else if (isUnlocked) {
            actionBtns += `<button class="skill-btn upgrade" ${canAfford ? '' : 'disabled'} onclick="window.upgradeSkill('${id}', ${spCost})">Mejorar (${spCost} SP)</button>`;
        } else if (canUnlock) {
            actionBtns += `<button class="skill-btn unlock" ${canAffordUnlock ? '' : 'disabled'} onclick="window.upgradeSkill('${id}', ${unlockCost})">Desbloquear (${unlockCost} SP)</button>`;
        } else {
             let reqText = '';
             if (data.levelReq && Game.player.level < data.levelReq) reqText = `Req: LV ${data.levelReq}`;
             else if (data.reqSkill) reqText = `Req: ${skillDatabase[data.reqSkill].name}`;
             actionBtns += `<button class="skill-btn locked" disabled>Bloqueado (${reqText})</button>`;
        }

        if (isUnlocked && data.type === 'active') {
            if (isEquipped) {
                actionBtns += `<button class="skill-btn unequip" onclick="window.toggleSkillEquip('${id}')">Quitar</button>`;
            } else {
                const full = equippedCount >= MAX_SKILL_EQUIPPED;
                actionBtns += `<button class="skill-btn equip" ${full ? 'disabled' : ''} onclick="window.toggleSkillEquip('${id}')">${full ? 'Lleno' : 'Equipar'}</button>`;
            }
        }

        // Info Stats
        let statsInfo = '';
        if (data.type === 'active') {
            const dmg = Math.floor((data.baseDamagePct + (data.growthPct * (Math.max(1, currentLevel) - 1))) * 100);
            const mp = data.mpCost + (data.mpGrowth * (Math.max(1, currentLevel) -1));
            statsInfo = `<div class="skill-stats"><span>💥 ${dmg}% Dmg</span><span>💧 ${mp} MP</span></div>`;
        } else {
             const eff = (data.baseEffect + (data.growthEffect * (Math.max(1, currentLevel) - 1)));
             const suffix = data.baseEffect < 1 ? '%' : ''; 
             const val = data.baseEffect < 1 ? Math.floor(eff * 100) : Math.floor(eff);
             statsInfo = `<div class="skill-stats"><span>✨ Efecto: +${val}${suffix}</span></div>`;
        }

        card.innerHTML = `
            ${isEquipped ? '<div class="equipped-badge-text">EQUIPADO</div>' : ''}
            <div class="skill-icon-frame">${data.icon}</div>
            <div class="skill-info">
                <h3>${data.name} <span class="skill-level">Lv.${currentLevel}/${data.maxLevel}</span></h3>
                <p>${data.description}</p>
                ${statsInfo}
            </div>
            <div class="skill-actions">
                ${actionBtns}
            </div>
        `;
        grid.appendChild(card);
    });
}

// --- TALENTS (AWAKENING) ---
function renderTalentsUI() {
    const grid = document.getElementById('skills-grid-display');
    const spDisplay = document.getElementById('player-sp-display');
    if (!grid) return;
    
    spDisplay.textContent = Game.player.skillPoints;
    
    // Change Grid Layout for Talents
    grid.innerHTML = '';
    grid.className = 'talents-container'; 

    // 1. Roll Section
    const rollSection = document.createElement('div');
    rollSection.className = 'talent-roll-section';
    rollSection.innerHTML = `
        <div class="roll-banner">
            <h3>🌀 Despertar Talento</h3>
            <p>Usa 5 SP para obtener un talento aleatorio. Los duplicados reembolsan 2 SP.</p>
            <button id="btn-roll-talent" class="action-btn large-btn" ${Game.player.skillPoints < 5 ? 'disabled' : ''}>
                Despertar (5 SP)
            </button>
        </div>
    `;
    grid.appendChild(rollSection);
    
    document.getElementById('btn-roll-talent').onclick = handleTalentRoll;

    // 2. Equipped Section
    const equippedContainer = document.createElement('div');
    equippedContainer.className = 'talent-slots-area';
    equippedContainer.innerHTML = `<h4>Talentos Activos (${(Game.player.equippedTalents || []).length}/${MAX_TALENT_EQUIPPED})</h4>`;
    const slotsDiv = document.createElement('div');
    slotsDiv.className = 'talent-slots-row';
    
    // Ensure array exists
    if(!Game.player.equippedTalents) Game.player.equippedTalents = [];

    for(let i=0; i<MAX_TALENT_EQUIPPED; i++) {
        const slot = document.createElement('div');
        slot.className = 'talent-slot empty';
        const tId = Game.player.equippedTalents[i];
        
        if (tId) {
            const tData = talentDatabase[tId];
            slot.classList.remove('empty');
            slot.className = `talent-slot filled tier-${tData.tier.toLowerCase()}`;
            slot.innerHTML = `<span class="t-icon">${tData.icon}</span>`;
            slot.onclick = () => { toggleTalentEquip(tId); }; // Unequip
            slot.title = `${tData.name}: ${tData.description} (Click para quitar)`;
        } else {
            slot.innerHTML = `<span>+</span>`;
        }
        slotsDiv.appendChild(slot);
    }
    equippedContainer.appendChild(slotsDiv);
    grid.appendChild(equippedContainer);

    // 3. Inventory Grid
    const invTitle = document.createElement('h4');
    invTitle.textContent = "Talentos Desbloqueados";
    invTitle.style.marginTop = "20px";
    invTitle.style.borderBottom = "1px solid #333";
    grid.appendChild(invTitle);

    const talentGrid = document.createElement('div');
    talentGrid.className = 'skills-grid'; // Reuse grid style
    
    if(!Game.player.unlockedTalents) Game.player.unlockedTalents = [];
    
    // Sort talents by Tier rarity
    const rarityVal = { 'Transcendent': 4, 'Ascendant': 3, 'Awakened': 2, 'Latent': 1 };
    const sortedTalents = [...Game.player.unlockedTalents].sort((a,b) => {
        return rarityVal[talentDatabase[b].tier] - rarityVal[talentDatabase[a].tier];
    });

    sortedTalents.forEach(tId => {
        const data = talentDatabase[tId];
        const isEquipped = Game.player.equippedTalents.includes(tId);
        const tierClass = data.tier.toLowerCase();
        
        const card = document.createElement('div');
        card.className = `skill-card talent-card tier-${tierClass} ${isEquipped ? 'equipped' : ''}`;
        
        // Updated Structure for better styling
        card.innerHTML = `
            ${isEquipped ? '<div class="equipped-badge-text">ACTIVO</div>' : ''}
            <div class="skill-icon-frame tier-frame-${tierClass}" style="border-radius:50%;">${data.icon}</div>
            <div class="skill-info">
                <div class="talent-header">
                    <h3>${data.name}</h3>
                    <span class="talent-tier-badge tier-${tierClass}">${translateTier(data.tier)}</span>
                </div>
                <p>${data.description}</p>
            </div>
            <div class="skill-actions">
                ${!isEquipped 
                    ? `<button class="skill-btn equip" onclick="window.toggleTalentEquip('${tId}')">Equipar</button>` 
                    : `<button class="skill-btn unequip" onclick="window.toggleTalentEquip('${tId}')">Quitar</button>`
                }
            </div>
        `;
        talentGrid.appendChild(card);
    });
    
    if (sortedTalents.length === 0) {
        talentGrid.innerHTML = '<p style="padding:20px; opacity:0.6;">Aún no has despertado ningún talento.</p>';
    }

    grid.appendChild(talentGrid);
}

function handleTalentRoll() {
    const btn = document.getElementById('btn-roll-talent');
    btn.disabled = true;
    btn.textContent = "🌀 Despertando...";
    
    // Animation fake
    setTimeout(() => {
        const result = rollTalent();
        
        if (result) {
            if (result.result === 'new') {
                showNotification(`¡Talento Despertado! [${translateTier(result.talent.tier)}] ${result.talent.name}`, 'success', 5000);
            } else {
                showNotification(`Duplicado: ${result.talent.name}. +${result.refund} SP reembolsados.`, 'default');
            }
            renderTalentsUI();
        } else {
            btn.disabled = false;
            btn.textContent = "Despertar (5 SP)";
        }
    }, 800);
}

window.toggleTalentEquip = function(id) {
    if (!Game.player.equippedTalents) Game.player.equippedTalents = [];
    
    const idx = Game.player.equippedTalents.indexOf(id);
    
    if (idx !== -1) {
        // Unequip
        Game.player.equippedTalents.splice(idx, 1);
        showNotification("Talento desactivado.", "default");
    } else {
        // Equip
        if (Game.player.equippedTalents.length >= MAX_TALENT_EQUIPPED) {
            showNotification(`Máximo ${MAX_TALENT_EQUIPPED} talentos activos.`, "error");
            return;
        }
        Game.player.equippedTalents.push(id);
        showNotification("Talento activado.", "success");
    }
    
    calculateEffectiveStats(); // Update stats immediately
    updatePlayerHUD();
    renderTalentsUI();
};

function translateTier(tier) {
    const map = {
        'Latent': 'Latente',
        'Awakened': 'Despierto',
        'Ascendant': 'Ascendente',
        'Transcendent': 'Trascendente'
    };
    return map[tier] || tier;
}

function checkRequirements(skillId) {
    const data = skillDatabase[skillId];
    if (data.levelReq && Game.player.level < data.levelReq) return false;
    if (data.reqSkill && !Game.player.unlockedSkills[data.reqSkill]) return false;
    return true;
}

window.upgradeSkill = function(id, cost) {
    if (Game.player.skillPoints >= cost) {
        Game.player.skillPoints -= cost;
        Game.player.unlockedSkills[id] = (Game.player.unlockedSkills[id] || 0) + 1;
        showNotification(`¡Habilidad mejorada!`, 'success');
        renderSkillsGrid();
    } else {
        showNotification('SP insuficientes.', 'error');
    }
};

window.toggleSkillEquip = function(id) {
    if (!Game.player.equippedSkills) Game.player.equippedSkills = [];
    
    const idx = Game.player.equippedSkills.indexOf(id);
    if (idx !== -1) {
        Game.player.equippedSkills.splice(idx, 1);
        showNotification("Habilidad desequipada.", "default");
    } else {
        if (Game.player.equippedSkills.length >= MAX_SKILL_EQUIPPED) {
            showNotification(`Máximo ${MAX_SKILL_EQUIPPED} habilidades activas.`, "error");
            return;
        }
        Game.player.equippedSkills.push(id);
        showNotification("Habilidad equipada.", "success");
    }
    renderSkillsGrid();
};
