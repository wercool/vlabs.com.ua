/**
 * VLab Event Dispatcher.
 * @class
 * @classdesc VLab Event Dispatcher class serves VLab events and notify event subscribers.
 */
class VLabEventDispatcher {
    /**
     * VLabEventDispatcher constructor.
     * @constructor
     * @param {VLab} vLab                         - VLab instance
     */
    constructor(vLab) {
        this.vLab = vLab;

        window.onresize = this.onWindowResize.bind(this);
    }

    onWindowResize(event) {
        this.vLab.resizeWebGLRenderer();
    }
}
export default VLabEventDispatcher;