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
│   │   ├── floors.js     # Datos de Pisos, Monstruos y Jefes
│   │   ├── skills.js     # Definición de habilidades (activas/pasivas)
│   │   └── wiki.js       # Texto para la sección de enciclopedia
│   ├── logic/            # Lógica del juego (Combate, Stats, Crafting)
│   ├── state/            # Estado global (gameState.js)
│   ├── ui/               # Renderizado del DOM (HUD, Modales)
│   └── main.js           # Inicialización y Event Listeners
└── index.html            # Estructura HTML principal
```