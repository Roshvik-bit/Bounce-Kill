# BOUNCE KILL

[![WebGL](https://img.shields.io/badge/WebGL-Three.js-00f0ff.svg?style=for-the-badge&logo=three.js&logoColor=white)](https://threejs.org/)
[![License: ISC](https://img.shields.io/badge/License-ISC-ff00aa.svg?style=for-the-badge)](LICENSE)
[![Platform](https://img.shields.io/badge/Platform-Web%20Browser-00ff66.svg?style=for-the-badge)](https://github.com/Roshvik-bit/Bounce-Kill)

> **Master Geometry. Bank Every Shot. Eliminate the Threat.**

**Bounce Kill** is a fast-paced 3D first-person tactical ricochet shooter engineered with **Three.js** and **WebGL**. Direct hits deal zero damage—bullets must be banked off concrete walls, industrial gratings, and shatterable glass to charge into lethal, high-damage rounds.

---

## Core Gameplay Mechanics

### The Ricochet Rule ("Crimson-Hot" Rounds)
- **Zero Damage on Direct Hits**: Direct shots fired straight at enemies fizzle out and deal zero damage against frontal deflector shields.
- **Surface Energization**: Bullets must bounce off at least one wall or obstacle to energize into lethal, glowing **"Crimson-Hot"** rounds.
- **Multi-Bounce Damage Scaling**:
  - **1 Bounce — Charged Lethal (Crimson #FF0D47)**: `1.0x Base Damage` — Pierces standard enemy armor.
  - **2 Bounces — Supercharged Amber (Amber #FFAA00)**: `2.5x Damage` — Heavy impact with expanded spark spread.
  - **3+ Bounces — Hypercharged Violet (Violet #D000FF)**: `4.5x+ Damage` — High-tier multiplier that instantly annihilates targets.

### Mobility & Gunplay
- **Tactical Slide (`Shift` / `C`)**: Execute a momentum-preserving slide to duck beneath enemy lines of sight and reposition dynamically under fire.
- **Slow-Motion Focus / Bullet-Time (`Right Mouse Button`)**: Dilate time on demand to calculate complex multi-wall bank shots and navigate high-pressure firefights with surgical precision.
- **Real-Time Trajectory Predictor**: Multi-segment laser raycaster that visualizes incoming reflection angles and surface hit normals before you pull the trigger.

### Aggressive Enemy AI
- **Active Pursuit State Machine**: Enemies actively hunt and pressure you across dark cyberpunk arenas—standing still or camping in one location is a death sentence.
- **Hyper-Visible Neon Materials**: Built with high-intensity **Neon Hot Pink / Magenta (`#FF00AA`)** hull plating and luminous emissive shaders (`emissiveIntensity: 1.85+`) so targets remain recognizable even in pitch-black corridors.
- **Dynamic Reactor Point Lights**: Pulsating reactor cores that actively cast dynamic neon lighting onto surrounding walls and floors.
- **Overhead Holographic Halos & Wireframe Cages**: Rotating overhead crown rings and glowing outer cages ensure instant silhouette recognition across the entire arena.
- **Dynamic Obstacle Navigation**: Smart pathfinding that routes around pillars, avoids clumping through repulsion physics, and coordinates aggressive flanking maneuvers.
- **Combat Feedback**: Enemies flash bright white (`0xFFFFFF`, intensity `4.5`) upon valid ricochet hits, emit neon spark bursts, and explode into radial particle shockwaves on defeat.

### Style Chains & Multipliers
- **Trick-Shot Multipliers**: Multi-wall bank shots, mid-slide eliminations, and aerial hits reward you with bonus style multipliers (`D → C → B → A → S → SSS`).
- **Bounty Token Economy**: Earn tokens for every stylish ricochet kill to fund upgrades and equipment.

---

## Economy & Weapon Store

- **Bounty Tokens**: Earned through high-multiplier bank shots and wave clears.
- **Weapon Progression**: Spend earned tokens in the in-game store to unlock advanced weapons with custom stats, projectile velocity, and neon optics:
  - **Spectre-9 Ricochet Pistol**: High-accuracy sidearm with predictable single-surface reflection.
  - **Scatter-8 Ricochet Shotgun**: Wide-spread multi-pellet bank shotgun for close-quarters ricochet traps.
  - **Viper Precision Rail**: High-velocity energy beam with instant penetration and maximum ricochet multiplier potential.
- **Instant Map Selection**: Choose any dark cyberpunk arena directly from the main menu before jumping into combat—all maps are unlocked from the start.

---

## Arenas & Maps

| Map | Environment Theme | Tactical Profile |
| :--- | :--- | :--- |
| **01. The Brutalist Grid** | Heavy dark concrete, cyan neon accents | Sharp $90^\circ$ angles, dense pillar layouts, high-traffic corridors |
| **02. Neon Core** | Industrial grating, pulsing light strips | Long sightlines, narrow flanking alleys, vertical obstacle cover |
| **03. Glass Vault** | Shatterable glass chambers, multi-tier cover | Dynamic sightlines, destructible cover, high trick-shot potential |

---

## Controls

| Key / Input | Action |
| :--- | :--- |
| **W, A, S, D** | Movement (Sprint / Strafe) |
| **Mouse Look** | Aim (Clamped pitch $-89^\circ$ to $+89^\circ$) |
| **Left Click (LMB)** | Fire Ricochet Round / Lock Pointer |
| **Right Click (RMB)** | Slow-Motion Focus (Bullet Time) |
| **Shift / C** | Tactical Slide (Hold while moving forward) |
| **Space** | Jump |
| **R** | Reload |
| **1, 2, 3** | Weapon Select |
| **Escape / Tab** | Menu / Pause / Unlock Cursor |

---

## Technical Architecture

- **Engine & Renderer**: Three.js / WebGL for high-performance browser-based 3D graphics, post-processing bloom (`UnrealBloomPass`), and dynamic point lighting.
- **Physics & Collision**: Custom vector reflection math using surface normals ($r = d - 2(d \cdot n)n$) for real-time bullet bouncing, swept-sphere player collision, and spark particle emissions.
- **Input Management**: Robust Pointer Lock API implementation for seamless first-person mouse look, smooth pitch clamping, and responsive WASD bindings.
- **Procedural Audio**: Web Audio API procedural sound synthesizer for gunshots, glass shattering, metallic ricochet chimes, and bullet-time frequency shifts without external asset dependencies.
- **Zero-Dependency Architecture**: Runs directly in any modern browser with an automated single-file production bundler for offline and server-independent play.

---

## Project Structure

```
Bounce-Kill/
├── index.html              # HTML5 container & post-processing pipeline
├── bundle.js               # Standalone production bundle
├── package.json            # Project manifest & dev scripts
├── server.js               # Zero-dependency Node.js HTTP server
├── serve.py                # Python development server with auto-port discovery
├── run.sh                  # Startup shell script
├── .gitignore              # Environment & security exclusions
├── assets/                 # Game assets
└── src/
    ├── audio/              # SoundManager.js (Web Audio API procedural sound)
    ├── core/               # Math3D.js, Physics.js, WebGLRenderer.js, TextureGenerator.js
    ├── entities/           # BulletManager.js, EnemyManager.js
    ├── levels/             # ArenaManager.js, LevelManager.js (Map geometry & layouts)
    ├── player/             # FPSController.js, LaserPredictor.js, WeaponViewmodel.js
    ├── ui/                 # HUD.js (Style rank, combo counter, health, ammo)
    ├── weapons/            # WeaponConfig.js (Pistol, Shotgun, Railgun specs)
    └── game.js             # Main game orchestrator & lifecycle loop
```

---

## Getting Started

### Prerequisites
- Modern web browser with WebGL support (Chrome, Firefox, Edge, Safari, Brave).
- **Node.js** (v16+) *or* **Python** (3.8+) for running the local server.

### Quick Start

1. **Clone the repository:**
   ```bash
   git clone https://github.com/Roshvik-bit/Bounce-Kill.git
   cd Bounce-Kill
   ```

2. **Start the local server:**

   **Using Node.js:**
   ```bash
   npm start
   # or: node server.js
   ```

   **Using Python:**
   ```bash
   python3 serve.py
   ```

   **Using Shell Script (macOS / Linux):**
   ```bash
   chmod +x run.sh
   ./run.sh
   ```

3. **Play:**
   Open your browser and navigate to:
   ```
   http://localhost:8000
   ```
   Click anywhere on the screen to capture the mouse and enter the arena.

---

## Security & Privacy

This repository contains no hardcoded credentials, secret keys, personal identifiers, or private tokens. All environment-specific and sensitive file extensions (`.env*`, `*.key`, `*.pem`, `*.cert`, `credentials*`) are permanently excluded via `.gitignore`.

---

## License

This project is licensed under the [ISC License](LICENSE).
