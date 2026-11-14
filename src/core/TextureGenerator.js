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

export class TextureGenerator {
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

