/**
 * ==============================================================================
 * Bounce Kill - WebGL 3D Renderer (WebGLRenderer.js)
 * Implements cyberpunk lighting, brutalist concrete shading, laser sight beams,
 * and high-contrast glowing neon accents.
 * ==============================================================================
 */

import { Matrix4, Vector3 } from './Math3D.js';

export class WebGLRenderer {
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
