import * as HTTPUtils from '../../../utils/http.utils';

/**
 * VLabsRESTAuthService base class
 * @class
 */
class VLabsRESTAuthService {
   /**
    * VLabsRESTAuthService constructor
    * @constructor
    * @param {VLabsRESTClientManager}         vLabsRESTClientManager                      - VLabsRESTClientManager instance
    */
    constructor(vLabsRESTClientManager) {
        /**
         * VLabsRESTClientManager instance
         * @public
         */
        this.manager = vLabsRESTClientManager;
        this.token = undefined;

        /**
         * Set token from URL if passed; token is base64 encoded
         */
        let ulrParams = HTTPUtils.getAllUrlParams();
        if (ulrParams.token !== undefined) {
            this.token = atob(ulrParams.token);
        }
    }
    authenticate(credentials) {
// return Promise.resolve('NO AUTH');
        if ('<!--VLAB AUTH REQUIRED-->' == 'true') {
            /**
             * Token was set in constructor from URL parameter
             */
            if (this.token !== undefined) {
                return Promise.resolve('Authenticated from URL token parameter');
            }
            /**
             * Authenticate with provided credentials
             */
            credentials.password = btoa(credentials.password);
            return new Promise((resolve, reject) => {
                let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('auth', 'token');
                this.manager.post(apiEndPoint, credentials)
                .then((result) => {
                    console.log(result);
                    this.token = result.token;
                    resolve(result);
                })
                .catch((error) => {
                    // console.error(error.status);
                    reject(error);
                });
            });
        } else {
            return Promise.resolve('NO AUTH');
        }
    }
    userDetails() {
        if (this.token !== undefined) {
            return new Promise((resolve, reject) => {
                let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('auth', 'details');
                this.manager.get(apiEndPoint)
                .then((result) => {
                    resolve(result);
                })
                .catch((error) => {
                    console.error(error.status);
                    reject(error);
                });
            });
        } else {
            return Promise.resolve({});
        }
     }
}
export default VLabsRESTAuthService;