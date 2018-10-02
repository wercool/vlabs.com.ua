import * as THREE from 'three';
import * as TWEEN from 'tween.js';
import * as THREEUtils from '../utils/three.utils';
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
     * @param {boolean}             [initObj.interactable.selectable]           - If true mousedown and touchstart will select this.vLabSceneObject if it is preselectable and already preselected or if it is not preselectable
     * @param {HTML}                [initObj.interactable.tooltip]              - If defined and != "" then will be shown in {@linkg VLabSceneInteractable#preselect}
     *
     */
    constructor(initObj) {
        this.initObj = initObj;
        /**
         * VLabScene instance reference
         * @public
         * @default this.initObj.vLabScene
         */
        this.vLabScene = this.initObj.vLabScene;
        /**
         * VLabScene interactable object reference, retrieved as this.vLabScene.getObjectByName(initObj.interactable.name)
         * @public
         * @default undefined
         */
        this.vLabSceneObject = undefined;
        /**
         * If true then will be checked for intersection in {@link VLabScene#intersectInteractablesWithInteractablesRaycaster}
         * @public
         * @default false
         */
        this.intersectable = false;
        /**
         * Intersection object passed to {@link VLabSceneInteractable#intersectionHandler} from {@link VLabScene#processInteractables}
         * @public
         * @default null
         */
        this.intersection = null;
        /**
         * If true then this will be added to the {@link VLabScene#preSelectedInteractables}
         * @public
         * @default false
         */
        this.preselectable = false;
        /**
         * If true then this is in the {@link VLabScene#preSelectedInteractables}
         * @public
         * @default false
         */
        this.preselected = false;
        /**
         * If true then will be rendered as "selected" {@link VLabScene#selectedInteractables}
         * @public
         * @default false
         */
        this.selectable = false;
        /**
         * If true then will be rendered as "selected" {@link VLabScene#selectedInteractables}
         * @public
         * @default false
         */
        this.selected = false;
        /**
         * Simple outline (if EffectComposer is not in use) helper mesh
         */
        this.outlineHelperMesh = undefined;
        /**
         * Simple outline TWEEN animation
         */
        this.outlineHelperMeshTWEEN = undefined;
        /**
         * Tooltip to be shown in {@linkg VLabSceneInteractable#preselect}
         * @default empty
         */
        this.tooltip = '';
        /**
         * Tooltip DIV
         */
        this.tooltipContainer = undefined;
    }
    /**
     * Initialize VLabSceneInteractable.
     * Adds this VLabSceneInteractable to {@link VLabScene#interactables};
     *
     * @memberof VLabSceneInteractable
     * @async
     * @returns {Promise | VLabSceneInteractable}                       - VLabSceneInteractable instance in Promise resolver
     */
    initialize(initObj){
        if (initObj) this.initObj = initObj;
        return new Promise((resolve, reject) => {
            this.vLabScene.vLab.DOMManager.addStyle({
                id: 'interactableCSS',
                href: '../vlab.assets/css/interactable.css'
            }).then(() => {
                if (this.initObj.interactable.name !== undefined) {
                    this.setVLabSceneObject(this.vLabScene.getObjectByName(this.initObj.interactable.name));
                }
                if (this.initObj.interactable.sceneObject !== undefined) {
                    this.setVLabSceneObject(this.initObj.interactable.sceneObject);
                }
                if (this.initObj.interactable.intersectable !== undefined) {
                    this.intersectable = this.initObj.interactable.intersectable;
                }
                if (this.initObj.interactable.preselectable !== undefined) {
                    this.preselectable = this.initObj.interactable.preselectable;
                }
                if (this.initObj.interactable.selectable !== undefined) {
                    this.selectable = this.initObj.interactable.selectable;
                }
                if (this.initObj.interactable.tooltip !== undefined) {
                    this.tooltip = this.initObj.interactable.tooltip;
                }
                resolve(this);
            });
        });
    }
    setVLabSceneObject(vLabSceneObject) {
        if (vLabSceneObject) {
            this.vLabSceneObject = vLabSceneObject;
            this.vLabScene.interactables[this.vLabSceneObject.name] = this;
            this.addOutlineHelperMesh();
        }
    }
    /**
     * Selects this VLabSceneInteractable
     * Adds this instance to {@link VLabScene#selectedInteractables}
     * @abstract
     */
    select() {
        if (this.intersection) {
            if (this.selectable && !this.selected) {
                if (this.preselectable && this.preselected || !this.preselectable) {
                    this.vLabScene.selectedInteractables.push(this);
                    this.selected = true;
                    this.dePreselect();
                }
            }
        } else {
            this.deSelect();
        }
    }
    /**
     * Deselects this VLabSceneInteractable
     * Removes this instance from {@link VLabScene#selectedInteractables}
     * @abstract
     */
    deSelect() {
        if (this.selected) {
            if (!this.preselected) {
                let indexOfThisSelected = this.vLabScene.selectedInteractables.indexOf(this);
                this.vLabScene.selectedInteractables.splice(indexOfThisSelected, 1);
                this.selected = false;
            }
        }
        this.dePreselect();
    }
    /**
     * Preselects this VLabSceneInteractable
     * Adds this instance to {@link VLabScene#preSelectedInteractables}
     * @abstract
     */
    preselect() {
        if (this.intersection) {
            if (this.preselectable && !this.preselected && !this.selected) {
                this.vLabScene.preSelectedInteractables.push(this);
                this.preselected = true;
                this.showTooltip();
            }
        } else {
            this.dePreselect();
        }
    }
    /**
     * Deselcts pre-selected this VLabSceneInteractable
     * Removes this instance from {@link VLabScene#preSelectedInteractables}
     * @abstract
     */
    dePreselect() {
        if (this.preselected) {
            let indexOfThisPreselected = this.vLabScene.preSelectedInteractables.indexOf(this);
            this.vLabScene.preSelectedInteractables.splice(indexOfThisPreselected, 1);
            this.preselected = false;
            this.hideTooltip();
        }
    }
    /**
     * VLabSceneInteractable default event handler / router; could be overridden in inheritor.
     *
     * @memberof VLabSceneInteractable
     * @abstract
     * @listens VLabScene:onDefaultEventHandler
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
     * Default framerequest event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    framerequestHandler(event) {
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
        this.preselect();
    }
    /**
     * Default touchstart event.type handler
     *
     * @memberof VLabSceneInteractable
     * @abstract
     */
    touchstartHandler(event) {
        if (this.intersection) {
            if (this.preselectable && !this.preselected) {
                this.preselect();
            } else {
                this.select();
            }
        } else {
            this.deSelect();
        }
    }
    /**
     * Shows simple outline based on this.vLabSceneObject.geometry
     */
    outline() {
        this.outlineHelperMesh.material = this.vLabScene.manager.simpleOutlineMaterial;
        this.outlineHelperMesh.visible = true;
        this.outlineHelperMesh.matrixAutoUpdate = true;
    }
    /**
     * Shows simple outline shows selected, based on this.vLabSceneObject.geometry
     */
    outlineSelected() {
        this.outlineHelperMesh.material = this.vLabScene.manager.simpleOutlineSelectedMaterial;
        this.outlineHelperMesh.visible = true;
        this.outlineHelperMesh.matrixAutoUpdate = true;
    }
    /**
     * Hides simple outline based on this.vLabSceneObject.geometry
     */
    clearOutline() {
        this.outlineHelperMesh.visible = false;
        this.outlineHelperMesh.matrixAutoUpdate = false;
    }
    /**
     * Adds simple outline based on this.vLabSceneObject.geometry as THREE.Mesh to this.vLabSceneObject
     */
    addOutlineHelperMesh() {
        if (this.vLabSceneObject && this.outlineHelperMesh == undefined) {
            this.outlineHelperMesh = new THREE.Mesh(this.vLabSceneObject.geometry, this.vLabScene.manager.simpleOutlineMaterial);
            this.outlineHelperMesh.name = this.vLabSceneObject.name + '_OUTLINE';
            this.outlineHelperMesh.scale.multiplyScalar(1.03);
            this.outlineHelperMesh.visible = false;
            this.outlineHelperMesh.matrixAutoUpdate = false;
            this.vLabSceneObject.add(this.outlineHelperMesh);
            this.outlineHelperMeshTWEEN = new TWEEN.Tween(this.outlineHelperMesh.scale)
            .to({x: 1.01, y: 1.01, z: 1.01}, 850)
            .repeat(Infinity)
            .yoyo(true)
            .easing(TWEEN.Easing.Quadratic.InOut)
            .start();
        }
    }
    /**
     * Show tooltip
     */
    showTooltip() {
        if (this.tooltip != '' && !this.tooltipContainer) {
            this.tooltipContainer = document.createElement('div');
            this.tooltipContainer.id = this.vLabSceneObject.name + 'TOOLTIP';
            this.tooltipContainer.className = 'interactableToolTip';
            this.vLabScene.vLab.DOMManager.WebGLContainer.appendChild(this.tooltipContainer);
            let toolTipCoords = THREEUtils.toScreenPosition(this.vLabScene.vLab, this.vLabSceneObject);
            this.tooltipContainer.style.left = toolTipCoords.x.toFixed(0) + 'px';
            this.tooltipContainer.style.top  = toolTipCoords.y.toFixed(0) + 'px';
            this.tooltipContainer.innerHTML = this.tooltip;
        } else if (this.tooltipContainer) {
            let toolTipCoords = THREEUtils.toScreenPosition(this.vLabScene.vLab, this.vLabSceneObject);
            this.tooltipContainer.style.left = toolTipCoords.x.toFixed(0) + 'px';
            this.tooltipContainer.style.top  = toolTipCoords.y.toFixed(0) + 'px';
        }
    }
    /**
     * Hide tooltip
     */
    hideTooltip() {
        if (this.tooltipContainer) {
            this.vLabScene.vLab.DOMManager.WebGLContainer.removeChild(this.tooltipContainer);
            this.tooltipContainer = null;
        }
    }
}
export default VLabSceneInteractable;