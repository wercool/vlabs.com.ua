/**
 * ValterRightPalmIKService base class
 * @class
 */
class ValterRightPalmIKService {
    /**
     * ValterRightPalmIKService constructor
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

     /**
      * 
      * @param {ValterRightPalmFKTuple} rightPalmFKTuple 
      */
     saveRightPalmFKTuple(rightPalmFKTuple) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'saveRightPalmFKTuple');
            this.manager.post(apiEndPoint, rightPalmFKTuple)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }

     getRightPalmFKTuple(rightPalmTargetObjectPos) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getRightPalmFKTuple');
            this.manager.post(apiEndPoint, rightPalmTargetObjectPos)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }

     getAllRightPalmFKTuples(sigma) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getAllRightPalmFKTuples');
            if (sigma !== undefined) apiEndPoint += '?sigma=' + sigma;
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

     getRightPalmFKTuplesNormalizationBounds(sigma) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getRightPalmFKTuplesNormalizationBounds');
            if (sigma !== undefined) apiEndPoint += '?sigma=' + sigma;
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

     getAllRightPalmFKTuplesNormalized(sigma) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getAllRightPalmFKTuplesNormalized');
            if (sigma !== undefined) apiEndPoint += '?sigma=' + sigma;
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
}
 export default ValterRightPalmIKService;