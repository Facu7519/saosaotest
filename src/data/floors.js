
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
            skills: [
                { id: 'boss_slam', name: 'Golpe de Hacha', damageMultiplier: 1.5, statusEffect: { type: 'stunned', duration: 1, chance: 0.3 } },
                { id: 'boss_guard_summon', name: 'Llamada de la Guardia', damageMultiplier: 2.2, statusEffect: { type: 'weakened', duration: 3, value: 0.2 } }
            ]
        },
        shopItems: [
            { id: 'healing_potion_s', price: 20 },
            { id: 'mana_potion_s', price: 25 },
            { id: 'short_sword', price: 75 },
            { id: 'leather_jerkin', price: 60 },
            { id: 'wooden_buckler', price: 50 }
        ],
        blacksmithRecipes: ['wooden_buckler', 'short_sword', 'heavy_boots', 'kobold_dagger', 'reinforced_leather'],
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
            skills: [
                { id: 'boss_charge', name: 'Carga Bestial', damageMultiplier: 1.6, statusEffect: { type: 'bleeding', duration: 2, value: 0.1 } },
                { id: 'boss_quake', name: 'Terremoto de Pezuña', damageMultiplier: 2.5, statusEffect: { type: 'stunned', duration: 1, chance: 0.8 } }
            ]
        },
        shopItems: [
            { id: 'healing_potion_s', price: 20 },
            { id: 'healing_potion_m', price: 50 },
            { id: 'iron_sword', price: 200 },
            { id: 'chainmail_vest', price: 180 },
            { id: 'iron_kite_shield', price: 150 }
        ],
        blacksmithRecipes: ['iron_sword', 'chainmail_vest', 'iron_kite_shield', 'ring_of_strength'],
        unlocked: false
    },
    3: {
        name: "Bosque Serpenteante",
        monsters: [
            { id: 'serpiente_arborea_f3', name: "Serpiente Arbórea", hp: 120, attack: 20, defense: 7, exp: 50, col: 30, icon: '🐍', drops: { 'raw_hide': 0.4, 'antidote_herb': 0.3 } },
            { id: 'arana_cueva_f3', name: "Araña de Cueva", hp: 100, attack: 25, defense: 5, exp: 60, col: 35, icon: '🕷️', drops: { 'iron_ore': 0.3, 'kobold_fang': 0.1 } }
        ],
        boss: {
            id: 'nerius_reina_aracnida_f3',
            name: "Nerius la Reina Arácnida",
            hp: 900,
            attack: 35,
            defense: 12,
            exp: 500,
            col: 250,
            icon: '👑🕷️',
            drops: { 'blue_crystal': 0.2, 'steel_longsword': 0.05 },
            skills: [
                { id: 'poison_spit', name: 'Saliva Venenosa', damageMultiplier: 1.2, statusEffect: { type: 'poisoned', duration: 4, value: 0.08 } },
                { id: 'web_trap', name: 'Trampa de Seda Mortal', damageMultiplier: 2.0, statusEffect: { type: 'stunned', duration: 2, chance: 1.0 } }
            ]
        },
        shopItems: [
            { id: 'healing_potion_m', price: 48 },
            { id: 'mana_potion_m', price: 60 },
            { id: 'antidote_herb', price: 30 },
            { id: 'steel_longsword', price: 450 },
            { id: 'iron_plate_armor', price: 400 },
            { id: 'amulet_of_vitality', price: 250 }
        ],
        blacksmithRecipes: ['chainmail_vest','iron_plate_armor','ring_of_strength'],
        unlocked: false
    },
    4: {
        name: "Montañas Nevadas",
        monsters: [
            { id: 'yeti_menor_f4', name: "Yeti Menor", hp: 180, attack: 30, defense: 10, exp: 90, col: 50, icon: '🦍', drops: { 'raw_hide': 0.6, 'silver_ingot': 0.15 } },
            { id: 'lobo_hielo_f4', name: "Lobo de Hielo", hp: 150, attack: 35, defense: 8, exp: 100, col: 55, icon: '🐺❄️', drops: { 'kobold_fang': 0.2, 'blue_crystal': 0.05 } }
        ],
        boss: {
            id: 'krampus_rey_helado_f4',
            name: "Krampus el Rey Helado",
            hp: 1500,
            attack: 45,
            defense: 18,
            exp: 800,
            col: 400,
            icon: '👹❄️',
            drops: { 'blue_crystal': 0.4, 'obsidian_shard': 0.1 },
            skills: [
                { id: 'boss_blizzard', name: 'Ventisca Congelante', damageMultiplier: 1.3, statusEffect: { type: 'weakened', duration: 3, value: 0.2 } },
                { id: 'frozen_tomb', name: 'Tumba Helada Eterna', damageMultiplier: 2.8, statusEffect: { type: 'stunned', duration: 1, chance: 1.0 } }
            ]
        },
        shopItems: [
            { id: 'healing_potion_l', price: 100 },
            { id: 'mana_potion_m', price: 55 },
            { id: 'steel_tower_shield', price: 380 },
            { id: 'mage_pendant', price: 300 }
        ],
        blacksmithRecipes: ['iron_plate_armor','amulet_of_vitality'],
        unlocked: false
    },
    5: {
        name: "Mazmorra Olvidada",
        monsters: [
            { id: 'esqueleto_guerrero_f5', name: "Esqueleto Guerrero", hp: 220, attack: 40, defense: 15, exp: 150, col: 70, icon: '🦴', drops: { 'iron_ore': 0.5, 'obsidian_shard': 0.05 } },
            { id: 'fantasma_lloron_f5', name: "Fantasma Llorón", hp: 180, attack: 38, defense: 12, exp: 140, col: 65, icon: '👻', drops: { 'blue_crystal': 0.1, 'mana_potion_s': 0.2 } }
        ],
        boss: {
            id: 'lich_archimago_f5',
            name: "Lich Archimago",
            hp: 2200,
            attack: 55,
            defense: 22,
            exp: 1200,
            col: 600,
            icon: '💀🧙',
            drops: { 'obsidian_shard': 0.3, 'knight_armor': 0.03, 'divine_fragment': 0.01 },
            skills: [
                { id: 'boss_curse', name: 'Maldición Oscura', damageMultiplier: 1.0, statusEffect: { type: 'poisoned', duration: 5, value: 0.1 } },
                { id: 'soul_drain', name: 'Drenaje de Alma Masivo', damageMultiplier: 2.5, statusEffect: { type: 'weakened', duration: 4, value: 0.3 } }
            ]
        },
        shopItems: [
            { id: 'healing_potion_l', price: 95 },
            { id: 'knight_sword', price: 800 },
            { id: 'knight_armor', price: 750 }
        ],
        blacksmithRecipes: ['iron_plate_armor','knight_armor','ring_of_strength'],
        unlocked: false
    },
    6: {
        name: "Ciudad Flotante: Lyusula",
        monsters: [
            { id: 'guardia_automata_f6', name: "Guardia Autómata Defectuoso", hp: 300, attack: 50, defense: 25, exp: 250, col: 100, icon: '🤖', drops: { 'silver_ingot': 0.3, 'blue_crystal': 0.15 } },
            { id: 'quimera_escapada_f6', name: "Quimera Escapada", hp: 350, attack: 55, defense: 20, exp: 280, col: 120, icon: '🦁🦅🐍', drops: { 'raw_hide': 0.3, 'dragon_scale': 0.02 } }
        ],
        boss: {
            id: 'general_geociclope_f6',
            name: "General Geocíclope",
            hp: 3500,
            attack: 70,
            defense: 30,
            exp: 2000,
            col: 1000,
            icon: '👁️‍🗨️',
            drops: { 'dragon_scale': 0.12, 'divine_fragment': 0.025, 'elucidator_prototype': 0.02 },
            skills: [
                { id: 'boss_tremor', name: 'Temblor de Tierra', damageMultiplier: 1.6, statusEffect: { type: 'stunned', duration: 1, chance: 0.5 } },
                { id: 'eye_beam', name: 'Rayo Desintegrador', damageMultiplier: 3.0, statusEffect: { type: 'bleeding', duration: 3, value: 0.15 } }
            ]
        },
        shopItems: [
            { id: 'healing_potion_l', price: 90 },
            { id: 'mana_potion_m', price: 50 },
            { id: 'obsidian_shard', price: 1500, type: 'material' },
            { id: 'blue_crystal', price: 2500, type: 'material' }
        ],
        blacksmithRecipes: ['elucidator_prototype','lambent_light_replica','iron_plate_armor'],
        unlocked: false
    },
    7: {
        name: "Corazón del Laberinto",
        monsters: [
            { id: 'demonio_menor_f7', name: "Demonio Menor", hp: 400, attack: 60, defense: 28, exp: 350, col: 150, icon: '👿', drops: { 'obsidian_shard': 0.2, 'dragon_scale': 0.05 } },
            { id: 'guardian_ebano_f7', name: "Guardián de Ébano", hp: 500, attack: 65, defense: 35, exp: 400, col: 180, icon: '💂⚫', drops: { 'divine_fragment': 0.01, 'silver_ingot': 0.4 } }
        ],
        boss: {
            id: 'gleam_eyes_replica_f7',
            name: "The Gleam Eyes (Réplica)",
            hp: 5000,
            attack: 85,
            defense: 40,
            exp: 3000,
            col: 1500,
            icon: '🐐👹',
            drops: { 'divine_fragment': 0.06, 'dragon_scale': 0.22, 'elucidator': 0.008 },
            skills: [
                { id: 'boss_cleave', name: 'Tajo Brutal', damageMultiplier: 1.8, statusEffect: { type: 'bleeding', duration: 3, value: 0.12 } },
                { id: 'chaos_breath', name: 'Aliento del Caos', damageMultiplier: 3.5, statusEffect: { type: 'weakened', duration: 5, value: 0.5 } }
            ]
        },
        shopItems: [],
        blacksmithRecipes: ['elucidator','dark_repulser','lambent_light','heathcliff_shield','elucidator_prototype'],
        unlocked: false
    }
};
