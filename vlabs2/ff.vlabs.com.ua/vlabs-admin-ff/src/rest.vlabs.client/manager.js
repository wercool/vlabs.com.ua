import PublicService from './service/public.service';
import AuthService from './service/auth.service';
import ValterService from './service/valter.service';

class VLabsRESTClientManager {
    constructor() {

        this.headers = [
            ['Content-Type', 'application/json']
        ];

        this.APIEndpoints = {
            base: 'http://localhost:8080/api',
            ws: {
                base: 'ws://localhost:8080/api/ws',
                basic: '/basic'
            },
            public: {
                base: '/public',
                ping: '/ping'
            },
            auth: {
                base: '/auth',
                token: '/token',
                details: '/details'
            },
            user: {
                base: '/user',
            },

            valter: {
                base: '/valter',
                tuplesNum: '/slam/get_slam_tuples_num'
            },
            getFullyQualifiedURL: function (endpointGroup, endpointPoint) {
                return this.base + ((this[endpointGroup].base) ? this[endpointGroup].base : '') + this[endpointGroup][endpointPoint];
            }
        };

        /**
         * 
         * 
         _____                 _               
        / ____|               (_)              
       | (___   ___ _ ____   ___  ___ ___  ___ 
        \___ \ / _ \ '__\ \ / / |/ __/ _ \/ __|
        ____) |  __/ |   \ V /| | (_|  __/\__ \
       |_____/ \___|_|    \_/ |_|\___\___||___/
                                                
        * 
        * 
        */
        this.PublicService = new PublicService(this);
        this.AuthService = new AuthService(this);

        this.ValterService = new ValterService(this);
    }
    handleError(error) {
        switch (error.type) {
            case 'XHR':
                console.error('Error response: ' + error.status + ' ' + error.statusText);
            break;
            case 'JSON':
                console.error('Error parsing response JSON: ' + error.status + ' ' + error.statusText);
            break;
            default:
        }
    }
    /**
     * Conditionally setup HTTP headers
     */
    setupHeaders() {
        let headers = this.headers.slice();
        if (this.AuthService.token !== null) {
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
                if (xhr.readyState === 4 && xhr.status === 200) {
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
                if (xhr.readyState === 4 && xhr.status === 200) {
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