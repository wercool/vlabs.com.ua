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
    }
    authAttempt(credentials) {
        let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('auth', 'attempt');
        return this.manager.post(apiEndPoint, credentials);
    }
}
export default VLabsRESTAuthService;