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
     * @param {boolean}             [initObj.interactable.intersectable]        - If true then will be checked for intersection in {@link VLabScene#intersectInteractablesWithInteractablesRaycaster}
     * @param {boolean}             [initObj.interactable.preselecatble]        - If true mouseover and touchstart will preselect this.vLabSceneObject 
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
        /**
         * If true then will be checked for intersection in {@link VLabScene#intersectInteractablesWithInteractablesRaycaster}
         * @public
         */
        this.intersectable = false;
        /**
         * Intersection object passed to {@link VLabSceneInteractable#intersectionHandler} from {@link VLabScene#processInteractables}
         * @public
         */
        this.intersection = null;
        /**
         * If true mouseover and touchstart will preselect this.vLabSceneObject
         * @public
         */
        this.preselecatble = false;
        /**
         * If true then will be rendered as "selected" {@link VLabScene#processInteractables}
         * @public
         */
        this.selected = false;

        this.initialize(initObj);
    }
    /**
     * Initialize VLabSceneInteractable.
     * Adds this VLabSceneInteractable to {@link VLabScene#interactables};
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
        if (initObj.interactable.preselecatble !== undefined) {
            this.preselecatble = initObj.interactable.preselecatble;
        }
        if (initObj.interactable.intersectable !== undefined) {
            this.intersectable = initObj.interactable.intersectable;
        }
        this.vLabScene.interactables[this.vLabSceneObject.name] = this;
    }
    /**
     * VLabSceneInteractable default event handler / router; could be overridden in inheritor.
     *
     * @memberof VLabSceneInteractable
     * @abstract
     * @listens VLabScene:onDefaultEventHandler
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
     * Default intersection handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    intersectionHandler(event) {
        this.intersection = event.intersection;
    }
    /**
     * Default no-intersection handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    nointersectionHandler(event) {
        this.intersection = null;
    }
    /**
     * Default mousedown event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousedownHandler(event) {
        // console.log(this.intersection);
    }
    /**
     * Default mousemove event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousemoveHandler(event) {
        // console.log(this.vLabSceneObject.name, this.intersection);
    }
    /**
     * Default touchstart event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchstartHandler(event) {
        // console.log(this.vLabSceneObject.name, this.intersection);
    }
}
export default VLabSceneInteractable;