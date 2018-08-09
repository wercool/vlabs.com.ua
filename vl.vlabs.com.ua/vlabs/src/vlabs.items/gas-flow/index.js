import * as THREE           from 'three';
import * as TWEEN           from 'tween.js';

export default class GasFlow {
    constructor(initObj) {
        this.initObj = initObj;
        this.context = this.initObj.context;

        this.gasFlowHelperMesh = this.initObj.gasFlowHelperMesh;



        this.initialize();
    }

    initialize() {
        console.log('GasFlow ' + this.initObj.name + ' initialized');

        // console.log(this.gasFlowHelperMesh);
        this.gasFlowHelperMesh.visible = false;
        this.gasFlowHelperMesh.material.side = THREE.BackSide;
        this.gasFlowHelperMesh.material.depthTest = false;
        this.gasFlowHelperMesh.material.depthWrite = false;
        this.gasFlowHelperMesh.material.color = new THREE.Color(2.0, 1.0, 2.0);
        this.gasFlowHelperMesh.material.transparent = true;
        this.gasFlowHelperMesh.material.alphaTest = 0.1;
        this.gasFlowHelperMesh.material.needsUpdate = true;

        if (this.initObj.expansionEffect === true) {
            this.alphaMapCanvas = document.createElement('canvas');
            this.alphaMapCanvas.id = this.initObj.name + 'GasFlowCanvas';
            this.alphaMapCanvas.height = 128;
            this.alphaMapCanvas.width = 128;
            // this.alphaMapCanvas.style.zIndex = 200000000;
            // this.alphaMapCanvas.style.position = 'fixed';
            // this.alphaMapCanvas.style.display = 'block';
            this.alphaMapCanvas.style.display = 'none';
            document.body.appendChild(this.alphaMapCanvas);
            this.alphaMapCanvasContext = this.alphaMapCanvas.getContext('2d');
            this.shift = 0;
        }
    }

    start() {
        if (this.initObj.confrontMaterials) {
            for (var i = 0; i < this.initObj.confrontMaterials.length; i++) {
                this.initObj.confrontMaterials[i].userData['GasFlowConfrontMaterialAlphaTest'] = this.initObj.confrontMaterials[i].alphaTest;
                this.initObj.confrontMaterials[i].alphaTest = 1.0;
                this.initObj.confrontMaterials[i].needsUpdate = true;
            }
        }

        this.gasFlowHelperMesh.renderOrder = 100;
        this.gasFlowHelperMesh.visible = true;

        this.flowAnimation = new TWEEN.Tween(this.gasFlowHelperMesh.material.map)
        .to({ rotation: 0.015 }, 200)
        .repeat(Infinity)
        .yoyo()
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();

        // if (this.initObj.expansionEffect) this.expansionEffectProcessor();
    }

    stop() {
        this.gasFlowHelperMesh.visible = false;
        if (this.flowAnimation) this.flowAnimation.stop();
        if (this.initObj.confrontMaterials) {
            for (var i = 0; i < this.initObj.confrontMaterials.length; i++) {
                this.initObj.confrontMaterials[i].alphaTest = this.initObj.confrontMaterials[i].userData['GasFlowConfrontMaterialAlphaTest'];
                this.initObj.confrontMaterials[i].needsUpdate = true;
                delete this.initObj.confrontMaterials[i].userData['GasFlowConfrontMaterialAlphaTest'];
            }
        }
        this.gasFlowHelperMesh.renderOrder = 0;

        this.stopAnimation();
    }

    startAnimation() {
        this.gasFlowHelperMesh.material.alphaMap = new THREE.CanvasTexture(this.alphaMapCanvas);
        this.gasFlowHelperMesh.material.needsUpdate = true;
        if (this.initObj.expansionEffect) this.expansionEffectProcessor();
    }

    stopAnimation() {
        if (this.expansionEffectProcessorTimeout !== undefined) clearTimeout(this.expansionEffectProcessorTimeout);
        this.gasFlowHelperMesh.material.alphaMap = null;
        this.gasFlowHelperMesh.material.needsUpdate = true;
        this.shift = 0;
    }

    expansionEffectProcessor() {
        if (!this.gasFlowHelperMesh.material.alphaMap) return;
        // this.alphaMapCanvasContext.clearRect(0, 0, 128, 128);
        this.alphaMapCanvasContext.fillStyle = '#ffffff';
        this.alphaMapCanvasContext.fillRect(0, 0, this.shift, 128);
        this.alphaMapCanvasContext.fillStyle = '#000000';
        this.alphaMapCanvasContext.fillRect(this.shift, 0, 128, 128);

        this.gasFlowHelperMesh.material.alphaMap.needsUpdate = true;

        this.shift += 0.2;
        if (this.shift > 128) this.shift = 0;
        this.expansionEffectProcessorTimeout = setTimeout(this.expansionEffectProcessor.bind(this), 50);
    }
}