
import { showNotification } from '../utils/helpers.js';
import { Game } from '../state/gameState.js';
import { skillData, passiveSkillData } from '../data/skills.js';

// Wiki Content
export function renderWikiContent() {
    const charGrid = document.getElementById('characters-grid-display');
    if(charGrid) charGrid.innerHTML = `
        <div class="card"><div class="card-avatar">⚫</div><h3 class="card-name">Kirito</h3><p>El Espadachín Negro.</p></div>
        <div class="card"><div class="card-avatar">✨</div><h3 class="card-name">Asuna</h3><p>Destello Veloz.</p></div>
        <div class="card"><div class="card-avatar">🔥</div><h3 class="card-name">Klein</h3><p>Líder de Fuurinkazan.</p></div>
    `;
    
    document.querySelectorAll('.card').forEach(c => {
        c.addEventListener('click', () => {
             document.getElementById('modal-body-content').innerHTML = `<h2>${c.querySelector('h3').textContent}</h2><p>Información detallada...</p>`;
             document.getElementById('infoModal').style.display = 'block';
        });
    });
}

// Stats Modal - Exact Layout Restoration
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
