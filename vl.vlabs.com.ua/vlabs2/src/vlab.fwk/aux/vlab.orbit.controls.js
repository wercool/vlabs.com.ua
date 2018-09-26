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
            subscriber: this,
            events: {
                WebGLRendererCanvas: {
                    mousedown:  this.onDefaultEventListener,
                    mouseup:    this.onDefaultEventListener,
                    mousemove:  this.onDefaultEventListener,
                    touchstart: this.onDefaultEventListener,
                    touchend:   this.onDefaultEventListener,
                    touchmove:   this.onDefaultEventListener,
                }
            }
        });
    }
    /**
     * VLabOrbitContols default event listener.
     *
     * @memberof VLabOrbitContols
     * @abstract
     * @todo implement default event router
     */
    onDefaultEventListener(event) {
        console.log('onDefaultEventListener', event);
    }
}
export default VLabOrbitContols;