export const skillDatabase = {
    // --- SWORD SKILLS (Active) ---
    'sonic_leap': {
        name: 'Salto Sónico',
        type: 'active',
        category: 'sword_skills',
        icon: '⚡',
        description: 'Una carga veloz que impacta con fuerza sónica.',
        animClass: 'anim-slash-sonic',
        baseDamagePct: 1.5, // 150% Attack
        growthPct: 0.2, // +20% per level
        mpCost: 10,
        mpGrowth: 2,
        maxLevel: 10,
        hits: 1
    },
    'horizontal_square': {
        name: 'Cuadrado Horizontal',
        type: 'active',
        category: 'sword_skills',
        icon: '🟦',
        description: 'Dibuja un cuadrado de luz, golpeando 4 veces.',
        animClass: 'anim-slash-square',
        baseDamagePct: 0.8, // Per hit (x4)
        growthPct: 0.1,
        mpCost: 25,
        mpGrowth: 3,
        maxLevel: 10,
        hits: 4
    },
    'vorpal_strike': {
        name: 'Golpe Vorpal',
        type: 'active',
        category: 'sword_skills',
        icon: '👹',
        description: 'Un estocada pesada con inmenso poder destructivo.',
        animClass: 'anim-vorpal-thrust',
        baseDamagePct: 3.0, 
        growthPct: 0.4,
        mpCost: 40,
        mpGrowth: 5,
        maxLevel: 5,
        hits: 1,
        levelReq: 10
    },

    // --- UNIQUE / DUAL WIELD SKILLS ---
    'dual_wield': {
        name: 'Doble Empuñadura',
        type: 'passive',
        category: 'unique_skills',
        icon: '⚔️',
        description: 'Habilidad Única. Permite usar Habilidades de Doble Espada.',
        maxLevel: 1,
        unlockReq: { type: 'level', value: 20 }, // Hard requirement
        cost: 10 // SP Cost to unlock
    },
    'starburst_stream': {
        name: 'Starburst Stream',
        type: 'active',
        category: 'unique_skills',
        icon: '✨',
        description: 'Combo legendario de 16 golpes. Requiere Doble Empuñadura.',
        animClass: 'anim-starburst',
        baseDamagePct: 0.6, // x16 hits = 960% base
        growthPct: 0.05,
        mpCost: 120,
        mpGrowth: 10,
        maxLevel: 5,
        hits: 16,
        reqSkill: 'dual_wield'
    },
    'the_eclipse': {
        name: 'El Eclipse',
        type: 'active',
        category: 'unique_skills',
        icon: '🌑',
        description: 'El combo definitivo de 27 golpes que envuelve al enemigo.',
        animClass: 'anim-eclipse',
        baseDamagePct: 0.7, // x27 hits
        growthPct: 0.05,
        mpCost: 200,
        mpGrowth: 20,
        maxLevel: 5,
        hits: 27,
        reqSkill: 'dual_wield',
        levelReq: 50
    },

    // --- PASSIVE / UTILITY ---
    'battle_healing': {
        name: 'Curación de Batalla',
        type: 'passive',
        category: 'passive_skills',
        icon: '💚',
        description: 'Regenera HP automáticamente cada turno.',
        baseEffect: 10, // +10 HP
        growthEffect: 10,
        maxLevel: 10,
        cost: 2 // SP
    },
    'fighting_spirit': {
        name: 'Espíritu de Lucha',
        type: 'passive',
        category: 'passive_skills',
        icon: '🔥',
        description: 'Aumenta el Ataque base porcentualmente.',
        baseEffect: 0.05, // +5%
        growthEffect: 0.02,
        maxLevel: 10,
        cost: 3
    }
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