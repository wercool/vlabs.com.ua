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
        this.active = false;
    }
    /**
     * VLabControls update abstract function.
     *
     * @memberof VLabControls
     * @abstract
     */
    update() { console.log('update() abstract method not implemented in ' + this.constructor.name); }
    /**
     * VLabControls depress abstract function. Usually this method is called when other elements overlay and suppress MouseEvents on VLabScene
     *
     * @memberof VLabControls
     * @abstract
     */
    depress() { console.log('depress() abstract method not implemented in ' + this.constructor.name); }
    /**
     * VLabControls reset abstract function.
     *
     * @memberof VLabControls
     * @abstract
     */
    reset() { console.log('reset() abstract method not implemented in ' + this.constructor.name); }
    /**
     * VLabControls default event handler / router; could be overridden in inheritor.
     *
     * @memberof VLabControls
     * @abstract
     */
    onDefaultEventHandler(event) {
        if (this.vLabScene !== undefined) {
            if (event.target == this.vLabScene.vLab.WebGLRendererCanvas) {
                if (this[event.type + 'Handler']) {
                    this[event.type + 'Handler'].call(this, event);
                }
            }
        }
    }
}
export default VLabControls;