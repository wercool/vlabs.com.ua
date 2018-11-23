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
        this.setupSiblingIneractables();
    }

    /**
     * this.nature.interactables ['baseFrame'] onBaseFramePreselection / onBaseFrameDePreselection
     */
    onBaseFramePreselection(params) {
        let siblingInteractables = [];
        let baseFrame = this.vLab.SceneDispatcher.currentVLabScene.interactables['baseFrame'];
        baseFrame.siblings.forEach((siblingInteractable) => {
            siblingInteractables.push(siblingInteractable);
        });
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['bodyFrame']);
        siblingInteractables.forEach((siblingInteractable) => {
            siblingInteractable.keepPreseleciton = true;
            siblingInteractable.preselect(true);
        });
    }
    onBaseFrameDePreselection() {
        let siblingInteractables = [];
        let baseFrame = this.vLab.SceneDispatcher.currentVLabScene.interactables['baseFrame'];
        baseFrame.siblings.forEach((siblingInteractable) => {
            siblingInteractables.push(siblingInteractable);
        });
        siblingInteractables.push(this.vLab.SceneDispatcher.currentVLabScene.interactables['bodyFrame']);
        siblingInteractables.forEach((siblingInteractable) => {
            siblingInteractable.keepPreseleciton = false;
            siblingInteractable.dePreselect();
        });
    }
}
export default Valter;