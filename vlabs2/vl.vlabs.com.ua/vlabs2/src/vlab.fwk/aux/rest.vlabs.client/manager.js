import VLabsRESTAuthService from './service/auth.service';
import VLabsRESTUserService from './service/user.service';
import VLabsRESTWSBasicService from './service/ws.basic.service';

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

        this.headers = [
            ['Content-Type', 'application/json']
        ];

        this.APIEndpoints = {
            base: 'http://localhost:8080/api',
            ws: {
                base: 'ws://localhost:8080/api/ws',
                basic: '/basic'
            },
            auth: {
                base: '/auth',
                token: '/token',
                details: '/details'
            },
            user: {
                base: '/user',
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
        this.AuthService        = new VLabsRESTAuthService(this);
        this.UserService        = new VLabsRESTUserService(this);
        this.WSBasicService     = new VLabsRESTWSBasicService(this);
    }
    handleError(error) {
        switch (error.type) {
            case 'XHR':
                console.error('Error response: ' + error.status + ' ' + error.statusText);
            break;
            case 'JSON':
                console.error('Error parsing response JSON: ' + error.status + ' ' + error.statusText);
            break;
        }
    }
    /**
     * Conditionally setup HTTP headers
     */
    setupHeaders() {
        let headers = this.headers.slice();
        if (this.AuthService.token !== undefined) {
            headers.push(['Authorization', 'Bearer ' + this.AuthService.token]);
        }
        return headers;
    }
    /**
     * GET
     * @param {String} endPointPath 
     * @param {*} customHeaders 
     */
    get(endPointPath, customHeaders) {
        let self = this;
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    try {
                        let xhrResponseJSON = JSON.parse(xhr.responseText);
                        resolve(xhrResponseJSON);
                    } catch (error) {
                        let errorObj = {
                            type: 'JSON',
                            status: 'Syntax Error',
                            statusText: error.message
                        };
                        self.handleError(errorObj);
                        reject(errorObj);
                    }
                } else {
                    let errorObj = {
                        type: 'XHR',
                        status: xhr.status,
                        statusText: xhr.statusText
                    };
                    self.handleError(errorObj);
                    reject(errorObj);
                }
            }
            xhr.onerror = function() {
                let errorObj = {
                    type: 'XHR',
                    status: xhr.status,
                    statusText: xhr.statusText
                };
                self.handleError(errorObj);
                reject(errorObj);
            }
            xhr.open('GET', endPointPath);
            let headers = self.setupHeaders();
            headers.forEach((header) => {
                xhr.setRequestHeader(header[0], header[1]);
            });
            xhr.send();
        });
    }
    /**
     * POST
     * @param {*} endPointPath 
     * @param {*} body 
     * @param {*} customHeaders 
     */
    post(endPointPath, body, customHeaders) {
        let self = this;
        return new Promise(function(resolve, reject) {
            var xhr = new XMLHttpRequest();
            xhr.onload = function() {
                if (xhr.readyState == 4 && xhr.status == 200) {
                    try {
                        let xhrResponseJSON = JSON.parse(xhr.responseText);
                        resolve(xhrResponseJSON);
                    } catch (error) {
                        let errorObj = {
                            type: 'JSON',
                            status: 'Syntax Error',
                            statusText: error.message
                        };
                        self.handleError(errorObj);
                        reject(errorObj);
                    }
                } else {
                    let errorObj = {
                        type: 'XHR',
                        status: xhr.status,
                        statusText: xhr.statusText
                    };
                    self.handleError(errorObj);
                    reject(errorObj);
                }
            }
            xhr.onerror = function() {
                let errorObj = {
                    type: 'XHR',
                    status: xhr.status,
                    statusText: xhr.statusText
                };
                self.handleError(errorObj);
                reject(errorObj);
            }
            xhr.open('POST', endPointPath);
            let headers = self.setupHeaders();
            headers.forEach((header) => {
                xhr.setRequestHeader(header[0], header[1]);
            });
            xhr.send(JSON.stringify(body));
        });
    }
}
export default VLabsRESTClientManager;