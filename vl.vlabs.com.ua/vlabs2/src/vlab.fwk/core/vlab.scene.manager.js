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
         * VLabScene initially configured from VLab Scene nature
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
     * VLab Scene configurator with VLabScene nature.
     * @async
     * @memberof VLabSceneManager
     */
    configure() {
        return new Promise((resolve, reject) => {
            if (this.configured) resolve();

            if (this.vLabScene.nature.cameras) {
                if (this.vLabScene.nature.cameras.default) {
                    this.vLabScene.currentCamera.name = this.vLabScene.nature.cameras.default.name;
                    switch (this.vLabScene.nature.cameras.default.type) {
                        case 'PerspectiveCamera':
                            if (this.vLabScene.nature.cameras.default.fov)
                                this.vLabScene.currentCamera.fov = this.vLabScene.nature.cameras.default.fov;
                            if (this.vLabScene.nature.cameras.default.position)
                                this.vLabScene.currentCamera.position.copy(eval(this.vLabScene.nature.cameras.default.position));
                        break;
                    }
                    this.vLabScene.currentCamera.lookAt(new THREE.Vector3(0.0, this.vLabScene.currentCamera.position.y, 0.0));
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
     * @todo implement default event router
     */
    onDefaultEventListener(event) {
        // console.log('onDefaultEventListener', event);
    }
}
export default VLabSceneManager;