/**
 * ==============================================================================
 * Bounce Kill - Physics & Raycasting Engine (Physics.js)
 * Implements 3D AABB ray intersections, continuous collision detection,
 * surface normal calculation, and multi-segment ricochet trajectory tracing.
 * ==============================================================================
 */

import { Vector3 } from './Math3D.js';

export class AABB {
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

export class PhysicsWorld {
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

