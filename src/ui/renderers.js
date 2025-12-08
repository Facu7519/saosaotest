
import { showNotification } from '../utils/helpers.js';
import { Game } from '../state/gameState.js';
import { wikiCharacterData, wikiWeaponData, wikiFloorsData, wikiGuildsData } from '../data/wiki.js';

// Wiki Content
export function renderWikiContent() {
    const charGrid = document.getElementById('characters-grid-display');
    const weaponGrid = document.getElementById('weapons-grid-display');
    const floorInfo = document.getElementById('floors-info-container');
    const guildInfo = document.getElementById('guilds-info-container');

    if (charGrid) renderCardGrid(charGrid, wikiCharacterData, 'character');
    if (weaponGrid) renderCardGrid(weaponGrid, wikiWeaponData, 'weapon');
    if (floorInfo) renderCardGrid(floorInfo, wikiFloorsData, 'floor');
    if (guildInfo) renderCardGrid(guildInfo, wikiGuildsData, 'guild');
}

function renderCardGrid(container, dataObj, type) {
    container.innerHTML = '';
    
    // Add intro text for floors/guilds if needed
    if (type === 'floor') {
        container.innerHTML = `<p style="text-align:center; margin-bottom:2rem; width:100%;">Explora los diversos y peligrosos pisos del castillo flotante.</p>`;
    }

    const gridDiv = document.createElement('div');
    gridDiv.className = 'card-grid';

    Object.entries(dataObj).forEach(([key, data]) => {
        const card = document.createElement('div');
        card.className = 'card';
        card.setAttribute('role', 'button');
        card.tabIndex = 0;

        card.innerHTML = `
            <div class="${type === 'weapon' || type === 'floor' || type === 'guild' ? 'card-icon' : 'card-avatar'}">${data.icon}</div>
            <h3 class="card-name">${data.name}</h3>
            ${data.role ? `<p class="card-subtitle">${data.role}</p>` : ''}
            ${data.type ? `<p class="card-subtitle">${data.type}</p>` : ''}
            ${data.stats ? `<div class="weapon-stats"><span>${data.stats}</span></div>` : ''}
            <p class="card-description">${data.description}</p>
        `;

        card.addEventListener('click', () => {
            const content = document.getElementById('modal-body-content');
            content.innerHTML = `
                <span class="modal-icon">${data.icon}</span>
                <h2>${data.name}</h2>
                <p style="margin-bottom:1rem;">${data.description}</p>
                ${data.fullInfo ? `<p><strong>Detalles:</strong> ${data.fullInfo}</p>` : ''}
                ${data.details ? `<p><strong>Detalles:</strong> ${data.details}</p>` : ''}
            `;
            document.getElementById('infoModal').style.display = 'block';
        });

        gridDiv.appendChild(card);
    });
    
    container.appendChild(gridDiv);
}

// Stats Modal
export function renderPlayerStats() {
    const container = document.getElementById('stats-content-container');
    const p = Game.player;
    
    // Equip bonuses calculation
    let eqAtk = 0, eqDef = 0, eqHp = 0;
    for (const slot in p.equipment) {
        const it = p.equipment[slot];
        if (it && it.stats) {
            eqAtk += it.stats.attack || 0;
            eqDef += it.stats.defense || 0;
            eqHp += it.stats.hp || 0;
        }
    }

    container.innerHTML = `
        <div class="stats-category">
            <h3>Atributos Principales</h3>
            <div class="stat-line"><span class="stat-label">Nivel:</span> <span class="stat-value">${p.level}</span></div>
            <div class="stat-line"><span class="stat-label">HP:</span> <span class="stat-value">${p.hp} / ${p.maxHp}</span></div>
            <div class="stat-line"><span class="stat-label">MP:</span> <span class="stat-value">${p.mp} / ${p.maxMp}</span></div>
            <div class="stat-line"><span class="stat-label">EXP:</span> <span class="stat-value">${p.currentExp} / ${p.neededExp}</span></div>
            <div class="stat-line"><span class="stat-label">Col:</span> <span class="stat-value">${p.col}</span></div>
        </div>

        <div class="stats-category">
            <h3>Combate</h3>
            <div class="stat-line"><span class="stat-label">Ataque Base:</span> <span class="stat-value">${p.baseAttack}</span></div>
            <div class="stat-line"><span class="stat-label">Defensa Base:</span> <span class="stat-value">${p.baseDefense}</span></div>
            <div class="stat-line"><span class="stat-label">Ataque Equip.:</span> <span class="stat-value">${eqAtk}</span></div>
            <div class="stat-line"><span class="stat-label">Defensa Equip.:</span> <span class="stat-value">${eqDef}</span></div>
            <div class="stat-line"><span class="stat-label">HP Equip.:</span> <span class="stat-value">+${eqHp}</span></div>
            <hr style="border-color: rgba(70,130,180,0.3); margin: 0.5rem 0;">
            <div class="stat-line"><span class="stat-label"><strong>Ataque Total:</strong></span> <span class="stat-value"><strong>${p.effectiveAttack}</strong></span></div>
            <div class="stat-line"><span class="stat-label"><strong>Defensa Total:</strong></span> <span class="stat-value"><strong>${p.effectiveDefense}</strong></span></div>
        </div>

        <div class="stats-category">
            <h3>Habilidades Aprendidas</h3>
            <ul style="list-style-type: '❖ '; padding-left: 20px;">
                ${p.skills.length > 0 
                    ? p.skills.map(s => `<li>${s.name} (${s.mpCost} MP)</li>`).join('') 
                    : '<li>Ninguna</li>'}
            </ul>
        </div>

        <div class="stats-category">
            <h3>Habilidades Pasivas</h3>
            <ul style="list-style-type: '🌟 '; padding-left: 20px;">
                ${p.passiveSkills.length > 0 
                    ? p.passiveSkills.map(s => `<li>${s.name}</li>`).join('') 
                    : '<li>Ninguna</li>'}
            </ul>
        </div>
    `;
}
