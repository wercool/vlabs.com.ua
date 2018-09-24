import VLab from './vlab';

/**
 * VLab Event Dispatcher.
 * @class
 * @classdesc VLab Event Dispatcher class serves VLab events and notify event subscribers.
 */
class VLabEventDispatcher {
    /**
     * VLabEventDispatcher constructor.
     * Adds window.onresize event listener
     * Adds window.keydown event listener
     * @constructor
     * @param {VLab} vLab                         - VLab instance
     */
    constructor(vLab) {
        this.vLab = vLab;

        this.eventSubscribers = {
            window: {
                resize:     {},
                keydown:    {}
            },
            WebGLRendererCanvas: {
                mousedown:      {},
                mouseup:        {},
                mousemove:      {},
                wheel:          {},
                touchstart:     {},
                touchend:       {},
                touchmove:      {}
            }
        };

        window.addEventListener('resize',   this.onWindowResize.bind(this),     false);
        window.addEventListener('keydown',  this.onWindowKeyDown.bind(this),    false);
    }
    /**
     * VLabEventDispatcher event subscription.
     * @memberof VLabEventDispatcher
     * @param {Object} subscrObj                      - Subscription object
     */
    subscribe(subscrObj) {
        if (subscrObj['subscriber']) {
            if (subscrObj['events']) {
                for (let eventGroupName in subscrObj['events']) {
                    for (let eventType in subscrObj['events'][eventGroupName]) {
                        let eventCallBack = subscrObj['events'][eventGroupName][eventType];
                        this.eventSubscribers[eventGroupName][eventType] = {
                            callback: eventCallBack,
                            subscriber: subscrObj['subscriber']
                        };
                    }
                }
            }
        }
        console.log(this.eventSubscribers);
    }
    /**
     * VLabEventDispatcher event unsubscription.
     * @memberof VLabEventDispatcher
     * @param {Object} unSubscrObj                      - Unsubscription object of subscriber
     */
    unsubscribe(unSubscrObj) {
        console.log(unSubscrObj);
    }
    /**
     * VLabEventDispatcher constructor.
     * @memberof VLabEventDispatcher
     * * Adds this.vLab.WebGLRendererCanvas event listeners
     * @param {Object} initObj                      - Initialization object <reserved>
     */
    addWebGLRendererCanvasEventListeners(initObj) {
        this.vLab.WebGLRendererCanvas.addEventListener('contextmenu', function(event) {
            event.preventDefault();
            event.stopPropagation();
        });
        /* Mouse events */
        this.vLab.WebGLRendererCanvas.addEventListener('mousedown',     this.onWebGLRendererCanvasMouseDown.bind(this),     false);
        this.vLab.WebGLRendererCanvas.addEventListener('mouseup',       this.onWebGLRendererCanvasMouseUp.bind(this),       false);
        this.vLab.WebGLRendererCanvas.addEventListener('mousemove',     this.onWebGLRendererCanvasMouseMove.bind(this),     false);
        this.vLab.WebGLRendererCanvas.addEventListener('wheel',         this.onWebGLRendererCanvasMouseWheel.bind(this),    false);
        /* Touch events */
        this.vLab.WebGLRendererCanvas.addEventListener('touchstart',    this.onWebGLRendererCanvasTouchStart.bind(this),    false);
        this.vLab.WebGLRendererCanvas.addEventListener('touchend',      this.onWebGLRendererCanvasTouchEnd.bind(this),      false);
        this.vLab.WebGLRendererCanvas.addEventListener('touchmove',     this.onWebGLRendererCanvasTouchMove.bind(this),     false);
    }
    /* Window event handlers */
    onWindowResize(event) {
        this.vLab.resizeWebGLRenderer();
    }
    onWindowKeyDown(event) {
    }
    /* Mouse event handlers */
    onWebGLRendererCanvasMouseDown(event) {
    }
    onWebGLRendererCanvasMouseUp(event) {
    }
    onWebGLRendererCanvasMouseMove(event) {
    }
    onWebGLRendererCanvasMouseWheel(event) {
    }
    /* Touch event handlers */
    onWebGLRendererCanvasTouchStart(event) {
        event.preventDefault();
    }
    onWebGLRendererCanvasTouchEnd(event) {
        event.preventDefault();
    }
    onWebGLRendererCanvasTouchMove(event) {
        event.preventDefault();
    }
}
export default VLabEventDispatcher;