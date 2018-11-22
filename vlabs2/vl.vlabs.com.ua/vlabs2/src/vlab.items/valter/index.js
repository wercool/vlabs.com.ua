import * as THREE from 'three';
import VLabItem from '../../vlab.fwk/core/vlab.item';
/**
 * Valter VLabItem base class.
 * @class
 * @classdesc Valter The Robot.
 */
class Valter extends VLabItem {
    /**
     * VLabItem
     * @param {*} initObj 
     */
    constructor(initObj) {
        super(initObj);

        this.initObj = initObj;

        this.initialize();
    }
    /**
     * VLabItem onInitialized abstract function implementation
     */
    onInitialized() {
        console.log(this);
        console.log(this.vLab);
        this.vLab.SceneDispatcher.currentVLabScene.add(this.vLabItemModel);
    }
}
export default Valter;