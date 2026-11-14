/**
 * ==============================================================================
 * Bounce Kill - Multi-Map Arena System & Visual Themes (ArenaManager.js)
 * Manages map configurations and dark cyberpunk / brutalist visual themes:
 * - Theme 1: "Dark Cyber-Brutalism" (Heavy dark concrete, cyan/crimson neon conduits)
 * - Theme 2: "Neon Core / Industrial Ember" (Dark steel grating, glowing amber/crimson heat conduits)
 * - Theme 3: "Cyber Matrix Vault" (Deep obsidian surfaces, electric cyan vector lines, composite glass)
 * Supports automated map rotation, manual arena selection & cohesive dark aesthetics.
 * ==============================================================================
 */

import { Vector3 } from '../core/Math3D.js';

export const VISUAL_THEMES = [
    {
        id: 'cyber_brutalism',
        name: 'Dark Cyber-Brutalism',
        subtitle: 'THEME 01 // DARK BRUTALIST',
        tagline: 'Heavy dark concrete, obsidian reflective floors, glowing cyan & crimson neon conduits.',
        badgeColor: '#00F0FF',
        badgeBg: 'rgba(0, 240, 255, 0.15)',
        isLight: false,
        theme: {
            id: 'cyber_brutalism',
            fogColor: 0x05080c,
            fogDensity: 0.015,
            ambientColor: 0x141f2e,
            ambientIntensity: 0.55,
            dirLightColor: 0x00F0FF,
            dirLightIntensity: 0.95,
            dirLightPos: [15, 30, 15],
            accentLightColor: 0x0088FF,
            gridColor1: 0x00F0FF,
            gridColor2: 0x141f2b,
            floorColor: 0x0f141c,
            wallColor: 0x1d2530,
            pillarColor: 0x24303d,
            conduitColor: 0x00F0FF,
            grateColor: 0x242d38,
            glassColor: 0x88eeff,
            glassOpacity: 0.42,
            bloomThreshold: 0.32,
            bloomStrength: 1.25,
            exposure: 1.15
        }
    },
    {
        id: 'neon_core',
        name: 'Neon Core / Industrial Ember',
        subtitle: 'THEME 02 // INDUSTRIAL REACTOR',
        tagline: 'Dark slotted steel grating, glowing amber & crimson heat conduits, gritty industrial gloom.',
        badgeColor: '#FFAA00',
        badgeBg: 'rgba(255, 170, 0, 0.15)',
        isLight: false,
        theme: {
            id: 'neon_core',
            fogColor: 0x0a050d,
            fogDensity: 0.018,
            ambientColor: 0x22101e,
            ambientIntensity: 0.60,
            dirLightColor: 0xFFAA00,
            dirLightIntensity: 0.95,
            dirLightPos: [-15, 28, 15],
            accentLightColor: 0xFF0D47,
            gridColor1: 0xFFAA00,
            gridColor2: 0x241120,
            floorColor: 0x120c14,
            wallColor: 0x251824,
            pillarColor: 0x2b1c28,
            conduitColor: 0xFFAA00,
            grateColor: 0x2a1d28,
            glassColor: 0xffaa44,
            glassOpacity: 0.40,
            bloomThreshold: 0.35,
            bloomStrength: 1.30,
            exposure: 1.15
        }
    },
    {
        id: 'grid_matrix',
        name: 'Cyber Matrix Vault',
        subtitle: 'THEME 03 // VIRTUAL VECTOR MATRIX',
        tagline: 'Deep obsidian surfaces, electric cyan vector lines, glowing wireframe matrices & composite glass.',
        badgeColor: '#00FFFF',
        badgeBg: 'rgba(0, 255, 255, 0.2)',
        isLight: false,
        theme: {
            id: 'grid_matrix',
            fogColor: 0x040e16,
            fogDensity: 0.014,
            ambientColor: 0x0d2030,
            ambientIntensity: 0.65,
            dirLightColor: 0x00d8ff,
            dirLightIntensity: 1.10,
            dirLightPos: [0, 32, -10],
            accentLightColor: 0x00ffff,
            gridColor1: 0x00ffff,
            gridColor2: 0x0c2538,
            floorColor: 0x0a141e,
            wallColor: 0x122230,
            pillarColor: 0x152838,
            conduitColor: 0x00ffff,
            grateColor: 0x182c3c,
            glassColor: 0x55e7ff,
            glassOpacity: 0.45,
            bloomThreshold: 0.32,
            bloomStrength: 1.35,
            exposure: 1.15
        }
    }
];

export const ARENA_MAPS = [
    {
        id: 'brutalist_grid',
        name: 'The Brutalist Grid',
        defaultThemeId: 'cyber_brutalism',
        codename: 'SECTOR A // BRUTALIST GRID',
        subtitle: 'Concrete Monoliths & Right-Angle Deflection',
        tagline: 'Standard 1:1 clean energy reflections off dense concrete pillars.',
        primarySurface: 'concrete',
        description: 'Symmetrical brutalist complex with heavy reinforced concrete pillars and sharp 90-degree corner angles. Styled in Dark Cyber-Brutalism with deep industrial shadows and glowing cyan conduits.',
        badgeColor: '#00F0FF',
        badgeBg: 'rgba(0, 240, 255, 0.15)',
        theme: VISUAL_THEMES[0].theme,
        stats: {
            complexity: 'BALANCED',
            reflectivity: 'HIGH (100%)',
            coverDensity: 'HEAVY',
            enemies: 5
        },
        playerSpawn: new Vector3(0, 1.6, 16),
        enemySpawns: [
            new Vector3(0, 0, -14),
            new Vector3(-14, 0, -15),
            new Vector3(14, 0, -15),
            new Vector3(-15, 0, 0),
            new Vector3(15, 0, 0)
        ],
        obstacles: [
            // 4 Massive Outer Corner Anchor Pillars
            { min: new Vector3(-18, 0, -18), max: new Vector3(-12, 6.5, -12), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(12, 0, -18),  max: new Vector3(18, 6.5, -12),  type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-18, 0, 4),   max: new Vector3(-12, 6.5, 10),   type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(12, 0, 4),    max: new Vector3(18, 6.5, 10),    type: 'pillar', materialType: 'concrete' },

            // Central Brutalist Monolith
            { min: new Vector3(-4, 0, -8.5), max: new Vector3(4, 4.2, -4.5), type: 'wall', materialType: 'concrete' },

            // Left & Right Mid-Range Angled Deflection Barriers
            { min: new Vector3(-9.5, 0, -1.5), max: new Vector3(-6.5, 5.0, 1.5), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(6.5, 0, -1.5),  max: new Vector3(9.5, 5.0, 1.5),  type: 'pillar', materialType: 'concrete' },

            // Rear Tactical Composite Glass Screen
            { min: new Vector3(-7, 0, -22.2), max: new Vector3(7, 3.4, -21.8), type: 'glass_panel', materialType: 'glass' },

            // Flank Grate Exhaust Barrier
            { min: new Vector3(-24.2, 0, -7), max: new Vector3(-23.8, 3.2, -1), type: 'grate_barrier', materialType: 'grate' },
            { min: new Vector3(23.8, 0, -7),  max: new Vector3(24.2, 3.2, -1), type: 'grate_barrier', materialType: 'grate' }
        ]
    },
    {
        id: 'neon_core',
        aliasIds: ['solar_facility'],
        name: 'Neon Core',
        defaultThemeId: 'neon_core',
        codename: 'SECTOR B // NEON REACTOR CORE',
        subtitle: 'Industrial Grate Alleys & Tight Corridors',
        tagline: 'Heavy industrial grating, pulsing heat conduits, and glowing amber shadows.',
        primarySurface: 'grate',
        description: 'Tight industrial reactor complex laced with dark slotted steel grating and pulsing amber conduits. Grating absorbs bullet momentum and scatters trajectories.',
        badgeColor: '#FFAA00',
        badgeBg: 'rgba(255, 170, 0, 0.15)',
        theme: VISUAL_THEMES[1].theme,
        stats: {
            complexity: 'ADVANCED',
            reflectivity: 'ABSORPTIVE (80%)',
            coverDensity: 'EXTREME',
            enemies: 6
        },
        playerSpawn: new Vector3(0, 1.6, 16),
        enemySpawns: [
            new Vector3(0, 0, -18),
            new Vector3(-17, 0, -14),
            new Vector3(17, 0, -14),
            new Vector3(-17, 0, 0),
            new Vector3(17, 0, 0),
            new Vector3(0, 0, -7)
        ],
        obstacles: [
            // Central Energy Reactor (Concrete Core flanked by heavy grates)
            { min: new Vector3(-3, 0, -9.5), max: new Vector3(3, 5.0, -5.5), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-6, 0, -14.2), max: new Vector3(6, 3.2, -13.8), type: 'grate_barrier', materialType: 'grate' },
            { min: new Vector3(-6, 0, -1.2),  max: new Vector3(6, 3.2, -0.8),  type: 'grate_barrier', materialType: 'grate' },

            // Long Flanking Corridor Grating Dividers
            { min: new Vector3(-13.2, 0, -16), max: new Vector3(-12.8, 3.8, 4), type: 'grate_barrier', materialType: 'grate' },
            { min: new Vector3(12.8, 0, -16),  max: new Vector3(13.2, 3.8, 4), type: 'grate_barrier', materialType: 'grate' },

            // Choke Point Bunkers
            { min: new Vector3(-22, 0, -11), max: new Vector3(-18, 5.5, -7), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(18, 0, -11),  max: new Vector3(22, 5.5, -7),  type: 'pillar', materialType: 'concrete' },

            // Flank Breachable Glass Windows
            { min: new Vector3(-20, 0, -3.2), max: new Vector3(-14, 3.0, -2.8), type: 'glass_panel', materialType: 'glass' },
            { min: new Vector3(14, 0, -3.2),  max: new Vector3(20, 3.0, -2.8), type: 'glass_panel', materialType: 'glass' }
        ]
    },
    {
        id: 'grid_matrix',
        aliasIds: ['glass_vault'],
        name: 'Matrix Vault',
        defaultThemeId: 'grid_matrix',
        codename: 'SECTOR C // CYBER MATRIX VAULT',
        subtitle: 'Luminous Vector Grid, Wireframes & Obsidian Walls',
        tagline: 'Luminous cyan vector lines, dark obsidian surfaces, and shatterable composite glass.',
        primarySurface: 'glass',
        description: 'Dark digital matrix vault partitioned by shatterable composite glass screens. Features glowing cyan vector grids and deep obsidian reflective surfaces designed for tactical sightline manipulation.',
        badgeColor: '#00FFFF',
        badgeBg: 'rgba(0, 255, 255, 0.2)',
        theme: VISUAL_THEMES[2].theme,
        stats: {
            complexity: 'TACTICAL',
            reflectivity: 'BREACHABLE (88%)',
            coverDensity: 'MODULAR',
            enemies: 6
        },
        playerSpawn: new Vector3(0, 1.6, 16),
        enemySpawns: [
            new Vector3(0, 0, -14),
            new Vector3(-11, 0, -17),
            new Vector3(11, 0, -17),
            new Vector3(-16, 0, -11),
            new Vector3(16, 0, -11),
            new Vector3(0, 0, -21)
        ],
        obstacles: [
            // Triple-Segmented Central Glass Security Wall
            { min: new Vector3(-4, 0, -8.2),   max: new Vector3(4, 3.6, -7.8),   type: 'glass_panel', materialType: 'glass' },
            { min: new Vector3(-14, 0, -8.2),  max: new Vector3(-6, 3.6, -7.8),  type: 'glass_panel', materialType: 'glass' },
            { min: new Vector3(6, 0, -8.2),   max: new Vector3(14, 3.6, -7.8),  type: 'glass_panel', materialType: 'glass' },

            // Observation Bay Glass Windows
            { min: new Vector3(-8, 0, -18.2),  max: new Vector3(8, 3.6, -17.8),  type: 'glass_panel', materialType: 'glass' },
            { min: new Vector3(-20.2, 0, -14), max: new Vector3(-19.8, 3.5, -2), type: 'glass_panel', materialType: 'glass' },
            { min: new Vector3(19.8, 0, -14),  max: new Vector3(20.2, 3.5, -2), type: 'glass_panel', materialType: 'glass' },

            // Heavy Concrete Pylons (for bank shots behind/through glass)
            { min: new Vector3(-10, 0, -15), max: new Vector3(-7, 6.0, -12), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(7, 0, -15),  max: new Vector3(10, 6.0, -12), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-4, 0, -23),  max: new Vector3(4, 4.2, -20),  type: 'wall', materialType: 'concrete' },

            // Central Low Grating Floor Exhaust
            { min: new Vector3(-5, 0, -1.8), max: new Vector3(5, 2.5, -1.4), type: 'grate_barrier', materialType: 'grate' }
        ]
    }
];

export class ArenaManager {
    constructor() {
        this.STORAGE_KEY = 'bounce_kill_games_played';
        this.SELECTED_MAP_KEY = 'bounce_kill_selected_map';
        this.SELECTED_THEME_KEY = 'bounce_kill_selected_theme';
        this.UNLOCK_THRESHOLD = 5;

        this.gamesPlayed = this._loadGamesPlayed();
        this.selectedMapId = this._loadSelectedMapId(); // 'auto' or map.id
        this.selectedThemeId = this._loadSelectedThemeId(); // 'default' or theme.id
        this.currentMap = null;
    }

    _loadGamesPlayed() {
        try {
            const val = localStorage.getItem(this.STORAGE_KEY);
            return val ? Math.max(0, parseInt(val, 10) || 0) : 0;
        } catch (e) {
            return 0;
        }
    }

    _saveGamesPlayed() {
        try {
            localStorage.setItem(this.STORAGE_KEY, this.gamesPlayed.toString());
        } catch (e) {
            console.warn('[ArenaManager] Failed to persist games played to localStorage', e);
        }
    }

    _loadSelectedMapId() {
        try {
            let val = localStorage.getItem(this.SELECTED_MAP_KEY) || 'brutalist_grid';
            if (val === 'solar_facility') val = 'neon_core';
            if (val === 'glass_vault') val = 'grid_matrix';
            return val;
        } catch (e) {
            return 'brutalist_grid';
        }
    }

    _saveSelectedMapId() {
        try {
            localStorage.setItem(this.SELECTED_MAP_KEY, this.selectedMapId);
        } catch (e) {
            console.warn('[ArenaManager] Failed to persist selected map ID', e);
        }
    }

    _loadSelectedThemeId() {
        try {
            let val = localStorage.getItem(this.SELECTED_THEME_KEY) || 'default';
            if (val === 'clean_solar') val = 'neon_core';
            return val;
        } catch (e) {
            return 'default';
        }
    }

    _saveSelectedThemeId() {
        try {
            localStorage.setItem(this.SELECTED_THEME_KEY, this.selectedThemeId);
        } catch (e) {
            console.warn('[ArenaManager] Failed to persist selected theme ID', e);
        }
    }

    getGamesPlayed() {
        return this.gamesPlayed;
    }

    recordGamePlayed() {
        this.gamesPlayed++;
        this._saveGamesPlayed();
        return this.gamesPlayed;
    }

    isSelectionUnlocked() {
        // Immediate, unrestricted map selection right from the start!
        return true;
    }

    getUnlockProgress() {
        const played = this.gamesPlayed;
        return {
            played,
            required: 0,
            unlocked: true,
            remaining: 0,
            percent: 100
        };
    }

    setSelectedMap(mapId) {
        if (mapId === 'solar_facility') mapId = 'neon_core';
        if (mapId === 'glass_vault') mapId = 'grid_matrix';
        this.selectedMapId = mapId;
        this._saveSelectedMapId();
        return true;
    }

    getSelectedMapId() {
        return this.selectedMapId;
    }

    getAllThemes() {
        return VISUAL_THEMES;
    }

    getThemeById(themeId) {
        if (themeId === 'clean_solar') themeId = 'neon_core';
        return VISUAL_THEMES.find(t => t.id === themeId) || VISUAL_THEMES[0];
    }

    getSelectedThemeId() {
        return this.selectedThemeId;
    }

    setSelectedTheme(themeId) {
        if (themeId === 'clean_solar') themeId = 'neon_core';
        this.selectedThemeId = themeId;
        this._saveSelectedThemeId();
        return true;
    }

    getEffectiveThemeObject(mapConfig) {
        if (!mapConfig) return VISUAL_THEMES[0];
        if (this.selectedThemeId && this.selectedThemeId !== 'default') {
            const t = VISUAL_THEMES.find(th => th.id === this.selectedThemeId);
            if (t) return t;
        }
        const def = VISUAL_THEMES.find(th => th.id === mapConfig.defaultThemeId);
        return def || VISUAL_THEMES[0];
    }

    getEffectiveTheme(mapConfig) {
        return this.getEffectiveThemeObject(mapConfig).theme;
    }

    getAllMaps() {
        return ARENA_MAPS;
    }

    getMapById(id) {
        if (id === 'solar_facility') id = 'neon_core';
        if (id === 'glass_vault') id = 'grid_matrix';
        const found = ARENA_MAPS.find(m => m.id === id || (m.aliasIds && m.aliasIds.includes(id)));
        return found || ARENA_MAPS[0];
    }

    getRandomMap() {
        const idx = Math.floor(Math.random() * ARENA_MAPS.length);
        return ARENA_MAPS[idx];
    }

    /**
     * Resolves the next map:
     * - If set to 'auto' or 'random': picks randomly.
     * - Otherwise: loads the player's selected map immediately.
     */
    resolveNextMap() {
        if (this.selectedMapId === 'auto' || this.selectedMapId === 'random') {
            const map = this.getRandomMap();
            this.currentMap = map;
            return map;
        }

        const map = this.getMapById(this.selectedMapId);
        this.currentMap = map;
        return map;
    }

    getCurrentMap() {
        if (!this.currentMap) {
            this.currentMap = this.resolveNextMap();
        }
        return this.currentMap;
    }

    resetProgress() {
        this.gamesPlayed = 0;
        this.selectedMapId = 'brutalist_grid';
        this.selectedThemeId = 'default';
        this._saveGamesPlayed();
        this._saveSelectedMapId();
        this._saveSelectedThemeId();
    }
}
