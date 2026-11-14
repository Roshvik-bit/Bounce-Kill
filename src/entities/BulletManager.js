/**
 * ==============================================================================
 * Bounce Kill - Bullet & Projectile Manager (BulletManager.js)
 * Implements the core Ricochet Rule with weapon customization & Three.js mesh lifecycle:
 * - Direct hit on enemies = 0 damage (Uncharged)
 * - Wall bounce activates Crimson-Hot Lethal mode (deals multiplied damage).
 * ==============================================================================
 */

import { Vector3 } from '../core/Math3D.js';

export class BulletManager {
    constructor(physics, soundManager, scene) {
        this.physics = physics;
        this.sound = soundManager;
        this.scene = scene;
        this.bullets = [];
        this.sparks = [];
        this.glassShards = [];

        this.COLOR_CYAN_HEX = 0x00F0FF;
        this.COLOR_CRIMSON_HEX = 0xFF0D47;
        this.COLOR_AMBER_HEX = 0xFFAA00;
        this.COLOR_VIOLET_HEX = 0xD000FF;
    }

    setScene(scene) {
        this.scene = scene;
    }

    spawnBullet(origin, forwardDir, weaponConfig = null) {
        const speed = weaponConfig ? weaponConfig.speed : 52.0;
        const maxBounces = weaponConfig ? weaponConfig.maxBounces : 5;
        const bulletColor = weaponConfig ? weaponConfig.bulletColorHex : this.COLOR_CYAN_HEX;
        const lethalColor = weaponConfig ? weaponConfig.lethalColorHex : this.COLOR_CRIMSON_HEX;
        const baseDamage = weaponConfig ? weaponConfig.damage : 100;

        let mesh = null;
        let light = null;
        if (this.scene && typeof window.THREE !== 'undefined') {
            const THREE = window.THREE;
            const geo = new THREE.SphereGeometry(0.18, 12, 12);
            const mat = new THREE.MeshBasicMaterial({ color: bulletColor });
            mesh = new THREE.Mesh(geo, mat);
            mesh.position.set(origin.x, origin.y, origin.z);

            // Dynamic illumination for projectiles
            light = new THREE.PointLight(bulletColor, 1.2, 6.0);
            mesh.add(light);
            this.scene.add(mesh);
        }

        this.bullets.push({
            position: origin.clone(),
            velocity: forwardDir.clone().multiplyScalar(speed),
            state: 'UNCHARGED', // 'UNCHARGED' -> 'CHARGED_LETHAL' -> 'SUPERCHARGED_AMBER' -> 'HYPERCHARGED_VIOLET'
            bounces: 0,
            maxBounces: maxBounces,
            baseDamage: baseDamage,
            damage: baseDamage,
            bulletColorHex: bulletColor,
            lethalColorHex: lethalColor,
            currentColorHex: bulletColor,
            lastBouncePos: null,
            aliveTime: 0,
            maxLife: 5.0,
            mesh: mesh,
            light: light,
            materialsHit: [],
            trail: [origin.clone()]
        });
    }

    spawnSparks(pos, normal, isLethal, customColorHex = null, count = 16) {
        let colHex = isLethal ? this.COLOR_CRIMSON_HEX : this.COLOR_CYAN_HEX;
        if (customColorHex !== null) colHex = customColorHex;

        const THREE = (typeof window.THREE !== 'undefined') ? window.THREE : null;

        for (let i = 0; i < count; i++) {
            const spread = new Vector3(
                (Math.random() - 0.5) * 9 + normal.x * 5,
                (Math.random() - 0.5) * 9 + normal.y * 5,
                (Math.random() - 0.5) * 9 + normal.z * 5
            );

            let mesh = null;
            if (this.scene && THREE) {
                const geo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
                const mat = new THREE.MeshBasicMaterial({ color: colHex });
                mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(pos.x, pos.y, pos.z);
                this.scene.add(mesh);
            }

            this.sparks.push({
                position: pos.clone(),
                velocity: spread,
                colorHex: colHex,
                mesh: mesh,
                life: 0.35,
                maxLife: 0.35
            });
        }
    }

    spawnGlassShards(pos, normal, count = 28) {
        const THREE = (typeof window.THREE !== 'undefined') ? window.THREE : null;

        for (let i = 0; i < count; i++) {
            const spread = new Vector3(
                (Math.random() - 0.5) * 11 + normal.x * 6,
                Math.random() * 8 + 2 + normal.y * 4,
                (Math.random() - 0.5) * 11 + normal.z * 6
            );

            let mesh = null;
            if (this.scene && THREE) {
                const w = 0.08 + Math.random() * 0.14;
                const h = 0.08 + Math.random() * 0.18;
                const geo = new THREE.BoxGeometry(w, h, 0.03);
                const mat = new THREE.MeshStandardMaterial({
                    color: 0x88EEFF,
                    emissive: 0x00F0FF,
                    emissiveIntensity: 0.8,
                    transparent: true,
                    opacity: 0.85,
                    roughness: 0.1,
                    metalness: 0.2
                });
                mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(pos.x, pos.y, pos.z);
                mesh.rotation.set(Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI);
                this.scene.add(mesh);
            }

            this.glassShards.push({
                position: pos.clone(),
                velocity: spread,
                rotSpeed: new Vector3(
                    (Math.random() - 0.5) * 14,
                    (Math.random() - 0.5) * 14,
                    (Math.random() - 0.5) * 14
                ),
                mesh: mesh,
                life: 0.75,
                maxLife: 0.75
            });
        }
    }

    spawnGrateSparks(pos, normal, count = 22) {
        const THREE = (typeof window.THREE !== 'undefined') ? window.THREE : null;

        for (let i = 0; i < count; i++) {
            const spread = new Vector3(
                (Math.random() - 0.5) * 13 + normal.x * 6,
                (Math.random() - 0.5) * 13 + normal.y * 6,
                (Math.random() - 0.5) * 13 + normal.z * 6
            );

            const colHex = Math.random() > 0.4 ? 0x00F0FF : 0x3388FF;

            let mesh = null;
            if (this.scene && THREE) {
                const geo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
                const mat = new THREE.MeshBasicMaterial({ color: colHex });
                mesh = new THREE.Mesh(geo, mat);
                mesh.position.set(pos.x, pos.y, pos.z);
                this.scene.add(mesh);
            }

            this.sparks.push({
                position: pos.clone(),
                velocity: spread,
                colorHex: colHex,
                mesh: mesh,
                life: 0.4,
                maxLife: 0.4
            });
        }
    }

    update(delta, enemies, onBankShotKill) {
        const enemyBoxes = enemies.filter(e => e.alive).map(e => e.getAABB());

        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const b = this.bullets[i];
            b.aliveTime += delta;

            if (b.aliveTime >= b.maxLife) {
                this._removeBullet(i);
                continue;
            }

            const stepDist = b.velocity.length() * delta;
            const dir = b.velocity.clone().normalize();
            const hit = this.physics.raycast(b.position, dir, stepDist, enemyBoxes);

            if (hit) {
                if (hit.box.tag === 'enemy') {
                    const enemy = hit.box.extra.enemy;

                    if (b.state === 'UNCHARGED') {
                        // Direct shot on enemy: 0 damage (Ricochet Rule)
                        console.log('[Ricochet Rule] Direct shot on enemy: 0 DAMAGE! Shield deflected.');
                        this.sound.playDeflect();
                        this.spawnSparks(hit.point, hit.normal, false, b.bulletColorHex, 20);
                        enemy.onDeflect();
                        this._removeBullet(i);
                        continue;
                    } else {
                        // Lethal Bank Shot hit
                        console.log(`[Ricochet Rule] LETHAL BANK SHOT! Bounces: ${b.bounces}`);
                        this.sound.playLethalHit(b.bounces);
                        this.spawnSparks(hit.point, hit.normal, true, b.currentColorHex || b.lethalColorHex, 20 + b.bounces * 8);

                        const wasAlive = enemy.alive;
                        enemy.takeDamage(b.damage, b.bounces);

                        // Anti-exploit: only award kill points if the hit actually eliminated an alive enemy
                        if (wasAlive && !enemy.alive && onBankShotKill) {
                            onBankShotKill(b.bounces, enemy, b);
                        }
                        this._removeBullet(i);
                        continue;
                    }
                } else {
                    // Static Wall / Pillar / Grate / Glass Reflection
                    const matType = hit.box.materialType || 'concrete';
                    b.materialsHit = b.materialsHit || [];
                    if (!b.materialsHit.includes(matType)) {
                        b.materialsHit.push(matType);
                    }

                    // Anti-exploit: check min distance from last bounce to avoid seam jitter farming
                    const distFromLast = b.lastBouncePos ? b.position.distanceTo(b.lastBouncePos) : 999;
                    if (distFromLast >= 0.28) {
                        b.bounces++;
                        b.lastBouncePos = hit.point.clone();

                        // Tier Color, Glow Scaling & Damage Multiplier
                        let tierColor = b.lethalColorHex;
                        let tierScale = 1.35;
                        let sparkCount = 18;
                        let lightIntensity = 2.8;

                        if (b.bounces === 1) {
                            b.state = 'CHARGED_LETHAL';
                            tierColor = b.lethalColorHex; // Crimson #FF0D47
                            tierScale = 1.35;
                            sparkCount = 18;
                            lightIntensity = 3.0;
                            b.damage = b.baseDamage * 1.0;
                        } else if (b.bounces === 2) {
                            b.state = 'SUPERCHARGED_AMBER';
                            tierColor = this.COLOR_AMBER_HEX; // Amber #FFAA00
                            tierScale = 1.75;
                            sparkCount = 28;
                            lightIntensity = 5.0;
                            b.damage = b.baseDamage * 2.5;
                        } else {
                            b.state = 'HYPERCHARGED_VIOLET';
                            tierColor = this.COLOR_VIOLET_HEX; // Violet #D000FF
                            tierScale = 2.2;
                            sparkCount = 40;
                            lightIntensity = 7.5;
                            b.damage = b.baseDamage * (4.5 + (b.bounces - 3) * 1.5);
                        }

                        b.currentColorHex = tierColor;

                        if (b.mesh) {
                            b.mesh.material.color.setHex(tierColor);
                            b.mesh.scale.set(tierScale, tierScale, tierScale);
                        }
                        if (b.light) {
                            b.light.color.setHex(tierColor);
                            b.light.intensity = lightIntensity;
                            b.light.distance = 7.0 + b.bounces * 3.0;
                        }

                        // Surface-specific physics & material reactions
                        if (matType === 'glass') {
                            // Shatter glass panel upon bullet impact
                            hit.box.isBroken = true;
                            if (hit.box.mesh) {
                                hit.box.mesh.visible = false;
                            }
                            this.sound.playGlassShatter();
                            this.spawnGlassShards(hit.point, hit.normal, 28);

                            // Outgoing angle deflection jitter (±0.12 rad) and slight speed retention (0.88)
                            const curSpeed = b.velocity.length() * 0.88;
                            let reflectDir = b.velocity.clone().normalize().reflect(hit.normal);
                            reflectDir.x += (Math.random() - 0.5) * 0.24;
                            reflectDir.y += (Math.random() - 0.5) * 0.24;
                            reflectDir.z += (Math.random() - 0.5) * 0.24;
                            b.velocity = reflectDir.normalize().multiplyScalar(curSpeed);
                        } else if (matType === 'grate') {
                            // Industrial grating / mesh: absorbs 20% momentum (0.80) & chaotic deflection jitter (±0.08 rad)
                            this.sound.playGrateImpact();
                            this.spawnGrateSparks(hit.point, hit.normal, 22);

                            const curSpeed = b.velocity.length() * 0.80;
                            let reflectDir = b.velocity.clone().normalize().reflect(hit.normal);
                            reflectDir.x += (Math.random() - 0.5) * 0.16;
                            reflectDir.y += (Math.random() - 0.5) * 0.16;
                            reflectDir.z += (Math.random() - 0.5) * 0.16;
                            b.velocity = reflectDir.normalize().multiplyScalar(curSpeed);
                        } else {
                            // Standard Concrete / Reinforced Steel: 1:1 clean energy reflection
                            this.sound.playRicochet(b.bounces);
                            this.spawnSparks(hit.point, hit.normal, true, tierColor, sparkCount);
                            b.velocity = b.velocity.reflect(hit.normal);
                        }
                    } else {
                        // Anti-seam jitter standard reflection
                        b.velocity = b.velocity.reflect(hit.normal);
                    }

                    b.position.copy(hit.point).add(hit.normal.clone().multiplyScalar(0.04));

                    if (b.bounces >= b.maxBounces) {
                        this._removeBullet(i);
                        continue;
                    }
                }
            } else {
                b.position.add(b.velocity.clone().multiplyScalar(delta));
            }

            if (b.mesh) {
                b.mesh.position.set(b.position.x, b.position.y, b.position.z);
            }
        }

        // Update sparks
        for (let i = this.sparks.length - 1; i >= 0; i--) {
            const s = this.sparks[i];
            s.life -= delta;

            if (s.life <= 0) {
                if (this.scene && s.mesh) {
                    this.scene.remove(s.mesh);
                }
                this.sparks.splice(i, 1);
                continue;
            }

            s.position.add(s.velocity.clone().multiplyScalar(delta));
            s.velocity.y -= 14.0 * delta;

            if (s.mesh) {
                s.mesh.position.set(s.position.x, s.position.y, s.position.z);
                const scale = (s.life / s.maxLife);
                s.mesh.scale.set(scale, scale, scale);
            }
        }

        // Update tumbling glass shards
        for (let i = this.glassShards.length - 1; i >= 0; i--) {
            const gs = this.glassShards[i];
            gs.life -= delta;

            if (gs.life <= 0) {
                if (this.scene && gs.mesh) {
                    this.scene.remove(gs.mesh);
                }
                this.glassShards.splice(i, 1);
                continue;
            }

            gs.position.add(gs.velocity.clone().multiplyScalar(delta));
            gs.velocity.y -= 16.0 * delta; // Gravity

            if (gs.mesh) {
                gs.mesh.position.set(gs.position.x, gs.position.y, gs.position.z);
                gs.mesh.rotation.x += gs.rotSpeed.x * delta;
                gs.mesh.rotation.y += gs.rotSpeed.y * delta;
                gs.mesh.rotation.z += gs.rotSpeed.z * delta;
                const alpha = gs.life / gs.maxLife;
                gs.mesh.material.opacity = alpha * 0.85;
            }
        }
    }

    _removeBullet(index) {
        const b = this.bullets[index];
        if (b.mesh && this.scene) {
            this.scene.remove(b.mesh);
        }
        this.bullets.splice(index, 1);
    }

    render(nativeRenderer) {
        if (!nativeRenderer || typeof nativeRenderer.drawSphere !== 'function') return;
        for (const b of this.bullets) {
            const col = (b.bouncesCount >= 1) ? [1.0, 0.05, 0.28] : [0.0, 0.94, 1.0];
            nativeRenderer.drawSphere(b.position, 0.2, col);
        }
    }

    clear() {
        for (const b of this.bullets) {
            if (b.mesh && this.scene) this.scene.remove(b.mesh);
        }
        for (const s of this.sparks) {
            if (s.mesh && this.scene) this.scene.remove(s.mesh);
        }
        for (const gs of this.glassShards) {
            if (gs.mesh && this.scene) this.scene.remove(gs.mesh);
        }
        this.bullets = [];
        this.sparks = [];
        this.glassShards = [];
    }
}
