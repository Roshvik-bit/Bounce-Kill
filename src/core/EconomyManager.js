/**
 * ==============================================================================
 * Bounce Kill - Token & Economy Manager (EconomyManager.js)
 * Manages player token balance, weapon purchases, equips, and persistence
 * via HTML5 localStorage.
 * ==============================================================================
 */

import { getWeaponConfig } from '../weapons/WeaponConfig.js';

export class EconomyManager {
    constructor() {
        this.tokens = 0;
        this.unlockedWeapons = new Set(['spectre9']);
        this.equippedWeaponId = 'spectre9';

        this.STORAGE_KEY_TOKENS = 'bouncekill_tokens';
        this.STORAGE_KEY_UNLOCKED = 'bouncekill_unlocked';
        this.STORAGE_KEY_EQUIPPED = 'bouncekill_equipped';

        this._loadState();
    }

    _loadState() {
        try {
            const savedTokens = localStorage.getItem(this.STORAGE_KEY_TOKENS);
            if (savedTokens !== null) {
                this.tokens = parseInt(savedTokens, 10) || 0;
            } else {
                this.tokens = 50; // Starter stipend
                this._saveTokens();
            }

            const savedUnlocked = localStorage.getItem(this.STORAGE_KEY_UNLOCKED);
            if (savedUnlocked) {
                const list = JSON.parse(savedUnlocked);
                if (Array.isArray(list)) {
                    list.forEach(id => this.unlockedWeapons.add(id));
                }
            }

            const savedEquipped = localStorage.getItem(this.STORAGE_KEY_EQUIPPED);
            if (savedEquipped && this.unlockedWeapons.has(savedEquipped)) {
                this.equippedWeaponId = savedEquipped;
            }
        } catch (e) {
            console.warn('[Economy] localStorage access restricted or unavailable:', e);
            this.tokens = 50;
        }
    }

    _saveTokens() {
        try {
            localStorage.setItem(this.STORAGE_KEY_TOKENS, this.tokens.toString());
        } catch (e) {}
    }

    _saveUnlocked() {
        try {
            localStorage.setItem(this.STORAGE_KEY_UNLOCKED, JSON.stringify([...this.unlockedWeapons]));
        } catch (e) {}
    }

    _saveEquipped() {
        try {
            localStorage.setItem(this.STORAGE_KEY_EQUIPPED, this.equippedWeaponId);
        } catch (e) {}
    }

    getTokens() {
        return this.tokens;
    }

    addTokens(amount) {
        this.tokens += Math.max(0, amount);
        this._saveTokens();
        return this.tokens;
    }

    canAfford(cost) {
        return this.tokens >= cost;
    }

    isUnlocked(weaponId) {
        return this.unlockedWeapons.has(weaponId);
    }

    buyWeapon(weaponId) {
        const config = getWeaponConfig(weaponId);
        if (this.isUnlocked(weaponId)) return { success: false, reason: 'Already unlocked' };
        if (!this.canAfford(config.cost)) return { success: false, reason: 'Insufficient tokens' };

        this.tokens -= config.cost;
        this.unlockedWeapons.add(weaponId);
        this._saveTokens();
        this._saveUnlocked();

        this.equipWeapon(weaponId);
        return { success: true };
    }

    equipWeapon(weaponId) {
        if (!this.isUnlocked(weaponId)) return false;
        this.equippedWeaponId = weaponId;
        this._saveEquipped();
        return true;
    }

    getEquippedWeapon() {
        return getWeaponConfig(this.equippedWeaponId);
    }

    /**
     * Calculates tokens awarded for a bank shot kill.
     * Rewards multi-bounce complexity and active combo multipliers!
     */
    calculateReward(bounces, comboMultiplier = 1.0) {
        let baseTokens = 25;
        if (bounces === 2) baseTokens = 60;
        else if (bounces === 3) baseTokens = 120;
        else if (bounces >= 4) baseTokens = 220 + (bounces - 4) * 80;

        const earned = Math.round(baseTokens * comboMultiplier);
        this.addTokens(earned);
        return earned;
    }
}

