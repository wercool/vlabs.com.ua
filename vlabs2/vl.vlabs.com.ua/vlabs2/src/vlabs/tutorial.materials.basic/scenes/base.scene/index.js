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
        // this.dummyObject.position.copy(new THREE.Vector3(0.1, 0.1, 0.1));
        /*</dev>*/
    }
}

export default BaseScene;