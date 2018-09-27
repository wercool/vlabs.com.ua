import * as THREE from 'three';
/**
 * VLab Controls base class.
 * @class
 * @classdesc VLab Controls base class.
 */
class VLabControls {
    constructor(vLabScene) {
        this.vLabScene = vLabScene;

        this.MOUSEBUTTONS = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

        this.enabled = false;
    }
    /**
     * VLabControls update abstract function.
     *
     * @memberof VLabControls
     * @abstract
     */
    update() { console.warn('update abstract method not implemented in ' + this.contructor.name); }
}
export default VLabControls;