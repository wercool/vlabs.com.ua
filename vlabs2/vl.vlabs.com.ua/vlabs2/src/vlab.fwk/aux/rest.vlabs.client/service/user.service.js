/**
 * VLabsRESTUserService base class
 * @class
 */
class VLabsRESTUserService {
    /**
     * VLabsRESTUserService constructor
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
 }
 export default VLabsRESTUserService;