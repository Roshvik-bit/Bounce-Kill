/**
 * ==============================================================================
 * Bounce Kill - Laser Trajectory Predictor (LaserPredictor.js)
 * Real-time 2-segment laser beam showing wall bounce angles & target alignment.
 * ==============================================================================
 */

export class LaserPredictor {
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

