import * as THREE from 'three';
import VLabScene from '../../core/vlab.scene';

/**
 * VLabInventory base class
 * @class
 */
class VLabInventory extends VLabScene {
   /**
    * VLabInventory constructor
    * @constructor
    * @param {Object}    initObj                           - VLabScene initialization object
    * @param {VLab}      initObj.vLab                      - VLab instance
    */
    constructor(initObj) {
        initObj['loaded'] = true;
        initObj['configured'] = true;
        super(initObj);
        this.initObj = initObj;
        /**
         * VLab instance
         * @public
         */
        this.vLab = this.initObj.vLab;

        if (this.vLab.SceneDispatcher.getScene(VLabInventory) === null) {
            this.vLab.SceneDispatcher.scenes.push(this);

            // let self = this;
            // setTimeout(() => {
            //     self.vLab.SceneDispatcher.activateScene({
            //         class: self.constructor
            //     });
            // }, 5000);
        } else {
            console.error('VLabInventory already exists in VLab');
        }
    }
}
export default VLabInventory;