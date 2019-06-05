import * as tf from '@tensorflow/tfjs';
/**
 * Valter Head IK dev class.
 * @class
 * @classdesc Valter The Robot Head IK methods aggregation.
 */
class ValterHeadIKDev {
    constructor(Valter) {
        /**
         * 👁 Valter
         */
        this.Valter = Valter;
        /**
         * 👁 Valter.vLab
         */
        this.vLab = this.Valter.vLab;
    }

    prepareValterHeadFKTuples() {
        return new Promise((resolve, reject) => {
            this.vLab.VLabsRESTClientManager.ValterHeadIKService.getAllHeadFKTuplesNormalized()
            .then(headFKNormalizedTuples => {
                resolve(headFKNormalizedTuples);
            });
        });
    }

}
export default ValterHeadIKDev;