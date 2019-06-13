import NavKinectRGBDWebSocketMessage from '../../../../../../vlab.items/valter/slam/model/nav-kinect-rgbd-websocket-message';
/**
 * VLabsRESTWSValterRGBDMessageService base class
 * @class
 */
class VLabsRESTWSValterRGBDMessageService {
    /**
     * VLabsRESTWSValterRGBDMessageService constructor
     * @constructor
     * @param {VLabsRESTClientManager}         vLabsRESTClientManager                      - VLabsRESTClientManager instance
     */
    constructor(vLabsRESTClientManager) {
        /**
        * VLabsRESTClientManager instance
        * @public
        */
        this.manager = vLabsRESTClientManager;

        this.socket = undefined;
        this.connected = false;
    }
    getFullyQualifiedURL() {
        return this.manager.APIEndpoints.ws['base'] + this.manager.APIEndpoints.valter['base'] +  this.manager.APIEndpoints.valter.ws['navKinectRGBD'] + '?token=' + this.manager.AuthService.token;
    }
    connect() {
        this.socket = new WebSocket(this.getFullyQualifiedURL());
        this.socket.onopen = this.onSocketOpen.bind(this);
        this.socket.onerror = this.onSocketError.bind(this);
        this.socket.onmessage = this.onSocketMessage.bind(this);
    }
    send(message) {
        if (this.connected) {
            this.socket.send(JSON.stringify(message));
        }
    }
    onSocketOpen(event) {
        // console.log(event);
        this.connected = true;
    }
    onSocketError(error) {
        console.log(error);
    }
    onSocketMessage(event) {
        // console.log(JSON.parse(event.data));
    }
 }
 export default VLabsRESTWSValterRGBDMessageService;