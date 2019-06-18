/**
 * ValterSLAMService base class
 * @class
 */
class ValterSLAMService {
    /**
     * ValterSLAMService constructor
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
     saveSLAMRGBDCmdVelOrientationTuple(slamRGBDCmdVelOrientationTuple) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'saveSLAMRGBDCmdVelOrientationTuple');
            this.manager.post(apiEndPoint, slamRGBDCmdVelOrientationTuple)
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
 export default ValterSLAMService;