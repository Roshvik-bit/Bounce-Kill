/**
 * ==============================================================================
 * Bounce Kill - Weapon Arsenal Catalog (WeaponConfig.js)
 * Defines weapon variants, economy costs, ballistic speeds, bounce endurance,
 * magazine capacities, and visual rail themes.
 * ==============================================================================
 */

export const WEAPON_CATALOG = [
    {
        id: 'spectre9',
        name: 'SPECTRE-9 RICOCHET PISTOL',
        category: 'TACTICAL SIDEARM',
        cost: 0,
        unlocked: true,
        description: 'Standard issue tactical sidearm. Reliable bank-shot mechanics and balanced handling.',
        maxAmmo: 6,
        speed: 50.0,
        maxBounces: 5,
        fireCooldown: 0.22,
        reloadTime: 1.2,
        damage: 100,
        railColorHex: 0x00F0FF,
        railColorCss: '#00F0FF',
        bulletColorHex: 0x00F0FF,
        lethalColorHex: 0xFF0D47,
        recoilKick: 0.12
    },
    {
        id: 'viper_hx',
        name: 'VIPER-HX VELOCITY RAILGUN',
        category: 'HIGH-VELOCITY DMR',
        cost: 250,
        unlocked: false,
        description: 'Hyper-accelerated projectile core. Extreme projectile velocity and +2 extra bounce limit.',
        maxAmmo: 4,
        speed: 78.0,
        maxBounces: 7,
        fireCooldown: 0.34,
        reloadTime: 1.4,
        damage: 150,
        railColorHex: 0xB026FF,
        railColorCss: '#B026FF',
        bulletColorHex: 0xB026FF,
        lethalColorHex: 0xFF0055,
        recoilKick: 0.18
    },
    {
        id: 'plasma_carbine',
        name: 'PLASMA SCATTER CARBINE',
        category: 'RAPID ASSAULT CARBINE',
        cost: 500,
        unlocked: false,
        description: 'High-capacity rapid-fire carbine. Double magazine capacity with blazing fire rate.',
        maxAmmo: 12,
        speed: 46.0,
        maxBounces: 4,
        fireCooldown: 0.12,
        reloadTime: 1.5,
        damage: 75,
        railColorHex: 0xFF9100,
        railColorCss: '#FF9100',
        bulletColorHex: 0xFF9100,
        lethalColorHex: 0xFF1744,
        recoilKick: 0.08
    }
];

export function getWeaponConfig(id) {
    const found = WEAPON_CATALOG.find(w => w.id === id);
    return found || WEAPON_CATALOG[0];
}

