/**
 * ==============================================================================
 * Bounce Kill - High-Clarity Enemy Mech System (EnemyManager.js)
 * Hyper-clear, visually striking combat mechs with distinct armor plating,
 * pulsating crimson reactor cores with dynamic point lights, and optical visors.
 * ==============================================================================
 */

import { Vector3 } from '../core/Math3D.js';
import { AABB } from '../core/Physics.js';

export class Enemy {
    constructor(id, position, physics, soundManager, scene) {
        this.id = id;
        this.position = position.clone();
        this.homePos = position.clone();
        this.physics = physics;
        this.sound = soundManager;
        this.scene = scene;

        this.health = 100;
        this.maxHealth = 100;
        this.alive = true;
        this.state = 'CHASE'; // Instantly aggressive pursuit upon spawning!

        this.moveSpeed = 4.2;
        this.chaseSpeed = 5.4;
        this.attackRange = 2.5;
        this.attackRate = 1.0;
        this.attackTimer = 0;
        this.yaw = Math.random() * Math.PI * 2;

        // Pathfinding & obstacle navigation state
        this.stuckTimer = 0;
        this.stuckDetourTimer = 0;
        this.stuckDetourDir = new Vector3(0, 0, 0);
        this.lastPosition = this.position.clone();
        this.preferredFlank = (Math.random() > 0.5 ? 1 : -1);

        // Visual feedback state
        this.damageFlash = 0;
        this.shieldFlash = 0;
        this.isTargetedByLethal = false;
        this.bobTime = Math.random() * 10;

        this._initMesh();
    }

    _initMesh() {
        if (!this.scene || typeof window.THREE === 'undefined') return;
        const THREE = window.THREE;

        this.meshGroup = new THREE.Group();
        this.meshGroup.position.set(this.position.x, this.position.y, this.position.z);

        const NEON_MAGENTA = 0xff00aa;
        const NEON_MAGENTA_EMISSIVE = 0xff0066;
        const NEON_LIME = 0x00ff66;

        // 1. Lower Chassis & Magnetic Treads (High-contrast dark alloy with neon cyan magnetic rollers)
        const treadMat = new THREE.MeshStandardMaterial({
            color: 0x180424,
            emissive: 0x550033,
            emissiveIntensity: 0.6,
            roughness: 0.4,
            metalness: 0.8
        });
        const leftTread = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.6), treadMat);
        leftTread.position.set(-0.28, 0.14, 0);
        this.meshGroup.add(leftTread);

        const rightTread = new THREE.Mesh(new THREE.BoxGeometry(0.24, 0.28, 0.6), treadMat);
        rightTread.position.set(0.28, 0.14, 0);
        this.meshGroup.add(rightTread);

        // 2. High-Intensity Neon Enemy Torso & Hull Plating
        this.neonHullMaterial = new THREE.MeshStandardMaterial({
            color: NEON_MAGENTA,
            emissive: NEON_MAGENTA_EMISSIVE,
            emissiveIntensity: 1.85,
            roughness: 0.18,
            metalness: 0.75
        });
        const torsoGeo = new THREE.CylinderGeometry(0.48, 0.38, 1.1, 12);
        const torso = new THREE.Mesh(torsoGeo, this.neonHullMaterial);
        torso.position.y = 0.85;
        this.meshGroup.add(torso);

        // 3. Heavy Shoulder Pauldrons
        const pauldronGeo = new THREE.BoxGeometry(0.28, 0.26, 0.48);
        const leftPaul = new THREE.Mesh(pauldronGeo, this.neonHullMaterial);
        leftPaul.position.set(-0.52, 1.25, 0);
        this.meshGroup.add(leftPaul);

        const rightPaul = new THREE.Mesh(pauldronGeo, this.neonHullMaterial);
        rightPaul.position.set(0.52, 1.25, 0);
        this.meshGroup.add(rightPaul);

        // 4. Hyper-Luminous Pulsating Reactor Core (High emission & dynamic point light)
        const coreGeo = new THREE.BoxGeometry(0.52, 0.42, 0.52);
        this.coreMaterial = new THREE.MeshStandardMaterial({
            color: NEON_MAGENTA,
            emissive: 0xff00ff,
            emissiveIntensity: 2.2,
            roughness: 0.1,
            metalness: 0.95
        });
        const core = new THREE.Mesh(coreGeo, this.coreMaterial);
        core.position.set(0, 0.95, 0.05);
        this.meshGroup.add(core);

        this.coreLight = new THREE.PointLight(NEON_MAGENTA, 2.8, 9.0);
        this.coreLight.position.set(0, 0.95, 0.25);
        this.meshGroup.add(this.coreLight);

        // 5. Angular Head & Electric Lime Optical Sensor Visor
        const headGeo = new THREE.BoxGeometry(0.44, 0.32, 0.4);
        const head = new THREE.Mesh(headGeo, this.neonHullMaterial);
        head.position.set(0, 1.62, 0);
        this.meshGroup.add(head);

        const visorGeo = new THREE.BoxGeometry(0.48, 0.1, 0.16);
        this.visorMaterial = new THREE.MeshBasicMaterial({ color: NEON_LIME });
        const visor = new THREE.Mesh(visorGeo, this.visorMaterial);
        visor.position.set(0, 1.62, -0.19);
        this.meshGroup.add(visor);

        // 6. Glowing Neon Outer Wireframe Cage (Spotted instantly from across the arena!)
        const cageGeo = new THREE.CylinderGeometry(0.54, 0.44, 1.3, 8);
        this.wireframeMaterial = new THREE.MeshBasicMaterial({
            color: 0xff00ff,
            wireframe: true,
            transparent: true,
            opacity: 0.65
        });
        const cageMesh = new THREE.Mesh(cageGeo, this.wireframeMaterial);
        cageMesh.position.y = 0.95;
        this.meshGroup.add(cageMesh);

        // 7. Floating Overhead Holographic Halo Ring
        const haloGeo = new THREE.RingGeometry(0.32, 0.42, 24);
        this.haloMaterial = new THREE.MeshBasicMaterial({
            color: NEON_MAGENTA,
            side: THREE.DoubleSide,
            transparent: true,
            opacity: 0.9
        });
        this.haloMesh = new THREE.Mesh(haloGeo, this.haloMaterial);
        this.haloMesh.rotation.x = -Math.PI / 2;
        this.haloMesh.position.set(0, 2.05, 0);
        this.meshGroup.add(this.haloMesh);

        // 8. Defensive Energy Shield (Cyan Wireframe Bubble)
        const shieldGeo = new THREE.SphereGeometry(1.3, 16, 16);
        this.shieldMaterial = new THREE.MeshBasicMaterial({
            color: 0x00F0FF,
            transparent: true,
            opacity: 0.55,
            wireframe: true
        });
        this.shieldMesh = new THREE.Mesh(shieldGeo, this.shieldMaterial);
        this.shieldMesh.position.y = 1.0;
        this.shieldMesh.visible = false;
        this.meshGroup.add(this.shieldMesh);

        // 9. Ground Targeting Ring Indicator
        const ringGeo = new THREE.RingGeometry(0.6, 0.74, 24);
        this.ringMaterial = new THREE.MeshBasicMaterial({ color: NEON_MAGENTA, side: THREE.DoubleSide });
        const ring = new THREE.Mesh(ringGeo, this.ringMaterial);
        ring.rotation.x = -Math.PI / 2;
        ring.position.y = 0.04;
        this.meshGroup.add(ring);

        // Register all flashable materials for hit response
        this.flashableMaterials = [
            this.neonHullMaterial,
            this.coreMaterial,
            this.visorMaterial,
            this.wireframeMaterial,
            this.haloMaterial,
            this.ringMaterial
        ];

        this.scene.add(this.meshGroup);
        this._spawnArrivalEffect();
    }

    _spawnArrivalEffect() {
        const THREE = (typeof window.THREE !== 'undefined') ? window.THREE : null;
        if (!this.scene || !THREE) return;

        // Visual neon arrival spark burst
        const count = 16;
        const sparkGeo = new THREE.BoxGeometry(0.08, 0.08, 0.08);
        const sparkMeshes = [];
        const center = new THREE.Vector3(this.position.x, 0.4, this.position.z);

        for (let i = 0; i < count; i++) {
            const col = (i % 2 === 0) ? 0xff00aa : 0x00ff66;
            const mat = new THREE.MeshBasicMaterial({ color: col });
            const m = new THREE.Mesh(sparkGeo, mat);
            m.position.copy(center);
            this.scene.add(m);

            const angle = (i / count) * Math.PI * 2;
            const speed = 3.5 + Math.random() * 3.0;
            const vel = new THREE.Vector3(
                Math.cos(angle) * speed,
                Math.random() * 4.0 + 1.5,
                Math.sin(angle) * speed
            );
            sparkMeshes.push({ mesh: m, vel: vel, life: 0.38, maxLife: 0.38 });
        }

        let lastTime = performance.now();
        const interval = setInterval(() => {
            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            let active = 0;

            for (const s of sparkMeshes) {
                s.life -= dt;
                if (s.life > 0) {
                    active++;
                    s.mesh.position.addScaledVector(s.vel, dt);
                    s.vel.y -= 12.0 * dt;
                    const scale = s.life / s.maxLife;
                    s.mesh.scale.set(scale, scale, scale);
                } else if (s.mesh.parent) {
                    s.mesh.parent.remove(s.mesh);
                    if (s.mesh.geometry) s.mesh.geometry.dispose();
                    if (s.mesh.material) s.mesh.material.dispose();
                }
            }

            if (active === 0) {
                clearInterval(interval);
            }
        }, 16);
    }

    getAABB() {
        const halfSize = new Vector3(0.55, 1.0, 0.55);
        const min = new Vector3(
            this.position.x - halfSize.x,
            this.position.y,
            this.position.z - halfSize.z
        );
        const max = new Vector3(
            this.position.x + halfSize.x,
            this.position.y + 1.9,
            this.position.z + halfSize.z
        );
        return new AABB(min, max, 'enemy', { enemy: this });
    }

    _pickRandomPatrolTarget() {
        const angle = Math.random() * Math.PI * 2;
        const dist = 3.5 + Math.random() * 7.5;
        return new Vector3(
            this.homePos.x + Math.cos(angle) * dist,
            0,
            this.homePos.z + Math.sin(angle) * dist
        );
    }

    onDeflect() {
        this.shieldFlash = 0.35;
        if (this.shieldMesh) {
            this.shieldMesh.visible = true;
            this.shieldMesh.scale.set(1.15, 1.15, 1.15);
        }
    }

    takeDamage(amount, bounces) {
        if (!this.alive) return;
        this.health -= amount;
        this.damageFlash = 0.45;

        // Visual feedback on hit: burst of vibrant neon sparks
        this._spawnHitSparks(bounces || 1);

        if (this.health <= 0) {
            this.alive = false;
            this.state = 'DEAD';
            this._triggerDeath();
        }
    }

    _spawnHitSparks(bounces = 1) {
        const THREE = (typeof window.THREE !== 'undefined') ? window.THREE : null;
        if (!this.scene || !THREE) return;

        const count = 14 + bounces * 6;
        const sparkGeo = new THREE.BoxGeometry(0.09, 0.09, 0.09);
        const sparkMeshes = [];
        const center = new THREE.Vector3(this.position.x, this.position.y + 0.95, this.position.z);

        for (let i = 0; i < count; i++) {
            const col = (i % 3 === 0) ? 0xffffff : ((i % 2 === 0) ? 0xff00aa : 0x00ff66);
            const mat = new THREE.MeshBasicMaterial({ color: col });
            const m = new THREE.Mesh(sparkGeo, mat);
            m.position.copy(center);
            this.scene.add(m);

            const vel = new THREE.Vector3(
                (Math.random() - 0.5) * 8.5,
                Math.random() * 6.5 + 2.0,
                (Math.random() - 0.5) * 8.5
            );
            sparkMeshes.push({ mesh: m, vel: vel, life: 0.32, maxLife: 0.32 });
        }

        let lastTime = performance.now();
        const interval = setInterval(() => {
            const now = performance.now();
            const dt = Math.min((now - lastTime) / 1000, 0.05);
            lastTime = now;
            let active = 0;

            for (const s of sparkMeshes) {
                s.life -= dt;
                if (s.life > 0) {
                    active++;
                    s.mesh.position.addScaledVector(s.vel, dt);
                    s.vel.y -= 14.0 * dt;
                    const scale = s.life / s.maxLife;
                    s.mesh.scale.set(scale, scale, scale);
                } else if (s.mesh.parent) {
                    s.mesh.parent.remove(s.mesh);
                    if (s.mesh.geometry) s.mesh.geometry.dispose();
                    if (s.mesh.material) s.mesh.material.dispose();
                }
            }

            if (active === 0) {
                clearInterval(interval);
            }
        }, 16);
    }

    setTargetedByLethal(isTargeted) {
        this.isTargetedByLethal = isTargeted;
    }

    _triggerDeath() {
        if (!this.meshGroup || !this.scene) return;

        const THREE = (typeof window.THREE !== 'undefined') ? window.THREE : null;
        if (this.scene && THREE) {
            // High-intensity radial death explosion with neon hot pink and electric lime sparks
            const burstCount = 28;
            const sparkMeshes = [];
            const center = new THREE.Vector3(this.position.x, this.position.y + 0.95, this.position.z);
            const geo = new THREE.BoxGeometry(0.12, 0.12, 0.12);

            for (let i = 0; i < burstCount; i++) {
                const col = (i % 2 === 0) ? 0xff00aa : 0x00ff66;
                const mat = new THREE.MeshBasicMaterial({ color: col });
                const m = new THREE.Mesh(geo, mat);
                m.position.copy(center);
                this.scene.add(m);

                const vel = new THREE.Vector3(
                    (Math.random() - 0.5) * 12.0,
                    Math.random() * 8.0 + 3.0,
                    (Math.random() - 0.5) * 12.0
                );
                sparkMeshes.push({ mesh: m, vel: vel, life: 0.5, maxLife: 0.5 });
            }

            let lastTime = performance.now();
            const sparkInterval = setInterval(() => {
                const now = performance.now();
                const dt = Math.min((now - lastTime) / 1000, 0.05);
                lastTime = now;
                let active = 0;
                for (const s of sparkMeshes) {
                    s.life -= dt;
                    if (s.life > 0) {
                        active++;
                        s.mesh.position.addScaledVector(s.vel, dt);
                        s.vel.y -= 14.0 * dt;
                        const sc = s.life / s.maxLife;
                        s.mesh.scale.set(sc, sc, sc);
                    } else if (s.mesh.parent) {
                        s.mesh.parent.remove(s.mesh);
                        if (s.mesh.geometry) s.mesh.geometry.dispose();
                        if (s.mesh.material) s.mesh.material.dispose();
                    }
                }
                if (active === 0) {
                    clearInterval(sparkInterval);
                }
            }, 16);
        }

        // Dissolve & shrink mesh group
        let progress = 1.0;
        const deathInterval = setInterval(() => {
            progress -= 0.14;
            if (this.meshGroup) {
                if (this.meshGroup.scale) this.meshGroup.scale.set(progress, progress, progress);
                if (this.meshGroup.position) this.meshGroup.position.y -= 0.09;
            }
            if (progress <= 0) {
                clearInterval(deathInterval);
                if (this.scene && this.meshGroup) {
                    this.scene.remove(this.meshGroup);
                }
            }
        }, 30);
    }

    _setColor(matColor, hex) {
        if (!matColor) return;
        if (typeof matColor.setHex === 'function') matColor.setHex(hex);
        else if (typeof matColor.set === 'function') matColor.set(hex);
    }

    _setEmissive(mat, hex, intensity) {
        if (!mat) return;
        if (mat.emissive) {
            if (typeof mat.emissive.setHex === 'function') mat.emissive.setHex(hex);
            else if (typeof mat.emissive.set === 'function') mat.emissive.set(hex);
        }
        if (typeof intensity === 'number') {
            mat.emissiveIntensity = intensity;
        }
    }

    update(delta, playerPos, onPlayerDamaged, otherEnemies = []) {
        if (!this.alive) return;

        this.bobTime += delta * 3.5;

        // Visual flash & reactor pulse
        if (this.damageFlash > 0) {
            this.damageFlash -= delta;
            if (this.flashableMaterials) {
                for (const mat of this.flashableMaterials) {
                    this._setEmissive(mat, 0xffffff, 4.5);
                    this._setColor(mat.color, 0xffffff);
                }
            }
            if (this.coreLight) {
                this._setColor(this.coreLight.color, 0xffffff);
                this.coreLight.intensity = 5.0;
            }
        } else {
            const baseIntensity = this.isTargetedByLethal ? 2.8 : 1.85;
            const pulse = baseIntensity + Math.sin(this.bobTime) * 0.35;

            if (this.neonHullMaterial) {
                this._setColor(this.neonHullMaterial.color, 0xff00aa);
                this._setEmissive(this.neonHullMaterial, 0xff0066, pulse);
            }
            if (this.coreMaterial) {
                this._setColor(this.coreMaterial.color, 0xff00aa);
                this._setEmissive(this.coreMaterial, 0xff00ff, pulse * 1.2);
            }
            if (this.visorMaterial) {
                this._setColor(this.visorMaterial.color, 0x00ff66);
            }
            if (this.wireframeMaterial) {
                this._setColor(this.wireframeMaterial.color, 0xff00ff);
            }
            if (this.haloMaterial) {
                this._setColor(this.haloMaterial.color, 0xff00aa);
            }
            if (this.ringMaterial) {
                this._setColor(this.ringMaterial.color, 0xff00aa);
            }
            if (this.coreLight) {
                this._setColor(this.coreLight.color, 0xff00aa);
                this.coreLight.intensity = 2.8 + Math.sin(this.bobTime) * 0.6;
            }
        }

        // Animate floating overhead halo ring
        if (this.haloMesh) {
            this.haloMesh.rotation.z += delta * 2.5;
        }

        if (this.shieldFlash > 0) {
            this.shieldFlash -= delta;
            if (this.shieldMesh) {
                const s = 1.0 + this.shieldFlash * 0.5;
                this.shieldMesh.scale.set(s, s, s);
            }
        } else {
            if (this.shieldMesh) this.shieldMesh.visible = false;
        }

        const toPlayer = new Vector3(playerPos.x - this.position.x, 0, playerPos.z - this.position.z);
        const distToPlayer = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.z * toPlayer.z);

        // Relentless pursuit state machine: ATTACK when in melee range, otherwise aggressive CHASE
        if (distToPlayer <= this.attackRange) {
            this.state = 'ATTACK';
            // Maintain slight buffer spacing so mech doesn't clip into camera
            if (distToPlayer < 1.2 && distToPlayer > 0.001) {
                const buffer = 1.2 - distToPlayer;
                this.position.x -= (toPlayer.x / distToPlayer) * buffer * 0.6;
                this.position.z -= (toPlayer.z / distToPlayer) * buffer * 0.6;
            }

            // Face directly toward the player while in attack stance
            if (toPlayer.lengthSq() > 0.001) {
                const targetYaw = Math.atan2(toPlayer.x, toPlayer.z);
                this.yaw = this._lerpAngle(this.yaw, targetYaw, delta * 9.0);
            }

            this.attackTimer += delta;
            if (this.attackTimer >= this.attackRate) {
                this.attackTimer = 0;
                this.sound.playPlayerDamage();
                if (onPlayerDamaged) onPlayerDamaged(15);
            }
        } else {
            this.state = 'CHASE';
            const moveDir = this._computeNavDirection(playerPos, delta, otherEnemies);

            this.position.x += moveDir.x * this.chaseSpeed * delta;
            this.position.z += moveDir.z * this.chaseSpeed * delta;

            if (moveDir.lengthSq() > 0.001) {
                const targetYaw = Math.atan2(moveDir.x, moveDir.z);
                this.yaw = this._lerpAngle(this.yaw, targetYaw, delta * 7.5);
            }
        }

        // Resolve collision with static pillars and obstacles
        this.physics.resolveSphereCollision(this.position, 0.55, 1.9);

        // Keep mechs strictly within arena boundaries
        this.position.x = Math.max(-28.2, Math.min(28.2, this.position.x));
        this.position.z = Math.max(-28.2, Math.min(28.2, this.position.z));

        // Sync 3D model
        if (this.meshGroup) {
            this.meshGroup.position.set(this.position.x, this.position.y, this.position.z);
            this.meshGroup.rotation.y = this.yaw;
        }
    }

    _computeNavDirection(playerPos, delta, otherEnemies = []) {
        const toPlayer = new Vector3(playerPos.x - this.position.x, 0, playerPos.z - this.position.z);
        const distToPlayer = Math.sqrt(toPlayer.x * toPlayer.x + toPlayer.z * toPlayer.z);
        if (distToPlayer < 0.001) return new Vector3(0, 0, 0);

        const directDir = toPlayer.clone().normalize();
        const baseAngle = Math.atan2(directDir.x, directDir.z);

        // Stuck detection against walls/corners
        if (!this.lastPosition) this.lastPosition = this.position.clone();
        const frameDist = this.position.distanceTo(this.lastPosition);
        const expectedDist = this.chaseSpeed * delta * 0.25;

        if (frameDist < expectedDist && delta > 0.0001) {
            this.stuckTimer += delta;
            if (this.stuckTimer > 0.3) {
                // Detour escape mode: flank around obstacle
                this.stuckDetourTimer = 0.65;
                this.preferredFlank = -this.preferredFlank;
                this.stuckDetourDir.set(-directDir.z * this.preferredFlank, 0, directDir.x * this.preferredFlank).normalize();
                this.stuckTimer = 0;
            }
        } else {
            this.stuckTimer = Math.max(0, this.stuckTimer - delta * 1.5);
        }
        this.lastPosition.copy(this.position);

        let chosenDir = null;

        if (this.stuckDetourTimer > 0) {
            this.stuckDetourTimer -= delta;
            chosenDir = new Vector3(
                this.stuckDetourDir.x * 0.75 + directDir.x * 0.25,
                0,
                this.stuckDetourDir.z * 0.75 + directDir.z * 0.25
            ).normalize();
        } else {
            // Multi-whisker directional feelers to guide path around pillars & walls
            const flank = this.preferredFlank || 1;
            const whiskerOffsets = [
                0,
                0.42 * flank,
                -0.42 * flank,
                0.85 * flank,
                -0.85 * flank,
                1.30 * flank,
                -1.30 * flank
            ];

            const eyePos = new Vector3(this.position.x, 1.0, this.position.z);
            const probeDist = Math.min(3.2, distToPlayer);
            let bestClearance = -1;
            let bestDir = directDir;

            for (const offset of whiskerOffsets) {
                const angle = baseAngle + offset;
                const candDir = new Vector3(Math.sin(angle), 0, Math.cos(angle)).normalize();

                // 1. Raycast feeler test
                const hit = this.physics.raycast(eyePos, candDir, probeDist);

                // 2. Dual-depth sphere probe tests (near 0.85m and forward 1.7m)
                const probePosNear = new Vector3(
                    this.position.x + candDir.x * 0.85,
                    0.9,
                    this.position.z + candDir.z * 0.85
                );
                const probePosFar = new Vector3(
                    this.position.x + candDir.x * 1.7,
                    0.9,
                    this.position.z + candDir.z * 1.7
                );
                let collidesWithAABB = false;
                for (const box of this.physics.staticObstacles) {
                    if (box.tag === 'floor' || box.isBroken) continue;
                    if (box.intersectsSphere(probePosNear, 0.6) || box.intersectsSphere(probePosFar, 0.6)) {
                        collidesWithAABB = true;
                        break;
                    }
                }

                if (!hit && !collidesWithAABB) {
                    bestDir = candDir;
                    bestClearance = 999;
                    break;
                } else {
                    const clearance = hit ? hit.distance : 1.2;
                    if (!collidesWithAABB && clearance > bestClearance) {
                        bestClearance = clearance;
                        bestDir = candDir;
                    }
                }
            }

            chosenDir = bestDir;
        }

        // Mech-to-mech dynamic separation / anti-clumping
        if (otherEnemies && otherEnemies.length > 0) {
            const repulsion = new Vector3(0, 0, 0);
            for (const other of otherEnemies) {
                if (other === this || !other.alive) continue;
                const sep = this.position.clone().sub(other.position);
                sep.y = 0;
                const d = sep.length();
                if (d > 0.001 && d < 1.8) {
                    const force = (1.8 - d) * 1.6;
                    repulsion.add(sep.normalize().multiplyScalar(force));
                }
            }
            if (repulsion.lengthSq() > 0.001) {
                chosenDir.add(repulsion);
            }
        }

        if (chosenDir.lengthSq() < 0.0001) {
            chosenDir = directDir;
        } else {
            chosenDir.normalize();
        }

        return chosenDir;
    }

    _lerpAngle(a, b, t) {
        let diff = (b - a) % (Math.PI * 2);
        if (diff < -Math.PI) diff += Math.PI * 2;
        if (diff > Math.PI) diff -= Math.PI * 2;
        return a + diff * t;
    }

    destroy() {
        if (this.scene && this.meshGroup) {
            this.scene.remove(this.meshGroup);
        }
    }
}

export class EnemyManager {
    constructor(physics, soundManager, scene) {
        this.physics = physics;
        this.sound = soundManager;
        this.scene = scene;
        this.enemies = [];
    }

    setScene(scene) {
        this.scene = scene;
    }

    spawnEnemy(x, z) {
        const id = this.enemies.length + 1;
        const enemy = new Enemy(id, new Vector3(x, 0, z), this.physics, this.sound, this.scene);
        this.enemies.push(enemy);
        return enemy;
    }

    clear() {
        for (const e of this.enemies) {
            e.destroy();
        }
        this.enemies = [];
    }

    update(delta, playerPos, onPlayerDamaged, otherEnemies = []) {
        for (const e of this.enemies) {
            if (!e.alive) continue;
            e.update(delta, playerPos, onPlayerDamaged, this.enemies);
        }
    }

    render(nativeRenderer) {
        if (nativeRenderer) {
            for (const e of this.enemies) {
                if (!e.alive) continue;
                const center = new Vector3(e.position.x, e.position.y + 0.9, e.position.z);
                const size = new Vector3(0.9, 1.8, 0.9);
                const bodyColor = (e.damageFlash > 0) ? [1.0, 0.1, 0.2] : [0.8, 0.05, 0.2];
                const emission = (e.damageFlash > 0) ? [2.0, 0.2, 0.4] : [0.8, 0.05, 0.2];
                nativeRenderer.drawBox(center, size, bodyColor, emission, e.yaw);
            }
        }
    }
}
