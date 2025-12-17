
// Centralized Game State
export const Game = {
    player: {
        name: "", 
        level: 1,
        currentExp: 0,
        neededExp: 100,
        hp: 100,
        baseMaxHp: 100,
        mp: 50,
        baseMaxMp: 50,
        baseAttack: 5,
        baseDefense: 2,
        // Nuevas Estadísticas RNG
        baseCritChance: 0.05, // 5% base
        baseCritDamage: 1.5,  // 150% Damage on crit
        baseEvasion: 0.05,    // 5% base
        
        effectiveCrit: 0.05,
        effectiveCritDamage: 1.5,
        effectiveEvasion: 0.05,
        mpCostReduction: 0,   // Percentage (0.1 = 10%)
        expBonus: 0,          // Percentage

        col: 1000,
        currentFloor: 1,
        unlockedFloors: [1], 
        inventory: [],
        equipment: {
            weapon: null,
            weapon2: null, // New Dual Wield Slot
            shield: null,
            armor: null,
            accessory: null
        },
        effectiveAttack: 0,
        effectiveDefense: 0,
        maxHp: 0,
        maxMp: 0,
        
        // Revised Skill System
        unlockedSkills: {
            'sonic_leap': 1 // Default starting skill
        },
        equippedSkills: ['sonic_leap'], // IDs of skills active in combat (Max 4)
        skillPoints: 0,
        
        // Talent System (Awakening)
        unlockedTalents: [], // Array of IDs
        equippedTalents: [], // Max 3
        
        materials: {},
        activeStatusEffects: [], 
        lastCombatAction: null, 
        attackComboCount: 0, 
        isAdmin: false,
    },
    currentCombat: {
        active: false, 
        enemy: null, 
        isBoss: false, 
        playerTurn: true,
        turnCount: 0, 
        drops: [] // Store drops for victory screen
    },
    settings: {
        musicVolume: 0.3,
        sfxVolume: 0.7
    }
};

export const ADMIN_CONFIG = {
    // SHA-256 for 'linkstart' (example)
    HASH: '542238441123f9240bfe04c84f6cb8f521405d62ae85c5d4d43bb68c73298b6b',
    MAX_ATTEMPTS: 5,
    LOCKOUT_MS: 300000 // 5 mins
};
