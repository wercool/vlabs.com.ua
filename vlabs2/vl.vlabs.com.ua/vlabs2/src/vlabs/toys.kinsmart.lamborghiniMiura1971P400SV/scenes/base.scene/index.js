import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

class BaseScene extends VLabScene {
    constructor(iniObj) {
        super(iniObj);
    }
    /**
     * Override VLabScene.onLoaded and called when VLabScene nature JSON is loaded as minimum
     */
    onLoaded() {
        console.log('BaseScene onLoaded()');
        /**
         * Trace VLabScene object (this)
         */
        console.log(this);

        /*<dev>*/
        /**
         * dummyObject
         */
        this.dummyObject.position.copy(new THREE.Vector3(0.1, 0.1, 0.1));
        /*</dev>*/

        this.vLab.WebGLRenderer.gammaFactor = 1.5;

        this.ambientLight = new THREE.AmbientLight(0x404040, 0.5);
        this.add(this.ambientLight);

        this.pointLight = new THREE.PointLight(0xffffff, 2.0);
        this.pointLight.position.copy(new THREE.Vector3(0.0, 1.0, 0.1));
        this.add(this.pointLight);
    }
}

export default BaseScene;