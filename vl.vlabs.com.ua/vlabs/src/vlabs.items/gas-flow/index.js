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
    }

    start() {

        if (this.initObj.confrontMaterials) {
            for (var i = 0; i < this.initObj.confrontMaterials.length; i++) {
                this.initObj.confrontMaterials[i].userData['GasFlowConfrontMaterialAlphaTest'] = this.initObj.confrontMaterials[i].alphaTest;
                this.initObj.confrontMaterials[i].alphaTest = 1.0;
                this.initObj.confrontMaterials[i].needsUpdate = true;
            }
        }

        this.gasFlowHelperMesh.visible = true;
        this.gasFlowHelperMesh.renderOrder = 100;

        this.flowAnimation = new TWEEN.Tween(this.gasFlowHelperMesh.material.map)
        .to({ rotation: 0.015 }, 200)
        .repeat(Infinity)
        .yoyo()
        .easing(TWEEN.Easing.Cubic.InOut)
        .start();
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
    }
}