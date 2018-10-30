/**
 * VLabsRESTWSBasicService base class
 * @class
 */
class VLabsRESTWSBasicService {
    /**
     * VLabsRESTWSBasicService constructor
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
        this.socket = new WebSocket(this.manager.APIEndpoints.ws.base + this.manager.APIEndpoints.ws.basic + '?token=' + this.manager.AuthService.token);
        this.socket.onopen = this.onSocketOpen.bind(this);
        this.socket.onerror = this.onSocketError.bind(this);
        this.socket.onmessage = this.onSocketMessage.bind(this);
    }
    send(message) {
        this.socket.send(message);
    }
    onSocketOpen(event) {
        // console.log(event);
        let payload = {
            type: 'test',
            message: 'test message'
        };
this.send(JSON.stringify(payload));
    }
    onSocketError(error) {
        console.log(error);
    }
    onSocketMessage(event) {
        console.log(JSON.parse(event.data));
    }
 }
 export default VLabsRESTWSBasicService;