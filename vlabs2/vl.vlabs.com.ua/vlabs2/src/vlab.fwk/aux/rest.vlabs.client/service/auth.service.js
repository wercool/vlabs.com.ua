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
    }
    authAttempt(credentials) {
        if ('<!--VLAB AUTH REQUIRED-->' == 'true') {
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
                    console.log(result);
                    this.token = result.token;
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