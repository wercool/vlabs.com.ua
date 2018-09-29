import * as THREE from 'three';
import VLabScene from './vlab.scene';
/**
 * VLabScene Interactable base class.
 * @class
 * @classdesc VLabScene Interactable base class serves VLabScene interactable object.
 */
class VLabSceneInteractable {
    /**
     * VLabSceneInteractable constructor.
     * 
     * @constructor
     * @param {Object}              initObj                                     - VLabSceneInteractable initialization object
     * @param {VLabScene}           initObj.vLabScene                           - VLabScene
     * @param {Object}              initObj.interactable                        - VLab Scene nature interactables object
     * @param {string}              [initObj.interactable.name]                 - VLab Scene object name; presumed could be set later
     * @param {Object}              [initObj.interactable.sceneObject]          - VLab Scene object reference
     * @param {boolean}             initObj.interactable.preselecatble          - If true mouseover and touchstart will preselect this.vLabSceneObject 
     *
     */
    constructor(initObj) {
        /**
         * VLabScene instance reference
         * @public
         */
        this.vLabScene = undefined;
        /**
         * VLabScene interactable object reference, retrieved as this.vLabScene.getObjectByName(initObj.interactable.name)
         * @public
         */
        this.vLabSceneObject = undefined;

        this.initialize(initObj);
    }
    /**
     * Initialize VLabSceneInteractable.
     *
     * @memberof VLabSceneInteractable
     */
    initialize(initObj){
        this.vLabScene = initObj.vLabScene;
        if (initObj.interactable.name !== undefined) {
            this.vLabSceneObject = this.vLabScene.getObjectByName(initObj.interactable.name);
        }
        if (initObj.interactable.sceneObject !== undefined) {
            this.vLabSceneObject = initObj.interactable.sceneObject;
        }
    }
    /**
     * VLabSceneInteractable default event handler / router; could be overridden in inheritor.
     *
     * @memberof VLabSceneInteractable
     * @abstract
     * @todo implement handlers for {@link VLabScene#eventSubscrObj}
     */
    onDefaultEventHandler(event) {
        if (this.vLabScene !== undefined && this.vLabSceneObject !== undefined) {
            if (event.target == this.vLabScene.vLab.WebGLRendererCanvas) {
                if (this[event.type + 'Handler']) {
                    this[event.type + 'Handler'].call(this, event);
                }
            }
        }
    }
    /**
     * Default mousedown event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousedownHandler(event) {
        this.vLabScene.intersectableInteractables.push(this.vLabSceneObject);
    }
}
export default VLabSceneInteractable;