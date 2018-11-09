import VLabsRESTWSBasicService from '../rest.vlabs.client/service/ws.basic.service';
import BasicWebSocketMessage from '../../aux/rest.vlabs.client/model/basic.websocket.message';

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
        /**
         * name for this.vLab.EventDispatcher
         */
        this.name = 'FFClientManager';
        /**
         * Managed by VLabs FF or standalone
         */
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
        console.log(event.data);
        switch (event.data.message.type) {
            case 'connectWS':
                this.vLabWSService = new VLabsRESTWSBasicService(this.vLab.VLabsRESTClientManager);
                this.vLabWSService.connect(event.data.message.suffix);
            break;
            case 'sendWS':
                if (this.vLabWSService) {
                    let basicWebSocketMessage = new BasicWebSocketMessage();
                    basicWebSocketMessage.type = 'test';
                    basicWebSocketMessage.message = event.data.message.message;
                    this.vLabWSService.send(JSON.stringify(basicWebSocketMessage));
                }
            break;
        }
    }
}
export default VLabsFFClientManager;