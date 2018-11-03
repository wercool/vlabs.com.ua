/**
 * VLabsFFClientManager base class
 * Manages VLabs FF application communication
 * @class
 */
class VLabsFFClientManager {
   /**
    * VLabsFFClientManager constructor
    * @constructor
    * @param {VLab}         vLab                      - VLab instance
    */
   constructor(vLab) {
        /**
         * VLab instance
         * @public
         */
        this.vLab = vLab;

        this.name = 'FFClientManager';

        this.managedMode = false;

        /**
         * Default event subscription object; {@link VLabEventDispatcher#eventSubscribers}
         * @public
         */
        this.eventSubscrObj = {
            subscriber: this,
            events: {
                window: {
                    message:      this.onMessage
                }
            }
        };

        /**
         * Detects managed by VLabs FF mode
         */
        if (window.self !== window.top) {
            this.managedMode = true;
            this.vLab.EventDispatcher.subscribe(this.eventSubscrObj);
        }
    }
    sendMessage(message) {
        window.top.postMessage(message, '*');
        console.warn('TODO: origin for VLabsFFClientManager postMessage');
    }
    /**
     * Managed mode only
     * window.top message handler
     */
    onMessage(event) {
        console.log(event);
    }
}
export default VLabsFFClientManager;