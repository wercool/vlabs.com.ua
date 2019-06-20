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

     getAllSLAMRGBDCmdVelOrientationTuples() {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getSLAMRGBDCmdVelOrientationTuples');
            this.manager.get(apiEndPoint)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }

     getAllSLAMRGBDBytesCmdVelOrientationTuples() {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getSLAMRGBDBytesCmdVelOrientationTuples');
            this.manager.get(apiEndPoint)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }

     getAllSLAMRGBDCmdVelOrientationTuplesNormalized() {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getSLAMRGBDCmdVelOrientationTuplesNormalized');
            this.manager.get(apiEndPoint)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }

     getStreamAllSLAMRGBDCmdVelOrientationTuplesNormalized(callbacks = {}) {
         return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getStreamSLAMRGBDCmdVelOrientationTuplesNormalized');
            this.manager.getFromEventSourceWithCompletion(apiEndPoint, callbacks)
            .then(() => {
                resolve();
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
         });
     }
}
 export default ValterSLAMService;