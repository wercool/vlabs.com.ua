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
    }
    /**
     * Add VLabScene to VLabSceneDispatcher stack.
     * @memberof VLabSceneDispatcher
     * @param {Object}    initObj                           - VLabScene initialization object
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * @param {string}    initObj.natureURL                 - VLab Scene nature JSON URL (encoded)
     * @param {boolean}   initObj.default                   - Default VLabScene, will be auto activated
     * @param {boolean}   initObj.autoload                  - Load VLabScene assets immediately after instantiation if no active loading happens
     */
    addScene(initObj) {
        initObj.vLab = this.vLab;
        let vLabScene = new initObj.class(initObj);
        this.scenes.push(vLabScene);
        if (initObj.default) {
            this.activateScene(initObj).then(this.processAutoload.bind(this));
        } else {
            this.processAutoload();
        }
    }
    /**
     * Process VLabScene stack autoload.
     * @memberof VLabSceneDispatcher
     */
    processAutoload() {
        if (this.processAutoloadTimeout) clearTimeout(this.processAutoloadTimeout);
        for (let vLabScene of this.scenes) {
            if (vLabScene.loading) {
                this.processAutoloadTimeout = setTimeout(this.processAutoload.bind(this), 250);
                return;
            }
        }
        for (let vLabScene of this.scenes) {
            if (vLabScene.initObj.autoload && !vLabScene.loaded && !vLabScene.loading) {
                vLabScene.load().then(this.processAutoload.bind(this));
                return;
            }
        }
    }
    /**
     * Activates VLabScene.
     * @async
     * @memberof VLabSceneDispatcher
     * @param {Object}    initObj                           - Scene activation object
     * @param {VLabScene} initObj.class                     - VLabScene Class
     * @returns {Promise | VLabScene}                       - VLabScene instance in Promise resolver
     */
    activateScene(initObj) {
        return new Promise((resolve, reject) => {
            this.scenes.forEach((vLabScene) => {
                vLabScene.deactivate();
            });
            this.scenes.forEach((vLabScene) => {
                if (vLabScene.constructor == initObj.class) {
                    vLabScene.activate().then(() => { 
                        resolve(vLabScene);
                    });
                }
            });
        });
    }
}
export default VLabSceneDispatcher;