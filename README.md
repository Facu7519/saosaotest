
# ⚔️ SAO: Aincrad Chronicles (Modular)

Sistema RPG basado en la arquitectura Cardinal, modularizado para expansión infinita.

## 📜 Reglas de Oro del Código

Para mantener la integridad del sistema y evitar errores de `Uncaught TypeError`, debes seguir estas reglas estrictamente:

1.  **Extensiones de Archivo:** Todas las importaciones internas DEBEN terminar en `.js`. El navegador no resuelve archivos automáticamente sin extensión.
    *   ✅ `import { Game } from './state/gameState.js';`
    *   ❌ `import { Game } from './state/gameState';`

2.  **Rutas Relativas:** No uses prefijos `src/` o alias `@/`. Usa rutas relativas puras.
    *   ✅ `import { ... } from '../logic/playerLogic.js';`
    *   ❌ `import { ... } from 'src/logic/playerLogic.js';`

3.  **Estado Global:** Nunca definas variables de estado fuera de `state/gameState.js`. Si necesitas un dato nuevo (como `bossKills`), agrégalo al objeto `Game.player` allí.

4.  **Google GenAI:**
    *   Usa siempre `gemini-3-pro-preview` para tareas que requieran `thinkingBudget`.
    *   Usa `gemini-3-flash-preview` con `googleSearch` para consultas de información real o lore.
    *   Accede al texto mediante `.text`, nunca `.text()`.

## 📂 Estructura del Proyecto

*   `/data`: Objetos constantes (JSON). Pisos, items, enemigos.
*   `/logic`: Algoritmos puros. Combate, IA de Yui, cálculo de experiencia.
*   `/state`: El estado único de la aplicación.
*   `/ui`: Manipulación del DOM y renderizado de componentes.
*   `/utils`: Funciones de apoyo (notificaciones, generadores).

## 🚀 Cómo Expandir

Para agregar un nuevo piso:
1. Ve a `data/floors.js`.
2. Agrega una nueva entrada al objeto `floorData`.
3. El sistema lo detectará automáticamente en la lógica de navegación y combate.
