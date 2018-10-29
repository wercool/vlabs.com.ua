/**
 * VLabsRESTWSDefaultService base class
 * @class
 */
class VLabsRESTWSDefaultService {
    /**
     * VLabsRESTWSDefaultService constructor
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
    }
    connect() {
        this.socket = new WebSocket(this.manager.APIEndpoints.ws.base + this.manager.APIEndpoints.ws.default + '?token=' + this.manager.AuthService.token);
        this.socket.onopen = this.onSocketOpen.bind(this);
        this.socket.onerror = this.onSocketError.bind(this);
        this.socket.onmessage = this.onSocketMessage.bind(this);
    }
    send(message) {
        this.socket.send(message);
    }
    onSocketOpen(event) {
        // console.log(event);
this.send('test');
    }
    onSocketError(error) {
        console.log(error);
    }
    onSocketMessage(event) {
        console.log(event.data);
    }
 }
 export default VLabsRESTWSDefaultService;