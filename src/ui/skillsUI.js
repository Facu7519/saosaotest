
import { Game } from '../state/gameState.js';
import { skillDatabase } from '../data/skills.js';
import { showNotification } from '../utils/helpers.js';

let currentCategory = 'sword_skills';

export function initSkillsUI() {
    // Tab Listeners
    document.querySelectorAll('.skill-tab').forEach(btn => {
        btn.addEventListener('click', (e) => {
            document.querySelectorAll('.skill-tab').forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');
            currentCategory = e.target.dataset.cat;
            renderSkillsGrid();
        });
    });
}

export function renderSkillsGrid() {
    const grid = document.getElementById('skills-grid-display');
    const spDisplay = document.getElementById('player-sp-display');
    if (!grid) return;

    grid.innerHTML = '';
    spDisplay.textContent = Game.player.skillPoints;

    Object.entries(skillDatabase).forEach(([id, data]) => {
        if (data.category !== currentCategory) return;

        const currentLevel = Game.player.unlockedSkills[id] || 0;
        const isUnlocked = currentLevel > 0;
        const canUnlock = !isUnlocked && checkRequirements(id);
        
        const card = document.createElement('div');
        card.className = `skill-card ${isUnlocked ? 'unlocked' : 'locked'} ${canUnlock ? 'purchasable' : ''}`;
        
        // Dynamic Cost Calculation
        const nextLevel = currentLevel + 1;
        const spCost = (data.cost || 1) + (currentLevel * 1); // Simple cost scaling
        const isMaxed = currentLevel >= data.maxLevel;

        let btnHtml = '';
        if (isMaxed) {
            btnHtml = `<button class="skill-btn maxed" disabled>MAX</button>`;
        } else if (isUnlocked) {
            const canAfford = Game.player.skillPoints >= spCost;
            btnHtml = `<button class="skill-btn upgrade" ${canAfford ? '' : 'disabled'} onclick="window.upgradeSkill('${id}', ${spCost})">Mejorar (${spCost} SP)</button>`;
        } else if (canUnlock) {
            const canAfford = Game.player.skillPoints >= (data.cost || 1);
            btnHtml = `<button class="skill-btn unlock" ${canAfford ? '' : 'disabled'} onclick="window.upgradeSkill('${id}', ${data.cost || 1})">Desbloquear (${data.cost || 1} SP)</button>`;
        } else {
             // Locked Reason
             let reqText = '';
             if (data.levelReq && Game.player.level < data.levelReq) reqText = `Req: LV ${data.levelReq}`;
             else if (data.reqSkill) reqText = `Req: ${skillDatabase[data.reqSkill].name}`;
             btnHtml = `<button class="skill-btn locked" disabled>Bloqueado (${reqText})</button>`;
        }

        // Stats Display
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
            <div class="skill-icon-frame">${data.icon}</div>
            <div class="skill-info">
                <h3>${data.name} <span class="skill-level">Lv.${currentLevel}/${data.maxLevel}</span></h3>
                <p>${data.description}</p>
                ${statsInfo}
            </div>
            <div class="skill-actions">
                ${btnHtml}
            </div>
        `;
        grid.appendChild(card);
    });
}

function checkRequirements(skillId) {
    const data = skillDatabase[skillId];
    if (data.levelReq && Game.player.level < data.levelReq) return false;
    if (data.reqSkill && !Game.player.unlockedSkills[data.reqSkill]) return false;
    return true;
}

// Global scope for HTML button access
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
