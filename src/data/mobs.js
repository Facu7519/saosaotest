
export const floorData = {
    1: {
        name: "Bosque del Inicio",
        monsters: [
            { id: 'jabal_agresivo_f1', name: "Jabalí Agresivo", hp: 40, attack: 7, defense: 0, exp: 12, col: 10, icon: '🐗', drops: { 'raw_hide': 0.5 } },
            { id: 'lobo_frenetico_f1', name: "Lobo Frenético", hp: 60, attack: 10, defense: 2, exp: 18, col: 15, icon: '🐺', drops: { 'raw_hide': 0.7 } },
        ],
        boss: {
            id: 'illfang_kobold_lord_f1',
            name: "Illfang el Señor Kóbold",
            hp: 250,
            attack: 18,
            defense: 6,
            exp: 120,
            col: 70,
            icon: '👹',
            drops: { 'kobold_fang': 1.0, 'iron_ore': 0.3 },
            skills: [{ id: 'boss_slam', name: 'Golpe de Jefe', damageMultiplier: 1.5, statusEffect: { type: 'stunned', duration: 1, chance: 0.3 } }]
        },
        shopItems: [
            { id: 'healing_potion_s', price: 20 },
            { id: 'mana_potion_s', price: 25 },
            { id: 'short_sword', price: 75 },
            { id: 'leather_jerkin', price: 60 },
            { id: 'wooden_buckler', price: 50 }
        ],
        blacksmithRecipes: ['leather_jerkin','wooden_buckler'],
        unlocked: true
    },
    2: {
        name: "Praderas de Urbus",
        monsters: [
            { id: 'avispa_gigante_f2', name: "Avispa Gigante", hp: 70, attack: 15, defense: 4, exp: 28, col: 18, icon: '🐝', drops: { 'raw_hide': 0.2, 'iron_ore': 0.1 } },
            { id: 'planta_carnivora_f2', name: "Planta Carnívora", hp: 90, attack: 12, defense: 6, exp: 35, col: 22, icon: '🌿', drops: { 'healing_potion_s': 0.1, 'iron_ore': 0.2 } }
        ],
        boss: {
            id: 'asterios_tauro_plateado_f2',
            name: "Asterios el Tauro Plateado",
            hp: 550,
            attack: 28,
            defense: 10,
            exp: 280,
            col: 150,
            icon: '🐂',
            drops: { 'silver_ingot': 0.5, 'iron_sword': 0.1 },
            skills: [{ id: 'boss_charge', name: 'Carga Bestial', damageMultiplier: 1.8, statusEffect: { type: 'bleeding', duration: 2, value: 0.1 } }]
        },
        shopItems: [
            { id: 'healing_potion_s', price: 20 },
            { id: 'healing_potion_m', price: 50 },
            { id: 'iron_sword', price: 200 },
            { id: 'chainmail_vest', price: 180 },
            { id: 'iron_kite_shield', price: 150 }
        ],
        blacksmithRecipes: ['leather_jerkin','chainmail_vest','iron_kite_shield'],
        unlocked: false
    }
    // More floors can be added here following the pattern
};
