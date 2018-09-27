import * as THREE from 'three';

/**
 * VLab Orbit Controls.
 * @class
 * @classdesc VLab Orbit Controls class handles VLab camera orbiting, dollying (zooming), and panning.
 * Orbit - left mouse / touch: one finger move
 * Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
 * Pan - right mouse, or arrow keys / touch: three finter swipe
 */
class VLabOrbitControls {
    /**
     * VLabOrbitControls constructor.
     * @constructor
     * @param {VLabScene} vLabScene                         - VLabScene instance
     */
    constructor(vLabScene) {
        this.vLabScene = vLabScene;
    }
    mousedownHandler(event) {
        console.log('VLabOrbitControls', event.type);
    }
    mouseupHandler(event) {
        console.log('VLabOrbitControls', event.type);
    }
}
export default VLabOrbitControls;