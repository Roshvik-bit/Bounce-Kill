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

import { Vector3 } from './core/Math3D.js';
import { PhysicsWorld } from './core/Physics.js';
import { WebGLRenderer } from './core/WebGLRenderer.js';
import { TextureGenerator } from './core/TextureGenerator.js';
import { SoundManager } from './audio/SoundManager.js';
import { EconomyManager } from './core/EconomyManager.js';
import { LevelManager } from './levels/LevelManager.js';
import { ArenaManager } from './levels/ArenaManager.js';
import { BulletManager } from './entities/BulletManager.js';
import { EnemyManager } from './entities/EnemyManager.js';
import { FPSController } from './player/FPSController.js';
import { WeaponViewmodel } from './player/WeaponViewmodel.js';
import { LaserPredictor } from './player/LaserPredictor.js';
import { HUD } from './ui/HUD.js';

export const STYLE_RANKS = [
    { grade: 'D', title: 'DEFLECTOR', minPoints: 0, multiplier: 1.0, color: '#8899aa' },
    { grade: 'C', title: 'CALCULATED', minPoints: 100, multiplier: 1.5, color: '#00F0FF' },
    { grade: 'B', title: 'BANK SHOT', minPoints: 260, multiplier: 2.2, color: '#00FF88' },
    { grade: 'A', title: 'APEX RICOCHET', minPoints: 500, multiplier: 3.2, color: '#FFAA00' },
    { grade: 'S', title: 'SUPREME ANGLE', minPoints: 900, multiplier: 4.5, color: '#FF0D47' },
    { grade: 'SS', title: 'SINGULARITY', minPoints: 1400, multiplier: 6.0, color: '#FFD700' }
];

export class BounceKillGame {
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
