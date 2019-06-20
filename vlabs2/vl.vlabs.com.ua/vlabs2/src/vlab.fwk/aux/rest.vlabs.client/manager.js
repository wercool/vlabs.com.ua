import { NativeEventSource, EventSourcePolyfill } from 'event-source-polyfill';

import VLabsRESTAuthService from './service/auth.service';
import VLabsRESTUserService from './service/user.service';
import VLabsRESTWSBasicService from './service/ws.basic.service';

/**
 * Valter
 */
import VLabsRESTValterHeadIKService from './service/valter/valter.head.ik.service';
import ValterRightPalmIKService from './service/valter/valter.right.palm.ik.service';
import ValterLeftPalmIKService from './service/valter/valter.left.palm.ik.service';
import ValterSLAMService from './service/valter/valter.slam.service';
import VLabsRESTWSValterRGBDMessageService from './service/valter/ws/ws.valter.rgbd.message.service';

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
            base: (this.vLab.nature.APIEndpoints && this.vLab.nature.APIEndpoints.base) ? this.vLab.nature.APIEndpoints.base : 'http://localhost:8080/api',
            ws: {
                base: (this.vLab.nature.APIEndpoints && this.vLab.nature.APIEndpoints.ws_base) ? this.vLab.nature.APIEndpoints.ws_base : 'ws://localhost:8080/api/ws',
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
            /**
             * Valter
             */
            valter: {
                base: '/valter',
                /**
                 * Head
                 */
                saveHeadFKTuple:                        '/head/ik/save_head_fk_tuple',
                getHeadFKTuple:                         '/head/ik/get_head_fk_tuple',
                getAllHeadFKTuples:                     '/head/ik/get_all_head_fk_tuples',
                getHeadFKTuplesNormalizationBounds:     '/head/ik/get_head_fk_normalization_bounds',
                getAllHeadFKTuplesNormalized:           '/head/ik/get_all_head_fk_tuples_normalized',
                /**
                 * Right Palm
                 */
                saveRightPalmFKTuple:                           '/palm/right/ik/save_right_palm_fk_tuple',
                getRightPalmFKTuple:                            '/palm/right/ik/get_right_palm_fk_tuple',
                getAllRightPalmFKTuples:                        '/palm/right/ik/get_all_right_palm_fk_tuples',
                getRightPalmFKTuplesNormalizationBounds:        '/palm/right/ik/get_right_palm_fk_normalization_bounds',
                getAllRightPalmFKTuplesNormalized:              '/palm/right/ik/get_all_right_palm_fk_tuples_normalized',
                /**
                 * Left Palm
                 */
                saveLeftPalmFKTuple:                           '/palm/left/ik/save_left_palm_fk_tuple',
                getLeftPalmFKTuple:                            '/palm/left/ik/get_left_palm_fk_tuple',
                getAllLeftPalmFKTuples:                        '/palm/left/ik/get_all_left_palm_fk_tuples',
                getLeftPalmFKTuplesNormalizationBounds:        '/palm/left/ik/get_left_palm_fk_normalization_bounds',
                getAllLeftPalmFKTuplesNormalized:              '/palm/left/ik/get_all_left_palm_fk_tuples_normalized',
                /**
                 * SLAM
                 */
                saveSLAMRGBDCmdVelOrientationTuple:                     '/slam/save_slam_tuple',
                getSLAMRGBDCmdVelOrientationTuples:                     '/slam/get_all_slam_tuples',
                getSLAMRGBDBytesCmdVelOrientationTuples:                '/slam/get_all_slam_tuples_rgbd_bytes',
                getSLAMRGBDCmdVelOrientationTuplesNormalized:           '/slam/get_all_slam_tuples_normalized',
                getStreamSLAMRGBDCmdVelOrientationTuplesNormalized:     '/slam/get_stream_all_slam_tuples_normalized',
                /**
                 * Navigation Kinect WS
                 */
                ws: {
                    navKinectRGBD:  '/nav_kinect_rgbd',
                }
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
        this.AuthService                = new VLabsRESTAuthService(this);
        this.UserService                = new VLabsRESTUserService(this);
        this.WSBasicService             = new VLabsRESTWSBasicService(this);
        /**
         * Valter
         */
        this.ValterHeadIKService                    = new VLabsRESTValterHeadIKService(this);
        this.ValterRightPalmIKService               = new ValterRightPalmIKService(this);
        this.ValterLeftPalmIKService                = new ValterLeftPalmIKService(this);
        this.ValterSLAMService                      = new ValterSLAMService(this);
        /**
         * Valter WS
         */
        this.VLabsRESTWSValterRGBDMessageService             = new VLabsRESTWSValterRGBDMessageService(this);
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
            // xhr.onprogress = function(event) { console.log(event); }
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
    /**
     * 
     * GET from EventSource
     * 
     */
    getFromEventSourceWithCompletion(endPointPath, callbacks = {}, customHeaders = []) {
        return new Promise((resolve) => {
            let headers = this.setupHeaders();
            headers = [...headers, ...customHeaders];
            let esHeaders = {};
            headers.forEach(header => {
                esHeaders[header[0]] = header[1];
            });
            var es = new EventSourcePolyfill(endPointPath, {
                headers: esHeaders,
                Transport: XMLHttpRequest
            });
            
            es.addEventListener('message', (event) => {
                let eventData = JSON.parse(event.data);
                /**
                 * Setup callbacks
                 */
                if (eventData.firstMessage) {
                    if (callbacks.onFirstMessage) {
                        callbacks.onFirstMessage.call(callbacks.context ? callbacks.context : undefined, eventData);
                    }
                }
                if (callbacks.onMessage) {
                    callbacks.onMessage.call(callbacks.context ? callbacks.context : undefined, eventData);
                }
                if (eventData.lastMessage) {
                    es.close();
                    if (callbacks.onLastMessage) {
                        callbacks.onLastMessage.call(callbacks.context ? callbacks.context : undefined);
                    }
                    resolve();
                }
            });
            /**
             * Setup callbacks
             */
            if (callbacks.onOpen) {
                es.addEventListener('open', callbacks.onOpen);
            }
        });
    }
}
export default VLabsRESTClientManager;