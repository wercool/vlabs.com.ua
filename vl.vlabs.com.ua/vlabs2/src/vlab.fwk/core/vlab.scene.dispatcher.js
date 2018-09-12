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
     * @param {Object} sceneInitObj                         - Scene initialization Object
     * @param {VLabScene} sceneInitObj.class                - Scene Class
     * @param {boolean}   sceneInitObj.default              - if defined (=== true) forcedly instantiate VLab Scene / activate forcedly Scene, make it active
     */
    addScene(sceneInitObj) {
        if (sceneInitObj.default) {

        }
        console.log(sceneInitObj);
    }
}
export default VLabSceneDispatcher;