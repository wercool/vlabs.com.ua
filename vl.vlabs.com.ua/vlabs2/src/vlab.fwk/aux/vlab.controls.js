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