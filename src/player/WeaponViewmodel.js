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

import { TextureGenerator } from '../core/TextureGenerator.js';

export class WeaponViewmodel {
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
