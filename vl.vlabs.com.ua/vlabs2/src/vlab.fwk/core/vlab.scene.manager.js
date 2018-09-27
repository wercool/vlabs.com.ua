import * as THREE from 'three';
import VLab from './vlab';

/**
 * VLab Scene Manager.
 * 
 * @class
 * @classdesc VLabSceneManager serves VLab Scene auxilaries, configures VLab Scene accodring to VLab Scene nature.
 */
class VLabSceneManager {
    /**
     * VLabScene constructor.
     * 
     * @constructor
     * @param {VLabScene} vLabScene                           - VLabScene instance
     */
    constructor(vLabScene) {
        /**
         * VLabScene instance
         * @inner
         */
        this.vLabScene = vLabScene;
        /**
         * VLabSceneManager instance name
         * @inner
         */
        this.name = this.vLabScene.name + 'Manager';
        /**
         * VLabScene initially configured from {@link VLabScene#nature}
         * @inner
         */
        this.configured = false;
    }
    /**
     * VLab Scene Manager activator.
     * @async
     * @memberof VLabSceneManager
     * @returns {Promise}                       - Promise resolver
     */
    activate() {
        return new Promise((resolve, reject) => {
            this.configure().then(() => {
                resolve();
            });
        });
    }
    /**
     * Configures VLab Scene with {@link VLabScene#nature}.
     * @async
     * @memberof VLabSceneManager
     */
    configure() {
        return new Promise((resolve, reject) => {
            if (this.configured) resolve();
            /* Configure VLabScene currentCamera from VLabScene nature */
            if (this.vLabScene.nature.cameras) {
                if (this.vLabScene.nature.cameras.default) {
                    this.vLabScene.currentCamera.name = this.vLabScene.nature.cameras.default.name;
                    switch (this.vLabScene.nature.cameras.default.type) {
                        case 'PerspectiveCamera':
                            if (this.vLabScene.nature.cameras.default.fov)
                                this.vLabScene.currentCamera.fov = this.vLabScene.nature.cameras.default.fov;
                            if (this.vLabScene.nature.cameras.default.position)
                                this.vLabScene.currentCamera.position.copy(eval(this.vLabScene.nature.cameras.default.position));
                            if (this.vLabScene.nature.cameras.default.target)
                                this.vLabScene.currentCamera.lookAt(eval(this.vLabScene.nature.cameras.default.target));
                            else
                                this.currentCamera.lookAt(new THREE.Vector3(0.0, this.vLabScene.currentCamera.position.y, 0.0));
                        break;
                    }
                }
            }
            /* Configure VLabScene currentControls from VLabScene nature */
            if (this.vLabScene.nature.controls) {
                if (this.vLabScene.nature.controls.default) {
                    switch (this.vLabScene.nature.controls.default.type) {
                        case 'orbit':

                        break;
                    }
                }
            }

            this.configured = true;
            resolve();
        });
    }
    /**
     * VLab Scene default event listener.
     *
     * @memberof VLabSceneManager
     * @abstract
     */
    onDefaultEventListener(event) {
        // console.log('onDefaultEventListener', event);
        if (this.vLabScene.currentControls[event.type + 'Handler']) {
            this.vLabScene.currentControls[event.type + 'Handler'].call(this.vLabScene.currentControls, event);
        }
    }
}
export default VLabSceneManager;