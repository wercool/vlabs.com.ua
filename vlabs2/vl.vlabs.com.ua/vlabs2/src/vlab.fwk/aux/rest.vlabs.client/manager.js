import VLabsRESTAuthService from '../rest.vlabs.client/service/auth.service'

/**
 * VLabsRESTClientManager base class
 * @class
 */
class VLabsRESTClientManager {
   /**
    * VLabsRESTClientManager constructor
    * @constructor
    * @param {VLab}         vLab                      - VLab instance
    */
    constructor(vLab) {
        /**
         * VLab instance
         * @public
         */
        this.vLab = vLab;

        this.APIEndpoints = {
            base: 'http://localhost:8080/api',
            auth: {
                base: '/auth',
                attempt: '/attempt'
            },
            getFullyQualifiedURL: function (endpointGroup, endpointPoint) {
                return this.base + ((this[endpointGroup].base) ? this[endpointGroup].base : '') + this[endpointGroup][endpointPoint];
            }
        };

        /**
         * 
         * Services
         * 
         */
        this.AuthService = new VLabsRESTAuthService(this);
    }
    post(endPointPath, body, customHeaders, withoutCredentials) {
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                console.log(xhr.responseText);
                // resolve(JSON.parse(xhr.responseText));
            }
            xhr.onerror = function() {
                if (xhr.status == 404) {
                    reject('REST endpoint not found: ' + endPointPath);
                } else {
                    reject('REST endpoint request failed: ', xhr.status);
                }
            }
            xhr.open('POST', endPointPath);
            xhr.send(body);
        });
    }
}
export default VLabsRESTClientManager;