
# ⚔️ SAO: Aincrad Chronicles (Modular)

Bienvenido a **Sword Art Online: Aincrad Chronicles**, un RPG de texto y gestión basado en navegador, construido con una arquitectura moderna de JavaScript (ES Modules).

Este proyecto simula la experiencia de subir los 100 pisos de Aincrad, gestionar tu equipamiento, combatir monstruos, forjar armas legendarias y desbloquear habilidades únicas.

---

## 🎮 Guía para Jugadores

### 🚀 Cómo Empezar
Este juego utiliza **Módulos ES6** modernos. Por políticas de seguridad de los navegadores (CORS), **no funcionará si abres el archivo `index.html` directamente**.

**Debes usar un Servidor Web Local:**

1.  **Opción Recomendada (VS Code)**:
    *   Instala la extensión **Live Server**.
    *   Haz clic derecho en `index.html` y selecciona **"Open with Live Server"**.
2.  **Opción Terminal (Python)**:
    *   Abre una terminal en la carpeta del proyecto.
    *   Ejecuta: `python -m http.server` (o `python3 -m http.server`).
    *   Abre tu navegador en `http://localhost:8000`.

### 🕹️ Controles y Mecánicas
*   **Progresión**: Tu objetivo es subir de piso. Derrota al **Jefe del Piso** actual para desbloquear el siguiente.
*   **Combate**:
    *   **Atacar**: Ataque físico estándar. Genera "Hits" para el contador de combo.
    *   **Habilidades**: Técnicas especiales que consumen MP.
        *   *Nota*: Habilidades poderosas como "Starburst Stream" requieren desbloquear primero la habilidad pasiva **Doble Empuñadura** en el árbol de habilidades.
    *   **Pociones**: Recupera HP/MP en mitad de la batalla.
*   **Herrería y Tiendas**:
    *   Los monstruos sueltan materiales (como *Mena de Hierro* o *Cristales*).
    *   Ve a la **Herrería** para **Forjar** armas nuevas o **Mejorar** tu equipo actual (+1, +2, etc.).
*   **Doble Empuñadura (Dual Wield)**:
    *   Esta es una **Habilidad Única**. Al desbloquearla con SP, tu inventario mostrará un nuevo espacio de equipo: **Mano Izquierda (Dual)**.
    *   Esto te permite equipar dos espadas a la vez, sumando el ataque de ambas, pero te impide usar escudos.

---

## 👨‍💻 Guía para Desarrolladores

El proyecto está modularizado para facilitar la expansión. La lógica está separada de los datos.

### 📂 Estructura del Proyecto

```text
/
├── css/                  # Estilos visuales (Juego, Wiki, Scrollbars)
├── src/
│   ├── data/             # BASES DE DATOS (Aquí es donde agregas contenido)
│   │   ├── items.js      # Armas, armaduras, consumibles y recetas
│   │   ├── mobs.js       # Datos de Pisos, Monstruos y Jefes (exporta floorData)
│   │   ├── skills.js     # Definición de habilidades (activas/pasivas)
│   │   └── wiki.js       # Texto para la sección de enciclopedia
│   ├── logic/            # Lógica del juego (Combate, Stats, Crafting)
│   ├── state/            # Estado global (gameState.js)
│   ├── ui/               # Renderizado del DOM (HUD, Modales)
│   └── main.js           # Inicialización y Event Listeners
└── index.html            # Estructura HTML principal
```

### 🛠️ Cómo agregar contenido nuevo

#### 1. Crear un Nuevo Ítem
Edita `src/data/items.js` y agrega una entrada en `baseItems`.

```javascript
'nombre_id_unico': {
    name: 'Nombre del Ítem',
    icon: '🗡️', // Emoji o HTML SVG
    type: 'weapon', // weapon, shield, armor, accessory, consumable, material
    slot: 'weapon', // Slot de equipo
    stats: { attack: 100, hp: 50 },
    rarity: 'Epic', // Common, Rare, Epic, Mythic (Define el color del borde)
    levelReq: 10,
    description: "Descripción para el tooltip."
}
```

#### 2. Crear un Nuevo Monstruo o Piso
Edita `src/data/mobs.js`. Aunque el archivo se llama `mobs.js`, exporta el objeto `floorData` que contiene la estructura del mundo.

```javascript
10: { // ID del Piso
    name: "Piso 10: Campos de Mil Flores",
    monsters: [
        {
            id: 'monster_id',
            name: "Samurái Fantasma",
            hp: 800,
            attack: 65,
            defense: 20,
            exp: 300,
            col: 100,
            icon: '👹',
            drops: { 'raw_hide': 0.5, 'rare_sword_id': 0.05 } // ID del ítem : Probabilidad (0-1)
        }
    ],
    boss: { ... }, // Misma estructura que un monstruo, type 'boss' se agrega auto
    shopItems: [ { id: 'healing_potion_l', price: 200 } ],
    blacksmithRecipes: ['rare_sword_id'], // IDs de recetas disponibles en este piso
    unlocked: false
}
```

#### 3. Agregar una Receta de Herrería
Edita `src/data/items.js` en la sección `blacksmithRecipes`.

```javascript
'item_result_id': {
    itemId: 'item_result_id', // Debe existir en baseItems
    materials: { 'iron_ore': 10, 'dragon_scale': 1 }, // IDs de materiales
    cost: 5000,
    levelReq: 15,
    chance: 0.8 // 80% probabilidad de éxito
}
```

#### 4. Crear una Habilidad (Skill)
Edita `src/data/skills.js`.

```javascript
'skill_id': {
    name: 'Golpe Meteoro',
    type: 'active', // 'active' o 'passive'
    category: 'sword_skills', // sword_skills, unique_skills, passive_skills
    mpCost: 50,
    hits: 1, // Golpes visuales y para combo
    animClass: 'anim-starburst', // Clase CSS para la animación (ver style-game.css)
    baseDamagePct: 2.5, // 250% del ataque base
    growthPct: 0.1, // +10% daño por nivel de habilidad
    maxLevel: 10
}
```

### 🎨 Estilos y Animaciones
Las animaciones de combate se definen en `css/style-game.css`.
Si agregas una nueva `animClass` a una habilidad, asegúrate de definir los `@keyframes` correspondientes en el CSS.

### ⚠️ Notas Técnicas
*   **Estado**: `Game.player` en `src/state/gameState.js` contiene todo el progreso. Se guarda en `localStorage`.
*   **Admin**: Existe un panel de administrador oculto. Busca la lógica en `src/logic/adminLogic.js` para ver cómo acceder o modificar la clave.
