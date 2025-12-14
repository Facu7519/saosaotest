export const baseItems = {
    // Consumibles
    'healing_potion_s': { name: 'Poción Vida (P)', icon: '🧪', type: 'consumable', effect: { hp: 50 }, description: "Restaura 50 HP."},
    'healing_potion_m': { name: 'Poción Vida (M)', icon: '🧪', type: 'consumable', effect: { hp: 120 }, description: "Restaura 120 HP." },
    'healing_potion_l': { name: 'Poción Vida (G)', icon: '🧪', type: 'consumable', effect: { hp: 300 }, description: "Restaura 300 HP." },
    'mana_potion_s': { name: 'Poción Maná (P)', icon: '💧', type: 'consumable', effect: { mp: 30 }, description: "Restaura 30 MP." },
    'mana_potion_m': { name: 'Poción Maná (M)', icon: '💧', type: 'consumable', effect: { mp: 75 }, description: "Restaura 75 MP." },
    'antidote_herb': { name: 'Hierba Antídoto', icon: '🌿', type: 'consumable', effect: { cure: 'poison' }, description: "Cura el veneno." },
    
    // Armas
    'basic_sword': { name: 'Espada Básica', icon: '🗡️', type: 'weapon', slot: 'weapon', stats: { attack: 5 }, levelReq: 1, description: "Una espada simple.", rarity: 'Common', sockets: 0 },
    'short_sword': { name: 'Espada Corta', icon: '🗡️', type: 'weapon', slot: 'weapon', stats: { attack: 8 }, levelReq: 2, description: "Un poco mejor que la básica." },
    'iron_sword': { name: 'Espada de Hierro', icon: '🗡️', type: 'weapon', slot: 'weapon', stats: { attack: 15 }, levelReq: 5, description: "Hoja de hierro confiable.", rarity: 'Common', sockets: 0 },
    'steel_longsword': { name: 'Mandoble de Acero', icon: '⚔️', type: 'weapon', slot: 'weapon', stats: { attack: 25, defense: 2 }, levelReq: 10, description: "Una espada larga y robusta.", rarity: 'Rare', sockets: 1 },
    'knight_sword': { name: 'Espada de Caballero', icon: '⚔️', type: 'weapon', slot: 'weapon', stats: { attack: 35, defense: 5 }, levelReq: 15, description: "Arma estándar de caballero." },
    
    // Armas Raras/Legendarias
    'elucidator_prototype': { name: 'Prototipo Elucidator', icon: '⚫', type: 'weapon', slot: 'weapon', stats: { attack: 50, hp: 20 }, levelReq: 25, description: "Un intento de replicar una leyenda.", rarity: 'Rare', sockets: 1 },
    'lambent_light_replica': { name: 'Réplica Luz Lambent', icon: '✨', type: 'weapon', slot: 'weapon', stats: { attack: 45, mp: 15 }, levelReq: 25, description: "Imita la velocidad de la famosa estoque.", rarity: 'Rare', sockets: 1 },
    'elucidator': { name: 'Elucidator', icon: '⚫', type: 'weapon', slot: 'weapon', stats: { attack: 150, hp: 100 }, levelReq: 50, description: "Espada negra legendaria, forjada de un cristal de alta densidad.", rarity: 'Mythic', sockets: 2 },
    'dark_repulser': { name: 'Dark Repulser', icon: '🟢', type: 'weapon', slot: 'weapon', stats: { attack: 140, defense: 20 }, levelReq: 50, description: "Espada verde cristalina, forjada por Lisbeth con un lingote de Crystallite.", rarity: 'Mythic', sockets: 2 },
    'lambent_light': { name: 'Lambent Light', icon: '✨', type: 'weapon', slot: 'weapon', stats: { attack: 130, mp: 50 }, levelReq: 48, description: "Estoque de Asuna, increíblemente rápido y preciso.", rarity: 'Epic', sockets: 1 },
    
    // Escudos
    'wooden_buckler': { name: 'Broquel de Madera', icon: '🛡️', type: 'shield', slot: 'shield', stats: { defense: 3 }, levelReq: 1, description: "Un escudo pequeño y ligero." },
    'iron_kite_shield': { name: 'Escudo Cometa Hierro', icon: '🛡️', type: 'shield', slot: 'shield', stats: { defense: 8, hp: 15 }, levelReq: 6, description: "Defensa de hierro sólida." },
    'steel_tower_shield': { name: 'Escudo Torre Acero', icon: '🛡️', type: 'shield', slot: 'shield', stats: { defense: 15, hp: 30 }, levelReq: 12, description: "Gran protección, algo pesado." },
    'heathcliff_shield': { name: 'Escudo de Heathcliff', icon: '🛡️', type: 'shield', slot: 'shield', stats: { defense: 100, hp: 200 }, levelReq: 60, description: "El escudo inamovible del líder de los KoB.", rarity: 'Mythic', sockets: 2 },

    // Armaduras
    'leather_jerkin': { name: 'Coraza de Cuero', icon: '👕', type: 'armor', slot: 'armor', stats: { defense: 3, hp: 10 }, levelReq: 1, description: "Protección básica." },
    'chainmail_vest': { name: 'Cota de Mallas', icon: '🧥', type: 'armor', slot: 'armor', stats: { defense: 8, hp: 25 }, levelReq: 4, description: "Buena defensa contra cortes." },
    'iron_plate_armor': { name: 'Armadura Placas Hierro', icon: '鎧', type: 'armor', slot: 'armor', stats: { defense: 18, hp: 50 }, levelReq: 9, description: "Pesada pero muy protectora." },
    'knight_armor': { name: 'Armadura de Caballero', icon: '鎧', type: 'armor', slot: 'armor', stats: { defense: 28, hp: 70 }, levelReq: 16, description: "Armadura completa de caballero." },
    
    // Accesorios
    'ring_of_strength': { name: 'Anillo de Fuerza', icon: '💍', type: 'accessory', slot: 'accessory', stats: { attack: 3 }, levelReq: 3, description: "Aumenta ligeramente el ataque." },
    'amulet_of_vitality': { name: 'Amuleto Vitalidad', icon: '💠', type: 'accessory', slot: 'accessory', stats: { hp: 25 }, levelReq: 5, description: "Incrementa los puntos de vida." },
    'mage_pendant': { name: 'Colgante de Mago', icon: '🔮', type: 'accessory', slot: 'accessory', stats: { mp: 20 }, levelReq: 8, description: "Aumenta la reserva de maná." },
    
    // Materiales
    'raw_hide': { name: 'Cuero Crudo', icon: '🟤', type: 'material', description: "Material de forja básico."},
    'iron_ore': { name: 'Mena de Hierro', icon: '🔩', type: 'material', description: "Material de forja común."},
    'kobold_fang': { name: 'Colmillo de Kóbold', icon: '🦷', type: 'material', description: "Material de monstruo."},
    'silver_ingot': { name: 'Lingote de Plata', icon: '🥈', type: 'material', description: "Metal precioso para forja."},
    'blue_crystal': { name: 'Cristal Azul', icon: '💎', type: 'material', description: "Cristal imbuido de energía."},
    'obsidian_shard': { name: 'Esquirla de Obsidiana', icon: '🌑', type: 'material', description: "Fragmento de roca volcánica."},
    'dragon_scale': { name: 'Escama de Dragón', icon: '🐉', type: 'material', description: "Material raro y resistente."},
    'divine_fragment': { name: 'Fragmento Divino', icon: '🌟', type: 'material', description: "Material legendario, casi imposible de encontrar."}
};

export const blacksmithRecipes = {
    'elucidator_prototype': { itemId: 'elucidator_prototype', materials: { 'iron_ore': 20, 'obsidian_shard': 5, 'blue_crystal': 2 }, cost: 5000, levelReq: 20, chance: 0.60 },
    'lambent_light_replica': { itemId: 'lambent_light_replica', materials: { 'silver_ingot': 15, 'blue_crystal': 5 }, cost: 4500, levelReq: 20, chance: 0.65 },
    'elucidator': { itemId: 'elucidator', materials: { 'obsidian_shard': 25, 'dragon_scale': 3, 'divine_fragment': 1 }, cost: 50000, levelReq: 45, chance: 0.15 },
    'dark_repulser': { itemId: 'dark_repulser', materials: { 'blue_crystal': 30, 'dragon_scale': 2, 'divine_fragment': 1 }, cost: 48000, levelReq: 45, chance: 0.18 },
    'lambent_light': { itemId: 'lambent_light', materials: { 'silver_ingot': 50, 'blue_crystal': 15, 'divine_fragment': 1 }, cost: 45000, levelReq: 42, chance: 0.20 },
    'heathcliff_shield': { itemId: 'heathcliff_shield', materials: { 'iron_ore': 100, 'obsidian_shard': 20, 'dragon_scale': 5, 'divine_fragment': 2 }, cost: 75000, levelReq: 55, chance: 0.10 },
    
    // Low level
    'wooden_buckler': { itemId: 'wooden_buckler', materials: { 'raw_hide': 4, 'iron_ore': 2 }, cost: 80, levelReq: 1, chance: 0.95 },
    'iron_kite_shield': { itemId: 'iron_kite_shield', materials: { 'iron_ore': 12, 'raw_hide': 2 }, cost: 420, levelReq: 6, chance: 0.90 },
    'leather_jerkin': { itemId: 'leather_jerkin', materials: { 'raw_hide': 8 }, cost: 60, levelReq: 1, chance: 0.97 },
    'chainmail_vest': { itemId: 'chainmail_vest', materials: { 'iron_ore': 18, 'raw_hide': 4 }, cost: 300, levelReq: 4, chance: 0.85 },
    'iron_plate_armor': { itemId: 'iron_plate_armor', materials: { 'iron_ore': 40, 'silver_ingot': 4 }, cost: 1200, levelReq: 9, chance: 0.6 },
    'ring_of_strength': { itemId: 'ring_of_strength', materials: { 'silver_ingot': 2 }, cost: 150, levelReq: 3, chance: 0.92 },
    'amulet_of_vitality': { itemId: 'amulet_of_vitality', materials: { 'blue_crystal': 1, 'silver_ingot': 3 }, cost: 300, levelReq: 5, chance: 0.7 }
};