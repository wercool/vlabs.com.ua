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
         * If true then this will be added to the {@link VLabScene#preSelectedInteractables}
         * @public
         */
        this.preselectable = false;
        /**
         * If true then this is in the {@link VLabScene#preSelectedInteractables}
         * @public
         */
        this.preselected = false;
        /**
         * If true then will be rendered as "selected" {@link VLabScene#selectedInteractables}
         * @public
         */
        this.selectable = false;
        /**
         * If true then will be rendered as "selected" {@link VLabScene#selectedInteractables}
         * @public
         */
        this.selected = false;
        /**
         * Simple outline (if EffectComposer is not in use) helper mesh
         */
        this.outlineHelperMesh = undefined;

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
        if (initObj.interactable.intersectable !== undefined) {
            this.intersectable = initObj.interactable.intersectable;
        }
        if (initObj.interactable.preselectable !== undefined) {
            this.preselectable = initObj.interactable.preselectable;
        }
        if (initObj.interactable.selectable !== undefined) {
            this.selectable = initObj.interactable.selectable;
        }
        if (this.vLabSceneObject) {
            this.vLabScene.interactables[this.vLabSceneObject.name] = this;
        }
    }
    /**
     * Selects this VLabSceneInteractable
     * Adds this instance to {@link VLabScene#selectedInteractables}
     */
    select() {
        if (this.selectable && !this.selected) {
            if (this.preselectable && this.preselected || !this.preselectable) {
                this.vLabScene.selectedInteractables.push(this);
                this.selected = true;
            }
        }
    }
    /**
     * Preselects this VLabSceneInteractable
     * Adds this instance to {@link VLabScene#preSelectedInteractables}
     */
    preselect() {
        if (this.preselectable && !this.preselected && !this.selected) {
            this.vLabScene.preSelectedInteractables.push(this);
            this.preselected = true;
        }
    }
    /**
     * Deselcts pre-selected this VLabSceneInteractable
     * Remove this instance to {@link VLabScene#preSelectedInteractables}
     */
    dePreselect() {
        if (this.preselected) {
            let indexOfThisPreselected = this.vLabScene.preSelectedInteractables.indexOf(this);
            this.vLabScene.preSelectedInteractables.splice(indexOfThisPreselected, 1);
            this.preselected = false;
        }
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
        this.preselect();
    }
    /**
     * Default no-intersection handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    nointersectionHandler(event) {
        this.intersection = null;
        this.dePreselect();
    }
    /**
     * Default framerequest event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    framerequestHandler(event) {
        // console.log(this.intersection);
    }
    /**
     * Default mousedown event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousedownHandler(event) {
        this.select();
    }
    /**
     * Default mousemove event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    mousemoveHandler(event) {

    }
    /**
     * Default touchstart event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchstartHandler(event) {
        this.select();
    }
    /**
     * Shows simple outline based on this.vLabSceneObject.geometry
     */
    outline() {
        if (this.outlineHelperMesh == undefined) this.addOutlineHelperMesh();
        this.outlineHelperMesh.visible = true;
    }
    /**
     * Hides simple outline based on this.vLabSceneObject.geometry
     */
    clearOutline() {
        if (this.outlineHelperMesh != undefined) {
            this.outlineHelperMesh.visible = false;
        }
    }
    /**
     * Adds simple outline based on this.vLabSceneObject.geometry as THREE.Mesh to this.vLabSceneObject
     */
    addOutlineHelperMesh() {
        if (this.vLabSceneObject) {
            this.outlineHelperMesh = new THREE.Mesh(this.vLabSceneObject.geometry, this.vLabScene.manager.simpleOutlineMaterial);
            this.outlineHelperMesh.name = this.vLabSceneObject.name + '_OUTLINE';
            this.outlineHelperMesh.scale.multiplyScalar(1.05);
            this.outlineHelperMesh.visible = false;
            this.vLabSceneObject.add(this.outlineHelperMesh);
        }
    }
}
export default VLabSceneInteractable;