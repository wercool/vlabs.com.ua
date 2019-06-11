/**
 * ValterLeftPalmIKService base class
 * @class
 */
class ValterLeftPalmIKService {
    /**
     * ValterLeftPalmIKService constructor
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
      * @param {ValterLeftPalmFKTuple} leftPalmFKTuple 
      */
     saveLeftPalmFKTuple(leftPalmFKTuple) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'saveLeftPalmFKTuple');
            this.manager.post(apiEndPoint, leftPalmFKTuple)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }

     getLeftPalmFKTuple(leftPalmTargetObjectPos) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getLeftPalmFKTuple');
            this.manager.post(apiEndPoint, leftPalmTargetObjectPos)
            .then((result) => {
                resolve(result);
            })
            .catch((error) => {
                console.error(error.status);
                reject(error);
            });
        });
     }

     getAllLeftPalmFKTuples(sigma) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getAllLeftPalmFKTuples');
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

     getLeftPalmFKTuplesNormalizationBounds(sigma) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getLeftPalmFKTuplesNormalizationBounds');
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

     getAllLeftPalmFKTuplesNormalized(sigma) {
        return new Promise((resolve, reject) => {
            let apiEndPoint = this.manager.APIEndpoints.getFullyQualifiedURL('valter', 'getAllLeftPalmFKTuplesNormalized');
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
 export default ValterLeftPalmIKService;