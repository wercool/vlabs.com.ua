import * as THREE from 'three';

/**
 * VLab Orbit Controls.
 * @class
 * @classdesc VLab Orbit Controls class handles VLab camera orbiting, dollying (zooming), and panning.
 * Orbit - left mouse / touch: one finger move
 * Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
 * Pan - right mouse, or arrow keys / touch: three finteg swipe
 */
class VLabOrbitContols {
    /**
     * VLabOrbitContols constructor.
     * @constructor
     * @param {VLab} vLab                         - VLab instance
     */
    constructor(vLab) {
        this.vLab = vLab;

        this.vLab.EventDispatcher.subscribe({
            event: 'press'
        });
    }
}
export default VLabOrbitContols;