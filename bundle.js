(() => {
"use strict";

// ==============================================================================
// FILE: src/core/Math3D.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - 3D Math Engine (Math3D.js)
 * Implements Vector3, Matrix4, and the core surface normal reflection formula:
 * reflection_vector = incident - 2 * (incident.dot(normal)) * normal
 * ==============================================================================
 */

class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    set(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    clone() {
        return new Vector3(this.x, this.y, this.z);
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    addVectors(a, b) {
        this.x = a.x + b.x;
        this.y = a.y + b.y;
        this.z = a.z + b.z;
        return this;
    }

    sub(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    subVectors(a, b) {
        this.x = a.x - b.x;
        this.y = a.y - b.y;
        this.z = a.z - b.z;
        return this;
    }

    multiplyScalar(s) {
        this.x *= s;
        this.y *= s;
        this.z *= s;
        return this;
    }

    divideScalar(s) {
        if (s !== 0) {
            this.x /= s;
            this.y /= s;
            this.z /= s;
        }
        return this;
    }

    dot(v) {
        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    cross(v) {
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;
        this.x = x;
        this.y = y;
        this.z = z;
        return this;
    }

    crossVectors(a, b) {
        this.x = a.y * b.z - a.z * b.y;
        this.y = a.z * b.x - a.x * b.z;
        this.z = a.x * b.y - a.y * b.x;
        return this;
    }

    lengthSq() {
        return this.x * this.x + this.y * this.y + this.z * this.z;
    }

    length() {
        return Math.sqrt(this.lengthSq());
    }

    normalize() {
        const len = this.length();
        if (len > 0.00001) {
            this.x /= len;
            this.y /= len;
            this.z /= len;
        }
        return this;
    }

    distanceTo(v) {
        const dx = this.x - v.x;
        const dy = this.y - v.y;
        const dz = this.z - v.z;
        return Math.sqrt(dx * dx + dy * dy + dz * dz);
    }

    lerp(v, alpha) {
        this.x += (v.x - this.x) * alpha;
        this.y += (v.y - this.y) * alpha;
        this.z += (v.z - this.z) * alpha;
        return this;
    }

    /**
     * =========================================================================
     * CORE RICOCHET FORMULA:
     * reflection_vector = incident - 2 * (incident.dot(normal)) * normal
     * =========================================================================
     * Reflects this incident vector across a given surface normal.
     * Assumes normal is normalized.
     */
    reflect(normal) {
        const dot2 = 2.0 * this.dot(normal);
        return new Vector3(
            this.x - dot2 * normal.x,
            this.y - dot2 * normal.y,
            this.z - dot2 * normal.z
        );
    }
}

class Matrix4 {
    constructor() {
        this.elements = new Float32Array([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    }

    identity() {
        const te = this.elements;
        te[0] = 1; te[4] = 0; te[8]  = 0; te[12] = 0;
        te[1] = 0; te[5] = 1; te[9]  = 0; te[13] = 0;
        te[2] = 0; te[6] = 0; te[10] = 1; te[14] = 0;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        return this;
    }

    copy(m) {
        this.elements.set(m.elements);
        return this;
    }

    clone() {
        const m = new Matrix4();
        m.copy(this);
        return m;
    }

    multiply(m) {
        return this.multiplyMatrices(this, m);
    }

    multiplyMatrices(a, b) {
        const ae = a.elements;
        const be = b.elements;
        const te = this.elements;

        const a11 = ae[0], a12 = ae[4], a13 = ae[8],  a14 = ae[12];
        const a21 = ae[1], a22 = ae[5], a23 = ae[9],  a24 = ae[13];
        const a31 = ae[2], a32 = ae[6], a33 = ae[10], a34 = ae[14];
        const a41 = ae[3], a42 = ae[7], a43 = ae[11], a44 = ae[15];

        const b11 = be[0], b12 = be[4], b13 = be[8],  b14 = be[12];
        const b21 = be[1], b22 = be[5], b23 = be[9],  b24 = be[13];
        const b31 = be[2], b32 = be[6], b33 = be[10], b34 = be[14];
        const b41 = be[3], b42 = be[7], b43 = be[11], b44 = be[15];

        te[0]  = a11 * b11 + a12 * b21 + a13 * b31 + a14 * b41;
        te[4]  = a11 * b12 + a12 * b22 + a13 * b32 + a14 * b42;
        te[8]  = a11 * b13 + a12 * b23 + a13 * b33 + a14 * b43;
        te[12] = a11 * b14 + a12 * b24 + a13 * b34 + a14 * b44;

        te[1]  = a21 * b11 + a22 * b21 + a23 * b31 + a24 * b41;
        te[5]  = a21 * b12 + a22 * b22 + a23 * b32 + a24 * b42;
        te[9]  = a21 * b13 + a22 * b23 + a23 * b33 + a24 * b43;
        te[13] = a21 * b14 + a22 * b24 + a23 * b34 + a24 * b44;

        te[2]  = a31 * b11 + a32 * b21 + a33 * b31 + a34 * b41;
        te[6]  = a31 * b12 + a32 * b22 + a33 * b32 + a34 * b42;
        te[10] = a31 * b13 + a32 * b23 + a33 * b33 + a34 * b43;
        te[14] = a31 * b14 + a32 * b24 + a33 * b34 + a34 * b44;

        te[3]  = a41 * b11 + a42 * b21 + a43 * b31 + a44 * b41;
        te[7]  = a41 * b12 + a42 * b22 + a43 * b32 + a44 * b42;
        te[11] = a41 * b13 + a42 * b23 + a43 * b33 + a44 * b43;
        te[15] = a41 * b14 + a42 * b24 + a43 * b34 + a44 * b44;

        return this;
    }

    makePerspective(fovYDeg, aspect, near, far) {
        const te = this.elements;
        const top = near * Math.tan((fovYDeg * Math.PI) / 360.0);
        const bottom = -top;
        const left = bottom * aspect;
        const right = top * aspect;

        const x = (2 * near) / (right - left);
        const y = (2 * near) / (top - bottom);

        const a = (right + left) / (right - left);
        const b = (top + bottom) / (top - bottom);
        const c = -(far + near) / (far - near);
        const d = -(2 * far * near) / (far - near);

        te[0] = x;  te[4] = 0;  te[8]  = a;  te[12] = 0;
        te[1] = 0;  te[5] = y;  te[9]  = b;  te[13] = 0;
        te[2] = 0;  te[6] = 0;  te[10] = c;  te[14] = d;
        te[3] = 0;  te[7] = 0;  te[11] = -1; te[15] = 0;

        return this;
    }

    makeLookAt(eye, target, up) {
        const z = new Vector3().subVectors(eye, target).normalize();
        const x = new Vector3().crossVectors(up, z).normalize();
        const y = new Vector3().crossVectors(z, x).normalize();

        const te = this.elements;
        te[0] = x.x; te[4] = x.y; te[8]  = x.z; te[12] = -x.dot(eye);
        te[1] = y.x; te[5] = y.y; te[9]  = y.z; te[13] = -y.dot(eye);
        te[2] = z.x; te[6] = z.y; te[10] = z.z; te[14] = -z.dot(eye);
        te[3] = 0;   te[7] = 0;   te[11] = 0;   te[15] = 1;

        return this;
    }

    makeTranslation(x, y, z) {
        const te = this.elements;
        te[0] = 1; te[4] = 0; te[8]  = 0; te[12] = x;
        te[1] = 0; te[5] = 1; te[9]  = 0; te[13] = y;
        te[2] = 0; te[6] = 0; te[10] = 1; te[14] = z;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        return this;
    }

    makeRotationY(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const te = this.elements;
        te[0] = c;  te[4] = 0; te[8]  = s; te[12] = 0;
        te[1] = 0;  te[5] = 1; te[9]  = 0; te[13] = 0;
        te[2] = -s; te[6] = 0; te[10] = c; te[14] = 0;
        te[3] = 0;  te[7] = 0; te[11] = 0; te[15] = 1;
        return this;
    }

    makeRotationX(theta) {
        const c = Math.cos(theta);
        const s = Math.sin(theta);
        const te = this.elements;
        te[0] = 1; te[4] = 0;  te[8]  = 0;  te[12] = 0;
        te[1] = 0; te[5] = c;  te[9]  = -s; te[13] = 0;
        te[2] = 0; te[6] = s;  te[10] = c;  te[14] = 0;
        te[3] = 0; te[7] = 0;  te[11] = 0;  te[15] = 1;
        return this;
    }

    makeScale(x, y, z) {
        const te = this.elements;
        te[0] = x; te[4] = 0; te[8]  = 0; te[12] = 0;
        te[1] = 0; te[5] = y; te[9]  = 0; te[13] = 0;
        te[2] = 0; te[6] = 0; te[10] = z; te[14] = 0;
        te[3] = 0; te[7] = 0; te[11] = 0; te[15] = 1;
        return this;
    }
}



// ==============================================================================
// FILE: src/weapons/WeaponConfig.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Weapon Arsenal Catalog (WeaponConfig.js)
 * Defines weapon variants, economy costs, ballistic speeds, bounce endurance,
 * magazine capacities, and visual rail themes.
 * ==============================================================================
 */

const WEAPON_CATALOG = [
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

function getWeaponConfig(id) {
    const found = WEAPON_CATALOG.find(w => w.id === id);
    return found || WEAPON_CATALOG[0];
}



// ==============================================================================
// FILE: src/core/Physics.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Physics & Raycasting Engine (Physics.js)
 * Implements 3D AABB ray intersections, continuous collision detection,
 * surface normal calculation, and multi-segment ricochet trajectory tracing.
 * ==============================================================================
 */


class AABB {
    constructor(min, max, tag = 'wall', extra = {}) {
        this.min = min.clone();
        this.max = max.clone();
        this.tag = tag; // 'wall', 'pillar', 'enemy', 'floor'
        this.materialType = extra.materialType || 'concrete'; // 'concrete', 'grate', 'glass'
        this.isBroken = false;
        this.mesh = null;
        this.extra = extra;
    }

    getCenter() {
        return new Vector3(
            (this.min.x + this.max.x) * 0.5,
            (this.min.y + this.max.y) * 0.5,
            (this.min.z + this.max.z) * 0.5
        );
    }

    getSize() {
        return new Vector3(
            this.max.x - this.min.x,
            this.max.y - this.min.y,
            this.max.z - this.min.z
        );
    }

    intersectsSphere(center, radius) {
        let sqDist = 0;
        const coords = ['x', 'y', 'z'];
        for (const c of coords) {
            const val = center[c];
            if (val < this.min[c]) sqDist += (this.min[c] - val) * (this.min[c] - val);
            if (val > this.max[c]) sqDist += (val - this.max[c]) * (val - this.max[c]);
        }
        return sqDist <= radius * radius;
    }
}

class PhysicsWorld {
    constructor() {
        this.staticObstacles = [];
    }

    addStaticObstacle(min, max, tag = 'wall', color = [0.2, 0.25, 0.3], materialType = 'concrete') {
        const box = new AABB(min, max, tag, { color, materialType });
        box.materialType = materialType;
        this.staticObstacles.push(box);
        return box;
    }

    /**
     * Ray-AABB intersection using the Slab method.
     * Returns { hit, distance, point, normal, box } or null.
     */
    intersectRayAABB(origin, dir, box, maxDistance = Infinity) {
        let tmin = -Infinity;
        let tmax = Infinity;

        let normal = new Vector3();
        let nearNormal = new Vector3();

        const axes = ['x', 'y', 'z'];
        for (let i = 0; i < 3; i++) {
            const axis = axes[i];
            const ro = origin[axis];
            const rd = dir[axis];
            const bmin = box.min[axis];
            const bmax = box.max[axis];

            if (Math.abs(rd) < 1e-8) {
                // Ray is parallel to slab. If ray origin is outside slab, no hit.
                if (ro < bmin || ro > bmax) return null;
            } else {
                let t1 = (bmin - ro) / rd;
                let t2 = (bmax - ro) / rd;
                let sign = -1;

                if (t1 > t2) {
                    const temp = t1; t1 = t2; t2 = temp;
                    sign = 1;
                }

                if (t1 > tmin) {
                    tmin = t1;
                    nearNormal.set(0, 0, 0);
                    nearNormal[axis] = sign * (rd > 0 ? -1 : 1);
                }

                if (t2 < tmax) {
                    tmax = t2;
                }

                if (tmin > tmax || tmax < 0) return null;
            }
        }

        const hitDist = tmin >= 0 ? tmin : tmax;
        if (hitDist < 0 || hitDist > maxDistance) return null;

        const hitPoint = new Vector3(
            origin.x + dir.x * hitDist,
            origin.y + dir.y * hitDist,
            origin.z + dir.z * hitDist
        );

        return {
            hit: true,
            distance: hitDist,
            point: hitPoint,
            normal: nearNormal.normalize(),
            box: box
        };
    }

    /**
     * Casts a ray against static obstacles and optional dynamic entities (enemies).
     */
    raycast(origin, dir, maxDistance = 100, dynamicBoxes = []) {
        let closestHit = null;
        let minDistance = maxDistance;

        // Check static environment
        for (const box of this.staticObstacles) {
            if (box.isBroken) continue;
            const res = this.intersectRayAABB(origin, dir, box, minDistance);
            if (res && res.distance < minDistance) {
                minDistance = res.distance;
                closestHit = res;
            }
        }

        // Check dynamic entities
        for (const box of dynamicBoxes) {
            const res = this.intersectRayAABB(origin, dir, box, minDistance);
            if (res && res.distance < minDistance) {
                minDistance = res.distance;
                closestHit = res;
            }
        }

        return closestHit;
    }

    /**
     * Trace predictive ricochet trajectory.
     * Evaluates multi-bounce segments:
     * Segment 1: Gun origin -> First wall collision (Cyan)
     * Segment 2: First wall reflection -> Second wall/target (Crimson)
     * Segment 3: Second wall reflection -> Third wall/target (Amber / Double Bank)
     */
    traceRicochetTrajectory(origin, forwardDir, range1 = 60, range2 = 40, enemies = []) {
        const enemyBoxes = enemies.filter(e => e.alive).map(e => e.getAABB());

        const result = {
            hasBounce: false,
            bouncesCount: 0,
            p0: origin.clone(),
            p1: null,
            p2: null,
            p3: null,
            normal: null,
            directHitEnemy: false,
            lethalLock: false,
            hitEnemyRef: null,
            surface1: null,
            surface2: null
        };

        // Segment 1 Raycast
        const hit1 = this.raycast(origin, forwardDir, range1, enemyBoxes);

        if (!hit1) {
            result.p1 = new Vector3(
                origin.x + forwardDir.x * range1,
                origin.y + forwardDir.y * range1,
                origin.z + forwardDir.z * range1
            );
            return result;
        }

        result.p1 = hit1.point.clone();
        result.normal = hit1.normal.clone();

        if (hit1.box.tag === 'enemy') {
            // Direct shot on enemy -> Ricochet Rule: ZERO DAMAGE!
            result.directHitEnemy = true;
            result.hitEnemyRef = hit1.box.extra.enemy;
            return result;
        }

        // Hit a static wall/obstacle -> Calculate reflection vector
        result.hasBounce = true;
        result.bouncesCount = 1;
        result.surface1 = hit1.box.materialType || 'concrete';

        // Formula: reflection_vector = incident - 2 * (incident.dot(normal)) * normal
        const reflectDir = forwardDir.reflect(hit1.normal).normalize();

        // Segment 2 Raycast (nudged slightly along normal to prevent self-intersection)
        const seg2Origin = hit1.point.clone().add(hit1.normal.clone().multiplyScalar(0.02));
        const hit2 = this.raycast(seg2Origin, reflectDir, range2, enemyBoxes);

        if (!hit2) {
            result.p2 = new Vector3(
                seg2Origin.x + reflectDir.x * range2,
                seg2Origin.y + reflectDir.y * range2,
                seg2Origin.z + reflectDir.z * range2
            );
        } else {
            result.p2 = hit2.point.clone();
            if (hit2.box.tag === 'enemy') {
                // LETHAL BANK SHOT (1 bounce)
                result.lethalLock = true;
                result.bouncesCount = 1;
                result.hitEnemyRef = hit2.box.extra.enemy;
            } else {
                // Hit second static surface -> calculate 3rd segment (Double-Bank shot)
                result.bouncesCount = 2;
                result.surface2 = hit2.box.materialType || 'concrete';
                const reflectDir2 = reflectDir.reflect(hit2.normal).normalize();
                const seg3Origin = hit2.point.clone().add(hit2.normal.clone().multiplyScalar(0.02));
                const hit3 = this.raycast(seg3Origin, reflectDir2, 35, enemyBoxes);

                if (!hit3) {
                    result.p3 = new Vector3(
                        seg3Origin.x + reflectDir2.x * 35,
                        seg3Origin.y + reflectDir2.y * 35,
                        seg3Origin.z + reflectDir2.z * 35
                    );
                } else {
                    result.p3 = hit3.point.clone();
                    if (hit3.box.tag === 'enemy') {
                        // DOUBLE BANK LETHAL LOCK!
                        result.lethalLock = true;
                        result.bouncesCount = 2;
                        result.hitEnemyRef = hit3.box.extra.enemy;
                    }
                }
            }
        }

        return result;
    }

    /**
     * Resolves player/enemy sphere collision against static obstacles.
     * Supports both foot-based origin (isEyePos = false) and eye-based origin (isEyePos = true).
     */
    resolveSphereCollision(position, radius, height = 1.8, isEyePos = false, eyeHeight = 1.6) {
        const bottomY = isEyePos ? Math.max(0, position.y - eyeHeight) : position.y;
        const topY = bottomY + height;

        for (const box of this.staticObstacles) {
            if (box.tag === 'floor' || box.isBroken) continue;

            // Check cylinder/capsule against AABB
            const closestX = Math.max(box.min.x, Math.min(position.x, box.max.x));
            const closestZ = Math.max(box.min.z, Math.min(position.z, box.max.z));

            const dx = position.x - closestX;
            const dz = position.z - closestZ;

            const distSq = dx * dx + dz * dz;
            if (distSq < radius * radius && bottomY < box.max.y && topY > box.min.y) {
                const dist = Math.sqrt(distSq);
                if (dist > 0.0001) {
                    const overlap = radius - dist;
                    position.x += (dx / dist) * overlap;
                    position.z += (dz / dist) * overlap;
                } else {
                    position.z += radius;
                }
            }
        }
    }
}



// ==============================================================================
// FILE: src/core/WebGLRenderer.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - WebGL 3D Renderer (WebGLRenderer.js)
 * Implements cyberpunk lighting, brutalist concrete shading, laser sight beams,
 * and high-contrast glowing neon accents.
 * ==============================================================================
 */


class WebGLRenderer {
    constructor(canvas) {
        this.canvas = canvas;
        try {
            this.gl = (canvas && typeof canvas.getContext === 'function')
                ? canvas.getContext('webgl', { antialias: true, alpha: false })
                : null;
        } catch (e) {
            this.gl = null;
        }

        if (!this.gl) {
            console.warn('WebGL not supported or context unavailable.');
            return;
        }

        this.projMatrix = new Matrix4();
        this.viewMatrix = new Matrix4();
        this.modelMatrix = new Matrix4();

        this._initShaders();
        this._initMeshes();
        this._initLineBuffers();

        this.gl.enable(this.gl.DEPTH_TEST);
        this.gl.enable(this.gl.CULL_FACE);
        this.gl.cullFace(this.gl.BACK);

        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        if (!this.gl) return;
        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.canvas.width = window.innerWidth * dpr;
        this.canvas.height = window.innerHeight * dpr;
        this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
        this.aspect = this.canvas.width / this.canvas.height;
        this.projMatrix.makePerspective(80.0, this.aspect, 0.1, 150.0);
    }

    _initShaders() {
        const gl = this.gl;

        // 1. Mesh Shader (Brutalist Concrete + Lighting + Fog)
        const vsMesh = `
            attribute vec3 aPosition;
            attribute vec3 aNormal;
            uniform mat4 uProjection;
            uniform mat4 uView;
            uniform mat4 uModel;

            varying vec3 vNormal;
            varying vec3 vFragPos;

            void main() {
                vec4 worldPos = uModel * vec4(aPosition, 1.0);
                vFragPos = worldPos.xyz;
                vNormal = mat3(uModel) * aNormal;
                gl_Position = uProjection * uView * worldPos;
            }
        `;

        const fsMesh = `
            precision mediump float;
            varying vec3 vNormal;
            varying vec3 vFragPos;

            uniform vec3 uColor;
            uniform vec3 uEmission;
            uniform vec3 uLightDir;
            uniform vec3 uCamPos;

            void main() {
                vec3 norm = normalize(vNormal);
                vec3 lightDir = normalize(uLightDir);

                // Diffuse + Ambient
                float diff = max(dot(norm, lightDir), 0.0);
                vec3 ambient = vec3(0.2, 0.25, 0.32);
                vec3 diffuse = diff * vec3(0.8, 0.85, 0.95);

                // Specular
                vec3 viewDir = normalize(uCamPos - vFragPos);
                vec3 reflectDir = reflect(-lightDir, norm);
                float spec = pow(max(dot(viewDir, reflectDir), 0.0), 16.0);
                vec3 specular = spec * vec3(0.4, 0.45, 0.5);

                vec3 baseColor = (ambient + diffuse + specular) * uColor + uEmission;

                // Cyberpunk Distance Fog
                float dist = length(uCamPos - vFragPos);
                float fogFactor = clamp((dist - 15.0) / (70.0 - 15.0), 0.0, 1.0);
                vec3 fogColor = vec3(0.04, 0.06, 0.09);

                gl_FragColor = vec4(mix(baseColor, fogColor, fogFactor), 1.0);
            }
        `;

        this.meshProgram = this._createProgram(vsMesh, fsMesh);

        // 2. Line / Laser Shader (Unshaded Emissive Glow)
        const vsLine = `
            attribute vec3 aPosition;
            attribute vec4 aColor;
            uniform mat4 uProjection;
            uniform mat4 uView;
            varying vec4 vColor;

            void main() {
                vColor = aColor;
                gl_Position = uProjection * uView * vec4(aPosition, 1.0);
            }
        `;

        const fsLine = `
            precision mediump float;
            varying vec4 vColor;

            void main() {
                gl_FragColor = vColor;
            }
        `;

        this.lineProgram = this._createProgram(vsLine, fsLine);
    }

    _createProgram(vsSource, fsSource) {
        const gl = this.gl;
        const vs = this._compileShader(gl.VERTEX_SHADER, vsSource);
        const fs = this._compileShader(gl.FRAGMENT_SHADER, fsSource);

        const prog = gl.createProgram();
        gl.attachShader(prog, vs);
        gl.attachShader(prog, fs);
        gl.linkProgram(prog);

        if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) {
            console.error('Shader link error:', gl.getProgramInfoLog(prog));
        }
        return prog;
    }

    _compileShader(type, source) {
        const gl = this.gl;
        const s = gl.createShader(type);
        gl.shaderSource(s, source);
        gl.compileShader(s);
        if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
            console.error('Shader compile error:', gl.getShaderInfoLog(s));
        }
        return s;
    }

    _initMeshes() {
        const gl = this.gl;

        const boxVerts = new Float32Array([
            // Front
            -0.5, -0.5,  0.5,   0.5, -0.5,  0.5,   0.5,  0.5,  0.5,  -0.5,  0.5,  0.5,
            // Back
            -0.5, -0.5, -0.5,  -0.5,  0.5, -0.5,   0.5,  0.5, -0.5,   0.5, -0.5, -0.5,
            // Top
            -0.5,  0.5, -0.5,  -0.5,  0.5,  0.5,   0.5,  0.5,  0.5,   0.5,  0.5, -0.5,
            // Bottom
            -0.5, -0.5, -0.5,   0.5, -0.5, -0.5,   0.5, -0.5,  0.5,  -0.5, -0.5,  0.5,
            // Right
             0.5, -0.5, -0.5,   0.5,  0.5, -0.5,   0.5,  0.5,  0.5,   0.5, -0.5,  0.5,
            // Left
            -0.5, -0.5, -0.5,  -0.5, -0.5,  0.5,  -0.5,  0.5,  0.5,  -0.5,  0.5, -0.5
        ]);

        const boxNorms = new Float32Array([
             0,  0,  1,   0,  0,  1,   0,  0,  1,   0,  0,  1,
             0,  0, -1,   0,  0, -1,   0,  0, -1,   0,  0, -1,
             0,  1,  0,   0,  1,  0,   0,  1,  0,   0,  1,  0,
             0, -1,  0,   0, -1,  0,   0, -1,  0,   0, -1,  0,
             1,  0,  0,   1,  0,  0,   1,  0,  0,   1,  0,  0,
            -1,  0,  0,  -1,  0,  0,  -1,  0,  0,  -1,  0,  0
        ]);

        const boxIndices = new Uint16Array([
             0,  1,  2,   0,  2,  3,
             4,  5,  6,   4,  6,  7,
             8,  9, 10,   8, 10, 11,
            12, 13, 14,  12, 14, 15,
            16, 17, 18,  16, 18, 19,
            20, 21, 22,  20, 22, 23
        ]);

        this.boxVBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.boxVBO);
        gl.bufferData(gl.ARRAY_BUFFER, boxVerts, gl.STATIC_DRAW);

        this.boxNBO = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, this.boxNBO);
        gl.bufferData(gl.ARRAY_BUFFER, boxNorms, gl.STATIC_DRAW);

        this.boxIBO = gl.createBuffer();
        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boxIBO);
        gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, boxIndices, gl.STATIC_DRAW);
        this.boxIndexCount = 36;
    }

    _initLineBuffers() {
        const gl = this.gl;
        this.lineVBO = gl.createBuffer();
        this.lineCBO = gl.createBuffer();
    }

    beginFrame(camPos, viewMatrix) {
        const gl = this.gl;
        if (!gl) return;
        this.camPos = camPos;
        this.viewMatrix.copy(viewMatrix);

        gl.clearColor(0.04, 0.06, 0.09, 1.0);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    }

    drawBox(center, size, color, emission = [0, 0, 0], rotY = 0) {
        const gl = this.gl;
        if (!gl || !this.meshProgram) return;
        gl.useProgram(this.meshProgram);

        const aPos = gl.getAttribLocation(this.meshProgram, 'aPosition');
        const aNorm = gl.getAttribLocation(this.meshProgram, 'aNormal');

        gl.bindBuffer(gl.ARRAY_BUFFER, this.boxVBO);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.boxNBO);
        gl.enableVertexAttribArray(aNorm);
        gl.vertexAttribPointer(aNorm, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.boxIBO);

        const m = new Matrix4();
        m.makeTranslation(center.x, center.y, center.z);
        if (rotY !== 0) {
            const rot = new Matrix4().makeRotationY(rotY);
            m.multiply(rot);
        }
        const s = new Matrix4().makeScale(size.x, size.y, size.z);
        m.multiply(s);

        gl.uniformMatrix4fv(gl.getUniformLocation(this.meshProgram, 'uProjection'), false, this.projMatrix.elements);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.meshProgram, 'uView'), false, this.viewMatrix.elements);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.meshProgram, 'uModel'), false, m.elements);

        gl.uniform3fv(gl.getUniformLocation(this.meshProgram, 'uColor'), color);
        gl.uniform3fv(gl.getUniformLocation(this.meshProgram, 'uEmission'), emission);
        gl.uniform3fv(gl.getUniformLocation(this.meshProgram, 'uLightDir'), [0.6, 1.0, 0.8]);
        gl.uniform3fv(gl.getUniformLocation(this.meshProgram, 'uCamPos'), [this.camPos.x, this.camPos.y, this.camPos.z]);

        gl.drawElements(gl.TRIANGLES, this.boxIndexCount, gl.UNSIGNED_SHORT, 0);
    }

    drawLines(points, colors) {
        const gl = this.gl;
        if (!gl || !this.lineProgram || points.length < 2) return;

        gl.useProgram(this.lineProgram);

        const aPos = gl.getAttribLocation(this.lineProgram, 'aPosition');
        const aCol = gl.getAttribLocation(this.lineProgram, 'aColor');

        const vertData = new Float32Array(points.flatMap(p => [p.x, p.y, p.z]));
        const colData = new Float32Array(colors.flatMap(c => c));

        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineVBO);
        gl.bufferData(gl.ARRAY_BUFFER, vertData, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aPos);
        gl.vertexAttribPointer(aPos, 3, gl.FLOAT, false, 0, 0);

        gl.bindBuffer(gl.ARRAY_BUFFER, this.lineCBO);
        gl.bufferData(gl.ARRAY_BUFFER, colData, gl.DYNAMIC_DRAW);
        gl.enableVertexAttribArray(aCol);
        gl.vertexAttribPointer(aCol, 4, gl.FLOAT, false, 0, 0);

        gl.uniformMatrix4fv(gl.getUniformLocation(this.lineProgram, 'uProjection'), false, this.projMatrix.elements);
        gl.uniformMatrix4fv(gl.getUniformLocation(this.lineProgram, 'uView'), false, this.viewMatrix.elements);

        gl.lineWidth(2.5);
        gl.drawArrays(gl.LINES, 0, points.length);
    }
}


// ==============================================================================
// FILE: src/core/TextureGenerator.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Procedural Texture Generator (TextureGenerator.js)
 * Generates high-fidelity cyberpunk & brutalist industrial textures in memory:
 * - Reflective mottled concrete floor with panel joints & roughness variations
 * - Industrial fluted wall panels with bolt rivets and metallic trim
 * - Tactical caution & hazard stripes
 * - Brushed gunmetal alloy
 * - Dynamic OLED digital ammo display
 * ==============================================================================
 */

class TextureGenerator {
    /**
     * Creates a high-detail mottled concrete floor texture with roughness map.
     */
    static createConcreteFloor() {
        if (typeof window.THREE === 'undefined') return { map: null, roughnessMap: null };
        const THREE = window.THREE;

        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Dark base
        ctx.fillStyle = '#0f141c';
        ctx.fillRect(0, 0, size, size);

        // Noise & speckles
        for (let i = 0; i < 4000; i++) {
            const x = Math.random() * size;
            const y = Math.random() * size;
            const gray = Math.floor(18 + Math.random() * 22);
            ctx.fillStyle = `rgb(${gray}, ${gray + 2}, ${gray + 5})`;
            ctx.fillRect(x, y, 2, 2);
        }

        // Panel grid seams (Brutalist modular slabs)
        ctx.strokeStyle = '#05070a';
        ctx.lineWidth = 3;
        ctx.beginPath();
        for (let x = 0; x <= size; x += 128) {
            ctx.moveTo(x, 0); ctx.lineTo(x, size);
        }
        for (let y = 0; y <= size; y += 128) {
            ctx.moveTo(0, y); ctx.lineTo(size, y);
        }
        ctx.stroke();

        // Subtle highlight along panel edges
        ctx.strokeStyle = '#1b2430';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 1; x <= size; x += 128) {
            ctx.moveTo(x, 0); ctx.lineTo(x, size);
        }
        for (let y = 1; y <= size; y += 128) {
            ctx.moveTo(0, y); ctx.lineTo(size, y);
        }
        ctx.stroke();

        const colorMap = new THREE.CanvasTexture(canvas);
        colorMap.wrapS = THREE.RepeatWrapping;
        colorMap.wrapT = THREE.RepeatWrapping;
        colorMap.repeat.set(6, 6);

        // Roughness Map (creates realistic specular sheen variations)
        const roughCanvas = document.createElement('canvas');
        roughCanvas.width = 256;
        roughCanvas.height = 256;
        const rctx = roughCanvas.getContext('2d');
        rctx.fillStyle = '#999999';
        rctx.fillRect(0, 0, 256, 256);
        for (let i = 0; i < 2000; i++) {
            const v = Math.floor(120 + Math.random() * 80);
            rctx.fillStyle = `rgb(${v}, ${v}, ${v})`;
            rctx.fillRect(Math.random() * 256, Math.random() * 256, 3, 3);
        }
        const roughnessMap = new THREE.CanvasTexture(roughCanvas);
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(6, 6);

        return { map: colorMap, roughnessMap: roughnessMap };
    }

    /**
     * Creates an industrial dark alloy wall texture with vertical ribbing.
     */
    static createWallTexture() {
        if (typeof window.THREE === 'undefined') return { map: null };
        const THREE = window.THREE;

        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#171d26';
        ctx.fillRect(0, 0, size, size);

        // Vertical fluting / corrugated slats
        for (let x = 0; x < size; x += 32) {
            ctx.fillStyle = '#1c2430';
            ctx.fillRect(x, 0, 16, size);
            ctx.fillStyle = '#11161d';
            ctx.fillRect(x + 16, 0, 16, size);
        }

        // Bolt rivets
        ctx.fillStyle = '#2d3b4d';
        for (let x = 8; x < size; x += 32) {
            ctx.beginPath();
            ctx.arc(x, 12, 2.5, 0, Math.PI * 2);
            ctx.arc(x, size - 12, 2.5, 0, Math.PI * 2);
            ctx.fill();
        }

        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(6, 1.5);
        return { map };
    }

    /**
     * Creates tactical hazard / caution stripes.
     */
    static createHazardStripe() {
        if (typeof window.THREE === 'undefined') return null;
        const THREE = window.THREE;

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 128;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#0a0d12';
        ctx.fillRect(0, 0, 128, 128);

        ctx.fillStyle = '#00F0FF';
        ctx.beginPath();
        for (let i = -128; i < 256; i += 32) {
            ctx.moveTo(i, 0);
            ctx.lineTo(i + 16, 0);
            ctx.lineTo(i + 48, 128);
            ctx.lineTo(i + 32, 128);
            ctx.closePath();
        }
        ctx.fill();

        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(3, 1);
        return map;
    }

    /**
     * Creates an industrial dark steel slotted metal grating texture.
     */
    static createGrateTexture() {
        if (typeof window.THREE === 'undefined') return { map: null };
        const THREE = window.THREE;

        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Dark background / deep slot void
        ctx.fillStyle = '#06090d';
        ctx.fillRect(0, 0, size, size);

        // Steel crossbars & mesh lattice
        ctx.strokeStyle = '#283442';
        ctx.lineWidth = 6;
        for (let x = 0; x <= size; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }
        ctx.strokeStyle = '#1d2733';
        ctx.lineWidth = 4;
        for (let y = 0; y <= size; y += 16) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(size, y);
            ctx.stroke();
        }

        // Metallic edge highlights
        ctx.strokeStyle = '#41556b';
        ctx.lineWidth = 1.5;
        for (let x = 1; x <= size; x += 16) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, size);
            ctx.stroke();
        }

        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(4, 4);
        return { map };
    }

    /**
     * Creates a composite safety glass panel texture with reinforcement wire and edge glow.
     */
    static createGlassTexture() {
        if (typeof window.THREE === 'undefined') return { map: null };
        const THREE = window.THREE;

        const size = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Cyan-tinted frosted translucent base
        ctx.fillStyle = 'rgba(10, 30, 45, 0.45)';
        ctx.fillRect(0, 0, size, size);

        // Micro-hex / diagonal reinforcement wire mesh
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.22)';
        ctx.lineWidth = 1;
        for (let i = -size; i < size * 2; i += 24) {
            ctx.beginPath();
            ctx.moveTo(i, 0);
            ctx.lineTo(i + size, size);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(i, size);
            ctx.lineTo(i + size, 0);
            ctx.stroke();
        }

        // High-tech corner bracket accents
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 4;
        const b = 28;
        // Top-left
        ctx.beginPath(); ctx.moveTo(4, b); ctx.lineTo(4, 4); ctx.lineTo(b, 4); ctx.stroke();
        // Top-right
        ctx.beginPath(); ctx.moveTo(size - b, 4); ctx.lineTo(size - 4, 4); ctx.lineTo(size - 4, b); ctx.stroke();
        // Bottom-left
        ctx.beginPath(); ctx.moveTo(4, size - b); ctx.lineTo(4, size - 4); ctx.lineTo(b, size - 4); ctx.stroke();
        // Bottom-right
        ctx.beginPath(); ctx.moveTo(size - b, size - 4); ctx.lineTo(size - 4, size - 4); ctx.lineTo(size - 4, size - b); ctx.stroke();

        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        return { map };
    }

    /**
     * Theme 3 (Cyber Matrix Vault):
     * Deep obsidian & luminous tech cyan virtual matrix floor with glowing vector grid lines
     * and coordinate crosshairs.
     */
    static createMatrixFloor() {
        if (typeof window.THREE === 'undefined') return { map: null, roughnessMap: null };
        const THREE = window.THREE;

        const size = 512;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = size;
        const ctx = canvas.getContext('2d');

        // Deep obsidian-navy cyber base
        ctx.fillStyle = '#050f18';
        ctx.fillRect(0, 0, size, size);

        // Subtle sub-grid lines
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.12)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= size; x += 16) {
            ctx.moveTo(x, 0); ctx.lineTo(x, size);
        }
        for (let y = 0; y <= size; y += 16) {
            ctx.moveTo(0, y); ctx.lineTo(size, y);
        }
        ctx.stroke();

        // Primary glowing vector grid lines (64px)
        ctx.strokeStyle = '#00F0FF';
        ctx.lineWidth = 2;
        ctx.shadowColor = '#00F0FF';
        ctx.shadowBlur = 4;
        ctx.beginPath();
        for (let x = 0; x <= size; x += 64) {
            ctx.moveTo(x, 0); ctx.lineTo(x, size);
        }
        for (let y = 0; y <= size; y += 64) {
            ctx.moveTo(0, y); ctx.lineTo(size, y);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Vector intersection crosshairs & digital nodes
        ctx.fillStyle = '#00ffff';
        for (let x = 64; x < size; x += 64) {
            for (let y = 64; y < size; y += 64) {
                ctx.fillRect(x - 2, y - 2, 4, 4);
            }
        }

        const colorMap = new THREE.CanvasTexture(canvas);
        colorMap.wrapS = THREE.RepeatWrapping;
        colorMap.wrapT = THREE.RepeatWrapping;
        colorMap.repeat.set(6, 6);

        // Specular roughness
        const roughCanvas = document.createElement('canvas');
        roughCanvas.width = 256;
        roughCanvas.height = 256;
        const rctx = roughCanvas.getContext('2d');
        rctx.fillStyle = '#222222';
        rctx.fillRect(0, 0, 256, 256);
        const roughnessMap = new THREE.CanvasTexture(roughCanvas);
        roughnessMap.wrapS = THREE.RepeatWrapping;
        roughnessMap.wrapT = THREE.RepeatWrapping;
        roughnessMap.repeat.set(6, 6);

        return { map: colorMap, roughnessMap: roughnessMap };
    }

    /**
     * Theme 3 (Cyber Matrix Vault):
     * Dark digital matrix barrier wall with vertical vector buses, glowing cybernetic lines,
     * and wireframe data markings.
     */
    static createMatrixWall() {
        if (typeof window.THREE === 'undefined') return { map: null };
        const THREE = window.THREE;

        const size = 512;
        const height = 256;
        const canvas = document.createElement('canvas');
        canvas.width = size;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        ctx.fillStyle = '#081724';
        ctx.fillRect(0, 0, size, height);

        // Wireframe data grid
        ctx.strokeStyle = 'rgba(0, 240, 255, 0.20)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let x = 0; x <= size; x += 32) {
            ctx.moveTo(x, 0); ctx.lineTo(x, height);
        }
        for (let y = 0; y <= height; y += 32) {
            ctx.moveTo(0, y); ctx.lineTo(size, y);
        }
        ctx.stroke();

        // Glowing vector data ribbons
        ctx.strokeStyle = '#00ffff';
        ctx.lineWidth = 3;
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 6;
        for (let x = 64; x < size; x += 128) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, height);
            ctx.stroke();
        }
        ctx.shadowBlur = 0;

        // Telemetry markings
        ctx.fillStyle = '#00F0FF';
        ctx.font = 'bold 10px monospace';
        ctx.fillText('MATRIX // SECTOR_C', 12, 20);
        ctx.fillText('DATA BUS', 140, 20);

        const map = new THREE.CanvasTexture(canvas);
        map.wrapS = THREE.RepeatWrapping;
        map.wrapT = THREE.RepeatWrapping;
        map.repeat.set(4, 1.5);
        return { map };
    }

    /**
     * Dynamic OLED display mounted on the player pistol slide.
     */
    static createOLEDAmmoDisplay(ammoCount, maxAmmo, isReloading) {
        if (typeof window.THREE === 'undefined') return { texture: null, update: () => {} };
        const THREE = window.THREE;

        const canvas = document.createElement('canvas');
        canvas.width = 128;
        canvas.height = 64;
        const ctx = canvas.getContext('2d');

        const texture = new THREE.CanvasTexture(canvas);

        const update = (count, isReload) => {
            ctx.fillStyle = '#030508';
            ctx.fillRect(0, 0, 128, 64);

            // Tech border
            ctx.strokeStyle = isReload ? '#FF0D47' : '#00F0FF';
            ctx.lineWidth = 2;
            ctx.strokeRect(4, 4, 120, 56);

            // Header text
            ctx.fillStyle = isReload ? '#FF0D47' : 'rgba(0, 240, 255, 0.7)';
            ctx.font = 'bold 11px monospace';
            ctx.fillText(isReload ? 'RELOAD' : 'ROUNDS', 12, 18);

            // Digits
            ctx.fillStyle = isReload ? '#FF0D47' : '#00F0FF';
            ctx.font = 'bold 32px monospace';
            const str = isReload ? '--' : `0${count}`.slice(-2);
            ctx.fillText(str, 42, 50);

            texture.needsUpdate = true;
        };

        update(ammoCount, isReloading);
        return { texture, update };
    }
}



// ==============================================================================
// FILE: src/core/EconomyManager.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Token & Economy Manager (EconomyManager.js)
 * Manages player token balance, weapon purchases, equips, and persistence
 * via HTML5 localStorage.
 * ==============================================================================
 */


class EconomyManager {
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



// ==============================================================================
// FILE: src/levels/LevelManager.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Level Progression System (LevelManager.js)
 * Multi-stage campaign progression with dynamic obstacle layouts, tactical cover,
 * and scaling enemy difficulty.
 * ==============================================================================
 */


const CAMPAIGN_LEVELS = [
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

class LevelManager {
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



// ==============================================================================
// FILE: src/levels/ArenaManager.js
// ==============================================================================
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


const VISUAL_THEMES = [
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

const ARENA_MAPS = [
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

class ArenaManager {
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


// ==============================================================================
// FILE: src/audio/SoundManager.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Procedural Audio Synthesizer (SoundManager.js)
 * High-performance Web Audio API sound generator.
 * Features:
 * - Low-pass filter time dilation & pitch-bending for Focus Bullet Time mode
 * - Procedural synthesized gunshots, ricochets, duds, damage, and tactical slides
 * - Zero external audio files required: runs instantly in any modern browser!
 * ==============================================================================
 */

class SoundManager {
    constructor() {
        this.ctx = null;
        this.enabled = true;
        this.masterGain = null;
        this.focusFilter = null;
        this.currentTimeScale = 1.0;
    }

    init() {
        try {
            if (!this.ctx) {
                const AudioContext = window.AudioContext || window.webkitAudioContext;
                if (AudioContext) {
                    this.ctx = new AudioContext();
                    this._initMasterChain();
                }
            }
            if (this.ctx && this.ctx.state === 'suspended') {
                this.ctx.resume().catch(() => {});
            }
        } catch (e) {
            console.warn('[SoundManager] Audio initialization error:', e);
        }
    }

    _initMasterChain() {
        if (!this.ctx) return;
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.setValueAtTime(1.0, this.ctx.currentTime);

        this.focusFilter = this.ctx.createBiquadFilter();
        this.focusFilter.type = 'lowpass';
        this.focusFilter.frequency.setValueAtTime(20000, this.ctx.currentTime);
        this.focusFilter.Q.setValueAtTime(1.2, this.ctx.currentTime);

        this.masterGain.connect(this.focusFilter);
        this.focusFilter.connect(this.ctx.destination);
    }

    _output() {
        if (this.masterGain) return this.masterGain;
        return this.ctx ? this.ctx.destination : null;
    }

    /**
     * Dilates the master audio graph with a low-pass filter:
     * Dips from 20000Hz (crystal clear) down to 520Hz (deep, muffled slow-mo bass).
     */
    setFocusDilation(timeScale) {
        this.currentTimeScale = timeScale;
        if (!this.ctx || !this.focusFilter) return;
        const clampedScale = Math.max(0.2, Math.min(1.0, timeScale));
        const targetFreq = 520 + Math.pow(clampedScale, 2.2) * 19480;
        this.focusFilter.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.04);
    }

    playFocusEnter() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(240, t);
        osc.frequency.exponentialRampToValueAtTime(50, t + 0.38);

        gain.gain.setValueAtTime(0.42, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.4);
    }

    playFocusExit() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(60, t);
        osc.frequency.exponentialRampToValueAtTime(320, t + 0.22);

        gain.gain.setValueAtTime(0.28, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.25);
    }

    playShoot() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        const pitchMul = (this.currentTimeScale < 0.95) ? (0.65 + 0.35 * this.currentTimeScale) : 1.0;

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(880 * pitchMul, t);
        osc.frequency.exponentialRampToValueAtTime(120 * pitchMul, t + 0.12);

        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.14);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.15);
    }

    /**
     * Pitch and harmonics scale dynamically with each bounce tier!
     * Tier 1 (1 bounce): Sharp metallic ping
     * Tier 2 (2 bounces): Resonant amber harmonic ping
     * Tier 3+ (3+ bounces): Supersonic singularity shockwave chime
     */
    playRicochet(bounces = 1) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const pitchMul = (this.currentTimeScale < 0.95) ? (0.7 + 0.3 * this.currentTimeScale) : 1.0;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        if (bounces <= 1) {
            const baseFreq = 950 * pitchMul;
            osc.type = 'sine';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.35, t + 0.22);
            gain.gain.setValueAtTime(0.38, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.24);
        } else if (bounces === 2) {
            const baseFreq = 1450 * pitchMul;
            osc.type = 'triangle';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.45, t + 0.3);
            gain.gain.setValueAtTime(0.44, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.32);
        } else {
            const baseFreq = 2200 * pitchMul;
            osc.type = 'sawtooth';
            osc.frequency.setValueAtTime(baseFreq, t);
            osc.frequency.exponentialRampToValueAtTime(baseFreq * 0.25, t + 0.38);
            gain.gain.setValueAtTime(0.5, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.4);
        }

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.4);
    }

    /**
     * Dull, low-frequency deflection "dud" thud when direct shot hits enemy.
     */
    playDeflect() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, t);
        osc.frequency.linearRampToValueAtTime(50, t + 0.18);

        gain.gain.setValueAtTime(0.3, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.2);
    }

    /**
     * Heavy bass impact with noise punch for lethal ricochet kills.
     * Scales in bass weight and resonance based on bounce count.
     */
    playLethalHit(bounces = 1) {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'square';

        const baseFreq = Math.max(65, 240 - bounces * 35);
        osc.frequency.setValueAtTime(baseFreq, t);
        osc.frequency.exponentialRampToValueAtTime(35, t + 0.35);

        const volume = Math.min(0.65, 0.42 + bounces * 0.08);
        gain.gain.setValueAtTime(volume, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.38);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.38);
    }

    playRankUp() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;

        const notes = [440, 554, 659, 880];
        notes.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = t + idx * 0.055;

            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, noteStart);

            gain.gain.setValueAtTime(0.2, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + 0.18);

            osc.connect(gain);
            gain.connect(this._output());

            osc.start(noteStart);
            osc.stop(noteStart + 0.2);
        });
    }

    playPlayerDamage() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(110, t);
        osc.frequency.linearRampToValueAtTime(45, t + 0.25);

        gain.gain.setValueAtTime(0.4, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.25);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.25);
    }

    playReload() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(500, t);
        osc.frequency.setValueAtTime(800, t + 0.1);

        gain.gain.setValueAtTime(0.15, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.2);

        osc.connect(gain);
        gain.connect(this._output());

        osc.start(t);
        osc.stop(t + 0.22);
    }

    playSlide() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const bufferSize = Math.floor(this.ctx.sampleRate * 0.45);
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const filter = this.ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.setValueAtTime(650, t);
        filter.frequency.exponentialRampToValueAtTime(180, t + 0.45);
        filter.Q.setValueAtTime(3.0, t);

        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.35, t);
        gain.gain.exponentialRampToValueAtTime(0.001, t + 0.45);

        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this._output());

        noise.start(t);
        noise.stop(t + 0.45);
    }

    /**
     * Procedural Glass Shatter Sound:
     * Highpass noise snap burst + cascading crystalline resonant tinkles.
     */
    playGlassShatter() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const pitchMul = (this.currentTimeScale < 0.95) ? (0.68 + 0.32 * this.currentTimeScale) : 1.0;

        // 1. Initial sharp impact / glass fracture snap (white noise with highpass filter)
        const snapLen = Math.floor(this.ctx.sampleRate * 0.28);
        const snapBuffer = this.ctx.createBuffer(1, snapLen, this.ctx.sampleRate);
        const snapData = snapBuffer.getChannelData(0);
        for (let i = 0; i < snapLen; i++) {
            snapData[i] = (Math.random() * 2 - 1) * Math.exp(-i / (snapLen * 0.22));
        }
        const snapSource = this.ctx.createBufferSource();
        snapSource.buffer = snapBuffer;

        const hpFilter = this.ctx.createBiquadFilter();
        hpFilter.type = 'highpass';
        hpFilter.frequency.setValueAtTime(3200 * pitchMul, t);

        const snapGain = this.ctx.createGain();
        snapGain.gain.setValueAtTime(0.55, t);
        snapGain.gain.exponentialRampToValueAtTime(0.001, t + 0.26);

        snapSource.connect(hpFilter);
        hpFilter.connect(snapGain);
        snapGain.connect(this._output());

        snapSource.start(t);
        snapSource.stop(t + 0.28);

        // 2. Cascading crystalline shards tinkling
        const frequencies = [2800, 3600, 4400, 5200];
        frequencies.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const noteStart = t + 0.02 + idx * 0.038;
            const dur = 0.22 + Math.random() * 0.12;

            osc.type = 'sine';
            const f = freq * pitchMul * (0.9 + Math.random() * 0.2);
            osc.frequency.setValueAtTime(f, noteStart);
            osc.frequency.exponentialRampToValueAtTime(f * 0.6, noteStart + dur);

            gain.gain.setValueAtTime(0.18, noteStart);
            gain.gain.exponentialRampToValueAtTime(0.001, noteStart + dur);

            osc.connect(gain);
            gain.connect(this._output());

            osc.start(noteStart);
            osc.stop(noteStart + dur);
        });
    }

    /**
     * Procedural Industrial Grate / Mesh Impact Sound:
     * Resonant hollow dual metallic ping + high-friction metal wire buzz.
     */
    playGrateImpact() {
        if (!this.ctx) return;
        const t = this.ctx.currentTime;
        const pitchMul = (this.currentTimeScale < 0.95) ? (0.7 + 0.3 * this.currentTimeScale) : 1.0;

        // 1. Dual detuned hollow metal oscillators (metallic resonance)
        const tones = [580 * pitchMul, 860 * pitchMul];
        tones.forEach((freq, idx) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = idx === 0 ? 'triangle' : 'sawtooth';
            osc.frequency.setValueAtTime(freq, t);
            osc.frequency.exponentialRampToValueAtTime(freq * 0.42, t + 0.2);

            gain.gain.setValueAtTime(0.32, t);
            gain.gain.exponentialRampToValueAtTime(0.001, t + 0.22);

            osc.connect(gain);
            gain.connect(this._output());

            osc.start(t);
            osc.stop(t + 0.22);
        });

        // 2. Friction buzz across wire mesh (bandpass noise)
        const buzzLen = Math.floor(this.ctx.sampleRate * 0.18);
        const buzzBuffer = this.ctx.createBuffer(1, buzzLen, this.ctx.sampleRate);
        const buzzData = buzzBuffer.getChannelData(0);
        for (let i = 0; i < buzzLen; i++) {
            buzzData[i] = Math.random() * 2 - 1;
        }
        const buzzSource = this.ctx.createBufferSource();
        buzzSource.buffer = buzzBuffer;

        const bpFilter = this.ctx.createBiquadFilter();
        bpFilter.type = 'bandpass';
        bpFilter.frequency.setValueAtTime(1450 * pitchMul, t);
        bpFilter.Q.setValueAtTime(4.5, t);

        const buzzGain = this.ctx.createGain();
        buzzGain.gain.setValueAtTime(0.28, t);
        buzzGain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);

        buzzSource.connect(bpFilter);
        bpFilter.connect(buzzGain);
        buzzGain.connect(this._output());

        buzzSource.start(t);
        buzzSource.stop(t + 0.18);
    }
}


// ==============================================================================
// FILE: src/entities/BulletManager.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Bullet & Projectile Manager (BulletManager.js)
 * Implements the core Ricochet Rule with weapon customization & Three.js mesh lifecycle:
 * - Direct hit on enemies = 0 damage (Uncharged)
 * - Wall bounce activates Crimson-Hot Lethal mode (deals multiplied damage).
 * ==============================================================================
 */


class BulletManager {
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


// ==============================================================================
// FILE: src/entities/EnemyManager.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - High-Clarity Enemy Mech System (EnemyManager.js)
 * Hyper-clear, visually striking combat mechs with distinct armor plating,
 * pulsating crimson reactor cores with dynamic point lights, and optical visors.
 * ==============================================================================
 */



class Enemy {
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

class EnemyManager {
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


// ==============================================================================
// FILE: src/player/WeaponViewmodel.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - First-Person Tactical Weapon Viewmodel (WeaponViewmodel.js)
 * Detailed procedural sci-fi ricochet pistol rendered directly in camera view:
 * - High-poly receiver, slide serrations, compensator brake
 * - Dynamic customizable glowing emitter rails & muzzle flash lighting
 * - Integrated rear OLED ammo counter display
 * - Procedural weapon sway, walking bobbing, and snappy recoil recovery
 * ==============================================================================
 */


class WeaponViewmodel {
    constructor(camera, scene) {
        this.camera = camera;
        this.scene = scene;

        const THREE = (typeof window !== 'undefined' && window.THREE) ? window.THREE : null;
        if (THREE && THREE.Vector3 && THREE.Euler) {
            this.restPosition = new THREE.Vector3(0.26, -0.26, -0.52);
            this.currentPosition = this.restPosition.clone();
            this.targetRotation = new THREE.Euler(0, 0, 0);
        } else {
            this.restPosition = { x: 0.26, y: -0.26, z: -0.52, clone() { return { ...this }; } };
            this.currentPosition = this.restPosition.clone();
            this.targetRotation = { x: 0, y: 0, z: 0 };
        }

        this.walkCycle = 0;
        this.mouseSwayX = 0;
        this.mouseSwayY = 0;
        this.recoilZ = 0;
        this.recoilRotX = 0;
        this.isReloading = false;
        this.reloadProgress = 0;
        this.slideTilt = 0;

        this.currentRailColorHex = 0x00F0FF;
        this.currentBulletColorHex = 0x00F0FF;

        if (THREE && this.scene) {
            try {
                this._initWeaponModel();
            } catch (err) {
                console.warn('[WeaponViewmodel] Failed to initialize weapon model:', err);
            }
        }
    }

    _initWeaponModel() {
        const THREE = window.THREE;
        if (!THREE || !this.scene) return;
        this.rootGroup = new THREE.Group();

        // 1. Receiver & Frame
        const frameMat = new THREE.MeshStandardMaterial({
            color: 0x161a22,
            roughness: 0.35,
            metalness: 0.85
        });
        const frameGeo = new THREE.BoxGeometry(0.08, 0.11, 0.32);
        const frame = new THREE.Mesh(frameGeo, frameMat);
        frame.position.set(0, 0, 0);
        this.rootGroup.add(frame);

        // 2. Heavy Slide
        const slideMat = new THREE.MeshStandardMaterial({
            color: 0x222933,
            roughness: 0.25,
            metalness: 0.9
        });
        const slideGeo = new THREE.BoxGeometry(0.084, 0.075, 0.34);
        const slide = new THREE.Mesh(slideGeo, slideMat);
        slide.position.set(0, 0.07, -0.01);
        this.rootGroup.add(slide);

        // 3. Barrel Shroud & Compensator
        const barrelGeo = new THREE.CylinderGeometry(0.028, 0.028, 0.14, 16);
        const barrelMat = new THREE.MeshStandardMaterial({ color: 0x0a0d12, roughness: 0.5, metalness: 0.95 });
        const barrel = new THREE.Mesh(barrelGeo, barrelMat);
        barrel.rotation.x = Math.PI / 2;
        barrel.position.set(0, 0.07, -0.22);
        this.rootGroup.add(barrel);

        // 4. Dual Glowing Emitter Rails (Customizable per equipped weapon)
        const railGeo = new THREE.BoxGeometry(0.012, 0.02, 0.24);
        this.railMaterial = new THREE.MeshStandardMaterial({
            color: this.currentRailColorHex,
            emissive: this.currentRailColorHex,
            emissiveIntensity: 1.8,
            roughness: 0.2
        });
        const leftRail = new THREE.Mesh(railGeo, this.railMaterial);
        leftRail.position.set(-0.046, 0.07, -0.06);
        this.rootGroup.add(leftRail);

        const rightRail = new THREE.Mesh(railGeo, this.railMaterial);
        rightRail.position.set(0.046, 0.07, -0.06);
        this.rootGroup.add(rightRail);

        // 5. Tactical Grip
        const gripGeo = new THREE.BoxGeometry(0.07, 0.18, 0.1);
        const gripMat = new THREE.MeshStandardMaterial({ color: 0x0e1116, roughness: 0.7, metalness: 0.3 });
        const grip = new THREE.Mesh(gripGeo, gripMat);
        grip.rotation.x = 0.22;
        grip.position.set(0, -0.11, 0.09);
        this.rootGroup.add(grip);

        // 6. Rear OLED Ammo Screen
        const oledObj = TextureGenerator.createOLEDAmmoDisplay(6, 6, false);
        this.oledTextureUpdate = oledObj.update;
        const oledGeo = new THREE.PlaneGeometry(0.055, 0.035);
        const oledMat = new THREE.MeshBasicMaterial({ map: oledObj.texture });
        const oledScreen = new THREE.Mesh(oledGeo, oledMat);
        oledScreen.rotation.x = -0.35;
        oledScreen.position.set(0, 0.095, 0.145);
        this.rootGroup.add(oledScreen);

        // 7. Tactical Flashlight
        this.flashlight = new THREE.SpotLight(0xddeeff, 2.2, 50, Math.PI / 4.5, 0.35, 1.2);
        this.flashlight.position.set(0, -0.03, -0.18);
        this.flashlight.target.position.set(0, -0.03, -10);
        this.rootGroup.add(this.flashlight);
        this.rootGroup.add(this.flashlight.target);

        // 8. Muzzle Flash Dynamic Light
        this.muzzleLight = new THREE.PointLight(this.currentBulletColorHex, 0.0, 8.0);
        this.muzzleLight.position.set(0, 0.07, -0.32);
        this.rootGroup.add(this.muzzleLight);

        this.rootGroup.position.copy(this.restPosition);
        this.camera.add(this.rootGroup);
    }

    setWeaponTheme(weaponConfig) {
        if (!weaponConfig) return;
        this.currentRailColorHex = weaponConfig.railColorHex;
        this.currentBulletColorHex = weaponConfig.bulletColorHex;

        if (this.railMaterial) {
            this.railMaterial.color.setHex(this.currentRailColorHex);
            this.railMaterial.emissive.setHex(this.currentRailColorHex);
        }
        if (this.muzzleLight) {
            this.muzzleLight.color.setHex(this.currentBulletColorHex);
        }
    }

    onMouseMove(deltaX, deltaY) {
        this.mouseSwayX = Math.max(-0.06, Math.min(0.06, this.mouseSwayX - deltaX * 0.0008));
        this.mouseSwayY = Math.max(-0.05, Math.min(0.05, this.mouseSwayY - deltaY * 0.0008));
    }

    onShoot() {
        this.recoilZ = 0.12;
        this.recoilRotX = 0.14;

        if (this.muzzleLight) {
            this.muzzleLight.intensity = 5.0;
        }
    }

    setAmmo(count, isReloading) {
        if (this.oledTextureUpdate) {
            this.oledTextureUpdate(count, isReloading);
        }
        if (this.railMaterial) {
            if (isReloading || count === 0) {
                this.railMaterial.emissive.setHex(0xFF0D47);
                this.railMaterial.color.setHex(0xFF0D47);
            } else {
                this.railMaterial.emissive.setHex(this.currentRailColorHex);
                this.railMaterial.color.setHex(this.currentRailColorHex);
            }
        }
    }

    update(delta, isMoving, isSprinting, isReloading, isSliding = false, timeScale = 1.0) {
        if (!this.rootGroup) return;
        const THREE = window.THREE;

        const cycleSpeed = (timeScale < 0.95) ? (0.6 + 0.4 * timeScale) : 1.0;
        if (isMoving && !isSliding) {
            const freq = (isSprinting ? 14 : 9) * cycleSpeed;
            this.walkCycle += delta * freq;
        } else if (isSliding) {
            this.walkCycle += delta * 4 * cycleSpeed; // Low frequency gliding rhythm
        } else {
            this.walkCycle += delta * 2;
        }

        const bobAmpX = isSliding ? 0.003 : (isMoving ? 0.012 : 0.003);
        const bobAmpY = isSliding ? 0.004 : (isMoving ? 0.015 : 0.004);
        const bobX = Math.cos(this.walkCycle * 0.5) * bobAmpX;
        const bobY = Math.sin(this.walkCycle) * bobAmpY;

        this.mouseSwayX = THREE.MathUtils.lerp(this.mouseSwayX, 0, delta * 8.0);
        this.mouseSwayY = THREE.MathUtils.lerp(this.mouseSwayY, 0, delta * 8.0);

        this.recoilZ = THREE.MathUtils.lerp(this.recoilZ, 0, delta * 14.0);
        this.recoilRotX = THREE.MathUtils.lerp(this.recoilRotX, 0, delta * 16.0);

        // Smooth tactical slide cant transition
        const targetSlideTilt = isSliding ? 1.0 : 0.0;
        this.slideTilt = THREE.MathUtils.lerp(this.slideTilt, targetSlideTilt, delta * 12.0);
        const slideDipY = -0.05 * this.slideTilt;
        const slideRotZ = 0.26 * this.slideTilt;
        const slideRotX = -0.04 * this.slideTilt;

        // Subtle ADS reflex centering during slow-motion focus
        const focusFactor = Math.max(0, Math.min(1.0, (1.0 - timeScale) / 0.7));
        const restX = THREE.MathUtils.lerp(this.restPosition.x, 0.16, focusFactor * 0.6);
        const restY = THREE.MathUtils.lerp(this.restPosition.y, -0.22, focusFactor * 0.5);

        if (this.muzzleLight && this.muzzleLight.intensity > 0) {
            this.muzzleLight.intensity = Math.max(0, this.muzzleLight.intensity - delta * 45.0);
        }

        let reloadDipY = 0;
        let reloadRotZ = 0;
        if (isReloading) {
            reloadDipY = -0.16;
            reloadRotZ = 0.28;
        }

        this.rootGroup.position.set(
            restX + bobX + this.mouseSwayX,
            restY + bobY + this.mouseSwayY + reloadDipY + slideDipY,
            this.restPosition.z + this.recoilZ
        );

        this.rootGroup.rotation.set(
            this.recoilRotX + this.mouseSwayY * 0.5 + slideRotX,
            this.mouseSwayX * 0.8,
            bobX * 2.0 + reloadRotZ + slideRotZ
        );
    }
}


// ==============================================================================
// FILE: src/player/FPSController.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - First-Person Controller (FPSController.js)
 * Full WASD locomotion, Pointer Lock mouse look, jumping, gravity,
 * weapon viewmodel integration, and weapon arsenal equipping.
 * ==============================================================================
 */


class FPSController {
    constructor(canvas, physics, soundManager, bulletManager) {
        this.canvas = canvas;
        this.physics = physics;
        this.sound = soundManager;
        this.bulletManager = bulletManager;
        this.viewmodel = null;
        this.activeWeaponConfig = null;

        // Position & camera angles
        this.position = new Vector3(0, 1.6, 12);
        this.velocity = new Vector3(0, 0, 0);
        this.yaw = 0;
        this.pitch = 0;

        // Physical parameters & slide mechanics
        this.walkSpeed = 7.0;
        this.sprintSpeed = 11.5;
        this.jumpVelocity = 7.5;
        this.gravity = 20.0;
        this.isGrounded = false;
        this.playerRadius = 0.45;

        // Heights
        this.standingEyeHeight = 1.6;
        this.slidingEyeHeight = 0.85;
        this.currentEyeHeight = 1.6;
        this.standingHeight = 1.8;
        this.slidingHeight = 0.9;
        this.playerHeight = this.standingHeight;

        // Slide State
        this.isSliding = false;
        this.slideDuration = 0.75;
        this.slideTimer = 0;
        this.slideCooldown = 0.25;
        this.slideCooldownTimer = 0;
        this.slideBoostSpeed = 16.0;
        this.currentSlideSpeed = 0;
        this.slideFriction = 16.0;
        this.slideDir = new Vector3(0, 0, 0);

        // Weapon state (Default Spectre-9)
        this.maxAmmo = 6;
        this.currentAmmo = 6;
        this.isReloading = false;
        this.reloadTimer = 0;
        this.fireCooldown = 0.22;
        this.fireTimer = 0;
        this.recoilOffset = 0;

        // Key states
        this.keys = {};
        this.isPointerLocked = false;
        this.justLocked = false;
        this.isMoving = false;
        this.isSprinting = false;
        this.isFocusHeld = false;
        this.isFocusKeyHeld = false;

        // Callback hooks for game lifecycle
        this.onCanvasClick = null;
        this.onPointerLockChange = null;
        this.onPauseToggle = null;

        this._setupInputListeners();
    }

    setViewmodel(viewmodel) {
        this.viewmodel = viewmodel;
        if (this.viewmodel) {
            this.viewmodel.setAmmo(this.currentAmmo, this.isReloading);
            if (this.activeWeaponConfig) {
                this.viewmodel.setWeaponTheme(this.activeWeaponConfig);
            }
        }
    }

    equipWeapon(weaponConfig) {
        if (!weaponConfig) return;
        this.activeWeaponConfig = weaponConfig;
        this.maxAmmo = weaponConfig.maxAmmo;
        this.currentAmmo = weaponConfig.maxAmmo;
        this.fireCooldown = weaponConfig.fireCooldown;
        this.reloadTime = weaponConfig.reloadTime;

        if (this.viewmodel) {
            this.viewmodel.setWeaponTheme(weaponConfig);
            this.viewmodel.setAmmo(this.currentAmmo, false);
        }
    }

    requestPointerLock() {
        const canvas = this.canvas || document.querySelector('canvas') || document.getElementById('render-canvas');
        if (!canvas) return;
        if (document.pointerLockElement === canvas) return;
        try {
            const promise = canvas.requestPointerLock();
            if (promise && promise.catch) {
                promise.catch(() => {});
            }
        } catch (e) {}
    }

    resetInput() {
        this.keys = {};
        this.isMoving = false;
        this.isSprinting = false;
        this.isFocusHeld = false;
        this.isFocusKeyHeld = false;
        if (this.isSliding) {
            this.stopSlide();
        }
    }

    _setupInputListeners() {
        const canvas = this.canvas || document.querySelector('canvas') || document.getElementById('render-canvas');
        if (canvas) {
            canvas.addEventListener('click', (e) => {
                if (this.onCanvasClick) {
                    this.onCanvasClick(e);
                } else if (!this.isPointerLocked) {
                    this.requestPointerLock();
                    if (this.sound && typeof this.sound.init === 'function') this.sound.init();
                }
            });
        }

        document.addEventListener('pointerlockchange', () => {
            const activeCanvas = this.canvas || document.querySelector('canvas') || document.getElementById('render-canvas');
            const wasLocked = this.isPointerLocked;
            this.isPointerLocked = (document.pointerLockElement !== null && (document.pointerLockElement === activeCanvas || document.pointerLockElement.tagName === 'CANVAS'));

            if (this.isPointerLocked) {
                this.justLocked = true;
            } else {
                this.isFocusHeld = false;
                this.isFocusKeyHeld = false;
                this.resetInput();
            }

            if (this.onPointerLockChange) {
                this.onPointerLockChange(this.isPointerLocked, wasLocked);
            }
        });

        document.addEventListener('pointerlockerror', () => {
            this.isPointerLocked = false;
            this.justLocked = false;
        });

        let lastMouseX = null;
        let lastMouseY = null;

        document.addEventListener('mousemove', (e) => {
            const menuOpen = this.isAnyMenuOpen && this.isAnyMenuOpen();
            if (menuOpen) {
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
                return;
            }

            let deltaX = 0;
            let deltaY = 0;

            if (this.isPointerLocked) {
                // High-precision pointer-lock movement deltas
                const rawX = e.movementX ?? e.mozMovementX ?? e.webkitMovementX ?? 0;
                const rawY = e.movementY ?? e.mozMovementY ?? e.webkitMovementY ?? 0;

                deltaX = (typeof rawX === 'number' && Number.isFinite(rawX)) ? rawX : 0;
                deltaY = (typeof rawY === 'number' && Number.isFinite(rawY)) ? rawY : 0;

                // Discard initial cursor warp delta jump when acquiring pointer lock
                if (this.justLocked) {
                    this.justLocked = false;
                    if (Math.abs(deltaX) > 120 || Math.abs(deltaY) > 120) {
                        return;
                    }
                }
            } else {
                // Seamless fallback mouse tracking when pointer lock is not engaged
                if (lastMouseX !== null && lastMouseY !== null) {
                    const diffX = e.clientX - lastMouseX;
                    const diffY = e.clientY - lastMouseY;
                    if (Math.abs(diffX) < 160 && Math.abs(diffY) < 160) {
                        deltaX = diffX;
                        deltaY = diffY;
                    }
                }
                lastMouseX = e.clientX;
                lastMouseY = e.clientY;
            }

            if (deltaX === 0 && deltaY === 0) return;

            // Guard against single-frame anomaly spikes
            const clampedX = Math.max(-400, Math.min(400, deltaX));
            const clampedY = Math.max(-400, Math.min(400, deltaY));

            // Restrict turning agility slightly during slide for realistic weighty momentum
            let sensitivity = this.isSliding ? 0.0013 : 0.0022;
            this.yaw -= clampedX * sensitivity;
            this.pitch -= clampedY * sensitivity;

            // Strictly clamp pitch between -89 and +89 degrees in radians to prevent flipping or gimbal lock
            const maxPitch = (89 * Math.PI) / 180;
            this.pitch = Math.max(-maxPitch, Math.min(maxPitch, this.pitch));

            // Smoothly wrap yaw within [0, 2*PI)
            const TWO_PI = Math.PI * 2;
            this.yaw = ((this.yaw % TWO_PI) + TWO_PI) % TWO_PI;

            try {
                if (this.viewmodel && typeof this.viewmodel.onMouseMove === 'function') {
                    this.viewmodel.onMouseMove(clampedX, clampedY);
                }
            } catch (err) {
                console.warn("Viewmodel mouse move error:", err);
            }
        });

        window.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Global keydown listener with WASD and arrow key normalization
        window.addEventListener('keydown', (e) => {
            if (!e) return;
            const code = e.code || e.key;
            if (code) {
                this.keys[code] = true;
            }
            if (e.key) {
                const k = e.key.toLowerCase();
                if (k === 'w' || k === 'arrowup') this.keys['KeyW'] = true;
                if (k === 's' || k === 'arrowdown') this.keys['KeyS'] = true;
                if (k === 'a' || k === 'arrowleft') this.keys['KeyA'] = true;
                if (k === 'd' || k === 'arrowright') this.keys['KeyD'] = true;
                if (k === 'c') this.keys['KeyC'] = true;
                if (k === 'r') this.keys['KeyR'] = true;
                if (k === 'f') this.keys['KeyF'] = true;
                if (k === 'p') this.keys['KeyP'] = true;
                if (k === ' ') this.keys['Space'] = true;
                if (k === 'shift') this.keys['ShiftLeft'] = true;
            }

            if (e.code === 'Escape' || e.code === 'KeyP' || e.key === 'p' || e.key === 'P') {
                if (this.onPauseToggle) {
                    this.onPauseToggle();
                }
            }
            if ((e.code === 'KeyR' || e.key === 'r' || e.key === 'R') && !this.isReloading && this.currentAmmo < this.maxAmmo) {
                this.startReload();
            }
            if (e.code === 'KeyC' || e.key === 'c' || e.key === 'C') {
                this.tryStartSlide();
            }
            if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
                this.isFocusKeyHeld = true;
            }
        });

        // Global keyup listener
        window.addEventListener('keyup', (e) => {
            if (!e) return;
            const code = e.code || e.key;
            if (code) {
                this.keys[code] = false;
            }
            if (e.key) {
                const k = e.key.toLowerCase();
                if (k === 'w' || k === 'arrowup') this.keys['KeyW'] = false;
                if (k === 's' || k === 'arrowdown') this.keys['KeyS'] = false;
                if (k === 'a' || k === 'arrowleft') this.keys['KeyA'] = false;
                if (k === 'd' || k === 'arrowright') this.keys['KeyD'] = false;
                if (k === 'c') this.keys['KeyC'] = false;
                if (k === 'r') this.keys['KeyR'] = false;
                if (k === 'f') this.keys['KeyF'] = false;
                if (k === 'p') this.keys['KeyP'] = false;
                if (k === ' ') this.keys['Space'] = false;
                if (k === 'shift') this.keys['ShiftLeft'] = false;
            }

            if ((e.code === 'KeyC' || e.key === 'c' || e.key === 'C') && this.isSliding) {
                this.stopSlide();
            }
            if (e.code === 'KeyF' || e.key === 'f' || e.key === 'F') {
                this.isFocusKeyHeld = false;
            }
        });

        // Global shooting (mousedown) & bullet-time (RMB) listeners
        window.addEventListener('mousedown', (e) => {
            if (!e) return;
            // Ignore mouse down events intended for UI buttons and modals
            const menuOpen = this.isAnyMenuOpen && this.isAnyMenuOpen();
            if (menuOpen) return;

            if (e.button === 0) {
                if (!this.isPointerLocked) {
                    this.requestPointerLock();
                    if (this.sound && typeof this.sound.init === 'function') {
                        this.sound.init();
                    }
                }
                try {
                    this.shoot();
                } catch (err) {
                    console.error("Shoot Error:", err);
                }
            } else if (e.button === 2) {
                if (!this.isPointerLocked) {
                    this.requestPointerLock();
                }
                this.isFocusHeld = true;
            }
        });

        window.addEventListener('mouseup', (e) => {
            if (!e) return;
            if (e.button === 2) {
                this.isFocusHeld = false;
            }
        });
    }

    getForwardVector() {
        return new Vector3(
            -Math.sin(this.yaw) * Math.cos(this.pitch),
            Math.sin(this.pitch),
            -Math.cos(this.yaw) * Math.cos(this.pitch)
        ).normalize();
    }

    getRightVector() {
        return new Vector3(
            Math.cos(this.yaw),
            0,
            -Math.sin(this.yaw)
        ).normalize();
    }

    shoot() {
        if (this.fireTimer > 0 || this.isReloading) return;

        if (this.currentAmmo <= 0) {
            this.startReload();
            return;
        }

        this.currentAmmo--;
        this.fireTimer = this.fireCooldown;
        this.recoilOffset = this.activeWeaponConfig ? this.activeWeaponConfig.recoilKick : 0.12;

        try {
            if (this.viewmodel && typeof this.viewmodel.onShoot === 'function') {
                this.viewmodel.onShoot();
                this.viewmodel.setAmmo(this.currentAmmo, this.isReloading);
            }
        } catch (e) {
            console.warn("Viewmodel shoot error:", e);
        }

        // Muzzle spawn point
        const fwd = this.getForwardVector();
        const right = this.getRightVector();
        const spawnPos = this.position.clone()
            .add(fwd.clone().multiplyScalar(0.45))
            .add(right.clone().multiplyScalar(0.24))
            .add(new Vector3(0, -0.12, 0));

        try {
            if (this.bulletManager && typeof this.bulletManager.spawnBullet === 'function') {
                this.bulletManager.spawnBullet(spawnPos, fwd, this.activeWeaponConfig);
            }
        } catch (e) {
            console.error("Bullet spawn error:", e);
        }

        try {
            if (this.sound && typeof this.sound.playShoot === 'function') {
                this.sound.playShoot();
            }
        } catch (e) {
            console.warn("Sound play shoot error:", e);
        }

        if (this.currentAmmo === 0) {
            this.startReload();
        }
    }

    startReload() {
        if (this.isReloading) return;
        this.isReloading = true;
        this.reloadTimer = this.activeWeaponConfig ? this.activeWeaponConfig.reloadTime : 1.25;
        this.sound.playReload();

        if (this.viewmodel) {
            this.viewmodel.setAmmo(this.currentAmmo, true);
        }
    }

    isFocusRequested() {
        return (this.isFocusHeld || this.isFocusKeyHeld || !!this.keys['ShiftRight']);
    }

    tryStartSlide() {
        if (this.isSliding || !this.isGrounded || this.slideCooldownTimer > 0) return;

        // Player must be actively moving with WASD to trigger slide
        const fwdFlat = new Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
        const rightFlat = new Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();
        const moveDir = new Vector3(0, 0, 0);

        if (this.keys['KeyW']) moveDir.add(fwdFlat);
        if (this.keys['KeyS']) moveDir.sub(fwdFlat);
        if (this.keys['KeyD']) moveDir.add(rightFlat);
        if (this.keys['KeyA']) moveDir.sub(rightFlat);

        if (moveDir.lengthSq() < 0.001) return;

        moveDir.normalize();
        this.isSliding = true;
        this.slideTimer = this.slideDuration;
        this.slideDir = moveDir;
        this.currentSlideSpeed = this.slideBoostSpeed;

        if (this.sound && this.sound.playSlide) {
            this.sound.playSlide();
        }
    }

    stopSlide() {
        if (!this.isSliding) return;
        this.isSliding = false;
        this.slideCooldownTimer = this.slideCooldown;
    }

    update(delta, timeScale = 1.0) {
        // Weapon fire timer ticks: responsive even in slow-mo
        if (this.fireTimer > 0) {
            this.fireTimer -= delta * Math.max(0.65, timeScale);
        }

        if (this.recoilOffset > 0) {
            this.recoilOffset = Math.max(0, this.recoilOffset - delta * 0.8);
        }

        if (this.slideCooldownTimer > 0) {
            this.slideCooldownTimer -= delta;
        }

        if (this.isReloading) {
            this.reloadTimer -= delta * Math.max(0.65, timeScale);
            if (this.reloadTimer <= 0) {
                this.isReloading = false;
                this.currentAmmo = this.maxAmmo;
                if (this.viewmodel) {
                    this.viewmodel.setAmmo(this.currentAmmo, false);
                }
            }
        }

        // Camera height interpolation (smooth lerp from 1.6m down to 0.85m crouch/slide level)
        const targetEyeHeight = this.isSliding ? this.slidingEyeHeight : this.standingEyeHeight;
        const prevEyeHeight = this.currentEyeHeight;
        this.currentEyeHeight += (targetEyeHeight - this.currentEyeHeight) * Math.min(1.0, delta * 14.0);
        const eyeDelta = this.currentEyeHeight - prevEyeHeight;

        // If player is grounded, adjust position.y smoothly along with eye level
        if (this.isGrounded) {
            this.position.y += eyeDelta;
        }

        // Adjust collision height (0.9m when sliding to duck under obstacles, 1.8m when standing)
        this.playerHeight = this.isSliding ? this.slidingHeight : this.standingHeight;

        // Player locomotion scale during bullet time (player retains 0.6x - 1.0x reflex advantage)
        const moveScale = (timeScale < 0.95) ? (0.55 + 0.45 * timeScale) : 1.0;

        // Gravity & floor check
        this.velocity.y -= this.gravity * delta * moveScale;
        this.position.y += this.velocity.y * delta * moveScale;

        if (this.position.y <= this.currentEyeHeight) {
            this.position.y = this.currentEyeHeight;
            this.velocity.y = 0;
            this.isGrounded = true;
        } else {
            this.isGrounded = false;
        }

        // Jump (Disabled during slide)
        if (this.keys['Space'] && this.isGrounded && !this.isSliding) {
            this.velocity.y = this.jumpVelocity;
            this.isGrounded = false;
        }

        // Slide Physics & Decaying Momentum
        if (this.isSliding) {
            this.slideTimer -= delta * moveScale;
            if (this.slideTimer <= 0 || !this.isGrounded) {
                this.stopSlide();
            } else {
                // Apply directional friction decay to slide momentum
                this.currentSlideSpeed = Math.max(this.walkSpeed, this.currentSlideSpeed - this.slideFriction * delta * moveScale);

                // Restricted turning agility while sliding (weighty momentum with slight steering nudge)
                const fwdFlat = new Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
                this.slideDir.add(fwdFlat.multiplyScalar(delta * 1.5)).normalize();

                this.position.x += this.slideDir.x * this.currentSlideSpeed * delta * moveScale;
                this.position.z += this.slideDir.z * this.currentSlideSpeed * delta * moveScale;

                this.isMoving = true;
                this.isSprinting = false;
            }
        }

        // Standard Locomotion (when not sliding)
        if (!this.isSliding) {
            const moveDir = new Vector3(0, 0, 0);
            const fwdFlat = new Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw)).normalize();
            const rightFlat = new Vector3(Math.cos(this.yaw), 0, -Math.sin(this.yaw)).normalize();

            if (this.keys['KeyW']) moveDir.add(fwdFlat);
            if (this.keys['KeyS']) moveDir.sub(fwdFlat);
            if (this.keys['KeyD']) moveDir.add(rightFlat);
            if (this.keys['KeyA']) moveDir.sub(rightFlat);

            this.isSprinting = !!this.keys['ShiftLeft'];
            this.isMoving = (moveDir.lengthSq() > 0.001);
            const speed = (this.isSprinting ? this.sprintSpeed : this.walkSpeed) * moveScale;

            if (this.isMoving) {
                moveDir.normalize();
                this.position.x += moveDir.x * speed * delta;
                this.position.z += moveDir.z * speed * delta;
            }
        }

        // Obstacle collision resolution with eye position offset flag
        this.physics.resolveSphereCollision(this.position, this.playerRadius, this.playerHeight, true, this.currentEyeHeight);

        // Update weapon viewmodel with sliding and time dilation state
        if (this.viewmodel) {
            this.viewmodel.update(delta, this.isMoving, this.isSprinting, this.isReloading, this.isSliding, timeScale);
        }
    }

    getViewMatrix() {
        const eye = this.position.clone();
        const fwd = this.getForwardVector();
        eye.sub(fwd.clone().multiplyScalar(this.recoilOffset));

        const target = eye.clone().add(fwd);
        const up = new Vector3(0, 1, 0);

        return new Matrix4().makeLookAt(eye, target, up);
    }
}


// ==============================================================================
// FILE: src/player/LaserPredictor.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Laser Trajectory Predictor (LaserPredictor.js)
 * Real-time 2-segment laser beam showing wall bounce angles & target alignment.
 * ==============================================================================
 */

class LaserPredictor {
    constructor(physics) {
        this.physics = physics;
        this.status = 'NORMAL'; // 'NORMAL', 'DIRECT_DUD', 'LETHAL_LOCKED'
        this.hasBounce = false;

        this.COLOR_CYAN = [0.0, 0.94, 1.0, 0.9];
        this.COLOR_CRIMSON = [1.0, 0.05, 0.28, 0.95];
        this.COLOR_AMBER = [1.0, 0.72, 0.0, 0.95];
        this.COLOR_VIOLET = [0.85, 0.0, 1.0, 0.98];
        this.COLOR_MUTED = [0.35, 0.45, 0.55, 0.4];
    }

    update(origin, forwardDir, enemies) {
        const trace = this.physics.traceRicochetTrajectory(origin, forwardDir, 60, 40, enemies);

        this.trace = trace;
        this.hasBounce = trace.hasBounce;

        if (trace.lethalLock) {
            if (trace.bouncesCount >= 2) {
                this.status = 'DOUBLE_BANK_LOCKED';
            } else {
                this.status = 'LETHAL_LOCKED';
            }
        } else if (trace.directHitEnemy) {
            this.status = 'DIRECT_DUD';
        } else {
            this.status = 'NORMAL';
        }

        return this.status;
    }

    render(renderer) {
        if (!this.trace || !this.trace.p1) return;

        const points = [];
        const colors = [];

        const c1 = (this.status === 'DIRECT_DUD') ? this.COLOR_MUTED : this.COLOR_CYAN;
        const c2 = (this.status === 'LETHAL_LOCKED') ? this.COLOR_CRIMSON : (this.status === 'DOUBLE_BANK_LOCKED' ? this.COLOR_AMBER : this.COLOR_CYAN);
        const c3 = (this.status === 'DOUBLE_BANK_LOCKED') ? this.COLOR_AMBER : this.COLOR_CYAN;

        // Segment 1 (Gun to first wall)
        points.push(this.trace.p0);
        colors.push(c1);
        points.push(this.trace.p1);
        colors.push(c1);

        // Segment 2 (Wall reflection)
        if (this.trace.hasBounce && this.trace.p2) {
            points.push(this.trace.p1);
            colors.push(c2);
            points.push(this.trace.p2);
            colors.push(c2);
        }

        // Segment 3 (Second wall reflection)
        if (this.trace.p3) {
            points.push(this.trace.p2);
            colors.push(c3);
            points.push(this.trace.p3);
            colors.push(c3);
        }

        renderer.drawLines(points, colors);
    }
}



// ==============================================================================
// FILE: src/ui/HUD.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Cyberpunk HUD & Interface Manager (HUD.js)
 * Manages Main Menu, Weapon Store, Level Progression Modals,
 * Economy Badges, and In-Game Vitals.
 * ==============================================================================
 */

class HUD {
    constructor(economyManager) {
        this.economy = economyManager;

        // In-game HUD elements
        this.crosshair = document.getElementById('crosshair');
        this.predictionLabel = document.getElementById('prediction-label');
        this.healthFill = document.getElementById('health-fill');
        this.healthText = document.getElementById('health-text');
        this.ammoText = document.getElementById('ammo-text');
        this.ammoSubtext = document.getElementById('ammo-subtext');
        this.weaponNameLabel = document.getElementById('weapon-name-label');
        this.scoreText = document.getElementById('score-text');
        this.tokensText = document.getElementById('hud-tokens-text');
        this.sectorText = document.getElementById('hud-sector-text');
        this.targetsText = document.getElementById('hud-targets-text');

        this.comboContainer = document.getElementById('combo-container');
        this.comboText = document.getElementById('combo-text');
        this.comboFill = document.getElementById('combo-fill');
        this.bannerText = document.getElementById('banner-text');

        // Focus & Bullet Time UI
        this.focusFill = document.getElementById('focus-fill');
        this.focusText = document.getElementById('focus-text');
        this.focusOverlay = document.getElementById('focus-overlay');

        // Style Rank & Trick Chain UI
        this.stylePanel = document.getElementById('style-panel');
        this.styleRankBadge = document.getElementById('style-rank-badge');
        this.styleRankTitle = document.getElementById('style-rank-title');
        this.styleMultiplier = document.getElementById('style-multiplier');
        this.styleBarFill = document.getElementById('style-bar-fill');
        this.styleTricksFeed = document.getElementById('style-tricks-feed');
        this.lastStyleGrade = 'D';

        // Menus & Modals
        this.mainMenu = document.getElementById('main-menu');
        this.menuTokens = document.getElementById('menu-tokens');
        this.btnPlay = document.getElementById('btn-play');
        this.btnStore = document.getElementById('btn-store');
        this.btnHowToPlay = document.getElementById('btn-how-to-play');

        this.howToPlayModal = document.getElementById('how-to-play-modal');
        this.btnCloseHowToPlay = document.getElementById('btn-close-how-to');

        this.storeModal = document.getElementById('store-modal');
        this.storeTokens = document.getElementById('store-tokens');
        this.storeCardsContainer = document.getElementById('store-cards');
        this.btnCloseStore = document.getElementById('btn-close-store');

        this.levelCompleteModal = document.getElementById('level-complete-modal');
        this.levelCompleteTitle = document.getElementById('level-complete-title');
        this.levelCompleteSubtitle = document.getElementById('level-complete-subtitle');
        this.levelTokensEarned = document.getElementById('level-tokens-earned');
        this.btnNextLevel = document.getElementById('btn-next-level');
        this.btnLevelStore = document.getElementById('btn-level-store');

        this.gameOverModal = document.getElementById('game-over-modal');
        this.gameOverScore = document.getElementById('game-over-score');
        this.btnRestartLevel = document.getElementById('btn-restart-level');
        this.btnGameOverMenu = document.getElementById('btn-game-over-menu');

        this.campaignVictoryModal = document.getElementById('campaign-victory-modal');
        this.campaignFinalScore = document.getElementById('campaign-final-score');
        this.btnPlayAgain = document.getElementById('btn-play-again');

        // Pause Menu Elements
        this.pauseModal = document.getElementById('pause-modal');
        this.btnResumeGame = document.getElementById('btn-resume-game');
        this.btnPauseStore = document.getElementById('btn-pause-store');
        this.btnPauseRestart = document.getElementById('btn-pause-restart');
        this.btnPauseMenu = document.getElementById('btn-pause-menu');

        // Arena Selection & Rotation Elements
        this.menuMapStatus = document.getElementById('menu-map-status');
        this.btnMapSelect = document.getElementById('btn-map-select');
        this.mapSelectModal = document.getElementById('map-select-modal');
        this.mapCardsContainer = document.getElementById('map-cards-container');
        this.themePillsContainer = document.getElementById('theme-pills-container');
        this.activeThemeDesc = document.getElementById('active-theme-desc');
        this.mapStatusText = document.getElementById('map-status-text');
        this.mapProgressBarFill = document.getElementById('map-progression-bar-fill');
        this.mapActiveLabel = document.getElementById('map-active-label');
        this.mapModalProgress = document.getElementById('map-modal-progress');
        this.btnCancelMapSelect = document.getElementById('btn-cancel-map-select');
        this.btnCloseMapSelect = document.getElementById('btn-close-map-select');
        this.btnToggleUnlockDev = document.getElementById('btn-toggle-unlock-dev');

        this.bannerTimer = 0;
    }

    updateHealth(current, max) {
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        this.healthFill.style.width = `${pct}%`;
        this.healthText.textContent = `HP: ${current} / ${max}`;
    }

    flashDamage() {
        this.healthFill.classList.add('flash-crimson');
        setTimeout(() => this.healthFill.classList.remove('flash-crimson'), 250);
    }

    updateFocus(current, max, isActive) {
        const pct = Math.max(0, Math.min(100, (current / max) * 100));
        if (this.focusFill) {
            this.focusFill.style.width = `${pct}%`;
            if (isActive) {
                this.focusFill.classList.add('focus-active');
            } else {
                this.focusFill.classList.remove('focus-active');
            }
        }
        if (this.focusText) {
            if (isActive) {
                this.focusText.textContent = `FOCUS ACTIVE // ${Math.round(pct)}%`;
                this.focusText.style.color = '#00F0FF';
            } else {
                this.focusText.textContent = `FOCUS // BULLET TIME: ${Math.round(pct)}% [RMB]`;
                this.focusText.style.color = (pct < 15) ? '#556677' : '#88ccee';
            }
        }
    }

    setFocusOverlay(isActive) {
        if (this.focusOverlay) {
            if (isActive) {
                this.focusOverlay.classList.add('active');
            } else {
                this.focusOverlay.classList.remove('active');
            }
        }
    }

    updateAmmo(current, max, isReloading, weaponConfig = null) {
        this.ammoText.textContent = `${current} / ${max}`;
        if (weaponConfig) {
            this.weaponNameLabel.textContent = weaponConfig.name;
            this.weaponNameLabel.style.color = weaponConfig.railColorCss || '#00F0FF';
        }

        if (isReloading || current === 0) {
            this.ammoText.style.color = '#FF0D47';
            this.ammoSubtext.textContent = 'RELOADING...';
            this.ammoSubtext.style.color = '#FF0D47';
        } else {
            const col = weaponConfig ? weaponConfig.railColorCss : '#00F0FF';
            this.ammoText.style.color = col;
            this.ammoSubtext.textContent = 'RICOCHET ROUNDS';
            this.ammoSubtext.style.color = 'rgba(100, 150, 180, 0.8)';
        }
    }

    updateScore(score) {
        this.scoreText.textContent = `SCORE: ${score.toLocaleString()}`;
    }

    updateTokens(tokens) {
        if (this.tokensText) this.tokensText.textContent = `TOKENS: ${tokens}`;
        if (this.menuTokens) this.menuTokens.textContent = `TOKENS: ${tokens}`;
        if (this.storeTokens) this.storeTokens.textContent = `BALANCE: ${tokens} TOKENS`;
    }

    updateLevelInfo(levelConfig, remainingTargets) {
        if (this.sectorText) this.sectorText.textContent = levelConfig.title;
        if (this.targetsText) this.targetsText.textContent = `TARGETS: ${remainingTargets} REMAINING`;
    }

    updateArenaInfo(mapConfig, remainingTargets) {
        if (this.sectorText) {
            this.sectorText.textContent = mapConfig.codename || mapConfig.name || mapConfig.title;
        }
        if (this.targetsText) {
            this.targetsText.textContent = `TARGETS: ${remainingTargets} REMAINING`;
        }
    }

    updateMapStatus(arenaManager) {
        if (!arenaManager) return;

        if (this.mapStatusText) {
            this.mapStatusText.textContent = 'TARGET COMBAT SECTOR // UNRESTRICTED ACCESS';
        }

        if (this.mapActiveLabel) {
            const selectedId = arenaManager.getSelectedMapId();
            const themeId = arenaManager.getSelectedThemeId();
            const themeObj = arenaManager.getThemeById(themeId);
            const themeTag = (themeId && themeId !== 'default') ? ` [${themeObj.name.toUpperCase()}]` : '';

            if (selectedId === 'auto' || selectedId === 'random') {
                this.mapActiveLabel.textContent = `DEPLOYMENT: AUTOMATED ROTATION${themeTag}`;
                this.mapActiveLabel.style.color = '#00FF88';
            } else {
                const map = arenaManager.getMapById(selectedId);
                const effTheme = arenaManager.getEffectiveThemeObject(map);
                this.mapActiveLabel.textContent = `DEPLOYMENT: ${map.name.toUpperCase()} [${effTheme.name.toUpperCase()}]`;
                this.mapActiveLabel.style.color = effTheme.badgeColor || map.badgeColor || '#00F0FF';
            }
        }

        if (this.btnMapSelect) {
            this.btnMapSelect.textContent = 'ARENA & THEME PRESETS';
            this.btnMapSelect.style.borderColor = '#00FF88';
            this.btnMapSelect.style.color = '#00FF88';
            this.btnMapSelect.style.boxShadow = '0 0 16px rgba(0, 255, 136, 0.3)';
            this.btnMapSelect.style.cursor = 'pointer';
        }

        if (this.mapModalProgress) {
            this.mapModalProgress.textContent = 'ALL SECTORS & THEMES UNLOCKED';
            this.mapModalProgress.style.color = '#00FF88';
        }
    }

    showMapSelect(arenaManager, onSelectCallback) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        if (this.mapSelectModal) {
            this.mapSelectModal.style.display = 'flex';
            this.updateMapStatus(arenaManager);
            this._populateMapCards(arenaManager, onSelectCallback);
        }
    }

    hideMapSelect() {
        if (this.mapSelectModal) {
            this.mapSelectModal.style.display = 'none';
        }
    }

    _populateThemePills(arenaManager, onSelectCallback) {
        if (!this.themePillsContainer) return;
        this.themePillsContainer.innerHTML = '';

        const themes = arenaManager.getAllThemes();
        const currentThemeId = arenaManager.getSelectedThemeId();

        // 1. "Default (Signature)" pill
        const defaultPill = document.createElement('button');
        defaultPill.className = `theme-pill ${currentThemeId === 'default' ? 'active' : ''}`;
        defaultPill.textContent = 'MAP SIGNATURE (DEFAULT)';
        defaultPill.title = 'Render each map in its signature native aesthetic';
        defaultPill.addEventListener('click', () => {
            arenaManager.setSelectedTheme('default');
            this._populateThemePills(arenaManager, onSelectCallback);
            this._populateMapCards(arenaManager, onSelectCallback);
            this.updateMapStatus(arenaManager);
            if (onSelectCallback) onSelectCallback(arenaManager.getSelectedMapId());
        });
        this.themePillsContainer.appendChild(defaultPill);

        // 2. Individual Theme Preset pills
        themes.forEach(theme => {
            const isActive = (currentThemeId === theme.id);
            const pill = document.createElement('button');
            pill.className = `theme-pill ${isActive ? 'active' : ''}`;
            pill.textContent = theme.name.toUpperCase();
            pill.title = theme.tagline;
            if (isActive) {
                pill.style.borderColor = theme.badgeColor;
            }

            pill.addEventListener('click', () => {
                arenaManager.setSelectedTheme(theme.id);
                this._populateThemePills(arenaManager, onSelectCallback);
                this._populateMapCards(arenaManager, onSelectCallback);
                this.updateMapStatus(arenaManager);
                if (onSelectCallback) onSelectCallback(arenaManager.getSelectedMapId());
            });

            this.themePillsContainer.appendChild(pill);
        });

        if (this.activeThemeDesc) {
            if (currentThemeId === 'default') {
                this.activeThemeDesc.textContent = 'MAP DEFAULT // EACH MAP USES ITS SIGNATURE NATIVE AESTHETIC';
            } else {
                const t = arenaManager.getThemeById(currentThemeId);
                this.activeThemeDesc.textContent = `${t.name.toUpperCase()} // ${t.tagline}`;
            }
        }
    }

    _populateMapCards(arenaManager, onSelectCallback) {
        if (!this.mapCardsContainer) return;
        this.mapCardsContainer.innerHTML = '';

        this._populateThemePills(arenaManager, onSelectCallback);

        const maps = arenaManager.getAllMaps();
        const selectedId = arenaManager.getSelectedMapId();

        // 1. Render Specific Arena Maps (Always Unlocked)
        maps.forEach(map => {
            const isSelected = (selectedId === map.id);
            const effTheme = arenaManager.getEffectiveThemeObject(map);
            const card = document.createElement('div');
            card.className = `map-card ${isSelected ? 'selected' : ''}`;

            card.innerHTML = `
                <div class="map-card-thumb">
                    ${this._getMapThumbnailSvg(map.id, effTheme.id)}
                </div>
                <div class="map-card-body">
                    <div style="display: flex; gap: 6px; flex-wrap: wrap; margin-bottom: 6px;">
                        <span class="map-badge-surface" style="color: ${map.badgeColor}; background: ${map.badgeBg}; border: 1px solid ${map.badgeColor};">
                            ${map.primarySurface.toUpperCase()} // ${map.stats.reflectivity}
                        </span>
                        <span class="map-badge-surface" style="color: ${effTheme.badgeColor}; background: ${effTheme.badgeBg}; border: 1px solid ${effTheme.badgeColor};">
                            THEME: ${effTheme.name.toUpperCase()}
                        </span>
                    </div>
                    <h3 class="map-card-name" style="color: ${map.badgeColor};">${map.name}</h3>
                    <div class="map-card-subtitle">${map.subtitle}</div>
                    <p class="map-card-desc">${map.description}</p>
                    <div class="map-stats-list">
                        <div class="map-stat-item"><span>COMPLEXITY:</span> <strong style="color:#fff;">${map.stats.complexity}</strong></div>
                        <div class="map-stat-item"><span>COVER:</span> <strong style="color:#fff;">${map.stats.coverDensity}</strong></div>
                        <div class="map-stat-item"><span>HOSTILES:</span> <strong style="color:#FF0D47;">${map.enemySpawns.length} COMBAT MECHS</strong></div>
                    </div>
                </div>
                <button class="map-select-btn ${isSelected ? 'btn-active' : ''}">
                    ${isSelected ? 'ACTIVE ARENA' : 'SELECT ARENA'}
                </button>
            `;

            card.addEventListener('click', () => {
                arenaManager.setSelectedMap(map.id);
                this.updateMapStatus(arenaManager);
                this._populateMapCards(arenaManager, onSelectCallback);
                if (onSelectCallback) onSelectCallback(map.id);
            });

            this.mapCardsContainer.appendChild(card);
        });

        // 2. Render Automated Rotation Protocol Card
        const isAutoSelected = (selectedId === 'auto' || selectedId === 'random' || !selectedId);
        const autoCard = document.createElement('div');
        autoCard.className = `map-card ${isAutoSelected ? 'selected' : ''}`;

        autoCard.innerHTML = `
            <div class="map-card-thumb">
                ${this._getMapThumbnailSvg('auto')}
            </div>
            <div class="map-card-body">
                <span class="map-badge-surface" style="color: #00FF88; background: rgba(0,255,136,0.15); border: 1px solid #00FF88; margin-bottom: 6px;">
                    DYNAMIC // AUTO ROTATION
                </span>
                <h3 class="map-card-name" style="color: #00FF88;">Automated Rotation</h3>
                <div class="map-card-subtitle">Randomized Sector & Aesthetic Deployment</div>
                <p class="map-card-desc">Automatically cycles through all 3 arenas and visual presets at random on each mission start for complete tactical variety.</p>
                <div class="map-stats-list">
                    <div class="map-stat-item"><span>PROTOCOL:</span> <strong style="color:#00FF88;">RANDOMIZED</strong></div>
                    <div class="map-stat-item"><span>POOL:</span> <strong style="color:#fff;">ALL 3 ARENAS + THEMES</strong></div>
                    <div class="map-stat-item"><span>STATUS:</span> <strong style="color:#00F0FF;">READY FOR DEPLOYMENT</strong></div>
                </div>
            </div>
            <button class="map-select-btn ${isAutoSelected ? 'btn-active' : ''}">
                ${isAutoSelected ? 'ACTIVE PROTOCOL' : 'SELECT ROTATION'}
            </button>
        `;

        autoCard.addEventListener('click', () => {
            arenaManager.setSelectedMap('auto');
            this.updateMapStatus(arenaManager);
            this._populateMapCards(arenaManager, onSelectCallback);
            if (onSelectCallback) onSelectCallback('auto');
        });

        this.mapCardsContainer.appendChild(autoCard);
    }

    _getMapThumbnailSvg(mapId, themeId = null) {
        if (mapId === 'brutalist_grid' || themeId === 'cyber_brutalism') {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#060c14"/>
                <path d="M 0 25 L 160 25 M 0 50 L 160 50 M 0 75 L 160 75 M 40 0 L 40 100 M 80 0 L 80 100 M 120 0 L 120 100" stroke="#0e2236" stroke-width="1"/>
                <rect x="8" y="6" width="144" height="88" fill="none" stroke="#00F0FF" stroke-width="1.5" stroke-opacity="0.45"/>
                <rect x="22" y="16" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="120" y="16" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="22" y="66" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="120" y="66" width="18" height="18" fill="#1b2a3a" stroke="#00F0FF" stroke-width="1.5"/>
                <rect x="66" y="38" width="28" height="24" fill="#24384d" stroke="#00F0FF" stroke-width="2"/>
                <line x1="80" y1="38" x2="80" y2="62" stroke="#00F0FF" stroke-width="1.5" stroke-dasharray="2,2"/>
                <path d="M 80 88 L 120 40 L 40 40 L 80 20" fill="none" stroke="#FF0D47" stroke-width="1.2" stroke-dasharray="3,2"/>
                <circle cx="80" cy="88" r="4" fill="#00FF88"/>
                <circle cx="80" cy="20" r="3" fill="#FF0D47"/>
                <circle cx="31" cy="48" r="3" fill="#FF0D47"/>
                <circle cx="129" cy="48" r="3" fill="#FF0D47"/>
            </svg>`;
        } else if (mapId === 'neon_core' || themeId === 'neon_core' || mapId === 'solar_facility' || themeId === 'clean_solar') {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#0d0a14"/>
                <path d="M 0 20 L 160 20 M 0 40 L 160 40 M 0 60 L 160 60 M 0 80 L 160 80 M 32 0 L 32 100 M 64 0 L 64 100 M 96 0 L 96 100 M 128 0 L 128 100" stroke="#251633" stroke-width="1"/>
                <rect x="8" y="6" width="144" height="88" fill="none" stroke="#FFAA00" stroke-width="1.5" stroke-opacity="0.6"/>
                <line x1="46" y1="14" x2="46" y2="86" stroke="#FFAA00" stroke-width="2.5" stroke-dasharray="4,2" stroke-opacity="0.8"/>
                <line x1="114" y1="14" x2="114" y2="86" stroke="#FFAA00" stroke-width="2.5" stroke-dasharray="4,2" stroke-opacity="0.8"/>
                <rect x="68" y="40" width="24" height="20" fill="#1b1226" stroke="#FFAA00" stroke-width="2"/>
                <rect x="60" y="24" width="40" height="4" fill="#FFAA00" opacity="0.9"/>
                <rect x="60" y="72" width="40" height="4" fill="#FFAA00" opacity="0.9"/>
                <rect x="18" y="36" width="16" height="28" fill="#1b1226" stroke="#FF5500" stroke-width="1.5"/>
                <rect x="126" y="36" width="16" height="28" fill="#1b1226" stroke="#FF5500" stroke-width="1.5"/>
                <circle cx="80" cy="88" r="4" fill="#00FF88"/>
                <circle cx="80" cy="18" r="3" fill="#FF0D47"/>
                <circle cx="30" cy="50" r="3" fill="#FF0D47"/>
                <circle cx="130" cy="50" r="3" fill="#FF0D47"/>
                <text x="148" y="16" fill="#FFAA00" font-family="monospace" font-size="8" font-weight="bold" text-anchor="end">NEON CORE</text>
            </svg>`;
        } else if (mapId === 'grid_matrix' || mapId === 'glass_vault' || themeId === 'grid_matrix') {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#040d16"/>
                <path d="M 0 25 L 160 25 M 0 50 L 160 50 M 0 75 L 160 75 M 40 0 L 40 100 M 80 0 L 80 100 M 120 0 L 120 100" stroke="#0a2a40" stroke-width="1"/>
                <rect x="8" y="6" width="144" height="88" fill="none" stroke="#00FFFF" stroke-width="2" stroke-opacity="0.7"/>
                <line x1="22" y1="46" x2="58" y2="46" stroke="#00FFFF" stroke-width="3" stroke-dasharray="5,2"/>
                <line x1="66" y1="46" x2="94" y2="46" stroke="#00FFFF" stroke-width="3" stroke-dasharray="5,2"/>
                <line x1="102" y1="46" x2="138" y2="46" stroke="#00FFFF" stroke-width="3" stroke-dasharray="5,2"/>
                <line x1="48" y1="24" x2="112" y2="24" stroke="#00FFFF" stroke-width="2" stroke-dasharray="4,2"/>
                <rect x="42" y="26" width="14" height="14" fill="#082030" stroke="#00FFFF" stroke-width="1.5"/>
                <rect x="104" y="26" width="14" height="14" fill="#082030" stroke="#00FFFF" stroke-width="1.5"/>
                <circle cx="80" cy="88" r="4" fill="#00FF88"/>
                <circle cx="80" cy="16" r="3" fill="#FF0D47"/>
                <circle cx="80" cy="35" r="3" fill="#FF0D47"/>
                <circle cx="34" cy="35" r="3" fill="#FF0D47"/>
                <circle cx="126" cy="35" r="3" fill="#FF0D47"/>
                <text x="148" y="16" fill="#00FFFF" font-family="monospace" font-size="8" font-weight="bold" text-anchor="end">MATRIX</text>
            </svg>`;
        } else {
            return `
            <svg width="100%" height="100%" viewBox="0 0 160 100" xmlns="http://www.w3.org/2000/svg">
                <rect width="160" height="100" fill="#050a12"/>
                <circle cx="80" cy="50" r="34" fill="none" stroke="#00F0FF" stroke-width="1.5" stroke-dasharray="6,4"/>
                <circle cx="80" cy="50" r="22" fill="none" stroke="#FF6B00" stroke-width="1.5" stroke-dasharray="4,3"/>
                <circle cx="80" cy="50" r="10" fill="rgba(0,255,136,0.15)" stroke="#00FF88" stroke-width="1.5"/>
                <path d="M 66 40 L 80 28 L 94 40 M 94 60 L 80 72 L 66 60" fill="none" stroke="#00FF88" stroke-width="2.2"/>
                <text x="80" y="54" fill="#00F0FF" font-family="Courier New, monospace" font-size="11" font-weight="bold" text-anchor="middle">ROTATION</text>
            </svg>`;
        }
    }

    updateCombo(multiplier, timeLeft, totalTime) {
        if (multiplier > 1.0 && timeLeft > 0) {
            this.comboContainer.style.display = 'block';
            this.comboText.textContent = `COMBO: x${multiplier.toFixed(1)}`;
            const pct = (timeLeft / totalTime) * 100;
            this.comboFill.style.width = `${pct}%`;
        } else {
            this.comboContainer.style.display = 'none';
        }
    }

    updateStyleRank(rank, points, timer, maxDuration) {
        if (!this.styleRankBadge || !rank) return;

        this.styleRankBadge.textContent = rank.grade;
        this.styleRankBadge.className = `style-rank-badge rank-${rank.grade.toLowerCase()}`;
        if (this.styleRankTitle) {
            this.styleRankTitle.textContent = rank.title;
            this.styleRankTitle.style.color = rank.color;
        }
        if (this.styleMultiplier) {
            this.styleMultiplier.textContent = `x${rank.multiplier.toFixed(1)} MULTIPLIER`;
        }

        // Animated punch when player ranks up
        if (this.lastStyleGrade !== rank.grade) {
            this.styleRankBadge.classList.add('rank-up');
            setTimeout(() => {
                if (this.styleRankBadge) this.styleRankBadge.classList.remove('rank-up');
            }, 300);
            this.lastStyleGrade = rank.grade;
        }

        // Update style decay meter
        if (this.styleBarFill) {
            const pct = timer > 0 ? Math.min(100, Math.max(0, (timer / maxDuration) * 100)) : 0;
            this.styleBarFill.style.width = `${pct}%`;
            this.styleBarFill.style.backgroundColor = rank.color;
            this.styleBarFill.style.boxShadow = `0 0 8px ${rank.color}`;
        }
    }

    setAimStatus(status) {
        if (status === 'DOUBLE_BANK_LOCKED') {
            this.crosshair.className = 'crosshair double-locked';
            this.predictionLabel.textContent = '⚡⚡ DOUBLE BANK LOCKED [x2.5]';
            this.predictionLabel.style.color = '#FFAA00';
            this.predictionLabel.style.display = 'block';
        } else if (status === 'LETHAL_LOCKED') {
            this.crosshair.className = 'crosshair lethal';
            this.predictionLabel.textContent = '⚡ RICOCHET LETHAL LOCKED [x1.0]';
            this.predictionLabel.style.color = '#FF0D47';
            this.predictionLabel.style.display = 'block';
        } else if (status === 'DIRECT_DUD') {
            this.crosshair.className = 'crosshair dud';
            this.predictionLabel.textContent = '🚫 DIRECT HIT (0 DMG - RICOCHET REQUIRED)';
            this.predictionLabel.style.color = 'rgba(255, 120, 120, 0.95)';
            this.predictionLabel.style.display = 'block';
        } else {
            this.crosshair.className = 'crosshair normal';
            this.predictionLabel.style.display = 'none';
        }
    }

    showStyleEvent({ bounces, score, rank, tricks, tokens = 0, multiplier = 1.0 }) {
        let title = '';
        let color = rank ? rank.color : '#00F0FF';

        if (bounces === 1) {
            title = `⚡ BANK SHOT! +${score}`;
        } else if (bounces === 2) {
            title = `🔥 DOUBLE BANK! +${score} (x${multiplier.toFixed(1)})`;
            color = '#FFAA00';
        } else {
            title = `👑 ${bounces}x SINGULARITY BANK! +${score} (x${multiplier.toFixed(1)})`;
            color = '#D000FF';
        }

        if (tokens > 0) {
            title += ` | +${tokens} 🪙`;
        }

        this.bannerText.textContent = title;
        this.bannerText.style.color = color;
        this.bannerText.style.opacity = '1';
        this.bannerText.style.transform = 'translate(-50%, 0) scale(1.25)';

        // Display trick pills beneath banner
        if (this.styleTricksFeed && tricks && tricks.length > 0) {
            const pillHtml = tricks.map(t => `<span class="trick-pill">${t.label} (+${t.bonus})</span>`).join(' ');
            this.styleTricksFeed.innerHTML = pillHtml;
            this.styleTricksFeed.style.opacity = '1';
            clearTimeout(this.trickFeedTimeout);
            this.trickFeedTimeout = setTimeout(() => {
                if (this.styleTricksFeed) this.styleTricksFeed.style.opacity = '0';
            }, 2400);
        }

        clearTimeout(this.bannerTimer);
        this.bannerTimer = setTimeout(() => {
            this.bannerText.style.opacity = '0';
            this.bannerText.style.transform = 'translate(-50%, -15px) scale(0.95)';
        }, 2200);
    }

    showBanner(bounces, points, multiplier, tokensAwarded = 0) {
        this.showStyleEvent({
            bounces,
            score: points,
            rank: { color: bounces >= 2 ? '#FFAA00' : '#00F0FF' },
            tricks: [],
            tokens: tokensAwarded,
            multiplier
        });
    }

    // -------------------------------------------------------------------------
    // Menu & Modal Navigation
    // -------------------------------------------------------------------------
    showMainMenu() {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.mainMenu.style.display = 'flex';
        if (this.pauseModal) this.pauseModal.style.display = 'none';
        this.howToPlayModal.style.display = 'none';
        this.storeModal.style.display = 'none';
        this.levelCompleteModal.style.display = 'none';
        this.gameOverModal.style.display = 'none';
        this.campaignVictoryModal.style.display = 'none';
        this.updateTokens(this.economy.getTokens());
    }

    hideMainMenu() {
        this.mainMenu.style.display = 'none';
    }

    showPauseMenu() {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        if (this.pauseModal) this.pauseModal.style.display = 'flex';
    }

    hidePauseMenu() {
        if (this.pauseModal) this.pauseModal.style.display = 'none';
    }

    isAnyMenuOpen() {
        const modals = [
            this.mainMenu,
            this.pauseModal,
            this.howToPlayModal,
            this.storeModal,
            this.mapSelectModal,
            this.levelCompleteModal,
            this.gameOverModal,
            this.campaignVictoryModal
        ];
        return modals.some(m => m && m.style.display !== 'none');
    }

    showStore(onEquipCallback) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.storeModal.style.display = 'flex';
        this.updateTokens(this.economy.getTokens());
        this._populateStoreCards(onEquipCallback);
    }

    hideStore() {
        this.storeModal.style.display = 'none';
    }

    showHowToPlay() {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.howToPlayModal.style.display = 'flex';
    }

    hideHowToPlay() {
        this.howToPlayModal.style.display = 'none';
    }

    showLevelComplete(levelConfig, tokensEarnedThisLevel, isLastLevel) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.levelCompleteModal.style.display = 'flex';
        this.levelCompleteTitle.textContent = `${levelConfig.title} CLEARED`;
        this.levelCompleteSubtitle.textContent = levelConfig.subtitle;
        this.levelTokensEarned.textContent = `TOKENS HARVESTED: +${tokensEarnedThisLevel} 🪙`;
        this.btnNextLevel.textContent = isLastLevel ? 'COMPLETE CAMPAIGN' : 'PROCEED TO NEXT SECTOR';
        this.updateTokens(this.economy.getTokens());
    }

    hideLevelComplete() {
        this.levelCompleteModal.style.display = 'none';
    }

    showGameOver(finalScore) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.gameOverModal.style.display = 'flex';
        this.gameOverScore.textContent = `FINAL SCORE: ${finalScore.toLocaleString()}`;
    }

    hideGameOver() {
        this.gameOverModal.style.display = 'none';
    }

    showCampaignVictory(finalScore, totalTokens) {
        if (document.pointerLockElement) {
            try { document.exitPointerLock(); } catch (e) {}
        }
        this.campaignVictoryModal.style.display = 'flex';
        this.campaignFinalScore.textContent = `CAMPAIGN SCORE: ${finalScore.toLocaleString()} | TOKENS: ${totalTokens}`;
    }

    hideCampaignVictory() {
        this.campaignVictoryModal.style.display = 'none';
    }

    _populateStoreCards(onEquipCallback) {
        import('../weapons/WeaponConfig.js').then(({ WEAPON_CATALOG }) => {
            this.storeCardsContainer.innerHTML = '';
            const equippedId = this.economy.equippedWeaponId;

            WEAPON_CATALOG.forEach(weapon => {
                const isUnlocked = this.economy.isUnlocked(weapon.id);
                const isEquipped = (weapon.id === equippedId);
                const canAfford = this.economy.canAfford(weapon.cost);

                const card = document.createElement('div');
                card.className = `store-card ${isEquipped ? 'equipped' : ''}`;

                card.innerHTML = `
                    <div class="store-card-header">
                        <div class="store-weapon-category">${weapon.category}</div>
                        <h3 class="store-weapon-name" style="color: ${weapon.railColorCss}">${weapon.name}</h3>
                    </div>
                    <p class="store-weapon-desc">${weapon.description}</p>
                    <div class="store-stats-grid">
                        <div class="stat-row">
                            <span>VELOCITY:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(weapon.speed / 80) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                        <div class="stat-row">
                            <span>BOUNCE LIMIT:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(weapon.maxBounces / 8) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                        <div class="stat-row">
                            <span>MAGAZINE:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${(weapon.maxAmmo / 14) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                        <div class="stat-row">
                            <span>FIRE RATE:</span>
                            <div class="stat-bar-bg"><div class="stat-bar-fill" style="width: ${((0.4 - weapon.fireCooldown) / 0.3) * 100}%; background: ${weapon.railColorCss}"></div></div>
                        </div>
                    </div>
                    <div class="store-card-footer">
                        <div class="store-price-tag">${isUnlocked ? 'UNLOCKED' : `${weapon.cost} TOKENS`}</div>
                        <button class="store-action-btn ${isEquipped ? 'btn-equipped' : isUnlocked ? 'btn-equip' : canAfford ? 'btn-buy' : 'btn-disabled'}">
                            ${isEquipped ? 'EQUIPPED' : isUnlocked ? 'EQUIP' : canAfford ? 'PURCHASE' : 'LOCKED'}
                        </button>
                    </div>
                `;

                const actionBtn = card.querySelector('.store-action-btn');
                actionBtn.addEventListener('click', () => {
                    if (isEquipped) return;
                    if (isUnlocked) {
                        this.economy.equipWeapon(weapon.id);
                        if (onEquipCallback) onEquipCallback(this.economy.getEquippedWeapon());
                        this._populateStoreCards(onEquipCallback);
                    } else if (canAfford) {
                        const res = this.economy.buyWeapon(weapon.id);
                        if (res.success) {
                            if (onEquipCallback) onEquipCallback(this.economy.getEquippedWeapon());
                            this.updateTokens(this.economy.getTokens());
                            this._populateStoreCards(onEquipCallback);
                        }
                    }
                });

                this.storeCardsContainer.appendChild(card);
            });
        });
    }
}


// ==============================================================================
// FILE: src/game.js
// ==============================================================================
/**
 * ==============================================================================
 * Bounce Kill - Master Game Coordinator (game.js)
 * Implements complete game loop:
 * - Cyberpunk Main Menu, How To Play & Armory Store modal transitions
 * - Multi-stage campaign level progression (Sectors 01, 02, 03)
 * - Economy system: Token rewards for bank shots, persist in localStorage
 * - Dynamic weapon equips: Railgun, Plasma Carbine, Spectre-9 Pistol
 * - Post-processing UnrealBloomPass & procedural PBR environment
 * ==============================================================================
 */















const STYLE_RANKS = [
    { grade: 'D', title: 'DEFLECTOR', minPoints: 0, multiplier: 1.0, color: '#8899aa' },
    { grade: 'C', title: 'CALCULATED', minPoints: 100, multiplier: 1.5, color: '#00F0FF' },
    { grade: 'B', title: 'BANK SHOT', minPoints: 260, multiplier: 2.2, color: '#00FF88' },
    { grade: 'A', title: 'APEX RICOCHET', minPoints: 500, multiplier: 3.2, color: '#FFAA00' },
    { grade: 'S', title: 'SUPREME ANGLE', minPoints: 900, multiplier: 4.5, color: '#FF0D47' },
    { grade: 'SS', title: 'SINGULARITY', minPoints: 1400, multiplier: 6.0, color: '#FFD700' }
];

class BounceKillGame {
    constructor() {
        this.canvas = document.getElementById('render-canvas') || document.querySelector('canvas');
        this.gameState = 'MENU';
        this.lastTime = performance.now();
        this.animationFrameId = null;

        // Ensure animate & loop are bound and persistent
        this.animate = this.animate.bind(this);
        this.loop = this.animate;

        // 1. Wrap entire setup/initialization in a try/catch block
        try {
            this.init();
        } catch (error) {
            console.error("Game Init Error:", error);
        }

        // 2. Ensure animation loop is always started and persists
        if (!this.animationFrameId) {
            this.animate();
        }
    }

    /**
     * Master setup routine: loads Three.js, scene objects, lighting, arena, and event listeners.
     */
    init() {
        this.canvas = document.getElementById('render-canvas') || document.querySelector('canvas');

        // Core systems
        this.economy = new EconomyManager();
        this.levelManager = new LevelManager();
        this.arenaManager = new ArenaManager();
        this.hud = new HUD(this.economy);
        this.physics = new PhysicsWorld();
        this.sound = new SoundManager();

        this.bulletManager = new BulletManager(this.physics, this.sound);
        this.enemyManager = new EnemyManager(this.physics, this.sound);
        this.player = new FPSController(this.canvas, this.physics, this.sound, this.bulletManager);
        this.laserPredictor = new LaserPredictor(this.physics);

        // State Machine: 'MENU', 'PLAYING', 'LEVEL_COMPLETE', 'GAME_OVER', 'VICTORY'
        this.gameState = 'MENU';

        // Gameplay tracking
        this.maxHealth = 100;
        this.playerHealth = 100;
        this.score = 0;
        this.tokensEarnedThisLevel = 0;
        this.comboMultiplier = 1.0;
        this.comboTimer = 0;
        this.comboDuration = 4.5;

        // Style Chains & Ricochet Multiplier System
        this.stylePoints = 0;
        this.currentStyleIndex = 0;
        this.styleDecayTimer = 0;
        this.styleDecayDuration = 5.5;
        this.styleChainCount = 0;

        // Slow-Motion Focus (Bullet Time Reflex)
        this.maxFocusEnergy = 100;
        this.focusEnergy = 100;
        this.focusDrainRate = 22.0;    // Drains in ~4.5 seconds
        this.focusRechargeRate = 14.0; // Recharges in ~7 seconds
        this.minFocusToActivate = 12.0;
        this.isFocusActive = false;
        this.timeScale = 1.0;
        this.SLOW_MO_SCALE = 0.3;
        this.baseFov = 80;
        this.focusFov = 73;

        // Dynamic arena mesh & light tracking
        this.levelMeshes = [];
        this.mapLights = [];
        this.currentMapConfig = null;

        this.useThree = (typeof window.THREE !== 'undefined');
        if (this.useThree) {
            console.log('[Engine] Initializing Three.js Pipeline with UnrealBloomPass & Dynamic Lighting');
            this._initThreeScene();
            this._initPostProcessing();
        } else {
            console.log('[Engine] Initializing Native WebGL Pipeline');
            this.renderer = new WebGLRenderer(this.canvas);
        }

        this._setupMenuAndStoreEvents();
        this._setupCanvasPointerLock();

        // Resolve and load initial arena according to The First 5 Games Rule
        const initialMap = this.arenaManager.resolveNextMap();
        this.loadArena(initialMap);

        // Equip saved weapon from economy
        const savedWeapon = this.economy.getEquippedWeapon();
        this.player.equipWeapon(savedWeapon);

        // Update HUD map status and show Main Menu by default
        this.hud.updateMapStatus(this.arenaManager);
        this.hud.showMainMenu();
    }

    _initThreeScene() {
        const THREE = window.THREE;

        this.tRenderer = new THREE.WebGLRenderer({
            canvas: this.canvas,
            antialias: true,
            powerPreference: 'high-performance'
        });
        this.tRenderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.tRenderer.setSize(window.innerWidth, window.innerHeight);
        this.tRenderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.tRenderer.toneMappingExposure = 1.15;

        this.tScene = new THREE.Scene();
        this.tScene.background = new THREE.Color(0x05080c);
        this.tScene.fog = new THREE.FogExp2(0x05080c, 0.015);

        this.bulletManager.setScene(this.tScene);
        this.enemyManager.setScene(this.tScene);

        this.tCamera = new THREE.PerspectiveCamera(80, window.innerWidth / window.innerHeight, 0.08, 250);
        this.tCamera.position.set(0, 1.6, 12);
        this.tScene.add(this.tCamera);

        this.viewmodel = new WeaponViewmodel(this.tCamera, this.tScene);
        this.player.setViewmodel(this.viewmodel);

        // Laser line (Supports up to 3 segments / multi-bounce reflection)
        const lineGeo = new THREE.BufferGeometry();
        lineGeo.setAttribute('position', new THREE.Float32BufferAttribute(new Float32Array(18), 3));
        lineGeo.setAttribute('color', new THREE.Float32BufferAttribute(new Float32Array(18), 3));
        this.tLaserLine = new THREE.LineSegments(lineGeo, new THREE.LineBasicMaterial({ vertexColors: true, linewidth: 3 }));
        this.tScene.add(this.tLaserLine);

        window.addEventListener('resize', () => {
            this.tRenderer.setSize(window.innerWidth, window.innerHeight);
            this.tCamera.aspect = window.innerWidth / window.innerHeight;
            this.tCamera.updateProjectionMatrix();
            if (this.composer) {
                this.composer.setSize(window.innerWidth, window.innerHeight);
            }
        });
    }

    _initPostProcessing() {
        const THREE = window.THREE;
        if (!THREE.EffectComposer || !THREE.UnrealBloomPass) return;

        try {
            this.composer = new THREE.EffectComposer(this.tRenderer);
            const renderPass = new THREE.RenderPass(this.tScene, this.tCamera);
            this.composer.addPass(renderPass);

            const bloomPass = new THREE.UnrealBloomPass(
                new THREE.Vector2(window.innerWidth, window.innerHeight),
                1.25,
                0.55,
                0.32
            );
            this.composer.addPass(bloomPass);
            this.bloomPass = bloomPass;
        } catch (e) {
            this.composer = null;
        }
    }

    /**
     * Clears all dynamic meshes, lights, and physics obstacles for seamless arena transitions.
     * Prevents memory leaks by recursively disposing geometries and materials.
     */
    clearArena() {
        // 1. Remove and dispose all level meshes from Three.js scene
        if (this.useThree && this.levelMeshes) {
            for (const item of this.levelMeshes) {
                this._disposeSceneNode(item);
                this.tScene.remove(item);
            }
            this.levelMeshes = [];
        }

        // 2. Remove and dispose map-specific dynamic lights & grid helper
        if (this.useThree && this.mapLights) {
            for (const light of this.mapLights) {
                if (light.dispose) light.dispose();
                this.tScene.remove(light);
            }
            this.mapLights = [];
        }

        // 3. Clear projectiles, sparks, and glass shards
        if (this.bulletManager) {
            this.bulletManager.clear();
        }

        // 4. Clear enemies
        if (this.enemyManager) {
            this.enemyManager.clear();
        }

        // 5. Clear physics static obstacles
        this.physics.staticObstacles = [];
    }

    _disposeSceneNode(node) {
        if (!node) return;
        if (node.geometry) {
            node.geometry.dispose();
        }
        if (node.material) {
            if (Array.isArray(node.material)) {
                node.material.forEach(m => m.dispose());
            } else {
                node.material.dispose();
            }
        }
        if (node.children && node.children.length > 0) {
            for (const child of node.children) {
                this._disposeSceneNode(child);
            }
        }
    }

    _buildArenaPerimeterForMap(mapConfig, themeObj) {
        const THREE = window.THREE;
        const theme = themeObj.theme;

        // Floor
        this.physics.addStaticObstacle(new Vector3(-30, -1, -30), new Vector3(30, 0, 30), 'floor', [0.08, 0.1, 0.13]);
        if (this.useThree) {
            let floorTextures;
            if (themeObj.id === 'grid_matrix') {
                floorTextures = TextureGenerator.createMatrixFloor();
            } else {
                floorTextures = TextureGenerator.createConcreteFloor();
            }

            const floorGeo = new THREE.BoxGeometry(60, 1, 60);
            const floorMat = new THREE.MeshStandardMaterial({
                map: floorTextures.map,
                roughnessMap: floorTextures.roughnessMap,
                color: theme.floorColor,
                roughness: (themeObj.id === 'grid_matrix') ? 0.22 : (themeObj.id === 'neon_core' ? 0.38 : 0.35),
                metalness: (themeObj.id === 'grid_matrix') ? 0.45 : (themeObj.id === 'neon_core' ? 0.55 : 0.35)
            });
            const floorMesh = new THREE.Mesh(floorGeo, floorMat);
            floorMesh.position.set(0, -0.5, 0);
            this.tScene.add(floorMesh);
            this.levelMeshes.push(floorMesh);
        }

        // 4 Outer Perimeter Walls
        const wallH = 6.0;
        const walls = [
            { min: new Vector3(-30, 0, -30.5), max: new Vector3(30, wallH, -29.5) }, // North
            { min: new Vector3(-30, 0, 29.5),  max: new Vector3(30, wallH, 30.5) },  // South
            { min: new Vector3(29.5, 0, -30),  max: new Vector3(30.5, wallH, 30) },  // East
            { min: new Vector3(-30.5, 0, -30), max: new Vector3(-29.5, wallH, 30) }  // West
        ];

        let wallTexture = null;
        if (this.useThree) {
            if (themeObj.id === 'grid_matrix') {
                wallTexture = TextureGenerator.createMatrixWall().map;
            } else {
                wallTexture = TextureGenerator.createWallTexture().map;
            }
        }

        for (const w of walls) {
            this.physics.addStaticObstacle(w.min, w.max, 'wall', [0.16, 0.2, 0.26]);
            if (this.useThree) {
                const sz = new Vector3().subVectors(w.max, w.min);
                const ctr = new Vector3().addVectors(w.min, w.max).multiplyScalar(0.5);

                const mesh = new THREE.Mesh(
                    new THREE.BoxGeometry(sz.x, sz.y, sz.z),
                    new THREE.MeshStandardMaterial({
                        map: wallTexture,
                        color: theme.wallColor,
                        roughness: (themeObj.id === 'grid_matrix') ? 0.25 : (themeObj.id === 'neon_core' ? 0.42 : 0.5),
                        metalness: (themeObj.id === 'grid_matrix') ? 0.45 : (themeObj.id === 'neon_core' ? 0.65 : 0.55)
                    })
                );
                mesh.position.set(ctr.x, ctr.y, ctr.z);
                this.tScene.add(mesh);
                this.levelMeshes.push(mesh);

                // Perimeter trim strip
                const stripGeo = new THREE.BoxGeometry(sz.x > sz.z ? sz.x : 0.2, 0.1, sz.z > sz.x ? sz.z : 0.2);
                const stripColor = theme.conduitColor || mapConfig.badgeColor;
                const stripMat = new THREE.MeshStandardMaterial({
                    color: stripColor,
                    emissive: stripColor,
                    emissiveIntensity: 1.8
                });
                const strip = new THREE.Mesh(stripGeo, stripMat);
                strip.position.set(ctr.x, 0.1, ctr.z);
                this.tScene.add(strip);
                this.levelMeshes.push(strip);
            }
        }
    }

    _buildMapObstacles(mapConfig, themeObj) {
        const THREE = window.THREE;
        const theme = themeObj.theme;
        const hazardMap = this.useThree ? TextureGenerator.createHazardStripe() : null;
        const grateTex = this.useThree ? TextureGenerator.createGrateTexture().map : null;
        const glassTex = this.useThree ? TextureGenerator.createGlassTexture().map : null;

        for (const p of mapConfig.obstacles) {
            const matType = p.materialType || 'concrete';
            const box = this.physics.addStaticObstacle(p.min, p.max, p.type, [0.22, 0.28, 0.36], matType);

            if (this.useThree) {
                const sz = new Vector3().subVectors(p.max, p.min);
                const ctr = new Vector3().addVectors(p.min, p.max).multiplyScalar(0.5);

                if (matType === 'glass') {
                    // Shatterable Glass Barrier
                    const glassGroup = new THREE.Group();
                    glassGroup.position.set(ctr.x, ctr.y, ctr.z);

                    const glassGeo = new THREE.BoxGeometry(sz.x, sz.y, sz.z);
                    const glassMat = new THREE.MeshStandardMaterial({
                        map: glassTex,
                        color: theme.glassColor,
                        emissive: (themeObj.id === 'grid_matrix') ? 0x00ffff : (themeObj.id === 'neon_core' ? 0xffaa00 : 0x00F0FF),
                        emissiveIntensity: (themeObj.id === 'grid_matrix') ? 0.85 : 0.35,
                        transparent: true,
                        opacity: theme.glassOpacity || 0.42,
                        roughness: 0.08,
                        metalness: 0.3
                    });
                    const glassMesh = new THREE.Mesh(glassGeo, glassMat);
                    glassGroup.add(glassMesh);

                    // High-tech frame border
                    const frameThickness = 0.06;
                    const frameGeo = new THREE.BoxGeometry(sz.x + frameThickness, sz.y + frameThickness, sz.z + frameThickness);
                    const frameColor = (themeObj.id === 'grid_matrix') ? 0x00ffff : (themeObj.id === 'neon_core' ? 0xffaa00 : 0x00F0FF);
                    const frameWireMat = new THREE.MeshStandardMaterial({
                        color: frameColor,
                        emissive: frameColor,
                        emissiveIntensity: 1.6,
                        wireframe: true
                    });
                    const frameMesh = new THREE.Mesh(frameGeo, frameWireMat);
                    glassGroup.add(frameMesh);

                    this.tScene.add(glassGroup);
                    this.levelMeshes.push(glassGroup);
                    box.mesh = glassGroup;
                } else if (matType === 'grate') {
                    // Industrial Grating / Slotted Mesh Barrier
                    const grateGroup = new THREE.Group();
                    grateGroup.position.set(ctr.x, ctr.y, ctr.z);

                    const grateGeo = new THREE.BoxGeometry(sz.x, sz.y, sz.z);
                    const grateMat = new THREE.MeshStandardMaterial({
                        map: grateTex,
                        color: theme.grateColor,
                        roughness: 0.42,
                        metalness: 0.88
                    });
                    const grateMesh = new THREE.Mesh(grateGeo, grateMat);
                    grateGroup.add(grateMesh);

                    // Hazard border trim
                    const rimGeo = new THREE.BoxGeometry(sz.x * 1.02, 0.18, sz.z * 1.02);
                    const rimColor = (themeObj.id === 'neon_core') ? 0xFFAA00 : (themeObj.id === 'grid_matrix' ? 0x00ffff : 0xFFAA00);
                    const rimMat = new THREE.MeshStandardMaterial({
                        color: rimColor,
                        emissive: rimColor,
                        emissiveIntensity: 1.3
                    });
                    const topRim = new THREE.Mesh(rimGeo, rimMat);
                    topRim.position.set(0, sz.y * 0.5 - 0.09, 0);
                    grateGroup.add(topRim);

                    this.tScene.add(grateGroup);
                    this.levelMeshes.push(grateGroup);
                    box.mesh = grateGroup;
                } else {
                    // Concrete / Quartz / Digital Monolith
                    const concreteGroup = new THREE.Group();
                    concreteGroup.position.set(ctr.x, ctr.y, ctr.z);

                    const mesh = new THREE.Mesh(
                        new THREE.BoxGeometry(sz.x, sz.y, sz.z),
                        new THREE.MeshStandardMaterial({
                            color: theme.pillarColor,
                            roughness: (themeObj.id === 'grid_matrix') ? 0.22 : 0.25,
                            metalness: (themeObj.id === 'grid_matrix') ? 0.45 : 0.85
                        })
                    );
                    concreteGroup.add(mesh);

                    // Glowing energy conduit strip
                    const conduitGeo = new THREE.BoxGeometry(0.14, sz.y * 0.9, 0.14);
                    const conduitColor = theme.conduitColor || 0x00F0FF;
                    const conduitMat = new THREE.MeshStandardMaterial({
                        color: conduitColor,
                        emissive: conduitColor,
                        emissiveIntensity: 2.0
                    });
                    const conduit = new THREE.Mesh(conduitGeo, conduitMat);
                    conduit.position.set(0, 0, sz.z * 0.51);
                    concreteGroup.add(conduit);

                    // Optional hazard tape
                    if (hazardMap && p.type === 'pillar') {
                        const hGeo = new THREE.BoxGeometry(sz.x * 1.01, 0.25, sz.z * 1.01);
                        const hMat = new THREE.MeshBasicMaterial({ map: hazardMap });
                        const hMesh = new THREE.Mesh(hGeo, hMat);
                        hMesh.position.set(0, 1.2 - ctr.y, 0);
                        concreteGroup.add(hMesh);
                    }

                    this.tScene.add(concreteGroup);
                    this.levelMeshes.push(concreteGroup);
                    box.mesh = concreteGroup;
                }
            }
        }
    }

    /**
     * Loads a specific arena configuration: tears down previous world, builds geometry,
     * updates dynamic atmospheric lighting & fog, and spawns hostiles.
     */
    loadArena(mapConfig) {
        if (!mapConfig) return;
        this.currentMapConfig = mapConfig;

        // 1. Cleanly tear down existing scene entities
        this.clearArena();

        const THREE = window.THREE;
        const themeObj = this.arenaManager.getEffectiveThemeObject(mapConfig);
        const theme = themeObj.theme;

        // 2. Setup Map Ambience, Fog & Lighting
        if (this.useThree) {
            this.tScene.background.setHex(theme.fogColor);
            this.tScene.fog = new THREE.FogExp2(theme.fogColor, theme.fogDensity);

            // Dynamic map lights
            const ambient = new THREE.AmbientLight(theme.ambientColor, theme.ambientIntensity);
            this.tScene.add(ambient);
            this.mapLights.push(ambient);

            const dirLight = new THREE.DirectionalLight(theme.dirLightColor, theme.dirLightIntensity);
            dirLight.position.set(theme.dirLightPos[0], theme.dirLightPos[1], theme.dirLightPos[2]);
            this.tScene.add(dirLight);
            this.mapLights.push(dirLight);

            const rimLight = new THREE.DirectionalLight(theme.accentLightColor, 0.45);
            rimLight.position.set(-theme.dirLightPos[0], 25, -theme.dirLightPos[2]);
            this.tScene.add(rimLight);
            this.mapLights.push(rimLight);

            const grid = new THREE.GridHelper(60, 30, theme.gridColor1, theme.gridColor2);
            grid.position.y = 0.012;
            this.tScene.add(grid);
            this.mapLights.push(grid);

            // Dynamic tone mapping & bloom adjustment for light-background arenas
            if (this.bloomPass) {
                this.bloomPass.threshold = (theme.bloomThreshold !== undefined) ? theme.bloomThreshold : 0.32;
                this.bloomPass.strength = (theme.bloomStrength !== undefined) ? theme.bloomStrength : 1.25;
            }
            if (this.tRenderer) {
                this.tRenderer.toneMappingExposure = (theme.exposure !== undefined) ? theme.exposure : 1.15;
            }
        }

        // 3. Build Perimeter (Floor & 4 Outer Boundary Walls)
        this._buildArenaPerimeterForMap(mapConfig, themeObj);

        // 4. Build Obstacles (Concrete, Grate, Glass)
        this._buildMapObstacles(mapConfig, themeObj);

        // 5. Spawn tactical enemy mechs
        for (const pos of mapConfig.enemySpawns) {
            this.enemyManager.spawnEnemy(pos.x, pos.z);
        }

        // 6. Reset player vitals, focus energy & location
        this.playerHealth = this.maxHealth;
        this.focusEnergy = this.maxFocusEnergy;
        this.setFocusMode(false);
        this.timeScale = 1.0;
        this.sound.setFocusDilation(1.0);

        const spawnPos = mapConfig.playerSpawn || new Vector3(0, 1.6, 16);
        this.player.position.copy(spawnPos);
        this.player.velocity.set(0, 0, 0);
        this.player.yaw = 0;
        this.player.pitch = 0;

        // Reset style points & rank
        this.stylePoints = 0;
        this.currentStyleIndex = 0;
        this.styleDecayTimer = 0;
        this.styleChainCount = 0;
        this.comboMultiplier = 1.0;
        this.hud.updateStyleRank(STYLE_RANKS[0], 0, 0, this.styleDecayDuration);

        const currentWeapon = this.economy.getEquippedWeapon();
        this.player.equipWeapon(currentWeapon);

        this.tokensEarnedThisLevel = 0;

        // 7. Update HUD badges
        this.hud.updateHealth(this.playerHealth, this.maxHealth);
        this.hud.updateFocus(this.focusEnergy, this.maxFocusEnergy, false);
        this.hud.updateArenaInfo(mapConfig, this.enemyManager.enemies.length);
        this.hud.updateTokens(this.economy.getTokens());
        this.hud.updateAmmo(this.player.currentAmmo, this.player.maxAmmo, false, currentWeapon);
    }

    loadLevel(levelIndex) {
        const maps = this.arenaManager.getAllMaps();
        const map = maps[levelIndex % maps.length];
        this.loadArena(map);
    }

    _updateStyleRankFromPoints() {
        let rankIdx = 0;
        for (let i = STYLE_RANKS.length - 1; i >= 0; i--) {
            if (this.stylePoints >= STYLE_RANKS[i].minPoints) {
                rankIdx = i;
                break;
            }
        }
        this.currentStyleIndex = rankIdx;
    }

    setFocusMode(active) {
        if (active === this.isFocusActive) return;

        if (active) {
            if (this.focusEnergy < this.minFocusToActivate) return;
            this.isFocusActive = true;
            this.sound.playFocusEnter();
            this.hud.setFocusOverlay(true);
        } else {
            this.isFocusActive = false;
            this.sound.playFocusExit();
            this.hud.setFocusOverlay(false);
        }
    }

    _setupMenuAndStoreEvents() {
        if (!this.hud) return;

        // Main Menu buttons
        if (this.hud.btnPlay) {
            this.hud.btnPlay.addEventListener('click', () => {
                this.startGame();
            });
        }

        const openArenaModal = () => {
            this.hud.showMapSelect(this.arenaManager, (selectedMapId) => {
                const chosen = (selectedMapId === 'auto' || selectedMapId === 'random')
                    ? this.arenaManager.resolveNextMap()
                    : this.arenaManager.getMapById(selectedMapId);
                this.loadArena(chosen);
            });
        };

        if (this.hud.btnMapSelect) {
            this.hud.btnMapSelect.addEventListener('click', openArenaModal);
        }

        if (this.hud.menuMapStatus) {
            this.hud.menuMapStatus.addEventListener('click', openArenaModal);
        }

        if (this.hud.btnCancelMapSelect) {
            this.hud.btnCancelMapSelect.addEventListener('click', () => {
                this.hud.hideMapSelect();
                this.hud.updateMapStatus(this.arenaManager);
                if (this.gameState === 'MENU') {
                    this.hud.showMainMenu();
                }
            });
        }

        if (this.hud.btnCloseMapSelect) {
            this.hud.btnCloseMapSelect.addEventListener('click', () => {
                this.hud.hideMapSelect();
                this.hud.updateMapStatus(this.arenaManager);
                this.startGame();
            });
        }

        if (this.hud.btnStore) {
            this.hud.btnStore.addEventListener('click', () => {
                this.hud.showStore((equippedWeapon) => {
                    this.player.equipWeapon(equippedWeapon);
                });
            });
        }

        if (this.hud.btnHowToPlay) {
            this.hud.btnHowToPlay.addEventListener('click', () => {
                this.hud.showHowToPlay();
            });
        }

        if (this.hud.btnCloseHowToPlay) {
            this.hud.btnCloseHowToPlay.addEventListener('click', () => {
                this.hud.hideHowToPlay();
            });
        }

        if (this.hud.btnCloseStore) {
            this.hud.btnCloseStore.addEventListener('click', () => {
                this.hud.hideStore();
                if (this.gameState === 'PAUSED') {
                    this.hud.showPauseMenu();
                } else if (this.gameState === 'MENU') {
                    this.hud.showMainMenu();
                }
            });
        }

        // Pause Menu buttons
        if (this.hud.btnResumeGame) {
            this.hud.btnResumeGame.addEventListener('click', () => {
                this.resumeGame();
            });
        }

        if (this.hud.btnPauseStore) {
            this.hud.btnPauseStore.addEventListener('click', () => {
                this.hud.hidePauseMenu();
                this.hud.showStore((equippedWeapon) => {
                    this.player.equipWeapon(equippedWeapon);
                });
            });
        }

        if (this.hud.btnPauseRestart) {
            this.hud.btnPauseRestart.addEventListener('click', () => {
                this.hud.hidePauseMenu();
                this.loadArena(this.currentMapConfig);
                this.gameState = 'PLAYING';
                this.requestPointerLock();
            });
        }

        if (this.hud.btnPauseMenu) {
            this.hud.btnPauseMenu.addEventListener('click', () => {
                this.hud.hidePauseMenu();
                this.gameState = 'MENU';
                this.hud.updateMapStatus(this.arenaManager);
                this.hud.showMainMenu();
            });
        }

        if (this.hud.pauseModal) {
            this.hud.pauseModal.addEventListener('click', (e) => {
                if (e.target === this.hud.pauseModal) {
                    this.resumeGame();
                }
            });
        }

        // Level Complete buttons
        if (this.hud.btnNextLevel) {
            this.hud.btnNextLevel.addEventListener('click', () => {
                this.hud.hideLevelComplete();
                let nextMap;
                if (this.arenaManager.getSelectedMapId() === 'auto') {
                    nextMap = this.arenaManager.resolveNextMap();
                } else {
                    const maps = this.arenaManager.getAllMaps();
                    const currentIdx = maps.findIndex(m => m.id === (this.currentMapConfig ? this.currentMapConfig.id : ''));
                    const nextIdx = (currentIdx + 1) % maps.length;
                    nextMap = maps[nextIdx];
                    this.arenaManager.setSelectedMap(nextMap.id);
                    this.hud.updateMapStatus(this.arenaManager);
                }
                this.loadArena(nextMap);
                this.gameState = 'PLAYING';
                this.requestPointerLock();
            });
        }

        if (this.hud.btnLevelStore) {
            this.hud.btnLevelStore.addEventListener('click', () => {
                this.hud.hideLevelComplete();
                this.hud.showStore((equippedWeapon) => {
                    this.player.equipWeapon(equippedWeapon);
                });
            });
        }

        // Game Over buttons
        if (this.hud.btnRestartLevel) {
            this.hud.btnRestartLevel.addEventListener('click', () => {
                this.hud.hideGameOver();
                this.loadArena(this.currentMapConfig);
                this.gameState = 'PLAYING';
                this.requestPointerLock();
            });
        }

        if (this.hud.btnGameOverMenu) {
            this.hud.btnGameOverMenu.addEventListener('click', () => {
                this.hud.hideGameOver();
                this.gameState = 'MENU';
                this.hud.updateMapStatus(this.arenaManager);
                this.hud.showMainMenu();
            });
        }

        // Campaign Victory restart
        if (this.hud.btnPlayAgain) {
            this.hud.btnPlayAgain.addEventListener('click', () => {
                this.hud.hideCampaignVictory();
                this.score = 0;
                const nextMap = this.arenaManager.resolveNextMap();
                this.loadArena(nextMap);
                this.gameState = 'PLAYING';
                this.requestPointerLock();
            });
        }

        // Wire player lifecycle callbacks
        this.player.isAnyMenuOpen = () => this.isAnyMenuOpen();

        this.player.onCanvasClick = () => {
            if (this.isAnyMenuOpen()) return;
            if (this.gameState === 'PAUSED') {
                this.resumeGame();
            } else if (this.gameState === 'PLAYING') {
                this.requestPointerLock();
                if (this.sound && this.sound.init) this.sound.init();
            }
        };

        this.player.onPointerLockChange = (isLocked) => {
            if (isLocked) {
                if (this.canvas) this.canvas.style.cursor = 'none';
            } else {
                if (this.canvas) this.canvas.style.cursor = 'crosshair';
                // Do not auto-pause on unlock: allow continuous aiming/shooting & smooth re-locking
            }
        };

        this.player.onPauseToggle = () => {
            if (this.gameState === 'PLAYING') {
                this.pauseGame();
            } else if (this.gameState === 'PAUSED') {
                if (this.hud.storeModal && this.hud.storeModal.style.display !== 'none') {
                    this.hud.hideStore();
                    this.hud.showPauseMenu();
                } else {
                    this.resumeGame();
                }
            }
        };

        // Window-level pause toggle (Escape / P)
        window.addEventListener('keydown', (e) => {
            if (e.code === 'Escape' || e.code === 'KeyP') {
                if (this.gameState === 'PLAYING') {
                    e.preventDefault();
                    this.pauseGame();
                } else if (this.gameState === 'PAUSED') {
                    e.preventDefault();
                    if (this.hud.storeModal && this.hud.storeModal.style.display !== 'none') {
                        this.hud.hideStore();
                        this.hud.showPauseMenu();
                    } else {
                        this.resumeGame();
                    }
                }
            }
        });
    }

    _setupCanvasPointerLock() {
        const canvas = document.querySelector('canvas') || (this.tRenderer ? this.tRenderer.domElement : this.canvas);
        if (!canvas) return;

        canvas.addEventListener('click', () => {
            const isMenuOpen = this.isAnyMenuOpen();
            if (document.pointerLockElement !== canvas && !isMenuOpen) {
                this.requestPointerLock();
                if (this.sound && this.sound.init) {
                    this.sound.init();
                }
            }
        });
    }

    requestPointerLock() {
        const canvas = document.querySelector('canvas') || (this.tRenderer ? this.tRenderer.domElement : this.canvas);
        if (!canvas) return;
        if (this.isAnyMenuOpen()) return;
        if (document.pointerLockElement === canvas) return;

        try {
            const promise = canvas.requestPointerLock();
            if (promise && promise.catch) {
                promise.catch(() => {});
            }
        } catch (e) {}
    }

    exitPointerLock() {
        if (document.pointerLockElement) {
            try {
                document.exitPointerLock();
            } catch (e) {}
        }
    }

    isAnyMenuOpen() {
        if (this.hud && typeof this.hud.isAnyMenuOpen === 'function') {
            return this.hud.isAnyMenuOpen();
        }
        return false;
    }

    pauseGame() {
        if (this.gameState !== 'PLAYING') return;
        this.gameState = 'PAUSED';
        this.setFocusMode(false);
        this.player.resetInput();
        this.exitPointerLock();
        this.hud.showPauseMenu();
    }

    resumeGame() {
        if (this.gameState !== 'PAUSED') return;
        this.hud.hidePauseMenu();
        this.hud.hideStore();
        this.gameState = 'PLAYING';
        this.requestPointerLock();
    }

    startGame() {
        this.hud.hideMainMenu();
        this.gameState = 'PLAYING';
        this.arenaManager.recordGamePlayed();
        this.hud.updateMapStatus(this.arenaManager);
        const nextMap = this.arenaManager.resolveNextMap();
        this.loadArena(nextMap);
        this.requestPointerLock();
        this.sound.init();
    }

    onPlayerDamaged(amount) {
        if (this.gameState !== 'PLAYING') return;

        this.playerHealth = Math.max(0, this.playerHealth - amount);
        this.hud.updateHealth(this.playerHealth, this.maxHealth);
        this.hud.flashDamage();

        // Style penalty on damage
        this.stylePoints = Math.max(0, this.stylePoints - 100);
        this._updateStyleRankFromPoints();
        this.comboMultiplier = STYLE_RANKS[this.currentStyleIndex].multiplier;
        this.hud.updateStyleRank(STYLE_RANKS[this.currentStyleIndex], this.stylePoints, this.styleDecayTimer, this.styleDecayDuration);

        document.body.classList.remove('screen-shake');
        void document.body.offsetWidth;
        document.body.classList.add('screen-shake');
        setTimeout(() => document.body.classList.remove('screen-shake'), 220);

        if (this.playerHealth <= 0) {
            this.gameState = 'GAME_OVER';
            this.setFocusMode(false);
            this.exitPointerLock();
            this.hud.showGameOver(this.score);
        }
    }

    onBankShotKill(bounces, enemy, bullet = null) {
        if (this.gameState !== 'PLAYING') return;

        // Bounce multiplier
        let bounceMultiplier = 1.0;
        if (bounces === 2) bounceMultiplier = 2.5;
        else if (bounces === 3) bounceMultiplier = 4.5;
        else if (bounces >= 4) bounceMultiplier = 6.0 + (bounces - 4) * 2.0;

        // Detect Style Trick Shots
        const tricks = [];
        let trickScore = 0;
        let trickStylePts = 0;

        if (bounces === 1) {
            tricks.push({ label: 'BANK SHOT', bonus: 100 });
            trickStylePts += 100;
        } else if (bounces === 2) {
            tricks.push({ label: 'DOUBLE BANK', bonus: 250 });
            trickStylePts += 260;
        } else {
            tricks.push({ label: `${bounces}x SINGULARITY`, bonus: 450 });
            trickStylePts += 460;
        }

        if (this.player.isSliding) {
            tricks.push({ label: 'SLIDE BANK', bonus: 120 });
            trickScore += 120;
            trickStylePts += 90;
        }

        if (this.isFocusActive) {
            tricks.push({ label: 'REFLEX EXECUTION', bonus: 100 });
            trickScore += 100;
            trickStylePts += 80;
        }

        if (!this.player.isGrounded) {
            tricks.push({ label: 'AERIAL TRICKSHOT', bonus: 80 });
            trickScore += 80;
            trickStylePts += 60;
        }

        if (bullet?.materialsHit?.includes('glass')) {
            tricks.push({ label: 'GLASS BREACH', bonus: 120 });
            trickScore += 120;
            trickStylePts += 100;
        }

        if (bullet?.materialsHit?.includes('grate')) {
            tricks.push({ label: 'GRATE DEFLECTION', bonus: 80 });
            trickScore += 80;
            trickStylePts += 70;
        }

        // Advance Style Chain & Rank
        this.styleChainCount++;
        this.stylePoints += trickStylePts;
        this.styleDecayTimer = this.styleDecayDuration;

        const prevRankIndex = this.currentStyleIndex;
        this._updateStyleRankFromPoints();
        if (this.currentStyleIndex > prevRankIndex) {
            this.sound.playRankUp();
        }

        const currentRank = STYLE_RANKS[this.currentStyleIndex];
        this.comboMultiplier = currentRank.multiplier;

        const baseScore = 100;
        const earnedScore = Math.round((baseScore * bounceMultiplier + trickScore) * this.comboMultiplier);
        this.score += earnedScore;

        // Reward Tokens in Economy
        const tokensAwarded = this.economy.calculateReward(bounces, this.comboMultiplier);
        this.tokensEarnedThisLevel += tokensAwarded;

        this.hud.updateScore(this.score);
        this.hud.updateTokens(this.economy.getTokens());
        this.hud.showStyleEvent({
            bounces,
            score: earnedScore,
            rank: currentRank,
            tricks,
            tokens: tokensAwarded,
            multiplier: this.comboMultiplier
        });
        this.hud.updateStyleRank(currentRank, this.stylePoints, this.styleDecayTimer, this.styleDecayDuration);

        // Update Remaining Targets count
        const remaining = this.enemyManager.enemies.filter(e => e.alive).length;
        this.hud.updateArenaInfo(this.currentMapConfig, remaining);

        // Check Sector Victory
        if (remaining === 0) {
            this.gameState = 'LEVEL_COMPLETE';
            this.setFocusMode(false);
            this.exitPointerLock();
            this.hud.showLevelComplete(this.currentMapConfig, this.tokensEarnedThisLevel, false);
        }
    }

    /**
     * Master animation & render loop.
     * Persistently requests the next animation frame immediately at the start of execution,
     * wrapping update and render cycles in a try/catch block so runtime exceptions never kill the loop.
     */
    animate(currentTime = performance.now()) {
        // Schedule next frame immediately so animation loop never halts
        this.animationFrameId = requestAnimationFrame(this.animate);

        try {
            const delta = Math.min((currentTime - this.lastTime) * 0.001, 0.1);
            this.lastTime = currentTime;

            if (this.gameState === 'PLAYING') {
                this.update(delta);
            } else if (this.gameState === 'MENU') {
                // Ambient idle camera pan in main menu
                if (this.player) {
                    this.player.yaw += delta * 0.12;
                }
                if (this.viewmodel) {
                    this.viewmodel.update(delta, false, false, false);
                }
            }

            this.render();
        } catch (error) {
            console.error("Render Loop Error:", error);
        }
    }

    loop(currentTime) {
        this.animate(currentTime);
    }

    update(delta) {
        if (!this.player) return;

        // 1. Process Focus Mode activation / deactivation request
        const wantsFocus = typeof this.player.isFocusRequested === 'function' && this.player.isFocusRequested() && this.gameState === 'PLAYING';
        if (wantsFocus && !this.isFocusActive && this.focusEnergy >= this.minFocusToActivate) {
            this.setFocusMode(true);
        } else if (!wantsFocus && this.isFocusActive) {
            this.setFocusMode(false);
        }

        // 2. Focus Energy drain & recharge
        if (this.isFocusActive) {
            this.focusEnergy = Math.max(0, this.focusEnergy - this.focusDrainRate * delta);
            if (this.focusEnergy <= 0) {
                this.focusEnergy = 0;
                this.setFocusMode(false);
            }
        } else {
            if (this.focusEnergy < this.maxFocusEnergy) {
                this.focusEnergy = Math.min(this.maxFocusEnergy, this.focusEnergy + this.focusRechargeRate * delta);
            }
        }

        // 3. Smooth time scale interpolation (smooth transition between 1.0 and 0.3)
        const targetTimeScale = this.isFocusActive ? this.SLOW_MO_SCALE : 1.0;
        this.timeScale += (targetTimeScale - this.timeScale) * Math.min(1.0, delta * 12.0);

        // Audio low-pass dilation
        if (this.sound && typeof this.sound.setFocusDilation === 'function') {
            this.sound.setFocusDilation(this.timeScale);
        }

        // Update HUD focus bar & percentage
        if (this.hud && typeof this.hud.updateFocus === 'function') {
            this.hud.updateFocus(this.focusEnergy, this.maxFocusEnergy, this.isFocusActive);
        }

        // Scaled delta for physics, bullets, and enemies
        const worldDelta = delta * this.timeScale;

        // Style rank decay processing
        if (this.styleDecayTimer > 0) {
            this.styleDecayTimer -= worldDelta;
            if (this.styleDecayTimer <= 0) {
                this.stylePoints = Math.max(0, this.stylePoints - delta * 240);
                this._updateStyleRankFromPoints();
                this.comboMultiplier = STYLE_RANKS[this.currentStyleIndex].multiplier;
            }
            if (this.hud && typeof this.hud.updateStyleRank === 'function') {
                this.hud.updateStyleRank(STYLE_RANKS[this.currentStyleIndex], this.stylePoints, this.styleDecayTimer, this.styleDecayDuration);
            }
        }

        this.player.update(delta, this.timeScale);

        if (this.laserPredictor && this.enemyManager) {
            const eyePos = this.player.position.clone();
            const fwd = this.player.getForwardVector();
            const aimStatus = this.laserPredictor.update(eyePos, fwd, this.enemyManager.enemies);
            if (this.hud && typeof this.hud.setAimStatus === 'function') {
                this.hud.setAimStatus(aimStatus);
            }

            const trace = this.laserPredictor.trace;
            if (trace && Array.isArray(this.enemyManager.enemies)) {
                for (const e of this.enemyManager.enemies) {
                    if (e && typeof e.setTargetedByLethal === 'function') {
                        e.setTargetedByLethal(aimStatus === 'LETHAL_LOCKED' && trace.hitEnemyRef === e);
                    }
                }
            }
        }

        if (this.bulletManager && this.enemyManager) {
            this.bulletManager.update(worldDelta, this.enemyManager.enemies, (bounces, enemy, bullet) => {
                this.onBankShotKill(bounces, enemy, bullet);
            });
        }

        if (this.enemyManager) {
            this.enemyManager.update(worldDelta, this.player.position, (damage) => {
                this.onPlayerDamaged(damage);
            });
        }

        if (this.hud && this.player && typeof this.hud.updateAmmo === 'function') {
            this.hud.updateAmmo(this.player.currentAmmo, this.player.maxAmmo, this.player.isReloading, this.player.activeWeaponConfig);
        }
    }

    render() {
        if (this.useThree && this.tRenderer && this.tScene && this.tCamera) {
            this._renderThree();
        } else if (this.renderer) {
            this._renderNative();
        }
    }

    _renderThree() {
        if (!this.tCamera || !this.tScene || !this.tRenderer || !this.player) return;
        const fwd = this.player.getForwardVector();
        const camPos = this.player.position.clone().sub(fwd.clone().multiplyScalar(this.player.recoilOffset));
        this.tCamera.position.set(camPos.x, camPos.y, camPos.z);
        this.tCamera.lookAt(camPos.x + fwd.x, camPos.y + fwd.y, camPos.z + fwd.z);

        // Smooth camera FOV zoom during Focus Mode
        const targetFov = this.isFocusActive ? this.focusFov : this.baseFov;
        if (Math.abs(this.tCamera.fov - targetFov) > 0.05) {
            this.tCamera.fov += (targetFov - this.tCamera.fov) * 0.12;
            this.tCamera.updateProjectionMatrix();
        }

        const trace = this.laserPredictor.trace;
        if (trace && trace.p1 && this.tLaserLine && this.gameState === 'PLAYING') {
            this.tLaserLine.visible = true;
            const posAttr = this.tLaserLine.geometry.attributes.position;
            const colAttr = this.tLaserLine.geometry.attributes.color;

            const isDouble = (this.laserPredictor.status === 'DOUBLE_BANK_LOCKED');
            const isSingle = (this.laserPredictor.status === 'LETHAL_LOCKED');
            const isDud = (this.laserPredictor.status === 'DIRECT_DUD');

            const cCyan = [0.0, 0.94, 1.0];
            const cCrimson = [1.0, 0.05, 0.28];
            const cAmber = [1.0, 0.72, 0.0];
            const cMuted = [0.35, 0.45, 0.55];
            const cGrate = [0.18, 0.62, 1.0];
            const cGlass = [0.65, 0.95, 1.0];

            let c1 = isDud ? cMuted : cCyan;
            let c2 = isDouble ? cAmber : (isSingle ? cCrimson : (trace.surface1 === 'grate' ? cGrate : (trace.surface1 === 'glass' ? cGlass : cCyan)));
            let c3 = isDouble ? cAmber : (trace.surface2 === 'grate' ? cGrate : (trace.surface2 === 'glass' ? cGlass : cCyan));

            posAttr.setXYZ(0, trace.p0.x, trace.p0.y, trace.p0.z);
            posAttr.setXYZ(1, trace.p1.x, trace.p1.y, trace.p1.z);
            colAttr.setXYZ(0, c1[0], c1[1], c1[2]);
            colAttr.setXYZ(1, c1[0], c1[1], c1[2]);

            if (trace.hasBounce && trace.p2) {
                posAttr.setXYZ(2, trace.p1.x, trace.p1.y, trace.p1.z);
                posAttr.setXYZ(3, trace.p2.x, trace.p2.y, trace.p2.z);
                colAttr.setXYZ(2, c2[0], c2[1], c2[2]);
                colAttr.setXYZ(3, c2[0], c2[1], c2[2]);
            } else {
                posAttr.setXYZ(2, trace.p1.x, trace.p1.y, trace.p1.z);
                posAttr.setXYZ(3, trace.p1.x, trace.p1.y, trace.p1.z);
                colAttr.setXYZ(2, cCyan[0], cCyan[1], cCyan[2]);
                colAttr.setXYZ(3, cCyan[0], cCyan[1], cCyan[2]);
            }

            if (trace.p3) {
                posAttr.setXYZ(4, trace.p2.x, trace.p2.y, trace.p2.z);
                posAttr.setXYZ(5, trace.p3.x, trace.p3.y, trace.p3.z);
                colAttr.setXYZ(4, c3[0], c3[1], c3[2]);
                colAttr.setXYZ(5, c3[0], c3[1], c3[2]);
            } else {
                const pt = trace.p2 || trace.p1;
                posAttr.setXYZ(4, pt.x, pt.y, pt.z);
                posAttr.setXYZ(5, pt.x, pt.y, pt.z);
                colAttr.setXYZ(4, cCyan[0], cCyan[1], cCyan[2]);
                colAttr.setXYZ(5, cCyan[0], cCyan[1], cCyan[2]);
            }

            posAttr.needsUpdate = true;
            colAttr.needsUpdate = true;
        } else if (this.tLaserLine) {
            this.tLaserLine.visible = false;
        }

        if (this.composer) {
            try {
                this.composer.render();
            } catch (e) {
                console.warn('EffectComposer render failed, falling back to direct render:', e);
                this.composer = null;
                this.tRenderer.render(this.tScene, this.tCamera);
            }
        } else {
            this.tRenderer.render(this.tScene, this.tCamera);
        }
    }

    _renderNative() {
        if (!this.renderer || typeof this.renderer.beginFrame !== 'function' || !this.player) return;
        const viewMatrix = this.player.getViewMatrix();
        this.renderer.beginFrame(this.player.position, viewMatrix);

        if (this.physics && Array.isArray(this.physics.staticObstacles)) {
            for (const box of this.physics.staticObstacles) {
                const center = box.getCenter();
                const size = box.getSize();
                const col = (box.extra && box.extra.color) || [0.2, 0.25, 0.3];
                this.renderer.drawBox(center, size, col);
            }
        }

        if (this.enemyManager && typeof this.enemyManager.render === 'function') {
            this.enemyManager.render(this.renderer);
        }
        if (this.bulletManager && typeof this.bulletManager.render === 'function') {
            this.bulletManager.render(this.renderer);
        }
        if (this.laserPredictor && typeof this.laserPredictor.render === 'function') {
            this.laserPredictor.render(this.renderer);
        }
    }
}

/**
 * Robust bootloader: checks document.readyState so DOMContentLoaded timing
 * in deferred ES modules does not prevent initialization, and catches any fatal error.
 */
function bootGame() {
    try {
        window.game = new BounceKillGame();
    } catch (error) {
        console.error("Game Init Error:", error);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', bootGame);
} else {
    bootGame();
}



})();
