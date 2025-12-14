export const wikiCharacterData = { 
    kirito: { name: 'Kirito (黒の剣士)', role: 'Espadachín Solitario / Beater', icon: '⚫', description: 'Kazuto Kirigaya, conocido como Kirito, es el protagonista principal. Es un jugador solitario que prefiere luchar en la vanguardia. Posee la habilidad única de "Doble Empuñadura".', fullInfo: 'Más detalles sobre sus batallas, relaciones y crecimiento como personaje...'},
    asuna: { name: 'Asuna (閃光)', role: 'Destello Veloz / Subcomandante KoB', icon: '✨', description: 'Asuna Yuuki, conocida por su velocidad y habilidad con el estoque como "Destello Veloz". Es la subcomandante de los Caballeros de la Sangre (KoB).', fullInfo: 'Su desarrollo desde una jugadora enfocada hasta una compañera leal y poderosa...'},
    klein: { name: 'Klein (クライン)', role: 'Líder de Fuurinkazan', icon: '🔥', description: 'Ryotaro Tsuboi, o Klein, es uno de los primeros amigos de Kirito en SAO. Es un líder carismático y leal de su gremio, Fuurinkazan.', fullInfo: 'Sus aventuras junto a su gremio y su inquebrantable amistad con Kirito...'},
    agil: { name: 'Agil (エギル)', role: 'Mercader / Luchador con Hacha', icon: '💪', description: 'Andrew Gilbert Mills, conocido como Agil, es un mercader afroamericano y un hábil luchador con hacha. Es dueño de una tienda en Algade (Piso 50).', fullInfo: 'Su papel como mercader justo y guerrero confiable en la comunidad de SAO...'},
    lisbeth: { name: 'Lisbeth (リズベット)', role: 'Herrera / Domadora de Mazas', icon: '🛠️', description: 'Rika Shinozaki, o Lisbeth, es una talentosa herrera y amiga cercana de Asuna. Es conocida por su habilidad para forjar armas de alta calidad.', fullInfo: 'Sus desafíos como herrera, su aventura para encontrar un metal raro y su amistad...'},
    silica: { name: 'Silica (シリカ)', role: 'Domadora de Bestias', icon: '🐉', description: 'Keiko Ayano, o Silica, es una joven jugadora de nivel medio conocida como "Domadora de Bestias" por su compañero dragón de plumas, Pina.', fullInfo: 'Su encuentro con Kirito, la pérdida y recuperación de Pina...'},
    heathcliff: { name: 'Heathcliff (ヒースクリフ)', role: 'Líder de los KoB / ¿?', icon: '🛡️✝️', description: 'El comandante de los Caballeros de la Sangre. Conocido por su increíble defensa con su set de espada y escudo único. Su verdadera identidad es un misterio.', fullInfo: 'Su liderazgo, sus habilidades legendarias y la impactante verdad...'}
};

export const wikiWeaponData = { 
    elucidator: { name: 'Elucidator', type: 'Espada Recta', icon: '⚫', stats: "ATK: 700-710", description: 'Una espada demoníaca obtenida como drop de un jefe de piso. Es el arma principal de Kirito.', fullInfo: 'Forjada de un cristal de alta densidad...'},
    dark_repulser: { name: 'Dark Repulser', type: 'Espada Recta', icon: '🟢', stats: "ATK: 680-700", description: 'Forjada por Lisbeth usando un lingote de Crystallite. Es la segunda espada de Kirito.', fullInfo: 'Su creación fue una aventura peligrosa...'},
    lambent_light: { name: 'Lambent Light', type: 'Estoque', icon: '✨', stats: "VEL: +50, ATK: 650", description: 'El estoque personal de Asuna, conocido por su increíble velocidad de ataque.', fullInfo: 'Un arma ligera pero poderosa...'},
    anneal_blade: { name: 'Anneal Blade', type: 'Espada Recta', icon: '🗡️', stats: "ATK: +8", description: 'La primera espada decente que Kirito obtiene y mejora.', fullInfo: 'Un ejemplo de cómo los jugadores mejoraban su equipo...'},
    liberator: { name: 'Liberator', type: 'Escudo y Espada', icon: '🛡️⚔️', description: 'El set de arma y escudo único de Heathcliff.', fullInfo: 'Este equipo es central para la identidad de Heathcliff...'}
};

export const wikiFloorsData = { 
    f1: {name: "Piso 1: Ciudad del Inicio", icon: '🏙️', description: "El punto de partida. Contiene la Ciudad de Inicio y vastas llanuras.", details: "Jefe: Illfang el Señor Kóbold."},
    f22: {name: "Piso 22: Coral", icon: '🌲🏡', description: "Un piso tranquilo y boscoso con muchos lagos. Hogar de la cabaña de Kirito y Asuna.", details: "Zona de bajo nivel, ideal para pescar y descansar."},
    f50: {name: "Piso 50: Algade", icon: '🛍️', description: "Una ciudad importante con un gran mercado y la tienda de Agil.", details: "Centro neurálgico del comercio en Aincrad."},
    f74: {name: "Piso 74: Kamde", icon: '👹', description: "Un piso laberíntico. El jefe es The Gleam Eyes.", details: "Punto de inflexión donde se reveló la Doble Empuñadura."},
    f75: {name: "Piso 75: Collinia", icon: '💀', description: "La sala del jefe The Skull Reaper. Lugar de una batalla crucial.", details: "Donde se reveló la identidad de Heathcliff."},
    f100: {name: "Piso 100: Palacio de Rubí", icon: '👑', description: "El piso final de Aincrad.", details: "El objetivo final para completar el juego."}
};

export const wikiGuildsData = { 
    kob: {name: "Caballeros de la Sangre", icon: '🛡️✝️', description: "El gremio más poderoso, comandado por Heathcliff.", details: "Líderes de la línea del frente."},
    lc: {name: "Ataúd Risueño", icon: '💀', description: "Un infame gremio de jugadores asesinos (PKers).", details: "Temidos por su crueldad y emboscadas."},
    fuurinkazan: {name: "Fuurinkazan", icon: '🔥', description: "Un gremio amigable liderado por Klein.", details: "Basado en la camaradería y el estilo samurái."},
    als: {name: "Armada de Liberación", icon: '🎖️', description: "Un gran gremio que intentó imponer orden.", details: "A menudo vistos como ineficientes o corruptos."}
};