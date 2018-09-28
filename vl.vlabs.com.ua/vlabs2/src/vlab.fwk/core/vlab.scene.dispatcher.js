import * as THREE from 'three';
import VLab from './vlab';
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
     * @param {boolean}   initObj.active                    - If set to true VLabsScene will be activated
     * @param {boolean}   initObj.autoload                  - Load VLabScene assets immediately after instantiation if no active loading happens
     */
    addScene(initObj) {
        initObj.vLab = this.vLab;
        let vLabScene = new initObj.class(initObj);
        this.scenes.push(vLabScene);
        if (initObj.active) {
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
        let self = this;
        this.vLab.renderPaused = true;
        return new Promise((resolve, reject) => {
            this.scenes.forEach((vLabScene) => {
                vLabScene.deactivate().then((vLabScene) => {
                    vLabScene.onDeactivated();
                });
            });
            for (let vLabScene of this.scenes) {
                if (vLabScene.constructor == initObj.class) {
                    self.vLab.WebGLRendererCanvas.classList.remove('visible');
                    self.vLab.WebGLRendererCanvas.classList.add('hidden');
                    vLabScene.activate().then((vLabScene) => {
                        self.currentVLabScene = vLabScene;
                        self.vLab.setupWebGLRenderer();
                        self.vLab.resizeWebGLRenderer();
                        vLabScene.onActivated();
                        self.vLab.renderPaused = false;
                        setTimeout(() => {
                            self.vLab.WebGLRendererCanvas.classList.remove('hidden');
                            self.vLab.WebGLRendererCanvas.classList.add('visible');
                            resolve(vLabScene);
                        }, 250);
                    });
                    break;
                }
            }
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
                vLabScene.manager.load().then(this.autoloadScenes.bind(this));
                return;
            }
        }
    }
    /**
     * Get number of not yet loaded autoload VLabScene.
     * @memberof VLabSceneDispatcher
     */
    getNotYetLoadedAutoloads() {
        let notYetAutloaded = 0;
        this.scenes.forEach((vLabScene) => {
            notYetAutloaded += (vLabScene.initObj.autoload && !vLabScene.loaded) ? 1 : 0;
        });
        return notYetAutloaded;
    }
}
export default VLabSceneDispatcher;