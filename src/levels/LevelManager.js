/**
 * ==============================================================================
 * Bounce Kill - Level Progression System (LevelManager.js)
 * Multi-stage campaign progression with dynamic obstacle layouts, tactical cover,
 * and scaling enemy difficulty.
 * ==============================================================================
 */

import { Vector3 } from '../core/Math3D.js';

export const CAMPAIGN_LEVELS = [
    {
        id: 1,
        title: 'SECTOR 01: TRAINING GROUNDS',
        subtitle: 'Tactical Ricochet & Surface Calibration',
        description: 'Direct shots do zero damage. Bank shots off concrete pillars, shatter tactical glass panels, or gauge grating momentum to neutralize 3 target androids.',
        targetCount: 3,
        spawnPositions: [
            new Vector3(0, 0, -12),
            new Vector3(-12, 0, -15),
            new Vector3(12, 0, -15)
        ],
        pillars: [
            { min: new Vector3(-8, 0, -3), max: new Vector3(-5, 6, 1), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(5, 0, -3), max: new Vector3(8, 6, 1), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-3.5, 0, -8.5), max: new Vector3(3.5, 2.8, -6.5), type: 'wall', materialType: 'concrete' }, // Center barrier
            { min: new Vector3(10, 0, -7), max: new Vector3(10.3, 3.2, -1), type: 'glass_panel', materialType: 'glass' },    // Shatterable Glass Flank
            { min: new Vector3(-10.3, 0, -7), max: new Vector3(-10, 3.0, -1), type: 'grate_barrier', materialType: 'grate' } // Industrial Grating Cover
        ]
    },
    {
        id: 2,
        title: 'SECTOR 02: INDUSTRIAL COMPLEX',
        subtitle: 'Corridor Deflection & Material Dynamics',
        description: 'Tight reflection angles. Grate mesh absorbs 20% momentum with erratic deflection; shatter composite glass to breach sniper pockets.',
        targetCount: 5,
        spawnPositions: [
            new Vector3(0, 0, -13),
            new Vector3(-13, 0, -18),
            new Vector3(13, 0, -18),
            new Vector3(-16, 0, -5),
            new Vector3(16, 0, -5)
        ],
        pillars: [
            { min: new Vector3(-9, 0, -3), max: new Vector3(-6, 6, 1), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(6, 0, -3), max: new Vector3(9, 6, 1), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-14, 0, -12), max: new Vector3(-11, 6, -8), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(11, 0, -12), max: new Vector3(14, 6, -8), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-4, 0, -9), max: new Vector3(4, 2.8, -7), type: 'wall', materialType: 'grate' },               // Grating Center Divider
            { min: new Vector3(-7.5, 0, -11.2), max: new Vector3(-1.5, 3.2, -10.8), type: 'glass_panel', materialType: 'glass' }, // Left Glass Screen
            { min: new Vector3(1.5, 0, -11.2), max: new Vector3(7.5, 3.2, -10.8), type: 'glass_panel', materialType: 'glass' },  // Right Glass Screen
            { min: new Vector3(-18.3, 0, -9), max: new Vector3(-18, 3.5, -3), type: 'grate_barrier', materialType: 'grate' },     // West Grate Wall
            { min: new Vector3(18, 0, -9), max: new Vector3(18.3, 3.5, -3), type: 'grate_barrier', materialType: 'grate' }        // East Grate Wall
        ]
    },
    {
        id: 3,
        title: 'SECTOR 03: CYBER CORE CITADEL',
        subtitle: 'Labyrinthine Multi-Surface Citadel',
        description: 'Complex brutalist fortress with concrete monoliths, security glass screens, and heavy grates. Double bank ricochets and glass breach trick shots required.',
        targetCount: 7,
        spawnPositions: [
            new Vector3(0, 0, -16),
            new Vector3(-9, 0, -12),
            new Vector3(9, 0, -12),
            new Vector3(-18, 0, -20),
            new Vector3(18, 0, -20),
            new Vector3(-18, 0, -2),
            new Vector3(18, 0, -2)
        ],
        pillars: [
            { min: new Vector3(-10, 0, -4), max: new Vector3(-7, 6, 0), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(7, 0, -4), max: new Vector3(10, 6, 0), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-12, 0, -14), max: new Vector3(-8, 6, -10), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(8, 0, -14), max: new Vector3(12, 6, -10), type: 'pillar', materialType: 'concrete' },
            { min: new Vector3(-4, 0, -18), max: new Vector3(4, 3.5, -16), type: 'wall', materialType: 'concrete' },         // Rear bunker
            { min: new Vector3(-5, 0, -9), max: new Vector3(5, 2.8, -7), type: 'wall', materialType: 'grate' },               // Front grate barrier
            { min: new Vector3(-6, 0, -13.2), max: new Vector3(6, 3.4, -12.8), type: 'glass_panel', materialType: 'glass' },  // Central Citadel Glass Screen
            { min: new Vector3(-14.3, 0, -7), max: new Vector3(-14, 3.5, -1), type: 'glass_panel', materialType: 'glass' },   // West Security Glass
            { min: new Vector3(14, 0, -7), max: new Vector3(14.3, 3.5, -1), type: 'glass_panel', materialType: 'glass' },    // East Security Glass
            { min: new Vector3(-7, 0, -18.3), max: new Vector3(-4.5, 3.0, -18), type: 'grate_barrier', materialType: 'grate' }, // Flank Grate Left
            { min: new Vector3(4.5, 0, -18.3), max: new Vector3(7, 3.0, -18), type: 'grate_barrier', materialType: 'grate' }   // Flank Grate Right
        ]
    }
];

export class LevelManager {
    constructor() {
        this.currentLevelIndex = 0;
    }

    getCurrentLevel() {
        return CAMPAIGN_LEVELS[this.currentLevelIndex];
    }

    hasNextLevel() {
        return this.currentLevelIndex < CAMPAIGN_LEVELS.length - 1;
    }

    nextLevel() {
        if (this.hasNextLevel()) {
            this.currentLevelIndex++;
            return this.getCurrentLevel();
        }
        return null;
    }

    reset() {
        this.currentLevelIndex = 0;
        return this.getCurrentLevel();
    }
}

