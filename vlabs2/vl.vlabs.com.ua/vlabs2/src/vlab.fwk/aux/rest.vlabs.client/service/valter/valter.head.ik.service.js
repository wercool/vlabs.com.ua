/**
 * VLabsRESTValterHeadIKService base class
 * @class
 */
class VLabsRESTValterHeadIKService {
    /**
     * VLabsRESTValterHeadIKService constructor
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
     saveHeadFKTuple(headFKTuple) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'saveHeadFKTuple');
            this.manager.post(apiEndPoint, headFKTuple)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }
     getHeadIKTuple(headTargetObjectDir) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getHeadIKTuple');
            this.manager.post(apiEndPoint, headTargetObjectDir)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }
 }
 export default VLabsRESTValterHeadIKService;