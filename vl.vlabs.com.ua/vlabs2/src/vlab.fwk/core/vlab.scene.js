import { 
    Scene
 } from 'three';
/**
 * VLab Scene.
 * @class
 * @classdesc VLab Scene class serves VLab Scene and it's auxilaries.
 */
class VLabScene extends Scene {
    /**
     * VLabScene constructor.
     * @constructor
     * @param {VLab} vLabInstance                         - VLab instance
     */
    constructor(vLabInstance) {
        this.vLab = vLabInstance;
    }

}
export default VLabScene;