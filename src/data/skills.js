
export const skillData = {
    'quick_slash': { name: 'Corte Rápido', icon: '⚡', mpCost: 5, damageMultiplier: 1.2, type: 'attack', description: "Un ataque veloz que consume 5 MP." },
    'special_strike': { name: 'Golpe Especial', icon: '🔥', mpCost: 12, damageMultiplier: 1.8, type: 'attack', levelReq: 1, description: "Un ataque más poderoso que consume MP. Buen trade-off daño/MP." },
    'basic_guard': { name: 'Guardia Básica', icon: '🛡️', mpCost: 8, type: 'defensive', statusEffect: { type: 'protected', duration: 1, value: 0.4 }, levelReq: 1, description: "Reduce el daño recibido el siguiente turno en 40%. Coste: 8 MP." },
    'power_strike': { name: 'Golpe Poderoso', icon: '💥', mpCost: 15, damageMultiplier: 2.0, type: 'attack', levelReq: 5, description: "Un golpe devastador. Coste: 15 MP. Req LV: 5." },
    'heal_light': { name: 'Curación Ligera', icon: '➕', mpCost: 20, healAmount: 50, type: 'heal', levelReq: 3, description: "Restaura 50 HP. Coste: 20 MP. Req LV: 3." },
    'shield_bash': { name: 'Golpe de Escudo', icon: '🛡️', mpCost: 10, damageMultiplier: 0.8, stunChance: 0.3, type: 'utility', levelReq: 8, description: "Aturde al enemigo con el escudo. Coste: 10 MP. Req LV: 8." },
    'cross_slash': { name: 'Corte Cruzado', icon: '✖️', mpCost: 10, damageMultiplier: 1.5, type: 'attack', statusEffect: { type: 'bleeding', duration: 3, value: 0.05 }, levelReq: 10, description: "Un ataque cruzado que causa sangrado." },
    'piercing_thrust': { name: 'Estocada Perforadora', icon: '➡️', mpCost: 12, damageMultiplier: 1.8, ignoreDefPercent: 0.3, type: 'attack', levelReq: 12, description: "Ignora el 30% de la defensa." },
    'firm_defense': { name: 'Defensa Firme', icon: '🛡️', mpCost: 15, type: 'defensive', statusEffect: { type: 'protected', duration: 1, value: 0.5 }, target: 'player', levelReq: 7, description: "Reduce el daño recibido en un 50%." },
    'counterattack': { name: 'Contrataque', icon: '↩️', mpCost: 10, type: 'defensive', statusEffect: { type: 'counter', duration: 1, value: 0.5, damageReduction: 0.2 }, target: 'player', levelReq: 11, description: "Refleja 50% del daño." },
    'mana_shield': { name: 'Escudo de Maná', icon: '🔮', mpCost: 25, type: 'defensive', statusEffect: { type: 'mana_shield', duration: 2, value: 0.5 }, target: 'player', levelReq: 20, description: "Convierte daño en costo de MP." }
};

export const passiveSkillData = {
    'hp_regen_s': { name: 'Regeneración HP (P)', icon: '💚', effect: { hpRegen: 5 }, levelReq: 5, description: "Recupera 5 HP al final de cada turno." },
    'mp_efficiency_s': { name: 'Eficiencia MP (P)', icon: '💙', effect: { mpCostReduction: 0.1 }, levelReq: 8, description: "Reduce el costo de MP en un 10%." },
    'crit_chance_s': { name: 'Golpe Crítico (P)', icon: '🎯', effect: { critChance: 0.2 }, levelReq: 15, description: "Aumenta la prob. crítica en un 20%." },
};

export const statusEffects = {
    'poisoned': { name: 'Envenenado', icon: '🤢', color: '#8cff8c', description: 'Pierde HP cada turno.' },
    'stunned': { name: 'Aturdido', icon: '💫', color: '#ffff00', description: 'No puede actuar.' },
    'bleeding': { name: 'Sangrando', icon: '🩸', color: '#ff6666', description: 'Pierde HP por heridas.' },
    'weakened': { name: 'Debilitado', icon: '📉', color: '#87ceeb', description: 'Reduce el ataque.' },
    'strengthened': { name: 'Fortalecido', icon: '💪', color: '#ffd700', description: 'Aumenta el ataque.' },
    'protected': { name: 'Protegido', icon: '🛡️', color: '#add8e6', description: 'Reduce el daño recibido.' },
    'counter': { name: 'Contrataque', icon: '↩️', color: '#ff9933', description: 'Refleja daño.' },
    'mana_shield': { name: 'Escudo de Maná', icon: '🔮', color: '#9370db', description: 'Convierte daño en MP.' },
};
