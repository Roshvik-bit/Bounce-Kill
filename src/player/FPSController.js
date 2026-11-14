/**
 * ==============================================================================
 * Bounce Kill - First-Person Controller (FPSController.js)
 * Full WASD locomotion, Pointer Lock mouse look, jumping, gravity,
 * weapon viewmodel integration, and weapon arsenal equipping.
 * ==============================================================================
 */

import { Vector3, Matrix4 } from '../core/Math3D.js';

export class FPSController {
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
