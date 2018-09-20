import * as THREE from 'three';
import VLabScene from "./vlab.scene";

/**
 * VLab Scene Dispatcher.
 * @class
 * @classdesc VLab Scene Dispatcher class serves VLab Scene routing and state control.
 */
class VLabSceneDispatcher {
    /**
     * VLabSceneDispatcher constructor.
     * @constructor
     * @param {VLab} vLabInstance                         - VLab instance
     */
    constructor(vLabInstance) {
        this.vLab = vLabInstance;

        this.scenes = [];
        /**
         * This current VLabScene
         * @inner
         */
        this.currentVLabScene = new THREE.Scene();
    }
    /**
     * Add VLabScene to VLabSceneDispatcher stack.
     * @memberof VLabSceneDispatcher
     * @param {Object}    initObj                           - VLabScene initialization object
     * @param {VLab}      initObj.vLab                      - VLab instance
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * @param {string}    initObj.natureURL                 - VLab Scene nature JSON URL (encoded)
     * @param {boolean}   initObj.initial                   - Initial VLabScene, will be auto activated
     * @param {boolean}   initObj.autoload                  - Load VLabScene assets immediately after instantiation if no active loading happens
     */
    addScene(initObj) {
        initObj.vLab = this.vLab;
        let vLabScene = new initObj.class(initObj);
        this.scenes.push(vLabScene);
        if (initObj.initial) {
            this.activateScene(initObj).then(this.autoloadScenes.bind(this));
        } else {
            this.autoloadScenes();
        }
    }
    /**
     * Activates VLabScene.
     * * Sets this.vLab.WebGLRenderer.domElement to activated VLabScene canvas
     * * Sets this.vLab.WebGLRenderer.context to activated VLabScene canvas context
     * @async
     * @memberof VLabSceneDispatcher
     * @param {Object}    initObj                           - Scene activation object
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    activateScene(initObj) {
        this.vLab.renderPause = true;
        this.vLab.DOM.webGLContainer.style.visibility = 'hidden';
        return new Promise((resolve, reject) => {
            this.scenes.forEach((vLabScene) => {
                vLabScene.deactivate();
            });
            this.scenes.forEach((vLabScene) => {
                if (vLabScene.constructor == initObj.class) {
                    vLabScene.activate().then(() => {
                        this.currentVLabScene = vLabScene;
                        this.vLab.renderPause = false;
                        this.vLab.DOM.webGLContainer.style.visibility = 'visible';
                        this.vLab.resizeWebGLRenderer();
                        vLabScene.onActivated();
                        resolve(vLabScene);
                    });
                }
            });
        });
    }
    /**
     * Process VLabScene autoload queue.
     * @memberof VLabSceneDispatcher
     */
    autoloadScenes() {
        if (this.autoloadScenesTimeout) clearTimeout(this.autoloadScenesTimeout);
        for (let vLabScene of this.scenes) {
            if (vLabScene.loading) {
                this.autoloadScenesTimeout = setTimeout(this.autoloadScenes.bind(this), 250);
                return;
            }
        }
        for (let vLabScene of this.scenes) {
            if (vLabScene.initObj.autoload && !vLabScene.loaded && !vLabScene.loading) {
                vLabScene.load().then(this.autoloadScenes.bind(this));
                return;
            }
        }
    }
}
export default VLabSceneDispatcher;