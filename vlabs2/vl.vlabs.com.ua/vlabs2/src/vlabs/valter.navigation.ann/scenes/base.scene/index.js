import * as THREE from 'three';
import VLabScene from '../../../../vlab.fwk/core/vlab.scene';

/**
 * VLab Items
 */
import Valter from '../../../../vlab.items/valter/index';

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

        var ambientLight = new THREE.AmbientLight(0x404040, 0.2); // soft white light
        this.add(ambientLight);

        // this.pointLight = new THREE.PointLight(0xffffff, 2.0);
        // this.pointLight.position.copy(new THREE.Vector3(0.0, 2.0, 0.0));
        // this.pointLight.castShadow = false;
        // this.pointLight.shadow.camera.near = 0.1;
        // this.pointLight.shadow.camera.far = 3.0;
        // this.pointLight.shadow.bias = - 0.005; // reduces self-shadowing on double-sided objects
        // this.pointLight.shadow.mapSize.width = 1204;  // default 512
        // this.pointLight.shadow.mapSize.height = 1024; // default 512
        // this.add(this.pointLight);

        /**
         * Valter VLabItem
         */
        this.vLab['Valter'] = new Valter({
            vLab: this.vLab,
            natureURL: '/vlab.items/valter/resources/valter.nature.json',
            name: 'ValterVLabItem'
        });
        this.vLab.EventDispatcher.subscribe({
            subscriber: this,
            events: {
                VLabItem: {
                    initialized: this.onVLabItemInitialized
                }
            }
        });
    }

    onVLabItemInitialized(event) {
        if (event.vLabItem == this.vLab['Valter']) {
            this.vLab['Valter'].setBaseFramePosition(new THREE.Vector3(0.0, 0.0, 0.0));
        }
    }
}

export default BaseScene;