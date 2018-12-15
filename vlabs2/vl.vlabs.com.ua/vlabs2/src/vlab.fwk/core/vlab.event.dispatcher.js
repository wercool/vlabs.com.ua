import VLab from './vlab';
import VLabScene from './vlab.scene';

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
        /**
         * Event subscribers stack object
         * @public
         */
        this.eventSubscribers = {
            window: {
                resize:     {},
                keydown:    {},
                message:    {}
            },
            document: {
                onfullscreenchange:     {},
                onfullscreenerror:      {}
            },
            WebGLRendererCanvas: {
                mousedown:          {},
                mouseup:            {},
                mousemove:          {},
                wheel:              {},
                mouseout:           {},
                touchstart:         {},
                touchend:           {},
                touchmove:          {},
                framerequest:       {}
            },
            VLabScene: {
                /**
                 *  {
                 *      target: 'VLabScene',
                 *      type: 'loaded',
                 *      vLabScene: loaded vLabScene instance
                 *  }
                 */
                loaded:          {},
                /**
                 *  {
                 *      target: 'VLabScene',
                 *      type: 'activated | deActivated',
                 *      vLabSceneClass: vLabScene.constructor.name
                 *  }
                 */
                activated:          {},
                deActivated:        {},
                /**
                 *  {
                 *      target: 'VLabScene',
                 *      type: 'interactableTaken'
                 *  }
                 */
                interactableTaken:  {},
                /**
                 *  {
                 *      target: 'VLabScene',
                 *      type: 'interactablePut'
                 *  }
                 */
                interactablePut:    {}
            },
            VLabInventory: {
                ready:          {},
                putToInventory: {}
            },
            VLabItem: {
                initialized:                 {},
                interactablesInitialized:    {},
            }
        };
        /**
         * Misc event meta info
         */
        this.eventHelpers = {
            touchmovePrevEvent: undefined,
            touchmoveDelta: 0
        };

        window.addEventListener('resize',   this.onWindowResize.bind(this),     false);
        window.addEventListener('keydown',  this.onWindowKeyDown.bind(this),    false);
        window.addEventListener('message',  this.onWindowMessage.bind(this),    false);

        /**
         * Fullscreen change listeners
         */
        document.addEventListener('webkitfullscreenchange', this.onFullscreenchange.bind(this), false);
        document.addEventListener('mozfullscreenchange', this.onFullscreenchange.bind(this), false);
        document.addEventListener('fullscreenchange', this.onFullscreenchange.bind(this), false);
        document.addEventListener('MSFullscreenChange', this.onFullscreenchange.bind(this), false);
    }
    /**
     * VLabEventDispatcher event subscription.
     * @memberof VLabEventDispatcher
     * @param {Object}      eventSubscrObj                           - Subscription object
     * @param {Object}      eventSubscrObj.subscriber                - Subscriber object (eventSubscrObj.subscriber.name property should be defined)
     * @param {Object}      eventSubscrObj.events                    - Event groups subscriber subscribing on
     */
    subscribe(eventSubscrObj) {
        if (eventSubscrObj['subscriber']) {
            if (eventSubscrObj['events']) {
                for (let eventGroupName in eventSubscrObj['events']) {
                    for (let eventType in eventSubscrObj['events'][eventGroupName]) {
                        let eventCallBack = eventSubscrObj['events'][eventGroupName][eventType];
                        if (eventSubscrObj['subscriber'].name !== undefined) {
                            this.eventSubscribers[eventGroupName][eventType][eventSubscrObj['subscriber'].name] = {
                                subscriber: eventSubscrObj['subscriber'],
                                callback:   eventCallBack
                            }
                        } else {
                            console.log('%c' + eventSubscrObj['subscriber'].constructor.name + ' will not be added to EventDispatcher subscribers because of subsriber.name is undefined', 'color: orange');
                        }
                    }
                }
            }
        }
    }
    /**
     * VLabEventDispatcher event unsubscription.
     * @memberof VLabEventDispatcher
     * @param {Object}      eventSubscrObj                           - Unsubscription object
     * @param {Object}      eventSubscrObj.subscriber                - Subscriber object
     * @param {Object}      eventSubscrObj.events                    - Event groups subscriber unsubscribing
     */
    unsubscribe(eventUnSubscrObj) {
        if (eventUnSubscrObj['subscriber']) {
            if (eventUnSubscrObj['events']) {
                for (let eventGroupName in eventUnSubscrObj['events']) {
                    for (let eventType in eventUnSubscrObj['events'][eventGroupName]) {
                        delete this.eventSubscribers[eventGroupName][eventType][eventUnSubscrObj['subscriber'].name];
                    }
                }
            }
        }
    }
    /**
     * VLabEventDispatcher event notifier. Notifes subscribers about event fired
     * @memberof VLabEventDispatcher
     * @param {Event} event
     */
    notifySubscribers(event) {
        switch (event.target) {
            case window:
                for (let eventSubscriberName in this.eventSubscribers['window'][event.type]) {
                    this.eventSubscribers['window'][event.type][eventSubscriberName].callback.call(this.eventSubscribers['window'][event.type][eventSubscriberName].subscriber, event);
                }
            break;
            case 'VLabScene':
            case 'VLabInventory':
            case 'VLabItem':
                for (let eventSubscriberName in this.eventSubscribers[event.target][event.type]) {
                    this.eventSubscribers[event.target][event.type][eventSubscriberName].callback.call(this.eventSubscribers[event.target][event.type][eventSubscriberName].subscriber, event);
                }
            break;
            default:
                /**
                 * Fullscreen change event
                 */
                if (event.type == 'webkitfullscreenchange' || event.type == 'mozfullscreenchange' || event.type == 'fullscreenchange' || event.type == 'MSFullscreenChange') {
                    for (let eventSubscriberName in this.eventSubscribers['document']['onfullscreenchange']) {
                        this.eventSubscribers['document']['onfullscreenchange'][eventSubscriberName].callback.call(this.eventSubscribers['document']['onfullscreenchange'][eventSubscriberName].subscriber, event);
                    }
                }
            break;
        }
        if (!this.vLab.renderPaused) {
            switch (event.target) {
                case this.vLab.WebGLRendererCanvas:
                    if (this.eventSubscribers[event.target.id]) {
                        for (let eventSubscriberName in this.eventSubscribers[event.target.id][event.type]) {
                            this.eventSubscribers[event.target.id][event.type][eventSubscriberName].callback.call(this.eventSubscribers[event.target.id][event.type][eventSubscriberName].subscriber, event);
                        }
                    }
                break;
            }
        }
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
        this.vLab.WebGLRendererCanvas.addEventListener('mouseout',      this.onWebGLRendererCanvasMouseOut.bind(this),     false);
        /* Touch events */
        this.vLab.WebGLRendererCanvas.addEventListener('touchstart',    this.onWebGLRendererCanvasTouchStart.bind(this),    false);
        this.vLab.WebGLRendererCanvas.addEventListener('touchend',      this.onWebGLRendererCanvasTouchEnd.bind(this),      false);
        this.vLab.WebGLRendererCanvas.addEventListener('touchmove',     this.onWebGLRendererCanvasTouchMove.bind(this),     false);
    }
    /* Window event handlers */
    onWindowResize(event) {
        this.vLab.resizeWebGLRenderer();
        this.notifySubscribers(event);
    }
    onWindowKeyDown(event) {
        this.notifySubscribers(event);
    }
    onWindowMessage(event) {
        this.notifySubscribers(event);
    }
    /* document event handlers */
    onFullscreenchange(event) {
        this.notifySubscribers(event);
    }

    /* Mouse event handlers */
    onWebGLRendererCanvasMouseDown(event) {
        this.vLab.SceneDispatcher.currentVLabScene.eventCoords.set(event.x, event.y);
        this.notifySubscribers(event);
    }
    onWebGLRendererCanvasMouseUp(event) {
        this.vLab.SceneDispatcher.currentVLabScene.eventCoords.set(event.x, event.y);
        this.notifySubscribers(event);
    }
    onWebGLRendererCanvasMouseMove(event) {
        this.vLab.SceneDispatcher.currentVLabScene.eventCoords.set(event.x, event.y);
        this.notifySubscribers(event);
    }
    onWebGLRendererCanvasMouseWheel(event) {
        this.notifySubscribers(event);
    }
    onWebGLRendererCanvasMouseOut(event) {
        this.notifySubscribers(event);
    }
    /* Touch event handlers */
    onWebGLRendererCanvasTouchStart(event) {
        this.vLab.SceneDispatcher.currentVLabScene.eventCoords.set(event.touches[0].clientX, event.touches[0].clientY);
        event.preventDefault();
        this.notifySubscribers(event);
    }
    onWebGLRendererCanvasTouchEnd(event) {
        event.preventDefault();
        this.notifySubscribers(event);
    }
    onWebGLRendererCanvasTouchMove(event) {
        this.vLab.SceneDispatcher.currentVLabScene.eventCoords.set(event.touches[0].clientX, event.touches[0].clientY);
        event.preventDefault();
        this.notifySubscribers(event);
        if (this.eventHelpers.touchmovePrevEvent == undefined) this.eventHelpers.touchmovePrevEvent = event;
        this.eventHelpers.touchmoveDelta = Math.sqrt(Math.pow(this.eventHelpers.touchmovePrevEvent.touches[0].clientX - event.touches[0].clientX, 2) + Math.pow(this.eventHelpers.touchmovePrevEvent.touches[0].clientY - event.touches[0].clientY, 2));
        this.eventHelpers.touchmovePrevEvent = event;
    }
}
export default VLabEventDispatcher;