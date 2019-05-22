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

        var ambientLight = new THREE.AmbientLight(0x404040, 1.25); // soft white light
        this.add(ambientLight);

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
            this.vLab['Valter'].rotateBaseFrame(THREE.Math.degToRad(-180.0));
        }
    }
}

export default BaseScene;