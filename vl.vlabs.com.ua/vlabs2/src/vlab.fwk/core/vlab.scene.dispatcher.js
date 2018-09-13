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
     * @async
     * @memberof VLabSceneDispatcher
     * @param {Object} initObj                              - Add scene initialization object
     * @param {VLabScene} initObj.class                     - Scene Class
     */
    addScene(initObj) {
        let vLabScene = new initObj.class({
            vLab: this.vLab
        });
        this.scenes.push(vLabScene);
        return vLabScene;
    }
}
export default VLabSceneDispatcher;